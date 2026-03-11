import { useEffect, useState } from 'react';
import { Copy, Eye, EyeOff, Lock, Pencil, Plus, Trash2, Unlock } from 'lucide-react';
import { api } from '../../lib/api';
import { useProfile } from '../../lib/ProfileContext';
import type { Credential, CreateCredentialInput, UpdateCredentialInput } from '../../types';

// Known ATS platforms for the dropdown
const KNOWN_PLATFORMS = [
  'Workday', 'Greenhouse', 'Lever', 'iCIMS', 'Taleo',
  'ADP Workforce Now', 'BambooHR', 'Ashby', 'SmartRecruiters',
  'Jobvite', 'Paylocity', 'LinkedIn', 'Indeed', 'Other',
];

// ── Credential form modal ──────────────────────────────────────────────────────

function CredentialModal({
  profileId,
  existing,
  onClose,
  onSave,
}: {
  profileId: string;
  existing: Credential | null;
  onClose: () => void;
  onSave: (c: Credential) => void;
}) {
  const [platform, setPlatform] = useState(existing?.platform ?? '');
  const [customPlatform, setCustomPlatform] = useState(
    existing && !KNOWN_PLATFORMS.includes(existing.platform) ? existing.platform : '',
  );
  const [loginUrl, setLoginUrl] = useState(existing?.login_url ?? '');
  const [username, setUsername] = useState(existing?.username ?? '');
  const [password, setPassword] = useState(existing?.password ?? '');
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [showPw, setShowPw] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const effectivePlatform = platform === 'Other' ? customPlatform : platform;

  const handleSave = async () => {
    if (!effectivePlatform.trim() || !username.trim() || !password.trim()) {
      setError('Platform, username, and password are required.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (existing) {
        const input: UpdateCredentialInput = {
          platform: effectivePlatform.trim(),
          login_url: loginUrl.trim(),
          username: username.trim(),
          password,
          notes: notes.trim(),
        };
        const updated = await api.vault.credentials.update(existing.id, input);
        onSave(updated);
      } else {
        const input: CreateCredentialInput = {
          profile_id: profileId,
          platform: effectivePlatform.trim(),
          login_url: loginUrl.trim(),
          username: username.trim(),
          password,
          notes: notes.trim(),
        };
        const created = await api.vault.credentials.create(input);
        onSave(created);
      }
    } catch (e) {
      setError(String(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-semibold text-lg">
            {existing ? 'Edit Credential' : 'Add Credential'}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-xl leading-none">×</button>
        </div>

        <div className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-destructive/10 text-destructive rounded text-sm border border-destructive/30">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs text-muted-foreground mb-1.5">Platform *</label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:border-primary"
            >
              <option value="">— select platform —</option>
              {KNOWN_PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            {platform === 'Other' && (
              <input
                type="text"
                value={customPlatform}
                onChange={(e) => setCustomPlatform(e.target.value)}
                placeholder="Enter platform name"
                className="mt-2 w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:border-primary"
              />
            )}
          </div>

          <div>
            <label className="block text-xs text-muted-foreground mb-1.5">Login URL</label>
            <input
              type="url"
              value={loginUrl}
              onChange={(e) => setLoginUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs text-muted-foreground mb-1.5">Username / Email *</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="off"
              className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs text-muted-foreground mb-1.5">Password *</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                className="w-full px-3 py-2 pr-10 bg-background border border-border rounded-md text-sm focus:outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs text-muted-foreground mb-1.5">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="e.g. registered with work email"
              className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:border-primary resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 p-5 border-t border-border">
          <button onClick={onClose} className="px-4 py-2 text-sm bg-secondary hover:bg-secondary/80 rounded-md">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm bg-primary text-primary-foreground hover:bg-primary/90 rounded-md disabled:opacity-50"
          >
            {saving ? 'Saving…' : existing ? 'Save Changes' : 'Add Credential'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Single credential card ─────────────────────────────────────────────────────

function CredentialCard({
  cred,
  onEdit,
  onDelete,
}: {
  cred: Credential;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [showPw, setShowPw] = useState(false);
  const [copied, setCopied] = useState<'user' | 'pw' | null>(null);

  const copy = async (text: string, field: 'user' | 'pw') => {
    await navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="p-4 bg-card border border-border rounded-lg hover:border-primary/40 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div>
          <span className="font-semibold text-sm">{cred.platform}</span>
          {cred.login_url && (
            <a
              href={cred.login_url}
              target="_blank"
              rel="noreferrer"
              className="ml-2 text-xs text-primary hover:underline"
            >
              {new URL(cred.login_url).hostname}
            </a>
          )}
        </div>
        <div className="flex gap-1">
          <button
            onClick={onEdit}
            className="p-1.5 hover:bg-secondary rounded text-muted-foreground hover:text-foreground transition-colors"
            title="Edit"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 hover:bg-destructive/20 rounded text-muted-foreground hover:text-destructive transition-colors"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Username row */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs text-muted-foreground w-16 flex-shrink-0">Username</span>
        <span className="text-sm font-mono flex-1 truncate">{cred.username}</span>
        <button
          onClick={() => copy(cred.username, 'user')}
          className="flex-shrink-0 p-1 hover:bg-secondary rounded text-muted-foreground hover:text-foreground transition-colors"
          title="Copy username"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>
        {copied === 'user' && <span className="text-xs text-green-400 flex-shrink-0">Copied!</span>}
      </div>

      {/* Password row */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground w-16 flex-shrink-0">Password</span>
        <span className="text-sm font-mono flex-1 truncate">
          {showPw ? cred.password : '•'.repeat(Math.min(cred.password.length, 16))}
        </span>
        <button
          onClick={() => setShowPw((v) => !v)}
          className="flex-shrink-0 p-1 hover:bg-secondary rounded text-muted-foreground hover:text-foreground transition-colors"
          title={showPw ? 'Hide' : 'Show'}
        >
          {showPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
        </button>
        <button
          onClick={() => copy(cred.password, 'pw')}
          className="flex-shrink-0 p-1 hover:bg-secondary rounded text-muted-foreground hover:text-foreground transition-colors"
          title="Copy password"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>
        {copied === 'pw' && <span className="text-xs text-green-400 flex-shrink-0">Copied!</span>}
      </div>

      {cred.notes && (
        <p className="mt-2 text-xs text-muted-foreground italic">{cred.notes}</p>
      )}
    </div>
  );
}

// ── Lock / setup screen ────────────────────────────────────────────────────────

function LockScreen({
  isSetup,
  onUnlocked,
}: {
  isSetup: boolean;
  onUnlocked: () => void;
}) {
  const [pw, setPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    setError(null);
    if (!pw.trim()) { setError('Enter a master password.'); return; }
    if (!isSetup && pw !== confirm) { setError('Passwords do not match.'); return; }
    if (!isSetup && pw.length < 8) { setError('Use at least 8 characters.'); return; }

    setLoading(true);
    try {
      if (!isSetup) {
        await api.vault.setup(pw);
        onUnlocked();
      } else {
        const ok = await api.vault.unlock(pw);
        if (ok) {
          onUnlocked();
        } else {
          setError('Wrong master password.');
        }
      }
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex items-center justify-center p-8">
      <div className="w-full max-w-sm text-center">
        <div className="text-5xl mb-4">🔐</div>
        <h2 className="text-xl font-semibold mb-1">Serket's Vault</h2>
        <p className="text-sm text-muted-foreground mb-6">
          {isSetup
            ? 'Enter your master password to unlock.'
            : 'First time? Set a master password to encrypt your ATS credentials.'}
        </p>

        {error && (
          <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded text-sm border border-destructive/30">
            {error}
          </div>
        )}

        <div className="space-y-3 text-left">
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handle()}
              placeholder="Master password"
              autoFocus
              className="w-full px-4 py-2.5 pr-10 bg-background border border-border rounded-md focus:outline-none focus:border-primary"
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {!isSetup && (
            <input
              type={showPw ? 'text' : 'password'}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handle()}
              placeholder="Confirm password"
              className="w-full px-4 py-2.5 bg-background border border-border rounded-md focus:outline-none focus:border-primary"
            />
          )}

          <button
            onClick={handle}
            disabled={loading}
            className="w-full py-2.5 bg-primary text-primary-foreground font-semibold rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading
              ? isSetup ? 'Unlocking…' : 'Setting up…'
              : isSetup ? 'Unlock Vault' : 'Set Up Vault'}
          </button>
        </div>

        {!isSetup && (
          <p className="mt-4 text-xs text-muted-foreground">
            Your master password is never stored — it's used to derive an AES-256 key.
            If you forget it, credentials cannot be recovered.
          </p>
        )}
      </div>
    </div>
  );
}

// ── Main view ─────────────────────────────────────────────────────────────────

export function VaultView() {
  const { activeProfile } = useProfile();
  const profileId = activeProfile?.id ?? null;

  const [vaultSetup, setVaultSetup] = useState<boolean | null>(null);
  const [unlocked, setUnlocked] = useState(false);
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<'add' | Credential | null>(null);

  // Check vault state on mount
  useEffect(() => {
    Promise.all([api.vault.isSetup(), api.vault.isUnlocked()])
      .then(([setup, open]) => {
        setVaultSetup(setup);
        setUnlocked(open);
      })
      .catch(() => setVaultSetup(false));
  }, []);

  // Load credentials when unlocked + profile changes
  useEffect(() => {
    if (!unlocked || !profileId) { setCredentials([]); return; }
    setLoading(true);
    api.vault.credentials
      .list(profileId)
      .then(setCredentials)
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [unlocked, profileId]);

  const handleUnlocked = () => {
    setVaultSetup(true);
    setUnlocked(true);
  };

  const handleLock = async () => {
    await api.vault.lock();
    setUnlocked(false);
    setCredentials([]);
  };

  const handleDelete = async (cred: Credential) => {
    try {
      await api.vault.credentials.delete(cred.id);
      setCredentials((prev) => prev.filter((c) => c.id !== cred.id));
    } catch (e) {
      setError(String(e));
    }
  };

  const handleSave = (saved: Credential) => {
    setCredentials((prev) => {
      const idx = prev.findIndex((c) => c.id === saved.id);
      return idx >= 0 ? prev.map((c) => (c.id === saved.id ? saved : c)) : [saved, ...prev];
    });
    setModal(null);
  };

  // Still checking vault state
  if (vaultSetup === null) return null;

  // Locked / not set up
  if (!unlocked) {
    return <LockScreen isSetup={vaultSetup} onUnlocked={handleUnlocked} />;
  }

  // Group by platform
  const byPlatform = credentials.reduce<Record<string, Credential[]>>((acc, c) => {
    (acc[c.platform] ??= []).push(c);
    return acc;
  }, {});

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">🔐 Serket's Vault</h1>
            <p className="text-sm text-muted-foreground">
              Encrypted ATS credentials — {credentials.length} stored
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setModal('add')}
              disabled={!profileId}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-primary text-primary-foreground hover:bg-primary/90 rounded-md transition-colors disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              Add Credential
            </button>
            <button
              onClick={handleLock}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-secondary hover:bg-secondary/80 rounded-md transition-colors"
              title="Lock vault"
            >
              <Lock className="w-4 h-4" />
              Lock
            </button>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2 text-xs text-green-400">
          <Unlock className="w-3.5 h-3.5" />
          Vault unlocked — AES-256-GCM · PBKDF2 100k rounds
        </div>
      </div>

      {error && (
        <div className="mx-4 mt-4 p-3 bg-destructive/10 text-destructive rounded text-sm border border-destructive/30">
          {error}
        </div>
      )}

      {/* Credential list */}
      <div className="flex-1 overflow-y-auto p-4">
        {!profileId ? (
          <p className="text-muted-foreground text-sm text-center mt-12">
            Select a profile to view its credentials.
          </p>
        ) : loading ? (
          <p className="text-muted-foreground text-sm text-center mt-12">Loading…</p>
        ) : credentials.length === 0 ? (
          <div className="text-center mt-12">
            <div className="text-4xl mb-3">🗝️</div>
            <p className="text-muted-foreground text-sm">No credentials yet.</p>
            <p className="text-muted-foreground text-xs mt-1">
              Add your ATS logins so you never wonder "which email did I use?"
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(byPlatform).sort(([a], [b]) => a.localeCompare(b)).map(([platform, creds]) => (
              <div key={platform}>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  {platform}
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {creds.map((c) => (
                    <CredentialCard
                      key={c.id}
                      cred={c}
                      onEdit={() => setModal(c)}
                      onDelete={() => handleDelete(c)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/edit modal */}
      {modal && profileId && (
        <CredentialModal
          profileId={profileId}
          existing={modal === 'add' ? null : modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
