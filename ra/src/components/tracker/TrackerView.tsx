import { useEffect, useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { KanbanColumn } from '../ui/KanbanColumn';
import { api } from '../../lib/api';
import type { Application, ApplicationStatus } from '../../types';

const columns: { id: ApplicationStatus; label: string; color: string }[] = [
  { id: 'bookmarked', label: '📌 Bookmarked', color: 'border-l-4 border-l-yellow-500' },
  { id: 'applied', label: '📝 Applied', color: 'border-l-4 border-l-blue-500' },
  { id: 'phone-screen', label: '📞 Screen', color: 'border-l-4 border-l-purple-500' },
  { id: 'interview', label: '💬 Interview', color: 'border-l-4 border-l-orange-500' },
  { id: 'offer', label: '✅ Offer', color: 'border-l-4 border-l-green-500' },
];

const ageColors = {
  fresh: 'bg-green-500/10 border-green-500/30',
  warning: 'bg-yellow-500/10 border-yellow-500/30',
  stale: 'bg-red-500/10 border-red-500/30',
};

export function TrackerView() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.profiles
      .list()
      .then((profiles) => {
        if (profiles.length === 0) return [];
        return api.applications.list(profiles[0].id);
      })
      .then(setApplications)
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  const handleStatusChange = async (app: Application, newStatus: ApplicationStatus) => {
    try {
      const updated = await api.applications.updateStatus(app.id, newStatus);
      setApplications((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    } catch (e) {
      setError(String(e));
    }
  };

  const byStatus = (status: ApplicationStatus) =>
    applications.filter((a) => a.status === status);

  const applied = applications.filter((a) => a.status !== 'bookmarked');
  const thisWeek = applied.filter((a) => {
    const days = (Date.now() - new Date(a.created_at).getTime()) / 86400000;
    return days < 7;
  });

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
          <button className="flex items-center gap-2 px-3 py-2 text-sm bg-secondary hover:bg-secondary/80 rounded-md transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>

        <div className="flex gap-6 mt-4 text-sm">
          <span>
            📈 <strong>This Week:</strong> {thisWeek.length} apps
          </span>
          <span>
            📊 <strong>Total Applied:</strong> {applied.length}
          </span>
        </div>
      </div>

      {error && (
        <div className="mx-4 mt-4 p-3 bg-destructive/10 text-destructive rounded-lg border border-destructive/30 text-sm">
          {error}
        </div>
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
              >
                {byStatus(col.id).map((app) => (
                  <ApplicationCard
                    key={app.id}
                    application={app}
                    onStatusChange={handleStatusChange}
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

function ApplicationCard({
  application,
  onStatusChange,
}: {
  application: Application;
  onStatusChange: (app: Application, status: ApplicationStatus) => void;
}) {
  const formatSalary = (min?: number | null, max?: number | null) => {
    if (!min && !max) return null;
    const fmt = (n: number) => `$${(n / 1000).toFixed(0)}k`;
    if (min && max) return `${fmt(min)} – ${fmt(max)}`;
    return min ? fmt(min) : max ? fmt(max) : null;
  };

  const salary = formatSalary(application.salary_min, application.salary_max);

  const nextStatuses: ApplicationStatus[] = [
    'bookmarked',
    'applied',
    'phone-screen',
    'interview',
    'offer',
    'rejected',
    'withdrawn',
  ].filter((s) => s !== application.status) as ApplicationStatus[];

  return (
    <div
      className={`p-3 bg-card rounded-lg border border-border mb-2 hover:border-primary/50 transition-colors ${ageColors[application.age]}`}
    >
      <h4 className="font-medium text-sm mb-1">{application.title}</h4>
      <p className="text-sm text-muted-foreground mb-2">{application.company}</p>

      {salary && (
        <div className="inline-block px-2 py-1 text-xs bg-secondary rounded mb-2">
          {salary}
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
        <span>{application.ats_platform || '—'}</span>
        <span>{new Date(application.created_at).toLocaleDateString()}</span>
      </div>

      <select
        value={application.status}
        onChange={(e) => onStatusChange(application, e.target.value as ApplicationStatus)}
        className="w-full px-2 py-1 text-xs bg-secondary border border-border rounded"
      >
        {nextStatuses.map((s) => (
          <option key={s} value={s}>
            Move → {s}
          </option>
        ))}
      </select>
    </div>
  );
}
