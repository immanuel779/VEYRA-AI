import { FileText, Download, ExternalLink } from 'lucide-react';
import type { Attachment } from '../../services/conversations';
import { formatFileSize } from '../../services/cloudinary';

interface Props {
  attachments: Attachment[];
}

export function MessageAttachments({ attachments }: Props) {
  if (!attachments || attachments.length === 0) return null;

  const images = attachments.filter((a) => a.type === 'image');
  const files = attachments.filter((a) => a.type === 'file');

  return (
    <div className="space-y-2 mb-2">
      {images.length > 0 && (
        <div className={`grid gap-1.5 ${images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
          {images.map((img, i) => (
            <a
              key={i}
              href={img.url}
              target="_blank"
              rel="noopener noreferrer"
              className="relative block rounded-lg overflow-hidden border border-white/20 hover:opacity-90 transition-opacity group/img"
            >
              <img
                src={img.url}
                alt={img.name}
                className="w-full max-h-64 object-cover"
                loading="lazy"
              />
              <div className="absolute top-1.5 right-1.5 w-6 h-6 rounded-md bg-black/50 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity">
                <ExternalLink size={12} className="text-white" />
              </div>
            </a>
          ))}
        </div>
      )}

      {files.length > 0 && (
        <div className="space-y-1.5">
          {files.map((f, i) => (
            <a
              key={i}
              href={f.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-white/15 hover:bg-white/25 transition-colors"
            >
              <FileText size={16} className="shrink-0 opacity-90" />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-medium truncate">{f.name}</div>
                <div className="text-[10px] opacity-70 tabular-nums">
                  {formatFileSize(f.size)}
                </div>
              </div>
              <Download size={14} className="shrink-0 opacity-60" />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
