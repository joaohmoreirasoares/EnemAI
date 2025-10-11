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

// Função para exportar anotações como contexto
export const getUserNotes = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return '';

  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })
    .limit(3);

  if (error) throw error;

  if (data.length === 0) return '';

  return data.map(note => 
    `Nota: ${note.title}\nConteúdo: ${note.content || ''}\n`
  ).join('\n');
};

const NotesPage = () => {
  const [activeNote, setActiveNote] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [showToolbar, setShowToolbar] = useState(false);
  const [showAllNotes, setShowAllNotes] = useState(false);
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
      <div className="flex flex-col gap-6 flex-1">
        {/* Editor area */}
        <div className="flex-1 flex flex-col">
          {activeNote ? (
            <div className="flex flex-col h-full min-h-0 bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
              {/* Compact header */}
              <div className="flex items-center gap-2 px-2 py-2 h-10 border-b border-gray-700">
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Título (opcional)"
                  className="flex-1 bg-transparent text-white placeholder-gray-400 px-3 py-2 rounded border-transparent"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={() => setShowAllNotes(true)}
                    size="sm"
                    className="bg-white text-gray-800 hover:bg-white"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={saveNote}
                    size="sm"
                    className="bg-white text-gray-800 hover:bg-white"
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={exportNote}
                    size="sm"
                    className="bg-white text-gray-800 hover:bg-white"
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
            <Card className="bg-gray-800 border-gray-700 flex-1 flex flex-col items-center justify-center">
              <CardContent className="p-12 text-center">
                <div className="flex justify-center mb-6">
                  <Edit3 className="h-20 w-20 text-purple-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">Nenhuma anotação selecionada</h3>
                <p className="text-gray-400 mb-4">
                  Selecione uma anotação existente ou crie uma nova para começar.
                </p>
                <div className="flex gap-2 justify-center">
                  <Button onClick={() => setShowAllNotes(true)} className="bg-purple-600 hover:bg-purple-700">
                    <List className="h-4 w-4 mr-2" />
                    Ver Todas
                  </Button>
                  <Button onClick={createNote} className="bg-purple-600 hover:bg-purple-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Nova Anotação
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Modal para todas as anotações */}
      {showAllNotes && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-semibold">Todas as Anotações</h3>
              <Button 
                size="sm" 
                onClick={() => setShowAllNotes(false)}
                className="bg-gray-700 hover:bg-gray-600"
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
                  {notes.map((note: any) => (
                    <div
                      key={note.id}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        activeNote?.id === note.id
                          ? 'bg-purple-900'
                          : 'bg-gray-700 hover:bg-gray-600'
                      }`}
                      onClick={() => {
                        setActiveNote(note);
                        setShowAllNotes(false);
                      }}
                    >
                      <p className="font-medium text-gray-200 truncate">{note.title}</p>
                      <p className="text-xs text-gray-400 truncate">
                        {new Date(note.updated_at).toLocaleDateString('pt-BR')}
                      </p>
                      {note.content && (
                        <p className="text-sm text-gray-300 mt-2 line-clamp-2">
                          {note.content.substring(0, 100)}...
                        </p>
                      )}
                    </div>
                  ))}
                  
                  {notes.length === 0 && (
                    <p className="text-gray-400 text-sm text-center py-4">
                      Nenhuma anotação encontrada
                    </p>
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