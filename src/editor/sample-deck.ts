export const SAMPLE_MARKDOWN = `---
title: Q4 Review
---

::cover
# Q4 in review.
The year ARR crossed three million.
::

::slide

::section
# What we shipped.
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
