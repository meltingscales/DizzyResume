import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { TagInput } from '../ui/TagInput';
import { api } from '../../lib/api';
import type { Template, CreateTemplateInput, UpdateTemplateInput } from '../../types';

interface TemplateModalProps {
  template?: Template;
  onClose: () => void;
  onSave: (template: Template) => void;
}

const KINDS = [
  { value: 'cover-letter', label: 'Cover Letter' },
  { value: 'references', label: 'Reference Sheet' },
  { value: 'qa', label: 'Q&A Answer' },
];

export function TemplateModal({ template, onClose, onSave }: TemplateModalProps) {
  const [kind, setKind] = useState(template?.type ?? 'cover-letter');
  const [title, setTitle] = useState(template?.title ?? '');
  const [description, setDescription] = useState(template?.description ?? '');
  const [content, setContent] = useState(template?.content ?? '');
  const [variables, setVariables] = useState<string[]>(template?.variables ?? []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      let saved: Template;
      if (template) {
        const input: UpdateTemplateInput = { title, description, content, variables };
        saved = await api.templates.update(template.id, input);
      } else {
        const input: CreateTemplateInput = { type: kind, title, description, content, variables };
        saved = await api.templates.create(input);
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
      title={template ? 'Edit Template' : 'New Template'}
      onClose={onClose}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type — only editable on create */}
        <div>
          <label className={labelClass}>Type</label>
          <select
            className={inputClass}
            value={kind}
            onChange={(e) => setKind(e.target.value)}
            disabled={!!template}
          >
            {KINDS.map((k) => (
              <option key={k.value} value={k.value}>
                {k.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>
            Title <span className="text-destructive">*</span>
          </label>
          <input
            className={inputClass}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Cover Letter – General"
            autoFocus
          />
        </div>

        <div>
          <label className={labelClass}>Description</label>
          <input
            className={inputClass}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief note about when to use this template"
          />
        </div>

        <div>
          <label className={labelClass}>Content</label>
          <p className="text-xs text-muted-foreground mb-1">
            Use <code className="bg-secondary px-1 rounded">{'{variable}'}</code> for merge fields.
          </p>
          <textarea
            className={`${inputClass} resize-none`}
            rows={10}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Dear {hiring_manager},&#10;&#10;I am writing to express my interest in the {role} position at {company}…"
          />
        </div>

        <div>
          <label className={labelClass}>Variables</label>
          <p className="text-xs text-muted-foreground mb-1">
            List the merge field names used in the content above (without braces).
          </p>
          <TagInput
            tags={variables}
            onChange={setVariables}
            placeholder="company, role, hiring_manager…"
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
            {template ? 'Save Changes' : 'Create Template'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
