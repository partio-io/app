"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

interface MarkdownBodyProps {
  content: string;
}

export function MarkdownBody({ content }: MarkdownBodyProps) {
  return (
    <div className="prose prose-invert prose-sm max-w-none text-foreground [&_a]:text-info [&_a]:no-underline hover:[&_a]:underline [&_code]:rounded [&_code]:bg-surface-light [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-xs [&_code]:font-mono [&_pre]:rounded-lg [&_pre]:border [&_pre]:border-border [&_pre]:bg-surface [&_pre]:p-4 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_img]:rounded-lg [&_table]:border-collapse [&_th]:border [&_th]:border-border [&_th]:bg-surface-light [&_th]:px-3 [&_th]:py-1.5 [&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-1.5 [&_hr]:border-border [&_blockquote]:border-l-accent [&_blockquote]:text-muted [&_input[type='checkbox']]:mr-2">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
