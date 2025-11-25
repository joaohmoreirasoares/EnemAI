import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Filter } from 'lucide-react';
import DiscussionCard from './DiscussionCard';
import TagSelector from './TagSelector';

const TAGS = [
  'Matemática', 'Português', 'História', 'Geografia', 
  'Física', 'Química', 'Biologia', 'Redação', 
  'Dúvida', 'Estudo', 'Geral'
];

const AllDiscussionsTab = ({ currentUser }: { currentUser: any }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const navigate = useNavigate();

  const { data: discussions, isLoading, refetch } = useQuery({
    queryKey: ['discussions', selectedTags, searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('discussions')
        .select(`*, profiles (*)`)
        .order('created_at', { ascending: false });

      if (selectedTags.length > 0) {
        query = query.in('tag', selectedTags);
      }

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  });

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag) 
        : [...prev, tag]
    );
  };

  const handleDeleteDiscussion = async (discussionId: string) => {
    const { error } = await supabase.from('discussions').delete().eq('id', discussionId);
    if (error) {
      console.error('Error deleting discussion:', error);
    } else {
      refetch();
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar em todas as discussões..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-card border-border"
            />
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filtrar por Tags:</span>
        </div>
        <TagSelector 
          tags={TAGS} 
          selectedTags={selectedTags} 
          onTagToggle={handleTagToggle} 
        />
      </div>

      <div className="flex-1">
        <ScrollArea className="h-[600px] pr-4">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Carregando discussões...</p>
            </div>
          ) : discussions?.length === 0 ? (
            <div className="text-center py-12">
              <p>Nenhuma discussão encontrada</p>
              <p className="text-sm text-muted-foreground mt-2">Tente refinar sua busca ou crie uma nova discussão.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {discussions?.map((discussion) => (
                <DiscussionCard
                  key={discussion.id}
                  id={discussion.id}
                  title={discussion.title}
                  content={discussion.content}
                  author={discussion.profiles!}
                  tag={discussion.tag}
                  created_at={discussion.created_at}
                  onClick={() => navigate(`/discussion/${discussion.id}`)}
                  onComment={() => navigate(`/discussion/${discussion.id}`)}
                  onDelete={handleDeleteDiscussion}
                  isOwnDiscussion={currentUser?.id === discussion.author_id}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
};

export default AllDiscussionsTab;
