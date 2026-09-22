---
title: "Judgment Debt: Shipping Faster Than We Learn"
seoTitle: "Judgment Debt: Shipping Faster Than We Learn"
description: "AI assistants took over the tedious hours of programming, and those hours were also where judgment got built. Notes on a gap that only shows when something breaks, on noticing my own plateau, and on why technical debt can only be repaid in judgment."
pubDate: "2026-09-22"
image: "../../assets/blog/judgment-debt.webp"
tags: ["essays", "ai"]
author: "Asier Ortiz"
draft: false
---

I started programming in 2019. For the first few years, most of what I learned came from being stuck: late nights with twenty Stack Overflow tabs and the official documentation open, chasing a bug that usually turned out to be one line. Nobody would design a training program that way. It was slow and often miserable, and almost everything I would now call judgment came out of it.

Those hours are mostly gone for me, and I suspect they are becoming rare for developers generally. I think we are underestimating what left with them.

---

## A gap that only shows when something breaks

At my last job, several colleagues had been at the company longer than I had, but had started learning to program around 2023, when ChatGPT was already part of the job. Day to day, nothing in the output told us apart. Features shipped at a similar pace and the code looked much the same.

The difference only surfaced when something that seemed to work quietly wasn't working. One case: an old service that collected readings from field sensors on a schedule. It had run for years without complaint, the logs filled up, nothing reported an error. Yet some sensors were months behind. The program had been written for a fraction of the devices it now served, and the loop that fetched their data could no longer get through all of them within a single cycle, so the sensors furthest behind kept getting skipped. No error log says that. You find it by asking a sensor directly, comparing its answer with what was stored, and then reading the code with that gap in mind. Problems of that kind landed on my desk more often than my seniority alone would suggest, and the reason had little to do with talent. It came down to when each of us had learned. They never chose the moment, and the debugging hours I had been forced to put in were simply never required of them.

One workplace is a small sample, but it matches the research. [Brynjolfsson, Li and Raymond](https://doi.org/10.1093/qje/qjae044) studied an AI assistant rolled out to over five thousand customer support agents. Productivity rose 15% on average, but the gains were concentrated among less experienced and lower-skilled workers, who improved in both speed and quality; the most experienced became slightly faster, but their quality declined slightly. From a manager's chair, that result says the tool closes the gap. From inside the team, it says the gap stops being visible in the output, right up until the output is wrong.

The evidence is not one-way, and it is worth saying so. The same study found evidence that agents learned from the assistant, retaining some of the gains when the assistant was unavailable. But learning to follow good suggestions is not the same as learning what to do when there are none.

---

## Living off savings

The uncomfortable part is that the same thing is now happening to me.

Over the last few months I have needed to get my hands dirty far less. The assistant writes the first version, I review it, and it mostly works. I haven't forgotten what I knew. What I notice is that I have stopped adding to it. The judgment I use to review generated code was built between 2019 and 2023 by a process I no longer go through, which means I am living off my savings.

There is at least some evidence that this can happen to experienced professionals, and that it can happen quickly. A 2025 observational study published in [*The Lancet Gastroenterology & Hepatology*](https://doi.org/10.1016/S2468-1253(25)00133-5) looked at four Polish endoscopy centers in the months after they introduced an AI that flags polyps. In the colonoscopies still done without it, the adenoma detection rate fell from 28.4% to 22.4%. These were practicing endoscopists, not trainees, and the exposure lasted three months. Lisanne Bainbridge described a related problem in 1983, in a short paper called [*Ironies of Automation*](https://doi.org/10.1016/0005-1098(83)90046-8): automate the routine work, leave the human to supervise, and the supervision comes to depend on skills the automation gives them fewer chances to practice.

---

## Two debts

My last employer's reasoning was common enough: shipping faster is better, and whatever fails can be fixed along the way. On its face that is reasonable. Technical debt is a legitimate tool, and plenty of good products were built on it.

But fixing things along the way assumes that someone can find what is wrong, in code that nobody on the team wrote by hand and perhaps nobody fully read. Technical debt ultimately gets repaid through judgment. A team that ships generated code faster than it understands it is taking on technical debt and, at the same time, weakening the process that produces the people able to repay it.

None of this shows up on a dashboard, for the reasons I went through in [the post on digital Taylorism](/blog/digital-taylorism-invisible-work/): speed is legible and judgment isn't. The bill arrives later, during an incident, when the question stops being how fast the team can produce code and becomes whether anyone in the room can read it.

---

## Paying it down

I use these tools every day and I wouldn't go back. The floor really did rise, and pretending otherwise would be nostalgia.

What changed is that learning used to be a side effect of the work and now it has to be a decision. For me that currently means a few habits: when something breaks, I debug it myself before I ask; I don't approve code I couldn't explain to someone else; and every so often I build something by hand that I could have generated. All of it is slower, and nobody is paying for the difference.

That is the part I don't see a way around. Few companies will fund it, because the return arrives long after the quarter closes, so for now the cost falls on each of us. It took me a few months to notice I had stopped paying it.
