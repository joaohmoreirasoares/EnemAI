import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AgentSelectorProps {
  onShowConversations: () => void;
}

const AgentSelector = ({ onShowConversations }: AgentSelectorProps) => {
  return (
    <div className="p-3 border-b border-gray-700">
      <div className="flex flex-col items-center text-center">
        <Button
          variant="outline"
          size="sm"
          onClick={onShowConversations}
          className="bg-gray-800 text-white hover:bg-gray-700 border-gray-600 mb-3"
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Conversas
        </Button>
        
        <div className="text-center">
          <h3 className="text-sm font-semibold text-white mb-1">Agente ENEM AI</h3>
          <p className="text-xs text-gray-400">Tutor Geral</p>
        </div>
        
        <p className="text-xs text-gray-500 mt-2 max-w-[200px]">
          Este agente responde dúvidas de todas as áreas do ENEM e utiliza suas anotações como contexto.
        </p>
      </div>
    </div>
  );
};

export default AgentSelector;