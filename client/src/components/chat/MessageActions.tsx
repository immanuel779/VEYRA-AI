import { useState } from 'react';
import { Copy, Check, RotateCw, ThumbsUp, ThumbsDown } from 'lucide-react';

interface Props {
  content: string;
  feedback?: 'like' | 'dislike' | null;
  canRegenerate?: boolean;
  onRegenerate?: () => void;
  onFeedback?: (type: 'like' | 'dislike' | null) => void;
}

export function MessageActions({
  content,
  feedback,
  canRegenerate,
  onRegenerate,
  onFeedback,
}: Props) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function toggleFeedback(type: 'like' | 'dislike') {
    if (!onFeedback) return;
    onFeedback(feedback === type ? null : type);
  }

  return (
    <div className="flex items-center gap-0.5 mt-2 -ml-1.5 opacity-0 group-hover/assistant:opacity-100 focus-within:opacity-100 transition-opacity duration-150">
      <ActionButton onClick={copy} label={copied ? 'Copied' : 'Copy'}>
        {copied ? <Check size={13} /> : <Copy size={13} />}
      </ActionButton>

      {canRegenerate && onRegenerate && (
        <ActionButton onClick={onRegenerate} label="Regenerate">
          <RotateCw size={13} />
        </ActionButton>
      )}

      {onFeedback && (
        <>
          <ActionButton
            onClick={() => toggleFeedback('like')}
            label="Good response"
            active={feedback === 'like'}
          >
            <ThumbsUp size={13} />
          </ActionButton>
          <ActionButton
            onClick={() => toggleFeedback('dislike')}
            label="Bad response"
            active={feedback === 'dislike'}
          >
            <ThumbsDown size={13} />
          </ActionButton>
        </>
      )}
    </div>
  );
}

function ActionButton({
  children,
  onClick,
  label,
  active,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${
        active
          ? 'text-accent bg-accent-soft/60'
          : 'text-muted hover:text-ink hover:bg-edge/60'
      }`}
    >
      {children}
    </button>
  );
}