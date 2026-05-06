export const CASE_STUDY_PRO_MARKDOWN = `---
title: How Northwind cut deploy time from 12 minutes to 90 seconds
footer: Northwind × stackdeck · Confidential · Q2 2026
---

::cover
# Northwind ships ten times a day.

A 9-week engagement that turned a brittle release pipeline into a competitive advantage.
::

::slide

::scope-strip{industry="B2B SaaS, logistics" region="North America" timeframe="9 weeks, Q2 2026"}
::

::slide

::big-number{value="92%" label="Reduction in time-to-deploy" delta="11min" trend="down" source="Northwind internal CI metrics, 2026"}
::

::slide

::section
# The brief.
::

::slide

::problem
A 12-minute pipeline ran on every push, failed 8% of runs, and turned every release into a small ceremony. Engineers were batching changes to avoid the wait, which made each merge bigger and riskier than the last.
::

::slide

::approach
We re-architected the pipeline around three ideas: parallel test sharding, layer-aware Docker caching, and a lightweight gatekeeper that blocks only on what actually broke. We left the unit-test contract alone so the team did not have to relearn anything.
::

::slide

::section
# What changed.
::

::slide

::kpi-grid{source="Pipeline observability, weekly avg over the last 4 weeks of engagement"}
::stat{value="90s" label="Median pipeline" delta="-11m" trend="down"}
::stat{value="0.4%" label="Failure rate" delta="-7.6pp" trend="down"}
::stat{value="14x" label="Releases per week" delta="+12.6" trend="up"}
::stat{value="$1.8M" label="Recovered eng time / yr" delta="+$1.8M" trend="up"}
::

::slide

::before-after
**Before**

A single linear job. 12 minutes. 8% failure rate. Engineers waited, batched, pushed bigger PRs. Friday afternoon deploys felt like a coin flip.

:::

**After**

Sharded jobs run in parallel with smart caching. 90 seconds median. 0.4% failure. Engineers ship as they finish, multiple times a day, without thinking about it.
::

::slide

::testimonial{name="Priya Mehta" role="VP Engineering" company="Northwind"}
> Stackdeck took the part of our day we hated and made it disappear. Our team's mood is different. Our release calendar is different. The product moves faster.
::

::slide

::pull-quote
> The pipeline used to be the meeting. Now nobody mentions it.
> -- Engineering all-hands, week 9
::

::slide

::tear-sheet{client="Northwind Logistics" engagement="Pipeline overhaul" outcome="92% faster deploys, 14x release frequency" date="Q2 2026"}
::

::slide

::section
# What's next.
::

::slide

::contact{name="Riley Chen" role="Principal, stackdeck" email="riley@stackdeck.studio" phone="+1 415 555 0188" url="stackdeck.studio"}
::
`;
