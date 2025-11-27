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
    <div className="space-y-6 w-full max-w-3xl mx-auto px-4">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`flex gap-4 max-w-[90%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
          >
            {/* Avatar / Icon */}
            <div className={`flex-shrink-0 mt-1`}>
              {msg.role === 'assistant' ? (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                  <Bot className="h-5 w-5 text-white" />
                </div>
              ) : msg.role === 'user' ? (
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                  <User className="h-5 w-5 text-gray-300" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center">
                  <span className="text-xs">⚙️</span>
                </div>
              )}
            </div>

            {/* Message Content */}
            <div
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'
                }`}
            >
              <div
                className={`text-sm ${msg.role === 'user'
                    ? 'bg-gray-800 text-white px-5 py-3 rounded-2xl rounded-tr-sm'
                    : msg.role === 'system'
                      ? 'bg-gray-900/50 text-gray-400 border border-gray-800 p-4 rounded-lg font-mono text-xs w-full'
                      : 'text-gray-100 py-1' // AI message has no background
                  }`}
              >
                {msg.role === 'assistant' ? (
                  <MarkdownProcessor content={msg.content} />
                ) : (
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                )}
              </div>

              {/* Timestamp or Name (optional, keeping minimal for now) */}
              {msg.role !== 'user' && msg.role !== 'system' && (
                <span className="text-xs text-gray-500 mt-1 ml-1">Tutor ENEM AI</span>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Loading State */}
      {isGenerating && (
        <div className="flex w-full justify-start">
          <div className="flex gap-4 max-w-[90%]">
            <div className="flex-shrink-0 mt-1">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/20 animate-pulse">
                <Bot className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="flex flex-col items-start">
              <div className="text-gray-100 py-1">
                <MarkdownProcessor content={generatedResponse} />
                <div className="flex items-center gap-1 mt-2 h-6">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce"></span>
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0.4s' }}></span>
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