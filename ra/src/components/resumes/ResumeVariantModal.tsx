import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { api } from '../../lib/api';
import type { ResumeVariant, CreateResumeVariantInput, UpdateResumeVariantInput } from '../../types';

interface ResumeVariantModalProps {
  profileId: string;
  variant?: ResumeVariant;
  onClose: () => void;
  onSave: (variant: ResumeVariant) => void;
}

export function ResumeVariantModal({
  profileId,
  variant,
  onClose,
  onSave,
}: ResumeVariantModalProps) {
  const [name, setName] = useState(variant?.name ?? '');
  const [description, setDescription] = useState(variant?.description ?? '');
  const [content, setContent] = useState(variant?.content ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Name is required.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      let saved: ResumeVariant;
      if (variant) {
        const input: UpdateResumeVariantInput = { name, description, content };
        saved = await api.resumes.update(variant.id, input);
      } else {
        const input: CreateResumeVariantInput = { profile_id: profileId, name, description, content };
        saved = await api.resumes.create(input);
      }
      onSave(saved);
    } catch (e) {
      setError(String(e));
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    'w-full px-3 py-2 bg-secondary border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary';
  const labelClass = 'block text-sm font-medium mb-1';

  return (
    <Modal
      title={variant ? 'Edit Resume Variant' : 'New Resume Variant'}
      onClose={onClose}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={labelClass}>
            Name <span className="text-destructive">*</span>
          </label>
          <input
            className={inputClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Data Analytics, General, HR Focus"
            autoFocus
          />
        </div>

        <div>
          <label className={labelClass}>Description</label>
          <input
            className={inputClass}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What roles or industries is this variant tailored for?"
          />
        </div>

        <div>
          <label className={labelClass}>Content</label>
          <p className="text-xs text-muted-foreground mb-1">
            Paste the full text of your resume. This is stored locally and sent to Horus for autofill.
          </p>
          <textarea
            className={`${inputClass} resize-none font-mono text-xs leading-relaxed`}
            rows={16}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste your resume text here…"
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm bg-secondary hover:bg-secondary/80 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {variant ? 'Save Changes' : 'Create Variant'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
