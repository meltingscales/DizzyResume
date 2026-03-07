import {
  User,
  FileText,
  FileEdit,
  Library,
  BarChart3,
  Search,
  Settings,
  Sun,
  Moon,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import type { ViewId } from '../../types';

interface SidebarProps {
  currentView: ViewId;
  onViewChange: (view: ViewId) => void;
  isDarkMode: boolean;
  onDarkModeToggle: () => void;
}

const navItems = [
  { id: 'profiles' as ViewId, label: 'Profiles', icon: User, count: 2 },
  { id: 'resumes' as ViewId, label: 'Resumes', icon: FileText, count: 5 },
  { id: 'templates' as ViewId, label: 'Templates', icon: FileEdit, count: 12 },
  { id: 'snippets' as ViewId, label: 'Snippets', icon: Library, count: 8 },
  { id: 'tracker' as ViewId, label: 'Tracker', icon: BarChart3, count: 23 },
  { id: 'discovery' as ViewId, label: 'Discovery', icon: Search },
  { id: 'settings' as ViewId, label: 'Settings', icon: Settings },
];

export function Sidebar({
  currentView,
  onViewChange,
  isDarkMode,
  onDarkModeToggle,
}: SidebarProps) {
  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="text-2xl">☀️</span>
          <div>
            <h1 className="font-semibold text-lg">Ra</h1>
            <p className="text-xs text-muted-foreground">DizzyResume</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-thin">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground font-medium'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.count !== undefined && (
                <span
                  className={cn(
                    'text-xs px-2 py-0.5 rounded-full',
                    isActive
                      ? 'bg-primary-foreground/20 text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-border">
        <button
          onClick={onDarkModeToggle}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
        >
          {isDarkMode ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
          <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
      </div>
    </aside>
  );
}
