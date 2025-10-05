import { useState, useEffect } from 'react';
import { Send, MessageCircle, Heart, User, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

const CommunityPage = () => {
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [newComment, setNewComment] = useState<{[key: string]: string}>({});
  const queryClient = useQueryClient();

  // Fetch posts with user profiles
  const { data: posts = [] } = useQuery({
    queryKey: ['community-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('community_posts')
        .select(`
          *,
          profiles (first_name, last_name, avatar_url)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  // Fetch comments for all posts
  const { data: comments = [] } = useQuery({
    queryKey: ['community-comments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles (first_name, last_name, avatar_url)
        `)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    }
  });

  // Create new post
  const createPost = async () => {
    if (!newPostTitle.trim() || !newPostContent.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('community_posts')
      .insert({
        user_id: user.id,
        title: newPostTitle,
        content: newPostContent
      });

    if (error) throw error;

    setNewPostTitle('');
    setNewPostContent('');
    setShowNewPostForm(false);
    queryClient.invalidateQueries({ queryKey: ['community-posts'] });
  };

  // Add comment to post
  const addComment = async (postId: string) => {
    const content = newComment[postId];
    if (!content?.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('comments')
      .insert({
        post_id: postId,
        user_id: user.id,
        content: content
      });

    if (error) throw error;

    setNewComment(prev => ({ ...prev, [postId]: '' }));
    queryClient.invalidateQueries({ queryKey: ['community-comments'] });
  };

  // Get comments for a specific post
  const getCommentsForPost = (postId: string) => {
    return comments.filter((comment: any) => comment.post_id === postId);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">Comunidade</h1>
        <p className="text-gray-400">Conecte-se com outros estudantes e professores</p>
      </div>

      <div className="mb-6">
        {showNewPostForm ? (
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <Input
                placeholder="Título do tópico"
                value={newPostTitle}
                onChange={(e) => setNewPostTitle(e.target.value)}
                className="mb-3 bg-gray-700 border-gray-600 text-white"
              />
              <Textarea
                placeholder="Conteúdo do tópico"
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                className="mb-3 bg-gray-700 border-gray-600 text-white"
                rows={4}
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowNewPostForm(false)}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={createPost}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Publicar
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Button
            onClick={() => setShowNewPostForm(true)}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Tópico
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-6">
          {posts.map((post: any) => {
            const postComments = getCommentsForPost(post.id);
            return (
              <Card key={post.id} className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-start mb-4">
                    <div className="bg-gray-700 rounded-full p-2 mr-3">
                      <User className="h-6 w-6 text-gray-300" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{post.title}</h3>
                      <p className="text-sm text-gray-400">
                        por {post.profiles?.first_name} {post.profiles?.last_name} •{' '}
                        {new Date(post.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-gray-300 mb-4 whitespace-pre-wrap">{post.content}</p>
                  
                  <div className="flex items-center text-sm text-gray-400 mb-4">
                    <Heart className="h-4 w-4 mr-1" />
                    <span className="mr-4">{post.likes || 0} curtidas</span>
                    <MessageCircle className="h-4 w-4 mr-1" />
                    <span>{postComments.length} comentários</span>
                  </div>
                  
                  <div className="border-t border-gray-700 pt-4">
                    <h4 className="text-md font-medium text-white mb-3">Comentários</h4>
                    
                    <div className="space-y-4 mb-4">
                      {postComments.map((comment: any) => (
                        <div key={comment.id} className="flex items-start">
                          <div className="bg-gray-700 rounded-full p-1.5 mr-3">
                            <User className="h-4 w-4 text-gray-300" />
                          </div>
                          <div className="flex-1">
                            <div className="bg-gray-700 rounded-lg p-3">
                              <p className="text-sm font-medium text-white">
                                {comment.profiles?.first_name} {comment.profiles?.last_name}
                              </p>
                              <p className="text-gray-300 text-sm mt-1">{comment.content}</p>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(comment.created_at).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                      ))}
                      
                      {postComments.length === 0 && (
                        <p className="text-gray-500 text-sm text-center py-2">
                          Nenhum comentário ainda. Seja o primeiro a comentar!
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-start">
                      <div className="bg-gray-700 rounded-full p-1.5 mr-3">
                        <User className="h-4 w-4 text-gray-300" />
                      </div>
                      <div className="flex-1 flex">
                        <Input
                          placeholder="Escreva um comentário..."
                          value={newComment[post.id] || ''}
                          onChange={(e) => setNewComment(prev => ({ ...prev, [post.id]: e.target.value }))}
                          className="bg-gray-700 border-gray-600 text-white flex-1 mr-2"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              addComment(post.id);
                            }
                          }}
                        />
                        <Button
                          onClick={() => addComment(post.id)}
                          size="sm"
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          
          {posts.length === 0 && (
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-8 text-center">
                <MessageCircle className="h-16 w-16 text-purple-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Nenhum tópico ainda</h3>
                <p className="text-gray-400 mb-4">
                  Seja o primeiro a iniciar uma discussão na comunidade!
                </p>
                <Button
                  onClick={() => setShowNewPostForm(true)}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Criar Primeiro Tópico
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default CommunityPage;