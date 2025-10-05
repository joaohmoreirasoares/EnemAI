import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';

const ChatPage = () => {
  const [message, setMessage] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('Matemática');
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const agents = [
    'Linguagens',
    'Matemática',
    'Ciências da Natureza',
    'Ciências Humanas'
  ];

  // Fetch user's conversations
  const { data: conversations, refetch: refetchConversations } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('chat_conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  // Fetch messages for active conversation
  const { data: messages = [] } = useQuery({
    queryKey: ['conversation', activeConversation],
    queryFn: async () => {
      if (!activeConversation) return [];

      const { data, error } = await supabase
        .from('chat_conversations')
        .select('messages')
        .eq('id', activeConversation)
        .single();

      if (error) throw error;
      return data.messages || [];
    },
    enabled: !!activeConversation
  });

  // Create new conversation
  const createConversation = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const newTitle = `Chat sobre ${selectedAgent}`;
    const { data, error } = await supabase
      .from('chat_conversations')
      .insert({
        user_id: user.id,
        agent: selectedAgent,
        title: newTitle,
        messages: []
      })
      .select()
      .single();

    if (error) throw error;
    
    setActiveConversation(data.id);
    refetchConversations();
  };

  // Send message to AI (mock implementation)
  const sendMessage = async () => {
    if (!message.trim() || !activeConversation) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Add user message to conversation
    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    };

    // Update conversation with user message
    const updatedMessages = [...messages, userMessage];
    
    await supabase
      .from('chat_conversations')
      .update({
        messages: updatedMessages,
        updated_at: new Date().toISOString()
      })
      .eq('id', activeConversation);

    setMessage('');
    queryClient.invalidateQueries({ queryKey: ['conversation', activeConversation] });
    refetchConversations();

    // Simulate AI response after a delay
    setTimeout(async () => {
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Esta é uma resposta simulada da área de ${selectedAgent}. Em uma implementação real, isso seria conectado a um modelo de linguagem.`,
        timestamp: new Date().toISOString()
      };

      const finalMessages = [...updatedMessages, aiMessage];
      
      await supabase
        .from('chat_conversations')
        .update({
          messages: finalMessages,
          updated_at: new Date().toISOString()
        })
        .eq('id', activeConversation);

      queryClient.invalidateQueries({ queryKey: ['conversation', activeConversation] });
    }, 1000);
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">Chat com IA</h1>
        <p className="text-gray-400">Converse com agentes especializados nas competências do ENEM</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 flex-1">
        {/* Chat area */}
        <div className="flex-1 flex flex-col">
          <Card className="bg-gray-800 border-gray-700 flex-1 flex flex-col">
            <CardContent className="p-0 flex-1 flex flex-col">
              {/* Agent selector */}
              <div className="p-4 border-b border-gray-700">
                <div className="flex flex-wrap gap-2">
                  {agents.map((agent) => (
                    <Button
                      key={agent}
                      variant={selectedAgent === agent ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedAgent(agent)}
                      className={
                        selectedAgent === agent
                          ? "bg-purple-600 hover:bg-purple-700 text-white"
                          : "border-gray-600 text-black hover:bg-gray-700 hover:text-white"
                      }
                    >
                      {agent}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Messages area */}
              <ScrollArea className="flex-1 p-4 bg-gray-800" ref={scrollAreaRef}>
                {messages.length > 0 ? (
                  <div className="space-y-4">
                    {messages.map((msg: any) => (
                      <div
                        key={msg.id}
                        className={`flex ${
                          msg.role === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-4 ${
                            msg.role === 'user'
                              ? 'bg-purple-600 text-white'
                              : 'bg-gray-700 text-white'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            {msg.role === 'assistant' ? (
                              <Bot className="h-5 w-5 mt-0.5 flex-shrink-0" />
                            ) : (
                              <User className="h-5 w-5 mt-0.5 flex-shrink-0" />
                            )}
                            <div>
                              <p className="font-medium text-xs mb-1">
                                {msg.role === 'user' ? 'Você' : selectedAgent}
                              </p>
                              <p className="whitespace-pre-wrap">{msg.content}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center p-8">
                    <Bot className="h-16 w-16 text-purple-500 mb-4" />
                    <h3 className="text-xl font-semibold mb-2 text-white">Bem-vindo ao Chat IA</h3>
                    <p className="text-gray-400 mb-4">
                      Selecione um agente e comece uma conversa sobre as competências do ENEM.
                    </p>
                    <Button onClick={createConversation} className="bg-purple-600 hover:bg-purple-700 text-white">
                      Iniciar Conversa
                    </Button>
                  </div>
                )}
              </ScrollArea>

              {/* Input area */}
              <div className="p-4 border-t border-gray-700">
                <div className="flex gap-2">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Digite sua mensagem..."
                    className="bg-gray-700 border-gray-600 text-white flex-1"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!message.trim() || !activeConversation}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;