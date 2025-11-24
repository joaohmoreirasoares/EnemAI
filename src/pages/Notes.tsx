import { useState, useEffect } from 'react';
import { Plus, Search, Save, Download, Trash2, Edit3, List } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import '../components/quill-dark.css'; // Corrigindo o caminho para o tema escuro customizado

// Função para obter os títulos de todas as anotações
export const getNoteTitles = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 'Usuário não autenticado.';

  const { data, error } = await supabase
    .from('notes')
    .select('title')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching note titles:', error);
    return 'Erro ao buscar títulos das anotações.';
  }

  if (!data || data.length === 0) {
    return 'Nenhuma anotação encontrada.';
  }

  return data.map(note => note.title).join(', ');
};

// Função para obter o conteúdo de uma anotação pelo título
export const getNoteContent = async (title: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 'Usuário não autenticado.';

  if (!title) return 'Título da anotação não fornecido.';

  const { data, error } = await supabase
    .from('notes')
    .select('content')
    .eq('user_id', user.id)
    .ilike('title', `%${title}%`) // Use ilike for case-insensitive partial match
    .limit(1)
    .single();

  if (error) {
    console.error('Error fetching note content:', error);
    if (error.code === 'PGRST116') { // Not found
      return `Anotação com o título parecido com "${title}" não encontrada.`;
    }
    return 'Erro ao buscar conteúdo da anotação.';
  }

  return data.content || 'Esta anotação está vazia.';
};

// Função para editar o conteúdo de uma anotação pelo título
export const editNote = async (title: string, newContent: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 'Usuário não autenticado.';

  if (!title) return 'Título da anotação não fornecido.';
  if (!newContent) return 'Novo conteúdo da anotação não fornecido.';

  // Primeiro, encontramos a nota para garantir que ela existe
  const { data: note, error: findError } = await supabase
    .from('notes')
    .select('id')
    .eq('user_id', user.id)
    .ilike('title', `%${title}%`)
    .limit(1)
    .single();

  if (findError || !note) {
    console.error('Error finding note to edit:', findError);
    return `Anotação com o título parecido com "${title}" não encontrada.`;
  }

  // Agora, atualizamos a nota com o novo conteúdo
  const { error: updateError } = await supabase
    .from('notes')
    .update({ content: newContent, updated_at: new Date().toISOString() })
    .eq('id', note.id);

  if (updateError) {
    console.error('Error updating note content:', updateError);
    return 'Erro ao atualizar o conteúdo da anotação.';
  }

  return `Anotação "${title}" atualizada com sucesso.`;
};

// Função para obter o número total de anotações do usuário
export const getTotalNotesCount = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;

  const { count, error } = await supabase
    .from('notes')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id);

  if (error) {
    console.error('Error fetching total notes count:', error);
    return 0;
  }
  return count || 0;
};

// Função para obter o número de anotações criadas hoje pelo usuário
export const getTodayNotesCount = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to the beginning of today

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1); // Set to the beginning of tomorrow

  const { count, error } = await supabase
    .from('notes')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .gte('created_at', today.toISOString())
    .lt('created_at', tomorrow.toISOString());

  if (error) {
    console.error('Error fetching today\'s notes count:', error);
    return 0;
  }
  return count || 0;
};


const NotesPage = () => {
  const [activeNote, setActiveNote] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [showAllNotes, setShowAllNotes] = useState(false); // This state will now control the modal, not the main view
  const queryClient = useQueryClient();

  // Fetch user's notes
  const { data: notes = [], isLoading: isLoadingNotes } = useQuery({
    queryKey: ['notes'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  // Fetch total notes count
  const { data: totalNotesCount = 0, isLoading: isLoadingTotalNotes } = useQuery({
    queryKey: ['totalNotesCount'],
    queryFn: getTotalNotesCount
  });

  // Fetch today's notes count
  const { data: todayNotesCount = 0, isLoading: isLoadingTodayNotes } = useQuery({
    queryKey: ['todayNotesCount'],
    queryFn: getTodayNotesCount
  });

  // Filter notes based on search term
  const filteredNotes = notes.filter((note: any) =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (note.content && note.content.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Load note content when active note changes
  useEffect(() => {
    if (activeNote) {
      setTitle(activeNote.title);
      setContent(activeNote.content || '');
    } else {
      setTitle('');
      setContent('');
    }
  }, [activeNote]);

  // Create new note
  const createNote = async () => {
    const { data: { user } = {} } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('notes')
      .insert({
        user_id: user.id,
        title: 'Nova Anotação',
        content: ''
      })
      .select()
      .single();

    if (error) throw error;
    
    setActiveNote(data);
    queryClient.invalidateQueries({ queryKey: ['notes'] });
    queryClient.invalidateQueries({ queryKey: ['totalNotesCount'] });
    queryClient.invalidateQueries({ queryKey: ['todayNotesCount'] });
  };

  // Save note
  const saveNote = async () => {
    if (!activeNote) return;

    const { error } = await supabase
      .from('notes')
      .update({
        title,
        content,
        updated_at: new Date().toISOString()
      })
      .eq('id', activeNote.id);

    if (error) throw error;
    
    queryClient.invalidateQueries({ queryKey: ['notes'] });
    queryClient.invalidateQueries({ queryKey: ['totalNotesCount'] });
    queryClient.invalidateQueries({ queryKey: ['todayNotesCount'] });
  };

  // Delete note
  const deleteNote = async () => {
    if (!activeNote) return;

    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', activeNote.id);

    if (error) throw error;
    
    setActiveNote(null);
    queryClient.invalidateQueries({ queryKey: ['notes'] });
    queryClient.invalidateQueries({ queryKey: ['totalNotesCount'] });
    queryClient.invalidateQueries({ queryKey: ['todayNotesCount'] });
  };

  // Delete note from list
  const deleteNoteFromList = async (noteId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Impede que o clique no botão de exclusão acione o clique no clique no item da lista
    
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', noteId);

    if (error) throw error;
    
    // Se a nota excluída era a ativa, limpa o editor
    if (activeNote?.id === noteId) {
      setActiveNote(null);
    }
    
    queryClient.invalidateQueries({ queryKey: ['notes'] });
    queryClient.invalidateQueries({ queryKey: ['totalNotesCount'] });
    queryClient.invalidateQueries({ queryKey: ['todayNotesCount'] });
  };

  // Export note as HTML
  const exportNote = () => {
    if (!activeNote) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          h1 { color: #333; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        ${content}
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col gap-6 flex-1">
        {/* Editor area */}
        <div className="flex-1 flex flex-col">
          {activeNote ? (
            <div className="flex flex-col h-full min-h-0 bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
              {/* Compact header */}
              <div className="flex items-center gap-2 px-2 py-2 h-10 border-b border-gray-700">
                <Button
                  onClick={() => setActiveNote(null)}
                  size="sm"
                  variant="ghost"
                  className="text-gray-400 hover:text-white"
                >
                  <List className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Título (opcional)"
                  className="flex-1 bg-transparent text-gray-200 placeholder-gray-400 px-3 py-2 rounded border-transparent"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={saveNote}
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700 text-white shadow-md hover:brightness-110"
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={exportNote}
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700 text-white shadow-md hover:brightness-110"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={deleteNote}
                    size="sm"
                    variant="destructive"
                    className="bg-red-600 hover:bg-red-700 text-white shadow-md hover:brightness-110"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Editor that takes full space */}
              <div className="flex-1 min-h-0 overflow-hidden">
                <ReactQuill
                  theme="snow"
                  value={content}
                  onChange={setContent}
                  className="h-full dark-quill" // Adicionar a classe dark-quill aqui
                  modules={{
                    toolbar: [
                      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                      ['bold', 'italic', 'underline', 'strike'],
                      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                      ['link', 'image'],
                      ['clean']
                    ]
                  }}
                  formats={[
                    'header',
                    'bold', 'italic', 'underline', 'strike',
                    'list', 'bullet',
                    'link', 'image'
                  ]}
                  style={{ height: '100%' }}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full min-h-0">
              {/* Dashboard Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <Card className="bg-gray-800 border-gray-700 p-4 flex flex-col items-center justify-center">
                  <CardContent className="p-0 text-center">
                    <h4 className="text-sm font-medium text-gray-400 mb-1">Total de Anotações</h4>
                    <p className="text-3xl font-bold text-white">
                      {isLoadingTotalNotes ? '...' : totalNotesCount}
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-gray-800 border-gray-700 p-4 flex flex-col items-center justify-center">
                  <CardContent className="p-0 text-center">
                    <h4 className="text-sm font-medium text-gray-400 mb-1">Criadas Hoje</h4>
                    <p className="text-3xl font-bold text-white">
                      {isLoadingTodayNotes ? '...' : todayNotesCount}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Notes List */}
              <Card className="bg-gray-800 border-gray-700 flex-1 flex flex-col">
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-white">Minhas Anotações</h3>
                  <Button onClick={createNote} className="bg-purple-600 hover:bg-purple-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Anotação
                  </Button>
                </div>
                <div className="p-4">
                  <Input
                    placeholder="Buscar anotações..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full mb-4 bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-500"
                  />
                  <ScrollArea className="h-[calc(100vh-350px)]"> {/* Adjust height as needed */}
                    <div className="space-y-2">
                      {isLoadingNotes ? (
                        <p className="text-gray-400 text-sm text-center py-4">Carregando anotações...</p>
                      ) : filteredNotes.length === 0 ? (
                        <p className="text-gray-400 text-sm text-center py-4">
                          Nenhuma anotação encontrada. Crie uma nova!
                        </p>
                      ) : (
                        filteredNotes.map((note: any) => (
                          <div
                            key={note.id}
                            className={`p-3 rounded-lg cursor-pointer transition-colors ${activeNote?.id === note.id
                                ? 'bg-purple-900'
                                : 'bg-gray-700 hover:bg-gray-600'
                            }`}
                            onClick={() => setActiveNote(note)}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-200 truncate">{note.title}</p>
                                <p className="text-xs text-gray-400 truncate">
                                  {new Date(note.updated_at).toLocaleDateString('pt-BR')}
                                </p>
                                {note.content && (
                                  <p className="text-sm text-gray-300 mt-2 line-clamp-2">
                                    {/* Display a snippet of the content, stripping HTML */}
                                    {note.content.replace(/<[^>]*>?/gm, '').substring(0, 100)}...
                                  </p>
                                )}
                              </div>
                              <Button
                                onClick={(e) => deleteNoteFromList(note.id, e)}
                                size="sm"
                                variant="ghost"
                                className="ml-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 p-1 h-8 w-8"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Modal para todas as anotações (still exists, but now only for "Ver Todas" button) */}
      {showAllNotes && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">Todas as Anotações</h3>
              <Button
                size="sm"
                onClick={() => setShowAllNotes(false)}
                className="bg-gray-700 hover:bg-gray-600 text-white"
              >
                ✕
              </Button>
            </div>
            <div className="p-4">
              <Input
                placeholder="Buscar anotações..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full mb-4 bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-500"
              />
              <ScrollArea className="h-[60vh]">
                <div className="space-y-2">
                  {isLoadingNotes ? (
                    <p className="text-gray-400 text-sm text-center py-4">Carregando anotações...</p>
                  ) : notes.length === 0 ? (
                    <p className="text-gray-400 text-sm text-center py-4">
                      Nenhuma anotação encontrada
                    </p>
                  ) : (
                    notes.map((note: any) => (
                      <div
                        key={note.id}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${activeNote?.id === note.id
                            ? 'bg-purple-900'
                            : 'bg-gray-700 hover:bg-gray-600'
                        }`}
                        onClick={() => {
                          setActiveNote(note);
                          setShowAllNotes(false);
                        }}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-200 truncate">{note.title}</p>
                            <p className="text-xs text-gray-400 truncate">
                              {new Date(note.updated_at).toLocaleDateString('pt-BR')}
                            </p>
                            {note.content && (
                              <p className="text-sm text-gray-300 mt-2 line-clamp-2">
                                {note.content.replace(/<[^>]*>?/gm, '').substring(0, 100)}...
                              </p>
                            )}
                          </div>
                          <Button
                            onClick={(e) => deleteNoteFromList(note.id, e)}
                            size="sm"
                            variant="ghost"
                            className="ml-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 p-1 h-8 w-8"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotesPage;
