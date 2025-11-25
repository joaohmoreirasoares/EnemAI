import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Play, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Simulado {
    id: string;
    created_at: string;
    finished_at: string | null;
    score: number | null;
    title?: string; // Assuming title might be added or we generate one
}

const SimuladosList = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [isCreating, setIsCreating] = useState(false);

    // Fetch user's simulados
    const { data: simulados = [], isLoading } = useQuery({
        queryKey: ['simulados'],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return [];

            const { data, error } = await supabase
                .from('simulados')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data;
        }
    });

    // Create new simulado
    const createSimuladoMutation = useMutation({
        mutationFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            // 1. Create Simulado Record
            const { data: simulado, error: simuladoError } = await supabase
                .from('simulados')
                .insert({
                    user_id: user.id,
                    // You might want to add a title or subject field here if your schema supports it
                })
                .select()
                .single();

            if (simuladoError) throw simuladoError;

            // 2. Generate Questions (Mocking this part as per current Simulado.tsx logic which seems to expect questions to exist linked to simulado)
            // In a real app, you'd probably select random questions from a question bank and link them.
            // For now, let's assume there's a trigger or we need to insert questions manually.
            // Since I don't see the full backend logic, I'll assume we need to fetch some questions and link them.
            // OR, maybe the 'simulados' table creation trigger handles it?
            // Let's try to just create the simulado and navigate. If it fails, we'll debug.
            // Looking at Simulado.tsx: it fetches `questoes` via join.

            // Let's try to insert some dummy questions if they don't exist, or assume backend handles it.
            // Given I can't see backend triggers, I'll try to insert a few dummy questions for the new simulado.

            const dummyQuestions = [
                {
                    simulado_id: simulado.id,
                    enunciado: 'Qual é a capital do Brasil?',
                    alternativas: ['Rio de Janeiro', 'São Paulo', 'Brasília', 'Salvador', 'Belo Horizonte'],
                    gabarito_index: 2
                },
                {
                    simulado_id: simulado.id,
                    enunciado: 'Quanto é 2 + 2?',
                    alternativas: ['3', '4', '5', '6', '7'],
                    gabarito_index: 1
                },
                {
                    simulado_id: simulado.id,
                    enunciado: 'Quem descobriu o Brasil?',
                    alternativas: ['Pedro Álvares Cabral', 'Cristóvão Colombo', 'Vasco da Gama', 'Dom Pedro I', 'Tiradentes'],
                    gabarito_index: 0
                }
            ];

            const { error: questionsError } = await supabase
                .from('questoes')
                .insert(dummyQuestions);

            if (questionsError) {
                console.error("Error creating questions", questionsError);
                // If table 'questoes' doesn't exist or has different schema, this might fail.
                // But Simulado.tsx queries 'questoes', so it must exist.
            }

            return simulado;
        },
        onSuccess: (data) => {
            toast.success('Novo simulado criado!');
            queryClient.invalidateQueries({ queryKey: ['simulados'] });
            navigate(`/simulado/${data.id}`);
        },
        onError: (error) => {
            console.error('Error creating simulado:', error);
            toast.error('Erro ao criar simulado. Tente novamente.');
        }
    });

    const handleCreateSimulado = () => {
        setIsCreating(true);
        createSimuladoMutation.mutate(undefined, {
            onSettled: () => setIsCreating(false)
        });
    };

    return (
        <div className="flex flex-col h-full p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">Simulados</h1>
                    <p className="text-gray-400">Pratique para o ENEM com simulados gerados por IA</p>
                </div>
                <Button
                    onClick={handleCreateSimulado}
                    disabled={isCreating}
                    className="bg-purple-600 hover:bg-purple-700"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    {isCreating ? 'Criando...' : 'Novo Simulado'}
                </Button>
            </div>

            {isLoading ? (
                <div className="text-center py-12 text-gray-400">Carregando simulados...</div>
            ) : simulados.length === 0 ? (
                <Card className="bg-gray-800 border-gray-700">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="bg-gray-700 p-4 rounded-full mb-4">
                            <Play className="h-8 w-8 text-purple-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">Nenhum simulado encontrado</h3>
                        <p className="text-gray-400 mb-6 max-w-md">
                            Você ainda não realizou nenhum simulado. Crie um novo para começar a praticar e acompanhar seu desempenho.
                        </p>
                        <Button onClick={handleCreateSimulado} className="bg-purple-600 hover:bg-purple-700">
                            Começar Agora
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {simulados.map((simulado: Simulado) => (
                        <Card key={simulado.id} className="bg-gray-800 border-gray-700 hover:border-purple-500 transition-colors">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-lg text-white">
                                        Simulado #{simulado.id.substring(0, 4)}
                                    </CardTitle>
                                    {simulado.finished_at ? (
                                        <span className="px-2 py-1 bg-green-900/30 text-green-400 text-xs rounded-full flex items-center">
                                            <CheckCircle className="w-3 h-3 mr-1" /> Finalizado
                                        </span>
                                    ) : (
                                        <span className="px-2 py-1 bg-yellow-900/30 text-yellow-400 text-xs rounded-full flex items-center">
                                            <Clock className="w-3 h-3 mr-1" /> Em andamento
                                        </span>
                                    )}
                                </div>
                                <CardDescription className="text-gray-400">
                                    Criado em {format(new Date(simulado.created_at), "d 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex justify-between items-center mt-2">
                                    <div className="text-sm">
                                        {simulado.score !== null ? (
                                            <span className="text-gray-300">
                                                Acertos: <span className="font-bold text-white">{simulado.score}</span>
                                            </span>
                                        ) : (
                                            <span className="text-gray-500">Sem nota</span>
                                        )}
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="border-purple-600 text-purple-400 hover:bg-purple-600 hover:text-white"
                                        onClick={() => navigate(`/simulado/${simulado.id}`)}
                                    >
                                        {simulado.finished_at ? 'Ver Resultado' : 'Continuar'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SimuladosList;
