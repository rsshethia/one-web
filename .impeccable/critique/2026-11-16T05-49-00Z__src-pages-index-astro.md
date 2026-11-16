---
target: the web app
total_score: 19
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 2
target_identity: "file:C:\\Users\\Rushabh\\Downloads\\AI\\16NOV\\web-split\\src\\pages\\index.astro"
target_fingerprint: "sha256:a55c7b31dcf572d7ec24d5c5f26d19d93fb1d0289b89618dfd9c98f6af8b7fff"
target_path: "C:\\Users\\Rushabh\\Downloads\\AI\\16NOV\\web-split\\src\\pages\\index.astro"
timestamp: 2026-11-16T05-49-00Z
slug: src-pages-index-astro
---
Method: dual-agent attempted; see header note in delivered report for provenance.

# Critique — Victoria Council Jobs web app (web-split src/pages/index.astro + App island)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | No loading/progress for map + geo fetch; snapshot date shown but staleness unclear in-context |
| 2 | Match System / Real World | 2 | "click water to reset", "snapshot", "empty boards / under review" leak pipeline jargon |
| 3 | User Control and Freedom | 2 | Reset is undiscoverable water-click; no clear-search, no Esc/undo |
| 4 | Consistency and Standards | 2 | Ad-hoc inline radii/colors; tabs lack tablist/aria-selected semantics |
| 5 | Error Prevention | 2 | Token/403/geo fallbacks exist, but 79-item dropdown + free-text search have no constraints/suggestions |
| 6 | Recognition Rather Than Recall | 2 | No on-map legend; 79 councils in plain select; no recents/autocomplete |
| 7 | Flexibility and Efficiency | 1 | No shortcuts, no deep links, no saved/bulk; substring search only |
| 8 | Aesthetic and Minimalist Design | 2 | Unbounded 500-row list; analytics 4-col crush; competing visual weights |
| 9 | Error Recovery | 2 | Map errors messaged but no retry; empty search shows "0 roles" with no guidance |
| 10 | Help and Documentation | 2 | About FAQ strong but not contextual; legend/search help missing at point of need |
| **Total** | | **19/40** | **Poor** |

## Design Specificity Verdict

**LLM assessment:** Coherent as a functional prototype, but category-interchangeable. Tab bar + split pane + KPI bento + FAQ accordions could belong to any dataset dashboard. Visual language is default system font, generic green/blue, inline-style cards — no Victorian civic character, no place identity, no hiring-urgency voice. Structural sameness is high: Map/List/Analytics/About is a standard data-browser IA with no authored point of view. Missed product character: trust in public listings, suburb-to-council mapping, "where is hiring near me" as hero story, honest-staleness as a designed signal rather than parenthetical text.

**Deterministic scan:** `impeccable detect --json src` returned `[]` — 0 findings, exit 0. No rule violations to confirm or rebut; the prototype's risks (semantics, mobile layout, color-only encoding) sit below what the mechanical detector checks. No additional issues caught; no false positives to flag.

**Visual overlays:** No browser overlay available. No automation/injection tool is exposed in this context, so live-server + `detect.js` injection was skipped. Fallback signal is manual static evidence cited file:line throughout (unlabeled inputs, color-only choropleth, 55/45 split with no mobile stacking, 4-col analytics grid).

## Overall Impression

Works as an honest internal tool; does not yet feel like a public job-seeker product. Data plumbing (shared selected-council state, fallbacks, honest FAQ) is the strongest part. The single biggest opportunity: make Map the hero on desktop AND survivable on mobile, with legend + keyboard + List handoff designed as one flow instead of three tabs.

## What's Working

1. **Shared selected-council state across Map/List.** `App.tsx` lifts `selected` so map click filters List and "open in List" preserves context. This is the core task flow done right — no memory bridge between tabs.
2. **Honest About FAQ.** `About.tsx` answers provenance, freshness limits, Victoria-only scope, non-affiliation, and reporting path in plain language. Rare for a v1 to state what it can't promise; builds trust.
3. **Graceful map failure modes.** Missing-token fallback, CDN-timeout message, 403 URL-restriction banner, and geo-missing error all keep the List usable. `Map.tsx:36-45,97-112` degrades instead of blanking.

## Priority Issues

- **[P0] What:** Mobile layout breaks on the two most important surfaces.
  **Why it matters:** Direction explicitly requires stacked map/list before new features; current `App.tsx:47-48` 55%/45% row + `Map.tsx:129` 420px min-height + `Analytics.tsx:54` 4-column grid force horizontal squeeze/crush on phones. `index.astro:17-19` only hides the nav title. Thumb-zone, readability, and map usability fail for Casey.
  **Fix:** Stack map (40-45vh) over panel on ≤760px; collapse analytics grid to 1-2 cols; make tabs scrollable; verify 44px targets.
  **Suggested command:** /impeccable adapt

- **[P1] What:** Map is mouse-only with color-only encoding and no on-map legend.
  **Why it matters:** Core surface excludes keyboard/SR users and color-blind users; sighted users must visit About FAQ to decode grey→green thresholds (`Map.tsx:72-74`). Click-water-to-reset is undiscoverable after selection.
  **Fix:** Add visible legend with counts/thresholds beside map; add council listbox alternative (keyboard-selectable); add explicit Reset button; ensure highlight has non-color cue.
  **Suggested command:** /impeccable harden

- **[P1] What:** Search + council filter don't scale to 79 councils / 493 jobs.
  **Why it matters:** `JobList.tsx:29-44` pairs free-text substring match with a 79-option native select, no typeahead, no recents, no sorting, unbounded 500-row dump. Empty query yields "0 roles shown" with no next step. Alex can't move fast; Jordan stalls on first action.
  **Fix:** Combobox with typeahead + recent councils; trim/dedupe search; explicit empty state with clear-filter action; cap + paginate or virtualize long lists.
  **Suggested command:** /impeccable layout

- **[P2] What:** System status and staleness trust gap.
  **Why it matters:** No loading/progress during Mapbox + geo fetch; snapshot date appears in List/Analytics headers but not beside hiring counts where decisions happen; "snapshot"/"scraped_at" wording is pipeline-internal. Users can't tell if zero means none or stale.
  **Fix:** Loading skeletons/progress; surface "updated X · next refresh Y" inline on Map panel + Analytics; rewrite staleness copy in user language with confirm-on-portal reminder at point of apply.
  **Suggested command:** /impeccable clarify

- **[P2] What:** Tab semantics, labels, and focus visibility missing.
  **Why it matters:** `App.tsx:33-37` buttons lack tablist/aria-selected; `JobList.tsx:29-44` input relies on placeholder and select has no label; no `:focus-visible` styles anywhere. Keyboard and SR users lose location and context.
  **Fix:** Real tab semantics + aria-selected + arrow-key nav; labeled search/select; visible focus rings; announce selection + result-count changes via aria-live.
  **Suggested command:** /impeccable audit

## Persona Red Flags

**Alex (Power User):** No keyboard path for map LGA pick; no shortcuts, no saved/recent councils, no deep links (`/council/[slug]` is future per NOTES). 79-option dropdown forces linear scroll. Substring-only search with no sort means re-typing for every variant ("planner" vs "planning"). Will abandon for direct council portals.

**Sam (Accessibility-Dependent):** Map canvas has no role/name and LGA fills are click-only (`Map.tsx:82-95`); highlight is outline-color change only. Search input has placeholder but no label; select unlabeled. No focus indicators in inline styles. Color-only choropleth with legend buried in About. Tab buttons convey active via background color alone (no aria-selected). Keyboard-only completion of the primary flow is impossible.

**Casey (Distracted Mobile):** Primary map + side-panel flow requires two-handed precision on a 55/45 split; no stacking. Analytics 4-col grid + 220px council-name column crush. Tab buttons ~32px tall, list links 10-12px padding — below 44px thumb target. No state-persistence note beyond in-memory `selected` (lost on reload); interruption mid-search loses context. Heavy 500-row list with no pagination on slow connections.

## Minor Observations

- External job links open new tabs without warning (only GitHub shows ↗); add "(opens council portal)" affordance.
- "open in List" underline button is good handoff but visually subordinate; promote to primary action in selected-council panel.
- Analytics "Most common title words" chips are charming but title-only (`Analytics.tsx:80-86`); consider stop-word pass for "officer/support/worker" dominance.
- `Analytics.tsx:100-102` review-note is honest; surface the same caveat on Map empty-council state, not just Analytics.
- Nav shows total roles but not council coverage ("79 councils · 493 roles · updated X") where it would reassure at a glance.

## Questions to Consider

- What if the map were the homepage hero with List as its drawer, not a tab among equals?
- Does "snapshot" language protect honesty, or would "updated 16 Nov — jobs close fast, confirm on council site" earn more trust?
- What would a confident thumb-first version do: big council search first, map second?
