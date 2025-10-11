import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AgentSelectorProps {
  onShowConversations: () => void;
}

const AgentSelector = ({ onShowConversations }: AgentSelectorProps) => {
  return (
    <div className="p-3 border-b border-gray-700">
      <div className="flex flex-row items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={onShowConversations}
          className="bg-gray-800 text-white hover:bg-gray-700 border-gray-600"
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Conversas
        </Button>
        
        <div className="text-center">
          <h3 className="text-sm font-semibold text-white">Agente ENEM AI</h3>
          <p className="text-xs text-gray-400">Tutor Geral</p>
        </div>
        
        <p className="text-xs text-gray-500 max-w-[200px]">
          Este agente responde dúvidas de todas as áreas do ENEM e utiliza suas anotações como contexto.
        </p>
      </div>
    </div>
  );
};

export default AgentSelector;