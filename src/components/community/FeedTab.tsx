import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import DiscussionCard from './DiscussionCard';
import { ScrollArea } from '@/components/ui/scroll-area';

const FeedTab = ({ currentUser }: { currentUser: any }) => {
  const navigate = useNavigate();

  const { data: discussions, isLoading } = useQuery({
    queryKey: ['feed_discussions'],
    queryFn: async () => {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      
      const { data, error } = await supabase
        .from('discussions')
        .select(`*, profiles (*)`)
        .gte('created_at', sevenDaysAgo)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data || [];
    }
  });

  return (
    <div className="h-full flex flex-col">
        <h2 className="text-xl font-semibold mb-4">Destaques da Semana</h2>
        <ScrollArea className="h-[700px] pr-4">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Carregando feed...</p>
            </div>
          ) : discussions?.length === 0 ? (
            <div className="text-center py-12">
              <p>Sem discussões nos últimos 7 dias.</p>
              <p className="text-sm text-muted-foreground mt-2">Que tal iniciar uma nova discussão?</p>
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
                  isOwnDiscussion={currentUser?.id === discussion.author_id}
                />
              ))}
            </div>
          )}
        </ScrollArea>
    </div>
  );
};

export default FeedTab;
