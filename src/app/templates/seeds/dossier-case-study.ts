export const dossierCaseStudySeed = `::slide{layout=cover}
# How Northwind cut onboarding from 11 days to 38 minutes.

::lead
A six-week engagement with the Northwind operations team. Replatformed activation, rebuilt the data pipeline, shipped self-serve. Q3 2025.
::

::slide{layout=section}
## 01 / Challenge

::slide
## The setup

Northwind's enterprise activation flow was a sales-led, manual handoff between three teams. Friction compounded across every step: legal review, environment provisioning, identity wiring.

::columns{count=2}
**Symptoms**

- Median time-to-first-value: 11 days
- 34% of paid pilots stalled at provisioning
- Six full-time CS engineers running deploys

:::

**Stakes**

- $4.2M ARR locked behind onboarding
- Renewal at risk for 23 named accounts
- Sales cycle 2.4x industry benchmark

::

::slide
## 02 / Approach

::columns{count=2}
**Diagnose**

We sat in on twelve activation calls. Mapped every clickpath, every ticket, every Slack thread. Cataloged the 47 manual steps that should have been one.

:::

**Rebuild**

A new self-serve flow, an opinionated default tenant, and a quiet event bus that replaced the spreadsheet. Shipped in twin tracks behind one feature flag.
::

::slide
## Results, after six weeks.

::stats
::stat{value="38m" label="Median time-to-value" delta="from 11 days" trend=down}
::stat{value="91%" label="Self-serve completion" delta="+57 pts" trend=up}
::stat{value="$1.4M" label="Expansion in Q4" delta="vs $0 prior" trend=up}
::

::slide
## What the team said

::quote.big
> They didn't redesign our onboarding. They removed the parts of it that shouldn't have existed.
> — Priya Vasquez, VP Operations, Northwind
::

::slide
## Where it goes next

A second engagement begins in February: porting the same pattern to the partner channel and to the regulated-industry tenant. Same flag, different defaults.
`;
