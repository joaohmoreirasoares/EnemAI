import { useState, useEffect } from 'react';
import { Plus, Search, Save, Download, Trash2, Edit3 } from 'lucide-react';
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
                <Button 
                  size="sm" 
                  onClick={createNote}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Plus className="h-4 w-4" />
                </Button>
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
    </div>
  );
};

export default NotesPage;