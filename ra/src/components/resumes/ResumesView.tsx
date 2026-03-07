import { useEffect, useState } from 'react';
import { Plus, FileText, Star, Eye, Loader2 } from 'lucide-react';
import { api } from '../../lib/api';
import { ResumeVariantModal } from './ResumeVariantModal';
import type { ResumeVariant } from '../../types';

export function ResumesView() {
  const [profileId, setProfileId] = useState<string | null>(null);
  const [variants, setVariants] = useState<ResumeVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<{ open: boolean; variant?: ResumeVariant }>({
    open: false,
  });

  useEffect(() => {
    api.profiles
      .list()
      .then((profiles) => {
        if (profiles.length === 0) return [];
        setProfileId(profiles[0].id);
        return api.resumes.list(profiles[0].id);
      })
      .then(setVariants)
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  const timeAgo = (isoString: string) => {
    const seconds = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const wordCount = (content: string) =>
    content.trim() ? content.trim().split(/\s+/).length : 0;

  const handleSave = (saved: ResumeVariant) => {
    setVariants((prev) => {
      const exists = prev.find((v) => v.id === saved.id);
      return exists ? prev.map((v) => (v.id === saved.id ? saved : v)) : [...prev, saved];
    });
    setModal({ open: false });
  };

  const handleSetDefault = async (variant: ResumeVariant) => {
    if (!profileId) return;
    try {
      await api.resumes.setDefault(variant.id, profileId);
      setVariants((prev) => prev.map((v) => ({ ...v, is_default: v.id === variant.id })));
    } catch (e) {
      setError(String(e));
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Resumes</h1>
          <p className="text-sm text-muted-foreground">
            Manage your resume variants for different roles
          </p>
        </div>
        <button
          onClick={() => setModal({ open: true })}
          disabled={!profileId}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          New Variant
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-lg border border-destructive/30 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          Loading variants…
        </div>
      ) : (
        <div className="space-y-3">
          {variants.map((variant) => (
            <div
              key={variant.id}
              className="flex items-center gap-4 p-4 bg-card rounded-lg border border-border hover:border-primary/50 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-sun-gold/20 to-sun-gold/10 flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-sun-gold" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{variant.name}</h3>
                  {variant.is_default && (
                    <span className="flex items-center gap-1 px-2 py-0.5 text-xs bg-sun-gold/20 text-sun-gold rounded-full">
                      <Star className="w-3 h-3" /> Default
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground truncate">{variant.description}</p>
              </div>

              <div className="text-sm text-muted-foreground text-right flex-shrink-0">
                <p>{wordCount(variant.content)} words</p>
                <p>{timeAgo(variant.updated_at)}</p>
              </div>

              <div className="flex gap-2 flex-shrink-0">
                {!variant.is_default && (
                  <button
                    className="p-2 hover:bg-secondary rounded-md transition-colors"
                    title="Set as default"
                    onClick={() => handleSetDefault(variant)}
                  >
                    <Star className="w-4 h-4" />
                  </button>
                )}
                <button
                  className="p-2 hover:bg-secondary rounded-md transition-colors"
                  title="Preview"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  className="px-3 py-2 text-sm bg-secondary hover:bg-secondary/80 rounded-md transition-colors"
                  onClick={() => setModal({ open: true, variant })}
                >
                  Edit
                </button>
              </div>
            </div>
          ))}

          {variants.length === 0 && (
            <p className="text-center text-muted-foreground py-8 text-sm">
              {profileId
                ? 'No resume variants yet. Click "New Variant" to add one.'
                : 'Create a profile first, then add resume variants.'}
            </p>
          )}

          <button
            onClick={() => setModal({ open: true })}
            disabled={!profileId}
            className="w-full border-2 border-dashed border-border rounded-lg p-8 flex flex-col items-center justify-center text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-10 h-10 mb-2" />
            <p className="font-medium">New Resume Variant</p>
            <p className="text-sm">Duplicate an existing variant or start fresh</p>
          </button>
        </div>
      )}

      {modal.open && profileId && (
        <ResumeVariantModal
          profileId={profileId}
          variant={modal.variant}
          onClose={() => setModal({ open: false })}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
