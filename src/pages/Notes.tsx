import { useState, useEffect } from 'react';
import { Plus, Search, Save, Download, Trash2, Edit3, X, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const NotesPage = () => {
  const [activeNote, setActiveNote] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const queryClient = useQueryClient();

  // Fetch user's notes
  const { data: notes = [] } = useQuery({
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
    const { data: { user } } = await supabase.auth.getUser();
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

  // Open settings popup
  const openSettings = () => {
    setShowSettings(true);
  };

  // Close settings popup
  const closeSettings = () => {
    setShowSettings(false);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">Anotações</h1>
        <p className="text-gray-400">Crie e organize suas anotações de estudo</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 flex-1">
        {/* Notes sidebar */}
        <div className="w-full md:w-80 flex-shrink-0">
          <Card className="bg-gray-800 border-gray-700 h-full flex flex-col">
            <CardContent className="p-4 flex-1 flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Minhas Anotações</h2>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={openSettings}
                    variant="outline"
                    className="h-8 w-8 p-0 border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={createNote}
                    className="bg-purple-600 hover:bg-purple-700 h-8 w-8 p-0"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar anotações..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>
              
              <ScrollArea className="flex-1">
                <div className="space-y-2">
                  {filteredNotes.map((note: any) => (
                    <div
                      key={note.id}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        activeNote?.id === note.id
                          ? 'bg-purple-900'
                          : 'bg-gray-700 hover:bg-gray-600'
                      }`}
                      onClick={() => setActiveNote(note)}
                    >
                      <p className="font-medium truncate">{note.title}</p>
                      <p className="text-xs text-gray-400 truncate">
                        {new Date(note.updated_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  ))}
                  
                  {filteredNotes.length === 0 && (
                    <p className="text-gray-400 text-sm text-center py-4">
                      {searchTerm ? 'Nenhuma anotação encontrada' : 'Nenhuma anotação ainda'}
                    </p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Editor area */}
        <div className="flex-1 flex flex-col">
          {activeNote ? (
            <Card className="bg-gray-800 border-gray-700 flex-1 flex flex-col">
              <CardContent className="p-0 flex-1 flex flex-col">
                {/* Toolbar */}
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Título da anotação"
                    className="bg-gray-700 border-gray-600 text-white flex-1 mr-4"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={saveNote}
                      variant="outline"
                      size="sm"
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Salvar
                    </Button>
                    <Button
                      onClick={exportNote}
                      variant="outline"
                      size="sm"
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Exportar
                    </Button>
                    <Button
                      onClick={deleteNote}
                      variant="outline"
                      size="sm"
                      className="border-red-600 text-red-400 hover:bg-red-900"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Editor */}
                <div className="flex-1">
                  <ReactQuill
                    theme="snow"
                    value={content}
                    onChange={setContent}
                    className="h-full"
                    modules={{
                      toolbar: [
                        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                        ['bold', 'italic', 'underline', 'strike'],
                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                        ['link', 'image'],
                        ['clean']
                      ]
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-gray-800 border-gray-700 flex-1 flex flex-col items-center justify-center">
              <CardContent className="p-8 text-center">
                <Edit3 className="h-16 w-16 text-purple-500 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Nenhuma anotação selecionada</h3>
                <p className="text-gray-400 mb-4">
                  Selecione uma anotação existente ou crie uma nova para começar.
                </p>
                <Button onClick={createNote} className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Nova Anotação
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Settings popup modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="bg-gray-800 border-gray-700 w-full max-w-md max-h-[80vh] flex flex-col">
            <CardContent className="p-6 flex-1 flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">Configurações</h2>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={closeSettings}
                  className="text-gray-400 hover:text-white h-8 w-8 p-0"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              <ScrollArea className="flex-1">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-white mb-3">Gerenciar Anotações</h3>
                    <div className="space-y-3">
                      <Button 
                        onClick={createNote}
                        variant="outline"
                        className="w-full justify-start bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Criar Nova Anotação
                      </Button>
                      
                      <div className="pt-2">
                        <h4 className="text-sm font-medium text-gray-300 mb-2">Ações em Massa</h4>
                        <div className="grid grid-cols-2 gap-2">
                          <Button 
                            variant="outline"
                            size="sm"
                            className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                          >
                            Exportar Todas
                          </Button>
                          <Button 
                            variant="outline"
                            size="sm"
                            className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                          >
                            Importar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-white mb-3">Estatísticas</h3>
                    <div className="bg-gray-700 rounded-lg p-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-400">Total de Anotações</p>
                          <p className="text-2xl font-bold text-white">{notes.length}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Última Atualização</p>
                          <p className="text-lg font-medium text-white">
                            {notes.length > 0 
                              ? new Date(notes[0]?.updated_at).toLocaleDateString('pt-BR') 
                              : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-white mb-3">Preferências</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Modo Escuro</span>
                        <Button 
                          variant="outline"
                          size="sm"
                          className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                        >
                          Ativado
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Notificações</span>
                        <Button 
                          variant="outline"
                          size="sm"
                          className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                        >
                          Ativado
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>
              
              <div className="mt-6">
                <Button 
                  onClick={closeSettings}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  Fechar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default NotesPage;