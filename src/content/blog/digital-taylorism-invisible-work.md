---
title: "From the Stopwatch to the Dashboard: Digital Taylorism and the Invisible Work of Software"
description: "A reflection on managers who don't understand the work yet dictate how it's done. From Frederick Taylor's stopwatch to today's tickets, metrics, and AI: why the most valuable work we do is the work nobody with authority can see."
pubDate: "2026-06-22"
image: "/assets/blog/digital-taylorism.webp"
tags: ["career", "software-development", "digital-taylorism", "management", "ai"]
author: "Asier Ortiz"
draft: false
---

There's a question worth sitting with: is there any other profession where your superior can understand absolutely nothing about what you do, or how you do it, and still get to dictate exactly how you should do it, and you just have to obey?

Look for company in other fields and the echoes are everywhere. Teachers handed a script to read word for word. Doctors overruled by an insurance clerk who never saw the patient. Soldiers commanded by civilians who've never held a rifle. The pattern underneath them all already has a name, an old one with a long history, and it explains, with uncomfortable precision, a lot of what makes modern software work feel the way it does.

This isn't a tutorial. It's a look at power, measurement, and why the most valuable work we do is so often the work nobody with authority can actually see.

---

## 📋 Table of Contents

<div class="not-prose mb-8 rounded-lg border border-base-700 bg-base-900 p-4">
  <ul class="flex flex-col gap-2">
    <li><a href="#1-the-question-that-started-it" class="text-base-300 hover:text-primary-400 transition-colors duration-300">1. The Question That Started It</a></li>
    <li><a href="#2-taylor-and-the-stopwatch" class="text-base-300 hover:text-primary-400 transition-colors duration-300">2. Taylor and the Stopwatch</a></li>
    <li><a href="#3-the-stopwatch-becomes-a-dashboard" class="text-base-300 hover:text-primary-400 transition-colors duration-300">3. The Stopwatch Becomes a Dashboard</a></li>
    <li><a href="#4-the-manager-as-a-transmission-belt" class="text-base-300 hover:text-primary-400 transition-colors duration-300">4. The Manager as a Transmission Belt</a></li>
    <li><a href="#5-why-speed-wins-the-legibility-problem" class="text-base-300 hover:text-primary-400 transition-colors duration-300">5. Why Speed Wins: The Legibility Problem</a></li>
    <li><a href="#6-ai-the-accomplice-who-also-understands-nothing" class="text-base-300 hover:text-primary-400 transition-colors duration-300">6. AI, the Accomplice Who Also Understands Nothing</a></li>
    <li><a href="#7-the-cruel-irony-we-built-the-tools" class="text-base-300 hover:text-primary-400 transition-colors duration-300">7. The Cruel Irony: We Built the Tools</a></li>
    <li><a href="#8-invisible-not-unnecessary" class="text-base-300 hover:text-primary-400 transition-colors duration-300">8. Invisible, Not Unnecessary</a></li>
    <li><a href="#9-working-against-the-grain" class="text-base-300 hover:text-primary-400 transition-colors duration-300">9. Working Against the Grain</a></li>
    <li><a href="#final-thoughts" class="text-base-300 hover:text-primary-400 transition-colors duration-300">Final Thoughts</a></li>
  </ul>
</div>

---

## 1. The Question That Started It

You probably know the shape of it. A manager with a list of tickets who only wants them closed. Someone who promises things to clients without understanding what those promises cost. Who asks for features the way an end user would describe them (*"just add a button"*), and who, when the whole thing catches fire, still understands nothing about why.

It's tempting to file this under "bad boss" and move on. But that's not quite the problem, and getting the diagnosis right matters.

A manager not understanding the **how** is fine, even healthy. Their job isn't the how; it's priorities, resources, and outcomes. The damage starts somewhere more specific.

> **The real problem isn't ignorance of the *what*. It's someone who doesn't understand the *how* deciding the *how*.**

That's not division of labor anymore. That's something else, and it has a lineage.

---

## 2. Taylor and the Stopwatch

At the start of the twentieth century, Frederick Taylor sent "efficiency experts" onto factory floors with stopwatches. Their job was to stand next to a skilled craftsman and tell him how to move: how to hold the tool, where to place his feet, how many seconds each motion should take. They broke the craft into prescribed steps and stripped the worker of any decision about his own work.

The stated goal was exactly that: take the knowledge out of the worker's head and put it into management's manuals. The craftsman knew his job infinitely better than the man with the stopwatch, and it changed nothing. He still had to do it the way he was told.

If that already sounds familiar, it should. The instrument has changed; the project hasn't.

---

## 3. The Stopwatch Becomes a Dashboard

What we're living through has a name: **digital Taylorism**. It's Taylor's idea applied to knowledge work instead of the factory floor.

The instrument is what changed. Taylor had a stopwatch and a man in a coat watching you. Digital Taylorism has software: metrics, dashboards, algorithms. The **how** is no longer dictated only by a person with a clipboard; it's dictated by the system. And this loops back to the original question, because very often the thing that doesn't understand your work is no longer a human boss at all. It's a metric. The ticket. The story point. The velocity. The burndown chart.

Someone built that instrument without understanding the craft, and now you spend your days obeying *how it measures* instead of *what it was supposed to achieve*.

Scrum done badly, Jira as a surveillance tool, the daily standup turned into a status report, the practice of slicing your work into fixed-size tickets: these get cited routinely as textbook digital Taylorism, and for good reason. Breaking your work into prescribed, measurable units **is** decomposing the craft, which was exactly Taylor's dream, now with a nicer UI.

---

## 4. The Manager as a Transmission Belt

Back to the boss who closes tickets and promises blindly. The useful way to see him isn't as stupid but as a **transmission belt**.

He doesn't generate anything. He moves pressure: from the client to you, from the list to you, from *"the competition is faster"* to you. What makes this genuinely maddening, not just annoying but structurally unfair, is the asymmetry in how things travel along that belt.

Information is lost going **up**. Responsibility flows **down**.

The technical consequences of every absurd promise don't land on the person who made the promise. They land on you. He keeps the part where you get to decide; you keep the part where it has to actually work: knowledge and risk on one side, authority on the other. That's not an accident or a personality flaw; it's Taylor's inheritance, working exactly as designed.

> **Up the belt, information disappears. Down the belt, responsibility lands. The person who promises never pays for the promise.**

---

## 5. Why Speed Wins: The Legibility Problem

*"Someone else does it faster."* *"Another company can deliver it in half the time."*

These land hard because they sound like objective measurements of your craft, and they aren't. "Faster" measures exactly one thing and hides everything else: the technical debt the other person buried, what the other company quietly cut and isn't telling you, the fire that arrives in six months and no longer shows up in the comparison.

Speed is **legible** to someone who doesn't understand the work. Quality is not. So the metric that wins isn't the one that matters most, it's the one your boss can read.

The cost of this is concrete. On a legacy operations platform I once rescued, the single most valuable thing I did was completely invisible: over sixty migration scripts, restoring referential integrity, rebuilding the database foundation that everything else stood on. None of that demos well, and none of it shows up as a feature, while the pressure to ship something visible *now* never let up. Fixing the schema first delayed delivery by weeks, and every feature built afterward was reliable from day one. But to anyone watching only a velocity chart during those weeks, that work read as slow.

---

## 6. AI, the Accomplice Who Also Understands Nothing

Now add the newest twist: people accepting whatever a machine hands them, without the full judgment to know if it's right.

The tool doesn't remove the need for judgment. It removes the **visibility** that judgment was ever needed. It produces something that *looks* finished, and for someone who doesn't understand the work, "looks finished" and "is finished" are indistinguishable.

So the pressure mutates. It's no longer just *"do it faster."* It becomes *"the machine basically did it already. Why are you slow?"* The person who understands nothing now has an accomplice that also understands nothing but produces at a speed you can't match.

The easy version of this argument is wrong, so it's worth being careful. The tools genuinely raised the floor. Parts of this job that used to be slow simply aren't anymore, and pretending otherwise is just the mirror image of your boss's mistake. The problem isn't that the tools are powerful. It's that the **power is visible and the judgment to wield it isn't**, so the promise always runs ahead of the reality, and you're left running behind the promise.

---

## 7. The Cruel Irony: We Built the Tools

Developers built the digital-Taylorism machinery now applied to almost everyone else: the delivery rider tracked by the second, the warehouse picker measured against an algorithm, the call-center agent chained to a script, the platform driver routed by software that treats him as interchangeable. We wrote that. The metrics, the tracking, the route optimization, the dashboards: that's our work.

And the same logic is now turning back on us. Tickets, points, velocity, surveillance dressed up as a standup. The people who got fastest at decomposing *other* people's work into measurable steps are discovering, a little late, that it works just as well on their own.

> **We built the stopwatch for everyone else's work. We shouldn't be surprised it's now pointed at ours.**

---

## 8. Invisible, Not Unnecessary

The danger isn't that our work can be automated or sped up. It's that it's becoming easier to *appear* to have done it well, and harder for anyone with power to notice the difference.

The craft isn't becoming unnecessary. It's becoming **invisible to the people who decide about it**. And that, which sounds almost the same, is far worse.

Think about what actually holds a system up. The clean schema. The architecture that absorbs the next change without collapsing. The edge case you handled before anyone hit it. The incident that never happened because you spent two days setting up a dev environment instead of connecting straight to production. None of that appears on a dashboard. The better you do it, the less anyone notices, because nothing breaks. You are punished, in attention and credit, in exact proportion to how well you prevented the disaster.

> **An unnecessary job gets killed quickly. An invisible job gets squeezed slowly.**

---

## 9. Working Against the Grain

Diagnosis doesn't fix Monday morning. So what actually helps? A handful of practices, most of them learned the hard way on real projects, that push back against the grain.

### Make the invisible visible

The value of foundation work does not speak for itself. It can't, because nothing breaking is not an event. So narrate it. *"Those two days on the dev environment prevented more incidents than any feature shipped this quarter."* Put the prevented fire on the record **before** it would have happened. If the only legible signal is speed, you have to manufacture legibility for everything else.

### Earn trust through consistency, not promises

You cannot out-promise a boss who promises blindly. He'll always promise more, because promises cost him nothing. What you *can* do is out-last him by being the one whose work sticks. With one client who'd already lost faith, I made no big promises. I just fixed things one at a time and made sure each fix held. After the first month the tone changed. By month three, frustration had turned into genuine enthusiasm. That wasn't a gesture; it was reliability, repeated.

### Translate, don't just obey

A request to "close this ticket" or "just add a button" is almost never the real need. One client asked me to "digitize the forms"; what they actually needed was to *eliminate manual data entry entirely.* Another couldn't explain the logic of their own shift spreadsheet. When I dug into it, it turned out to be a coordination system with three different entity types tangled into one grid. The real job was never closing tickets. It's understanding the thing nobody else in the room understands. That's the part no metric can score and no machine can do, and it's worth protecting fiercely.

### Protect the foundation, even under pressure

Refuse to build on broken ground. Schema first, features second. It will make you look slow for a stretch, and it will also make everything that comes after it actually work. That's a trade worth making every single time.

### Guard your judgment as the scarce resource

When tools can produce plausible output instantly, the one thing that stays scarce is the criterion to know whether the output is right. That is precisely the wrong thing to automate away in yourself. In a market drowning in things that *look* done, the ability to tell done from done-looking is quietly becoming the whole job.

---

## Final Thoughts

Not every organization works this way. Some treat metrics as signals rather than targets, some managers take technical uncertainty seriously, some design technical autonomy into the org itself. That those places exist proves the point: this is a default, not a law of nature, and wherever nobody actively pushes back, the work drifts toward whatever the dashboard can see.

None of this is a small frustration. A careful fix gets less recognition than a flashy demo. Work gets measured against a number that captures none of it. "Slow" gets used for what is really just careful.

But the forces themselves aren't going anywhere, and they aren't anyone's to control: Taylor's stopwatch became a dashboard, the dashboard got an AI accomplice, and the pressure to *look* fast is structural. What remains in your control is whether the work you ship actually holds. And in a world flooded with things that merely *look* finished, work that *is* finished is becoming rare. Rare is valuable, even when it's invisible. Especially then.

The craft isn't dying. It's just getting harder to see. The job is to keep doing it well anyway, and wherever possible, to drag it back into view of the people who decide.

> 🛠️ The work that holds everything up is the work nobody sees. Do it anyway.
