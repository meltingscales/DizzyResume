import { Download } from 'lucide-react';
import { KanbanColumn } from '../ui/KanbanColumn';
import type { Application } from '../../types';

// Mock data - will be replaced with Seshat database calls
const mockApplications: Application[] = [
  {
    id: '1',
    company: 'Cloudflare',
    title: 'Staff Engineer',
    location: 'Austin, TX / Remote',
    status: 'bookmarked',
    salaryMin: 180000,
    salaryMax: 220000,
    atsPlatform: 'Greenhouse',
    appliedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    age: 'fresh',
  },
  {
    id: '2',
    company: 'Vercel',
    title: 'Senior Frontend Engineer',
    location: 'Remote',
    status: 'applied',
    salaryMin: 160000,
    salaryMax: 200000,
    atsPlatform: 'Lever',
    appliedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    age: 'warning',
  },
  {
    id: '3',
    company: 'Anthropic',
    title: 'ML Engineer',
    location: 'San Francisco, CA',
    status: 'bookmarked',
    salaryMin: 250000,
    salaryMax: 300000,
    atsPlatform: 'Workday',
    appliedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    age: 'fresh',
  },
  {
    id: '4',
    company: 'Stripe',
    title: 'Full Stack Engineer',
    location: 'Remote',
    status: 'applied',
    salaryMin: 200000,
    salaryMax: 250000,
    atsPlatform: 'Greenhouse',
    appliedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    age: 'stale',
  },
];

const columns = [
  { id: 'bookmarked' as const, label: '📌 Bookmarked', color: 'border-l-4 border-l-yellow-500' },
  { id: 'applied' as const, label: '📝 Applied', color: 'border-l-4 border-l-blue-500' },
  { id: 'phone-screen' as const, label: '📞 Screen', color: 'border-l-4 border-l-purple-500' },
  { id: 'interview' as const, label: '💬 Interview', color: 'border-l-4 border-l-orange-500' },
  { id: 'offer' as const, label: '✅ Offer', color: 'border-l-4 border-l-green-500' },
];

export function TrackerView() {
  const getApplicationsByStatus = (status: Application['status']) => {
    return mockApplications.filter((app) => app.status === status);
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
          <button className="flex items-center gap-2 px-3 py-2 text-sm bg-secondary hover:bg-secondary/80 rounded-md transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>

        {/* Stats */}
        <div className="flex gap-6 mt-4 text-sm">
          <span>📈 <strong>This Week:</strong> 5 apps</span>
          <span>🔥 <strong>Streak:</strong> 3 days</span>
          <span>📊 <strong>Response Rate:</strong> 13%</span>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto p-4">
        <div className="flex gap-4 h-full min-w-max">
          {columns.map((column) => {
            const apps = getApplicationsByStatus(column.id);
            return (
              <KanbanColumn
                key={column.id}
                title={column.label}
                count={apps.length}
                className={column.color}
              >
                {apps.map((app) => (
                  <ApplicationCard key={app.id} application={app} />
                ))}
              </KanbanColumn>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ApplicationCard({ application }: { application: Application }) {
  const ageColors = {
    fresh: 'bg-green-500/10 border-green-500/30',
    warning: 'bg-yellow-500/10 border-yellow-500/30',
    stale: 'bg-red-500/10 border-red-500/30',
  };

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return null;
    const format = (n: number) => `$${(n / 1000).toFixed(0)}k`;
    if (min && max) return `${format(min)} - ${format(max)}`;
    return min || max ? format(min || max!) : null;
  };

  return (
    <div className={`p-3 bg-card rounded-lg border border-border mb-2 hover:border-primary/50 transition-colors ${ageColors[application.age]}`}>
      <h4 className="font-medium text-sm mb-1">{application.title}</h4>
      <p className="text-sm text-muted-foreground mb-2">{application.company}</p>

      {formatSalary(application.salaryMin, application.salaryMax) && (
        <div className="inline-block px-2 py-1 text-xs bg-secondary rounded mb-2">
          {formatSalary(application.salaryMin, application.salaryMax)}
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{application.atsPlatform}</span>
        <span>{application.appliedAt.toLocaleDateString()}</span>
      </div>
    </div>
  );
}
