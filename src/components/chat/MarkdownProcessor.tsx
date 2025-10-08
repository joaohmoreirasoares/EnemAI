import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkRehype from 'remark-rehype';
import rehypeKatex from 'rehype-katex';
import rehypeStringify from 'rehype-stringify';

interface MarkdownProcessorProps {
  content: string;
}

const MarkdownProcessor = ({ content }: MarkdownProcessorProps) => {
  // Process the content through a unified pipeline
  const processMarkdown = (text: string): string => {
    try {
      // Create processor with proper typing
      const processor = unified()
        .use(remarkParse)
        .use(remarkGfm)
        .use(remarkMath)
        .use(() => {
          // Custom plugin to handle thinking tags
          return (tree: any) => {
            // Remove thinking nodes from the AST
            const removeThinking = (node: any) => {
              if (node.type === 'html' && node.value?.includes('<thinking>')) {
                return null;
              }
              if (node.children) {
                node.children = node.children
                  .map(removeThinking)
                  .filter(Boolean);
              }
              return node;
            };
            
            return removeThinking(tree);
          };
        })
        .use(remarkRehype)
        .use(rehypeKatex)
        .use(rehypeStringify);
      
      // Process the content
      const result = processor.processSync(text);
      return String(result);
    } catch (error) {
      console.error('Error processing markdown:', error);
      // Fallback to basic markdown processing
      return text;
    }
  };

  // Process the content
  const processedContent = processMarkdown(content);

  return (
    <div className="prose prose-invert max-w-none">
      <div dangerouslySetInnerHTML={{ __html: processedContent }} />
    </div>
  );
};

export default MarkdownProcessor;