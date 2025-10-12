"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';

interface CommentSectionProps {
  postId: string;
  currentUser?: any;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  profiles: {
    first_name: string;
    last_name: string;
    avatar_url?: string;
  };
}

const CommentSection = ({ postId, currentUser }: CommentSectionProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles (first_name, last_name, avatar_url)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !currentUser) return;

    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          user_id: currentUser.id,
          content: newComment.trim()
        });

      if (error) throw error;
      
      setNewComment('');
      await fetchComments();
    } catch (error) {
      console.error('Error creating comment:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffMinutes = Math.ceil(diffTime / (1000 * 60));
    
    if (diffMinutes < 1) return 'agora';
    if (diffMinutes < 60) return `há ${diffMinutes} min`;
    if (diffMinutes < 1440) return `há ${Math.ceil(diffMinutes / 60)} horas`;
    return `há ${Math.ceil(diffMinutes / 1440)} dias`;
  };

  if (loading) {
    return <div className="text-gray-400">Carregando comentários...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Adicionar comentário */}
      {currentUser && (
        <div className="flex gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={currentUser.user_metadata?.avatar_url} />
            <AvatarFallback>
              {currentUser.user_metadata?.first_name?.[0]}{currentUser.user_metadata?.last_name?.[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Input
              placeholder="Adicione um comentário..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSubmitComment()}
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>
          <Button
            onClick={handleSubmitComment}
            disabled={!newComment.trim()}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Enviar
          </Button>
        </div>
      )}

      {/* Lista de comentários */}
      <ScrollArea className="max-h-96">
        <div className="space-y-4">
          {comments.length === 0 ? (
            <div className="text-center py-4 text-gray-400">
              Seja o primeiro a comentar!
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={comment.profiles.avatar_url} alt={comment.profiles.first_name} />
                  <AvatarFallback>
                    {comment.profiles.first_name?.[0]}{comment.profiles.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Card className="bg-gray-700 border-gray-600">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-white text-sm">
                          {comment.profiles.first_name} {comment.profiles.last_name}
                        </span>
                        <span className="text-gray-400 text-xs">•</span>
                        <span className="text-gray-400 text-xs">{formatDate(comment.created_at)}</span>
                      </div>
                      <p className="text-gray-300 text-sm">{comment.content}</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default CommentSection;