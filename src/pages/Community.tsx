import { useState, useEffect } from 'react';
import { Plus, MessageSquare, Heart, User, Send, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { showError, showSuccess } from '@/utils/toast';

const CommunityPage = () => {
  const [newPost, setNewPost] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('geral');
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const queryClient = useQueryClient();

  // Fetch user profile
  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data;
    }
  });

  // Fetch posts
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['community-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('community_posts')
        .select(`
          *,
          profiles(first_name, last_name, avatar_url)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  // Create new post
  const handleCreatePost = async () => {
    if (!newPost.trim()) return;

    setIsCreatingPost(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('community_posts')
        .insert({
          user_id: user.id,
          title: `Post sobre ${selectedSubject}`,
          content: newPost,
          subject: selectedSubject
        });

      if (error) throw error;

      setNewPost('');
      showSuccess('Post criado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['community-posts'] });
    } catch (error: any) {
      showError(error.message || 'Erro ao criar post');
    } finally {
      setIsCreatingPost(false);
    }
  };

  // Toggle like
  const handleToggleLike = async (postId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Check if user already liked this post
      const { data: existingLike } = await supabase
        .from('post_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single();

      if (existingLike) {
        // Remove like
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('id', existingLike.id);

        if (error) throw error;
      } else {
        // Add like
        const { error } = await supabase
          .from('post_likes')
          .insert({
            post_id: postId,
            user_id: user.id
          });

        if (error) throw error;
      }

      queryClient.invalidateQueries({ queryKey: ['community-posts'] });
    } catch (error: any) {
      showError(error.message || 'Erro ao curtir post');
    }
  };

  // Check if user liked a post
  const hasUserLiked = (postId: string) => {
    const { data: { user } } = supabase.auth.getUser();
    if (!user) return false;

    // This would be implemented with a proper check in a real app
    return false;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">Comunidade</h1>
        <p className="text-gray-400">Conecte-se com outros estudantes e professores</p>
      </div>

      {/* Create post card */}
      <Card className="bg-gray-800 border-gray-700 mb-6">
        <CardHeader>
          <CardTitle className="text-white">Criar novo post</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="subject" className="text-gray-300">Matéria</Label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="geral">Geral</SelectItem>
                  <SelectItem value="matematica">Matemática</SelectItem>
                  <SelectItem value="linguagens">Linguagens</SelectItem>
                  <SelectItem value="ciencias-natureza">Ciências da Natureza</SelectItem>
                  <SelectItem value="ciencias-humanas">Ciências Humanas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="content" className="text-gray-300">Conteúdo</Label>
              <textarea
                id="content"
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="Compartilhe suas dúvidas, ideias ou ajude outros estudantes..."
                className="w-full h-32 p-3 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            <div className="flex justify-end">
              <Button 
                onClick={handleCreatePost}
                disabled={!newPost.trim() || isCreatingPost}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isCreatingPost ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Criar Post
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts list */}
      <div className="flex-1">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
          </div>
        ) : posts.length === 0 ? (
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-8 text-center">
              <MessageSquare className="h-16 w-16 text-purple-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Nenhum post ainda</h3>
              <p className="text-gray-400">
                Seja o primeiro a compartilhar algo com a comunidade!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {posts.map((post: any) => (
              <Card key={post.id} className="bg-gray-800 border-gray-700 community-post">
                <CardContent className="p-4">
                  <div className="flex items-start">
                    <div className="bg-gray-700 rounded-full w-10 h-10 flex items-center justify-center mr-3 flex-shrink-0">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-white">
                            {post.profiles?.first_name} {post.profiles?.last_name}
                          </h3>
                          <p className="text-xs text-gray-400">
                            {new Date(post.created_at).toLocaleDateString('pt-BR')} • {post.subject}
                          </p>
                        </div>
                        <span className="bg-purple-900 text-purple-300 text-xs px-2 py-1 rounded-full">
                          {post.subject}
                        </span>
                      </div>
                      
                      <div className="mt-3">
                        <p className="text-gray-300 whitespace-pre-wrap">{post.content}</p>
                      </div>
                      
                      <div className="flex items-center mt-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleLike(post.id)}
                          className={`like-button ${hasUserLiked(post.id) ? 'text-red-500 active' : 'text-gray-400 hover:text-red-500'}`}
                        >
                          <Heart className="h-4 w-4 mr-1" />
                          Curtir
                        </Button>
                        <span className="text-xs text-gray-400 ml-2">
                          {post.likes || 0} {post.likes === 1 ? 'curtida' : 'curtidas'}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityPage;