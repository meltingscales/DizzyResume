import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { api } from '../../lib/api';
import type { Application, ApplicationStatus, CreateApplicationInput, ResumeVariant } from '../../types';

const ALL_STATUSES: ApplicationStatus[] = [
  'bookmarked', 'applied', 'phone-screen', 'interview', 'offer', 'rejected', 'withdrawn',
];

interface Props {
  profileId: string;
  variants: ResumeVariant[];
  onClose: () => void;
  onSave: (app: Application) => void;
}

export function ApplicationModal({ profileId, variants, onClose, onSave }: Props) {
  const [form, setForm] = useState({
    company: '',
    title: '',
    location: '',
    status: 'bookmarked' as ApplicationStatus,
    ats_platform: '',
    job_url: '',
    salary_min: '',
    salary_max: '',
    resume_variant_id: '',
    notes: '',
    applied_at: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.company.trim() || !form.title.trim()) {
      setError('Company and Job Title are required.');
      return;
    }

    const input: CreateApplicationInput = {
      profile_id: profileId,
      company: form.company.trim(),
      title: form.title.trim(),
      location: form.location.trim(),
      status: form.status,
      salary_min: form.salary_min ? Number(form.salary_min) : null,
      salary_max: form.salary_max ? Number(form.salary_max) : null,
      ats_platform: form.ats_platform.trim(),
      job_url: form.job_url.trim() || null,
      resume_variant_id: form.resume_variant_id || null,
      notes: form.notes.trim(),
      applied_at: form.applied_at ? new Date(form.applied_at).toISOString() : null,
    };

    setSaving(true);
    setError(null);
    try {
      const app = await api.applications.create(input);
      onSave(app);
    } catch (e) {
      setError(String(e));
      setSaving(false);
    }
  };

  const inputCls =
    'w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary';
  const labelCls = 'block text-sm font-medium mb-1';

  return (
    <Modal title="Add Application" size="lg" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Company *</label>
            <input
              className={inputCls}
              value={form.company}
              onChange={(e) => set('company', e.target.value)}
              placeholder="Acme Corp"
              autoFocus
            />
          </div>
          <div>
            <label className={labelCls}>Job Title *</label>
            <input
              className={inputCls}
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="Senior Software Engineer"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Location</label>
            <input
              className={inputCls}
              value={form.location}
              onChange={(e) => set('location', e.target.value)}
              placeholder="Chicago, IL (Remote)"
            />
          </div>
          <div>
            <label className={labelCls}>Status</label>
            <select
              className={inputCls}
              value={form.status}
              onChange={(e) => set('status', e.target.value)}
            >
              {ALL_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>ATS Platform</label>
            <input
              className={inputCls}
              value={form.ats_platform}
              onChange={(e) => set('ats_platform', e.target.value)}
              placeholder="Workday"
            />
          </div>
          <div>
            <label className={labelCls}>Job URL</label>
            <input
              className={inputCls}
              type="url"
              value={form.job_url}
              onChange={(e) => set('job_url', e.target.value)}
              placeholder="https://..."
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Salary Min ($)</label>
            <input
              className={inputCls}
              type="number"
              min="0"
              value={form.salary_min}
              onChange={(e) => set('salary_min', e.target.value)}
              placeholder="80000"
            />
          </div>
          <div>
            <label className={labelCls}>Salary Max ($)</label>
            <input
              className={inputCls}
              type="number"
              min="0"
              value={form.salary_max}
              onChange={(e) => set('salary_max', e.target.value)}
              placeholder="120000"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Resume Variant</label>
            <select
              className={inputCls}
              value={form.resume_variant_id}
              onChange={(e) => set('resume_variant_id', e.target.value)}
            >
              <option value="">— none —</option>
              {variants.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}{v.is_default ? ' (default)' : ''}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Date Applied</label>
            <input
              className={inputCls}
              type="date"
              value={form.applied_at}
              onChange={(e) => set('applied_at', e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className={labelCls}>Notes</label>
          <textarea
            className={`${inputCls} h-20 resize-none`}
            value={form.notes}
            onChange={(e) => set('notes', e.target.value)}
            placeholder="Referred by Jane, salary not listed on posting…"
          />
        </div>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

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
            className="px-4 py-2 text-sm bg-primary text-primary-foreground hover:bg-primary/90 rounded-md transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Add Application'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
