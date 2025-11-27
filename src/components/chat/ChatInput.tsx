import { Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ChatInputProps {
  message: string;
  setMessage: (message: string) => void;
  onSend: (message: string) => void;
  isLoading: boolean;
  hasApiKey: boolean;
  hasActiveConversation: boolean;
}

const ChatInput = ({
  message,
  setMessage,
  onSend,
  isLoading,
  hasApiKey,
  hasActiveConversation
}: ChatInputProps) => {

  const handleSend = () => {
    if (message.trim()) {
      onSend(message);
    }
  };

  return (
    <div className="p-4 bg-transparent">
      <div className="max-w-3xl mx-auto relative">
        <div className="relative flex items-center w-full shadow-2xl rounded-full bg-gray-800/80 backdrop-blur-xl border border-gray-700/50 focus-within:border-purple-500/50 focus-within:ring-1 focus-within:ring-purple-500/20 transition-all duration-300">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Digite sua pergunta sobre o ENEM..."
            className="flex-1 bg-transparent border-none text-white placeholder:text-gray-400 h-14 px-6 rounded-full focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            disabled={isLoading || !hasActiveConversation || !hasApiKey}
          />
          <div className="pr-2">
            <Button
              onClick={handleSend}
              disabled={!message.trim() || !hasActiveConversation || isLoading || !hasApiKey}
              size="icon"
              className={`h-10 w-10 rounded-full transition-all duration-200 ${message.trim()
                  ? 'bg-white text-gray-900 hover:bg-gray-200 shadow-lg shadow-white/10'
                  : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-0.5">
                  <span className="w-1 h-1 rounded-full bg-current animate-bounce"></span>
                  <span className="w-1 h-1 rounded-full bg-current animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                  <span className="w-1 h-1 rounded-full bg-current animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                </div>
              ) : (
                <Send className="h-5 w-5 ml-0.5" />
              )}
            </Button>
          </div>
        </div>

        {!hasApiKey && (
          <p className="text-red-400 text-xs text-center mt-2 absolute -bottom-6 left-0 right-0">
            ⚠️ Chave da API não configurada.
          </p>
        )}
      </div>
    </div>
  );
};

export default ChatInput;