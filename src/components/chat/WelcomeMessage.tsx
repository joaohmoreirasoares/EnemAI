import { Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WelcomeMessageProps {
  onCreateConversation: () => void;
}

const WelcomeMessage = ({ onCreateConversation }: WelcomeMessageProps) => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <Bot className="h-16 w-16 text-purple-500 mb-4" />
      <h3 className="text-xl font-semibold mb-2 text-white">Bem-vindo ao Chat IA</h3>
      <p className="text-gray-400 mb-4">
        Selecione um agente e comece uma conversa sobre as competências do ENEM.
      </p>
      <Button onClick={onCreateConversation} className="bg-purple-600 hover:bg-purple-700 text-white">
        Iniciar Conversa
      </Button>
    </div>
  );
};

export default WelcomeMessage;