import { ReactNode } from 'react';

interface KanbanColumnProps {
  title: string;
  count: number;
  className?: string;
  children: ReactNode;
}

export function KanbanColumn({ title, count, className, children }: KanbanColumnProps) {
  return (
    <div className="w-72 flex-shrink-0 flex flex-col bg-secondary/30 rounded-lg">
      {/* Header */}
      <div className={`p-3 rounded-t-lg ${className}`}>
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-sm">{title}</h3>
          <span className="text-xs bg-background px-2 py-0.5 rounded-full">{count}</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
        {children}
      </div>
    </div>
  );
}
