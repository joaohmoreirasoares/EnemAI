import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AgentSelectorProps {
  agents: string[];
  selectedAgent: string;
  setSelectedAgent: (agent: string) => void;
  onShowConversations: () => void;
}

const AgentSelector = ({ 
  agents, 
  selectedAgent, 
  setSelectedAgent, 
  onShowConversations 
}: AgentSelectorProps) => {
  return (
    <div className="p-4 border-b border-gray-700">
      <div className="flex flex-wrap gap-2 justify-center">
        <Button
          variant="outline"
          size="sm"
          onClick={onShowConversations}
          className="bg-gray-800 text-white hover:bg-gray-700 border-gray-600"
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Conversas
        </Button>
        {agents.map((agent) => (
          <Button
            key={agent}
            variant={selectedAgent === agent ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedAgent(agent)}
            className={
              selectedAgent === agent
                ? "bg-purple-600 hover:bg-purple-700 text-white"
                : "bg-black text-white hover:bg-gray-800 border-gray-600"
            }
          >
            {agent}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default AgentSelector;