import { useEffect, useState } from 'react';
import { Plus, Library, Copy, Edit, Loader2 } from 'lucide-react';
import { api } from '../../lib/api';
import { SnippetModal } from './SnippetModal';
import type { Snippet } from '../../types';

export function SnippetsView() {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterTag, setFilterTag] = useState('all');
  const [search, setSearch] = useState('');
  const [copied, setCopied] = useState<string | null>(null);
  const [modal, setModal] = useState<{ open: boolean; snippet?: Snippet }>({ open: false });

  useEffect(() => {
    api.snippets
      .list()
      .then(setSnippets)
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  const allTags = [...new Set(snippets.flatMap((s) => s.tags))].sort();

  const filtered = snippets.filter((s) => {
    const matchesTag = filterTag === 'all' || s.tags.includes(filterTag);
    const matchesSearch =
      !search ||
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.content.toLowerCase().includes(search.toLowerCase());
    return matchesTag && matchesSearch;
  });

  const handleSave = (saved: Snippet) => {
    setSnippets((prev) => {
      const exists = prev.find((s) => s.id === saved.id);
      return exists ? prev.map((s) => (s.id === saved.id ? saved : s)) : [...prev, saved];
    });
    setModal({ open: false });
  };

  const handleCopy = async (snippet: Snippet) => {
    await navigator.clipboard.writeText(snippet.content);
    setCopied(snippet.id);
    setTimeout(() => setCopied(null), 1500);
    api.snippets.recordUse(snippet.id).then(() => {
      setSnippets((prev) =>
        prev.map((s) => (s.id === snippet.id ? { ...s, use_count: s.use_count + 1 } : s))
      );
    });
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Snippets</h1>
          <p className="text-sm text-muted-foreground">
            Reusable text blocks for common questions and fields
          </p>
        </div>
        <button
          onClick={() => setModal({ open: true })}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Snippet
        </button>
      </div>

      <div className="flex gap-3 mb-6">
        <select
          value={filterTag}
          onChange={(e) => setFilterTag(e.target.value)}
          className="px-3 py-2 bg-card border border-border rounded-md text-sm"
        >
          <option value="all">All Tags</option>
          {allTags.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Search snippets…"
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
          Loading snippets…
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((snippet) => (
            <div
              key={snippet.id}
              className="p-4 bg-card rounded-lg border border-border hover:border-primary/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sun-gold/20 to-sun-gold/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Library className="w-4 h-4 text-sun-gold" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold mb-1">{snippet.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{snippet.content}</p>
                    <div className="flex items-center gap-2 mt-2">
                      {snippet.tags.map((tag) => (
                        <span key={tag} className="px-2 py-0.5 text-xs bg-secondary rounded">
                          {tag}
                        </span>
                      ))}
                      <span className="text-xs text-muted-foreground ml-auto">
                        Used {snippet.use_count}x
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  <button
                    className="p-2 hover:bg-secondary rounded-md transition-colors"
                    title={copied === snippet.id ? 'Copied!' : 'Copy to clipboard'}
                    onClick={() => handleCopy(snippet)}
                  >
                    <Copy
                      className={`w-4 h-4 ${copied === snippet.id ? 'text-green-500' : ''}`}
                    />
                  </button>
                  <button
                    className="p-2 hover:bg-secondary rounded-md transition-colors"
                    title="Edit"
                    onClick={() => setModal({ open: true, snippet })}
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <p className="text-center text-muted-foreground py-8 text-sm">
              {snippets.length === 0
                ? 'No snippets yet. Click "New Snippet" to add one.'
                : 'No snippets match your filter.'}
            </p>
          )}

          <button
            onClick={() => setModal({ open: true })}
            className="w-full border-2 border-dashed border-border rounded-lg p-8 flex flex-col items-center justify-center text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors cursor-pointer"
          >
            <Plus className="w-10 h-10 mb-2" />
            <p className="font-medium">New Snippet</p>
            <p className="text-sm">Save a reusable text block</p>
          </button>
        </div>
      )}

      {modal.open && (
        <SnippetModal
          snippet={modal.snippet}
          onClose={() => setModal({ open: false })}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
