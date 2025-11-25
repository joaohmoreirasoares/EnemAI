import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  finished_at?: string;
  score?: number;
  questions: Question[];
}

const SimuladoResultPage = () => {
  const { simuladoId } = useParams<{ simuladoId: string }>();
  const navigate = useNavigate();

  const { data: simulado, isLoading, isError, error } = useQuery<SimuladoData>({
    queryKey: ['simuladoResult', simuladoId],
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
        .eq('user_id', user.id)
        .single();

      if (simuladoError) throw simuladoError;
      if (!simuladoResult) throw new Error('Simulado not found');

      return {
        id: simuladoResult.id,
        created_at: simuladoResult.created_at,
        finished_at: simuladoResult.finished_at,
        score: simuladoResult.score,
        questions: simuladoResult.questoes.sort((a: Question, b: Question) => a.created_at.localeCompare(b.created_at)), // Sort questions if needed
      };
    },
    enabled: !!simuladoId,
  });

  const calculateTimeMetrics = () => {
    if (!simulado?.created_at || !simulado?.finished_at || !simulado.questions.length) {
      return { totalTime: 'N/A', avgTimePerQuestion: 'N/A', performance: 'N/A' };
    }

    const start = new Date(simulado.created_at).getTime();
    const end = new Date(simulado.finished_at).getTime();
    const totalDurationMs = end - start;
    const totalDurationSeconds = Math.floor(totalDurationMs / 1000);
    const totalDurationMinutes = Math.floor(totalDurationSeconds / 60);
    const remainingSeconds = totalDurationSeconds % 60;

    const avgTimeMsPerQuestion = totalDurationMs / simulado.questions.length;
    const avgTimeSecondsPerQuestion = Math.floor(avgTimeMsPerQuestion / 1000);
    const avgTimeMinutes = Math.floor(avgTimeSecondsPerQuestion / 60);
    const avgTimeRemainingSeconds = avgTimeSecondsPerQuestion % 60;

    let performance = 'N/A';
    if (avgTimeMinutes < 3) {
      performance = 'Incrível';
    } else if (avgTimeMinutes < 4) {
      performance = 'Muito Bom';
    } else if (avgTimeMinutes < 5) {
      performance = 'Mediano';
    } else {
      performance = 'Alarmante';
    }

    return {
      totalTime: `${totalDurationMinutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`,
      avgTimePerQuestion: `${avgTimeMinutes.toString().padStart(2, '0')}:${avgTimeRemainingSeconds.toString().padStart(2, '0')}`,
      performance,
    };
  };

  const { totalTime, avgTimePerQuestion, performance } = calculateTimeMetrics();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-white">
        <Loader2 className="h-8 w-8 animate-spin mb-4" />
        <p>Carregando resultados do simulado...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-red-400">
        <p>Erro ao carregar resultados: {error?.message}</p>
        <Button onClick={() => navigate('/')} className="mt-4">Voltar para o Início</Button>
      </div>
    );
  }

  if (!simulado) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-white">
        <p>Resultados do simulado não encontrados.</p>
        <Button onClick={() => navigate('/')} className="mt-4">Voltar para o Início</Button>
      </div>
    );
  }

  const totalQuestions = simulado.questions.length;
  const correctAnswers = simulado.score !== undefined ? simulado.score : simulado.questions.filter(q => q.user_answer_index === q.gabarito_index).length;
  const wrongAnswers = totalQuestions - correctAnswers;

  return (
    <div className="flex flex-col items-center p-4 h-full overflow-auto">
      <Card className="w-full max-w-4xl bg-gray-800 border-gray-700 text-white mb-6">
        <CardHeader>
          <CardTitle className="text-3xl text-center">Resultados do Simulado</CardTitle>
          <CardDescription className="text-center text-gray-400">
            Análise detalhada do seu desempenho.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-400">Questões Corretas</p>
            <p className="text-4xl font-bold text-green-500">{correctAnswers}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Questões Incorretas</p>
            <p className="text-4xl font-bold text-red-500">{wrongAnswers}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Total de Questões</p>
            <p className="text-4xl font-bold text-blue-500">{totalQuestions}</p>
          </div>
          <div className="md:col-span-3 border-t border-gray-700 pt-4 mt-4">
            <p className="text-sm text-gray-400">Tempo Total</p>
            <p className="text-2xl font-bold">{totalTime}</p>
          </div>
          <div className="md:col-span-3">
            <p className="text-sm text-gray-400">Tempo Médio por Questão</p>
            <p className="text-2xl font-bold">{avgTimePerQuestion}</p>
          </div>
          <div className="md:col-span-3">
            <p className="text-sm text-gray-400">Performance</p>
            <p className={`text-2xl font-bold ${performance === 'Incrível' ? 'text-green-400' : performance === 'Muito Bom' ? 'text-lime-400' : performance === 'Mediano' ? 'text-yellow-400' : 'text-red-400'}`}>
              {performance}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="w-full max-w-4xl bg-gray-800 border-gray-700 text-white">
        <CardHeader>
          <CardTitle className="text-2xl">Revisão das Questões</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[60vh] pr-4">
            {simulado.questions.map((question, index) => (
              <div key={question.id} className="mb-6 p-4 border border-gray-700 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Questão {index + 1}</h3>
                {question.texto_base && (
                  <div className="mb-3 p-2 bg-gray-700 rounded-md text-sm">
                    <h4 className="font-semibold mb-1">Texto Base:</h4>
                    <p>{question.texto_base}</p>
                  </div>
                )}
                <p className="mb-3">{question.enunciado}</p>
                <ul className="space-y-2">
                  {question.alternativas.map((alt, altIndex) => (
                    <li
                      key={altIndex}
                      className={`flex items-center p-2 rounded-md ${
                        altIndex === question.gabarito_index
                          ? 'bg-green-900/50 border border-green-600' // Correct answer
                          : altIndex === question.user_answer_index && altIndex !== question.gabarito_index
                          ? 'bg-red-900/50 border border-red-600' // User's wrong answer
                          : 'bg-gray-700'
                      }`}
                    >
                      <span className="mr-2 font-bold">{String.fromCharCode(65 + altIndex)})</span>
                      <span className="flex-1">{alt}</span>
                      {altIndex === question.gabarito_index && <CheckCircle className="h-5 w-5 text-green-400 ml-2" />}
                      {altIndex === question.user_answer_index && altIndex !== question.gabarito_index && <XCircle className="h-5 w-5 text-red-400 ml-2" />}
                    </li>
                  ))}
                </ul>
                {question.user_answer_index === undefined && (
                  <p className="text-sm text-yellow-400 mt-3">Você não respondeu a esta questão.</p>
                )}
              </div>
            ))}
          </ScrollArea>
        </CardContent>
      </Card>

      <Button onClick={() => navigate('/')} className="mt-6 bg-blue-600 hover:bg-blue-700">
        Voltar para o Início
      </Button>
    </div>
  );
};

export default SimuladoResultPage;
