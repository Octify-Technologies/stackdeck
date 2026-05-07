/**
 * The Dossier preset's curated demo. A 14-slide case study, written as a
 * real Octify deliverable — not a generic template. Every slide carries a
 * specific finding, a specific number, a specific voice. The design above
 * is locked; only the words below change per engagement.
 */
export const DOSSIER_CASE_STUDY_SEED = `---
title: "Halden Industries, Pipeline Rebuild Nº 014"
footer: "May 2026"
brand:
  name: "Halden Industries"
theme:
  presetId: dossier
  paletteId: dossier
  fontId: fraunces
---

::cover
# We rebuilt Halden's outbound funnel in twelve weeks.
::lead
A field study in narrowing the ICP from forty thousand records to four hundred, rewriting the first three touches, and recovering forty percent of dormant pipeline without adding a single seat.
::
::

::slide
::tear-sheet{client="Halden Industries" industry="Industrial logistics, North America" engagement="Outbound funnel rebuild" duration="12 weeks (Jan 13 — Apr 4, 2026)" team="3 strategists, 1 designer, 1 ops engineer" date="Filed May 6, 2026"}
::lead
Twelve weeks. Tripled qualified pipeline against a flat headcount. Eighty-one percent of outbound now lands inside the stated ICP, up from nineteen.
::

1. The funnel was running three competing plays in parallel and committing to none.
2. Eighty-one percent of outbound was leaving the ICP entirely.
3. The CRM held forty-two thousand stale records masking a real audience of four hundred.
4. The dashboard tracked activity, not outcomes.
::

::slide
::section
# The diagnosis
::

::slide
## What we found in the first two weeks
The team was running three plays in parallel and committing to none of them. Reps had thirty-two saved sequences and no documented owner. The dashboard tracked dials and emails, not meetings, and certainly not pipeline. Every leader we interviewed had a different answer to the question of who the ideal customer was.

- Eighty-one percent of outbound was sent to companies outside the stated ICP.
- The first-touch reply rate had decayed sixty-one percent over four quarters.
- The CRM held forty-two thousand records flagged "no contact in 12+ months", obscuring a real addressable list of about four hundred accounts.
- No single owner held the playbook; every rep had quietly forked it.

::slide
::stat{value="$3.4M" label="Net new pipeline / Q1 2026" delta="+212%"}
Sustained over eight consecutive weeks, with no headcount growth.

::caption
DEFINITION: Pipeline value created by accounts not previously in our outbound list.
::

::caption
METHOD: HubSpot weighted forecast, weekly snapshot, audited by Octify ops.
::

::caption
SOURCE: HubSpot, May 6 2026
::

::slide
::section
# The intervention
::

::slide
::kpi-grid{source="HubSpot, week of May 6 2026"}
::stat{value="38%" label="Reply rate, first touch" delta="+18 pts"}
::stat{value="14%" label="Meeting set rate" delta="+9 pts"}
::stat{value="2.1x" label="Pipeline velocity" delta="+1.3x"}
::stat{value="$87" label="Cost per qualified meeting" delta="-62%"}
::stat{value="6 wk" label="Average sales cycle" delta="-3 wk"}
::stat{value="91%" label="ICP match on opens" delta="+44 pts"}
::

::slide
::pull-quote
> The team finally feels like they're hunting in the right woods. Conversations are sharper, the meetings convert, and the pipeline reflects it. We didn't add a single seat.
> -- Anya Halden, Founder & CEO, Halden Industries
::

::slide
::section
# The transformation
::

::slide
::before-after
::box{tone=warn}
::stat{value="9%"}
### Reply rate, first touch
A generic value-prop email shipped to anyone with the title "VP". No segmentation. Same body to logistics directors and IT buyers alike.
::
:::
::box{tone=success}
::stat{value="38%"}
### Reply rate, first touch
A point-of-view note tied to a quarterly initiative the prospect had publicly named. Three openers, one ICP, one ask.
::
::

::slide
::chart{kind=bar title="Qualified meetings, weekly" prefix="" suffix=""}
W1: 4
W2: 6
W3: 9
W4: 11
W5: 14
W6: 17
W7: 19
W8: 22
::
What changed in week three was not the volume; it was who we were sending to. We cut send volume by forty-eight percent and held the new send rate steady through week eight.

::caption
SOURCE: Internal CRM, May 6 2026
::

::slide
::section
# What we kept, what we cut
::

::slide
## The shape of the new playbook
We left Halden with a single, owned playbook: one ICP definition, three opener variants, one mid-funnel sequence, one cold-revival flow. The ops engineer documented every field, every status, every handoff. The thirty-two old sequences were archived.

- One ICP, written in a single paragraph, signed off by the CEO.
- Three opener variants, A/B-tested weekly by the ops engineer.
- One mid-funnel sequence, owned by the senior AE.
- One cold-revival flow, run quarterly against the dormant list.
- A weekly outcome review, not an activity review.

::slide
::cover
# Thank you.
::lead
Filed in confidence. The pages above are an account of one engagement at one moment in one company. Nothing here generalises without context, but the discipline behind it does.
::

::columns{count=3}
Anya Halden, Founder & CEO
:::
hello@halden.industries
:::
+1 415 555 0144
::
::
`;
