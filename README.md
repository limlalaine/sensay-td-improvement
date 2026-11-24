# Sensay Teacher Platform — Admin Portal, Class & Lesson Overview redesign

Clickable mockup of the redesigned teacher reporting screens. Open `index.html` in a browser, or view it on GitHub Pages once Pages is turned on for this repo (Settings → Pages → Deploy from branch: `main`, folder `/root`).

| File | Screen |
|---|---|
| `portal.html` | **Admin portal** — one user with every role (owner · admin · teacher). Sidebar switches between Dashboard, Overview, Teachers, Students, Rosters, Classes and Plan & billing |
| `index.html` | **Class Overview** — every student × every exercise, grouped by lesson |
| `lesson.html` | **Lesson Overview** — one lesson's exercises, attempts, Text Analyzer and score adjustment |
| `dc-lite.js` | Tiny template renderer used by both pages (mockup only, not production code) |

All data is sample data. Nothing is saved; refreshing resets the page.

## Admin portal (`portal.html`)

All three pages share one header and sidebar, styled with the Sensay design system.

**Sidebar**
- **My Teaching** (every teacher): Dashboard · My Classes · All Recordings · Practice Packs
- **Organization Management** (admins and owners): Overview · Teachers · Students · Rosters · Classes · Plan & billing (owners only)
- **Help & Support**: Tutorial Videos · Help Desk · Contact Sensay
- Avatar menu is personal only: My profile · Sign out

**Screens**
- **Dashboard** — the teacher's own classes: students who recorded, recordings, needs attention (remind, review, resend), My classes table.
- **Overview** — the old Overview and Reports merged: *At a glance* (subscription, teacher and student limits, active students this month, inactive/archived, total recordings), one period selector, four metrics, Needs attention, recordings per week, usage by teacher, student activation. Export CSV.
- **Teachers** — grouped Pending invitations / Joined; student-account permission (Can edit / View only) is set in the table, with a default for new teachers. Replaces the old Settings tab.
- **Students** — grouped Pending invitations / Joined · not in a class / Joined · in a class; filters, sort, import, export.
- **Rosters** — saved lists of students, newest first; empty rosters greyed out.
- **Classes** — empty classes tagged "No students"; Add students per row, other actions in ⋯.
- **Plan & billing** — credits: balance, this month's usage, next expiration, estimated unused credits, monthly usage, credits by top-up.

**Responsive layout**
- 1024px and wider: sidebar always visible (240px).
- Under 1024px: sidebar hides behind a ☰ menu button in the header and slides in as a drawer. Close it with "Close", by tapping outside, or by choosing a page.
- Under 720px: header search hides, page padding tightens, summary cards stack, and wide tables and charts scroll sideways inside their card.
- For developers: the mockup toggles the drawer with a hidden checkbox. In production use a real `<button aria-expanded>` that moves focus into the drawer and closes on Esc.

**Definitions**
| Term | Meaning |
|---|---|
| Joined | Accepted the invite and has an account |
| Pending / Invited | Invited, not joined yet |
| Active student | Submitted at least one recording this month (1 credit). Shown to admins and owners only |
| Students who recorded | Submitted at least one recording in the selected period |
| Teachers with recordings | Students in their classes recorded in the selected period |

## Hierarchy

**Class › Lesson › Exercise.** On the Class Overview, the grouped column headings (e.g. *Goldilocks & the Three Bears*) are **lessons**, and the columns under them (Part 1, Part 2…) are **exercises**. Students can make multiple **attempts** per exercise.

## Class Overview (`index.html`)

- **Columns:** No. · Student · Completion · Overall score, then exercise scores grouped by lesson. Student columns stay fixed when scrolling sideways.
- **Class average row** at the top of the table — averages only include students who started.
- **Collapsible lessons:** "Show less" turns a lesson into one *Lesson score* column (avg. of its exercises) with "x/5 completed" underneath.
- **Needs attention** (summary card + "All students / Needs attention" switch): completion under 50%, overall score under 70, or any exercise under 60. Each flagged student shows the reason.
- **Sorting** on No., Student, Completion, Overall score. **Search** by name.
- **Navigation:** clicking a lesson name **or any score** opens that lesson's Lesson Overview.
- Summary cards: Class average · Needs attention · Teacher-adjusted scores.

## Lesson Overview (`lesson.html`)

- **Navigation:** pages sit inside the portal header and sidebar (My Classes highlighted). Breadcrumb `My Classes › [Class] › Lessons › [Lesson]` shows where the page lives. A separate **← Back to Class Overview** button appears only when the teacher came from the Class Overview, and should restore their filters, sort, collapsed lessons and scroll position.
- **Results by exercise** table: students × exercises. Switches for **All students / Missing exercises** and **Best score / Attempts**.
- Class average row shows each exercise's average and **"x not done"**.
- **Hardest** tag on an exercise header only when its class average is **under 70**.
- **Lesson score is not editable.** It is the average of the exercises the student has started, using the teacher's score where one is set.

### Exercise panel (click any exercise score)

1. Exercise score and source (AI best of N attempts, or teacher score).
2. **Check this score** warning when an attempt looks like a recording problem.
3. **All attempts** list — tagged *Best*, *Lowest*, *Check audio*. Capped at ~5 rows, then scrolls.
4. **Text Analyzer** for the selected attempt — word results (correct / mispronounced / not read), waveform, Play, click a word for details.
5. **Adjust this exercise score** → Save teacher score · Revert to AI score · Change history.

While the panel is open the table compacts (smaller cells, sub-lines hidden) so both fit on smaller screens.

## Rules to confirm with the team

| Rule | Current mockup value |
|---|---|
| Score colours | Green **70+**, Yellow **60–69**, Red **below 60** (3 colours only) |
| Overall score text colour | Default 70+, amber 60–69, red below 60 |
| Teacher overrides | **Exercise level only.** Lesson and overall scores recalculate from exercise scores. Adjusted exercises get a purple outline; the AI score is shown crossed out. |
| "Check audio" flag | An attempt scores **under 20**, or **40+ points below** that exercise's best. Flag clears once a teacher adjusts the score. |
| Lesson score | Simple average of started exercises (confirm whether exercises are weighted) |
| Overall score | Simple average of the student's started exercises |
| Completion | Share of exercises fully completed |
| Needs attention | Completion < 50%, overall < 70, or any exercise < 60 |

## Placeholders to replace

- `[Class name]`, `[Teacher name]`, `[date]`, `[exercise type]`, `[0:00]` durations
- `[Pronunciation details for this word]` in the Text Analyzer word detail
- Sample passage "Goldilocks went for a walk in the forest…", waveforms, attempt scores and word results are generated from sample data
- All lesson names link to the same sample Lesson Overview (Goldilocks)

## For developers

- Clicking a score on the Class Overview should open the Lesson Overview **with that student's exercise preselected** in the panel (the mockup can't pass this between pages).
- Returning via "Back to Class Overview" should restore the teacher's previous view state.
- Accessibility: score cells have text labels for screen readers; colour is never the only signal (outline, underline/strikethrough, icons, text).
- Brand: Sensay teal `#00A094` for actions, secondary blue `#4357AD` for teacher-adjusted, Lato headings, Noto Sans / Noto Sans TC body.
