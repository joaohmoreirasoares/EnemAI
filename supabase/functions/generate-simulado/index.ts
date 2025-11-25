import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.42.0'
import OpenAI from 'https://esm.sh/openai@4.33.0'

// Define the expected structure for a generated question
interface GeneratedQuestion {
  texto_base: string;
  enunciado: string;
  alternativas: string[];
  gabarito_index: number;
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { selectedNoteIds, numQuestions, userId } = await req.json();

    if (!selectedNoteIds || !Array.isArray(selectedNoteIds) || selectedNoteIds.length === 0) {
      return new Response(JSON.stringify({ error: 'selectedNoteIds are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    if (!numQuestions || typeof numQuestions !== 'number' || numQuestions <= 0) {
      return new Response(JSON.stringify({ error: 'numQuestions must be a positive number' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    if (!userId) {
      return new Response(JSON.stringify({ error: 'userId is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      return new Response(JSON.stringify({ error: 'Supabase environment variables not set' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        persistSession: false,
      },
    });

    // Fetch contents of selected notes
    const { data: notes, error: notesError } = await supabase
      .from('notes')
      .select('content')
      .in('id', selectedNoteIds);

    if (notesError) {
      console.error('Error fetching notes:', notesError);
      return new Response(JSON.stringify({ error: 'Failed to fetch notes content' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const contextText = notes.map((note) => note.content).join('\n\n');
    if (!contextText.trim()) {
      return new Response(JSON.stringify({ error: 'Selected notes have no content' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Initialize OpenAI client
    const openaiApiKey = Deno.env.get('GPT_OSS_API_KEY'); // Assuming this is the API key for "gpt oss 120b"
    if (!openaiApiKey) {
      return new Response(JSON.stringify({ error: 'GPT_OSS_API_KEY environment variable not set' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const openai = new OpenAI({
      apiKey: openaiApiKey,
      baseURL: Deno.env.get('GPT_OSS_BASE_URL') || 'https://api.openai.com/v1', // Allow custom base URL for other models
    });

    // Create a new simulado entry
    const { data: simuladoData, error: simuladoError } = await supabase
      .from('simulados')
      .insert({ user_id: userId })
      .select('id')
      .single();

    if (simuladoError) {
      console.error('Error creating simulado:', simuladoError);
      return new Response(JSON.stringify({ error: 'Failed to create simulado entry' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const simuladoId = simuladoData.id;
    const generatedQuestions: GeneratedQuestion[] = [];

    for (let i = 0; i < numQuestions; i++) {
      try {
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o', // Assuming 'gpt-4o' is a good default, or user can specify via env var
          messages: [
            {
              role: 'system',
              content: `Você é um especialista em criar questões de múltipla escolha no estilo ENEM.\n              Sua tarefa é gerar uma única questão de múltipla escolha, com um texto base (se aplicável), um enunciado claro e 5 alternativas (1 correta e 4 distratores plausíveis).\n              O gabarito deve ser o índice da alternativa correta (0 a 4).\n              A questão deve ser baseada no seguinte contexto e ter dificuldade e estilo ENEM.\n              Retorne a questão estritamente no formato JSON.`,
            },
            {
              role: 'user',
              content: `Contexto para a questão: ${contextText}\n\nGerar questão em formato JSON:\n              {\n                "texto_base": "...",\n                "enunciado": "...",\n                "alternativas": [\n                  "Alternativa A",\n                  "Alternativa B",\n                  "Alternativa C",\n                  "Alternativa D",\n                  "Alternativa E"\n                ],\n                "gabarito_index": 0\n              }`,
            },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.7,
        });

        const rawResponse = completion.choices[0].message?.content;
        if (!rawResponse) {
          throw new Error('AI did not return any content.');
        }

        const question: GeneratedQuestion = JSON.parse(rawResponse);

        // Validate the structure of the generated question
        if (
          !question.enunciado ||
          !Array.isArray(question.alternativas) ||
          question.alternativas.length !== 5 ||
          typeof question.gabarito_index !== 'number' ||
          question.gabarito_index < 0 ||
          question.gabarito_index > 4
        ) {
          throw new Error('AI returned an invalid question format.');
        }

        generatedQuestions.push(question);

        // Insert the generated question into the 'questoes' table
        const { error: questionInsertError } = await supabase
          .from('questoes')
          .insert({
            simulado_id: simuladoId,
            texto_base: question.texto_base,
            enunciado: question.enunciado,
            alternativas: question.alternativas,
            gabarito_index: question.gabarito_index,
          });

        if (questionInsertError) {
          console.error(`Error inserting question ${i + 1}:`, questionInsertError);
          // Decide whether to fail the whole simulado or just skip this question
          // For now, we'll let it continue but log the error.
        }
      } catch (aiError) {
        console.error(`Error generating or inserting question ${i + 1}:`, aiError);
        // Continue to try generating other questions even if one fails
      }
    }

    return new Response(
      JSON.stringify({ simuladoId: simuladoId, message: `Simulado with ${generatedQuestions.length} questions generated successfully.` }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    console.error('Unhandled error in generate-simulado:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
