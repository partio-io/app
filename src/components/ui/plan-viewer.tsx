"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface PlanViewerProps {
  plan: string;
}

export function PlanViewer({ plan }: PlanViewerProps) {
  return (
    <div className="rounded-xl border border-border bg-surface">
      <div className="p-5">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ children }) => (
              <h1 className="text-2xl font-semibold text-foreground mt-6 mb-3 first:mt-0">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-xl font-semibold text-foreground mt-5 mb-2">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">
                {children}
              </h3>
            ),
            h4: ({ children }) => (
              <h4 className="text-base font-semibold text-foreground mt-3 mb-1">
                {children}
              </h4>
            ),
            p: ({ children }) => (
              <p className="text-sm text-foreground/90 leading-relaxed mb-3">
                {children}
              </p>
            ),
            ul: ({ children }) => (
              <ul className="list-disc list-inside text-sm text-foreground/90 mb-3 space-y-1">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal list-inside text-sm text-foreground/90 mb-3 space-y-1">
                {children}
              </ol>
            ),
            li: ({ children }) => <li className="leading-relaxed">{children}</li>,
            a: ({ href, children }) => (
              <a
                href={href}
                className="text-accent-light hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {children}
              </a>
            ),
            code: ({ className, children }) => {
              const match = className?.match(/language-(\w+)/);
              if (match) {
                return (
                  <SyntaxHighlighter
                    style={oneDark}
                    language={match[1]}
                    customStyle={{
                      margin: 0,
                      borderRadius: "0.5rem",
                      fontSize: "0.875rem",
                    }}
                  >
                    {String(children).replace(/\n$/, "")}
                  </SyntaxHighlighter>
                );
              }
              return (
                <code className="rounded bg-surface-light border border-border px-1.5 py-0.5 text-xs font-mono text-foreground/90">
                  {children}
                </code>
              );
            },
            pre: ({ children }) => (
              <div className="mb-3">{children}</div>
            ),
            blockquote: ({ children }) => (
              <blockquote className="border-l-2 border-accent/50 pl-4 text-sm text-muted italic mb-3">
                {children}
              </blockquote>
            ),
            table: ({ children }) => (
              <div className="overflow-x-auto mb-3">
                <table className="w-full text-sm border-collapse border border-border">
                  {children}
                </table>
              </div>
            ),
            thead: ({ children }) => (
              <thead className="bg-surface-light">{children}</thead>
            ),
            th: ({ children }) => (
              <th className="border border-border px-3 py-2 text-left font-semibold text-foreground">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="border border-border px-3 py-2 text-foreground/90">
                {children}
              </td>
            ),
            hr: () => <hr className="border-border my-4" />,
            strong: ({ children }) => (
              <strong className="font-semibold text-foreground">{children}</strong>
            ),
          }}
        >
          {plan}
        </ReactMarkdown>
      </div>
    </div>
  );
}
