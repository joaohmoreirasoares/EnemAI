"use client";

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, MessageCircle, Clock, User, Send, Heart, Reply, MoreVertical, CornerDownRight, Sparkles } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { createComment, getComments } from '@/lib/social';

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());
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
      return await getComments({ discussionId });
    },
    enabled: !!discussionId
  });

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !currentUser || !discussionId) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await createComment({
        discussion_id: discussionId,
        author_id: currentUser.id,
        body: newComment.trim()
      });

      setNewComment('');
      queryClient.invalidateQueries({ queryKey: ['discussion-comments', discussionId] });
    } catch (error: any) {
      console.error('Error creating comment:', error);
      setError(error.message || 'Erro ao criar comentário. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleLike = (commentId: string) => {
    setLikedComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
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
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <MessageCircle className="h-5 w-5 text-purple-400" />
            </div>
            Comentários <span className="text-gray-500 text-lg font-normal">({comments.length})</span>
          </h3>
        </div>

        {/* Error message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-lg"
          >
            <p className="text-red-400 text-sm">{error}</p>
          </motion.div>
        )}

        {/* Add Comment Input */}
        {currentUser && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
              <div className="relative bg-gray-800 rounded-xl p-4 border border-gray-700 shadow-xl">
                <div className="flex gap-4">
                  <Avatar className="h-10 w-10 border-2 border-gray-700">
                    <AvatarImage src={currentUser.user_metadata?.avatar_url} />
                    <AvatarFallback className="bg-purple-900 text-purple-200">
                      {currentUser.user_metadata?.first_name?.[0]}{currentUser.user_metadata?.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-3">
                    <Textarea
                      placeholder="Adicione um comentário construtivo..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSubmitComment();
                        }
                      }}
                      className="min-h-[80px] bg-gray-900/50 border-gray-600 text-white placeholder-gray-500 focus:border-purple-500 transition-all resize-none"
                    />
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Sparkles className="h-3 w-3 text-yellow-500" />
                        Pressione Enter para enviar
                      </p>
                      <Button
                        onClick={handleSubmitComment}
                        disabled={!newComment.trim() || isSubmitting}
                        className={`bg-purple-600 hover:bg-purple-700 text-white transition-all duration-300 ${isSubmitting ? 'w-32' : 'w-24'}`}
                      >
                        {isSubmitting ? (
                          <div className="flex items-center gap-2">
                            <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Enviando</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span>Enviar</span>
                            <Send className="h-3 w-3" />
                          </div>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Comments List */}
        <div className="flex-1">
          {commentsLoading ? (
            <div className="text-center py-12 text-gray-400">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p>Carregando comentários...</p>
            </div>
          ) : comments.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 text-gray-400 bg-gray-800/30 rounded-xl border border-gray-700/50 border-dashed"
            >
              <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p className="text-lg font-medium text-gray-300">Nenhum comentário ainda</p>
              <p className="text-sm mt-1">Seja o primeiro a compartilhar seu conhecimento!</p>
            </motion.div>
          ) : (
            <div className="space-y-6 pb-8">
              <AnimatePresence mode="popLayout">
                {comments.map((comment, index) => (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="group flex gap-4"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Avatar className="h-10 w-10 border-2 border-gray-700 group-hover:border-purple-500/50 transition-colors">
                        <AvatarImage src={comment.profiles?.avatar_url} alt={comment.profiles?.name} />
                        <AvatarFallback className="bg-gray-800 text-gray-300">
                          {getAuthorInitials(comment.profiles?.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="w-0.5 flex-1 bg-gray-800 group-last:hidden rounded-full my-2" />
                    </div>

                    <div className="flex-1">
                      <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 hover:bg-gray-800 hover:border-gray-600 transition-all duration-300 shadow-sm hover:shadow-md relative">
                        {/* Comment Header */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm hover:text-purple-400 cursor-pointer transition-colors">
                              {comment.profiles?.name || 'Usuário'}
                            </span>
                            <span className="text-gray-600 text-xs">•</span>
                            <span className="text-xs text-gray-500">
                              {formatDate(comment.created_at)}
                            </span>
                          </div>

                          <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreVertical className="h-3 w-3" />
                          </Button>
                        </div>

                        {/* Comment Body */}
                        <p className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed mb-3">
                          {comment.content}
                        </p>

                        {/* Comment Actions */}
                        <div className="flex items-center gap-4 pt-2 border-t border-gray-700/30">
                          <button
                            onClick={() => toggleLike(comment.id)}
                            className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${likedComments.has(comment.id)
                                ? 'text-pink-500'
                                : 'text-gray-500 hover:text-pink-400'
                              }`}
                          >
                            <Heart className={`h-3.5 w-3.5 ${likedComments.has(comment.id) ? 'fill-pink-500' : ''}`} />
                            <span>{likedComments.has(comment.id) ? 'Curtido' : 'Curtir'}</span>
                          </button>

                          <button className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-blue-400 transition-colors">
                            <MessageCircle className="h-3.5 w-3.5" />
                            <span>Responder</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiscussionDetail;