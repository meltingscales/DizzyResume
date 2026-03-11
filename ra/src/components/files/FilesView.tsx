import { useEffect, useState } from 'react';
import { FileText, Loader2, Plus, Trash2 } from 'lucide-react';
import { api } from '../../lib/api';
import { useProfile } from '../../lib/ProfileContext';
import type { ResumeFile, ResumeVariant, ImportResumeFileInput } from '../../types';

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ── Import modal ──────────────────────────────────────────────────────────────

function ImportModal({
  profileId,
  defaultKind,
  variants,
  onClose,
  onImported,
}: {
  profileId: string;
  defaultKind: 'resume' | 'cover-letter';
  variants: ResumeVariant[];
  onClose: () => void;
  onImported: (f: ResumeFile) => void;
}) {
  const [label, setLabel] = useState('');
  const [kind, setKind] = useState<'resume' | 'cover-letter'>(defaultKind);
  const [variantId, setVariantId] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImport = async () => {
    setError(null);
    setSaving(true);
    try {
      const input: ImportResumeFileInput = {
        profile_id: profileId,
        variant_id: variantId || null,
        label: label.trim() || (kind === 'resume' ? 'My Resume' : 'Cover Letter'),
        kind,
      };
      const file = await api.files.import(input);
      onImported(file);
    } catch (e) {
      const msg = String(e);
      // User cancelled the file picker — not an error worth showing
      if (msg.includes('No file selected')) {
        onClose();
      } else {
        setError(msg);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-xl w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-semibold text-lg">Import PDF</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-xl leading-none">×</button>
        </div>

        <div className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-destructive/10 text-destructive rounded text-sm border border-destructive/30">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs text-muted-foreground mb-1.5">Label</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder={kind === 'resume' ? 'e.g. Software Engineer Resume' : 'e.g. Cover Letter – General'}
              autoFocus
              className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs text-muted-foreground mb-1.5">Type</label>
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value as 'resume' | 'cover-letter')}
              className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:border-primary"
            >
              <option value="resume">Resume</option>
              <option value="cover-letter">Cover Letter</option>
            </select>
          </div>

          {variants.length > 0 && (
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">
                Link to variant <span className="italic">(optional)</span>
              </label>
              <select
                value={variantId}
                onChange={(e) => setVariantId(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:border-primary"
              >
                <option value="">— none —</option>
                {variants.map((v) => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground mt-1">
                Horus will auto-select this file when that variant is active.
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 p-5 border-t border-border">
          <button onClick={onClose} className="px-4 py-2 text-sm bg-secondary hover:bg-secondary/80 rounded-md">
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={saving}
            className="px-4 py-2 text-sm bg-primary text-primary-foreground hover:bg-primary/90 rounded-md disabled:opacity-50"
          >
            {saving ? 'Picking file…' : 'Choose PDF…'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── File card ─────────────────────────────────────────────────────────────────

function FileCard({
  file,
  variantName,
  onDelete,
}: {
  file: ResumeFile;
  variantName: string | null;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-start gap-3 p-3 bg-card border border-border rounded-lg hover:border-primary/40 transition-colors">
      <FileText className="w-8 h-8 text-primary flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-medium text-sm truncate">{file.label}</span>
          <span className={`text-xs px-1.5 py-0.5 rounded font-semibold flex-shrink-0 ${
            file.kind === 'resume'
              ? 'bg-blue-500/20 text-blue-400'
              : 'bg-purple-500/20 text-purple-400'
          }`}>
            {file.kind === 'resume' ? 'Resume' : 'Cover Letter'}
          </span>
        </div>
        <p className="text-xs text-muted-foreground truncate">{file.filename}</p>
        <div className="flex gap-3 text-xs text-muted-foreground mt-1">
          <span>{formatBytes(file.size_bytes)}</span>
          {variantName && <span>→ {variantName}</span>}
          <span>{new Date(file.created_at).toLocaleDateString()}</span>
        </div>
      </div>
      <button
        onClick={onDelete}
        className="p-1.5 hover:bg-destructive/20 rounded text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
        title="Delete"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ── Main view ─────────────────────────────────────────────────────────────────

export function FilesView() {
  const { activeProfile } = useProfile();
  const profileId = activeProfile?.id ?? null;

  const [files, setFiles] = useState<ResumeFile[]>([]);
  const [variants, setVariants] = useState<ResumeVariant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<'resume' | 'cover-letter' | null>(null);

  useEffect(() => {
    if (!profileId) { setFiles([]); setVariants([]); return; }
    setLoading(true);
    Promise.all([api.files.list(profileId), api.resumes.list(profileId)])
      .then(([f, v]) => { setFiles(f); setVariants(v); })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [profileId]);

  const variantMap = Object.fromEntries(variants.map((v) => [v.id, v.name]));

  const handleDelete = async (file: ResumeFile) => {
    try {
      await api.files.delete(file.id);
      setFiles((prev) => prev.filter((f) => f.id !== file.id));
    } catch (e) {
      setError(String(e));
    }
  };

  const handleImported = (file: ResumeFile) => {
    setFiles((prev) => [file, ...prev]);
    setModal(null);
  };

  const resumes = files.filter((f) => f.kind === 'resume');
  const coverLetters = files.filter((f) => f.kind === 'cover-letter');

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">📄 Files</h1>
            <p className="text-sm text-muted-foreground">
              PDF resumes and cover letters — Horus will attach these automatically
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setModal('resume')}
              disabled={!profileId}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-primary text-primary-foreground hover:bg-primary/90 rounded-md transition-colors disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              Import Resume
            </button>
            <button
              onClick={() => setModal('cover-letter')}
              disabled={!profileId}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-secondary hover:bg-secondary/80 rounded-md transition-colors disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              Import Cover Letter
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mx-4 mt-4 p-3 bg-destructive/10 text-destructive rounded text-sm border border-destructive/30">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          Loading files…
        </div>
      ) : !profileId ? (
        <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
          Select a profile to manage files.
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Resumes */}
          <section>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Resumes ({resumes.length})
            </h2>
            {resumes.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">
                No resume PDFs yet — click "Import Resume" above.
              </p>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {resumes.map((f) => (
                  <FileCard
                    key={f.id}
                    file={f}
                    variantName={f.variant_id ? (variantMap[f.variant_id] ?? null) : null}
                    onDelete={() => handleDelete(f)}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Cover Letters */}
          <section>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Cover Letters ({coverLetters.length})
            </h2>
            {coverLetters.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">
                No cover letter PDFs yet — click "Import Cover Letter" above.
              </p>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {coverLetters.map((f) => (
                  <FileCard
                    key={f.id}
                    file={f}
                    variantName={f.variant_id ? (variantMap[f.variant_id] ?? null) : null}
                    onDelete={() => handleDelete(f)}
                  />
                ))}
              </div>
            )}
          </section>

          {files.length === 0 && (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">📄</div>
              <p className="text-sm text-muted-foreground">Import your polished resume PDFs here.</p>
              <p className="text-xs text-muted-foreground mt-1">
                Horus will attach them automatically when it detects a file upload field.
              </p>
            </div>
          )}
        </div>
      )}

      {modal && profileId && (
        <ImportModal
          profileId={profileId}
          defaultKind={modal}
          variants={variants}
          onClose={() => setModal(null)}
          onImported={handleImported}
        />
      )}
    </div>
  );
}
