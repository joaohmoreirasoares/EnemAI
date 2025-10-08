import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface MarkdownProcessorProps {
  content: string;
}

const MarkdownProcessor = ({ content }: MarkdownProcessorProps) => {
  // Remove thinking tags before processing
  const cleanContent = content.replace(/<thinking>[\s\S]*?<\/thinking>/g, '');

  return (
    <div className="prose prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          p: ({ node, ...props }) => <p className="mb-3" {...props} />,
          h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mt-6 mb-4" {...props} />,
          h2: ({ node, ...props }) => <h2 className="text-xl font-bold mt-5 mb-3" {...props} />,
          h3: ({ node, ...props }) => <h3 className="text-lg font-bold mt-4 mb-2" {...props} />,
          ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-3" {...props} />,
          ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-3" {...props} />,
          li: ({ node, ...props }) => <li className="mb-1" {...props} />,
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-4 border-purple-500 pl-4 italic" {...props} />
          ),
          code: ({ node, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            return match ? (
              <code className={`language-${match[1]}`} {...props}>
                {children}
              </code>
            ) : (
              <code className="bg-gray-800 rounded px-1.5 py-0.5 text-sm" {...props}>
                {children}
              </code>
            );
          },
          pre: ({ node, ...props }) => (
            <pre className="bg-gray-800 rounded p-4 mb-4 overflow-x-auto" {...props} />
          ),
        }}
      >
        {cleanContent}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownProcessor;