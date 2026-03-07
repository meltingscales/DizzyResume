import { LucideIcon, Edit, Play, Trash2 } from 'lucide-react';
import type { Template } from '../../types';

interface TemplateCardProps {
  template: Template;
  Icon: LucideIcon;
  onDelete?: () => void;
}

export function TemplateCard({ template, Icon, onDelete }: TemplateCardProps) {
  const timeAgo = (isoString?: string | null) => {
    if (!isoString) return 'Never';
    const seconds = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="p-5 bg-card rounded-lg border border-border hover:border-primary/50 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-sun-gold/20 to-sun-gold/10 flex items-center justify-center">
            <Icon className="w-5 h-5 text-sun-gold" />
          </div>
          <div>
            <h3 className="font-semibold">{template.title}</h3>
            <p className="text-sm text-muted-foreground">{template.description}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="p-2 hover:bg-secondary rounded-md transition-colors" title="Edit">
            <Edit className="w-4 h-4" />
          </button>
          <button className="p-2 hover:bg-secondary rounded-md transition-colors" title="Use">
            <Play className="w-4 h-4" />
          </button>
          {onDelete && (
            <button
              className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-md transition-colors"
              title="Delete"
              onClick={onDelete}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
        <span>Last used: {timeAgo(template.last_used_at)}</span>
        <span>•</span>
        <span>Used {template.use_count} times</span>
      </div>

      {template.variables.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {template.variables.map((v) => (
            <span key={v} className="px-2 py-0.5 text-xs bg-secondary rounded">
              {`{${v}}`}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
