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

0.0.27
- Added a new local-first `/profile` workspace that turns the CRR whoami documents into an editable, structured career profile page aligned with the existing product shell.
- Introduced a seeded `data/profile.json` store and profile API so updates stay fast inside the app without adding Google Drive writeback complexity.

0.0.28
- Added 15 new research-grade internship targets across Fraunhofer institutes, university labs, and applied security organizations focused on embedded and hardware security.
- Filled the tracker spreadsheet with fit scores, location tags, focus tags, and outreach-ready notes so the shortlist is immediately usable for 2026 summer applications.

0.0.29
- Added a shared sidebar toggle across tracker, insights, and profile so the shell can collapse into a wider working surface on desktop and slide into an off-canvas panel on mobile.
- Kept the state persistent with local storage, added a mobile backdrop, and preserved the existing layout language so the control feels native instead of bolted on.

0.0.30
- Moved the sidebar toggle into the sidebar chrome itself and reduced it to an icon-only control so the header stays cleaner.
- Kept the control available in the sidebar brand area while preserving the existing collapse state and mobile off-canvas behavior.

0.0.31
- Tightened the collapsed sidebar into a true icon rail so the extra navigation content no longer peeks through when the panel is closed.
- Kept the toggle inside the sidebar brand strip and left the main workspace fully expanded beside the rail.

0.0.32
- Wrapped the sidebar content in a single body container so the collapsed state can hide the full navigation stack cleanly instead of clipping individual controls.
- Kept the icon-only toggle in the sidebar brand area so the rail still has a visible reopen control.

0.0.33
- Slowed down the sidebar collapse and expand motion so the rail feels less snappy and more deliberate.
- Added a softer body fade and slide during collapse so the hidden navigation stack disappears with a cleaner visual handoff.

0.0.34
- Removed the leftover collapsed sidebar rail by zeroing the sidebar width in the closed state so the main workspace can fully reclaim the canvas.
- Kept the reopen control as a fixed edge button, which preserves access without leaving a visible sidebar strip behind.

0.0.35
- Switched the closed sidebar back to a true off-canvas transform so no clipped navigation text or ghost strip can remain on screen.
- Added a dedicated floating reopen button for the collapsed state, which keeps access obvious without reintroducing the rail.

0.0.36
- Added an AI analysis flow with a local API-key modal, per-row and drawer-level analyze actions, cached company research results, and a copy-ready mail hook inside the detail drawer.
- Added a minimal Anthropic passthrough plus fit-score persistence so analysis results work in the local app despite localhost browser CORS restrictions on direct Anthropic API calls.

0.0.38
- Completed the application-agent flow so the drawer can prepare a company-specific outreach email, open a human review modal, and respect a final send-or-draft decision before anything goes out.
- Wired direct SMTP sends back into the tracker by logging sent-email activity and auto-marking the related company as Applied when the mail is successfully delivered.

0.0.37
- Added an application-agent flow that researches the company, finds a likely contact path, drafts the outreach email, validates resume/transcript attachments, and routes the final step through a review modal instead of blind auto-send.
- Added profile-managed sender and attachment settings plus optional SMTP delivery, so the app can either send directly when configured or fall back to an approval-first draft flow without pretending attachments were sent.

0.0.39
- Tightened the agent approval modal into a clearer executive-style decision step with company-specific action labels instead of generic send/draft/cancel wording.
- Made the final confirmation language more explicit so the user sees a real approval question before the app applies the chosen action.

0.0.40
- Removed a broken leftover outreach-panel reference in the main tracker script that was throwing on page load and blocking both entry rendering and the light-mode toggle.
- Kept the working agent review modal flow intact while restoring normal tracker initialization behavior.

0.0.41
- Switched the AI analysis and application-agent backend from Anthropic to the OpenAI Responses API so the app now uses one provider for both research and drafting.
- Split the mail workflow across `gpt-5.4 mini` for company research plus tool use and `gpt-5.4` for final email polishing, which keeps per-application cost low while improving final writing quality.

0.0.42
- Added one-click mail personalization presets, attachment recommendations, and portfolio-link support to the agent review modal so outreach can be tuned without rewriting prompts by hand.
- Added human-safe direct-send rules plus outreach outcome analytics for hook types, attachment mixes, tone presets, and company types so the system can stay safer while learning what actually converts.

0.0.43
- Added real reply tracking fields to internships plus drawer controls for reply date and reply outcome, so outreach performance can be measured from actual responses instead of status proxies.
- Updated the insights dashboard to report true reply counts and positive reply rates from logged outreach data, which makes conversion analysis materially more trustworthy.

0.0.44
- Simplified each list row down to one clear `Open` action and turned the inline status control into a read-only badge, which reduces accidental clicks and makes the primary path obvious.
- Moved destructive management into the detail drawer by keeping analysis there and adding a drawer-level delete control, so high-risk actions no longer compete for attention in the list.

0.0.45
- Replaced the hidden saved-view context workflow with a visible per-view `...` menu, so apply, overwrite, rename, and delete actions are now discoverable where the user already looks.
- Swapped prompt-based rename for inline editing in the sidebar, which makes view cleanup feel lighter and materially increases the chance that saved filters get reused instead of abandoned.

0.0.46
- Reduced quick add to just company, website, and location so the first capture behaves like a true inbox step instead of a miniature onboarding form.
- Moved status, notes, dates, and tagging back to the detail drawer flow by saving safe defaults on create, which lowers empty-tracker friction without losing the richer editing path.

0.0.47
- Fixed the list-row `Open` CTA so clicks on nested label text now resolve to the owning button instead of silently missing the action.
- This removes the misleading behavior where one row looked unresponsive while a later click on another row seemed to work, which materially reduces trust-breaking interaction bugs.

0.0.48
- Added a backward-compatible `/apikey` route that redirects to the existing `/api-key` page, so mistyped or older links no longer fail with `Cannot GET`.
- This removes a trust-breaking dead-end around API key setup while preserving the canonical `/api-key` route.

0.0.49
- Brought API key setup back into the main tracker UI as an in-app modal, so users no longer get kicked out to a detached page for a simple local setting.
- Replaced missing-key redirects during analysis flows with the same modal, which keeps the workflow visible and materially reduces “nothing showed up” confusion.

0.0.49
- Introduced a dedicated `--main-canvas` surface for the main column so light mode reads as a white workspace on a soft grey shell, closer to the calm Productivity UI references without turning the app into a marketing page.
- Retuned the sticky context bar to frost against the canvas color and added a reduced-transparency fallback so the header stays solid when the OS discourages blur.
- Loosened light-theme sidebar padding and nav item targets, strengthened the wordmark weight, and upgraded the API key route’s back/skip controls to pill ghost buttons for a more intentional personal-tool feel.

0.0.50
- Reworked the kanban board column chrome into a single pastel status pill with dot, label, and count, plus soft per-column tinting and white cards in light mode so the board reads closer to modern Notion-style boards without changing pipeline logic.
- Added a “Workspace” sidebar group for New entry and Search, promoted New entry to a full primary pill CTA, and expanded the empty list state with more whitespace and a matching primary “Add first entry” button.
- Tuned light mode list header and context bar backgrounds to track the main canvas and added a gentle list-head hover gradient for clearer table separation.

0.0.51
- Realigned the light theme tokens with a Notion-style workspace: `#f7f7f7` shell, `#ffffff` canvas, `#2383E2` primary actions, hairline borders, and softer status/priority pastels while keeping list, board, filters, and sidebar behavior unchanged.
- Refined the board view in light mode to use neutral grey column tracks, white cards with 6px corners and subtle hover lift, and a segmented list/board toggle that reads like Notion’s inline tabs.
- Tightened typography and spacing on the context header (bolder page title, muted count pill), improved sidebar contrast for search and navigation, and simplified the list header strip for a calmer table chrome.

0.0.52
- Fixed sidebar footer links that are `<button>` elements appearing centered instead of left-aligned: the global `button { justify-content: center }` rule was winning where `.sidebar-footer-link` did not set `justify-content`, while `<a class="sidebar-footer-link">` rows stayed left-aligned.
- Set `justify-content: flex-start` and `text-align: left` on `.sidebar-footer-link`, and the same flex justification on `.sidebar-nav-item` and `.sidebar-search-trigger` so all sidebar buttons match anchor alignment.

0.0.53
- Moved the AI Analysis block out of `#drawerForm` so it is a sibling section under `#detailDrawer`, separating form submit scope from AI tooling while keeping the same controls and IDs.
- Adjusted drawer layout flex so the analysis block stacks below the form with consistent spacing.

0.0.54
- Unified user-facing copy to English across the agent review flow and related JS messages; replaced emoji empty states with shared stroke SVG icons (`/js/ui-icons.js`).
- Added Insights screen reader summary for the pipeline trend chart, wired `aria-labelledby` to a hidden data summary, and exposed the dashboard focus summary in the layout with a sticky “Jump to” nav for major sections.
- Added profile page sticky section navigation with anchor targets and scroll-margin; aligned the standalone API key page with Inter and system monospace for secrets.

0.0.55
- Normalized Responses API reasoning effort for web-search calls so requests no longer fail when the app asks OpenAI for `minimal` reasoning alongside `web_search_preview`.
- This restores the live Analyze and agent research flows after API key setup, which is the real operational benefit because the AI path now fails over to a compatible low-effort setting instead of hard erroring.

0.0.56
- Normalized Responses API text formatting for web-search calls by dropping JSON mode when search is enabled, while keeping prompt-level strict JSON instructions for the agent research step.
- This restores the prepare-mail research leg too, so the AI workflow now clears both compatibility blockers instead of fixing analysis only.

0.0.57
- Moved the agent mail review flow out of the modal into a dedicated `/agent-review` route with a calmer, full-page workspace and route-level transition choreography.
- Rewired `Prepare Agent Mail` to hand off review state into that route, so the flow now feels deliberate and premium instead of cramming a high-focus drafting task into an overlay.

0.0.58
- Reworked `/agent-review` into a real staged pipeline: the page now starts research and polish itself, shows live step status, elapsed time, retry state, and a timestamped event log instead of a fake loading shell.
- Split backend preparation into observable research and polish phases so the UI can surface where the flow is, whether it is still moving, and the exact error if it fails.

0.0.59
- Replaced the brittle web-search research JSON contract with a labeled text protocol plus deterministic parsing, so company research no longer falls over when the model refuses prompt-only JSON during search-enabled runs.
- This materially improves the new live stage flow because the research step now completes reliably enough to expose real progress instead of failing at the first parsing edge case.

0.0.60
- Fixed the agent review elapsed timer so the `Completed in ...` label now freezes at the actual completion time instead of continuing to grow every second after the draft is ready.
- Fixed the stalled-preparation fallback so when the flow flips to `stuck`, the page re-renders and exposes the Retry action and updated status UI instead of only changing internal state.

0.0.61
- Hardened the agent review state lifecycle so refresh now restores the right company, resumes queued or in-progress prep, and clears stale data when the query or stored state conflicts.
- Persisted live draft edits, attachment toggles, and page visibility changes so typed changes survive refresh instead of disappearing mid-review.
- Added safer storage recovery for broken session data and localStorage fallback so the route can still reopen cleanly when one storage path is unavailable.

0.0.62
- Added flow-run guards so stale research events from an old retry or slow network response can no longer overwrite the current agent draft.
- Cleared both persisted storage layers and in-memory state on discard or successful send, which prevents an old draft from reappearing after the user explicitly leaves the flow.
- Reset the no-draft UI state during preparation so stale attachment, tone, and safety details do not linger while the next draft is being built.
- Added `pagehide` persistence for more reliable refresh and tab-close recovery on browsers that are weaker on `beforeunload`.

0.0.63
- Made `stuck` and `error` states in `/agent-review` explain themselves with a visible diagnostic message instead of leaving only the Retry button on screen.
- Added timeout-based stall detection details, including the current stage, idle time, and last successful update, so the UI now tells the user what actually went wrong. This is the real benefit because it turns a vague recovery state into a debuggable one.
