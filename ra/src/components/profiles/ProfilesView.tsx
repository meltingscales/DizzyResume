import { useEffect, useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { ProfileCard } from '../ui/ProfileCard';
import { api } from '../../lib/api';
import type { Profile, ProfileStats } from '../../types';

export function ProfilesView() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    api.profiles
      .list()
      .then((p) => {
        setProfiles(p);
        if (p.length > 0) {
          return api.profiles.stats(p[0].id);
        }
        return null;
      })
      .then((s) => {
        if (s) setStats(s);
      })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  const totalApps = stats?.total_applications ?? 0;
  const thisWeek = stats?.this_week ?? 0;
  const responseRate = stats?.response_rate ?? 0;

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
          <p className="text-2xl font-semibold">{totalApps}</p>
        </div>
        <div className="p-4 bg-card rounded-lg border border-border">
          <p className="text-sm text-muted-foreground">This Week</p>
          <p className="text-2xl font-semibold text-sun-gold">{thisWeek}</p>
        </div>
        <div className="p-4 bg-card rounded-lg border border-border">
          <p className="text-sm text-muted-foreground">Response Rate</p>
          <p className="text-2xl font-semibold">{responseRate.toFixed(0)}%</p>
        </div>
      </div>

      {/* Profile Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          Loading profiles...
        </div>
      ) : error ? (
        <div className="p-4 bg-destructive/10 text-destructive rounded-lg border border-destructive/30 text-sm">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {profiles.map((profile) => (
            <ProfileCard key={profile.id} profile={profile} />
          ))}
          <div className="border-2 border-dashed border-border rounded-lg p-8 flex flex-col items-center justify-center text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors cursor-pointer">
            <Plus className="w-12 h-12 mb-2" />
            <p className="font-medium">Add New Profile</p>
            <p className="text-sm">Create a new profile</p>
          </div>
        </div>
      )}
    </div>
  );
}
