import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { api } from '../../lib/api';
import type { Template } from '../../types';

interface TemplateAssembleModalProps {
  template: Template;
  onClose: () => void;
}

function assemble(content: string, values: Record<string, string>): string {
  return content.replace(/\{(\w+)\}/g, (_, key) => values[key] ?? `{${key}}`);
}

export function TemplateAssembleModal({ template, onClose }: TemplateAssembleModalProps) {
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(template.variables.map((v) => [v, '']))
  );
  const [copied, setCopied] = useState(false);

  const preview = assemble(template.content, values);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(preview);
    await api.templates.recordUse(template.id).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const inputClass =
    'w-full px-3 py-2 bg-secondary border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary';
  const labelClass = 'block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide';

  return (
    <Modal title={`Assemble: ${template.title}`} onClose={onClose} size="lg">
      <div className="space-y-5">
        {/* Variable inputs */}
        {template.variables.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Fill in the merge fields — the preview updates live.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {template.variables.map((v) => (
                <div key={v}>
                  <label className={labelClass}>{v.replace(/_/g, ' ')}</label>
                  <input
                    className={inputClass}
                    value={values[v]}
                    onChange={(e) => setValues((prev) => ({ ...prev, [v]: e.target.value }))}
                    placeholder={`{${v}}`}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Live preview */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium">Preview</span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copied!' : 'Copy to Clipboard'}
            </button>
          </div>
          <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed bg-secondary/50 rounded-md p-4 border border-border max-h-80 overflow-y-auto">
            {preview || <span className="text-muted-foreground italic">No content yet.</span>}
          </pre>
        </div>
      </div>
    </Modal>
  );
}
