import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Plus, MessageSquare, ChevronLeft, Trash2, X, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { showError, showSuccess } from '@/utils/toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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

  const agents = [
    'Linguagens',
    'Matemática',
    'Ciências da Natureza',
    'Ciências Humanas'
  ];

  // Load API key on component mount
  useEffect(() => {
    const loadApiKey = () => {
      try {
        const envApiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
        if (envApiKey && envApiKey !== 'your_openrouter_api_key_here') {
          setApiKey(envApiKey);
        } else {
          setError('Chave da API do OpenRouter não configurada. Por favor, configure a variável VITE_OPENROUTER_API_KEY no arquivo .env');
        }
      } catch (error) {
        console.error('Error loading environment variables:', error);
        setError('Erro ao carregar configurações. Verifique o arquivo .env');
      }
    };

    loadApiKey();
  }, []);

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

  // Call OpenRouter API to get AI response
  const getAIResponse = async (userMessage: string) => {
    if (!apiKey) {
      setError('Chave da API não configurada');
      return null;
    }

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.href,
          'X-Title': 'Enem AI'
        },
        body: JSON.stringify({
          model: 'qwen/qwen3-235b-a22b:free',
          messages: [
            {
              role: 'system',
              content: `Você é um assistente especializado em ${selectedAgent} para o ENEM. Responda de forma clara e didática. Use markdown para formatar suas respostas. Se precisar pensar, coloque seu raciocínio entre <thinking> e </thinking>, mas mantenha-o com no máximo 200 caracteres (nunca passe desse limite, se passar você será penalizado).`
            },
            {
              role: 'user',
              content: userMessage
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `API request failed with status ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error: any) {
      console.error('Error calling OpenRouter API:', error);
      setError(error.message || 'Erro ao obter resposta da IA. Tente novamente.');
      return null;
    }
  };

  // Send message to AI
  const sendMessage = async () => {
    if (!message.trim() || !activeConversation || isLoading || !apiKey) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

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
      const typingInterval = setInterval(() => {
        if (currentIndex <= aiResponse.length) {
          setGeneratedResponse(aiResponse.substring(0, currentIndex));
          currentIndex += 3; // Increased speed - show 3 characters at a time
        } else {
          clearInterval(typingInterval);
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
            });
        }
      }, 10); // Faster interval - 10ms instead of 20ms
    }

    setIsLoading(false);
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages, isLoading, generatedResponse, isGenerating]);

  // Process message content to remove thinking tags and render markdown
  const processMessageContent = (content: string) => {
    // Remove thinking tags
    const processedContent = content.replace(/<thinking>[\s\S]*?<\/thinking>/g, '');
    
    // Render markdown
    return (
      <div className="prose prose-invert max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {processedContent}
        </ReactMarkdown>
      </div>
    );
  };

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
              {/* Agent selector or Conversations button */}
              <div className="p-4 border-b border-gray-700">
                <div className="flex flex-wrap gap-2 justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowConversations(true)}
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

              {/* Messages area */}
              <ScrollArea className="flex-1 p-4 bg-gray-900" ref={scrollAreaRef}>
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
                              {msg.role === 'assistant' ? (
                                processMessageContent(msg.content)
                              ) : (
                                <p className="whitespace-pre-wrap">{msg.content}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {isGenerating && (
                      <div className="flex justify-start">
                        <div className="max-w-[80%] rounded-lg p-4 bg-gray-700 text-white">
                          <div className="flex items-start gap-2">
                            <Bot className="h-5 w-5 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <p className="font-medium text-xs mb-1">{selectedAgent}</p>
                              <div className="prose prose-invert max-w-none">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                  {generatedResponse}
                                </ReactMarkdown>
                              </div>
                              <div className="flex items-center gap-1 mt-2">
                                <span className="inline-block w-2 h-2 rounded-full bg-gray-400 animate-bounce"></span>
                                <span className="inline-block w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                                <span className="inline-block w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
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
                    disabled={isLoading || !activeConversation || !apiKey}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!message.trim() || !activeConversation || isLoading || !apiKey}
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
                {!apiKey && (
                  <p className="text-red-400 text-sm mt-2">
                    ⚠️ Chave da API não configurada. Configure VITE_OPENROUTER_API_KEY no arquivo .env
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Conversations popup modal */}
      {showConversations && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="bg-gray-800 border-gray-700 w-full max-w-md max-h-[80vh] flex flex-col">
            <CardContent className="p-4 flex-1 flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-white">Conversas</h2>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={createConversation}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => setShowConversations(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <ScrollArea className="flex-1">
                <div className="space-y-2">
                  {conversations && conversations.map((conversation: any) => (
                    <div
                      key={conversation.id}
                      className={`p-3 rounded-lg cursor-pointer transition-colors relative group ${
                        activeConversation === conversation.id
                          ? 'bg-purple-900'
                          : 'bg-gray-700 hover:bg-gray-600'
                      }`}
                      onClick={() => {
                        setActiveConversation(conversation.id);
                        setShowConversations(false);
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
                            deleteConversation(conversation.id);
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {conversations && conversations.length === 0 && (
                    <p className="text-gray-400 text-sm text-center py-4">
                      Nenhuma conversa ainda
                    </p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ChatPage;