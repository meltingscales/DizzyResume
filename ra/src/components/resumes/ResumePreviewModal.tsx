import { Modal } from '../ui/Modal';
import type { ResumeVariant } from '../../types';

interface ResumePreviewModalProps {
  variant: ResumeVariant;
  onClose: () => void;
}

export function ResumePreviewModal({ variant, onClose }: ResumePreviewModalProps) {
  const wordCount = variant.content.trim() ? variant.content.trim().split(/\s+/).length : 0;

  return (
    <Modal title={variant.name} onClose={onClose} size="lg">
      <div className="space-y-3">
        {variant.description && (
          <p className="text-sm text-muted-foreground">{variant.description}</p>
        )}
        <p className="text-xs text-muted-foreground">{wordCount} words</p>
        {variant.content.trim() ? (
          <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed bg-secondary/50 rounded-md p-4 border border-border">
            {variant.content}
          </pre>
        ) : (
          <p className="text-sm text-muted-foreground italic text-center py-8">
            No content yet.
          </p>
        )}
      </div>
    </Modal>
  );
}
