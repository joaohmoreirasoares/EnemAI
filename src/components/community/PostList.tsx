import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import PostCard from './PostCard';
import { getPosts } from '@/lib/social';

interface PostListProps {
  filterByTag?: string;
  limit?: number;
}

const PostList = ({ filterByTag, limit = 20 }: PostListProps) => {
  const [offset, setOffset] = useState(0);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const { data: initialPosts } = useQuery({
    queryKey: ['posts', filterByTag],
    queryFn: () => getPosts(limit, 0),
  });

  useEffect(() => {
    if (initialPosts) {
      setPosts(initialPosts);
      setOffset(limit);
      setHasMore(initialPosts.length === limit);
    }
  }, [initialPosts, limit]);

  const loadMore = async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const newPosts = await getPosts(limit, offset);
      setPosts(prev => [...prev, ...newPosts]);
      setOffset(prev => prev + limit);
      setHasMore(newPosts.length === limit);
    } catch (error) {
      console.error('Error loading more posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostClick = (post: any) => {
    // Navigate to post detail or open modal
    console.log('Post clicked:', post.id);
  };

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          onClick={() => handlePostClick(post)}
        />
      ))}
      
      {posts.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          Nenhuma postagem encontrada
        </div>
      )}
      
      {hasMore && (
        <div className="text-center py-4">
          <Button
            onClick={loadMore}
            disabled={loading}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            {loading ? 'Carregando...' : 'Carregar mais'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default PostList;