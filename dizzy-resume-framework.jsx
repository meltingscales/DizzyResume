import { useState } from "react";

const colors = {
  bg: "#0a0e17",
  surface: "#111827",
  surfaceHover: "#1a2332",
  border: "#1e293b",
  borderAccent: "#f59e0b",
  accent: "#f59e0b",
  accentDim: "#92400e",
  text: "#e2e8f0",
  textMuted: "#94a3b8",
  textDim: "#64748b",
  success: "#10b981",
  info: "#3b82f6",
  danger: "#ef4444",
  purple: "#a78bfa",
  cyan: "#22d3ee",
};

const sections = [
  {
    id: "sketch",
    title: "Henry's Sketch Decoded",
    icon: "🗒️",
    content: {
      type: "sketch",
    },
  },
  {
    id: "problem",
    title: "The Problem Space",
    icon: "🔥",
    content: {
      type: "problems",
    },
  },
  {
    id: "arch",
    title: "Architecture",
    icon: "⚙️",
    content: {
      type: "architecture",
    },
  },
  {
    id: "features",
    title: "Feature Breakdown",
    icon: "🧩",
    content: {
      type: "features",
    },
  },
  {
    id: "ats",
    title: "ATS Targets",
    icon: "🎯",
    content: {
      type: "ats",
    },
  },
  {
    id: "stack",
    title: "Tech Stack",
    icon: "🛠️",
    content: {
      type: "stack",
    },
  },
  {
    id: "phases",
    title: "Build Phases",
    icon: "📅",
    content: {
      type: "phases",
    },
  },
  {
    id: "risks",
    title: "Risks & Mitigations",
    icon: "⚠️",
    content: {
      type: "risks",
    },
  },
];

const SketchSection = () => (
  <div>
    <p style={{ color: colors.textMuted, lineHeight: 1.7, marginBottom: 20, fontSize: 14 }}>
      Here's what Henry drew on that notepad — it's actually a solid architectural concept. Let me translate:
    </p>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      {[
        {
          label: "DizzyResumeCopyPaste.rs",
          desc: "A Rust backend that stores structured resume data — description fields, experience entries, references — as reusable templates. The '.rs' means he wants this in Rust.",
        },
        {
          label: "Web Browser (right box)",
          desc: "The ATS form in the browser with fields like Description, Experience, Ref 1, Comments. These are the inputs the app needs to fill.",
        },
        {
          label: "TamperMonkey (top arrow)",
          desc: "A userscript that runs inside the browser, acting as the bridge between the Rust backend and the webpage DOM.",
        },
        {
          label: "Autofill mapping (bottom)",
          desc: 'Maps <input> element CSS selectors / IDs to DRCP.rs fields. Example: ".input1" maps to "DRCP Short Desc" — this is the field-matching logic.',
        },
      ].map((item, i) => (
        <div
          key={i}
          style={{
            background: `linear-gradient(135deg, ${colors.surface}, ${colors.surfaceHover})`,
            border: `1px solid ${colors.border}`,
            borderLeft: `3px solid ${colors.accent}`,
            borderRadius: 8,
            padding: 16,
          }}
        >
          <div style={{ color: colors.accent, fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
            {item.label}
          </div>
          <div style={{ color: colors.textMuted, fontSize: 13, lineHeight: 1.6 }}>{item.desc}</div>
        </div>
      ))}
    </div>
    <div
      style={{
        marginTop: 20,
        background: colors.surface,
        border: `1px solid ${colors.border}`,
        borderRadius: 8,
        padding: 16,
      }}
    >
      <div style={{ color: colors.success, fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
        ✓ Henry's Core Insight
      </div>
      <p style={{ color: colors.textMuted, fontSize: 13, lineHeight: 1.7, margin: 0 }}>
        Henry's sketch shows a <strong style={{ color: colors.text }}>three-layer architecture</strong>: a Rust data store holds your structured resume content, a Tampermonkey userscript runs in the browser and detects form fields, and a mapping layer connects resume data fields to the specific CSS selectors and input IDs on each ATS platform. The arrows crossing between the left and right boxes show that different resume fields map to different form inputs — it's not a 1:1 match, which is why the mapping layer is critical. This is fundamentally the right approach.
      </p>
    </div>
  </div>
);

const ProblemsSection = () => {
  const problems = [
    {
      problem: "Upload resume, then re-enter everything",
      pain: "45-60 min per application",
      icon: "📋",
    },
    {
      problem: "Every ATS has different form structures",
      pain: "No universal autofill works",
      icon: "🔀",
    },
    {
      problem: "Login walls and account creation",
      pain: "Must create accounts on 20+ ATS platforms",
      icon: "🔐",
    },
    {
      problem: "Easy Apply vs. Full Application uncertainty",
      pain: "Can't predict workflow until you click Apply",
      icon: "❓",
    },
    {
      problem: "Tailoring resumes per job",
      pain: "Need multiple resume versions, hard to track which went where",
      icon: "🎯",
    },
    {
      problem: "No centralized application tracking",
      pain: "Lose track of what you applied to, when, and what version",
      icon: "📊",
    },
    {
      problem: "References and supplemental info",
      pain: "Re-typing the same 3 references on every single application",
      icon: "👥",
    },
    {
      problem: "Cover letter variation",
      pain: "Same base letter needs customization per role",
      icon: "✉️",
    },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
      {problems.map((p, i) => (
        <div
          key={i}
          style={{
            background: colors.surface,
            border: `1px solid ${colors.border}`,
            borderRadius: 8,
            padding: 14,
            display: "flex",
            gap: 12,
            alignItems: "flex-start",
          }}
        >
          <span style={{ fontSize: 22, flexShrink: 0 }}>{p.icon}</span>
          <div>
            <div style={{ color: colors.text, fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{p.problem}</div>
            <div style={{ color: colors.danger, fontSize: 12, opacity: 0.8 }}>{p.pain}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

const ArchitectureSection = () => (
  <div>
    <p style={{ color: colors.textMuted, fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>
      Building on Henry's sketch, here's the expanded architecture. The app is called <strong style={{ color: colors.accent }}>DizzyResume</strong> (keeping his naming). It's a three-component system:
    </p>
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {[
        {
          num: "1",
          name: "DizzyResume Desktop App",
          tech: "Tauri (Rust backend + Web frontend)",
          color: colors.accent,
          details: [
            "Local SQLite database stores all user profiles, resume templates, references, cover letters, application history",
            "Runs a lightweight local HTTP server (localhost:9741) that the browser extension communicates with",
            "Full CRUD interface for managing resume data, templates, and profiles",
            "Multi-user support — each of the 3-5 people gets their own encrypted profile",
            "Export/import profiles for backup",
            "Application tracker dashboard with stats",
          ],
        },
        {
          num: "2",
          name: "DizzyResume Browser Extension",
          tech: "Chrome Extension (Manifest V3) — replaces Tampermonkey",
          color: colors.info,
          details: [
            "Detects when you're on a known ATS domain (Workday, Greenhouse, Lever, etc.)",
            "Scans the page DOM for form fields and classifies them (name, email, phone, experience, education, etc.)",
            "Communicates with the desktop app via localhost API to fetch the right profile data",
            "Injects a floating sidebar/panel UI for one-click filling, field-by-field control, and template selection",
            "Handles the messy reality: React controlled inputs, shadow DOM, iframes, dynamically loaded fields",
            "ATS-specific adapters — custom fill logic per platform because each one is different",
          ],
        },
        {
          num: "3",
          name: "Field Mapping Engine",
          tech: "The intelligence layer (Henry's crossing arrows)",
          color: colors.success,
          details: [
            "Maintains a registry of known ATS field patterns — CSS selectors, aria-labels, placeholder text, input names",
            "Fuzzy matching: when it encounters an unknown field, it attempts to classify it based on label text and context",
            "User can manually map any unrecognized field to a resume data field — that mapping is saved for next time",
            "Community mappings: users can export/share their field mappings for new ATS platforms",
            "Handles multi-step forms — tracks which page you're on and which fields have been filled",
          ],
        },
      ].map((layer) => (
        <div
          key={layer.num}
          style={{
            background: colors.surface,
            border: `1px solid ${colors.border}`,
            borderRadius: 10,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              background: `linear-gradient(90deg, ${layer.color}15, transparent)`,
              borderBottom: `1px solid ${colors.border}`,
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <span
              style={{
                background: layer.color,
                color: colors.bg,
                width: 28,
                height: 28,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: 14,
                flexShrink: 0,
              }}
            >
              {layer.num}
            </span>
            <div>
              <div style={{ color: colors.text, fontWeight: 700, fontSize: 15 }}>{layer.name}</div>
              <div style={{ color: layer.color, fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}>{layer.tech}</div>
            </div>
          </div>
          <div style={{ padding: 16 }}>
            {layer.details.map((d, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "flex-start" }}>
                <span style={{ color: layer.color, fontSize: 10, marginTop: 5, flexShrink: 0 }}>●</span>
                <span style={{ color: colors.textMuted, fontSize: 13, lineHeight: 1.6 }}>{d}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
    <div
      style={{
        marginTop: 16,
        background: `linear-gradient(135deg, ${colors.accentDim}20, ${colors.surface})`,
        border: `1px solid ${colors.accent}30`,
        borderRadius: 8,
        padding: 16,
      }}
    >
      <div style={{ color: colors.accent, fontWeight: 700, fontSize: 14, marginBottom: 8 }}>
        Why Chrome Extension instead of Tampermonkey?
      </div>
      <p style={{ color: colors.textMuted, fontSize: 13, lineHeight: 1.7, margin: 0 }}>
        Henry's instinct to use Tampermonkey was good — it's fast to prototype and can inject JS into any page. But for a production tool serving 3-5 people, a proper Chrome extension gives you: persistent background service workers (for tracking which tabs are ATS pages), proper storage APIs, popup UI for quick actions, the ability to communicate with the localhost Tauri app via native messaging or HTTP, and content scripts that can run before the page loads. Tampermonkey is perfect for the early prototyping phase though — Henry could start there and graduate to a full extension.
      </p>
    </div>
  </div>
);

const FeaturesSection = () => {
  const [expandedFeature, setExpandedFeature] = useState(null);
  const featureGroups = [
    {
      group: "Profile & Data Management",
      color: colors.accent,
      features: [
        {
          name: "Multi-Profile System",
          detail: "Each user has their own profile with personal info, work history, education, skills, certifications. Support for multiple resume 'variants' per user — like a 'Data Analytics' resume vs an 'HR' resume vs a 'General' resume. Each variant stores different emphasis, bullet points, and summary text.",
        },
        {
          name: "Template Engine",
          detail: "Structured templates for: resume content blocks (summary, experience entries, education entries, skills lists), cover letter bases with merge fields ({company_name}, {role_title}, {specific_skill}), reference sheets with 3-5 references per template, common Q&A answers (like 'are you authorized to work in the US', salary expectations, start date, etc.).",
        },
        {
          name: "Document Storage",
          detail: "Store actual PDF/DOCX files of your polished resumes and cover letters ready for upload. Tag them by role type, date, version. One-click copy to clipboard for any text field.",
        },
        {
          name: "Smart Snippets",
          detail: "Reusable text blocks for common application questions. 'Tell us about a time you led a team' — have 3-4 versions ready to go. Searchable by keyword and taggable by competency area.",
        },
      ],
    },
    {
      group: "Browser Autofill Engine",
      color: colors.info,
      features: [
        {
          name: "ATS Detection",
          detail: "Automatically detects which ATS you're on based on URL patterns and DOM structure. Known patterns: myworkdayjobs.com, boards.greenhouse.io, jobs.lever.co, icims.com, recruiting.paylocity.com, workforcenow.adp.com, bamboohr.com, etc. Falls back to generic form detection for unknown sites.",
        },
        {
          name: "Intelligent Field Mapping",
          detail: "Reads form field labels, placeholders, aria-labels, and nearby text to determine what data goes where. Uses a priority system: exact CSS selector match → label text match → fuzzy match → ask the user. Handles dropdowns (country, state), date pickers, radio buttons, checkboxes, file upload fields, and rich text editors.",
        },
        {
          name: "Controlled Input Handling",
          detail: "The hardest technical challenge. React-based ATS forms (like Workday) use controlled inputs where simply setting .value doesn't work. The extension must trigger the correct React synthetic events (onChange, onBlur, onInput) by finding the React fiber node and dispatching events properly. Each ATS needs its own adapter for this.",
        },
        {
          name: "Multi-Step Form Navigation",
          detail: "Tracks your progress through multi-page applications. Remembers which fields you've filled on each step. Can auto-advance to the next page after filling (optional). Handles the common pattern of 'upload resume → parse → show pre-filled form → correct errors'.",
        },
        {
          name: "File Upload Automation",
          detail: "Automatically selects the right resume/cover letter PDF from your stored documents when it detects a file upload field. Uses the DataTransfer API to programmatically set files on input[type=file] elements.",
        },
      ],
    },
    {
      group: "Application Tracker",
      color: colors.success,
      features: [
        {
          name: "Auto-Logging",
          detail: "When you complete an application through the extension, it automatically logs: company name, job title, URL, ATS platform, date applied, which resume/cover letter version was used, salary listed (if any), and any notes you add.",
        },
        {
          name: "Status Pipeline",
          detail: "Kanban-style board: Bookmarked → Applied → Phone Screen → Interview → Offer → Rejected → Withdrawn. Drag and drop to update status. Color-coded by age (green = fresh, yellow = been a while, red = stale).",
        },
        {
          name: "Spreadsheet Export",
          detail: "One-click export to CSV/XLSX with all tracked applications. Columns: Company, Title, Location, Date Applied, Status, Resume Used, URL, Notes, Days Since Applied.",
        },
        {
          name: "Daily Goals & Stats",
          detail: "Set a daily application target (e.g., 10/day). Dashboard shows: applications this week, response rate, average time per application, most-used resume variant, ATS platforms encountered.",
        },
      ],
    },
    {
      group: "Job Discovery & Alerts",
      color: colors.purple,
      features: [
        {
          name: "Unified Job Feed",
          detail: "Aggregate job listings from LinkedIn, Indeed, and Glassdoor RSS/API feeds into one view within the desktop app. Filter by title keywords, location, salary range, remote/hybrid/onsite, and date posted.",
        },
        {
          name: "ATS Direct Search",
          detail: "Search ATS platforms directly using the URL patterns: site:boards.greenhouse.io 'data analyst' 'Chicago'. Built-in Google search templates for each major ATS. Find jobs that never make it to LinkedIn.",
        },
        {
          name: "Duplicate Detection",
          detail: "Flags jobs you've already applied to or bookmarked, even if they appear on a different job board. Uses company name + title fuzzy matching.",
        },
      ],
    },
    {
      group: "Quality of Life",
      color: colors.cyan,
      features: [
        {
          name: "Credential Vault",
          detail: "Encrypted storage for ATS login credentials. Auto-fill login forms when you land on a platform you've used before. Master password protected. Note: this is convenience, not a replacement for a proper password manager — but it prevents the 'which email did I use for Workday?' problem.",
        },
        {
          name: "Cover Letter Assembler",
          detail: "Template-based cover letter builder. Pick a base template, it auto-fills company name and role. You customize 1-2 paragraphs explaining your specific fit. Saves the assembled version linked to that application.",
        },
        {
          name: "Quick-Copy Floating Panel",
          detail: "When the extension is active, a small floating panel appears in the browser with one-click copy buttons for: phone number, email, LinkedIn URL, address, and any custom snippets. No more switching tabs to find your own info.",
        },
        {
          name: "Undo / Review Before Submit",
          detail: "After autofilling, the extension highlights all filled fields in a subtle color so you can review everything before hitting submit. An 'undo all' button restores the form to its pre-fill state.",
        },
      ],
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {featureGroups.map((group) => (
        <div key={group.group}>
          <div
            style={{
              color: group.color,
              fontSize: 15,
              fontWeight: 700,
              marginBottom: 10,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span style={{ width: 12, height: 2, background: group.color, borderRadius: 1 }} />
            {group.group}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {group.features.map((f) => {
              const isExpanded = expandedFeature === f.name;
              return (
                <div
                  key={f.name}
                  onClick={() => setExpandedFeature(isExpanded ? null : f.name)}
                  style={{
                    background: isExpanded ? colors.surfaceHover : colors.surface,
                    border: `1px solid ${isExpanded ? group.color + "40" : colors.border}`,
                    borderRadius: 8,
                    padding: "12px 16px",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: colors.text, fontSize: 14, fontWeight: 600 }}>{f.name}</span>
                    <span style={{ color: colors.textDim, fontSize: 18, transform: isExpanded ? "rotate(45deg)" : "none", transition: "transform 0.2s" }}>+</span>
                  </div>
                  {isExpanded && (
                    <p style={{ color: colors.textMuted, fontSize: 13, lineHeight: 1.7, marginTop: 10, marginBottom: 0 }}>
                      {f.detail}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

const ATSSection = () => {
  const platforms = [
    { name: "Workday", domains: "myworkdayjobs.com, wd5.myworkdayjobs.com", difficulty: "Hard", note: "React-based, controlled inputs, multi-step. Most common enterprise ATS. Must-have.", share: "~18%" },
    { name: "Greenhouse", domains: "boards.greenhouse.io, job-boards.greenhouse.io", difficulty: "Medium", note: "Two versions (old boards vs new job-boards). Well-structured HTML. Good starting point.", share: "~15%" },
    { name: "Lever", domains: "jobs.lever.co", difficulty: "Medium", note: "Clean forms, reasonable DOM structure. Often used by tech companies.", share: "~8%" },
    { name: "iCIMS", domains: "icims.com/jobs", difficulty: "Hard", note: "Legacy interface, complex iframe usage, but very common in enterprise.", share: "~11%" },
    { name: "Taleo (Oracle)", domains: "taleo.net/careersection", difficulty: "Hard", note: "Older technology, heavy iframe usage, session-dependent. Declining but still everywhere.", share: "~9%" },
    { name: "ADP Workforce", domains: "workforcenow.adp.com", difficulty: "Medium", note: "Common for SMBs. Reasonably standard form structure.", share: "~7%" },
    { name: "BambooHR", domains: "bamboohr.com", difficulty: "Easy", note: "Simple forms, good labeling. Quick win for implementation.", share: "~5%" },
    { name: "Ashby", domains: "ashbyhq.com", difficulty: "Easy", note: "Modern, clean DOM. Growing fast in tech.", share: "~4%" },
    { name: "SmartRecruiters", domains: "smartrecruiters.com", difficulty: "Medium", note: "Used by large enterprises. Decent form structure.", share: "~5%" },
    { name: "Paylocity", domains: "recruiting.paylocity.com", difficulty: "Medium", note: "Common in mid-market. Standard form patterns.", share: "~4%" },
    { name: "Jobvite", domains: "jobvite.com", difficulty: "Medium", note: "Moderate complexity. Used across industries.", share: "~3%" },
    { name: "JazzHR", domains: "applytojob.com", difficulty: "Easy", note: "Simple SMB-focused ATS. Very straightforward forms.", share: "~3%" },
  ];

  const diffColor = { Easy: colors.success, Medium: colors.accent, Hard: colors.danger };

  return (
    <div>
      <p style={{ color: colors.textMuted, fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>
        Priority targets based on market share and likelihood of encountering them. Henry should tackle these roughly in order of difficulty — start with the easy wins to build momentum and test the mapping engine.
      </p>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
              {["Platform", "Domain Pattern", "Difficulty", "Market Share", "Notes"].map((h) => (
                <th key={h} style={{ color: colors.textDim, fontWeight: 600, textAlign: "left", padding: "8px 12px", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {platforms.map((p, i) => (
              <tr key={i} style={{ borderBottom: `1px solid ${colors.border}08` }}>
                <td style={{ padding: "10px 12px", color: colors.text, fontWeight: 600 }}>{p.name}</td>
                <td style={{ padding: "10px 12px", color: colors.textDim, fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>{p.domains}</td>
                <td style={{ padding: "10px 12px" }}>
                  <span style={{ color: diffColor[p.difficulty], fontWeight: 600, fontSize: 12 }}>{p.difficulty}</span>
                </td>
                <td style={{ padding: "10px 12px", color: colors.textMuted }}>{p.share}</td>
                <td style={{ padding: "10px 12px", color: colors.textMuted, maxWidth: 250 }}>{p.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const StackSection = () => {
  const stack = [
    {
      layer: "Desktop App Shell",
      choice: "Tauri v2",
      lang: "Rust",
      why: "Henry wants Rust — Tauri delivers. 95% smaller than Electron, native OS integration, compiles to a tiny Windows .exe. The Rust backend handles all data storage, local API server, and file management.",
    },
    {
      layer: "Desktop Frontend",
      choice: "React + Vite",
      lang: "TypeScript",
      why: "Runs inside Tauri's webview. Handles the profile manager, template editor, application tracker dashboard, and settings. Could also use Svelte or SolidJS if Henry prefers.",
    },
    {
      layer: "Database",
      choice: "SQLite (via rusqlite)",
      lang: "SQL",
      why: "Single file, no server needed, perfect for a local desktop app. Stores profiles, templates, mappings, application history. Encrypted with SQLCipher for multi-user security.",
    },
    {
      layer: "Local API",
      choice: "Actix-web or Axum",
      lang: "Rust",
      why: "Runs a tiny HTTP server on localhost:9741 that the browser extension calls to fetch profile data, save applications, and get templates. Tauri can embed this in its backend.",
    },
    {
      layer: "Browser Extension",
      choice: "Chrome Extension (Manifest V3)",
      lang: "TypeScript",
      why: "Content scripts for DOM manipulation, background service worker for ATS detection, popup UI for quick actions. Communicates with the Tauri app over localhost HTTP.",
    },
    {
      layer: "Field Detection",
      choice: "Custom DOM traversal + heuristics",
      lang: "TypeScript",
      why: "No ML needed initially. Pattern matching on label text, input names, aria-labels, and CSS classes. A decision tree that classifies fields into resume data categories. Can add ML later if needed.",
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {stack.map((s, i) => (
        <div
          key={i}
          style={{
            background: colors.surface,
            border: `1px solid ${colors.border}`,
            borderRadius: 8,
            padding: 16,
            display: "grid",
            gridTemplateColumns: "180px 140px 1fr",
            gap: 16,
            alignItems: "start",
          }}
        >
          <div>
            <div style={{ color: colors.textDim, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Layer</div>
            <div style={{ color: colors.text, fontSize: 14, fontWeight: 600 }}>{s.layer}</div>
          </div>
          <div>
            <div style={{ color: colors.textDim, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Choice</div>
            <div style={{ color: colors.accent, fontSize: 13, fontWeight: 600 }}>{s.choice}</div>
            <div style={{ color: colors.textDim, fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}>{s.lang}</div>
          </div>
          <div>
            <div style={{ color: colors.textDim, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Rationale</div>
            <div style={{ color: colors.textMuted, fontSize: 13, lineHeight: 1.6 }}>{s.why}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

const PhasesSection = () => {
  const phases = [
    {
      phase: "Phase 1 — Foundation",
      time: "2-3 weeks",
      color: colors.info,
      tasks: [
        "Set up Tauri v2 project with React frontend",
        "Design and implement SQLite schema for profiles, templates, application history",
        "Build profile CRUD: personal info, work history, education, skills, references",
        "Build template manager: create/edit/tag resume content blocks",
        "Local API server on localhost:9741 with basic endpoints",
        "Basic Chrome extension scaffold with popup and content script",
      ],
    },
    {
      phase: "Phase 2 — Core Autofill",
      time: "3-4 weeks",
      color: colors.accent,
      tasks: [
        "ATS detection engine (URL pattern matching)",
        "Generic form field scanner and classifier",
        "Greenhouse adapter (easiest ATS to start with)",
        "BambooHR adapter (second easiest)",
        "Lever adapter",
        "Floating sidebar UI in browser for field selection and fill control",
        "File upload automation for resume/cover letter PDFs",
      ],
    },
    {
      phase: "Phase 3 — Hard Mode",
      time: "3-4 weeks",
      color: colors.danger,
      tasks: [
        "Workday adapter (React controlled inputs, multi-step forms)",
        "iCIMS adapter (iframes, legacy DOM)",
        "Taleo adapter (session management, complex navigation)",
        "ADP Workforce adapter",
        "Generic fallback adapter for unknown ATS platforms",
        "User-assisted field mapping: 'What should this field map to?'",
        "Save and share custom field mappings",
      ],
    },
    {
      phase: "Phase 4 — Tracker & Polish",
      time: "2-3 weeks",
      color: colors.success,
      tasks: [
        "Application auto-logging on successful form submission",
        "Kanban tracker dashboard in Tauri app",
        "CSV/XLSX export",
        "Daily goals and statistics",
        "Cover letter assembler with merge fields",
        "Credential vault with encryption",
        "Quick-copy floating panel",
        "Review/undo highlighting after autofill",
      ],
    },
    {
      phase: "Phase 5 — Discovery & Scale",
      time: "2-3 weeks",
      color: colors.purple,
      tasks: [
        "Job feed aggregation (RSS/scraping from job boards)",
        "ATS direct search templates",
        "Duplicate job detection",
        "Multi-user testing with the full group of 3-5 people",
        "Bug fixes from real-world usage across different industries",
        "SmartRecruiters, Paylocity, Jobvite, JazzHR adapters",
        "Documentation and onboarding guide for new users",
      ],
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {phases.map((p, i) => (
        <div
          key={i}
          style={{
            background: colors.surface,
            border: `1px solid ${colors.border}`,
            borderRadius: 10,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              background: `linear-gradient(90deg, ${p.color}18, transparent)`,
              borderBottom: `1px solid ${colors.border}`,
              padding: "10px 16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ color: p.color, fontWeight: 700, fontSize: 14 }}>{p.phase}</span>
            <span style={{ color: colors.textDim, fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}>{p.time}</span>
          </div>
          <div style={{ padding: 16 }}>
            {p.tasks.map((t, j) => (
              <div key={j} style={{ display: "flex", gap: 10, marginBottom: 6, alignItems: "flex-start" }}>
                <span style={{ color: colors.textDim, fontSize: 10, marginTop: 5 }}>◻</span>
                <span style={{ color: colors.textMuted, fontSize: 13, lineHeight: 1.5 }}>{t}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
      <div style={{ color: colors.textDim, fontSize: 12, textAlign: "center", fontStyle: "italic" }}>
        Total estimated build time: 12-17 weeks for one developer (Henry). Faster with pair programming or if Claude is helping write adapters.
      </div>
    </div>
  );
};

const RisksSection = () => {
  const risks = [
    {
      risk: "ATS platforms update their DOM structure",
      severity: "High",
      mitigation: "Version-tagged adapters with fallback to generic detection. Community-shared mappings mean fixes propagate fast. The field classifier should work even when exact selectors change because it also reads label text.",
    },
    {
      risk: "React controlled inputs resist programmatic filling",
      severity: "High",
      mitigation: "This is the hardest problem. Study how Job App Filler (open source) solves it for Workday — they find the React fiber internals and dispatch proper synthetic events. Henry can use their approach as a reference. For each ATS adapter, the fill logic needs to match how that specific framework handles state.",
    },
    {
      risk: "Chrome Extension store rejection",
      severity: "Medium",
      mitigation: "Since this is for 3-5 private users, distribute as an unpacked extension loaded in developer mode. No need for the Chrome Web Store. If you want store distribution later, ensure compliance with Manifest V3 policies.",
    },
    {
      risk: "ATS sites detect and block automation",
      severity: "Medium",
      mitigation: "The extension fills fields with human-plausible timing (slight random delays between fields). It doesn't submit forms automatically — the user always clicks submit. This is fundamentally a data entry assistant, not a bot. Most ATS anti-automation targets things like auto-applying to hundreds of jobs, not filling in your own info.",
    },
    {
      risk: "iFrame and Shadow DOM isolation",
      severity: "Medium",
      mitigation: "Content scripts with all_frames: true in manifest.json to inject into iframes. For shadow DOM, use element.shadowRoot traversal. Some ATS platforms (especially older ones) use nested iframes heavily — each needs its own content script instance.",
    },
    {
      risk: "Multi-user data security",
      severity: "Low",
      mitigation: "SQLCipher encryption on the SQLite database. Each user's profile is password-protected. The localhost API only accepts requests from the local machine (bind to 127.0.0.1, reject any external connections). Data never leaves the device.",
    },
  ];

  const sevColor = { High: colors.danger, Medium: colors.accent, Low: colors.success };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {risks.map((r, i) => (
        <div
          key={i}
          style={{
            background: colors.surface,
            border: `1px solid ${colors.border}`,
            borderRadius: 8,
            padding: 16,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ color: colors.text, fontWeight: 600, fontSize: 14 }}>{r.risk}</span>
            <span
              style={{
                color: sevColor[r.severity],
                fontSize: 11,
                fontWeight: 700,
                background: sevColor[r.severity] + "18",
                padding: "2px 10px",
                borderRadius: 12,
              }}
            >
              {r.severity}
            </span>
          </div>
          <p style={{ color: colors.textMuted, fontSize: 13, lineHeight: 1.7, margin: 0 }}>{r.mitigation}</p>
        </div>
      ))}
    </div>
  );
};

export default function DizzyResumeFramework() {
  const [activeSection, setActiveSection] = useState("sketch");

  const renderContent = () => {
    const section = sections.find((s) => s.id === activeSection);
    if (!section) return null;
    switch (section.content.type) {
      case "sketch": return <SketchSection />;
      case "problems": return <ProblemsSection />;
      case "architecture": return <ArchitectureSection />;
      case "features": return <FeaturesSection />;
      case "ats": return <ATSSection />;
      case "stack": return <StackSection />;
      case "phases": return <PhasesSection />;
      case "risks": return <RisksSection />;
      default: return null;
    }
  };

  return (
    <div
      style={{
        background: colors.bg,
        minHeight: "100vh",
        fontFamily: "'Segoe UI', -apple-system, sans-serif",
        color: colors.text,
      }}
    >
      <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet" />
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 20px" }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <span style={{ fontSize: 28 }}>⚡</span>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: colors.accent, letterSpacing: "-0.02em" }}>
              DizzyResume
            </h1>
          </div>
          <p style={{ color: colors.textMuted, fontSize: 15, margin: 0, lineHeight: 1.6, maxWidth: 700 }}>
            Complete framework for Henry's job application automation tool.
            A Tauri + Chrome Extension system that turns 45-minute applications into 5-minute ones.
          </p>
        </div>

        {/* Navigation */}
        <div
          style={{
            display: "flex",
            gap: 6,
            marginBottom: 24,
            flexWrap: "wrap",
            borderBottom: `1px solid ${colors.border}`,
            paddingBottom: 16,
          }}
        >
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              style={{
                background: activeSection === s.id ? colors.accent + "18" : "transparent",
                border: `1px solid ${activeSection === s.id ? colors.accent + "40" : colors.border}`,
                borderRadius: 6,
                padding: "8px 14px",
                color: activeSection === s.id ? colors.accent : colors.textMuted,
                cursor: "pointer",
                fontSize: 13,
                fontWeight: activeSection === s.id ? 600 : 400,
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span style={{ fontSize: 14 }}>{s.icon}</span>
              {s.title}
            </button>
          ))}
        </div>

        {/* Content */}
        <div
          style={{
            background: `linear-gradient(180deg, ${colors.surface}80, transparent)`,
            border: `1px solid ${colors.border}`,
            borderRadius: 12,
            padding: 24,
          }}
        >
          <h2 style={{ margin: "0 0 20px 0", fontSize: 20, fontWeight: 700, color: colors.text }}>
            {sections.find((s) => s.id === activeSection)?.icon}{" "}
            {sections.find((s) => s.id === activeSection)?.title}
          </h2>
          {renderContent()}
        </div>

        {/* Footer */}
        <div style={{ marginTop: 24, padding: 16, textAlign: "center" }}>
          <p style={{ color: colors.textDim, fontSize: 12, margin: 0 }}>
            Built as a framework reference for Henry. Key open-source references: Job App Filler (Workday adapter patterns),
            Autofill-Jobs (Greenhouse/Lever/Workday), AI-Job-Autofill (multi-ATS with AI).
            All stored locally, all private, all yours.
          </p>
        </div>
      </div>
    </div>
  );
}
