import { useEffect, useRef, useState } from 'react';
import { Download, ExternalLink, Loader2, Plus, Trash2 } from 'lucide-react';
import { KanbanColumn } from '../ui/KanbanColumn';
import { ApplicationModal } from './ApplicationModal';
import { StatsPanel } from './StatsPanel';
import { api } from '../../lib/api';
import { useProfile } from '../../lib/ProfileContext';
import type { Application, ApplicationStatus, ResumeVariant } from '../../types';

const columns: { id: ApplicationStatus; label: string; color: string }[] = [
  { id: 'bookmarked',   label: '📌 Bookmarked', color: 'border-l-4 border-l-yellow-500' },
  { id: 'applied',      label: '📝 Applied',     color: 'border-l-4 border-l-blue-500' },
  { id: 'phone-screen', label: '📞 Screen',      color: 'border-l-4 border-l-purple-500' },
  { id: 'interview',    label: '💬 Interview',   color: 'border-l-4 border-l-orange-500' },
  { id: 'offer',        label: '✅ Offer',        color: 'border-l-4 border-l-green-500' },
  { id: 'rejected',     label: '❌ Rejected',     color: 'border-l-4 border-l-red-500' },
  { id: 'withdrawn',    label: '🚪 Withdrawn',   color: 'border-l-4 border-l-gray-500' },
];

export function TrackerView() {
  const { activeProfile } = useProfile();
  const profileId = activeProfile?.id ?? null;
  const [applications, setApplications] = useState<Application[]>([]);
  const [variants, setVariants] = useState<ResumeVariant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<ApplicationStatus | null>(null);
  const [addModal, setAddModal] = useState(false);
  const draggingId = useRef<string | null>(null);

  useEffect(() => {
    if (!profileId) {
      setApplications([]);
      return;
    }
    setLoading(true);
    Promise.all([
      api.applications.list(profileId),
      api.resumes.list(profileId),
    ])
      .then(([apps, vars]) => {
        setApplications(apps);
        setVariants(vars);
      })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [profileId]);

  const handleStatusChange = async (app: Application, newStatus: ApplicationStatus) => {
    try {
      const updated = await api.applications.updateStatus(app.id, newStatus);
      setApplications((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    } catch (e) {
      setError(String(e));
    }
  };

  const handleDelete = async (app: Application) => {
    try {
      await api.applications.delete(app.id);
      setApplications((prev) => prev.filter((a) => a.id !== app.id));
    } catch (e) {
      setError(String(e));
    }
  };

  const handleDragStart = (id: string) => { draggingId.current = id; };
  const handleDragOver = (e: React.DragEvent, status: ApplicationStatus) => {
    e.preventDefault();
    setDragOverCol(status);
  };
  const handleDrop = (e: React.DragEvent, status: ApplicationStatus) => {
    e.preventDefault();
    setDragOverCol(null);
    const id = draggingId.current;
    draggingId.current = null;
    if (!id) return;
    const app = applications.find((a) => a.id === id);
    if (app && app.status !== status) handleStatusChange(app, status);
  };

  const byStatus = (status: ApplicationStatus) =>
    applications.filter((a) => a.status === status);

  const exportCsv = () => {
    const headers = [
      'Company', 'Title', 'Location', 'Status', 'ATS Platform',
      'Date Applied', 'Days Since Applied', 'Salary Min', 'Salary Max',
      'Job URL', 'Notes',
    ];
    const escape = (v: string | number | null | undefined) => {
      const s = String(v ?? '');
      return s.includes(',') || s.includes('"') || s.includes('\n')
        ? `"${s.replace(/"/g, '""')}"`
        : s;
    };
    const daysSince = (iso: string) =>
      Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);

    const rows = applications.map((a) => [
      escape(a.company),
      escape(a.title),
      escape(a.location),
      escape(a.status),
      escape(a.ats_platform),
      escape(a.applied_at ? new Date(a.applied_at).toLocaleDateString() : ''),
      escape(a.applied_at ? daysSince(a.applied_at) : ''),
      escape(a.salary_min),
      escape(a.salary_max),
      escape(a.job_url),
      escape(a.notes),
    ].join(','));

    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `applications-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">📚 Application Tracker</h1>
            <p className="text-sm text-muted-foreground">
              Track your job applications across all stages
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setAddModal(true)}
              disabled={!profileId}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-primary text-primary-foreground hover:bg-primary/90 rounded-md transition-colors disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              Add Application
            </button>
            <button
              onClick={exportCsv}
              disabled={applications.length === 0}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-secondary hover:bg-secondary/80 rounded-md transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>

        <div className="mt-4">
          <StatsPanel profileId={profileId} />
        </div>
      </div>

      {error && (
        <div className="mx-4 mt-4 p-3 bg-destructive/10 text-destructive rounded-lg border border-destructive/30 text-sm">
          {error}
        </div>
      )}

      {addModal && profileId && (
        <ApplicationModal
          profileId={profileId}
          variants={variants}
          onClose={() => setAddModal(false)}
          onSave={(app) => {
            setApplications((prev) => [app, ...prev]);
            setAddModal(false);
          }}
        />
      )}

      {/* Kanban Board */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          Loading applications...
        </div>
      ) : (
        <div className="flex-1 overflow-x-auto p-4">
          <div className="flex gap-4 h-full min-w-max">
            {columns.map((col) => (
              <KanbanColumn
                key={col.id}
                title={col.label}
                count={byStatus(col.id).length}
                className={col.color}
                isDragOver={dragOverCol === col.id}
                onDragOver={(e) => handleDragOver(e, col.id)}
                onDrop={(e) => handleDrop(e, col.id)}
              >
                {byStatus(col.id).map((app) => (
                  <ApplicationCard
                    key={app.id}
                    application={app}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDelete}
                    onDragStart={handleDragStart}
                  />
                ))}
              </KanbanColumn>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const ageColors = {
  fresh: 'border-l-green-500',
  warning: 'border-l-yellow-500',
  stale: 'border-l-red-500',
};

function ApplicationCard({
  application,
  onStatusChange,
  onDelete,
  onDragStart,
}: {
  application: Application;
  onStatusChange: (app: Application, status: ApplicationStatus) => void;
  onDelete: (app: Application) => void;
  onDragStart: (id: string) => void;
}) {
  const formatSalary = (min?: number | null, max?: number | null) => {
    if (!min && !max) return null;
    const fmt = (n: number) => `$${(n / 1000).toFixed(0)}k`;
    if (min && max) return `${fmt(min)} – ${fmt(max)}`;
    return min ? fmt(min) : max ? fmt(max) : null;
  };

  const salary = formatSalary(application.salary_min, application.salary_max);
  const date = application.applied_at ?? application.created_at;

  const allStatuses: ApplicationStatus[] = [
    'bookmarked', 'applied', 'phone-screen', 'interview', 'offer', 'rejected', 'withdrawn',
  ];

  return (
    <div
      draggable
      onDragStart={() => onDragStart(application.id)}
      className={`p-3 bg-card rounded-lg border-l-4 border border-border mb-2 hover:border-primary/50 transition-colors cursor-grab active:cursor-grabbing ${ageColors[application.age]}`}
    >
      <div className="flex items-start justify-between gap-1 mb-0.5">
        <h4 className="font-medium text-sm leading-tight">{application.title}</h4>
        <div className="flex items-center gap-1 flex-shrink-0">
          {application.job_url && (
            <a
              href={application.job_url}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-1 hover:bg-secondary rounded text-muted-foreground hover:text-foreground transition-colors"
              title="Open job posting"
            >
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
          <button
            onClick={() => onDelete(application)}
            className="p-1 hover:bg-destructive/20 rounded text-muted-foreground hover:text-destructive transition-colors"
            title="Delete"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mb-2">{application.company}</p>

      <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
        <span>{application.location || application.ats_platform || '—'}</span>
        {salary && <span className="text-sun-gold">{salary}</span>}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {new Date(date).toLocaleDateString()}
        </span>
        <select
          value={application.status}
          onChange={(e) => onStatusChange(application, e.target.value as ApplicationStatus)}
          onClick={(e) => e.stopPropagation()}
          className="px-1.5 py-0.5 text-xs bg-secondary border border-border rounded max-w-28"
        >
          {allStatuses.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
