import { Plus } from 'lucide-react';
import { ProfileCard } from '../ui/ProfileCard';

// Mock data - will be replaced with Ptah database calls
const mockProfiles = [
  {
    id: '1',
    name: 'Henry Post',
    email: 'henry@example.com',
    phone: '555-0123',
    location: { city: 'Chicago', state: 'IL', zipCode: '60601', country: 'USA' },
    linkedInUrl: 'linkedin.com/in/henry',
    resumeVariants: 3,
    applications: 15,
    lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  },
];

export function ProfilesView() {
  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Profiles</h1>
          <p className="text-sm text-muted-foreground">
            Manage your user profiles and personal information
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" />
          New Profile
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-card rounded-lg border border-border">
          <p className="text-sm text-muted-foreground">Total Applications</p>
          <p className="text-2xl font-semibold">23</p>
        </div>
        <div className="p-4 bg-card rounded-lg border border-border">
          <p className="text-sm text-muted-foreground">This Week</p>
          <p className="text-2xl font-semibold text-sun-gold">5</p>
        </div>
        <div className="p-4 bg-card rounded-lg border border-border">
          <p className="text-sm text-muted-foreground">Response Rate</p>
          <p className="text-2xl font-semibold">13%</p>
        </div>
      </div>

      {/* Profile Cards */}
      <div className="grid grid-cols-2 gap-4">
        {mockProfiles.map((profile) => (
          <ProfileCard key={profile.id} profile={profile} />
        ))}
        <div className="border-2 border-dashed border-border rounded-lg p-8 flex flex-col items-center justify-center text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors cursor-pointer">
          <Plus className="w-12 h-12 mb-2" />
          <p className="font-medium">Add New Profile</p>
          <p className="text-sm">Create a new profile</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-3">Recent Activity</h2>
        <div className="space-y-2">
          <div className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border">
            <div className="w-2 h-2 bg-sun-gold rounded-full"></div>
            <p className="text-sm flex-1">
              Applied to <span className="font-medium">Staff Engineer</span> at{' '}
              <span className="font-medium">Cloudflare</span>
            </p>
            <span className="text-xs text-muted-foreground">2h ago</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <p className="text-sm flex-1">
              Updated <span className="font-medium">"Data Analytics"</span> resume
            </p>
            <span className="text-xs text-muted-foreground">5h ago</span>
          </div>
        </div>
      </div>
    </div>
  );
}
