import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { TagInput } from '../ui/TagInput';
import { api } from '../../lib/api';
import type { Snippet, CreateSnippetInput, UpdateSnippetInput } from '../../types';

interface SnippetModalProps {
  snippet?: Snippet;
  onClose: () => void;
  onSave: (snippet: Snippet) => void;
}

export function SnippetModal({ snippet, onClose, onSave }: SnippetModalProps) {
  const [title, setTitle] = useState(snippet?.title ?? '');
  const [content, setContent] = useState(snippet?.content ?? '');
  const [tags, setTags] = useState<string[]>(snippet?.tags ?? []);
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
      let saved: Snippet;
      if (snippet) {
        const input: UpdateSnippetInput = { title, content, tags };
        saved = await api.snippets.update(snippet.id, input);
      } else {
        const input: CreateSnippetInput = { title, content, tags };
        saved = await api.snippets.create(input);
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
    <Modal title={snippet ? 'Edit Snippet' : 'New Snippet'} onClose={onClose} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={labelClass}>
            Title <span className="text-destructive">*</span>
          </label>
          <input
            className={inputClass}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Why this company?, Salary expectations"
            autoFocus
          />
        </div>

        <div>
          <label className={labelClass}>Content</label>
          <p className="text-xs text-muted-foreground mb-1">
            Use <code className="bg-secondary px-1 rounded">{'{placeholder}'}</code> for values
            you fill in per application.
          </p>
          <textarea
            className={`${inputClass} resize-none`}
            rows={8}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="I'm drawn to {company} because of your commitment to…"
          />
        </div>

        <div>
          <label className={labelClass}>Tags</label>
          <TagInput
            tags={tags}
            onChange={setTags}
            placeholder="motivation, cover-letter, negotiation…"
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
            {snippet ? 'Save Changes' : 'Create Snippet'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
