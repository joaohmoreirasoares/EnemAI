"use client";

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, MessageCircle, Clock, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  profiles: {
    id: string;
    name: string;
    avatar_url?: string;
  };
}

const DiscussionDetail = () => {
  const { id: discussionId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [newComment, setNewComment] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Fetch current user
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    getCurrentUser();
  }, []);

  // Fetch discussion details
  const { data: discussion, isLoading: discussionLoading } = useQuery({
    queryKey: ['discussion', discussionId],
    queryFn: async () => {
      if (!discussionId) return null;
      
      const { data, error } = await supabase
        .from('discussions')
        .select(`
          *,
          profiles (
            id,
            name,
            avatar_url
          )
        `)
        .eq('id', discussionId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!discussionId
  });

  // Fetch comments
  const { data: comments = [], isLoading: commentsLoading } = useQuery({
    queryKey: ['discussion-comments', discussionId],
    queryFn: async () => {
      if (!discussionId) return [];
      
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles (
            id,
            name,
            avatar_url
          )
        `)
        .eq('discussion_id', discussionId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!discussionId
  });

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !currentUser || !discussionId) return;

    setError(null);

    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          discussion_id: discussionId,
          user_id: currentUser.id,
          content: newComment.trim()
        });

      if (error) throw error;
      
      setNewComment('');
      queryClient.invalidateQueries({ queryKey: ['discussion-comments', discussionId] });
    } catch (error: any) {
      console.error('Error creating comment:', error);
      setError(error.message || 'Erro ao criar comentário. Tente novamente.');
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true, 
        locale: ptBR 
      });
    } catch {
      return new Date(dateString).toLocaleDateString('pt-BR');
    }
  };

  const getAuthorInitials = (name: string | undefined) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  const TAG_COLORS: Record<string, string> = {
    'Matemática': 'bg-blue-600',
    'Português': 'bg-pink-600',
    'História': 'bg-amber-600',
    'Geografia': 'bg-emerald-600',
    'Física': 'bg-violet-600',
    'Química': 'bg-rose-600',
    'Biologia': 'bg-green-600',
    'Redação': 'bg-yellow-600',
    'Dúvida': 'bg-slate-600',
    'Estudo': 'bg-sky-600',
    'Geral': 'bg-gray-600'
  };

  if (discussionLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!discussion) {
    return (
      <div className="text-center py-8 text-gray-400">
        Discussão não encontrada
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/community')}
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-3xl font-bold text-white">Discussão</h1>
        </div>
      </div>

      {/* Discussion Content */}
      <Card className="bg-gray-800 border-gray-700 mb-6">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start gap-4 mb-6">
            <Avatar className="w-12 h-12">
              <AvatarImage src={discussion.profiles?.avatar_url} alt={discussion.profiles?.name} />
              <AvatarFallback>
                {getAuthorInitials(discussion.profiles?.name)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium text-white">
                  {discussion.profiles?.name || 'Usuário'}
                </span>
                <span className="text-gray-500">•</span>
                <span className="text-sm text-gray-400 flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {formatDate(discussion.created_at)}
                </span>
              </div>
              
              <Badge 
                variant="secondary"
                className={`${TAG_COLORS[discussion.tag] || TAG_COLORS['Geral']} text-white`}
              >
                {discussion.tag}
              </Badge>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-white mb-4">
            {discussion.title}
          </h2>

          {/* Content */}
          {discussion.content && (
            <div className="text-gray-300 whitespace-pre-wrap mb-6">
              {discussion.content}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Comments Section */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Comentários ({comments.length})
          </h3>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Add Comment */}
        {currentUser && (
          <Card className="bg-gray-800 border-gray-700 mb-6">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <Avatar className="h-10 w-10">
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
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
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
            </CardContent>
          </Card>
        )}

        {/* Comments List */}
        <Card className="bg-gray-800 border-gray-700 flex-1">
          <CardContent className="p-0 h-full">
            <ScrollArea className="h-[400px]">
              <div className="p-4">
                {commentsLoading ? (
                  <div className="text-center py-8 text-gray-400">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto mb-2"></div>
                    <p>Carregando comentários...</p>
                  </div>
                ) : comments.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <p>Nenhum comentário ainda.</p>
                    <p className="text-sm mt-2">Seja o primeiro a comentar!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <div key={comment.id} className="flex gap-3">
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarImage src={comment.profiles?.avatar_url} alt={comment.profiles?.name} />
                          <AvatarFallback>
                            {getAuthorInitials(comment.profiles?.name)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <Card className="bg-gray-700 border-gray-600">
                            <CardContent className="p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-white text-sm">
                                  {comment.profiles?.name || 'Usuário'}
                                </span>
                                <span className="text-xs text-gray-400">
                                  {formatDate(comment.created_at)}
                                </span>
                              </div>
                              <p className="text-gray-300 text-sm whitespace-pre-wrap">
                                {comment.content}
                              </p>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DiscussionDetail;