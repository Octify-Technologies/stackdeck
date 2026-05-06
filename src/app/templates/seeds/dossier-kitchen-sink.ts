/**
 * A complete walkthrough of every directive supported by the parser, dressed
 * as a client case study. Use it to iterate on the Dossier preset and to spot
 * any directive that doesn't render cleanly under a given style.
 */
export const dossierKitchenSinkSeed = `::slide{layout=cover}
# How Northwind cut onboarding from 11 days to 38 minutes.

::lead
A six-week engagement with the Northwind operations team. Replatformed activation, rebuilt the data pipeline, shipped self-serve. Q3 2025.
::

::caption
Prepared by Octify for Northwind executive review.
::

::slide
::scope-strip{industry="B2B SaaS" region="North America" timeframe="Q3 2025"}
::

::slide
## Engagement at a glance

::tear-sheet{client="Northwind Logistics" engagement="Six-week activation rebuild" outcome="38m median time-to-value" date="Sep–Oct 2025"}
::

::slide
## Agenda

::agenda
1. The setup, and why it was breaking
2. Our approach, two tracks behind one flag
3. What changed, in numbers
4. What the team said
5. What ships next
::

::slide{layout=section}
## 01 / Challenge

::slide
::problem
Activation was a sales-led, manual handoff between three teams. Friction compounded across every step: legal review, environment provisioning, identity wiring, and a 47-line spreadsheet that nobody owned.
::

::slide
::big-number{value="11 days" label="Median time-to-first-value, before" delta="34% of pilots stalled" trend=down source="Internal CRM, 2024 cohort"}
::

::slide
## Before vs. after, six weeks in

::before-after
**Before**

- 47 manual steps owned by three teams
- 6 FTE CS engineers running deploys
- 11-day median TTV, 34% stall rate

:::

**After**

- One self-serve flow, default tenant
- Zero CS deploy work for the new path
- 38-minute median TTV, 91% completion
::

::slide{layout=section}
## 02 / Approach

::slide
::approach
Two parallel tracks behind a single feature flag. Track A rebuilt the activation flow as a self-serve product. Track B replaced the spreadsheet with an opinionated event bus. Both shipped to a five-account pilot in week four.
::

::slide
## Process, four phases

::process-steps
1. Discover :: Twelve activation calls, every clickpath mapped, the full ticket archive read.
2. Diagnose :: Cataloged the 47 manual steps that should have been one. Killed twelve outright.
3. Rebuild :: Self-serve flow, opinionated default tenant, quiet event bus, all behind one flag.
4. Roll out :: Five-account pilot, then a quiet GA across the fifty largest tenants.
::

::slide
## Timeline

::timeline
- Week 1: Discovery interviews, current-state map
- Week 2: Architecture spike, data model rewrite
- Week 3: Self-serve flow MVP, internal demo
- Week 4: Five-account pilot, telemetry baseline
- Week 5: GA cutover, fifty tenants migrated
- Week 6: Handoff, runbooks, retro
::

::slide
## What we shipped

::deliverables
#### Product
- Self-serve activation flow
- Default tenant template
- In-app environment health check

#### Platform
- Event bus replacing the spreadsheet
- Identity wiring as one provider
- Telemetry for every step

#### Enablement
- Runbooks for CS and on-call
- Migration guide for the fifty largest tenants
- Two recorded sessions for the field
::

::slide{layout=section}
## 03 / Results

::slide
## Headline numbers

::stats
::stat{value="38m" label="Median time-to-value" delta="from 11 days" trend=down}
::stat{value="91%" label="Self-serve completion" delta="+57 pts" trend=up}
::stat{value="$1.4M" label="Q4 expansion" delta="vs $0 prior" trend=up}
::stat{value="0" label="CS deploy hours" delta="from 240/wk" trend=down}
::

::slide
## Quarter-over-quarter movement

::kpi-grid{source="Northwind product analytics, Nov 2025"}
::stat{value="2.4x" label="Activation throughput" trend=up}
::stat{value="-72%" label="Support tickets in week one" trend=down}
::stat{value="+14 pts" label="NPS, new cohort" trend=up}
::stat{value="6 → 0" label="FTE on activation deploys" trend=down}
::stat{value="23" label="Renewals unblocked" trend=up}
::stat{value="$4.2M" label="ARR de-risked" trend=up}
::

::slide
## Activation completion by week

::chart{kind=bar title="Activation completion rate" format=percent suffix="%"}
Week 1: 34
Week 2: 41
Week 3: 58
Week 4: 76
Week 5: 88
Week 6: 91
::

::slide
## Time-to-value, daily median

::chart{kind=line title="Median TTV, days" format=number}
Day 1: 11
Day 7: 9.4
Day 14: 6.2
Day 21: 3.1
Day 28: 1.4
Day 35: 0.6
Day 42: 0.026
::

::slide
## Where activation work went

::chart{kind=donut title="Engineering hours by category, post-launch" format=percent suffix="%"}
Self-serve product: 62
Event bus: 21
Telemetry: 11
Runbooks and docs: 6
::

::slide
## Cohort table

::table{emphasize=3}
| Cohort | Pilots | Completion | Median TTV | Stall rate |
| ------ | ------ | ---------- | ---------- | ---------- |
| Q1 2025 | 38 | 41% | 11d | 34% |
| Q2 2025 | 44 | 52% | 8d | 28% |
| Q3 2025 | 51 | 91% | 38m | 4% |
| Q4 2025 (proj) | 60 | 94% | 30m | 3% |
::

::slide{layout=section}
## 04 / Voices

::slide
::testimonial{name="Priya Vásquez" role="VP Operations" company="Northwind Logistics"}
> They didn't redesign our onboarding. They removed the parts of it that shouldn't have existed.
::
::

::slide
::quote.big
> The first paid pilot finished in 38 minutes. We thought the dashboard was broken.
> — Marcus Cole, Director of Customer Success, Northwind
::

::slide
::pull-quote
> The handoff document is two pages. The old one was forty.
> — Dani Park, Engineering Lead
::

::slide{layout=section}
## 05 / Visuals

::slide
## Plain image

::image{src="https://picsum.photos/seed/northwind-1/1200/700" alt="Operations control room" caption="Northwind operations control room, Toronto."}

::slide
## Asset frame

::asset-frame{src="https://picsum.photos/seed/northwind-2/1200/700" alt="Activation dashboard" caption="The new activation dashboard, week six."}
::

::slide
## Annotated image

::annotated-image{src="https://picsum.photos/seed/northwind-3/1400/800" alt="Activation flow"}
- (18%, 22%) Identity wiring, single provider
- (52%, 38%) Default tenant template
- (78%, 64%) Event bus replaces the spreadsheet
::

::slide{layout=section}
## 06 / Building blocks

::slide
# H1, the headline of headlines.

## H2, a strong section title.

### H3, a card title.

#### H4, a label.

A standard paragraph sets the body baseline. **Bold** and *italic* and \`inline code\` should all read clean.

::lead
Lead paragraphs carry more weight, used for opening statements and pull-out summaries.
::

::caption
Captions sit smaller, set in the muted color, and pair with images and figures.
::

::slide
## Lists

**Unordered**

- One, with a clean bullet
- Two, with a slightly longer second line that should wrap nicely
- Three
  - Nested item A
  - Nested item B
    - Deeper still

**Ordered**

1. First, set the baseline
2. Second, run the experiment
3. Third, ship behind a flag

::slide
## Steps (ordered, styled)

::steps
1. Establish the baseline
2. Run the experiment for two weeks
3. Decide on the flag, then ship the cutover
4. Retro and write the runbook
::

::slide
## Code

\`\`\`ts
type Activation = {
  tenantId: string;
  startedAt: Date;
  completedAt?: Date;
  source: 'self-serve' | 'sales-led';
};

export function timeToValue(a: Activation): number | null {
  if (!a.completedAt) return null;
  return a.completedAt.getTime() - a.startedAt.getTime();
}
\`\`\`

::slide
## Blockquote

> The fastest way to onboard a customer is to delete the steps that shouldn't exist in the first place.
> — Priya Vásquez, VP Operations

::slide
## Callouts, all four tones

::callout{tone=info}
**Info.** This is the neutral informational tone. Use for context, references, footnotes.
::

::callout{tone=success}
**Success.** Use for wins, completed milestones, and positive deltas.
::

::callout{tone=warn}
**Warning.** Use for risks, blockers, and the things to watch.
::

::callout{tone=neutral}
**Neutral.** A quiet box for asides that don't need a tone signal.
::

::slide
## Boxes (no auto-tone heading)

::box{tone=info}
A boxed paragraph, info tone. Sits inline like a callout but without the auto-styled label.
::

::box{tone=success}
A boxed paragraph, success tone.
::

::box{tone=warn}
A boxed paragraph, warn tone.
::

::box
A neutral box, no tone. The default container for any content that should sit inside a card.
::

::slide
## Two columns

::columns{count=2}
**Left**

A two-column layout splits the slide cleanly down the middle. Use it for compare-and-contrast, before-and-after narratives, or feature pairs.

:::

**Right**

The right column carries the second half. Each column accepts the full block vocabulary, including lists, callouts, and inline images.
::

::slide
## Three columns

::columns{count=3}
**One**

The three-column layout works well for principles, values, or top-line bullets that share weight.

:::

**Two**

Each column should be roughly the same length, and the headers should read parallel.

:::

**Three**

Keep body text tight in three-up; the measure narrows fast as the count grows.
::

::slide
## Compare

::compare
**Hand-wired (before)**

- 47 manual steps
- 3 teams in the loop
- 11-day median TTV

:::

**Self-serve (after)**

- One flow, one tenant template
- Zero CS handoff
- 38-minute median TTV
::

::slide
## Grid with custom cells

::grid{cols=4 rows=2}
::cell{span=2 row=2}
**Hero cell**, two columns wide and two rows tall. Use for the headline result of a quarter, the lead photograph of a case study, or a primary KPI block.
::

::cell{span=2}
A two-column cell. Useful for medium-weight callouts.
::

::cell
Single cell.
::

::cell
Single cell.
::

::cell{span=2}
A second two-column cell sitting on the bottom row.
::
::

::slide
## Logo strip

::logo-strip{logos="Acme, Globex, Initech, Soylent, Umbrella, Cyberdyne, Pied Piper, Hooli"}
::

::slide{layout=section}
## 07 / Closing

::slide
## What ships next

A second engagement begins in February: porting the same pattern to the partner channel and the regulated-industry tenant. Same flag, different defaults.

::callout{tone=success}
**Locked in.** Statement of work signed Nov 12, 2025. Kickoff Feb 3, 2026.
::

::slide
::contact{name="Ankur Sharma" role="Partner, Octify" email="ankur@octify.com" phone="+1 (415) 555-0117" url="octify.com/case-studies/northwind"}
::

::slide{layout=cover}
# Thank you.

::lead
Questions, comments, or a workshop on your own activation flow: reach out anytime.
::
`;
