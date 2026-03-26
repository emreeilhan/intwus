0.0.01
- Created project changelog.
- Added `data/internships.db` and `data/internships.xlsx` to the repository.

0.0.02
- Added bulk selection and bulk status/priority/delete actions.
- Added saved views persistence in SQLite.
- Added per-entry activity timeline logging for create, edit, status, and follow-up changes.

0.0.03
- Added saved view action menu for apply, overwrite, rename, and delete.
- Upgraded activity timeline to show readable field-level diffs.

0.0.04
- Reduced cognitive load in the main workspace by flattening visual chrome and consolidating side context.
- Tightened copy and spacing for a calmer, more scannable operations view.

0.0.05
- Refactored the main workspace into a minimal focus view with only filters and the table visible by default.
- Reworked rows into a compact Linear-style surface with hover actions and a hidden details panel.
- Added keyboard shortcuts and a lightweight command palette for fast navigation and edits.

0.0.06
- Reworked the server and frontend flow to support a refreshed application experience.
- Updated the workbook-backed internship data and UI assets in the repository.

0.0.07
- Expanded the dashboard into a multi-chart analytics surface with trend, mix, geo spread, and follow-up risk views.
- Added richer visual hierarchy to make the dashboard more decision-oriented and easier to scan.

0.0.08
- Added full-site dark mode support with persisted theme preference and system-theme fallback.
- Updated overlays, surfaces, charts, and dashboard visuals to render cleanly in both light and dark themes.

0.0.09
- Added a denser analytics layer with donut, heatmap, momentum, lead-time, and stacked-flow charts.
- Made the dashboard better at answering different questions from the same internship dataset.

0.0.10
- Added a calendar heatmap to show daily activity density over the last 12 weeks.
- Expanded the dashboard with another time-based view so trends are easier to scan at a glance.

0.0.11
- Added small visual polish across the app including softer shadows, better focus states, smoother hover feedback, and cleaner header hierarchy.
- Refined the page surfaces to feel more modern without changing the workflow or information architecture.

0.0.12
- Applied an OpenAI-inspired quiet UI pass with softer spacing, cleaner surfaces, and more restrained product styling.
- Tuned typography and micro-interactions to make the app feel more polished without adding visual noise.

0.0.13
- Shifted the UI toward a Notion-inspired editorial feel with flatter surfaces, softer radii, and quieter hierarchy.
- Tightened spacing and title treatments across the app to feel more document-like and workspace-oriented.

0.0.14
- Fixed the country filter picker by populating it from loaded internship data instead of leaving it static.
- Kept the current selection stable while rebuilding country options so filtering stays predictable after refreshes.

0.0.15
- Refined the visual system for a more polished, production-grade feel with tighter spacing, calmer surfaces, and better responsive behavior.
- Made the command palette use real country options from data so keyboard shortcuts stay aligned with the current workspace state.

0.0.16
- Standardized all select pickers into a single modern control style with custom chevrons, cleaner spacing, and better focus states.
- Harmonized picker appearance across light and dark themes so filters, saved views, and inline status controls feel like one system.

0.0.17
- Added subtle colored dot accents across navigation, cards, statuses, and priorities to give the UI a more polished and legible visual rhythm.
- Kept the color usage restrained so the interface still reads calm and professional instead of decorative.

0.0.18
- Reworked select chevrons to use a single clean icon so picker controls no longer render awkward crossed shapes in compact layouts.
- Tightened status pill styling to keep the inline selectors readable and visually balanced in both light and dark themes.

0.0.19
- Split the stylesheet into modular CSS entrypoints so base, layout, charts, and responsive rules are easier to maintain independently.
- Kept the public `styles.css` file as a thin import layer so the app structure stays stable while the stylesheet becomes easier to scale.

0.0.20
- Removed the over-applied decorative dots and kept the visual language focused on functional indicators only.
- Preserved the subtle status and priority signals while making the interface calmer and less noisy.

0.0.21
- Simplified picker controls back to a clean native select style to avoid the cross-shaped rendering issue on macOS/Safari.
- Kept the controls modern through spacing, radius, and contrast instead of forcing a custom arrow that was visually breaking.

0.0.22
- Refined picker interaction states with softer hover surfaces and cleaner focus rings so the controls feel more intentional without extra decoration.
- Kept the native picker behavior intact while improving the tactile feel across light and dark themes.

0.0.23
- Reworked the tracker into a clearer decision workspace with a true top-level summary, calmer control hierarchy, and richer application rows that surface next-step context directly.
- Simplified the dashboard into a more operational analytics view so pipeline health, market concentration, and follow-up pressure are easier to act on quickly.

0.0.24
- Rebuilt the app around a stronger workflow shell with top-level mode switching, a dedicated control bar, and a persistent stage rail so navigation, filtering, and execution no longer compete for the same visual space.
- Made tracker and insights feel like two intentional modes of one product, which improves orientation and keeps large application sets easier to scan and segment.

0.0.25
- Rebuilt each application row into clear interaction zones so opening a record, reviewing the next step, changing stage, and using secondary actions now feel deliberate instead of cramped together.
- Moved repeated row actions into a quieter progressive reveal, added a lighter stage treatment, and hardened the row behavior so the main list feels faster, cleaner, and more trustworthy in daily use.

0.0.26
- Applied a final shared-system polish pass across tracker and insights so spacing, radii, hover motion, focus treatment, control sizing, and surface contrast now feel consistent instead of drifting component by component.
- Tightened the list and dashboard presentation with calmer row states, cleaner pills and icon controls, more disciplined chart/card edges, and quieter interaction feedback that makes the product feel more premium during repeated daily use.
