# Ra - UI Design & Layout

> "Ra's Throne Room - Where the sun god illuminates all your profiles, templates, and application journeys"

---

## Design Philosophy

**Egyptian Motif + Modern Utility**
- Clean, golden-amber accent colors (sun god theme)
- Dark mode first (easier on eyes during long job search sessions)
- Keyboard-driven power user features
- Single-page app with instant transitions
- Data density over whitespace - see everything at a glance

---

## Main Navigation (Left Sidebar)

```
┌─────────────────────────────────────┐
│  ☀️ Ra - DizzyResume               │
├─────────────────────────────────────┤
│                                     │
│  👤 Profiles     [2 profiles]       │
│  📄 Resumes     [5 variants]        │
│  📝 Templates   [12 items]          │
│  📚 Snippets    [8 items]           │
│                                     │
│  📊 Tracker     [23 applications]   │
│  🔍 Discovery                        │
│                                     │
│  ⚙️  Settings                         │
│                                     │
└─────────────────────────────────────┘
```

### Navigation Icons
- 👤 **Profiles** - Manage user profiles (multi-user support)
- 📄 **Resumes** - Resume variants and document storage
- 📝 **Templates** - Cover letters, reference sheets, Q&A answers
- 📚 **Snippets** - Reusable text blocks for common questions
- 📊 **Tracker** - Seshat's application tracker (Kanban board)
- 🔍 **Discovery** - Job feed aggregation and ATS search
- ⚙️ **Settings** - App configuration, API server, sync

---

## Screen 1: Profiles Dashboard

```
┌─────────────────────────────────────────────────────────────────────┐
│  👤 Profiles                                        [+ New Profile]  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────┐  ┌─────────────────────┐                  │
│  │  Henry Post         │  │  [Add New]          │                  │
│  │  henry@example.com   │  │                      │                  │
│  │  📄 3 variants       │  │   Create a new       │                  │
│  │  📊 15 applications  │  │   profile            │                  │
│  │  ⏰ Last: 2h ago    │  │                      │                  │
│  │                     │  │                      │                  │
│  │  [Edit] [Export]    │  │   [+]                │                  │
│  └─────────────────────┘  └─────────────────────┘                  │
│                                                                     │
│  Profile Quick Stats                                               │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  Total Applications: 23    This Week: 5    Response Rate: 13%     │
│                                                                     │
│  Recent Activity                                                  │
│  • Applied to Staff Engineer at Cloudflare (2h ago)               │
│  • Updated "Data Analytics" resume (5h ago)                       │
│  • Created new cover letter template (Yesterday)                  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Screen 2: Profile Editor (Tabbed Interface)

```
┌─────────────────────────────────────────────────────────────────────┐
│  👤 Henry Post                              [Save] [Cancel]        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  [Personal] [Experience] [Education] [Skills] [References]         │
│   ✓                                                                   │
│                                                                     │
│  Personal Information                                              │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                                     │
│  Name                    Email                    Phone             │
│  ┌───────────────────┐   ┌─────────────────────┐  ┌────────────┐  │
│  │ Henry Post        │   │ henry@example.com    │  │ 555-0123   │  │
│  └───────────────────┘   └─────────────────────┘  └────────────┘  │
│                                                                     │
│  Location                                                          │
│  ┌───────────────────┐   ┌───────────┐   ┌────────────┐           │
│  │ Chicago           │   │ IL        │   │ 60601      │           │
│  └───────────────────┘   └───────────┘   └────────────┘           │
│     City                  State          ZIP                      │
│                                                                     │
│  LinkedIn                 Website                                  │
│  ┌─────────────────────────────┐  ┌─────────────────────────┐    │
│  │ linkedin.com/in/henry       │  │ henry.dev               │    │
│  └─────────────────────────────┘  └─────────────────────────┘    │
│                                                                     │
│  Resume Variants                                                  │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  ⭐ General        | Data Analytics | HR Focus  [+ New Variant]  │
│                                                                     │
│  [Advanced: Add custom fields | Export profile | Import from JSON]│
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Experience Tab

```
┌─────────────────────────────────────────────────────────────────────┐
│  👤 Henry Post - Experience                      [Save] [Cancel]    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  [Personal] [Experience] [Education] [Skills] [References]         │
│             ✓                                                          │
│                                                                     │
│  Work Experience                                    [+ Add Position]│
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ 🏢 Senior Developer @ TechCorp Inc.           [Edit] [Delete]│   │
│  │    Chicago, IL | Jan 2022 - Present                          │   │
│  │    • Led migration to microservices architecture            │   │
│  │    • Reduced deployment time by 60%                         │   │
│  │    • Mentored 3 junior developers                           │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ 🏢 Developer @ StartupXYZ                      [Edit] [Delete]│   │
│  │    Remote | Mar 2019 - Dec 2021                              │   │
│  │    • Built React dashboard from scratch                     │   │
│  │    • Implemented CI/CD pipelines                            │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  [Drag to reorder] [Import from LinkedIn] [Bulk edit mode]         │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Screen 3: Seshat's Tracker (Application Kanban)

```
┌─────────────────────────────────────────────────────────────────────📊┐
│  📚 Application Tracker           [Week] [Month] [All Time]   [Export]│
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────┬─────────────┬─────────────┬─────────────┬────────┐│
│  │ 📌 Bookmarked│ 📝 Applied  │ 📞 Screen   │ 💬 Interview│ ✅Offer ││
│  │     3       │     8      │     4       │     6      │   2    ││
│  ├─────────────┴─────────────┴─────────────┴─────────────┴────────┤│
│  │                                                                   ││
│  │ ┌─────────────────────┐ ┌─────────────────────┐                  ││
│  │ │ Staff Engineer      │ │ Senior Frontend     │                  ││
│  │ │ Cloudflare          │ │ Vercel              │                  ││
│  │ │ $180-220k 🟢        │ │ $160-200k 🟡        │                  ││
│  │ │ Greenhouse          │ │ Lever               │                  ││
│  │ │ 2d ago              │ │ 1w ago              │                  ││
│  │ │ [Apply] [Remove]    │ │ [View] [Update]     │                  ││
│  │ └─────────────────────┘ └─────────────────────┘                  ││
│  │                                                                   ││
│  │ ┌─────────────────────┐ ┌─────────────────────┐                  ││
│  │ │ ML Engineer         │ │ Full Stack          │                  ││
│  │ │ Anthropic           │ │ Stripe              │                  ││
│  │ │ $250-300k 🟢        │ │ $200-250k 🔴        │                  ││
│  │ │ Workday             │ │ Greenhouse          │                  ││
│  │ │ 5d ago              │ │ 2w ago              │                  ││
│  │ │ [Apply] [Remove]    │ │ [View] [Update]     │                  ││
│  │ └─────────────────────┘ └─────────────────────┘                  ││
│  │                                                                   ││
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  📈 This Week: 5 apps | 🔥 3 day streak | 📊 13% response rate      │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

### Application Detail Modal

```
┌─────────────────────────────────────────────────────────────────────┐
│  Staff Engineer @ Cloudflare                      [×]               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Status: [📝 Applied ▼]  |  Applied: Mar 4, 2026  |  Source: LinkedIn│
│                                                                     │
│  Company Info                                                      │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  Cloudflare | cloudflare.com/careers | Austin, TX / Remote        │
│                                                                     │
│  Application Details                                               │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  Resume Used:     [Data Analytics ▼]  |  Cover Letter: [With AI]   │
│  Salary Range:    $180,000 - $220,000                              │
│  ATS Platform:    Workday                                          │
│  URL:             https://cloudflare.com/careers/12345             │
│                                                                     │
│  Timeline                                                          │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  Mar 4 - Applied via DizzyResume                                   │
│  Mar 6 - Application viewed by recruiter                           │
│                                                                     │
│  Notes                                                             │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Referred by Sarah. She mentioned they're big on Rust and    │   │
│  │ remote-first culture. Focus on the "Project Saturn" in     │   │
│  │ the interview.                                             │   │
│  │                                                             │   │
│  │ Follow up next week if no response...                       │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  [Update Status] [Add Timeline Event] [Delete Application]         │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Screen 4: Resume Variant Editor

```
┌─────────────────────────────────────────────────────────────────────┐
│  📄 "Data Analytics" Resume                        [Preview] [Save]│
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  [Summary] [Experience] [Education] [Skills] [Custom Fields]       │
│   ✓                                                                   │
│                                                                     │
│  Professional Summary                                              │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Data-driven professional with 5+ years of experience in    │   │
│  │ analytics, visualization, and business intelligence.        │   │
│  │ Passionate about turning complex data into actionable      │   │
│  │ insights. Proficient in Python, SQL, and Tableau.          │   │
│  │                                    [AI Generate ▼]         │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  Key Skills (Drag to reorder - top 5 shown on resume)             │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  🔹 Python  🔹 SQL  🔹 Tableau  🔹 Excel  🔹 Data Viz            │
│  [+ Add Skill]                                                     │
│                                                                     │
│  Experience (Shown on Resume)                                       │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  ☑️ Senior Analyst @ TechCorp (2022-Present)                       │
│  ☑️ Data Analyst @ StartupXYZ (2019-2021)                         │
│  ☐ Analyst @ DataCo (2017-2019)                    [Select All]   │
│                                                                     │
│  [AI Optimize for Role] [Export PDF] [Copy to Clipboard]          │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Screen 5: Template Manager (Thoth's Scriptorium)

```
┌─────────────────────────────────────────────────────────────────────┐
│  📝 Templates                                        [+ New Template]│
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Filter: [All ▼]  Search: [___________]                            │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ 📄 Cover Letter - General                    [Edit] [Use]   │   │
│  │    Last used: 2 days ago | Used 8 times                     │   │
│  │    Variables: {company}, {role}, {specific_skill}           │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ 📄 Cover Letter - Startup                    [Edit] [Use]   │   │
│  │    Last used: 1 week ago | Used 3 times                     │   │
│  │    Variables: {company}, {role}, {founder_name}            │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ 👥 Reference Sheet - Technical                [Edit] [Use]   │   │
│  │    3 references | Manager + Peer + Senior                    │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ 💬 Q&A - Leadership Questions                 [Edit] [Use]   │   │
│  │    4 variations of "tell me about a time you led..."       │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  [Import from Library] [Create from Scratch]                        │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Screen 6: Settings

```
┌─────────────────────────────────────────────────────────────────────┐
│  ⚙️ Settings                                                  [Save]│
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  [General] [API] [Sync] [Integrations] [About]                     │
│   ✓                                                                   │
│                                                                     │
│  General Settings                                                   │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                                     │
│  Theme                   Daily Application Goal                     │
│  ┌──────────────┐        ┌──────────────────┐                      │
│  │ 🌙 Dark      │        │ 10 applications  │                      │
│  │ ☀️ Light     │        └──────────────────┘                      │
│  │ 🌗 Auto      │        [ ] Show notification on goal             │
│  └──────────────┘        [ ] Reset goals on Sunday                 │
│                                                                     │
│  Default Profile           Default Resume Variant                   │
│  ┌──────────────┐        ┌──────────────────┐                      │
│  │ Henry Post   │        │ Data Analytics   │                      │
│  └──────────────┘        └──────────────────┘                      │
│                                                                     │
│  Backup & Export                                                   │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  [Export All Data (JSON)]  [Export to CSV]  [Backup Database]      │
│  Last backup: 3 days ago                                    [Backup]│
│                                                                     │
│  Horus Integration                                                  │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  Local API Server: [🟢 Running on port 9741]                       │
│  Browser Extension: [🟢 Connected]                                 │
│                                                                     │
│  [Restart API] [View Logs] [Configure Extension]                   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Keyboard Shortcuts (Power User Features)

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + K` | Quick search / command palette |
| `Cmd/Ctrl + P` | Switch profiles |
| `Cmd/Ctrl + N` | New (context-sensitive) |
| `Cmd/Ctrl + ,` | Open settings |
| `Cmd/Ctrl + 1-7` | Switch navigation tabs |
| `Tab` | Next field |
| `Shift + Tab` | Previous field |
| `Cmd/Ctrl + S` | Save |
| `Cmd/Ctrl + Enter` | Apply / Submit |
| `Esc` | Close modal / cancel |
| `Cmd/Ctrl + /` | Show keyboard shortcuts |
| `Space` | Preview / expand (when focused on item) |
| `Enter` | Open / edit (when focused on item) |

---

## Color Palette

### Primary (Sun God Theme)
```
--sun-gold: #F4B400        // Primary accent
--sun-gold-light: #FFF4CC  // Hover states
--sun-gold-dark: #C49100   // Active states
```

### Backgrounds
```
--bg-primary: #1a1a1a      // Main background
--bg-secondary: #242424    // Cards, panels
--bg-tertiary: #2d2d2d     // Nested elements
--bg-elevated: #333333     // Modals, popovers
```

### Text
```
--text-primary: #e0e0e0    // Primary text
--text-secondary: #a0a0a0  // Secondary text
--text-muted: #707070      // Muted text
--text-inverted: #1a1a1a   // Inverted text
```

### Status Colors
```
--status-success: #4caf50  // Green
--status-warning: #ff9800  // Orange/Yellow
--status-error: #f44336    // Red
--status-info: #2196f3     // Blue
```

### ATS Platform Colors
```
--ats-greenhouse: #00d363
--ats-workday: #1c3f6e
--ats-lever: #36a64f
--ats-icims: #005eb8
```

---

## Component Library

We'll use these component libraries:
- **Shadcn/ui** - Base components (headless, customizable)
- **Radix UI** - Complex primitives (dialogs, dropdowns, etc.)
- **TailwindCSS** - Utility-first styling
- **Lucide React** - Icon set

Custom components we'll build:
- `KanbanBoard` - Drag-and-drop application tracker
- `ResumeEditor` - Rich text with AI suggestions
- `TemplateBuilder` - Variable-based template editor
- `FieldMapper` - Visual field mapping editor
- `StatusBar` - Always-visible status bar with quick stats

---

## Responsive Breakpoints

```
sm:  640px   // Mobile (sidebar collapses to hamburger)
md:  768px   // Tablet (sidebar becomes icons-only)
lg:  1024px  // Desktop (full sidebar)
xl:  1280px  // Large desktop
2xl: 1536px  // Extra large
```

---

## Next Steps for UI Implementation

1. **Set up Shadcn/ui** - Initialize component library
2. **Create layout shell** - Sidebar, header, main content area
3. **Build Profile CRUD** - First functional feature
4. **Implement Kanban board** - Seshat's tracker
5. **Add keyboard shortcuts** - Command palette implementation
6. **Dark mode toggle** - Theme switching
7. **Local storage sync** - Persist UI preferences

---

> "May Ra illuminate your path through the job application wilderness."
