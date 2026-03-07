import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { api } from '../../lib/api';
import type { Profile, CreateProfileInput } from '../../types';

interface ProfileModalProps {
  profile?: Profile;
  onClose: () => void;
  onSave: (profile: Profile) => void;
}

const empty: CreateProfileInput = {
  name: '',
  email: '',
  phone: '',
  city: '',
  state: '',
  zip_code: '',
  country: 'USA',
  linkedin_url: null,
  website: null,
};

function fromProfile(p: Profile): CreateProfileInput {
  return {
    name: p.name,
    email: p.email,
    phone: p.phone,
    city: p.city,
    state: p.state,
    zip_code: p.zip_code,
    country: p.country,
    linkedin_url: p.linkedin_url,
    website: p.website,
  };
}

export function ProfileModal({ profile, onClose, onSave }: ProfileModalProps) {
  const [form, setForm] = useState<CreateProfileInput>(
    profile ? fromProfile(profile) : empty
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (field: keyof CreateProfileInput, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value || null }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      setError('Name and email are required.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const saved = profile
        ? await api.profiles.update(profile.id, form)
        : await api.profiles.create(form);
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
    <Modal title={profile ? 'Edit Profile' : 'New Profile'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className={labelClass}>
            Name <span className="text-destructive">*</span>
          </label>
          <input
            className={inputClass}
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="Henry Post"
            autoFocus
          />
        </div>

        {/* Email */}
        <div>
          <label className={labelClass}>
            Email <span className="text-destructive">*</span>
          </label>
          <input
            type="email"
            className={inputClass}
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
            placeholder="henry@example.com"
          />
        </div>

        {/* Phone */}
        <div>
          <label className={labelClass}>Phone</label>
          <input
            className={inputClass}
            value={form.phone}
            onChange={(e) => set('phone', e.target.value)}
            placeholder="555-0123"
          />
        </div>

        {/* Location row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-1">
            <label className={labelClass}>City</label>
            <input
              className={inputClass}
              value={form.city}
              onChange={(e) => set('city', e.target.value)}
              placeholder="Chicago"
            />
          </div>
          <div>
            <label className={labelClass}>State</label>
            <input
              className={inputClass}
              value={form.state}
              onChange={(e) => set('state', e.target.value)}
              placeholder="IL"
            />
          </div>
          <div>
            <label className={labelClass}>ZIP</label>
            <input
              className={inputClass}
              value={form.zip_code}
              onChange={(e) => set('zip_code', e.target.value)}
              placeholder="60601"
            />
          </div>
        </div>

        {/* Country */}
        <div>
          <label className={labelClass}>Country</label>
          <input
            className={inputClass}
            value={form.country}
            onChange={(e) => set('country', e.target.value)}
            placeholder="USA"
          />
        </div>

        {/* LinkedIn */}
        <div>
          <label className={labelClass}>LinkedIn URL</label>
          <input
            className={inputClass}
            value={form.linkedin_url ?? ''}
            onChange={(e) => set('linkedin_url', e.target.value)}
            placeholder="linkedin.com/in/henry"
          />
        </div>

        {/* Website */}
        <div>
          <label className={labelClass}>Website</label>
          <input
            className={inputClass}
            value={form.website ?? ''}
            onChange={(e) => set('website', e.target.value)}
            placeholder="henrypost.dev"
          />
        </div>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        {/* Actions */}
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
            {profile ? 'Save Changes' : 'Create Profile'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
