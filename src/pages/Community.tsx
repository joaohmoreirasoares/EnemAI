"use client";

import { useState, useEffect } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import TopbarSticky from '../components/layout/TopbarSticky';
import PostList from '../components/community/PostList';
import PostModal from '../components/community/PostModal';
import { createPost } from '../lib/social';

const CommunityPage = () => {
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'recent' | 'my-discussions'>('recent');
  const [currentUser, setCurrentUser] = useState<any>(null);

  const { data: posts } = useQuery({
    queryKey: ['community-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles (first_name, last_name, avatar_url),
          post_tags (tag_id),
          tags (name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    getCurrentUser();
  }, []);

  const handleCreatePost = async (title: string, body: string, tags: string[]) => {
    if (!currentUser) return;

    try {
      await createPost({
        author_id: currentUser.id,
        title,
        body,
        tags
      });
      setShowNewPostModal(false);
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const filteredPosts = posts?.filter((post: any) =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (post.body && post.body.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  return (
    <div className="flex flex-col h-full">
      <TopbarSticky />
      
      <div className="flex flex-col gap-6 flex-1 pt-12">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Comunidade</h1>
          <p className="text-gray-400">Conecte-se com outros estudantes e professores</p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar discussões..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-700 border-gray-600 text-white"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={filter === 'recent' ? 'default' : 'outline'}
              onClick={() => setFilter('recent')}
              className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
            >
              Recentes
            </Button>
            <Button
              variant={filter === 'my-discussions' ? 'default' : 'outline'}
              onClick={() => setFilter('my-discussions')}
              className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
            >
              Minhas Discussões
            </Button>
          </div>
          
          <Button
            onClick={() => setShowNewPostModal(true)}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Tópico
          </Button>
        </div>

        {/* Posts list */}
        <div className="flex-1">
          <Card className="bg-gray-800 border-gray-700 h-full">
            <CardContent className="p-0 h-full">
              <ScrollArea className="h-[600px]">
                <div className="p-4">
                  {filteredPosts.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                      <p>Nenhuma discussão encontrada</p>
                      <p className="text-sm mt-2">Seja o primeiro a criar um novo tópico!</p>
                    </div>
                  ) : (
                    <PostList currentUser={currentUser} />
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* New Post Modal */}
      {showNewPostModal && (
        <PostModal
          isOpen={showNewPostModal}
          onClose={() => setShowNewPostModal(false)}
          onCreatePost={handleCreatePost}
        />
      )}
    </div>
  );
};

export default CommunityPage;