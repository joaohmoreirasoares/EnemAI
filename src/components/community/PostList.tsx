"use client";

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import PostItem from './PostItem';

interface PostListProps {
  currentUser?: any;
  filterByTag?: string;
}

const PostList = ({ currentUser, filterByTag }: PostListProps) => {
  const { data: posts, isLoading } = useQuery({
    queryKey: ['community-posts', filterByTag],
    queryFn: async () => {
      let query = supabase
        .from('posts')
        .select(`
          *,
          profiles (first_name, last_name, avatar_url),
          post_tags (tag_id),
          tags (name)
        `)
        .order('created_at', { ascending: false });

      if (filterByTag) {
        query = query.contains('tags', [{ name: filterByTag }]);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return (
      <div className="text-center py-8 text-gray-400">
        Carregando discussões...
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <p>Nenhuma discussão encontrada</p>
        <p className="text-sm mt-2">Seja o primeiro a criar um novo tópico!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostItem
          key={post.id}
          post={post}
          currentUser={currentUser}
        />
      ))}
    </div>
  );
};

export default PostList;