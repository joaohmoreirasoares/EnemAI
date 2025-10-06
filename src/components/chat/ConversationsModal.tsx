import { Plus, X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Conversation {
  id: string;
  title: string;
  updated_at: string;
}

interface ConversationsModalProps {
  conversations: Conversation[];
  activeConversation: string | null;
  onCreateConversation: () => void;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  onClose: () => void;
}

const ConversationsModal = ({ 
  conversations, 
  activeConversation, 
  onCreateConversation, 
  onSelectConversation, 
  onDeleteConversation, 
  onClose 
}: ConversationsModalProps) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="bg-gray-800 border-gray-700 w-full max-w-md max-h-[80vh] flex flex-col">
        <CardContent className="p-4 flex-1 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-white">Conversas</h2>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                onClick={onCreateConversation}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="h-4 w-4" />
              </Button>
              <Button 
                size="sm" 
                variant="ghost"
                onClick={onClose}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <ScrollArea className="flex-1">
            <div className="space-y-2">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors relative group ${
                    activeConversation === conversation.id
                      ? 'bg-purple-900'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                  onClick={() => {
                    onSelectConversation(conversation.id);
                    onClose();
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate text-white">{conversation.title}</p>
                      <p className="text-xs text-gray-400 truncate">
                        {new Date(conversation.updated_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-white hover:text-red-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteConversation(conversation.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
              
              {conversations.length === 0 && (
                <p className="text-gray-400 text-sm text-center py-4">
                  Nenhuma conversa ainda
                </p>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConversationsModal;