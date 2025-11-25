import { Bot, User } from 'lucide-react';
import MarkdownProcessor from './MarkdownProcessor';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
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
  return (
    <div className="space-y-4 w-full">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
        >
          <div
            className={`max-w-[85%] rounded-lg p-4 ${msg.role === 'user'
              ? 'bg-purple-600 text-white'
              : msg.role === 'system'
                ? 'bg-gray-800 text-gray-300 border border-gray-700 font-mono text-sm'
                : 'bg-gray-700 text-white'
              }`}
          >
            <div className="flex items-start gap-2">
              {msg.role === 'assistant' ? (
                <Bot className="h-5 w-5 mt-0.5 flex-shrink-0" />
              ) : msg.role === 'user' ? (
                <User className="h-5 w-5 mt-0.5 flex-shrink-0" />
              ) : (
                <div className="h-5 w-5 mt-0.5 flex-shrink-0 flex items-center justify-center">
                  <span className="text-xs">⚙️</span>
                </div>
              )}
              <div>
                <p className="font-medium text-xs mb-1">
                  {msg.role === 'user' ? 'Você' : msg.role === 'system' ? 'Sistema' : 'Tutor ENEM AI'}
                </p>
                {msg.role === 'assistant' ? (
                  <MarkdownProcessor content={msg.content} />
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
          <div className="max-w-[85%] rounded-lg p-4 bg-gray-700 text-white">
            <div className="flex items-start gap-2">
              <Bot className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-xs mb-1">Tutor ENEM AI</p>
                <MarkdownProcessor content={generatedResponse} />
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