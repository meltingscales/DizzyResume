import { ReactNode } from 'react';

interface KanbanColumnProps {
  title: string;
  count: number;
  className?: string;
  children: ReactNode;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  isDragOver: boolean;
}

export function KanbanColumn({
  title,
  count,
  className,
  children,
  onDragOver,
  onDrop,
  isDragOver,
}: KanbanColumnProps) {
  return (
    <div
      className={`w-64 flex-shrink-0 flex flex-col rounded-lg transition-colors ${
        isDragOver ? 'bg-primary/10 ring-1 ring-primary/40' : 'bg-secondary/30'
      }`}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {/* Header */}
      <div className={`p-3 rounded-t-lg ${className}`}>
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-sm">{title}</h3>
          <span className="text-xs bg-background px-2 py-0.5 rounded-full">{count}</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-2 scrollbar-thin min-h-16">
        {children}
      </div>
    </div>
  );
}
