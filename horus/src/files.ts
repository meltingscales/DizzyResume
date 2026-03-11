/// File upload helpers — fetch stored PDFs from Ra and attach them to
/// input[type=file] elements using the DataTransfer API.

const RA_BASE = 'http://127.0.0.1:9741';

export interface ResumeFileInfo {
  id: string;
  label: string;
  kind: 'resume' | 'cover-letter';
  filename: string;
  variant_id: string | null;
}

/**
 * Fetch the list of stored PDF files for a profile from Hapi's Flow.
 * Returns empty array if Ra is unreachable.
 */
export async function fetchProfileFiles(profileId: string): Promise<ResumeFileInfo[]> {
  try {
    const resp = await fetch(`${RA_BASE}/profiles/${profileId}/files`);
    if (!resp.ok) return [];
    const data = await resp.json();
    return (data as ResumeFileInfo[]) ?? [];
  } catch {
    return [];
  }
}

/**
 * Download a stored file from Ra and attach it to a file input using
 * the DataTransfer API.  Fires both 'input' and 'change' events so
 * React / Vue controlled wrappers pick up the change.
 */
export async function attachFileToInput(
  input: HTMLInputElement,
  fileId: string,
  filename: string,
): Promise<void> {
  const resp = await fetch(`${RA_BASE}/files/${fileId}/download`);
  if (!resp.ok) throw new Error(`Ra returned ${resp.status} for file ${fileId}`);

  const blob = await resp.blob();
  const file = new File([blob], filename, { type: 'application/pdf' });

  const dt = new DataTransfer();
  dt.items.add(file);
  input.files = dt.files;

  // Fire both events — needed for React synthetic handlers
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new Event('change', { bubbles: true }));
}
