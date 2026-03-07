import { Edit, Download } from 'lucide-react';
import type { Profile } from '../../types';

interface ProfileCardProps {
  profile: Profile;
  onEdit?: () => void;
}

export function ProfileCard({ profile, onEdit }: ProfileCardProps) {
  const timeAgo = (isoString: string) => {
    const seconds = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const initials = profile.name
    .split(' ')
    .map((n) => n[0])
    .join('');

  return (
    <div className="p-5 bg-card rounded-lg border border-border hover:border-primary/50 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sun-gold to-sun-gold-dark flex items-center justify-center text-white font-semibold text-lg">
            {initials}
          </div>
          <div>
            <h3 className="font-semibold text-lg">{profile.name}</h3>
            <p className="text-sm text-muted-foreground">{profile.email}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={onEdit} className="p-2 hover:bg-secondary rounded-md transition-colors" title="Edit">
            <Edit className="w-4 h-4" />
          </button>
          <button className="p-2 hover:bg-secondary rounded-md transition-colors" title="Export">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex gap-4 text-sm text-muted-foreground mb-3">
        <span>
          {profile.city}, {profile.state}
        </span>
        {profile.linkedin_url && (
          <span className="truncate">{profile.linkedin_url}</span>
        )}
      </div>

      <div className="text-xs text-muted-foreground mb-3">
        Updated {timeAgo(profile.updated_at)}
      </div>

      <div className="flex gap-2">
        <button onClick={onEdit} className="flex-1 px-3 py-2 text-sm bg-secondary hover:bg-secondary/80 rounded-md transition-colors">
          Edit
        </button>
        <button className="flex-1 px-3 py-2 text-sm bg-secondary hover:bg-secondary/80 rounded-md transition-colors">
          Export
        </button>
      </div>
    </div>
  );
}
