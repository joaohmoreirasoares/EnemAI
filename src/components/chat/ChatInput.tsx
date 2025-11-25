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
    <div className="p-3 border-t border-gray-700">
      <div className="flex gap-2">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Digite sua pergunta sobre o ENEM..."
          className="bg-gray-700 border-gray-600 text-white flex-1"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          disabled={isLoading || !hasActiveConversation || !hasApiKey}
        />
        <Button
          onClick={handleSend}
          disabled={!message.trim() || !hasActiveConversation || isLoading || !hasApiKey}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          {isLoading ? (
            <div className="flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-full bg-white animate-bounce"></span>
              <span className="inline-block w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: '0.2s' }}></span>
              <span className="inline-block w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: '0.4s' }}></span>
            </div>
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
      {!hasApiKey && (
        <p className="text-red-400 text-sm mt-2">
          ⚠️ Chave da API não configurada. Configure VITE_GROQ_API_KEY no arquivo .env
        </p>
      )}
    </div>
  );
};

export default ChatInput;