import { X, FileText } from 'lucide-react';
import type { UploadResult } from '../../services/cloudinary';
import { formatFileSize } from '../../services/cloudinary';

interface Props {
  attachments: UploadResult[];
  onRemove: (index: number) => void;
}

export function AttachmentPreview({ attachments, onRemove }: Props) {
  if (attachments.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-2 animate-fade-in">
      {attachments.map((a, i) => (
        <div
          key={i}
          className="relative group flex items-center gap-2 pl-1.5 pr-7 py-1.5 rounded-lg border border-edge bg-surface max-w-[200px]"
        >
          {a.type === 'image' ? (
            <img
              src={a.url}
              alt={a.name}
              className="w-8 h-8 rounded object-cover shrink-0"
            />
          ) : (
            <div className="w-8 h-8 rounded bg-edge/60 flex items-center justify-center shrink-0">
              <FileText size={14} className="text-muted" />
            </div>
          )}
          <div className="min-w-0">
            <div className="text-xs truncate">{a.name}</div>
            <div className="text-[10px] text-muted tabular-nums">
              {formatFileSize(a.size)}
            </div>
          </div>
          <button
            type="button"
            onClick={() => onRemove(i)}
            className="absolute right-1 top-1 w-5 h-5 rounded flex items-center justify-center text-muted hover:bg-red-500/10 hover:text-red-500 transition-colors"
            aria-label={`Remove ${a.name}`}
          >
            <X size={11} />
          </button>
        </div>
      ))}
    </div>
  );
}
