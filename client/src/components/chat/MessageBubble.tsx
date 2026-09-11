import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CodeBlock } from './CodeBlock';

interface Props {
  role: 'user' | 'assistant';
  content: string;
  streaming?: boolean;
}

export function MessageBubble({ role, content, streaming }: Props) {
  const isUser = role === 'user';

  if (isUser) {
    return (
      <div className="max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words bg-accent text-white">
        {content}
      </div>
    );
  }

  return (
    <div className="max-w-[85%] text-sm leading-relaxed text-ink min-w-0">
      <div className="prose-veyra">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            code(props: any) {
              const { children, className, node, ...rest } = props;
              const match = /language-(\w+)/.exec(className || '');
              const value = String(children).replace(/\n$/, '');
              const isBlock = match || value.includes('\n');

              if (isBlock) {
                return <CodeBlock language={match?.[1] || 'text'} value={value} />;
              }

              return (
                <code
                  className="px-1.5 py-0.5 rounded bg-edge/60 text-[12.5px] font-mono text-ink"
                  {...rest}
                >
                  {children}
                </code>
              );
            },
            p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
            ul: ({ children }) => (
              <ul className="list-disc pl-5 mb-3 space-y-1">{children}</ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal pl-5 mb-3 space-y-1">{children}</ol>
            ),
            li: ({ children }) => <li className="leading-relaxed">{children}</li>,
            h1: ({ children }) => (
              <h1 className="text-xl font-semibold mt-5 mb-2 first:mt-0">{children}</h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-lg font-semibold mt-4 mb-2 first:mt-0">{children}</h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-base font-semibold mt-3 mb-1.5 first:mt-0">{children}</h3>
            ),
            a: ({ children, href }) => (
              <a
                href={href}
                target="_blank"
                rel="noreferrer"
                className="text-accent hover:underline"
              >
                {children}
              </a>
            ),
            blockquote: ({ children }) => (
              <blockquote className="border-l-2 border-accent/40 pl-3 my-3 text-muted italic">
                {children}
              </blockquote>
            ),
            strong: ({ children }) => (
              <strong className="font-semibold text-ink">{children}</strong>
            ),
            em: ({ children }) => <em className="italic">{children}</em>,
            hr: () => <hr className="border-edge my-4" />,
            table: ({ children }) => (
              <div className="my-3 overflow-x-auto rounded-lg border border-edge">
                <table className="w-full text-xs">{children}</table>
              </div>
            ),
            thead: ({ children }) => <thead className="bg-edge/40">{children}</thead>,
            th: ({ children }) => (
              <th className="px-3 py-2 text-left font-medium border-b border-edge">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="px-3 py-2 border-b border-edge last:border-b-0">
                {children}
              </td>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
      {streaming && content.length > 0 && (
        <span className="inline-block w-1.5 h-3.5 ml-0.5 bg-accent/70 animate-pulse align-middle" />
      )}
    </div>
  );
}