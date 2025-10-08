import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkRehype from 'remark-rehype';
import rehypeKatex from 'rehype-katex';
import rehypeStringify from 'rehype-stringify';
import { Root } from 'remark-parse/lib';
import { VFile } from 'vfile';

interface MarkdownProcessorProps {
  content: string;
}

const MarkdownProcessor = ({ content }: MarkdownProcessorProps) => {
  // Process the content through a unified pipeline
  const processMarkdown = async (text: string): Promise<string> => {
    try {
      // Create a virtual file with the content
      const file = new VFile(text);
      
      // Process through remark plugins
      const result = await unified()
        .use(remarkParse)
        .use(remarkGfm)
        .use(remarkMath)
        .use(() => {
          // Custom plugin to handle thinking tags
          return (tree: Root) => {
            // Remove thinking nodes from the AST
            const removeThinking = (node: any) => {
              if (node.type === 'html' && node.value.includes('<thinking>')) {
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
        .use(rehypeStringify)
        .process(file);
      
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