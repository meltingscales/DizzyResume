import { useEffect, useState } from 'react';
import { Plus, FileEdit, Users, MessageSquare, Loader2, type LucideIcon } from 'lucide-react';
import { TemplateCard } from '../ui/TemplateCard';
import { TemplateModal } from './TemplateModal';
import { api } from '../../lib/api';
import type { Template } from '../../types';

const typeIcons: Record<string, LucideIcon> = {
  'cover-letter': FileEdit,
  references: Users,
  qa: MessageSquare,
};

export function TemplatesView() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState('all');
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<{ open: boolean; template?: Template }>({ open: false });

  useEffect(() => {
    api.templates
      .list()
      .then(setTemplates)
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = (saved: Template) => {
    setTemplates((prev) => {
      const exists = prev.find((t) => t.id === saved.id);
      return exists ? prev.map((t) => (t.id === saved.id ? saved : t)) : [...prev, saved];
    });
    setModal({ open: false });
  };

  const handleDelete = async (id: string) => {
    try {
      await api.templates.delete(id);
      setTemplates((prev) => prev.filter((t) => t.id !== id));
    } catch (e) {
      setError(String(e));
    }
  };

  const filtered = templates.filter((t) => {
    const matchesType = filterType === 'all' || t.type === filterType;
    const matchesSearch =
      !search ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">📝 Templates</h1>
          <p className="text-sm text-muted-foreground">
            Cover letters, reference sheets, and Q&A answers
          </p>
        </div>
        <button
          onClick={() => setModal({ open: true })}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Template
        </button>
      </div>

      <div className="flex gap-3 mb-6">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 bg-card border border-border rounded-md text-sm"
        >
          <option value="all">All Types</option>
          <option value="cover-letter">Cover Letters</option>
          <option value="references">References</option>
          <option value="qa">Q&A</option>
        </select>
        <input
          type="text"
          placeholder="Search templates…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-3 py-2 bg-card border border-border rounded-md text-sm"
        />
      </div>

      {error && (
        <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-lg border border-destructive/30 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          Loading templates…
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {filtered.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              Icon={typeIcons[template.type] ?? FileEdit}
              onEdit={() => setModal({ open: true, template })}
              onDelete={() => handleDelete(template.id)}
            />
          ))}

          <button
            onClick={() => setModal({ open: true })}
            className="border-2 border-dashed border-border rounded-lg p-8 flex flex-col items-center justify-center text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors cursor-pointer"
          >
            <Plus className="w-12 h-12 mb-2" />
            <p className="font-medium">Create from Scratch</p>
            <p className="text-sm">Or import from library</p>
          </button>
        </div>
      )}

      {modal.open && (
        <TemplateModal
          template={modal.template}
          onClose={() => setModal({ open: false })}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
