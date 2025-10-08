import { useState, useRef, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { showError, showSuccess } from '@/utils/toast';
import AgentSelector from '@/components/chat/AgentSelector';
import ChatMessages from '@/components/chat/ChatMessages';
import ChatInput from '@/components/chat/ChatInput';
import ConversationsModal from '@/components/chat/ConversationsModal';
import WelcomeMessage from '@/components/chat/WelcomeMessage';

const ChatPage = () => {
  const [message, setMessage] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('Matemática');
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showConversations, setShowConversations] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [generatedResponse, setGeneratedResponse] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const agents = [
    'Linguagens',
    'Matemática',
    'Ciências da Natureza',
    'Ciências Humanas'
  ];

  // Clear interval on unmount
  useEffect(() => {
    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
    };
  }, []);

  // Load API key on component mount
  useEffect(() => {
    const loadApiKey = () => {
      try {
        const envApiKey = import.meta.env.VITE_GROQ_API_KEY;
        if (envApiKey && envApiKey !== 'your_groq_api_key_here') {
          setApiKey(envApiKey);
        } else {
          setError('Chave da API do Groq não configurada. Por favor, configure a variável VITE_GROQ_API_KEY no arquivo .env');
        }
      } catch (error) {
        console.error('Error loading environment variables:', error);
        setError('Erro ao carregar configurações. Verifique o arquivo .env');
      }
    };

    loadApiKey();
  }, []);

  // Fetch user's conversations
  const { data: conversations = [], refetch: refetchConversations } = useQuery({
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

    const timestamp = new Date().toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    const newTitle = `Chat sobre ${selectedAgent} - ${timestamp}`;
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
    showSuccess('Nova conversa criada!');
    setShowConversations(false);
  };

  // Delete conversation
  const deleteConversation = async (conversationId: string) => {
    const { error } = await supabase
      .from('chat_conversations')
      .delete()
      .eq('id', conversationId);

    if (error) {
      showError('Erro ao deletar conversa');
      return;
    }

    if (activeConversation === conversationId) {
      setActiveConversation(null);
    }

    refetchConversations();
    showSuccess('Conversa deletada com sucesso!');
  };

  // Call Groq API to get AI response
  const getAIResponse = async (userMessage: string) => {
    if (!apiKey) {
      setError('Chave da API não configurada');
      return null;
    }

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'openai/gpt-oss-120b',
          messages: [
            {
              role: 'system',
              content: `Você é um assistente especializado em ${selectedAgent} para o ENEM. Responda de forma clara e didática. Use markdown para formatar suas respostas. Se precisar pensar, coloque seu raciocínio entre <thinking> e </thinking>, mas mantenha-o com no máximo 200 caracteres.`
            },
            {
              role: 'user',
              content: userMessage
            }
          ],
          temperature: 0.7,
          max_tokens: 1000,
          stream: false // Ensure we get the full response at once
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `API request failed with status ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error: any) {
      console.error('Error calling Groq API:', error);
      setError(error.message || 'Erro ao obter resposta da IA. Tente novamente.');
      return null;
    }
  };

  // Send message to AI
  const sendMessage = async () => {
    if (!message.trim() || !activeConversation || isLoading || !apiKey) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Clear any existing intervals
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }

    setIsLoading(true);
    setGeneratedResponse('');
    setIsGenerating(false);
    setError(null);

    // Add user message to conversation
    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    };

    // Update conversation with user message
    const updatedMessages = [...messages, userMessage];
    
    const { error: updateError } = await supabase
      .from('chat_conversations')
      .update({
        messages: updatedMessages,
        updated_at: new Date().toISOString()
      })
      .eq('id', activeConversation);

    if (updateError) {
      showError('Erro ao enviar mensagem');
      setIsLoading(false);
      return;
    }

    setMessage('');
    queryClient.invalidateQueries({ queryKey: ['conversation', activeConversation] });
    refetchConversations();

    // Get AI response
    const aiResponse = await getAIResponse(message);
    
    if (aiResponse) {
      // Start generating animation
      setIsGenerating(true);
      setGeneratedResponse('');
      
      // Simulate typing effect - faster speed
      let currentIndex = 0;
      const fullResponse = aiResponse.replace(/<thinking>[\s\S]*?<\/thinking>/g, '');
      
      // Clear any existing interval before starting a new one
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
      
      typingIntervalRef.current = setInterval(() => {
        if (currentIndex <= fullResponse.length) {
          setGeneratedResponse(fullResponse.substring(0, currentIndex));
          currentIndex += 3; // Increased speed - show 3 characters at a time
        } else {
          if (typingIntervalRef.current) {
            clearInterval(typingIntervalRef.current);
            typingIntervalRef.current = null;
          }
          setIsGenerating(false);
          
          // Save final response to database
          const aiMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: aiResponse,
            timestamp: new Date().toISOString()
          };

          const finalMessages = [...updatedMessages, aiMessage];
          
          // Update database with final response
          supabase
            .from('chat_conversations')
            .update({
              messages: finalMessages,
              updated_at: new Date().toISOString()
            })
            .eq('id', activeConversation)
            .then(({ error: finalError }) => {
              if (finalError) {
                showError('Erro ao salvar resposta da IA');
              }
              queryClient.invalidateQueries({ queryKey: ['conversation', activeConversation] });
              setIsLoading(false);
            });
        }
      }, 10); // Faster interval - 10ms instead of 20ms
    } else {
      setIsLoading(false);
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages, isLoading, generatedResponse, isGenerating]);

  // Reset loading states when conversation changes
  useEffect(() => {
    // Clear any existing intervals when conversation changes
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }
    
    // Reset states
    setIsLoading(false);
    setIsGenerating(false);
    setGeneratedResponse('');
    setError(null);
  }, [activeConversation]);

  return (
    <div className="flex flex-col h-full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">Chat com IA</h1>
        <p className="text-gray-400">Converse com agentes especializados nas competências do ENEM</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 flex-1">
        {/* Chat area */}
        <div className="flex-1 flex flex-col">
          <Card className="bg-gray-900 border-gray-700 flex-1 flex flex-col">
            <CardContent className="p-0 flex-1 flex flex-col">
              {/* Agent selector */}
              <AgentSelector 
                agents={agents}
                selectedAgent={selectedAgent}
                setSelectedAgent={setSelectedAgent}
                onShowConversations={() => setShowConversations(true)}
              />

              {/* Messages area */}
              <ScrollArea className="flex-1 p-4 bg-gray-900" ref={scrollAreaRef}>
                {messages.length > 0 ? (
                  <ChatMessages 
                    messages={messages}
                    selectedAgent={selectedAgent}
                    isGenerating={isGenerating}
                    generatedResponse={generatedResponse}
                  />
                ) : (
                  <WelcomeMessage onCreateConversation={createConversation} />
                )}
                
                {/* Error message */}
                {error && (
                  <div className="mt-4 p-3 bg-red-900/30 border border-red-700 rounded-lg flex items-start">
                    <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <p className="text-red-400 font-medium">Erro</p>
                      <p className="text-red-300 text-sm">{error}</p>
                    </div>
                  </div>
                )}
              </ScrollArea>

              {/* Input area */}
              <ChatInput
                message={message}
                setMessage={setMessage}
                onSend={sendMessage}
                isLoading={isLoading}
                hasApiKey={!!apiKey}
                hasActiveConversation={!!activeConversation}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Conversations popup modal */}
      {showConversations && (
        <ConversationsModal
          conversations={conversations}
          activeConversation={activeConversation}
          onCreateConversation={createConversation}
          onSelectConversation={setActiveConversation}
          onDeleteConversation={deleteConversation}
          onClose={() => setShowConversations(false)}
        />
      )}
    </div>
  );
};

export default ChatPage;