# DizzyResume — Claude TODO

## In Progress

### #2 Application Auto-Logging (Horus → Ra)
Half-implemented. The following was added to `horus/src/content.ts` but the
session was interrupted before building/testing:

- `extractJobInfo()` — scrapes company (from subdomain), title (from h1/h2/page title), location (from filled input)
- `openLogModal()` — confirmation modal with editable Company/Title/Location/Notes fields, posts to `POST /applications`
- `watchForSubmission()` — listens for submit button clicks (arms a flag), watches for URL change to a confirmation page via MutationObserver, then fires `openLogModal()` after 800ms delay

**Still needed:**
- Wire `watchForSubmission()` into `init()` — pass `ats.name`, `activeProfileId`, `activeVariantId` after profile is loaded
- Build Horus (`pnpm build` in `/horus`)
- Test on Workday: click Submit, verify confirmation page triggers modal, verify POST to Ra
- Verify the armed/disarmed logic works across Workday's multi-step form (Next should NOT trigger logging, only final Submit)

---

## Next Up (from spec)

### #3 Seshat's Dashboard — Tracker Polish
- Applications view in Ra exists but is thin
- Kanban board: Bookmarked → Applied → Phone Screen → Interview → Offer → Rejected → Withdrawn
- Drag-and-drop status updates
- Age color coding: green (fresh <7d), yellow (warning 7-14d), red (stale >14d) — backend already computes `age` field

### #4 CSV Export
- Add "Export CSV" button to Ra's Applications view
- Pure frontend: serialize `Application[]` to CSV and trigger a download
- Columns: Company, Title, Location, Date Applied, Status, Resume Used, ATS Platform, URL, Notes, Days Since Applied
- No backend changes needed

### #1 Thoth's Scriptorium — Cover Letter Assembler
- Ra already has a Templates system with `variables: string[]` and `{merge_field}` content
- UI: pick a template, fill in `{company_name}` / `{role_title}` / custom vars, preview assembled text, copy or save linked to an application
- Horus: detect cover letter textareas and offer to inject assembled text from the Bes panel (similar to snippet copy flow)

---

## Horus Field Mapping — Known Gaps

- **Country dropdown** — Workday uses ARIA listbox like State. Need to verify `expandStateValue` equivalent for country names vs. codes (e.g. "United States of America" vs "USA" vs "US")
- **Multi-step form persistence** — Bes panel is injected once at `document_idle`. If Workday navigates between steps via React Router (same origin, no full reload), the panel survives but scanned fields may change. Consider re-scanning on URL change.
- **iframes** — Taleo and iCIMS embed forms in iframes. Manifest has `all_frames: false` — needs to be `true` and content script logic needs to handle cross-frame messaging.

---

## Ra — Minor Gaps

- Profile form `set()` helper uses `value || null` which converts empty strings to null. This means clearing a field saves null instead of `''`. Fine for optional fields (linkedin, website) but could cause issues if extended to required fields.
- No delete confirmation dialogs on any entity (profiles, variants, templates, snippets) — direct delete on button click.
- No profile switcher in the main UI — always loads `profiles[0]`. Multi-profile support exists in backend but not surfaced in Resumes/Templates/Snippets views.

---

## Architecture Notes for Next Session

- `horus/src/content.ts` — all field scanning, filling, Bes panel, snippet modal, log modal, submit detection
- `horus/src/ats/detect.ts` — Wadjet's Gaze, exports `detectAts()` and `SUPPORTED_PLATFORMS`
- `horus/src/popup/popup.ts` — profile/variant selector, Ra status, ATS detection display
- `ra/src-tauri/src/server.rs` — Hapi's Flow (axum), all routes Horus calls over HTTP
- `ra/src-tauri/src/commands.rs` — Tauri IPC commands for the Ra desktop UI
- Horus build: two-step (`vite build` then `vite build --config vite.content.config.ts`) because content scripts must be IIFE, not ES modules
- DB migrations: done via `conn.execute("ALTER TABLE ... ADD COLUMN ...", []).ok()` in `db::init()`
