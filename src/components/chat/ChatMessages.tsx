import { Bot, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface ChatMessagesProps {
  messages: Message[];
  selectedAgent: string;
  isGenerating: boolean;
  generatedResponse: string;
}

const ChatMessages = ({ 
  messages, 
  selectedAgent, 
  isGenerating, 
  generatedResponse 
}: ChatMessagesProps) => {
  // Process message content to remove thinking tags and fix markdown
  const processMessageContent = (content: string) => {
    // Remove thinking tags
    let processedContent = content.replace(/<thinking>[\s\S]*?<\/thinking>/g, '');
    
    // Fix fragmented LaTeX expressions
    processedContent = processedContent
      // Fix inline LaTeX expressions like ((a+b)^n) -> $(a+b)^n$
      .replace(/\(\(([^)]+)\)\)/g, '$$$1$$')
      // Fix fragmented binomial coefficients
      .replace(/b\s*i\s*n\s*o\s*m\s*\{\s*([^}]+)\s*\}\s*\{\s*([^}]+)\s*\}/g, '\\binom{$1}{$2}')
      // Fix fragmented sum expressions
      .replace(/s\s*u\s*m\s*\{\s*k\s*=\s*0\s*\}\s*\^\s*\{\s*n\s*\}/g, '\\sum_{k=0}^{n}')
      .replace(/s\s*u\s*m\s*\{\s*k\s*=\s*0\s*\}\s*\^\s*\{\s*([^}]+)\s*\}/g, '\\sum_{k=0}^{$1}')
      // Fix fragmented displaystyle expressions
      .replace(/displaystyle\s*\$\$(.*?)\$\$/g, '$$$$$1$$$$')
      // Fix fragmented fraction expressions
      .replace(/f\s*r\s*a\s*c\s*\{\s*([^}]+)\s*\}\s*\{\s*([^}]+)\s*\}/g, '\\frac{$1}{$2}')
      // Fix other LaTeX commands
      .replace(/\\boxed\{([^}]+)\}/g, '$\\boxed{$1}$')
      .replace(/\\displaystyle/g, '') // Remove displaystyle
      .replace(/\\left\(/g, '(') // Fix left parentheses
      .replace(/\\right\)/g, ')') // Fix right parentheses
      .replace(/\\,/g, ',') // Fix escaped commas
      .replace(/\\cdot/g, '·') // Fix multiplication dots
      .replace(/\\qquad/g, ' ') // Fix spacing
      .replace(/\\,/g, ',') // Fix commas
      // Fix complex LaTeX expressions with spaces and newlines
      .replace(/begin\s*\{\s*aligned\s*\}/g, '\\begin{aligned}')
      .replace(/end\s*\{\s*aligned\s*\}/g, '\\end{aligned}')
      .replace(/quad/g, '\\quad')
      .replace(/text\s*\{\s*([^}]+)\s*\}/g, '\\text{$1}')
      .replace(/ll/g, '\\ll')
      .replace(/≈/g, '\\approx')
      .replace(/quad/g, '\\quad'); // Fix spacing
    
    // Render markdown with math support
    return (
      <div className="prose prose-invert max-w-none">
        <ReactMarkdown 
          remarkPlugins={[remarkGfm, remarkMath]} 
          rehypePlugins={[rehypeKatex]}
        >
          {processedContent}
        </ReactMarkdown>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex ${
            msg.role === 'user' ? 'justify-end' : 'justify-start'
          }`}
        >
          <div
            className={`max-w-[80%] rounded-lg p-4 ${
              msg.role === 'user'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-white'
            }`}
          >
            <div className="flex items-start gap-2">
              {msg.role === 'assistant' ? (
                <Bot className="h-5 w-5 mt-0.5 flex-shrink-0" />
              ) : (
                <User className="h-5 w-5 mt-0.5 flex-shrink-0" />
              )}
              <div>
                <p className="font-medium text-xs mb-1">
                  {msg.role === 'user' ? 'Você' : selectedAgent}
                </p>
                {msg.role === 'assistant' ? (
                  processMessageContent(msg.content)
                ) : (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
      {isGenerating && (
        <div className="flex justify-start">
          <div className="max-w-[80%] rounded-lg p-4 bg-gray-700 text-white">
            <div className="flex items-start gap-2">
              <Bot className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-xs mb-1">{selectedAgent}</p>
                <div className="prose prose-invert max-w-none">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm, remarkMath]} 
                    rehypePlugins={[rehypeKatex]}
                  >
                    {generatedResponse}
                  </ReactMarkdown>
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-gray-400 animate-bounce"></span>
                  <span className="inline-block w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                  <span className="inline-block w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatMessages;