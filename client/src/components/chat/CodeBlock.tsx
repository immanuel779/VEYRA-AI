import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface Props {
  language: string;
  value: string;
}

export function CodeBlock({ language, value }: Props) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="my-3 rounded-lg overflow-hidden border border-edge bg-[#282c34]">
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#21252b] border-b border-black/20">
        <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
          {language || 'text'}
        </span>
        <button
          onClick={copy}
          className="flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-slate-100 transition-colors"
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <Check size={12} /> Copied
            </>
          ) : (
            <>
              <Copy size={12} /> Copy
            </>
          )}
        </button>
      </div>
      <SyntaxHighlighter
        language={language || 'text'}
        style={oneDark}
        customStyle={{
          margin: 0,
          padding: '12px 14px',
          background: 'transparent',
          fontSize: '12.5px',
          lineHeight: 1.55,
        }}
        codeTagProps={{ style: { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' } }}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  );
}