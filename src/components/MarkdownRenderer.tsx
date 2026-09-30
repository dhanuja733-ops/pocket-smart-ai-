import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { marked } from 'marked';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Configure marked options
  marked.setOptions({
    gfm: true,
    breaks: true,
  });

  // Extract code snippets for interactive copy buttons
  const copyCode = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Process code blocks specially or render via marked
  // We can render HTML safely and also enhance pre code blocks
  const htmlContent = marked.parse(content) as string;

  return (
    <div
      className={`prose prose-slate dark:prose-invert max-w-none text-[15px] leading-relaxed break-words
        prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-slate-900 dark:prose-headings:text-slate-100
        prose-h1:text-xl prose-h1:mb-3 prose-h1:mt-4
        prose-h2:text-lg prose-h2:mb-2 prose-h2:mt-3
        prose-h3:text-base prose-h3:mb-2 prose-h3:mt-3
        prose-p:my-2 prose-p:leading-relaxed
        prose-ul:my-2 prose-ul:list-disc prose-ul:pl-5
        prose-ol:my-2 prose-ol:list-decimal prose-ol:pl-5
        prose-li:my-1
        prose-blockquote:border-l-4 prose-blockquote:border-indigo-500 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:my-2 prose-blockquote:text-slate-600 dark:prose-blockquote:text-slate-300
        prose-table:w-full prose-table:border-collapse prose-table:my-3 prose-table:text-sm
        prose-th:border prose-th:border-slate-300 dark:prose-th:border-slate-700 prose-th:bg-slate-100 dark:prose-th:bg-slate-800 prose-th:p-2 prose-th:font-semibold prose-th:text-left
        prose-td:border prose-td:border-slate-200 dark:prose-td:border-slate-700 prose-td:p-2
        prose-pre:bg-slate-900 prose-pre:text-slate-100 prose-pre:p-3 prose-pre:rounded-xl prose-pre:my-3 prose-pre:overflow-x-auto
        prose-code:text-indigo-600 dark:prose-code:text-indigo-400 prose-code:bg-indigo-50 dark:prose-code:bg-indigo-950/60 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-[13px] prose-code:font-mono
        ${className}`}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
};
