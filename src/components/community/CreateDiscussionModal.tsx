"use client";

import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';

interface CreateDiscussionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const TAGS = [
  'Matemática', 'Português', 'História', 'Geografia', 
  'Física', 'Química', 'Biologia', 'Redação', 
  'Dúvida', 'Estudo', 'Geral'
];

const CreateDiscussionModal = ({ isOpen, onClose, onSuccess }: CreateDiscussionModalProps) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tag, setTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError('Título é obrigatório');
      return;
    }

    if (!tag) {
      setError('Tag é obrigatória');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const { data, error } = await supabase
        .from('discussions')
        .insert({
          author_id: user.id,
          title: title.trim(),
          content: content.trim(),
          tag: tag,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // Reset form
      setTitle('');
      setContent('');
      setTag('');
      
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error('Error creating discussion:', error);
      setError(error.message || 'Erro ao criar discussão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-white">Nova Discussão</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {error && (
            <div className="p-3 bg-red-900/30 border border-red-700 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Título *
            </label>
            <Input
              placeholder="Digite um título claro para sua discussão..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
            />
          </div>

          {/* Tag */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tag *
            </label>
            <Select value={tag} onValueChange={setTag}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Selecione uma tag" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                {TAGS.map((tagOption) => (
                  <SelectItem key={tagOption} value={tagOption} className="text-white">
                    {tagOption}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Conteúdo
            </label>
            <Textarea
              placeholder="Descreva sua dúvida, compartilhe um material ou inicie uma discussão..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyPress={handleKeyPress}
              rows={6}
              className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 resize-none"
            />
          </div>

          {/* Preview */}
          {(title || content) && (
            <div className="bg-gray-700 border border-gray-600 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-300 mb-2">Pré-visualização</h4>
              {title && (
                <h5 className="font-semibold text-white mb-2">{title}</h5>
              )}
              {content && (
                <p className="text-gray-300 text-sm whitespace-pre-wrap">{content}</p>
              )}
              {tag && (
                <div className="mt-2">
                  <span className="inline-block px-2 py-1 text-xs font-medium bg-purple-600 text-white rounded-full">
                    {tag}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t border-gray-700">
            <Button
              variant="outline"
              onClick={onClose}
              className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading || !title.trim() || !tag}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {loading ? 'Publicando...' : 'Publicar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateDiscussionModal;