import { Search, ExternalLink, Bookmark } from 'lucide-react';

// Mock data - will be replaced with Horus job feed integration
const mockJobs = [
  {
    id: '1',
    title: 'Staff Software Engineer',
    company: 'Cloudflare',
    location: 'Austin, TX / Remote',
    salary: '$180k – $220k',
    atsPlatform: 'Greenhouse',
    source: 'LinkedIn',
    postedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    tags: ['Rust', 'Distributed Systems', 'Remote'],
  },
  {
    id: '2',
    title: 'Senior Frontend Engineer',
    company: 'Vercel',
    location: 'Remote',
    salary: '$160k – $200k',
    atsPlatform: 'Lever',
    source: 'Hacker News',
    postedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    tags: ['React', 'Next.js', 'TypeScript'],
  },
  {
    id: '3',
    title: 'ML Engineer',
    company: 'Anthropic',
    location: 'San Francisco, CA',
    salary: '$250k – $300k',
    atsPlatform: 'Workday',
    source: 'Company site',
    postedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    tags: ['Python', 'ML', 'RLHF'],
  },
];

const atsPlatformColors: Record<string, string> = {
  Greenhouse: 'bg-emerald-500/10 text-emerald-400',
  Lever: 'bg-green-500/10 text-green-400',
  Workday: 'bg-blue-500/10 text-blue-400',
  iCIMS: 'bg-sky-500/10 text-sky-400',
};

export function DiscoveryView() {
  const timeAgo = (date: Date) => {
    const days = Math.floor((Date.now() - date.getTime()) / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return `${days}d ago`;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl font-semibold">Discovery</h1>
            <p className="text-sm text-muted-foreground">
              Job feed aggregated from LinkedIn, HN, and company sites
            </p>
          </div>
        </div>

        {/* Search bar */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search jobs, companies, skills..."
              className="w-full pl-9 pr-3 py-2 bg-card border border-border rounded-md text-sm"
            />
          </div>
          <select className="px-3 py-2 bg-card border border-border rounded-md text-sm">
            <option>All Sources</option>
            <option>LinkedIn</option>
            <option>Hacker News</option>
            <option>Company sites</option>
          </select>
          <select className="px-3 py-2 bg-card border border-border rounded-md text-sm">
            <option>Any Location</option>
            <option>Remote</option>
            <option>Chicago, IL</option>
            <option>San Francisco, CA</option>
          </select>
        </div>
      </div>

      {/* Job list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
        {mockJobs.map((job) => (
          <div
            key={job.id}
            className="p-4 bg-card rounded-lg border border-border hover:border-primary/50 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold">{job.title}</h3>
                  <span
                    className={`px-2 py-0.5 text-xs rounded ${atsPlatformColors[job.atsPlatform] ?? 'bg-secondary text-muted-foreground'}`}
                  >
                    {job.atsPlatform}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {job.company} &middot; {job.location}
                </p>

                <div className="flex flex-wrap gap-1 mb-2">
                  {job.tags.map((tag) => (
                    <span key={tag} className="px-2 py-0.5 text-xs bg-secondary rounded">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{job.salary}</span>
                  <span>&middot;</span>
                  <span>{job.source}</span>
                  <span>&middot;</span>
                  <span>{timeAgo(job.postedAt)}</span>
                </div>
              </div>

              <div className="flex gap-2 flex-shrink-0">
                <button
                  className="p-2 hover:bg-secondary rounded-md transition-colors"
                  title="Bookmark"
                >
                  <Bookmark className="w-4 h-4" />
                </button>
                <button
                  className="p-2 hover:bg-secondary rounded-md transition-colors"
                  title="Open job listing"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
                <button className="px-3 py-2 text-sm bg-primary text-primary-foreground hover:bg-primary/90 rounded-md transition-colors">
                  Apply
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
