---
title: "WhatsApp as the Front End: Building a Citizen Reporting Bot with FastAPI, PostgreSQL and WhatsApp Flows"
description: "How I built the WhatsApp bot citizens of Vitoria-Gasteiz use to report street-cleaning problems: the constraints WhatsApp imposes as a front end, the options I weighed, and the design that gets every report, with its photo and location, into the cleaning contractor's platform without anyone re-typing it."
pubDate: "2026-09-05"
image: "/assets/blog/whatsapp-as-the-front-end.webp"
tags: ["python", "fastapi", "postgresql", "postgis", "whatsapp", "reliability"]
author: "Asier Ortiz"
draft: false
---

The request from Vitoria-Gasteiz's street-cleaning service was short: citizens should be able to report a dirty street or a broken container from WhatsApp, in Spanish or Basque, with a photo and a location, and each report should reach the company that cleans the streets without anyone re-typing it, with nothing for the citizen to install or sign up for.

The result is a bot a citizen can finish in four messages: a greeting, a language button, a location and a native WhatsApp form with the type of problem, an optional note and one photo. Seconds later they hold a tracking reference, and the report, with its coordinates and photo, is filed in the contractor's incident-management platform under that platform's own taxonomy.

What made it interesting is that WhatsApp is a demanding front end. It delivers a message more than once when it is not sure you received it, its forms are rigid documents that cannot be changed once published, every button it ever showed stays alive in the chat history, and the contractor's platform at the other end gave no guarantees about duplicates. Most of this article is about the decisions those constraints forced, the options I discarded, and the design that came out of them, much of it a few lines of SQL.

The stack is Python 3.12+ with FastAPI, psycopg 3 with an async pool, PostgreSQL with PostGIS, pydantic-settings and httpx against the WhatsApp Cloud API. Code samples are lightly adapted from the codebase: identifiers translated from Spanish to English and a couple of names generalized, with the logic unchanged.

---

## 📋 Table of Contents

<div class="not-prose mb-8 rounded-lg border border-base-700 bg-base-900 p-4">
  <ul class="flex flex-col gap-2">
    <li><a href="#1-the-problem-as-it-was-handed-to-me" class="text-base-300 hover:text-primary-400 transition-colors duration-300">1. The Problem as It Was Handed to Me</a></li>
    <li><a href="#2-choosing-the-implementation" class="text-base-300 hover:text-primary-400 transition-colors duration-300">2. Choosing the Implementation</a></li>
    <li><a href="#3-accept-now-process-later" class="text-base-300 hover:text-primary-400 transition-colors duration-300">3. Accept Now, Process Later</a></li>
    <li><a href="#4-a-queue-that-is-just-a-table" class="text-base-300 hover:text-primary-400 transition-colors duration-300">4. A Queue That Is Just a Table</a></li>
    <li><a href="#5-absorbing-at-least-once" class="text-base-300 hover:text-primary-400 transition-colors duration-300">5. Absorbing At-Least-Once</a></li>
    <li><a href="#6-the-conversation-as-a-state-machine" class="text-base-300 hover:text-primary-400 transition-colors duration-300">6. The Conversation as a State Machine</a></li>
    <li><a href="#7-the-form-is-a-build-artifact" class="text-base-300 hover:text-primary-400 transition-colors duration-300">7. The Form Is a Build Artifact</a></li>
    <li><a href="#8-geocoding-and-the-coverage-gate" class="text-base-300 hover:text-primary-400 transition-colors duration-300">8. Geocoding and the Coverage Gate</a></li>
    <li><a href="#9-the-outbox-and-its-four-outcomes" class="text-base-300 hover:text-primary-400 transition-colors duration-300">9. The Outbox and Its Four Outcomes</a></li>
    <li><a href="#10-what-it-delivers" class="text-base-300 hover:text-primary-400 transition-colors duration-300">10. What It Delivers</a></li>
    <li><a href="#11-lessons-learned" class="text-base-300 hover:text-primary-400 transition-colors duration-300">11. Lessons Learned</a></li>
  </ul>
</div>

---

## 1. The Problem as It Was Handed to Me

The requirements fit on one screen:

- Any citizen with WhatsApp can report a problem, with nothing to install and no account to create
- Spanish or Basque from the first message, including the form
- A location, as a shared pin or a typed address, checked against the service area
- A fixed taxonomy of thirty-five report types, chosen from menus and never typed
- One photo, required, taken or picked inside the form
- A human-readable tracking reference in the confirmation
- Every report reaching the contractor's platform with coordinates, category and photo, without anyone re-typing it

Two of those lines set the bar for everything else. The first is zero friction for the citizen: the reason to use WhatsApp at all is that everyone already has it open. The second is zero manual work on the other side: a report that has to be copied into the contractor's platform by a person is a report that arrives late or not at all.

### Why WhatsApp is a hard front end

A web form would have been a week of work. WhatsApp imposes constraints a browser never would:

- **Delivery is at least once.** The Cloud API posts every incoming message to your webhook and redelivers anything it does not see acknowledged with a prompt 200; Meta documents retries spread over several days. Exactly-once is not on offer, so a slow handler turns one message into several.
- **Replies are asynchronous.** The webhook response cannot carry the answer. Every reply is a separate API call with its own latency and its own failure modes, and every message the citizen sees costs one.
- **Published Flows are immutable.** WhatsApp Flows are JSON documents of screens with documented limits (at most ten screens reachable from any screen, twenty items per list, no location component), and once published a Flow cannot be edited, only replaced by a new version.
- **History stays live.** Every button and form ever sent remains tappable. A citizen can complete last week's form today, and the platform will deliver it as if it were current.
- **Media is indirect.** A photo arrives as an id; the binary has to be fetched from the Graph API with a token, and the download can take longer than the redelivery window.
- **The free window is 24 hours.** After that, writing to the citizen requires a pre-approved template billed per message. A resolution notice days later would need that template, a payment method and a status feed back from the contractor, which is why the bot never writes to the citizen after the confirmation.

On top of that, two constraints came from outside WhatsApp. Typed addresses in a Spanish city need house-number precision that open geocoders do not deliver. And the contractor's platform exposes a create endpoint with no documented deduplication, which means a retry after an ambiguous failure can file the same report twice in a system that dispatches crews.

---

## 2. Choosing the Implementation

Every one of those constraints had more than one answer.

| Question | Options considered | Choice | Why |
|---|---|---|---|
| How does the citizen navigate thirty-five report types? | Chat list messages, one per level; a WhatsApp Flow | A Flow generated from a Python tree | Lists allow ten rows including "back", so a leaf took about six messages; a Flow holds the whole tree and the photo in one form |
| Where does the work happen? | Inside the webhook request; a queue and a separate worker | Queue and worker | The processing path has outbound calls with 15 to 30 second timeouts; doing them inside the request turns one slow call into redeliveries |
| What is the queue? | Redis Streams; a PostgreSQL table with `FOR UPDATE SKIP LOCKED` | The PostgreSQL table | Same guarantees (at-least-once, visibility timeout, backoff, dead letter) with one component fewer, and the outbox to the contractor reuses the mechanism |
| How is a duplicate made harmless? | A deduplication table; a per-chat lock; idempotent effects | All three, with the conditional `UPDATE` as the real guarantee | Deduplication and locks save work; only a state transition that can happen once makes a double delivery safe |
| Which geocoder? | Public Nominatim; a paid geocoder; CartoCiudad, the national mapping agency's service | CartoCiudad | Free, no API key, house-number precision, accepts street names in Spanish and Basque, returns a precision type per result |
| How does a report reach the contractor? | An API they pull from; a push into their platform | Push, through an outbox with a review state | Pull makes delivery their job and their schedule; push keeps every report's status in my database, and the review state handles the endpoint's undocumented idempotency |
| Where do the guarantees live? | A check-then-write in Python; one conditional statement in the database | The database | A `WHERE` clause, an `ON CONFLICT` and `SKIP LOCKED` are shorter, atomic and impossible to skip by accident |

Two of these decisions were reversals. The queue ran on Redis Streams first and moved to PostgreSQL once it was clear the outbox would need the same claim, visibility timeout and backoff: one statement in the database could serve both tables, while a broker would have served one of them and added a second store to run, monitor and back up. The geocoder started as Nominatim and was replaced when house numbers kept going missing. Both swaps were cheap because the pieces sat behind small interfaces from the start.

The shape those decisions produce fits in one picture: two processes, one database, and every outbound call leaving from the worker.

<img src="/assets/blog/whatsapp-bot-architecture.svg" alt="Architecture: WhatsApp posts signed webhooks to the API process, which inserts them into PostgreSQL; the worker process claims events from the queue table, keeps chat locks and report state in the same database, and makes every outbound call to the Graph API, the CartoCiudad geocoder and the contractor's platform" data-zoomable />

---

## 3. Accept Now, Process Later

The webhook has one hard requirement and one hard conflict. The platform redelivers anything it does not see acknowledged promptly, and the work behind a message includes a photo download, a geocoder call and a send, each with a timeout of 15 to 30 seconds. Doing that work inside the request would turn one slow geocoder call into a redelivery, and a redelivery into a second report. So accepting and processing are separate steps: the API's only job is to verify the signature and insert the raw body, and a worker does everything else.

One API process verifies incoming webhooks and inserts them into a table. One worker process handles queued events one at a time, runs the conversation and sweeps the outbox. One PostgreSQL database holds every record, the queue included; photo files sit on the worker's disk. Only the API process sits behind a reverse proxy, which forwards the webhook body untouched because the signature covers the raw bytes; the worker is not reachable over HTTP at all.

The webhook endpoint is deliberately thin. It reads the raw request body before any JSON parsing, recomputes the HMAC-SHA256 of those bytes with the app secret and compares it in constant time with the `X-Hub-Signature-256` header, inserts the raw payload as one row in the queue table, and returns 200.

```python
@app.post("/whatsapp/webhook")
async def whatsapp_webhook(
    request: Request,
    x_hub_signature_256: str | None = Header(default=None),
):
    raw = await request.body()
    if not verify_signature(settings.wa_app_secret, raw, x_hub_signature_256):
        raise HTTPException(status_code=403, detail="bad signature")
    # Enqueue and return 200 as soon as possible; the worker does the work.
    await queue.enqueue(raw.decode("utf-8"))
    return {"ok": True}
```

The handler does not parse the payload or read any session state; the first reply to the citizen comes from the worker, and the API answers in milliseconds regardless of what the geocoder or the Graph API is doing.

A complete report is four citizen messages, so four webhook deliveries that carry work, and each one passes through claim, deduplication, lock and state machine before the bot answers. The figure below follows the fourth message, the completed form, from that 200 to the worker's acknowledgement, with the three points where a redelivery, a crash or a concurrent copy is absorbed. Sections 4 and 5 walk it step by step.

<img src="/assets/blog/whatsapp-bot-message-path.svg" alt="Path of one completed-form message through the API process and the worker process: signature check and insert, 200 OK, claim with SKIP LOCKED, dedup check, chat lock, photo download, conditional UPDATE, confirmation, mark processed, ack and lock release, with the three points where a redelivery, a crash or a duplicate is absorbed" data-zoomable />

---

## 4. A Queue That Is Just a Table

The queue table has eight columns: an id, the raw body, a state, an attempt counter, a `visible_at` timestamp, the last error, and two housekeeping timestamps. One composite index on `(state, visible_at)` serves the claim query. The state takes four values: pending, processing, done and dead.

`visible_at` means "invisible until", and that one column does three jobs. Claiming a row sets it to now plus 60 seconds, the visibility timeout. A failed attempt sets it to now plus an exponential backoff. A deferred row, which section 5 explains, sets it to now plus one second.

### The claim

Claiming is a single statement:

```sql
UPDATE inbound_event SET
    state = 'processing',
    attempts = attempts + 1,
    visible_at = now() + interval '60 seconds',
    updated_at = now()
WHERE id IN (
    SELECT id FROM inbound_event
    WHERE state IN ('pending', 'processing') AND visible_at <= now()
    ORDER BY id
    FOR UPDATE SKIP LOCKED
    LIMIT %(n)s
)
RETURNING id, body, attempts
```

`FOR UPDATE SKIP LOCKED` makes two workers skip each other's rows instead of waiting on them. The subquery's `WHERE` also matches processing rows whose visibility has expired, so a row left behind by a worker that crashed midway becomes claimable again 60 seconds later through the same query that picks up new work. This is the shape Redis Streams gave me with `XAUTOCLAIM` and delivery counters, rebuilt as columns.

### Acking last

What makes delivery at-least-once is the order of three calls in the worker:

```python
try:
    await handle(incoming, channel)
    if incoming.message_id:
        await queue.mark_processed(incoming.message_id)
    await queue.ack(event_id)
except Exception as e:
    log.exception("Error processing event %s", event_id)
    await queue.retry(event_id, attempts, repr(e))
finally:
    await queue.release_chat(incoming.chat_id, WORKER_ID)
```

A row becomes done only after the state machine has run without raising. A worker that dies between `handle` and `ack` leaves the row in processing until the claim query reclaims it. An exception sends the row back to pending through `retry`, with a backoff of 2, 4, 8, 16 and 32 seconds. The per-chat lock is released in `finally` either way.

The attempt counter is incremented by the claim rather than by the retry, so crashes and exceptions draw from the same budget of five. The sixth claim parks the row as dead instead of running it. Unparsable JSON goes to dead directly. Dead rows are kept on purpose: they are the audit trail for anything the worker could not process, and replaying one is a single `UPDATE` that sets it back to pending and resets the attempt counter. Three numbers are worth watching, and each is one SQL query today: the age of the oldest pending event, which says whether the worker is keeping up; the dead count, whose expected value is zero; and the outbox rows parked for review, which section 9 explains. Done rows and deduplication keys older than seven days are purged periodically. The loop polls once per second when idle; one second of latency on an idle chat bot is not worth a notification channel.

---

## 5. Absorbing At-Least-Once

If a message can be processed twice, something has to make that safe. Three layers do that, in the order the worker applies them, and only the last one guarantees a single report.

### Deduplication by message id

The first layer is a table that is little more than a primary key on WhatsApp's message id, plus a timestamp used for purging. The worker checks it before anything else and writes to it, with `ON CONFLICT DO NOTHING`, after `handle` succeeds. Marking after processing tolerates a duplicate; marking before would lose a message on a crash in between. Keys older than seven days, WhatsApp's redelivery window, are purged. With a single worker, a redelivered copy arrives after the first was processed and stops here. Deduplication is best-effort; correctness comes from the idempotent effect in the third layer.

### One worker per citizen at a time

The second layer is mutual exclusion per chat. Before running the state machine for a message, the worker takes a lock on the chat id:

```python
async def acquire_chat(chat_id: str, owner: str) -> bool:
    sql = """
        INSERT INTO chat_lock (chat_id, owner, expires_at)
        VALUES (%(c)s, %(o)s, now() + interval '30 seconds')
        ON CONFLICT (chat_id) DO UPDATE
            SET owner = EXCLUDED.owner, expires_at = EXCLUDED.expires_at
            WHERE chat_lock.expires_at < now()
        RETURNING owner
    """
    async with db.pool().connection() as conn:
        cur = await conn.execute(sql, {"c": chat_id, "o": owner})
        row = await cur.fetchone()
        return row is not None and row["owner"] == owner
```

On conflict, the update runs only if the previous lock has expired; otherwise PostgreSQL neither updates nor returns the row, and the function sees `None`. The owner comparison on the returned row is a defensive check: any row that comes back was just set to this worker. Releasing is a `DELETE ... WHERE chat_id = ... AND owner = ...`, a compare-and-delete, so a worker that held a lock past its 30-second TTL cannot remove a lock another worker took in the meantime. A copy that arrives while the first is in flight on another worker loses this lock, gets deferred, and finds the dedup key on its next claim.

The worker does not treat lock contention as a failure of the event. It tries the lock five times, 0.2 seconds apart, then calls `defer`, which puts the event back to pending, visible again one second later, and hands back one attempt. The refund matters: the claim increments the counter, so an event that kept losing the lock would otherwise be parked as dead without ever having run. `retry` and `defer` are the two kinds of "not done", one with an error and a backoff, one with neither.

### The transition itself

The third layer is the effect that closes a report, shown here as the bare statement:

```sql
UPDATE report
SET state = 'received',
    reference = 'REF-' || extract(year from created_at)::int
                || '-' || lpad(id::text, 5, '0'),
    updated_at = now()
WHERE id = %(id)s AND state = 'draft'
RETURNING id
```

The function around it returns `True` only when a row came back, once per draft, and the caller fires the registration side effect only on `True`. The reference is minted in the same statement as the state change, so there is no moment when a report is received without one. Two copies of a form completion processed one after the other do not normally both get here: the second finds the session already reset and restarts from the language selector. The exception is a worker that dies between this update and the session reset; the retried copy then re-runs the form handling, reaches the update, gets no row back and still sends the reference, because the reply is not gated on the update's result. Two copies running concurrently on two workers, past an expired lock, behave the same way: both reply with the reference, and the report is registered once. Only this transition is idempotent, so in both of those cases the photo would be downloaded and attached twice. The distinction is worth stating plainly: the database guarantees one report per completion. It does not guarantee one confirmation message, and it does not need to, because a citizen who receives the same reference twice has lost nothing.

Two limits remain. The lock does nothing for ordering: a deferred or retried event runs after newer ones, and per-citizen order in production, retries aside, comes from claiming in id order with exactly one worker process (PostgreSQL does not guarantee the order of the batch's `RETURNING` rows, though in practice it follows the subquery). And the lock is not renewed during processing, so a message that spends longer than 30 seconds in outbound calls, which the timeouts allow, could see a second worker take the chat. Both follow from a deliberate choice: this design is single-worker. The database primitives are safe under concurrency, but the conversation semantics are not designed for arbitrary parallelism, and adding a second worker would mean solving both first.

### Every failure in one place

Five failures the worker and the platform can produce, three the outside world adds, and where each one is absorbed:

| Failure | What happens | Mechanism |
|---|---|---|
| The platform delivers a message twice | The copy stops at the dedup check; a copy that slips past registers nothing | message-id table; `WHERE state = 'draft'` (above) |
| The worker dies halfway through a message | The row stays in processing and is reclaimed after 60 seconds, and the attempt is spent | claim query with visibility timeout (section 4) |
| The state machine raises | The row returns to pending with exponential backoff; the sixth claim parks it as dead | `retry` (section 4) |
| Two events for the same citizen at once | The second loses the chat lock and is deferred one second without spending an attempt | `chat_lock` upsert, `defer` (above) |
| The citizen answers yesterday's form | The reply is logged as stale and the conversation restarts | message id kept in the session (section 6) |
| The geocoder is down | The citizen is offered the location button instead; nothing is lost | 15-second timeout, treated as no result (section 8) |
| The contractor's API is unreachable | The push is retried with growing backoff; the sixth claim parks it as dead | outbox visibility and backoff (section 9) |
| The contractor's API accepts the record and the response is lost | The row is parked for review and a person decides | the four-outcome classifier (section 9) |

The retry and dead-letter cycle was exercised by hand with a failure hook in the worker, and the four outcomes of the classifier with mocked responses; the stale-form path showed up on its own in early testing.

---

## 6. The Conversation as a State Machine

The conversation state is one row per phone number, and its `step` column takes four values: idle, awaiting language, awaiting location and awaiting form. Language comes first because there is one published Flow per language and the bot has to know which to send. Location comes before the form because Flow JSON has no location component. Everything else, the type, the note, the photo and the summary, lives inside the form.

Four states is the direct result of the Flow decision. With chat list menus the machine had nine states, one editing state per field, because every correction had to be a conversation. The form's native back arrow made all of that unnecessary, and the machine shrank to three states, then four with the bilingual selector. The cost is that the two fields collected before the form can only be corrected by restarting.

The state machine never talks to WhatsApp directly. It works against an abstract channel class (send a text, send buttons, send a form, request a location, download a photo, parse an incoming message), and the WhatsApp adapter behind it is a thin httpx client against the Graph API with no SDK. Nothing in the conversation logic knows which platform it is running on, so a second channel, a web widget or another messaging app, would be one more adapter.

### Every state accepts every input

Every state is total over every kind of message, because the bot controls neither what the citizen sends nor when the platform redelivers, and a deferred event can run after a newer one. Cancel and restart keywords in both languages are checked before the state is consulted. Text during the location step is geocoded as an address. Text or a photo while the form is open gets a reminder to finish it. Almost anything else restarts from the language selector and deletes the draft; a language button jumps straight to the location request, and cancel simply stops. The catch-all is destructive: a location sent while the form is open deletes the draft instead of replacing the location.

### Yesterday's form

In early testing, old menus pressed after a report had been closed reactivated conversations and created orphan drafts. The fix uses an id the platform already returns. The Graph API response to a send includes the message id; the session stores it for the language selector and the Flow, and every state change clears it. The webhook for a completed form carries the id of the message it answers in `context.id`. A form reply whose `context.id` differs from the stored id is logged as stale, and the conversation restarts. WhatsApp provides a `flow_token` for this purpose; the bot generates one per send and never reads it, because the message id was already there.

A failed send is logged rather than raised, so a Flow the platform refused leaves the stored id empty. The citizen never sees a form, typed text or a photo gets the reminder to finish it, and what gets them out is a restart or cancel keyword, a shared location, or a button from an earlier language selector, which the stale check does not cover.

### Draft first, complete later

The report row is inserted as a draft when the location passes the coverage gate, before the form is sent. The address goes into the form as init data for the summary screen. The session points at the draft through a foreign key with `ON DELETE SET NULL`. Completing the form fills in type, note and photo and runs the conditional update from section 5. The platform sends nothing when a citizen closes a form unfinished and there is no session TTL, so the stale guard also covers abandoned forms.

---

## 7. The Form Is a Build Artifact

The form exists twice, once per language, cannot be edited once published, and returns a route that has to be validated on the way in and mapped to the contractor's taxonomy on the way out. Hand-writing the Flow JSON would have meant keeping four copies of one tree in step by hand: two JSON documents, the validator's accepted routes and the outbox mapping. I chose to hold the tree once, in Python, and derive the rest from it.

<img src="/assets/blog/whatsapp-bot-taxonomy.svg" alt="One taxonomy tree in Python feeds three consumers: the Flow generator that emits one published Flow per language, the check script run by hand before each publish, and the runtime that validates the returned route and maps it to the contractor's taxonomy" data-zoomable />

The taxonomy is a nested Python literal built with three constructors: a group, a report leaf and an informational leaf. Labels, prompts and descriptions live in one YAML catalog per language, 81 keys each. A generator walks the tree and emits Flow JSON: one screen per group, a shared informational screen and a terminal summary screen. No Flow JSON is committed. The same tree validates the route a completed form returns and drives the mapping to the contractor's taxonomy in section 9.

Leaf identity is the full path. Seven container fractions hang under each of four container actions:

```python
def fractions() -> list:
    return [leaf(k) for k in ("paper", "organic", "glass", "packaging",
                              "residual", "textile", "used_oil")]

group("container", [
    group("not_emptied", fractions(), prompt="fraction"),
    group("dirty_or_smelly", fractions(), prompt="fraction"),
    group("damaged", fractions(), prompt="fraction"),
    group("overflowing", fractions(), prompt="fraction"),
], prompt="container"),
```

Thirty-five report leaves share fourteen distinct keys, so "glass" alone is ambiguous. The generator bakes the slash-joined route into each item's navigate payload, the summary screen returns it untouched, and the bot splits it into a section and a category. Group keys must be unique because they become screen ids; leaf keys may repeat.

### Two limits shaped the tree

A `NavigationList` allows twenty items, which no screen approaches. The tighter one is reachability: from any screen, at most ten screens can be reachable, and the root reaches exactly ten. That is why the optional note lives on the summary screen, and why the two bulky-waste leaves (reporting dumped items and requesting a pickup, both handled by phone) share one bridge screen parameterized through its payload. The generator does not check the ceiling; only the platform's linter does, synchronously when the JSON is uploaded, so an eleventh reachable screen fails before anything is published.

### Immutable and monolingual

A published Flow cannot be edited, only replaced, and it carries no internationalization, so there is one Flow per language, with two ids in configuration. Changing any string baked into the form (labels, prompts, descriptions and a dozen fixed strings) is a five-step republish: edit the tree and both catalogs, run the check script per language, publish per language, paste the new ids, restart. Chat strings live in the catalog and need only a restart. The platform's synchronous validation errors were the only trustworthy specification while the public docs lagged the schema, so each publish was also the test.

### A validator that runs the generator

The check script compares tree and catalog in both directions (missing labels, prompts and texts one way, orphans the other) and checks each description against the 80-character metadata limit. It then builds the Flow, which makes any missing key raise, counts list items against twenty, and looks up every report leaf in the outbox mapping, so a new leaf cannot die silently there while the citizen holds a reference the contractor never sees. It runs by hand before publishing.

---

## 8. Geocoding and the Coverage Gate

WhatsApp's native location button only offers the current position or nearby places. A citizen reporting from home about a container two streets away types the address, so typed addresses are the main path, and the geocoder decides whether the report lands on the right street.

### Why not Nominatim

The first geocoder was the public Nominatim instance. It allows one request per second with no availability guarantee, and OpenStreetMap data in Spain often lacks house numbers, which forced a regular-expression workaround to re-attach the typed number. A spike against CartoCiudad, the geocoder run by Spain's National Geographic Institute, found that it needs no API key, resolves to the house number, tolerates street names in Spanish or Basque, and returns a precision type per result. The provider sat behind two functions, geocode and reverse, so the swap rewrote one module and replaced two configuration keys with one. A paid geocoder was ruled out on cost.

### Two layers with different jobs

The first layer is a coarse filter around the geocoder call. Inputs under four characters never reach the API, and the city name is appended to every query. Results typed as town, municipality, province, region, country or postcode are discarded as too vague, and so are results outside the province, because the endpoint is national and street names repeat. The second layer is the precise gate, one predicate against the service-area polygon:

```sql
SELECT id FROM service_area
WHERE ST_Contains(geom, ST_SetSRID(ST_MakePoint(%(lon)s, %(lat)s), 4326))
LIMIT 1
```

The polygon is stored as a single `Polygon` geometry in WGS84 (SRID 4326), the system the phone reports in. `ST_Contains` is strict about the interior, so a point exactly on the boundary is rejected; `ST_Covers` would accept it, and that is the one word to change if the perimeter ever runs along a street the service does clean. The geocoder is never the gate: the city bias only narrows the candidates, and the polygon decides membership.

A geocoder outage is contained: the call has a 15-second timeout, any network error or unexpected response counts as no result, and the citizen is told the address was not found and offered the location button, which needs no geocoder at all. The cost is latency: the worker handles one event at a time, so while the geocoder is down each typed address holds the queue for up to 15 seconds.

### Trust the pin

Reverse-geocoding a shared pin returned a nearby street that was not the one the citizen had seen on the map. The adapter now captures the name (or, failing that, the address) WhatsApp attaches to the pin, and the state machine uses it instead of reverse geocoding, which remains the fallback and runs only after the gate has accepted the point.

### One polygon, one predicate

The proof of concept went further than the final product: it split the city into zones, each with its own contractor contact, and routed every report by the zone its coordinates fell in. The client preferred to keep that dispatching inside the contractor's platform, which assigns districts and crews from the coordinates itself, and asked the bot for one thing instead: to accept reports only within the city's service area. Routing was removed, and what remains is one polygon and one `ST_Contains` answering in or out. The polygon is data rather than code: the service area lives in a table, so the city can widen or redraw it, from the urban core to the whole municipality, with a database load instead of a deployment, as long as the perimeter stays one polygon; a multi-part boundary would first need the column widened to `MultiPolygon`. Keeping the geocoder out of the contractor's platform also keeps the conversation independent of that platform's availability: the report is stored with its coordinates and the push is queued.

---

## 9. The Outbox and Its Four Outcomes

The direction of the integration changed three times before the endpoint specification arrived: an API the client would consume, a push into the contractor's platform, an API the platform's vendor would pull from, and push again. None of it reached the main line: the first direction lived on as an archived spike, the bot's responsibility ends at the database row, and the push client was only built, behind a flag, once the direction was settled.

### An outbox by column default

The report row carries six push columns: state, attempts, error, sent-at, visible-at and the remote id. The state defaults to pending and the visible-at to now, so confirming a report and placing it in the outbox are the same `UPDATE`. Drafts never qualify, because the sweep also requires the report status to be received. The claim is the statement from section 4 applied to the report table, with a 300-second visibility window and a batch of five. One invariant is stated in a comment rather than an assertion: batch size times the 30-second send timeout must stay under the window, or a second worker could resend rows still in flight. The sweep runs in the worker loop inside its own try/except, and each row inside another, so a partner exception never stops citizen events; a slow partner still delays them, because the sweep runs in the same loop and one batch can spend up to 150 seconds waiting on sends.

### Could a record exist on the other side?

The body of the POST carries the mapped category, the coordinates, the note with the waste fraction appended, the bot's reference as an external code, and the photo inline as base64. The send then classifies each failure by one question: could this failure have produced a record on the other side? The block below is simplified, with logging removed and the endpoint behind a variable:

```python
try:
    r = await client.post(insert_url, json=body,
                          headers={"Authorization": f"Bearer {token}"})
except (httpx.ConnectError, httpx.ConnectTimeout, httpx.PoolTimeout) as e:
    # The POST never left (connection, DNS, TLS, pool): safe to retry.
    return (RETRY, f"connection: {type(e).__name__}")
except Exception as e:
    # ReadTimeout, WriteTimeout, RemoteProtocolError: the POST may have
    # arrived and only the response was lost. Ambiguous, so no retry.
    return (REVIEW, f"ambiguous after sending: {type(e).__name__}")

if r.status_code == 401:
    invalidate_token()   # rejected token: fresh login on the next attempt
    return (RETRY, "401 unauthorized")
if 400 <= r.status_code < 500:
    return (DEAD, f"{r.status_code} {r.text[:300]}")
if r.status_code >= 500:
    # The request arrived; whether it was processed is unknown.
    return (REVIEW, f"{r.status_code} {r.text[:300]}")
```

Retry happens only when the POST provably never left, on a missing token, or on a 401, which invalidates the cached token. The JWT session behind that token is cached in memory, renewed before it expires, invalidated on 401 and closed on shutdown, with one documented consequence: a login failure consumes an attempt, so about fifteen minutes of platform outage send every pending row to dead. Anything below 400 counts as success, even a 2xx whose body does not parse, because treating it as failure would retry into a duplicate. Backoff runs 30, 60, 120, 240 and 480 seconds, and the sixth claim parks the row as dead before sending.

The review state exists because the request carries the bot's own reference in an external code field, and nothing documents whether the platform's insert deduplicates on it. After an ambiguous failure, "did not arrive" and "arrived, response lost" are indistinguishable, and a blind retry could create a duplicate in the contractor's production system. Rows in review are never claimed automatically; a person searches the platform by reference and runs one of two updates, back to pending or straight to sent. If deduplication is ever confirmed, the fix is to return retry wherever the send returns review today.

| State | Who sets it | What moves it out |
|---|---|---|
| pending | the column default, or a retry | the sweep claims it |
| sending | the claim | success, retry, review or dead, or a reclaim after 300 s |
| sent | any response below 400 | nothing, it is terminal |
| review | an ambiguous failure | a person, after checking the platform by reference |
| dead | a non-401 4xx, a missing mapping, a row without coordinates, or the sixth claim | a person |

### Activation is a configuration change

The push is gated by one flag that defaults to off and is checked twice, before the claim and inside the send. With the flag off, reports keep registering and accumulate as pending; turning it on drains the backlog, which is why the backlog was listed in SQL and the reports written during testing were deleted before the switch was flipped. The same switch is the emergency brake: if the contractor's platform misbehaves, the push can be paused with one variable and a worker restart without losing a single report. The first real report was accepted on the first attempt.

### Two trees cut on different axes

The bot classifies by the element (a container, a bin, a pavement) and the contractor's platform by the kind of problem, and its taxonomy was not going to change for this project. The options were to drop the container's waste fraction, which the platform's tree has no slot for, or to carry it as free text. The mapping is an eleven-entry dictionary (one entry per container action and one per remaining leaf), and the fraction travels appended to the note, an accepted loss of structure for the twenty-eight container leaves that still puts the fraction in front of the crew. The check script from section 7 is the only guard between a menu edit and a silently lost report.

---

## 10. What It Delivers

For the citizen, reporting a problem is four messages in the app they already have open, in their language, with the address filled in from a pin or a typed street name and a reference they can quote.

For the contractor, every report arrives already structured: category in their own taxonomy, coordinates their platform can dispatch from, the citizen's note, and the photo. Nobody re-types anything, and nothing arrives by email or phone to be transcribed later.

For whoever operates the system, every report has a state that can be read in SQL, from draft to received to sent, every failure in the section 5 table has a mechanism behind it, and the whole push can be paused with one variable and a restart without losing a report. Changing the menu is an edit to a Python tree and two YAML files, guarded by a check script, run by hand before every publish, that fails on any leaf the outbox could not deliver.

The runtime footprint is small: one PostgreSQL database that is also the queue, the lock and the outbox, two Python processes behind a reverse proxy, and one external dependency, a free official geocoder.

### What the system does without

- A message broker or a task framework in the final system: the Redis Streams queue was removed once a table could do its job
- A WhatsApp SDK: the adapter is a thin httpx client
- A separate geospatial service: PostGIS answers one predicate
- A second database or a cache: every record is in one PostgreSQL, and the only state outside it is the photo files on the worker's disk and a session token held in memory
- Citizen accounts, a web panel or status updates: nothing is written to the citizen after the confirmation

Each was within reach; none added a guarantee the system needed, and each would have been another component to operate.

---

## 11. Lessons Learned

### Let the platform's form absorb the branching

The Flow took six states out of the conversation, most of them correction handling, and the platform's limits then shaped the form more than any meeting did. Whatever is collected before the form sits outside its back arrow, so that set should stay as small as the platform allows.

### Put a boundary where a third party can change its mind

The geocoder was swapped in one module, the integration direction changed three times without touching the main line, and the conversation logic has never imported a WhatsApp module, made a Graph API call or parsed a raw payload, even though the form it drives is a WhatsApp Flow. The one constraint no interface could hide, the synchronous acknowledgement, is the one that cost a second process.

### The database can be the queue, the lock and the outbox

One claim statement, applied to two tables, replaced a broker and came out simpler. The shortcuts a single worker allows (an unrenewed lock, unconditional acks, dead rows replayed by hand) should be written down for whoever adds a second one.

### Separate "failed" from "cannot run right now"

Retry writes an error and backs off, while defer hands the attempt back untouched. Most retry designs have only the first, and without the second, lock contention ends up as dead rows.

### The `WHERE` clause is where at-least-once is absorbed

Deduplication saves work; the conditional update with `RETURNING` on the draft-to-received transition is what guarantees one report per completion. The sync in the [Android field app from an earlier post](/blog/building-offline-first-android-field-ops/) does the same job with a `UNIQUE` constraint.

### Park ambiguity where a person can resolve it

The review state cost no schema change and can be removed in two return statements once the partner confirms idempotency. Until then it is the difference between an occasional manual check and a duplicate crew dispatch.

### Ship the integration dark, and read the backlog before turning it on

The switch let the push be built and deployed before the partner was ready, and it is also why the test reports had to be cleared by hand before flipping it.

---

## Final Thoughts

Like the field app before it, this project refused to stay in one box. It covered a messaging platform's delivery semantics, a form DSL with a graph-reachability limit, queue design in SQL, geocoding quality in a bilingual city, and an integration against a partner API with an undocumented corner.

The idea I would keep is that the system assumes duplicates and makes them harmless. That took three decisions: where a duplicate is allowed to exist (in the queue, in the confirmation message and in the photo rows attached to a report), where ambiguity stops being retryable (the outbox's review state), and which single database transition is allowed to produce the business effect (`WHERE state = 'draft' ... RETURNING id`). Once those boundaries were explicit, the rest of the system could stay small.

If I were starting again, the queue module and the failure classifier would have tests in the repository, and a version endpoint would ship with the first deployment so a running instance can be checked from outside. Nothing else would change.

---

**Thanks for reading. If you found this useful, feel free to share it with anyone building on the WhatsApp Cloud API or fighting at-least-once delivery.**
