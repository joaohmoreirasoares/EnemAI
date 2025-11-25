import { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Save, Download, Trash2, List, Flame, Calendar, FileText, Clock, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import '../components/quill-dark.css';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { calculateStats } from '@/lib/streak';

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
    .ilike('title', `%${title}%`)
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

const NotesPage = () => {
  const [activeNote, setActiveNote] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
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

  // Calculate stats using the same logic as Chat
  const stats = useMemo(() => calculateStats(notes), [notes]);

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
  };

  // Delete note from list
  const deleteNoteFromList = async (noteId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', noteId);

    if (error) throw error;

    if (activeNote?.id === noteId) {
      setActiveNote(null);
    }

    queryClient.invalidateQueries({ queryKey: ['notes'] });
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
    <div className="flex flex-col h-full bg-gradient-to-b from-gray-900 to-gray-950 overflow-hidden">
      {activeNote ? (
        <div className="flex flex-col h-full min-h-0 bg-gray-900">
          {/* Editor Header */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
            <Button
              onClick={() => setActiveNote(null)}
              size="sm"
              variant="ghost"
              className="text-gray-400 hover:text-white hover:bg-gray-800"
            >
              <List className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título da anotação"
              className="flex-1 bg-transparent text-lg font-semibold text-white placeholder-gray-500 px-3 py-2 rounded border-transparent focus:ring-0"
            />
            <div className="flex gap-2">
              <Button
                onClick={saveNote}
                size="sm"
                className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-900/20"
              >
                <Save className="h-4 w-4 mr-2" />
                Salvar
              </Button>
              <Button
                onClick={exportNote}
                size="sm"
                variant="outline"
                className="border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800"
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                onClick={deleteNote}
                size="sm"
                variant="destructive"
                className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Editor Content */}
          <div className="flex-1 min-h-0 overflow-hidden bg-gray-900">
            <ReactQuill
              theme="snow"
              value={content}
              onChange={setContent}
              className="h-full dark-quill"
              modules={{
                toolbar: [
                  [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                  ['bold', 'italic', 'underline', 'strike'],
                  [{ 'list': 'ordered' }, { 'list': 'bullet' }],
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
        <div className="flex flex-col h-full p-6 md:p-10 overflow-hidden">
          <div className="max-w-6xl mx-auto w-full flex flex-col h-full">

            {/* Header Section */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                Suas Anotações
              </h1>
              <p className="text-gray-400 text-lg">
                Organize suas ideias e estudos em um só lugar.
              </p>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6 flex items-center gap-4 hover:bg-gray-800/80 transition-colors"
              >
                <div className="p-3 bg-orange-500/10 rounded-xl">
                  <Flame className="h-8 w-8 text-orange-500" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">Streak de Escrita</p>
                  <p className="text-3xl font-bold text-white">{stats.streakDays} <span className="text-sm font-normal text-gray-500">dias</span></p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6 flex items-center gap-4 hover:bg-gray-800/80 transition-colors"
              >
                <div className="p-3 bg-blue-500/10 rounded-xl">
                  <FileText className="h-8 w-8 text-blue-500" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">Total de Notas</p>
                  <p className="text-3xl font-bold text-white">{stats.totalChats}</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6 flex items-center gap-4 hover:bg-gray-800/80 transition-colors"
              >
                <div className="p-3 bg-green-500/10 rounded-xl">
                  <Calendar className="h-8 w-8 text-green-500" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">Hoje</p>
                  <p className="text-3xl font-bold text-white">{stats.chatsToday} <span className="text-sm font-normal text-gray-500">criadas</span></p>
                </div>
              </motion.div>
            </div>

            {/* Action & List Section */}
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Clock className="h-5 w-5 text-gray-400" />
                  Recentes
                </h2>

                <div className="flex w-full md:w-auto gap-3">
                  <div className="relative flex-1 md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Buscar anotações..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:bg-gray-800 transition-colors"
                    />
                  </div>
                  <Button
                    onClick={createNote}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg shadow-purple-900/20 whitespace-nowrap"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Nova Nota
                  </Button>
                </div>
              </div>

              <ScrollArea className="flex-1 -mx-2 px-2">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-10">
                  {/* Create New Card */}
                  <motion.button
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    onClick={createNote}
                    className="group flex flex-col items-center justify-center h-48 rounded-2xl border-2 border-dashed border-gray-700 hover:border-purple-500/50 hover:bg-purple-500/5 transition-all duration-300"
                  >
                    <div className="h-12 w-12 rounded-full bg-gray-800 group-hover:bg-purple-500/20 flex items-center justify-center mb-3 transition-colors">
                      <Plus className="h-6 w-6 text-gray-400 group-hover:text-purple-400" />
                    </div>
                    <span className="text-gray-400 group-hover:text-purple-300 font-medium">Criar nova anotação</span>
                  </motion.button>

                  {isLoadingNotes ? (
                    [1, 2, 3].map((i) => (
                      <div key={i} className="h-48 rounded-2xl bg-gray-800/30 animate-pulse" />
                    ))
                  ) : filteredNotes.length === 0 && searchTerm ? (
                    <div className="col-span-full text-center py-10 text-gray-500">
                      Nenhuma anotação encontrada para "{searchTerm}"
                    </div>
                  ) : (
                    filteredNotes.map((note: any, index: number) => (
                      <motion.div
                        key={note.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 + (index * 0.05) }}
                        className="group relative"
                      >
                        <Card
                          onClick={() => setActiveNote(note)}
                          className="h-48 p-5 bg-gray-800/40 border-gray-700/50 hover:bg-gray-800 hover:border-gray-600 transition-all duration-300 cursor-pointer flex flex-col justify-between group-hover:shadow-xl group-hover:shadow-purple-900/10"
                        >
                          <div>
                            <div className="flex justify-between items-start mb-3">
                              <div className="p-2 bg-purple-500/10 rounded-lg">
                                <FileText className="h-5 w-5 text-purple-400" />
                              </div>
                              <span className="text-xs text-gray-500 font-medium bg-gray-900/50 px-2 py-1 rounded-full">
                                {formatDistanceToNow(new Date(note.updated_at), { addSuffix: true, locale: ptBR })}
                              </span>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-200 group-hover:text-white line-clamp-1 transition-colors mb-2">
                              {note.title || 'Sem título'}
                            </h3>
                            <p className="text-sm text-gray-500 line-clamp-2 group-hover:text-gray-400 transition-colors">
                              {note.content ? note.content.replace(/<[^>]*>?/gm, '').substring(0, 150) : 'Sem conteúdo...'}
                            </p>
                          </div>

                          <div className="flex justify-between items-center mt-2">
                            <span className="text-xs text-gray-600 group-hover:text-gray-500 transition-colors">
                              {new Date(note.created_at).toLocaleDateString('pt-BR')}
                            </span>
                            <div className="flex items-center text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300">
                              <span className="text-sm font-medium mr-1">Abrir</span>
                              <ArrowRight className="h-4 w-4" />
                            </div>
                          </div>
                        </Card>

                        <button
                          onClick={(e) => deleteNoteFromList(note.id, e)}
                          className="absolute top-4 right-4 p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200"
                          title="Excluir anotação"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </motion.div>
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