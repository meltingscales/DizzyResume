# Item 2: PDF File Storage + File Upload Automation

## Goal
Store PDF resume/cover-letter files in Ra, serve them via Hapi's Flow,
and let Horus attach them to `input[type=file]` fields in ATS forms using
the DataTransfer API. Solves the last major "still requires manual action"
gap in the autofill flow.

---

## Part A — Ra (desktop app)

### A1. New SQLite table: `resume_files`
Add to `db.rs` SCHEMA constant:
```sql
CREATE TABLE IF NOT EXISTS resume_files (
    id          TEXT PRIMARY KEY,
    profile_id  TEXT NOT NULL,
    variant_id  TEXT,             -- optional link to a resume_variants row
    label       TEXT NOT NULL,    -- user-facing name, e.g. "SWE Resume 2024"
    kind        TEXT NOT NULL DEFAULT 'resume',  -- 'resume' | 'cover-letter'
    filename    TEXT NOT NULL,    -- original filename kept for download
    file_path   TEXT NOT NULL,    -- absolute path: {app_data_dir}/files/{uuid}.pdf
    size_bytes  INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT NOT NULL,
    FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
);
```
Files are stored at `{app_data_dir}/files/` (create dir on first use).

### A2. New Rust models (`models.rs`)
```rust
pub struct ResumeFile {
    pub id: String,
    pub profile_id: String,
    pub variant_id: Option<String>,
    pub label: String,
    pub kind: String,
    pub filename: String,
    pub file_path: String,
    pub size_bytes: i64,
    pub created_at: String,
}

pub struct ImportResumeFileInput {
    pub profile_id: String,
    pub variant_id: Option<String>,
    pub label: String,
    pub kind: String,  // "resume" | "cover-letter"
}
```

### A3. New Tauri commands (`commands.rs`)
- `import_resume_file(db, input)` — opens native file picker (PDF only),
  copies selected file to `{app_data_dir}/files/{uuid}.pdf`,
  inserts DB row, returns `ResumeFile`.
  Needs `tauri-plugin-dialog` (already in Cargo.toml) for the file picker.
  Use `std::fs::copy` to copy the file.
- `get_resume_files(db, profile_id)` — list all files for a profile,
  ordered by `created_at DESC`.
- `delete_resume_file(db, id)` — read `file_path` from DB, delete file
  from disk with `std::fs::remove_file`, then delete DB row.

Register all three in `lib.rs`.

### A4. New Hapi's Flow routes (`server.rs`)
- `GET /profiles/:id/files` — returns `Vec<ResumeFile>` JSON for a profile.
  Horus calls this to know what files are available.
- `GET /files/:id/download` — serves raw PDF bytes.
  Read `file_path` from DB, read file with `std::fs::read`,
  return as axum `Response` with headers:
  - `Content-Type: application/pdf`
  - `Content-Disposition: attachment; filename="{filename}"`

  Note: axum's `into_response()` with a `Vec<u8>` body + explicit headers
  works well here. Use `axum::response::Response` builder.

### A5. TypeScript types + api wrappers
Add to `ra/src/types/index.ts`:
```ts
export type ResumeFileKind = 'resume' | 'cover-letter';

export interface ResumeFile {
  id: string;
  profile_id: string;
  variant_id: string | null;
  label: string;
  kind: ResumeFileKind;
  filename: string;
  file_path: string;
  size_bytes: number;
  created_at: string;
}

export interface ImportResumeFileInput {
  profile_id: string;
  variant_id: string | null;
  label: string;
  kind: string;
}
```

Add to `ra/src/lib/api.ts` under `api.files`:
```ts
files: {
  list: (profileId: string) => invoke<ResumeFile[]>('get_resume_files', { profileId }),
  import: (input: ImportResumeFileInput) => invoke<ResumeFile>('import_resume_file', { input }),
  delete: (id: string) => invoke<void>('delete_resume_file', { id }),
},
```

### A6. New Ra UI component: `FilesView` (or tab within ResumesView)
Consider adding a "Files" tab to ResumesView rather than a new top-level view,
since files are closely tied to variants.

UI layout:
- Two sections: "Resumes" and "Cover Letters", separated
- Each file card: label, filename, linked variant name (or "—"), file size,
  date added, delete button
- "Import Resume PDF" and "Import Cover Letter PDF" buttons at top
- Import flow: click button → Tauri file dialog → (optional) label input modal
  showing the filename as default label, variant selector dropdown → save

Import modal fields:
- Label (pre-filled from filename, editable)
- Kind (pre-selected based on which button was clicked)
- Link to variant (optional dropdown)

---

## Part B — Horus (browser extension)

### B1. New module: `horus/src/files.ts`
```ts
import { raApi } from './api';

export interface ResumeFileInfo {
  id: string;
  label: string;
  kind: 'resume' | 'cover-letter';
  filename: string;
  variant_id: string | null;
}

/** Fetch list of stored files for a profile from Ra. */
export async function fetchProfileFiles(profileId: string): Promise<ResumeFileInfo[]>

/** Attach a stored file to a file input using the DataTransfer API. */
export async function attachFileToInput(
  input: HTMLInputElement,
  fileId: string,
  filename: string,
): Promise<void>
```

`attachFileToInput` implementation:
```ts
const resp = await fetch(`http://127.0.0.1:9741/files/${fileId}/download`);
const blob = await resp.blob();
const file = new File([blob], filename, { type: 'application/pdf' });
const dt = new DataTransfer();
dt.items.add(file);
input.files = dt.files;
// Fire both events — React/Vue apps need input + change
input.dispatchEvent(new Event('input', { bubbles: true }));
input.dispatchEvent(new Event('change', { bubbles: true }));
```

### B2. `scanFileInputs()` in `content.ts`
Find visible `input[type=file]` elements whose context suggests a
resume/CV upload:
```ts
function scanFileInputs(): HTMLInputElement[] {
  return Array.from(document.querySelectorAll<HTMLInputElement>('input[type=file]'))
    .filter((el) => {
      if (!isVisible(el)) return false;
      const label = getFieldLabel(el).toLowerCase();
      const accept = (el.getAttribute('accept') ?? '').toLowerCase();
      // Include if: accepts PDF, or label mentions resume/cv/upload
      return accept.includes('pdf') || accept === '' ||
        /resume|cv|curriculum|upload|attach|document/i.test(label);
    });
}
```

### B3. `showFileUploadSection()` in `content.ts`
Called after fill completes (in `updateBesPanel()` fill handler, alongside
`showUnknownFields()`). Fetches file list from Ra, renders section in Bes panel.

Logic:
1. Scan for file inputs with `scanFileInputs()`
2. If none found, or Ra not reachable, hide section and return
3. Fetch `fetchProfileFiles(profile.id)`
4. If no files stored, show a "No files stored — import PDFs in Ra" message
5. For each detected file input:
   - Render a row: label text, file selector `<select>`, "Attach" button
   - Pre-select: if current variant's `variant_id` matches a file, select it;
     else select first file of kind 'resume'
6. On "Attach" click: call `attachFileToInput`, show ✓ confirmation

### B4. Bes panel HTML additions (`createBesPanel()`)
Add below `#horus-unknown-fields`:
```html
<div id="horus-file-section" style="display:none">
  <div class="horus-section-title">📎 File Uploads</div>
  <div id="horus-file-list"></div>
</div>
```

### B5. CSS additions in `createBesPanel()`
Style the file upload rows consistently with existing unknown-fields rows.

---

## Gotchas / Tricky Bits

1. **Workday custom uploader**: Workday replaces `input[type=file]` with a
   custom widget after page load. `DataTransfer` injection won't work on it.
   `scanFileInputs()` should detect the Workday case and skip (show message).
   Detection: check `currentAdapter?.id === 'workday'` and skip or warn.

2. **React controlled file inputs**: Some ATSes wrap file inputs in React.
   `input.files = dt.files` sets the native property; the `change` event
   should trigger React's synthetic handler. Test on Greenhouse + Lever.

3. **File size**: PDFs can be large. The fetch from `127.0.0.1:9741` is
   local so speed isn't an issue, but don't stream — read fully into memory.

4. **File deletion on disk**: `delete_resume_file` must handle the case where
   the file was already deleted from disk (e.g. manually). Use
   `std::fs::remove_file(...).ok()` (ignore error) then always delete DB row.

5. **manifest.json `host_permissions`**: Content scripts already have
   `http://127.0.0.1:9741/*` from the existing Bes panel fetch calls.
   No manifest changes needed.

---

## Implementation Order
1. A1 (schema) → A2 (models) → A3 (commands) → compile check
2. A4 (server routes) → compile check
3. A5 (TS types + api) → A6 (Ra UI) → TS check
4. B1 (files.ts) → B2-B5 (content.ts changes) → TS check
5. Manual test: import a PDF in Ra, open a Greenhouse job, click Fill, attach
