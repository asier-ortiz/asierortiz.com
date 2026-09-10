---
title: "The Schema Only Existed in Production: Rescuing a Winter Road Operations Platform"
description: "Nine months and 226 SQL migrations spent repairing a half-finished migration of a fifteen-year-old desktop system into a live web platform for winter road operations: a schema that lived only on the production server, a telemetry feed whose road attribution had no memory, three classes of orphaned record with three different correct answers, and a query builder rebuilt from the client's own 2009 manual."
pubDate: "2026-09-11"
image: "/assets/blog/schema-only-existed-in-production.webp"
tags: ["legacy-code", "postgresql", "angular", "migration", "refactoring", "data-quality", "gis"]
author: "Asier Ortiz"
draft: false
---

The Provincial Council of Álava runs winter road operations out of a control room. A hundred-odd snowploughs, brine tankers, loaders and municipal tractors work a province of mountain passes, about half of them carrying a transponder; contractor crews rotate through shifts; salt and brine come out of silos that have to be tracked; and somebody in that room holds the legal authority to close a road. For fifteen years the work was coordinated from a VB.NET desktop application with an embedded ArcGIS map over a SQL Server database of seventeen tables. The public face of the current system is [nieves.eus](https://nieves.eus/nieves/).

When I joined the project in December 2025, a migration of that desktop application to a web platform was already underway and already in production. Five months of work had produced an Angular front end, an Express API and a PostgreSQL/PostGIS database, and something that looked finished: a map viewer, about thirty screens, forty-two API route groups, telemetry ingestion, a query builder, report exports. What it did not have was the scaffolding that lets a system like that be changed safely. There was no development environment. The database schema existed in exactly one place, the production server. The login endpoint returned a hardcoded placeholder string where the access token should have been, and no route on the server checked anything at all.

Nine months later the repository holds 226 numbered SQL migrations, 56 rollback scripts and roughly 60,000 lines of TypeScript added across the front end and the API. Almost none of that work could be done offline. The operational season runs October to May, the control room uses the platform every night of it, and the database it uses is the same database holding seventeen seasons of history that nobody could afford to lose. Every structural change had to land on a system already in use, applied by hand against the live database, with a way back.

Nothing about the old operational model was written down, so the work turned out to be less about rewriting code than about establishing which rules were real, which were accidental, and which existed only because nobody had dared to break them. Three of those run through everything below. The schema was missing, so the first job was giving it somewhere to live other than the server the control room depends on. The data was unreliable in ways nobody had noticed, because constraints had been passing by coincidence and a telemetry feed was deciding, wrongly and every sixty seconds, which road a vehicle was on. And the desktop application was the only specification anyone had, which made it simultaneously the thing being replaced and the thing being checked against.

Where those had a common answer, it was to push the invariant down a layer, out of a convention in application code and into a constraint, a key, or an ordering property the data already had.

Code samples are adapted from the codebase: identifiers translated to English, names and identifiers replaced with placeholders, logic unchanged. Vendors, client staff and infrastructure details are not named.

---

## 📋 Table of Contents

<div class="not-prose mb-8 rounded-lg border border-base-700 bg-base-900 p-4">
  <ul class="flex flex-col gap-2">
    <li><a href="#1-the-room-and-the-season" class="text-base-300 hover:text-primary-400 transition-colors duration-300">1. The Room and the Season</a></li>
    <li><a href="#2-the-state-of-the-handover" class="text-base-300 hover:text-primary-400 transition-colors duration-300">2. The State of the Handover</a></li>
    <li><a href="#3-somewhere-other-than-production-to-work" class="text-base-300 hover:text-primary-400 transition-colors duration-300">3. Somewhere Other Than Production to Work</a></li>
    <li><a href="#4-changing-a-schema-that-is-already-in-use" class="text-base-300 hover:text-primary-400 transition-colors duration-300">4. Changing a Schema That Is Already in Use</a></li>
    <li><a href="#5-a-campaign-is-a-partition-key-and-a-calendar" class="text-base-300 hover:text-primary-400 transition-colors duration-300">5. A Campaign Is a Partition Key and a Calendar</a></li>
    <li><a href="#6-three-kinds-of-orphan-then-a-foreign-key" class="text-base-300 hover:text-primary-400 transition-colors duration-300">6. Three Kinds of Orphan, Then a Foreign Key</a></li>
    <li><a href="#7-which-road-was-that-plough-on" class="text-base-300 hover:text-primary-400 transition-colors duration-300">7. Which Road Was That Plough On?</a></li>
    <li><a href="#8-a-query-builder-copied-from-a-2009-manual" class="text-base-300 hover:text-primary-400 transition-colors duration-300">8. A Query Builder Copied from a 2009 Manual</a></li>
    <li><a href="#9-proving-it-against-the-system-it-replaces" class="text-base-300 hover:text-primary-400 transition-colors duration-300">9. Proving It Against the System It Replaces</a></li>
    <li><a href="#10-what-it-delivers" class="text-base-300 hover:text-primary-400 transition-colors duration-300">10. What It Delivers</a></li>
    <li><a href="#11-lessons-learned" class="text-base-300 hover:text-primary-400 transition-colors duration-300">11. Lessons Learned</a></li>
  </ul>
</div>

---

## 1. The Room and the Season

Everything in this system is organised by *campaign*, the administrative year containing one winter season, running roughly October to September. The current one is number seventeen. A campaign is the partition key of every catalogue in the database: roads, vehicles, resources and personnel are copied into each new campaign so that a season's history stays exactly as it was, even when the road network is re-segmented or a contractor changes. Section 5 is about how much trouble that one decision causes.

A *resource* is the term that recurs most in what follows: the unit the room activates for a shift, a named plough or tractor team run by the council's own service or by a contractor, staffed with people and paired with the vehicle it drives. It has a catalogue of its own because the same named unit is crewed by different people, and sometimes by a different machine, on consecutive nights.

Inside a campaign the room does five things, and the platform has to support all of them at once.

| What the room does | What the platform holds |
|---|---|
| Activates shifts on resources | A shift sheet: a fixed roster of rows (resources, geographic zones, groups of staff) against a three-day, twenty-four-hour grid |
| Logs what each crew is doing | Communications: one row per logged task, road, kilometre point and road state, entered by an operator or generated from telemetry |
| Sets the legal state of each road | A per-campaign road catalogue with a state, which fans out to subscribed organisations and to the roadside signs |
| Tracks de-icer stock | A per-silo ledger of movements, with stock derived from it |
| Answers "who did what, where, when" | A set of curated reports plus an ad-hoc query builder, both of which have to work across all seventeen seasons |

The consequences of getting any of it wrong are not abstract. The road-state field is what tells the public and the emergency services whether a mountain pass is open, and the communications log is what the council answers a complaint with and settles contractor hours from. A road whose state is stale because a report was silently dropped is a decision somebody makes at three in the morning on bad information.

Two of those capabilities did not exist in the desktop application at all: vehicle telemetry, where the vehicles that carry a transponder report their position every sixty seconds through a third-party fleet platform, and de-icer stock. The rest is a re-implementation, which sounds easier than it is, because the thing being re-implemented was never written down.

The system it replaces is still running. As of the last commit in this repository the control room was using the desktop application for part of the workflow, and the repository carries a Python job whose entire purpose is to ingest the client's SQL Server backup into the new model each time they hand one over. Section 9 is about that bridge, and about what it turned up.

---

## 2. The State of the Handover

I want to be precise about the inherited codebase, because "legacy mess" is a lazy summary and the actual failures were specific and mostly procedural. The people who built it could program. What was missing was every mechanism by which a running system is changed without breaking it.

**The schema had no representation in the repository.** Around sixty tables and every stored function existed only inside the production database. There was no DDL under version control, no dump, no diagram. Changing the schema meant connecting to production and running the statement. Reading the schema meant the same. That single fact explains most of the rest.

**The development environment pointed at production.** The Angular environment file used for `ng serve`, the one that exists specifically so that local work does not touch the live system, held the production hostname. So did thirty-nine other files, each service carrying its own hardcoded base URL. There was no local database, no seed, no compose file. A developer starting the app on a laptop was reading and writing the live system by default, during a season in which the control room depended on it.

**Authentication was a shape without a mechanism.** The login flow was correct up to a point: a password check against a bcrypt hash, then a six-digit code by email. On success the endpoint returned a literal placeholder string in the token field, a Spanish phrase meaning "real jwt here", left in by whoever stubbed the flow. The browser guard accepted any non-empty value in local storage, forty-two route groups were mounted with no authentication middleware anywhere, and the change log recorded an actor that the server had never established for itself.

**Referential integrity was partial and, in places, accidental.** Entities were joined by display text instead of by key, and the communications table had foreign keys to zones, states, tasks and silos, but not to roads. One constraint that did exist turned out to be worse than none: it pointed at a legacy vehicle catalogue that the current activation model no longer writes to, while both the web form and the telemetry job were putting activation identifiers from a completely different sequence into that column. It passed whenever a modern activation identifier happened to collide with a vehicle record from fifteen years earlier, attaching the row to a vehicle that had nothing to do with it, and rejected the insert when there was no collision. It was enforcing nothing real and silently destroying about ten percent of the automatic log.

**A trigger rewrote its own table.** Silo stock was maintained by an `AFTER` row trigger that recomputed running totals by issuing `UPDATE` against the table it was attached to, which re-fired it on every row it touched. It had been quietly corrupting historical stock figures.

Some things were genuinely fine, and the account is not fair without them. SQL was almost entirely parameterised through the ORM's replacement mechanism. TypeScript strict mode was on in both projects. The domain modelling of campaigns, whatever its consequences, was coherent. The failures were of engineering process, not of programming ability, and the difference matters when you are deciding what to keep.

The repository carried the same signature. The first commit is 41,559 files, of which about 40,000 are a checked-in `node_modules` directory, alongside a live Subversion working copy and compiled output committed next to source. Under all of that sit roughly 532 actual source files. There was no root `.gitignore`, no continuous integration, and no test.

---

## 3. Somewhere Other Than Production to Work

The first commit I made was not the development environment. It was a UX change to the de-icer register, and the twenty-four after it were more of the same, small features and small fixes, because the season was running and the room had problems that week. The local environment landed two weeks in. I would still argue it should come first, and I did not manage it; the honest version is that a live operations system in January does not give you an uninterrupted first fortnight.

What went in is a PostgreSQL and PostGIS container, a compose file, and a twenty-nine-line init script. A migration tool is the obvious thing to reach for here, and the reason there is none is operational: there is no pipeline to run one from. Migrations reach production by hand, and the only reliable starting point anyone has is a dump taken after the last deploy, so the local environment was built around those two facts instead of around a tool that would have had to be driven by hand as well. The consequence is that it has no migration tracking table, and does not need one.

| Question | Options considered | Choice | Why |
|---|---|---|---|
| Where does a local database come from? | Hand-written seed; anonymised fixture; restore a production dump | Restore the most recent production dump | The bugs are in seventeen years of real data, not in a fixture. A seed would have reproduced almost none of them |
| How are applied migrations tracked? | A `schema_migrations` table; a tool; the filesystem | The filesystem | The restore base is always a dump taken *after* a deploy, so "already applied" and "already in the dump" are the same fact. Moving a file into the applied directory and committing that move is the ledger |
| Which migrations run on first boot? | All of them; the pending ones | The pending ones, by a non-recursive glob over the migrations directory | Applied migrations sit in a subdirectory, so the glob picks up exactly what production has not yet seen, in numeric order |

Resetting the environment means destroying the volume, because the postgres image only runs init scripts against an empty data directory and therefore already provides the "only restore if empty" guard.

The elegance cost three separate incidents to make safe, and they are more instructive than the design.

The first: a rollback script was sitting loose in the migrations directory, so every fresh local environment applied a migration and then immediately applied its own rollback, in lexicographic order. That is why a `rollback/` subdirectory exists at all. It was an accident fix, not a policy.

The second, nearly six months later, in the opposite direction: a consolidated deploy bundle of twenty-four migrations, concatenated into one file so it could be pasted into a database client in a single go, was left in the same directory, so the glob would have applied all twenty-four twice on any fresh volume. The fix is a one-line commit that moves the file.

The third: ten pending migrations had to be renumbered because their prefixes collided with files already applied. The working tree still carries seven duplicated numbers from before the numbering discipline existed.

The init script also swallows every error, and I should say why instead of tidying it away. The restore runs with `--clean`, which issues a `DROP` for every object before recreating it, and on a fresh database every one of those drops fails. That noise is what the blanket suppression is for, and the cost is that a genuine restore failure looks exactly like the expected noise. That is a real weakness, not a subtlety.

---

## 4. Changing a Schema That Is Already in Use

The database was the root of nearly everything, and it could not be taken offline. There is no deployment pipeline either: migrations are applied by hand, by pasting SQL into a database client, one file at a time, in numeric order, while the room is working.

That constraint shaped the SQL more than any design preference did. A file that cannot be run by a script has to be readable by a person at two in the morning, has to be safe to run twice, and has to have a way back.

**The header habit formed early, well before the rollback habit did.** The first seventy-odd migrations open with a short note of intent, ten lines at the median, and one opens with nothing at all. From around migration 75 onward the opening comment is standard and usually runs twenty to forty lines: the defect, how it was measured, the blast radius in rows, the idempotency argument, and a verification query to run afterwards. Those headers are the best documentation in the project, better than the README, because they were written at the moment the reasoning existed.

**Rollback coverage was adopted late.** Migrations 1 through 163 have three rollback scripts between them. Of the fifty-four numbered from 164 onward, fifty-three have one; the exception explains itself in its own header, being a baseline capture of four functions that had never been versioned, so the only way to undo it is to run it again. I would like to claim that was a plan. It was a habit that formed after the migrations started getting dangerous enough to need it.

**The hardest one was forced by a change of place names.** The resource catalogue used the display name as its primary key, propagated as a text foreign key into three other tables. That was survivable until the province re-designated its districts with Basque names, so five district names changed at once and roughly 13,800 rows across four tables had to follow. The cascade enumerates every existing foreign key from the catalogue, drops them all in a loop, applies the renames through a temporary helper that reports per-table row counts, and recreates the constraints. The renames are written out one line per resource, deliberately doubled, because the legacy data contains both a single-space and a double-space spelling of the same name. It is brute force, but it is auditable brute force: no pattern can match something it should not have, and every line reports what it changed.

Having done that once, the next three migrations removed the cause with a textbook expand, migrate, contract. Expand is purely additive and takes no downtime: add a surrogate integer key and a unique index, copy the display name into a new column, add nullable integer columns to the three dependants, backfill by joining on name and campaign, index them, then report mapped and total counts per table and warn on anything unmapped. Migrate duplicates every affected function as a variant taking the integer, so the API and the front end can move at their own pace. Contract is the only phase with a stated downtime window, and it opens with a guard:

```sql
-- Contract phase. Abort the whole transaction if anything is still unmapped.
DO $$
DECLARE unmapped integer;
BEGIN
    SELECT count(*) INTO unmapped
    FROM crew_road_assignment
    WHERE resource_id IS NULL;

    IF unmapped > 0 THEN
        RAISE EXCEPTION
            'Aborting: % rows still have no surrogate key. Re-run the expand phase.',
            unmapped;
    END IF;
END $$;
```

Then the real foreign keys are created, the text ones dropped, and the legacy columns renamed rather than dropped, so the data survives a mistake. One step in that file is written out in full and left commented, with a note that it is dangerous: swapping the actual primary key from the composite text key to the surrogate. It is still commented today, and the table carries both, which is untidy and was the right call, because nothing depended on the change and the downside was unbounded.

**Functions that existed only in the database were captured before they were touched.** Several migrations do nothing but write out the current body of a production function into a versioned file, so a later rename can be checked against every function that mentions the column. That is the only defence against the failure in the next section.

**A rollback that intentionally does nothing.** Two sequences had fallen behind their tables, because a bulk load had inserted explicit identifiers with `ON CONFLICT DO NOTHING` and never called `setval`. One stood at 21,790 while the table's maximum was 23,014, so creating a standby crew failed in production with a duplicate key error, and every failed attempt burned another value. Its rollback file exists, is committed, and contains no statements, with a header explaining that lowering a sequence would reintroduce the bug, and that a sequence above the maximum is a gap, not an error.

---

## 5. A Campaign Is a Partition Key and a Calendar

The campaign is simultaneously two things that do not agree: a partition key stamped on about fifteen tables, and an interval on a calendar. Almost every hard bug in this part of the system is those two meanings disagreeing.

Because catalogues are copied per campaign, the same physical road exists as seventeen different rows with seventeen different identifiers. Anything that points at a road therefore has to know which season it is talking about, and anything that survives a season boundary has to be re-pointed. Once a year the room creates the new campaign, and a stored procedure copies the whole per-campaign configuration into it: roads, vehicles, resources, the personnel roster, the shift-sheet layout, the alert subscriptions.

In August 2026 that annual rollover failed, twice, and had to be rolled back. The cause is a property of the language rather than a mistake in a diff. PL/pgSQL does not resolve column references when a function is created, only when the statement actually executes. Six months earlier the expand-migrate-contract described above had renamed a column to a legacy name. The rollover procedure kept referring to the old name, and kept compiling cleanly the whole time, because nothing executed that particular step until the annual rollover came round. A code path that runs once a year decays invisibly, and the engine will not tell you, because to the engine there is nothing to check until the row is in front of it.

The rewrite is 457 lines, and its header enumerates everything the previous version had got wrong as other migrations landed underneath it: it duplicated 484 people into the new campaign instead of replicating the per-campaign roster, it left display names null so the map viewer rendered blank labels, it had silently lost the shift-sheet step several versions earlier, and it re-pointed neither the per-road alert subscriptions nor a table added since.

Two of its steps are operational judgement, not schema work. The first is ordering: tractor sessions still open in the old campaign have to be closed *before* the map layer rows are re-pointed, because the trigger that switches a tractor off on the map looks the vehicle up by its old identifier. Do it in the other order and the session stays open and invisible, forever. The second is what "closed" means. Those sessions are closed with an end time equal to their start time, an explicitly zero-duration administrative close, so that a migration does not invent hours of work nobody did. Closing them at the campaign boundary would have been tidier and would have put fabricated labour into a system whose reports settle contractor hours.

---

## 6. Three Kinds of Orphan, Then a Foreign Key

The communications table had no foreign key to roads. Three different failure modes had accumulated in that gap over the years, and each one needed a different answer.

The symptom was uniform: communications rendering with a blank road name, and in one report disappearing entirely because the query joined roads with an inner join. 5,859 rows in total. The causes were not uniform at all.

<img src="/assets/blog/winter-ops-orphan-triage.svg" alt="One symptom, three populations, three different remedies, then a foreign key. 5,859 shift reports rendered with a blank road name because the communications table had foreign keys to zones, states, tasks and silos but never one to roads. Group one, 3,185 rows, was ingested against the road catalogue as it stood before re-segmentation and later re-inserted under the new mapping, so a good copy already exists and the orphans are moved to a backup table rather than destroyed, verified afterwards at 7,545 rows against 7,540 in the desktop system. Group two, 845 rows, lost its road when the original migration dropped one catalogue row, 340 roads in the desktop system against 339 in the web, so one guarded insert restores the parent and the 845 resolve on their own without being touched. Group three, 1,829 rows, was written once by telemetry against the old catalogue with no good copy anywhere, so it is remapped in place through a 152-pair old-to-new lookup with the previous values kept for the rollback. Only then is the foreign key added, with ON DELETE NO ACTION, so deleting a referenced road fails loudly and the API turns the violation into a 409" data-zoomable />

**Group one, 3,185 rows: delete them, because a good copy exists.** An early ingestion of the desktop backup had mapped one campaign's rows against the road catalogue as it stood before the network was re-segmented, so when the roads were re-segmented with new identifiers those rows pointed at identifiers that no longer existed. Later re-ingestions inserted the same rows again under the current mapping and did not recognise them as duplicates, because the natural deduplication key *includes the road*. No content is lost by removing them. They are moved into a backup table instead of being deleted, and the header records the verification: after cleanup the campaign holds 7,545 manually logged rows against 7,540 in the desktop system, the extra five having been created natively in the web app.

**Group two, 845 rows: restore the parent, because content would be lost.** These pointed at a road that had been lost in the original migration, one single catalogue row: the desktop system holds 340 roads for that season, the web held 339. The fix is one guarded insert re-creating the catalogue row exactly as the desktop system holds it. The 845 rows are not touched at all. They resolve on their own the moment their road exists again. The header even checks that the road triggers are `AFTER UPDATE` rather than `AFTER INSERT`, so that re-creating the row fires nothing.

**Group three, 1,829 rows: remap in place, because these are unique.** Written by the telemetry stream against the pre-re-segmentation catalogue, native to the web, written once, with no good copy anywhere. So they are remapped, using a 152-pair old-to-new lookup baked literally into the migration file. The derivation is documented, not asserted: the old identifiers still match the desktop catalogue, which yields a name and a kilometre range for each; each then matches the current catalogue by normalised name plus maximum kilometre-range overlap, which is the same logic the live ingestion uses. Coverage is recorded as 152 of 152 identifiers and 1,829 of 1,829 rows, with zero ambiguities. Previous values go into a table so the rollback can restore them.

Only then does the fourth migration add the foreign key, in about two dozen lines, with a header stating its own prerequisites and a diagnostic query for finding residue. It is created with `ON DELETE NO ACTION`, so deleting a referenced road now fails loudly, and the API translates the constraint violation into a `409` with a message telling whoever re-segments next that they have to remap first.

The judgement in all of this is telling the three populations apart: delete, restore the parent, remap. The foreign key stops that class of bug from recurring, and the reason it had been missing for years is that nothing had ever failed loudly.

---

## 7. Which Road Was That Plough On?

The vehicles that carry a transponder report to a third-party fleet platform. That platform runs its own map matching and returns, per frame, a road name, a kilometre point and a vehicle state. The system polls the latest position every sixty seconds and stores the payload verbatim in an append-only table. Nobody anywhere in that chain corrects the signal.

The audit ran against a production dump of 1,179,280 frames, 54 vehicles, ten months, and its critical finding splits two things that are normally conflated: the *position* is excellent and the *attribution* is not. Roof antennas, fifteen to eighteen satellites, a median scatter of 3.9 metres while genuinely stopped, and only half a percent of parked episodes exceeding eighty metres. Even the apparent teleports, implied speeds above 300 km/h, are mostly the platform buffering frames and delivering them in a burst.

What is broken is that the matcher is point-wise and has no memory. It re-decides which road you are on every sixty seconds, from scratch. Measured: 152 A-to-B-to-A flips per thousand road transitions, 23,631 of them over ten months, 87 percent lasting exactly one frame. Stopped vehicles change road without moving in 9.6 percent of parked episodes, in one case with 0.8 metres of drift, and kilometre points flap between disjoint stretches that happen to share a name. Attribution never abstains either: the platform always returns something, including placeholder labels for cameras and toll points, and roads in neighbouring provinces.

That diagnosis is what makes the fix cheap. If the positions were bad you would need to re-match against a road network in PostGIS, which was costed and deliberately not built. Because only the attribution is bad, and because the derived views read from an immutable raw table on every query, a coherence pass written in SQL retroactively cleans ten months of history with no data migration at all.

| Question | Options considered | Choice | Why |
|---|---|---|---|
| Where is the error? | GPS receiver; the platform's map matching | The map matching | Position scatter is metres while stopped; attribution flips without movement. Fixing the wrong layer would have cost a re-matching engine |
| Rewrite the stored frames, or filter at read time? | Correct the raw table; correct the derived views | Correct the views | The raw frame is what the vendor sent. Keeping it means a better rule later re-cleans the same history; rewriting it means the evidence is gone |
| How do you debounce at ingestion? | Hold a frame and confirm with the *next* one; confirm against the *previous* one | The previous one | Confirming forward needs state in the process and dies on restart. The previous frame is already in the table, so the same semantics need no state and no redeploy |

**Identity first.** The platform has no concept of a vehicle. It has *stations*, a term inherited from its origins serving fixed sensors, and the licence plate is not a field: it is buried inside a free-text station name in whatever format somebody typed. The ingestion job carried a six-branch regular expression cascade to dig the plate back out, then matched it against a free-text vehicle description on the shift record with a substring comparison. When the plate did not literally appear inside the description, no report was created and no error surfaced.

Worse, the workaround had ossified into data: because old-format plates came out of the regex glued to their prefix, the catalogue carried three fake vehicle records whose only purpose was to make a string join resolve, and one of them pointed at the wrong resource. Moving every consumer onto the platform's stable station identifier took nine migrations, and killed a hardcoded code-to-plate map and a substring hack in the map viewer along with them.

**Then names.** Some roads on the province's own network arrive under a name the catalogue does not have, most importantly the historical designation of the A-1 corridor. The matching cascade only ever trimmed the *catalogue* side of the comparison, never the incoming side, so those frames matched nothing, the automatic report was never created, and the reading vanished from the segment query. A plough working that corridor generated nothing at all for as long as the platform labelled it under the old name.

The audit behind the fix looked at 537 distinct road names across 1.1 million frames. 93.3 percent resolved against the catalogue; of the rest, roughly half were own-network roads arriving under another name, and the remainder was genuine transit outside the province, correctly ignored, plus noise. Over sixty days, 5.1 percent of frames labelled `A-1` fell within a minute of an automatic report from the same vehicle, which is the rate you get when a report marks a change of stretch and not a frame. At that rate the 911 isolated frames carrying the historical name should have produced roughly forty-six reports. They produced none.

The fix is a two-column table consulted as one extra step in every name resolver. It translates only the name; the kilometre point still selects the stretch through the existing cascade, so an alias cannot invent a position. The honest part is the seed. The audit produced seventeen candidate names and the migration ships five, because each was measured against real data and the twelve that recovered nothing were dropped and documented as dropped. The historical A-1 name recovers 9,772 of 10,335 frames. One motorway alias recovers only 137 of 1,664, the rest sitting at kilometre points outside the catalogue's range for that road and correctly discarded. A five-row lookup table is the least impressive-looking artefact in the repository, and the work in it is entirely in deciding which five rows deserved to exist.

**Then coherence, three times, under one rule.** The same five-minute window is used in three places so that history and future obey a single definition.

<img src="/assets/blog/winter-ops-gps-coherence.svg" alt="One coherence rule applied in three places over an append-only raw frames table. The telemetry platform's map matching emits a road name and kilometre point per frame with no temporal memory; the poller stores each frame verbatim every sixty seconds. The same five-minute window is then used at read time, where three rules (a one-frame debounce that inherits road and kilometre point when the neighbouring frames agree, a continuity rule rejecting a kilometre jump larger than twice the haversine distance travelled plus half a kilometre, and a freeze making stopped frames inherit the first road of their movement group) clean ten months of history with no data migration; at ingestion, where a change of stretch is written only if the preceding frame already named that stretch, so the debounce needs no state in the process and no redeploy; and once retroactively, where automatic reports already materialised are purged under the same criterion into a backup table, restorable with their identity keys unchanged" data-zoomable />

At read time, three rules run before road resolution:

```sql
-- Neighbours agree, current frame disagrees: inherit road AND kilometre point.
-- Carrying only the road would leave the flip's kilometre point poisoning
-- the segment endpoints.
CASE
    WHEN prev_road IS NOT NULL
     AND next_road IS NOT NULL
     AND prev_road = next_road
     AND road <> prev_road
    THEN prev_road
    ELSE road
END AS road_coherent
```

A second rule rejects a change in kilometre point incompatible with the distance actually travelled, using a haversine helper with explicit slack for road sinuosity. A third freezes attribution while the vehicle is stopped, implemented as gaps and islands: a running sum over "is this frame moving" opens a group, and every stopped frame in the group inherits the group's first road and kilometre point.

One ordering fix rides along, and it is the kind of thing that would have quietly ruined the exercise. The kilometre-range filter used to run *before* the cleanup, where it removes frames from the middle of the series and destroys the neighbours the debounce depends on, so the correction would have silently degraded whenever a user filtered by range.

At ingestion the same rule runs in mirror image. The obvious debounce is to hold a frame for one cycle and confirm it against the next one, which needs state in the ingestion process and dies on every restart. Instead, a report representing a change of stretch is only written if the immediately preceding frame, within five minutes, already attributed that same stretch. The job persists every frame before calling the procedure, so the previous frame is always there. A one-frame flip never gets two consecutive frames on the new road, so neither of its two spurious reports is ever born. The cost is stated in the header instead of hidden: a genuine road change is now recorded about sixty seconds later, and the last frame of a working day, if it happens to start a new road, produces nothing until the vehicle emits again.

Reports already written are materialised rows, so they need a migration of their own. The purge uses the same criterion and the same window, comparing names *after* alias translation so that a pure alias flip is recognised as the same corridor and not a change. The rows are copied verbatim into a backup table created with `SELECT * ... WHERE false` so it inherits the full structure, and the rollback re-inserts them with `OVERRIDING SYSTEM VALUE` so the identity primary keys come back unchanged. The window was chosen by a published sensitivity sweep: three minutes purges 597 rows, five minutes 918, ten minutes 1,038.

The measured effect over ten months: 254,458 derived segments fall to 236,254, and single-frame segments fall from 100,563 to 85,116. The remainder are genuine state changes, left alone deliberately, because the vehicle's own state signal is trusted. The queries cost more, from 1.8 to 4.2 seconds over a week and from 49 to 57.5 seconds over ten months. That was affordable because the range was already capped at 31 days, in the front end and in the API, for volume reasons that predate this work.

The limits are substantial, and mostly written down in the repository before I wrote them here. The thresholds, five minutes, twice the haversine distance plus half a kilometre, 150 km/h for the teleport filter, are judgement calls with no labelled ground truth behind them, and 918 is the number the chosen rule produces, not a validated count of real errors. The coherence windows still partition by plate text even though the identity work moved everything else onto the station identifier. One class of error cannot be fixed from this side at all, because distinguishing sub-stretches of the same road requires offset data the platform does not publish. And the map viewer still draws a smoothed spline straight through the teleports.

---

## 8. A Query Builder Copied from a 2009 Manual

The platform ships two reporting tools: a set of curated reports for the questions the room asks every week, and an ad-hoc builder for everything else. The builder is where I got something wrong in a way that is worth writing down.

The inherited builder did not work, and working out why took two passes at the original VB source. The desktop application had two query screens that resemble each other from a distance. One was a `WHERE` builder over ArcGIS *map layers*: pick a layer, check its searchable flag, load the layer's geographic attribute names, assemble an expression that ArcGIS applies as a display filter on the cartography. The other was a real ad-hoc tool over the business tables, with six domains, an operator set running down to `LIKE` and null tests, unique-value pickers per field, multi-column ordering, four grouping operations and an Excel export through a stored template. My first note recorded the inherited builder as a copy of the map-layer screen. It was a copy of the other one, and a lossy copy: one of the six domains, the `LIKE` operator, the unique-value pickers and the grouping had all been dropped in the port.

The objections that survived the correction were about the new database, not the interaction. The inherited hand-marked list of seven queryable tables both omitted legitimate ones and counted one table twice under two names, in a database that now has fifty-eight, and nothing in it knew about campaigns.

So I designed the replacement: a typed wizard, one form per business domain, no SQL operators visible to anyone. The reasoning was user-centred and, I still think, correct about the mechanism. Between one afternoon and that evening I built five domain screens, a shared scaffold and a dedicated backend for them.

At nine that night I deleted all of it, forty-three files, 1,104 insertions against 4,936 deletions. What replaced it was the legacy shape, reworked to follow the layout of the client's own 2009 user manual: three parallel lists for available fields, selected fields with their operation, and ordering and grouping; `AND`/`OR` connectors between condition rows; a live human-readable sentence of the compound rule. The operators I had argued were user-hostile were the interaction those operators had been trained on for seventeen years. The analysis was right about the mechanism and wrong about the users, and the correction cost a day.

Everything after that was making the query-by-example shape actually work.

**A `plpgsql` function cannot be inlined, so the outer `LIMIT` never reaches it.** Pagination was taking about thirty seconds a page and hitting the statement timeout. The per-campaign query functions were all written as `plpgsql` with a single `RETURN QUERY`. PostgreSQL will not splice such a function into the calling query, so it runs to completion and produces its whole result set before the caller's `LIMIT` and `WHERE` are applied to the rows that come back, which on a large campaign means materialising tens of thousands of rows per keystroke. Rewriting the five functions that are a single statement as `LANGUAGE sql STABLE` makes them inlineable, so the planner splices the body into the caller's query and the filters and the limit reach the real plan and can use indexes:

```sql
CREATE OR REPLACE FUNCTION report_communications(p_campaign_id integer)
RETURNS TABLE (...)
LANGUAGE sql STABLE          -- was: LANGUAGE plpgsql, with RETURN QUERY
AS $$
    SELECT ...
    FROM communications c
    WHERE c.campaign_id = p_campaign_id;
$$;
```

The migration is honest about what it does not convert: one function keeps a branch with two different bodies for old and new campaigns, so it stays `plpgsql`. And the two-minute per-query statement timeout that was introduced as a workaround for that materialisation is still in place, with a comment that still describes the functions as `plpgsql`. The mitigation outlived the root fix, and the comment is now wrong. The same pass took four multiplying joins out of a neighbouring report, where an unbounded join on resource was fanning rows out 357-fold, and replaced them with `LATERAL ... LIMIT 1`, which guarantees one row structurally instead of papering over the duplicates with `DISTINCT`.

**A SQL injection I wrote and then found.** The precise mechanism is worth the space. A helper that turns an array into a PostgreSQL array literal was written first for a call site where the result was passed as a bound parameter, so the driver quoted and escaped the whole thing. A day later a variant landed for the builder's `IN` and `NOT IN` operators with one mutation: it returned the literal with the surrounding single quotes baked in, and the result was interpolated straight into the SQL string.

```js
// Introduced: quotes baked into the helper, result concatenated into the SQL.
const clause = `${column}::text = ANY(${arrayLiteral(value)}::text[])`;

// Fixed: build an ARRAY constructor, escape every element through the driver.
const literal = `ARRAY[${value.map((v) => sequelize.escape(String(v))).join(', ')}]`;
const clause = `${column}::text = ANY(${literal}::text[])`;
```

The escape function in the first version handled the backslash and the double quote. It never touched the single quote, which is precisely the character delimiting the literal it was now producing. The ceiling was higher than data exfiltration: when a query carries replacements but no bind parameters, this driver inlines them and issues a simple query, which permits multiple statements separated by semicolons. Two qualifiers keep the story honest. The vulnerable operator was unreachable through the interface, because the conditions panel renders a single text input and the backend requires an array, so only a hand-crafted request could reach it. And I introduced it, and found it myself two months later in my own audit pass.

The fix that mattered was not a better escape function. It was that the builder stopped assembling a SQL literal of its own and went back to handing values to something that already knew how to quote them. A tool whose job is to turn user input into SQL is a security boundary whether or not anyone labelled it one, and the safe version of that job is composing from parts the driver understands, not producing text that has to survive inspection.

Three of the fourteen operators the interface offers are inert. `between`, `in` and `not in` all require an array, and nothing in the front end ever produces one, because the value field is a single text input with no chip entry and no comma splitting. They appear in the dropdown, they are selectable, and the backend then discards the condition silently, which means the query runs *without* that filter and returns more rows than the user asked for, with no indication. Silent discard of a malformed condition is defensible. Silent discard in a reporting tool whose entire value is that the numbers can be trusted is much less so, and it is the next thing I would fix.

---

## 9. Proving It Against the System It Replaces

The platform has not finished replacing the desktop application, and pretending otherwise would misdescribe the engineering. The room kept using the old system for part of the workflow while the new one was being built, which means both systems were writing history at the same time, into different databases, for a full season.

That constraint produced the most reusable piece of tooling in the project. The client periodically hands over a SQL Server backup. A one-command script restores it into a throwaway container, and an 847-line Python job normalises the desktop's rows into the web's model and loads them. Three of its design decisions come straight from the constraint.

Desktop identifiers are not preserved, because they collide with the identifiers the web mints for its own telemetry stream: same numeric range, different events. Rows go in with a fresh identifier and are deduplicated on a *natural* key of campaign, timestamp, crew, remapped road, road state and remapped task, compared only against rows the web marks as manually created, so web-native rows are never touched.

It also has two output modes. One writes directly to a local replica. The other writes nothing and emits a self-idempotent SQL file in which every insert carries its own `WHERE NOT EXISTS`, because production has only PostgreSQL and a database client, and neither the SQL Server container nor the client's backup should ever need to exist on the production server.

And it disables one live trigger around the bulk load, because the tractor session table syncs the map viewer's layer with live sessions, and loading fifteen years of history would otherwise light up thousands of tractors as active on the operational map.

The remapping inside it is the same normalised-name plus maximum-overlap match described in section 6, with two additions: a guard for legacy rows that stored their kilometre range backwards, and a tie-break between the ascending and descending carriageway to the lower identifier, on the stated reasoning that a road *state* applies to the segment and not to a direction of travel.

Alongside the bridge sits a 406-line cheat sheet that asks each of the client's habitual reports of both systems side by side: the PostgreSQL call on the left, a hand-written equivalent against the restored legacy backup on the right.

What makes it more than a demo script is that its first section enumerates, in advance, every reason two numbers might legitimately differ. The old database stores local time and the new one UTC, the same instants in different representations. The web post-processes, so one report collapses 7,090 individual entries into 1,040 state intervals and another aggregates into a matrix, and neither will ever match a raw count. The desktop application pads single-digit resource names with two spaces to align them on screen, so any cross-database join has to compare ignoring whitespace, a display hack from the 1990s that became a join key. And three reports have no legacy equivalent at all.

Separating expected disagreement from real disagreement is what let the exercise find things. It matched where it should: one personnel report at 575 against 575, manual entries for an early campaign at 9,423 against 9,423, a crew tractor renamed between systems verified as the same machine by matching session counts at 34 against 34. It surfaced the 5,859 orphaned rows of section 6, in three classes, each traced to a distinct cause. And in one season it found that the *old* system was wrong: the desktop database contains literal duplicate shifts, the same person at the same instant in two rows, so the web reports 686 where the raw backup has 692, and the hours for that person differ by the shift counted twice. The document says plainly that the web figure is the correct one.

Validating against the legacy system found a bug in the legacy system. That is the outcome I would want from any parity exercise, and it is only reachable if you write down in advance which differences are allowed.

---

## 10. What It Delivers

The mechanism that best describes what the platform is for is what happens when an operator changes a road's state in a dropdown. The database write goes first and is confirmed, an audit row is recorded, and then the change fans out to the organisations that subscribe to it: other administrations, emergency services, municipalities, each configured through a matrix of email and SMS toggles, five priority levels, and a list of roads. The fan-out resolves subscribers per road and priority, deduplicates, and accumulates into a per-recipient bucket, so each person receives one message listing everything that changed, not one message per road, and it runs after the HTTP response has gone back so the operator's screen never waits on a mail server.

That deduplication was learned rather than designed. Closing a mountain pass with two roadside signs used to send every subscriber the same alert twice, once per physical sign. The commit that removed the duplicate path also fixed the opposite failure in the same fan-out: the road-state change reported by radio and logged as a communication was calling the notifier without a priority, and the notifier skips any item missing one, so those notifications were being dropped with no error at all. Notification systems fail in both directions, and you find out from the recipients.

The same state change drives the physical signs, sixteen electronically controlled ones at eight mountain passes plus fifteen manual ones that exist only as map markers. The platform texts each sign through an SMS gateway, and the two families understand different command vocabularies, so the mapping from road state to sign is lossy: one family is coarse enough that two precaution states collapse into one and three closure variants collapse into one, while the other accepts a small structured message language and keeps the nuance. The signs also send SMS back, both a periodic status report and an echo of any command they receive, because field crews sometimes change a sign without going through the platform, and reading that echo is the only way the system learns about a change it did not make. The boundary is worth stating so the automation does not sound complete: the fan-out to the signs lives in the front end, so it fires from the road-state screen and nowhere else, and it is fire and forget.

The rest, briefly. De-icer stock is a real ledger of movements, not a total recomputed by a self-firing trigger. Weather station readings drive configurable alert rules pushed over websockets. An hourly road-surface temperature layer is ingested from a regional mobility data space and published as a map layer. Authentication is real: signed tokens, database-backed revocable sessions, multi-factor by email or SMS, and roles.

It is worth being equally clear about what the system does without. There is no continuous integration, no linter and no test suite. The backend's test script exits with a failure code, and the hundred-odd front-end spec files are untouched CLI boilerplate that would fail if anyone ran them. Most of the permission model is enforced in the browser, and the server-side role checks behind it are applied unevenly. The front end has no lazy loading and no components using `OnPush` change detection, so a good deal of the performance work is compensation for that. None of those are oversights I discovered while writing this. They are known, and they are the backlog.

---

## 11. Lessons Learned

### Put the invariant where it cannot be bypassed

Nearly every durable fix here moved a rule down a layer: the orphan classes ended in a foreign key, the resource catalogue stopped being keyed by a display name somebody could retype, and the debounce ended in an ordering property the append-only table already had. Each time, the version enforced by the database survived the next person who did not know the rule existed, and the version enforced by convention did not.

### A constraint that has never failed is not evidence that it is correct

The foreign key that kept passing because two unrelated identifier sequences happened to overlap is the sharpest example, and the rollover procedure that compiled cleanly for six months is the same shape. Silence from a system is not a signal, and the only way to find out whether a rule is real is to make it fail on purpose against real data.

### Derived data heals itself; materialised data needs a migration

Because the segment views are pure functions over an immutable table, improving the function fixed ten months of history at zero risk. Because the automatic reports were rows, the same rule had to be written twice more. Deciding what to materialise is deciding what you will later have to migrate.

### Measure the candidates, then ship the ones that earn it

Seventeen candidate aliases became five for the reason in section 7. The same discipline killed a requested feature: an accident-detection idea was measured against the client's own data, did not survive the measurement, and was written up as not worth building. Both are cheaper than shipping something plausible and discovering later that it never did anything.

### The users' mental model may already be written down

Studying the legacy application was worth it, and I read the wrong half of it first. The client's 2009 user manual described the interaction they already knew, and reading it before designing the replacement would have saved a day and about five thousand lines.

### Reversibility is a habit, and it forms late

Rollback scripts only became routine at migration 164, when one was finally frightening enough to want a way back. The practice that mattered most was smaller than the rollback script: copy anything you are about to delete into a table whose structure is inherited from the original, and restore it with the original primary keys. Four lines, and it is the difference between a mistake and an incident.

---

## Final Thoughts

The specific difficulty of this project was not any one problem. It was that a fifteen-year-old operational model, a half-finished migration of it, and a live winter season were all present at the same time, and each of the three constrained what you were allowed to do about the other two. Fixing something usually meant first establishing what it had originally meant, which was rarely written anywhere, and then finding a way to change it without the room noticing.

The idea I would keep is the one in the debounce. The obvious shape needed state in a process that restarts and a deployment to go with it, and the version that replaced it needed neither, because the pipeline already guaranteed the ordering the rule depended on. Looking for the invariant a system already has, before adding machinery to create one, paid off more often here than any individual fix.

If I were starting again, the schema would be in version control on day one even if the only way to get it there was to dump production, because everything else in this account follows from it not being. The migration headers would stay as they are, rollback scripts and backup-before-delete would start at migration one, and the parity cheat sheet would be written before the comparison instead of during it, because writing it first is what turned a demo into an audit.

None of this is specific to snowploughs. Any system old enough to matter has rules that live only in the data, constraints that pass by coincidence, and a once-a-year code path nobody has executed since the last time it worked.

---

**Thanks for reading. If you found this useful, feel free to share it with anyone who has inherited a system they are not allowed to switch off.**
