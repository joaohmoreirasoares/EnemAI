import { useState, useEffect, useMemo, useRef } from 'react';
import { Plus, Search, Save, Download, Trash2, List, Flame, Calendar, FileText, Clock, ArrowRight, Network } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import '../components/quill-dark.css';
import { AnimatePresence, motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { calculateStats } from '@/lib/streak';
import { QuickSwitcher } from '@/components/notes/QuickSwitcher';
import { NoteGraph } from '@/components/notes/NoteGraph';
import { AccessibilityHelper } from '@/components/accessibility/AccessibilityHelper';

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
  const [showLinkSuggester, setShowLinkSuggester] = useState(false);
  const [linkSearch, setLinkSearch] = useState('');

  // New Note Dialog State
  const [isNewNoteDialogOpen, setIsNewNoteDialogOpen] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [sourceNoteId, setSourceNoteId] = useState<string | null>(null); // ID of the note we are linking FROM
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const quillRef = useRef<ReactQuill>(null);
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

  const stats = useMemo(() => calculateStats(notes), [notes]);

  const backlinks = useMemo(() => {
    if (!activeNote) return [];
    return notes.filter((n: any) =>
      n.id !== activeNote.id &&
      n.content &&
      (n.content.toLowerCase().includes(`[[${activeNote.title.toLowerCase()}]]`) || n.content.includes(activeNote.id))
    );
  }, [activeNote, notes]);

  const filteredNotes = notes.filter((note: any) =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (note.content && note.content.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  useEffect(() => {
    if (activeNote) {
      setTitle(activeNote.title);
      setContent(activeNote.content || '');
    } else {
      setTitle('');
      setContent('');
    }
  }, [activeNote]);

  useEffect(() => {
    if (!activeNote) return;
    const lastChars = content.slice(-20);
    const match = lastChars.match(/\[\[([\w\s]*)$/);
    if (match) {
      setShowLinkSuggester(true);
      setLinkSearch(match[1]);
    } else {
      setShowLinkSuggester(false);
    }
  }, [content, activeNote]);

  const insertLink = (targetNote: any) => {
    if (!quillRef.current) return;
    const editor = quillRef.current.getEditor();
    const cursor = editor.getSelection();
    if (cursor) {
      const currentText = editor.getText();
      const matchIndex = currentText.lastIndexOf('[[');
      if (matchIndex !== -1) {
        editor.deleteText(cursor.index - (linkSearch.length + 2), linkSearch.length + 2);
        editor.insertText(cursor.index - (linkSearch.length + 2), `[[${targetNote.title}]]`, 'link', `/notes?id=${targetNote.id}`);
      }
    }
    setShowLinkSuggester(false);
  };

  const handleOpenNewNoteDialog = (sourceId: string | null = null) => {
    setNewNoteTitle('');
    setSourceNoteId(sourceId);
    setIsNewNoteDialogOpen(true);
  };

  const handleCreateNote = async () => {
    if (!newNoteTitle.trim()) return;

    const { data: { user } = {} } = await supabase.auth.getUser();
    if (!user) return;

    let initialContent = '';

    // If linking from a source note, add a backlink to the source in the new note
    if (sourceNoteId) {
      const sourceNote = notes.find((n: any) => n.id === sourceNoteId);
      if (sourceNote) {
        initialContent = `<p>Relacionado a: <a href="/notes?id=${sourceNote.id}">[[${sourceNote.title}]]</a></p><p><br></p>`;
      }
    }

    const { data: newNote, error } = await supabase
      .from('notes')
      .insert({
        user_id: user.id,
        title: newNoteTitle,
        content: initialContent
      })
      .select()
      .single();

    if (error) throw error;

    // If linking from a source note, update the source note to link to the NEW note
    if (sourceNoteId) {
      const sourceNote = notes.find((n: any) => n.id === sourceNoteId);
      if (sourceNote) {
        const newLink = `<p>Ver também: <a href="/notes?id=${newNote.id}">[[${newNote.title}]]</a></p>`;
        await supabase
          .from('notes')
          .update({
            content: sourceNote.content ? sourceNote.content + newLink : newLink,
            updated_at: new Date().toISOString()
          })
          .eq('id', sourceNoteId);
      }
    }

    setIsNewNoteDialogOpen(false);
    setActiveNote(newNote);
    queryClient.invalidateQueries({ queryKey: ['notes'] });
  };

  const saveNote = async () => {
    if (!activeNote) return;
    const { error } = await supabase.from('notes').update({ title, content, updated_at: new Date().toISOString() }).eq('id', activeNote.id);
    if (error) throw error;
    queryClient.invalidateQueries({ queryKey: ['notes'] });
  };

  const deleteNote = async () => {
    if (!activeNote) return;
    const { error } = await supabase.from('notes').delete().eq('id', activeNote.id);
    if (error) throw error;
    setActiveNote(null);
    queryClient.invalidateQueries({ queryKey: ['notes'] });
  };

  const deleteNoteFromList = async (noteId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const { error } = await supabase.from('notes').delete().eq('id', noteId);
    if (error) throw error;
    if (activeNote?.id === noteId) setActiveNote(null);
    queryClient.invalidateQueries({ queryKey: ['notes'] });
  };

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
    <div className="flex flex-col h-full bg-gray-950 overflow-hidden relative">
      <QuickSwitcher />

      {/* New Note Dialog */}
      <Dialog open={isNewNoteDialogOpen} onOpenChange={setIsNewNoteDialogOpen}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>{sourceNoteId ? 'Criar Nota Conectada' : 'Nova Anotação'}</DialogTitle>
            <DialogDescription className="text-gray-400">
              {sourceNoteId
                ? 'Esta nota será automaticamente vinculada à nota de origem.'
                : 'Dê um nome para sua nova ideia.'}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="title" className="text-right mb-2 block">Título</Label>
            <Input
              id="title"
              value={newNoteTitle}
              onChange={(e) => setNewNoteTitle(e.target.value)}
              placeholder="Ex: Resumo de Biologia..."
              className="bg-gray-900 border-gray-600 text-white focus:ring-purple-500/50 focus:border-purple-500 transition-all"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleCreateNote()}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsNewNoteDialogOpen(false)} className="text-gray-400 hover:text-white hover:bg-gray-700/50 transition-colors">Cancelar</Button>
            <Button onClick={handleCreateNote} className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-900/20 transition-all hover:scale-105 active:scale-95">Criar Nota</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AnimatePresence mode="wait">
        {activeNote ? (
          <motion.div
            key="editor"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col h-full min-h-0 bg-gray-900 absolute inset-0 z-50"
          >
            {/* ... Editor Content (Same as before) ... */}
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-800 bg-gray-900/80 backdrop-blur-md sticky top-0 z-10 shadow-sm">
              <Button
                onClick={() => { saveNote(); setActiveNote(null); }}
                size="sm"
                variant="ghost"
                className="text-gray-400 hover:text-white hover:bg-gray-800 transition-all hover:-translate-x-1"
                title="Voltar para a lista"
              >
                <List className="h-4 w-4 mr-2" /> Voltar
              </Button>

              <div className="h-6 w-px bg-gray-800 mx-2" />

              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Título da Anotação"
                className="flex-1 bg-transparent text-xl font-bold text-white border-transparent focus:ring-0 px-0 placeholder-gray-600"
              />

              <div className="flex gap-2 items-center">
                <span className="text-xs text-gray-600 mr-2 hidden md:block">
                  {activeNote.updated_at && `Editado ${formatDistanceToNow(new Date(activeNote.updated_at), { addSuffix: true, locale: ptBR })}`}
                </span>
                <Button
                  onClick={saveNote}
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-900/20 transition-all hover:scale-105 active:scale-95"
                  title="Salvar alterações (Ctrl+S)"
                >
                  <Save className="h-4 w-4 mr-2" /> Salvar
                </Button>
                <Button
                  onClick={deleteNote}
                  size="sm"
                  variant="ghost"
                  className="text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  title="Excluir anotação"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
              <div className="flex-1 relative flex flex-col min-w-0 bg-[#121212]">
                <ReactQuill
                  ref={quillRef}
                  theme="snow"
                  value={content}
                  onChange={setContent}
                  className="h-full dark-quill flex-1 flex flex-col"
                  modules={{
                    toolbar: [
                      [{ 'header': [1, 2, 3, false] }],
                      ['bold', 'italic', 'underline', 'strike'],
                      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                      ['blockquote', 'code-block'],
                      ['link', 'image'],
                      ['clean']
                    ]
                  }}
                />
                {/* Link Suggester Popup */}
                <AnimatePresence>
                  {showLinkSuggester && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute bottom-10 left-10 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl p-2 w-72 z-50"
                    >
                      <div className="flex items-center justify-between px-2 mb-2">
                        <p className="text-xs text-purple-400 uppercase font-bold tracking-wider">Linkar nota</p>
                        <span className="text-[10px] text-gray-500">Selecione para conectar</span>
                      </div>
                      <div className="max-h-48 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                        {notes.filter((n: any) => n.title.toLowerCase().includes(linkSearch.toLowerCase())).length > 0 ? (
                          notes.filter((n: any) => n.title.toLowerCase().includes(linkSearch.toLowerCase())).map((n: any) => (
                            <button
                              key={n.id}
                              onClick={() => insertLink(n)}
                              className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-purple-600/20 hover:text-purple-200 rounded-md transition-all flex items-center gap-2 group"
                            >
                              <div className="p-1 bg-gray-700 rounded group-hover:bg-purple-500/30 transition-colors">
                                <FileText className="h-3 w-3" />
                              </div>
                              <span className="truncate">{n.title}</span>
                            </button>
                          ))
                        ) : (
                          <div className="px-3 py-2 text-sm text-gray-500 italic">Nenhuma nota encontrada</div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Backlinks Sidebar */}
              <div className="w-80 border-l border-gray-800 bg-gray-900/50 p-6 hidden lg:flex flex-col gap-6 overflow-y-auto backdrop-blur-sm">
                <div>
                  <h3 className="text-xs font-bold text-gray-500 mb-4 uppercase tracking-wider flex items-center gap-2">
                    <Network className="h-3 w-3" /> Conexões (Backlinks)
                  </h3>
                  {backlinks.length === 0 ? (
                    <div className="text-center py-10 border-2 border-dashed border-gray-800 rounded-xl">
                      <Network className="h-8 w-8 text-gray-700 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Nenhuma nota menciona esta.</p>
                      <p className="text-xs text-gray-600 mt-1">Use [[Título]] em outras notas para conectar.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {backlinks.map((bn: any) => (
                        <motion.div
                          key={bn.id}
                          whileHover={{ scale: 1.02, x: 5 }}
                          onClick={() => setActiveNote(bn)}
                          className="p-4 bg-gray-800/40 border border-gray-700/50 rounded-xl cursor-pointer hover:bg-gray-800 hover:border-purple-500/30 transition-all group shadow-sm hover:shadow-md"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <FileText className="h-3 w-3 text-purple-500" />
                            <p className="text-sm text-gray-200 font-medium group-hover:text-purple-300 transition-colors line-clamp-1">{bn.title}</p>
                          </div>
                          <p className="text-xs text-gray-500 line-clamp-2 pl-5 border-l-2 border-gray-700 group-hover:border-purple-500/50 transition-colors">
                            ...{bn.content?.replace(/<[^>]*>?/gm, '').substring(0, 60)}...
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-4 bg-purple-900/10 rounded-xl border border-purple-500/10">
                  <h4 className="text-sm font-semibold text-purple-300 mb-2 flex items-center gap-2">
                    <Flame className="h-4 w-4" /> Dica de Estudo
                  </h4>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Conectar suas anotações ajuda a reter o conhecimento. Tente relacionar este tópico com outras matérias que você já estudou.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="graph-view"
            className="absolute inset-0 z-0 bg-gray-950"
          >
            <NoteGraph
              notes={notes}
              onNodeClick={(id) => { const note = notes.find((n: any) => n.id === id); if (note) setActiveNote(note); }}
              onCreateConnection={(sourceId) => handleOpenNewNoteDialog(sourceId)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recentes / Drawer Logic */}
      {!activeNote && (
        <>
          {/* Unified Floating Button */}
          <motion.div
            initial={false}
            animate={{
              y: isDrawerOpen ? "calc(-85vh + 0.5rem)" : 0, // Using transform for smoothness
            }}
            transition={{ duration: 1, ease: "easeInOut" }} // Matches drawer transition exactly
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40"
          >
            <Button
              onClick={() => setIsDrawerOpen(!isDrawerOpen)}
              variant="ghost"
              className="flex flex-col items-center gap-2 text-white/90 hover:text-white hover:bg-transparent transition-colors group"
            >
              <motion.div
                className="flex flex-col items-center gap-2"
                initial={false}
                animate={{ opacity: 1 }}
              >
                {/* Icon container */}
                <div className="p-3 rounded-full bg-white/10 border border-white/20 group-hover:border-purple-500/50 group-hover:bg-purple-500/20 transition-all shadow-lg backdrop-blur-md">
                  <motion.div
                    initial={false}
                    animate={{ rotate: isDrawerOpen ? 90 : -90 }}
                    transition={{ duration: 1, ease: "easeInOut" }}
                  >
                    <ArrowRight />
                  </motion.div>
                </div>

                {/* Text changes based on state - ALWAYS BELOW */}
                <div className="relative h-6 min-w-[60px] flex items-center justify-center overflow-visible mt-2">
                  <AnimatePresence initial={false}>
                    {isDrawerOpen ? (
                      <motion.span
                        key="close-text"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.5 }}
                        className="text-sm font-medium tracking-wide drop-shadow-md absolute whitespace-nowrap"
                      >
                        Voltar ao quadro interativo
                      </motion.span>
                    ) : (
                      <motion.span
                        key="open-text"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.5 }}
                        className="text-sm font-medium tracking-wide drop-shadow-md absolute whitespace-nowrap"
                      >
                        Recentes
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </Button>
          </motion.div>

          {/* Drawer Overlay & Content */}
          <AnimatePresence>
            {isDrawerOpen && (
              <>
                {/* Dark Overlay */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1 }} // Synced duration
                  onClick={() => setIsDrawerOpen(false)}
                  className="absolute inset-0 bg-black/40 backdrop-blur-[1px] z-20" // Reduced opacity
                />

                {/* Drawer Container */}
                <motion.div
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ duration: 1, ease: "easeInOut" }}
                  className="absolute bottom-0 left-0 right-0 h-[85vh] z-30 flex justify-center pointer-events-none"
                >
                  <div className="w-full max-w-4xl h-full flex flex-col pointer-events-auto">
                    {/* Modal Panel */}
                    <div className="flex-1 bg-gray-900/90 backdrop-blur-xl border-t border-r border-l border-white/10 rounded-t-3xl shadow-2xl flex flex-col overflow-hidden">
                      {/* Header inside Modal */}
                      <div className="p-6 md:p-8 pb-4 border-b border-white/5">
                        <div className="relative">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <Input
                            placeholder="Pesquisar suas anotações..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="h-14 pl-12 rounded-2xl bg-black/20 border-white/10 text-lg text-white placeholder-gray-500 focus:bg-black/40 focus:border-purple-500/50 transition-all"
                          />
                        </div>
                      </div>

                      {/* Content List */}
                      <ScrollArea className="flex-1 p-6 md:p-8 pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-12">
                          {/* Create New Card */}
                          <motion.button
                            layout
                            onClick={() => handleOpenNewNoteDialog()}
                            className="group flex flex-col items-center justify-center h-40 rounded-2xl border border-dashed border-gray-700 hover:border-purple-500/50 hover:bg-purple-500/5 transition-all w-full"
                          >
                            <div className="h-10 w-10 rounded-full bg-gray-800 group-hover:bg-purple-500/20 flex items-center justify-center mb-3 transition-colors">
                              <Plus className="h-5 w-5 text-gray-400 group-hover:text-purple-400" />
                            </div>
                            <span className="text-sm text-gray-400 group-hover:text-purple-300 font-medium">Nova anotação</span>
                          </motion.button>

                          {filteredNotes.map((note: any) => (
                            <motion.div
                              layout
                              key={note.id}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="group"
                            >
                              <div
                                onClick={() => setActiveNote(note)}
                                className="h-40 p-5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-purple-500/30 transition-all cursor-pointer flex flex-col justify-between group-hover:shadow-lg group-hover:shadow-purple-900/10 relative overflow-hidden"
                              >
                                <div>
                                  <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-base font-semibold text-gray-200 group-hover:text-white line-clamp-1 transition-colors">
                                      {note.title || 'Sem título'}
                                    </h3>
                                    <span className="text-[10px] text-gray-500 font-medium bg-black/20 px-2 py-1 rounded-full whitespace-nowrap ml-2">
                                      {formatDistanceToNow(new Date(note.updated_at), { addSuffix: true, locale: ptBR })}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-500 line-clamp-3 group-hover:text-gray-400 transition-colors">
                                    {note.content ? note.content.replace(/<[^>]*>?/gm, '').substring(0, 100) : 'Sem conteúdo...'}
                                  </p>
                                </div>

                                <button
                                  onClick={(e) => deleteNoteFromList(note.id, e)}
                                  className="absolute bottom-4 right-4 p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
};

export default NotesPage;