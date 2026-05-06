export const SAMPLE_MARKDOWN = `---
title: Q4 Review
---

::cover
# A year of compounding.
The numbers, the lessons, and what comes next.
::

::slide

::section
# Where we landed.
::

::slide

# Highlights

- Revenue up **47%** year over year
- Twelve new markets opened
- NPS climbed to 71, the highest in company history
- Shipped 142 features and squashed 893 bugs

::slide

::stats
::stat{value="$3M" label="ARR" delta="+47%" trend="up"}
::stat{value="71" label="NPS" delta="+9" trend="up"}
::stat{value="12" label="Markets" delta="+5" trend="up"}
::

::slide

::chart{kind=bar title="Revenue by quarter"}
Q1: 480
Q2: 620
Q3: 780
Q4: 1120
::

::slide

::chart{kind=line title="Active customers"}
Jan: 1240
Feb: 1480
Mar: 1820
Apr: 2210
May: 2680
Jun: 3140
::

::slide

::chart{kind=donut title="Revenue mix"}
Product: 58
Services: 22
Licensing: 14
Other: 6
::

::slide

::table{emphasize=2}
| Plan | Seats | Price | Best for |
| Starter | 1 | $0 | Solo founders |
| Pro | 5 | $20 | Small teams |
| Team | 25 | $80 | Growing companies |
| Enterprise | unlimited | Contact us | Established orgs |
::

::slide

::section
# What we learned.
::

::slide

::compare
**Before**

The pipeline took twelve minutes and failed eight percent of runs.

:::

**After**

The new pipeline runs in two minutes with a 0.4% failure rate.
::

::slide

::callout{tone=info}
The biggest win this year was getting deploy frequency from weekly to hourly.
::

::slide

::quote.big
> The future is already here, it is just not evenly distributed.
> -- William Gibson
::

::slide

::cover
# Onward.
2027 is the year we ship the next platform.
::
`;
