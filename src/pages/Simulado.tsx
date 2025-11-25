import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface Question {
  id: string;
  texto_base?: string;
  enunciado: string;
  alternativas: string[];
  gabarito_index: number;
  user_answer_index?: number;
}

interface SimuladoData {
  id: string;
  created_at: string;
  questions: Question[];
}

const SimuladoPage = () => {
  const { simuladoId } = useParams<{ simuladoId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{ [key: string]: number }>({});
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Fetch simulado data and questions
  const { data: simulado, isLoading, isError, error } = useQuery<SimuladoData>({
    queryKey: ['simulado', simuladoId],
    queryFn: async () => {
      if (!simuladoId) throw new Error('Simulado ID is missing');

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: simuladoResult, error: simuladoError } = await supabase
        .from('simulados')
        .select(`
          *,
          questoes (*)
        `)
        .eq('id', simuladoId)
        .eq('user_id', user.id) // Ensure user owns the simulado
        .single();

      if (simuladoError) throw simuladoError;
      if (!simuladoResult) throw new Error('Simulado not found');

      return {
        id: simuladoResult.id,
        created_at: simuladoResult.created_at,
        questions: simuladoResult.questoes,
      };
    },
    enabled: !!simuladoId,
    onSuccess: () => {
      setStartTime(Date.now());
    }
  });

  // Timer effect
  useEffect(() => {
    if (startTime && currentQuestionIndex < (simulado?.questions.length || 0)) {
      const timer = setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [startTime, currentQuestionIndex, simulado?.questions.length]);

  const handleAnswerChange = (questionId: string, value: string) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: parseInt(value, 10),
    }));
  };

  const updateQuestionAnswerMutation = useMutation({
    mutationFn: async ({ questionId, answerIndex }: { questionId: string; answerIndex: number }) => {
      const { error } = await supabase
        .from('questoes')
        .update({ user_answer_index: answerIndex })
        .eq('id', questionId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['simulado', simuladoId] });
    },
    onError: (err) => {
      console.error('Failed to save answer:', err);
      toast.error('Erro ao salvar sua resposta.');
    }
  });

  const handleNextQuestion = async () => {
    const currentQuestion = simulado?.questions[currentQuestionIndex];
    if (currentQuestion) {
      const userAnswer = userAnswers[currentQuestion.id];
      if (userAnswer === undefined) {
        toast.warning('Por favor, selecione uma alternativa antes de prosseguir.');
        return;
      }
      await updateQuestionAnswerMutation.mutateAsync({ questionId: currentQuestion.id, answerIndex: userAnswer });
    }

    if (currentQuestionIndex < (simulado?.questions.length || 0) - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      // End of simulado
      handleFinishSimulado();
    }
  };

  const handleFinishSimulado = async () => {
    if (!simuladoId) return;

    const finalElapsedTime = Date.now() - (startTime || Date.now());
    const correctAnswers = simulado?.questions.filter(q => userAnswers[q.id] === q.gabarito_index).length || 0;

    // Update simulado record with score and finished_at time
    const { error: updateSimuladoError } = await supabase
      .from('simulados')
      .update({
        score: correctAnswers,
        finished_at: new Date().toISOString(),
        // Optionally store elapsed time if you add a column for it
      })
      .eq('id', simuladoId);

    if (updateSimuladoError) {
      console.error('Error updating simulado on finish:', updateSimuladoError);
      toast.error('Erro ao finalizar o simulado.');
    } else {
      toast.success('Simulado finalizado! Calculando resultados...');
      navigate(`/simulado/${simuladoId}/resultado`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-white">
        <Loader2 className="h-8 w-8 animate-spin mb-4" />
        <p>Carregando simulado...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-red-400">
        <p>Erro ao carregar simulado: {error?.message}</p>
        <Button onClick={() => navigate(-1)} className="mt-4">Voltar</Button>
      </div>
    );
  }

  if (!simulado || simulado.questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-white">
        <p>Simulado não encontrado ou sem questões.</p>
        <Button onClick={() => navigate('/')} className="mt-4">Ir para Início</Button>
      </div>
    );
  }

  const currentQuestion = simulado.questions[currentQuestionIndex];
  const totalQuestions = simulado.questions.length;
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center p-4 h-full overflow-auto">
      <Card className="w-full max-w-3xl bg-gray-800 border-gray-700 text-white mb-4">
        <CardHeader>
          <CardTitle className="text-2xl">Simulado ENEM</CardTitle>
          <CardDescription className="text-gray-400">
            Questão {currentQuestionIndex + 1} de {totalQuestions}
          </CardDescription>
          <Progress value={progress} className="w-full mt-2" />
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-400 mb-2">Tempo Decorrido: {formatTime(elapsedTime)}</div>
          {currentQuestion.texto_base && (
            <div className="mb-4 p-3 bg-gray-700 rounded-md text-sm">
              <h4 className="font-semibold mb-1">Texto Base:</h4>
              <p>{currentQuestion.texto_base}</p>
            </div>
          )}
          <h3 className="text-lg font-semibold mb-4">{currentQuestion.enunciado}</h3>
          <RadioGroup
            onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
            value={userAnswers[currentQuestion.id]?.toString()}
            className="space-y-2"
          >
            {currentQuestion.alternativas.map((alt, index) => (
              <div key={index} className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-700 transition-colors">
                <RadioGroupItem value={index.toString()} id={`alt-${index}`} />
                <Label htmlFor={`alt-${index}`} className="text-base cursor-pointer flex-1">
                  {String.fromCharCode(65 + index)}) {alt}
                </Label>
              </div>
            ))}
          </RadioGroup>
          <Button
            onClick={handleNextQuestion}
            className="mt-6 w-full bg-purple-600 hover:bg-purple-700"
            disabled={updateQuestionAnswerMutation.isPending}
          >
            {currentQuestionIndex < totalQuestions - 1 ? 'Próxima Questão' : 'Finalizar Simulado'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimuladoPage;
