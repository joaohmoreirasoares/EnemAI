import { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { showError, showSuccess } from '@/utils/toast';

import AgentSelector from '@/components/chat/AgentSelector';
import ChatMessages from '@/components/chat/ChatMessages';
import ChatInput from '@/components/chat/ChatInput';
import WelcomeMessage from '@/components/chat/WelcomeMessage';
import ChatHome from '@/components/chat/ChatHome';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TOOLS, searchNotes, readNote, updateNote } from '@/lib/agent-tools';
import { calculateStats } from '@/lib/streak';

const ChatPage = () => {
  const [message, setMessage] = useState('');
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [view, setView] = useState<'home' | 'chat'>('home');
  const [showConversations, setShowConversations] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [generatedResponse, setGeneratedResponse] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [selectedNoteIds, setSelectedNoteIds] = useState<string[]>([]);

  // Fetch user's notes for context (kept for potential future use or tool context, though UI is removed)
  // We can keep the query but remove the UI selection logic if we want the AI to still have access via tools
  // For now, let's keep the query as it might be useful for the 'search_notes' tool to have a cache or similar, 
  // but we won't pass 'selectedNoteIds' to context anymore since the user can't select them.
  // Actually, the prompt says "Contexto inicial das anotações selecionadas: ${context}". 
  // Since we are removing manual selection, we should probably remove this context injection or automate it.
  // The user asked to "retirar o sistema para colocar anotações no contexto da IA onde o usuário escolhe uma anotação manualmente".
  // So we will remove the manual selection state.

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



  const stats = calculateStats(conversations);

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

    const newTitle = `Chat com Tutor ENEM AI - ${timestamp}`;
    const { data, error } = await supabase
      .from('chat_conversations')
      .insert({
        user_id: user.id,
        agent: 'Tutor ENEM AI',
        title: newTitle,
        messages: []
      })
      .select()
      .single();

    if (error) throw error;

    setActiveConversation(data.id);
    setView('chat');
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
  const getAIResponse = async (messages: any[], context: string) => {
    if (!apiKey) {
      setError('Chave da API não configurada');
      return null;
    }

    const systemPrompt = `Você é o Tutor ENEM AI, um assistente especializado em todas as áreas do ENEM.
    
    FERRAMENTAS DISPONÍVEIS:
    Você tem acesso às seguintes ferramentas para ajudar o usuário. Para usar uma ferramenta, você DEVE responder APENAS com um JSON no seguinte formato:
    { "tool": "nome_da_ferramenta", "parameters": { ... } }

    Lista de Ferramentas:
    ${JSON.stringify(TOOLS, null, 2)}

    INSTRUÇÕES:
    1. Se o usuário pedir para buscar, ler ou modificar anotações, USE AS FERRAMENTAS.
    2. Não invente informações sobre as anotações. Use as ferramentas para buscar a verdade.
    3. Se você usar uma ferramenta, o sistema executará e devolverá o resultado para você.
    4. Se não precisar de ferramentas, responda normalmente como um tutor.
    5. Use as anotações do usuário (fornecidas via contexto ou ferramentas) para personalizar suas respostas.
    
    Contexto inicial das anotações selecionadas: ${context}`;

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
            { role: 'system', content: systemPrompt },
            ...messages.map(m => ({ role: m.role === 'system' ? 'user' : m.role, content: m.content })) // Map system messages to user for API compatibility if needed, or keep as system? standard OpenAI allows multiple system messages. Let's keep 'system'.
            // Actually, some models behave better if tool outputs are 'user' or 'function'.
            // Let's try mapping 'system' (tool output) to 'user' with a prefix "Tool Output:" to be safe with generic OSS models.
          ],
          temperature: 0.7,
          max_tokens: 1000,
          stream: false
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
  const sendMessage = async (userMessage: string) => {
    if (!userMessage.trim() || !activeConversation || isLoading || !apiKey) return;

    // Build context from selected notes
    // Manual context selection removed as per user request.
    // The AI can still use tools to search for notes if needed.
    const context = '';

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
    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString()
    };

    // Initial messages state
    let currentMessages = [...messages, userMsg];

    // Update conversation with user message first
    const { error: updateError } = await supabase
      .from('chat_conversations')
      .update({
        messages: currentMessages,
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

    // Tool execution loop
    let loopCount = 0;
    const MAX_LOOPS = 5;
    let finalResponse = '';

    try {
      while (loopCount < MAX_LOOPS) {
        loopCount++;

        // Get AI response
        const aiResponse = await getAIResponse(currentMessages, context);

        if (!aiResponse) break;

        // Check if response is a tool call
        let toolCall = null;
        try {
          // Try to parse JSON if it looks like a tool call
          const trimmed = aiResponse.trim();
          if (trimmed.startsWith('{') && trimmed.includes('"tool"')) {
            toolCall = JSON.parse(trimmed);
          }
        } catch (e) {
          // Not a valid JSON tool call, treat as text
        }

        if (toolCall && toolCall.tool) {
          // It's a tool call
          console.log('Tool call detected:', toolCall);

          // Add AI's tool call message to history (optional, but good for debugging/context)
          // We'll display it as a system message or code block to the user? 
          // Let's add it as an assistant message but maybe formatted.
          // Actually, let's NOT show the raw JSON to the user if possible, or show it as a "Thinking" step.
          // For now, we append it to history so the AI knows it asked for it.
          const toolMsg = {
            id: Date.now().toString(),
            role: 'assistant',
            content: aiResponse, // Raw JSON
            timestamp: new Date().toISOString()
          };
          currentMessages = [...currentMessages, toolMsg];

          // Save to DB so user sees "Thinking..." (raw json)
          await supabase
            .from('chat_conversations')
            .update({ messages: currentMessages, updated_at: new Date().toISOString() })
            .eq('id', activeConversation);

          queryClient.invalidateQueries({ queryKey: ['conversation', activeConversation] });

          // Execute tool
          let toolResult = '';
          try {
            if (toolCall.tool === 'search_notes') {
              const result = await searchNotes(toolCall.parameters.query);
              toolResult = `Resultado da busca: ${JSON.stringify(result)}`;
            } else if (toolCall.tool === 'read_note') {
              const result = await readNote(toolCall.parameters.title);
              toolResult = `Conteúdo da nota: ${JSON.stringify(result)}`;
            } else if (toolCall.tool === 'update_note') {
              const result = await updateNote(toolCall.parameters.title, toolCall.parameters.content);
              toolResult = `Nota atualizada com sucesso: ${JSON.stringify(result)}`;
            } else {
              toolResult = `Erro: Ferramenta ${toolCall.tool} não encontrada.`;
            }
          } catch (err: any) {
            toolResult = `Erro ao executar ferramenta: ${err.message}`;
          }

          // Add tool result to history
          const systemMsg = {
            id: (Date.now() + 1).toString(),
            role: 'system',
            content: toolResult,
            timestamp: new Date().toISOString()
          };
          currentMessages = [...currentMessages, systemMsg];

          // Save to DB
          await supabase
            .from('chat_conversations')
            .update({ messages: currentMessages, updated_at: new Date().toISOString() })
            .eq('id', activeConversation);

          queryClient.invalidateQueries({ queryKey: ['conversation', activeConversation] });

          // Loop continues to get AI's interpretation of the result
        } else {
          // Regular response, we are done
          finalResponse = aiResponse;
          break;
        }
      }

      if (finalResponse) {
        // Start generating animation for the final response
        setIsGenerating(true);
        setGeneratedResponse('');

        // Simulate typing effect
        let currentIndex = 0;
        const fullResponse = finalResponse.replace(/<thinking>[\s\S]*?<\/thinking>/g, '');

        if (typingIntervalRef.current) {
          clearInterval(typingIntervalRef.current);
        }

        typingIntervalRef.current = setInterval(() => {
          if (currentIndex <= fullResponse.length) {
            setGeneratedResponse(fullResponse.substring(0, currentIndex));
            currentIndex += 3;
          } else {
            if (typingIntervalRef.current) {
              clearInterval(typingIntervalRef.current);
              typingIntervalRef.current = null;
            }
            setIsGenerating(false);

            // Save final response
            const aiMsg = {
              id: (Date.now() + 2).toString(),
              role: 'assistant',
              content: finalResponse,
              timestamp: new Date().toISOString()
            };

            const finalMessages = [...currentMessages, aiMsg];

            supabase
              .from('chat_conversations')
              .update({
                messages: finalMessages,
                updated_at: new Date().toISOString()
              })
              .eq('id', activeConversation)
              .then(({ error: finalError }) => {
                if (finalError) showError('Erro ao salvar resposta da IA');
                queryClient.invalidateQueries({ queryKey: ['conversation', activeConversation] });
                setIsLoading(false);
              });
          }
        }, 10);
      } else {
        setIsLoading(false);
      }

    } catch (err: any) {
      console.error('Error in chat loop:', err);
      setError('Erro no processamento da conversa.');
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
    <div className="h-full overflow-hidden">
      <AnimatePresence mode="wait">
        {view === 'home' ? (
          <motion.div
            key="home"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            <ChatHome
              conversations={conversations}
              onSelectConversation={(id) => {
                setActiveConversation(id);
                setView('chat');
              }}
              onDeleteConversation={deleteConversation}
              stats={stats}
              onCreateNew={createConversation}
            />
          </motion.div>
        ) : (
          <motion.div
            key="chat"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
            className="h-full flex flex-col"
          >
            <div className="flex-1 flex flex-col h-full relative">
              <div className="flex flex-col h-full">
                <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setView('home')}
                      className="text-gray-400 hover:text-white hover:bg-gray-800"
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                      <h1 className="text-xl font-bold text-white">Chat com IA</h1>
                      <p className="text-xs text-gray-400 hidden md:block">Converse com o Tutor ENEM AI</p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 flex flex-col overflow-hidden relative">
                  {/* Background - Deep dark, subtle gradient */}
                  <div className="absolute inset-0 bg-[#0f1117] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-[#0f1117] to-[#0f1117]"></div>

                  <div className="relative flex-1 flex flex-col overflow-hidden">
                    {/* Messages area */}
                    <ScrollArea className="flex-1" ref={scrollAreaRef}>
                      <div className="py-8">
                        {messages.length > 0 ? (
                          <ChatMessages
                            messages={messages}
                            selectedAgent="Tutor ENEM AI"
                            isGenerating={isGenerating}
                            generatedResponse={generatedResponse}
                          />
                        ) : (
                          <WelcomeMessage onCreateConversation={createConversation} />
                        )}

                        {/* Error message */}
                        {error && (
                          <div className="max-w-3xl mx-auto px-4 mt-4">
                            <div className="p-3 bg-red-900/20 border border-red-800/50 rounded-lg flex items-start backdrop-blur-sm">
                              <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-2 flex-shrink-0" />
                              <div>
                                <p className="text-red-400 font-medium text-sm">Erro</p>
                                <p className="text-red-300 text-xs">{error}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Spacer for floating input */}
                        <div className="h-32"></div>
                      </div>
                    </ScrollArea>

                    {/* Input area - Fixed at bottom */}
                    <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-[#0f1117] via-[#0f1117]/80 to-transparent pt-10 pb-6">
                      <ChatInput
                        message={message}
                        setMessage={setMessage}
                        onSend={sendMessage}
                        isLoading={isLoading}
                        hasApiKey={!!apiKey}
                        hasActiveConversation={!!activeConversation}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatPage;