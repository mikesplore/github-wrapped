import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  return (
    <div className={`prose prose-invert max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Customize heading styles
          h1: ({ children }) => (
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-2xl md:text-3xl font-semibold mb-3 text-gray-100">
              {children}
            </h3>
          ),
          // Customize paragraph styles
          p: ({ children }) => (
            <p className="text-lg md:text-xl mb-4 text-gray-200 leading-relaxed">
              {children}
            </p>
          ),
          // Customize list styles
          ul: ({ children }) => (
            <ul className="list-disc list-inside space-y-2 mb-4 text-gray-200">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside space-y-2 mb-4 text-gray-200">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-lg md:text-xl text-gray-200 ml-4">
              {children}
            </li>
          ),
          // Customize strong/bold text
          strong: ({ children }) => (
            <strong className="font-bold text-green-400">
              {children}
            </strong>
          ),
          // Customize emphasis/italic text
          em: ({ children }) => (
            <em className="italic text-blue-400">
              {children}
            </em>
          ),
          // Customize code blocks
          code: ({ className, children }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code className="bg-gray-800 text-green-400 px-2 py-1 rounded text-sm">
                  {children}
                </code>
              );
            }
            return (
              <code className={`block bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto ${className}`}>
                {children}
              </code>
            );
          },
          // Customize blockquotes
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-green-500 pl-4 italic text-gray-300 my-4">
              {children}
            </blockquote>
          ),
          // Customize links
          a: ({ href, children }) => (
            <a
              href={href}
              className="text-blue-400 hover:text-blue-300 underline transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
          // Customize horizontal rules
          hr: () => (
            <hr className="border-gray-700 my-6" />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
