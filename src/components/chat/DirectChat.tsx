import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { getConversationById, sendMessage } from '@/lib/social';

interface Message {
  id: string;
  body: string;
  created_at: string;
  sender_id: string;
  sender: {
    first_name: string;
    last_name: string;
    avatar_url?: string;
  };
}

const DirectChat = ({ conversationId }: { conversationId: string }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: conversation } = useQuery({
    queryKey: ['conversation', conversationId],
    queryFn: () => getConversationById(conversationId),
    enabled: !!conversationId,
  });

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    getCurrentUser();
  }, []);

  useEffect(() => {
    if (conversation?.messages) {
      setMessages(conversation.messages);
      setLoading(false);
    }
  }, [conversation]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentUser) return;

    try {
      await sendMessage({
        conversation_id: conversationId,
        sender_id: currentUser.id,
        body: newMessage
      });

      setNewMessage('');
      queryClient.invalidateQueries({ queryKey: ['conversation', conversationId] });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const otherParticipant = conversation?.participants?.find(
    (p: any) => p.user_id !== currentUser?.id
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Header */}
      <div className="p-3 border-b border-gray-700 flex items-center gap-3">
        <Avatar className="w-10 h-10">
          <AvatarImage src={otherParticipant?.profiles?.avatar_url} />
          <AvatarFallback>
            {otherParticipant?.profiles?.first_name?.[0]}{otherParticipant?.profiles?.last_name?.[0]}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-semibold text-white">
            {otherParticipant?.profiles?.first_name} {otherParticipant?.profiles?.last_name}
          </h3>
          <p className="text-xs text-gray-400">Online</p>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-2 ${
                message.sender_id === currentUser?.id ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.sender_id !== currentUser?.id && (
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarImage src={message.sender.avatar_url} />
                  <AvatarFallback>
                    {message.sender.first_name?.[0]}{message.sender.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
              )}
              
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  message.sender_id === currentUser?.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-white'
                }`}
              >
                <p className="text-sm">{message.body}</p>
                <p className="text-xs opacity-70 mt-1">
                  {new Date(message.created_at).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              
              {message.sender_id === currentUser?.id && (
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarImage src={currentUser.user_metadata?.avatar_url} />
                  <AvatarFallback>
                    {currentUser.user_metadata?.first_name?.[0]}{currentUser.user_metadata?.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          
          {messages.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              Nenhuma mensagem ainda. Envie uma mensagem para começar a conversa!
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-3 border-t border-gray-700">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Digite uma mensagem..."
            className="bg-gray-700 border-gray-600 text-white"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DirectChat;