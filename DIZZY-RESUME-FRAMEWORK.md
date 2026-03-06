# ⚡ DizzyResume

Complete framework for Henry's job application automation tool.
A Tauri + Chrome Extension system that turns 45-minute applications into 5-minute ones.

---

## Table of Contents

- [Henry's Sketch Decoded](#henrys-sketch-decoded)
- [The Problem Space](#the-problem-space)
- [Architecture](#architecture)
- [Feature Breakdown](#feature-breakdown)
- [ATS Targets](#ats-targets)
- [Tech Stack](#tech-stack)
- [Build Phases](#build-phases)
- [Risks & Mitigations](#risks--mitigations)

---

## Henry's Sketch Decoded

Here's what Henry drew on that notepad — it's actually a solid architectural concept. Let me translate:

### Key Components

| Component | Description |
|-----------|-------------|
| **DizzyResumeCopyPaste.rs** | A Rust backend that stores structured resume data — description fields, experience entries, references — as reusable templates. The '.rs' means he wants this in Rust. |
| **Web Browser (right box)** | The ATS form in the browser with fields like Description, Experience, Ref 1, Comments. These are the inputs the app needs to fill. |
| **TamperMonkey (top arrow)** | A userscript that runs inside the browser, acting as the bridge between the Rust backend and the webpage DOM. |
| **Autofill mapping (bottom)** | Maps <input> element CSS selectors / IDs to DRCP.rs fields. Example: ".input1" maps to "DRCP Short Desc" — this is the field-matching logic. |

> **✓ Henry's Core Insight**
>
> Henry's sketch shows a **three-layer architecture**: a Rust data store holds your structured resume content, a Tampermonkey userscript runs in the browser and detects form fields, and a mapping layer connects resume data fields to the specific CSS selectors and input IDs on each ATS platform. The arrows crossing between the left and right boxes show that different resume fields map to different form inputs — it's not a 1:1 match, which is why the mapping layer is critical. This is fundamentally the right approach.

---

## The Problem Space

| Problem | Pain Point |
|---------|------------|
| 📋 Upload resume, then re-enter everything | 45-60 min per application |
| 🔀 Every ATS has different form structures | No universal autofill works |
| 🔐 Login walls and account creation | Must create accounts on 20+ ATS platforms |
| ❓ Easy Apply vs. Full Application uncertainty | Can't predict workflow until you click Apply |
| 🎯 Tailoring resumes per job | Need multiple resume versions, hard to track which went where |
| 📊 No centralized application tracking | Lose track of what you applied to, when, and what version |
| 👥 References and supplemental info | Re-typing the same 3 references on every single application |
| ✉️ Cover letter variation | Same base letter needs customization per role |

---

## Architecture

Building on Henry's sketch, here's the expanded architecture. The app is called **DizzyResume** (keeping his naming). It's a three-component system:

### 1. DizzyResume Desktop App
**Tech:** Tauri (Rust backend + Web frontend)

- Local SQLite database stores all user profiles, resume templates, references, cover letters, application history
- Runs a lightweight local HTTP server (localhost:9741) that the browser extension communicates with
- Full CRUD interface for managing resume data, templates, and profiles
- Multi-user support — each of the 3-5 people gets their own encrypted profile
- Export/import profiles for backup
- Application tracker dashboard with stats

### 2. DizzyResume Browser Extension
**Tech:** Chrome Extension (Manifest V3) — replaces Tampermonkey

- Detects when you're on a known ATS domain (Workday, Greenhouse, Lever, etc.)
- Scans the page DOM for form fields and classifies them (name, email, phone, experience, education, etc.)
- Communicates with the desktop app via localhost API to fetch the right profile data
- Injects a floating sidebar/panel UI for one-click filling, field-by-field control, and template selection
- Handles the messy reality: React controlled inputs, shadow DOM, iframes, dynamically loaded fields
- ATS-specific adapters — custom fill logic per platform because each one is different

### 3. Field Mapping Engine
**Tech:** The intelligence layer (Henry's crossing arrows)

- Maintains a registry of known ATS field patterns — CSS selectors, aria-labels, placeholder text, input names
- Fuzzy matching: when it encounters an unknown field, it attempts to classify it based on label text and context
- User can manually map any unrecognized field to a resume data field — that mapping is saved for next time
- Community mappings: users can export/share their field mappings for new ATS platforms
- Handles multi-step forms — tracks which page you're on and which fields have been filled

---

### Why Chrome Extension instead of Tampermonkey?

Henry's instinct to use Tampermonkey was good — it's fast to prototype and can inject JS into any page. But for a production tool serving 3-5 people, a proper Chrome extension gives you: persistent background service workers (for tracking which tabs are ATS pages), proper storage APIs, popup UI for quick actions, the ability to communicate with the localhost Tauri app via native messaging or HTTP, and content scripts that can run before the page loads. Tampermonkey is perfect for the early prototyping phase though — Henry could start there and graduate to a full extension.

---

## Feature Breakdown

### Profile & Data Management

- **Multi-Profile System** - Each user has their own profile with personal info, work history, education, skills, certifications. Support for multiple resume 'variants' per user — like a 'Data Analytics' resume vs an 'HR' resume vs a 'General' resume. Each variant stores different emphasis, bullet points, and summary text.

- **Template Engine** - Structured templates for: resume content blocks (summary, experience entries, education entries, skills lists), cover letter bases with merge fields ({company_name}, {role_title}, {specific_skill}), reference sheets with 3-5 references per template, common Q&A answers (like 'are you authorized to work in the US', salary expectations, start date, etc.).

- **Document Storage** - Store actual PDF/DOCX files of your polished resumes and cover letters ready for upload. Tag them by role type, date, version. One-click copy to clipboard for any text field.

- **Smart Snippets** - Reusable text blocks for common application questions. 'Tell us about a time you led a team' — have 3-4 versions ready to go. Searchable by keyword and taggable by competency area.

### Browser Autofill Engine

- **ATS Detection** - Automatically detects which ATS you're on based on URL patterns and DOM structure. Known patterns: myworkdayjobs.com, boards.greenhouse.io, jobs.lever.co, icims.com, recruiting.paylocity.com, workforcenow.adp.com, bamboohr.com, etc. Falls back to generic form detection for unknown sites.

- **Intelligent Field Mapping** - Reads form field labels, placeholders, aria-labels, and nearby text to determine what data goes where. Uses a priority system: exact CSS selector match → label text match → fuzzy match → ask the user. Handles dropdowns (country, state), date pickers, radio buttons, checkboxes, file upload fields, and rich text editors.

- **Controlled Input Handling** - The hardest technical challenge. React-based ATS forms (like Workday) use controlled inputs where simply setting .value doesn't work. The extension must trigger the correct React synthetic events (onChange, onBlur, onInput) by finding the React fiber node and dispatching events properly. Each ATS needs its own adapter for this.

- **Multi-Step Form Navigation** - Tracks your progress through multi-page applications. Remembers which fields you've filled on each step. Can auto-advance to the next page after filling (optional). Handles the common pattern of 'upload resume → parse → show pre-filled form → correct errors'.

- **File Upload Automation** - Automatically selects the right resume/cover letter PDF from your stored documents when it detects a file upload field. Uses the DataTransfer API to programmatically set files on input[type=file] elements.

### Application Tracker

- **Auto-Logging** - When you complete an application through the extension, it automatically logs: company name, job title, URL, ATS platform, date applied, which resume/cover letter version was used, salary listed (if any), and any notes you add.

- **Status Pipeline** - Kanban-style board: Bookmarked → Applied → Phone Screen → Interview → Offer → Rejected → Withdrawn. Drag and drop to update status. Color-coded by age (green = fresh, yellow = been a while, red = stale).

- **Spreadsheet Export** - One-click export to CSV/XLSX with all tracked applications. Columns: Company, Title, Location, Date Applied, Status, Resume Used, URL, Notes, Days Since Applied.

- **Daily Goals & Stats** - Set a daily application target (e.g., 10/day). Dashboard shows: applications this week, response rate, average time per application, most-used resume variant, ATS platforms encountered.

### Job Discovery & Alerts

- **Unified Job Feed** - Aggregate job listings from LinkedIn, Indeed, and Glassdoor RSS/API feeds into one view within the desktop app. Filter by title keywords, location, salary range, remote/hybrid/onsite, and date posted.

- **ATS Direct Search** - Search ATS platforms directly using the URL patterns: site:boards.greenhouse.io 'data analyst' 'Chicago'. Built-in Google search templates for each major ATS. Find jobs that never make it to LinkedIn.

- **Duplicate Detection** - Flags jobs you've already applied to or bookmarked, even if they appear on a different job board. Uses company name + title fuzzy matching.

### Quality of Life

- **Credential Vault** - Encrypted storage for ATS login credentials. Auto-fill login forms when you land on a platform you've used before. Master password protected. Note: this is convenience, not a replacement for a proper password manager — but it prevents the 'which email did I use for Workday?' problem.

- **Cover Letter Assembler** - Template-based cover letter builder. Pick a base template, it auto-fills company name and role. You customize 1-2 paragraphs explaining your specific fit. Saves the assembled version linked to that application.

- **Quick-Copy Floating Panel** - When the extension is active, a small floating panel appears in the browser with one-click copy buttons for: phone number, email, LinkedIn URL, address, and any custom snippets. No more switching tabs to find your own info.

- **Undo / Review Before Submit** - After autofilling, the extension highlights all filled fields in a subtle color so you can review everything before hitting submit. An 'undo all' button restores the form to its pre-fill state.

---

## ATS Targets

Priority targets based on market share and likelihood of encountering them. Henry should tackle these roughly in order of difficulty — start with the easy wins to build momentum and test the mapping engine.

| Platform | Domain Pattern | Difficulty | Market Share | Notes |
|----------|----------------|------------|--------------|-------|
| Workday | myworkdayjobs.com, wd5.myworkdayjobs.com | **Hard** | ~18% | React-based, controlled inputs, multi-step. Most common enterprise ATS. Must-have. |
| Greenhouse | boards.greenhouse.io, job-boards.greenhouse.io | **Medium** | ~15% | Two versions (old boards vs new job-boards). Well-structured HTML. Good starting point. |
| Lever | jobs.lever.co | **Medium** | ~8% | Clean forms, reasonable DOM structure. Often used by tech companies. |
| iCIMS | icims.com/jobs | **Hard** | ~11% | Legacy interface, complex iframe usage, but very common in enterprise. |
| Taleo (Oracle) | taleo.net/careersection | **Hard** | ~9% | Older technology, heavy iframe usage, session-dependent. Declining but still everywhere. |
| ADP Workforce | workforcenow.adp.com | **Medium** | ~7% | Common for SMBs. Reasonably standard form structure. |
| BambooHR | bamboohr.com | **Easy** | ~5% | Simple forms, good labeling. Quick win for implementation. |
| Ashby | ashbyhq.com | **Easy** | ~4% | Modern, clean DOM. Growing fast in tech. |
| SmartRecruiters | smartrecruiters.com | **Medium** | ~5% | Used by large enterprises. Decent form structure. |
| Paylocity | recruiting.paylocity.com | **Medium** | ~4% | Common in mid-market. Standard form patterns. |
| Jobvite | jobvite.com | **Medium** | ~3% | Moderate complexity. Used across industries. |
| JazzHR | applytojob.com | **Easy** | ~3% | Simple SMB-focused ATS. Very straightforward forms. |

---

## Tech Stack

| Layer | Choice | Language | Rationale |
|-------|--------|----------|-----------|
| Desktop App Shell | Tauri v2 | Rust | Henry wants Rust — Tauri delivers. 95% smaller than Electron, native OS integration, compiles to a tiny Windows .exe. The Rust backend handles all data storage, local API server, and file management. |
| Desktop Frontend | React + Vite | TypeScript | Runs inside Tauri's webview. Handles the profile manager, template editor, application tracker dashboard, and settings. Could also use Svelte or SolidJS if Henry prefers. |
| Database | SQLite (via rusqlite) | SQL | Single file, no server needed, perfect for a local desktop app. Stores profiles, templates, mappings, application history. Encrypted with SQLCipher for multi-user security. |
| Local API | Actix-web or Axum | Rust | Runs a tiny HTTP server on localhost:9741 that the browser extension calls to fetch profile data, save applications, and get templates. Tauri can embed this in its backend. |
| Browser Extension | Chrome Extension (Manifest V3) | TypeScript | Content scripts for DOM manipulation, background service worker for ATS detection, popup UI for quick actions. Communicates with the Tauri app over localhost HTTP. |
| Field Detection | Custom DOM traversal + heuristics | TypeScript | No ML needed initially. Pattern matching on label text, input names, aria-labels, and CSS classes. A decision tree that classifies fields into resume data categories. Can add ML later if needed. |

---

## Build Phases

### Phase 1 — Foundation
*Time: 2-3 weeks*

- Set up Tauri v2 project with React frontend
- Design and implement SQLite schema for profiles, templates, application history
- Build profile CRUD: personal info, work history, education, skills, references
- Build template manager: create/edit/tag resume content blocks
- Local API server on localhost:9741 with basic endpoints
- Basic Chrome extension scaffold with popup and content script

### Phase 2 — Core Autofill
*Time: 3-4 weeks*

- ATS detection engine (URL pattern matching)
- Generic form field scanner and classifier
- Greenhouse adapter (easiest ATS to start with)
- BambooHR adapter (second easiest)
- Lever adapter
- Floating sidebar UI in browser for field selection and fill control
- File upload automation for resume/cover letter PDFs

### Phase 3 — Hard Mode
*Time: 3-4 weeks*

- Workday adapter (React controlled inputs, multi-step forms)
- iCIMS adapter (iframes, legacy DOM)
- Taleo adapter (session management, complex navigation)
- ADP Workforce adapter
- Generic fallback adapter for unknown ATS platforms
- User-assisted field mapping: 'What should this field map to?'
- Save and share custom field mappings

### Phase 4 — Tracker & Polish
*Time: 2-3 weeks*

- Application auto-logging on successful form submission
- Kanban tracker dashboard in Tauri app
- CSV/XLSX export
- Daily goals and statistics
- Cover letter assembler with merge fields
- Credential vault with encryption
- Quick-copy floating panel
- Review/undo highlighting after autofill

### Phase 5 — Discovery & Scale
*Time: 2-3 weeks*

- Job feed aggregation (RSS/scraping from job boards)
- ATS direct search templates
- Duplicate job detection
- Multi-user testing with the full group of 3-5 people
- Bug fixes from real-world usage across different industries
- SmartRecruiters, Paylocity, Jobvite, JazzHR adapters
- Documentation and onboarding guide for new users

---

**Total estimated build time:** 12-17 weeks for one developer (Henry). Faster with pair programming or if Claude is helping write adapters.

---

## Risks & Mitigations

| Risk | Severity | Mitigation |
|------|----------|------------|
| ATS platforms update their DOM structure | **High** | Version-tagged adapters with fallback to generic detection. Community-shared mappings mean fixes propagate fast. The field classifier should work even when exact selectors change because it also reads label text. |
| React controlled inputs resist programmatic filling | **High** | This is the hardest problem. Study how Job App Filler (open source) solves it for Workday — they find the React fiber internals and dispatch proper synthetic events. Henry can use their approach as a reference. For each ATS adapter, the fill logic needs to match how that specific framework handles state. |
| Chrome Extension store rejection | **Medium** | Since this is for 3-5 private users, distribute as an unpacked extension loaded in developer mode. No need for the Chrome Web Store. If you want store distribution later, ensure compliance with Manifest V3 policies. |
| ATS sites detect and block automation | **Medium** | The extension fills fields with human-plausible timing (slight random delays between fields). It doesn't submit forms automatically — the user always clicks submit. This is fundamentally a data entry assistant, not a bot. Most ATS anti-automation targets things like auto-applying to hundreds of jobs, not filling in your own info. |
| iFrame and Shadow DOM isolation | **Medium** | Content scripts with all_frames: true in manifest.json to inject into iframes. For shadow DOM, use element.shadowRoot traversal. Some ATS platforms (especially older ones) use nested iframes heavily — each needs its own content script instance. |
| Multi-user data security | **Low** | SQLCipher encryption on the SQLite database. Each user's profile is password-protected. The localhost API only accepts requests from the local machine (bind to 127.0.0.1, reject any external connections). Data never leaves the device. |

---

## References

Built as a framework reference for Henry. Key open-source references:
- **Job App Filler** (Workday adapter patterns)
- **Autofill-Jobs** (Greenhouse/Lever/Workday)
- **AI-Job-Autofill** (multi-ATS with AI)

All stored locally, all private, all yours.
