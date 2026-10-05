import React from 'react';
import ReactMarkdown from 'react-markdown';

interface MarkdownContentProps {
  content: string;
  className?: string;
  isUser?: boolean;
}

export const MarkdownContent: React.FC<MarkdownContentProps> = ({
  content,
  className = '',
  isUser = false,
}) => {
  return (
    <div
      className={`prose prose-sm max-w-none break-words ${
        isUser ? 'text-white' : 'text-slate-800'
      } ${className}`}
    >
      <ReactMarkdown
        components={{
          p: ({ children }) => (
            <p className="mb-2.5 last:mb-0 leading-relaxed font-normal">{children}</p>
          ),
          strong: ({ children }) => (
            <strong className={`font-black ${isUser ? 'text-white' : 'text-slate-900'}`}>
              {children}
            </strong>
          ),
          em: ({ children }) => <em className="italic">{children}</em>,
          h1: ({ children }) => (
            <h1 className={`text-base sm:text-lg font-black mt-3 mb-1.5 ${isUser ? 'text-white' : 'text-[#0B3A53]'}`}>
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className={`text-sm sm:text-base font-black mt-3 mb-1.5 ${isUser ? 'text-white' : 'text-[#0B3A53]'}`}>
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className={`text-xs sm:text-sm font-black mt-2.5 mb-1 ${isUser ? 'text-white' : 'text-[#0B3A53]'}`}>
              {children}
            </h3>
          ),
          ul: ({ children }) => (
            <ul className="list-disc pl-4 mb-2.5 space-y-1 leading-relaxed">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-4 mb-2.5 space-y-1 leading-relaxed">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed font-medium">{children}</li>
          ),
          hr: () => (
            <hr className={`my-2.5 border-t ${isUser ? 'border-white/20' : 'border-slate-200'}`} />
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-3 border-[#16A6A1] pl-3 italic my-2 opacity-90">
              {children}
            </blockquote>
          ),
          code: ({ children }) => (
            <code className={`px-1.5 py-0.5 rounded font-mono text-xs ${isUser ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-800'}`}>
              {children}
            </code>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
