"use client";

import { useState, useEffect } from 'react';
import { Plus, Search, Filter, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ProfileModal from '../components/community/ProfileModal';
import CreateDiscussionModal from '../components/community/CreateDiscussionModal';
import DiscussionCard from '../components/community/DiscussionCard';

const TAGS = [
  'Matemática', 'Português', 'História', 'Geografia', 
  'Física', 'Química', 'Biologia', 'Redação', 
  'Dúvida', 'Estudo', 'Geral'
];

const CommunityPage = () => {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [discussions, setDiscussions] = useState<any[]>([]);

  // Fetch current user
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    getCurrentUser();
  }, []);

  // Fetch discussions
  const { data: discussionsData, isLoading, refetch } = useQuery({
    queryKey: ['discussions', selectedTag, searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('discussions')
        .select(`
          *,
          profiles (
            name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      // Filter by tag if selected
      if (selectedTag) {
        query = query.eq('tag', selectedTag);
      }

      // Filter by search term
      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    }
  });

  useEffect(() => {
    if (discussionsData) {
      setDiscussions(discussionsData);
    }
  }, [discussionsData]);

  const handleCreateDiscussion = async () => {
    setShowCreateModal(true);
  };

  const handleCreateSuccess = () => {
    refetch();
  };

  const handleTagFilter = (tag: string) => {
    setSelectedTag(tag === selectedTag ? '' : tag);
  };

  const handleProfileClick = () => {
    setShowProfileModal(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'há 1 dia';
    if (diffDays < 7) return `há ${diffDays} dias`;
    if (diffDays < 30) return `há ${Math.ceil(diffDays / 7)} semanas`;
    return `há ${Math.ceil(diffDays / 30)} meses`;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Comunidade</h1>
        <p className="text-gray-400">Conecte-se com outros estudantes e professores</p>
      </div>

      {/* Controls */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        {/* Search */}
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
        
        {/* Profile Button */}
        <div className="flex items-center gap-2">
          <Button
            onClick={handleProfileClick}
            variant="outline"
            className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 flex items-center gap-2"
          >
            <User className="h-4 w-4" />
            Meu Perfil
          </Button>
          
          <Button
            onClick={handleCreateDiscussion}
            className="bg-purple-600 hover:bg-purple-700 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Nova Discussão
          </Button>
        </div>
      </div>

      {/* Tag Filters */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-300">Filtrar por:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedTag === '' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleTagFilter('')}
            className={selectedTag === '' ? 'bg-purple-600' : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'}
          >
            Todas
          </Button>
          {TAGS.map((tag) => (
            <Button
              key={tag}
              variant={selectedTag === tag ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleTagFilter(tag)}
              className={selectedTag === tag ? 'bg-purple-600' : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'}
            >
              {tag}
            </Button>
          ))}
        </div>
      </div>

      {/* Discussions List */}
      <div className="flex-1">
        <Card className="bg-gray-800 border-gray-700 h-full">
          <CardContent className="p-0 h-full">
            <ScrollArea className="h-[600px]">
              <div className="p-4">
                {isLoading ? (
                  <div className="text-center py-12 text-gray-400">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p>Carregando discussões...</p>
                  </div>
                ) : discussions.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <p>Nenhuma discussão encontrada</p>
                    <p className="text-sm mt-2">
                      {selectedTag ? `Tente outra tag ou crie uma nova discussão sobre ${selectedTag}` : 'Seja o primeiro a criar um novo tópico!'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {discussions.map((discussion) => (
                      <DiscussionCard
                        key={discussion.id}
                        id={discussion.id}
                        title={discussion.title}
                        content={discussion.content}
                        author={discussion.profiles}
                        tag={discussion.tag}
                        created_at={discussion.created_at}
                        onClick={() => console.log('Discussion clicked:', discussion.id)}
                        onComment={() => console.log('Comment on:', discussion.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        userId={currentUser?.id}
      />
      
      <CreateDiscussionModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
};

export default CommunityPage;