import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CommentListProps {
  postId: string;
}

interface Comment {
  id: string;
  body: string;
  created_at: string;
  profiles: {
    first_name: string;
    last_name: string;
    avatar_url?: string;
  };
  parent_comment_id?: string;
  replies?: Comment[];
}

const CommentList = ({ postId }: CommentListProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  const { data } = useQuery({
    queryKey: ['comments', postId],
    queryFn: () => getCommentsByPost(postId),
  });

  useEffect(() => {
    if (data) {
      const structuredComments = structureComments(data);
      setComments(structuredComments);
      setLoading(false);
    }
  }, [data]);

  const structureComments = (flatComments: any[]): Comment[] => {
    const commentMap = new Map();
    const rootComments: Comment[] = [];

    // Create map of all comments
    flatComments.forEach(comment => {
      commentMap.set(comment.id, {
        ...comment,
        replies: []
      });
    });

    // Build tree structure
    flatComments.forEach(comment => {
      const structuredComment = commentMap.get(comment.id);
      if (comment.parent_comment_id) {
        const parent = commentMap.get(comment.parent_comment_id);
        if (parent) {
          parent.replies?.push(structuredComment);
        }
      } else {
        rootComments.push(structuredComment);
      }
    });

    return rootComments;
  };

  const CommentItem = ({ comment, level = 0 }: { comment: Comment; level?: number }) => (
    <div className={`${level > 0 ? 'ml-6 border-l-2 border-gray-700 pl-4' : ''}`}>
      <div className="flex gap-3 mb-4">
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarImage src={comment.profiles.avatar_url} />
          <AvatarFallback>
            {comment.profiles.first_name?.[0]}{comment.profiles.last_name?.[0]}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-gray-200">
              {comment.profiles.first_name} {comment.profiles.last_name}
            </span>
            <span className="text-xs text-gray-400">
              {formatDistanceToNow(new Date(comment.created_at), { 
                addSuffix: true, 
                locale: ptBR 
              })}
            </span>
          </div>
          
          <p className="text-gray-300 text-sm whitespace-pre-wrap">
            {comment.body}
          </p>
          
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-3 space-y-3">
              {comment.replies.map((reply) => (
                <CommentItem key={reply.id} comment={reply} level={level + 1} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3">
            <div className="w-8 h-8 bg-gray-700 rounded-full animate-pulse"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-700 rounded animate-pulse w-1/3"></div>
              <div className="h-3 bg-gray-700 rounded animate-pulse w-full"></div>
              <div className="h-3 bg-gray-700 rounded animate-pulse w-2/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="font-semibold text-white mb-4">Comentários</h3>
      
      {comments.length === 0 ? (
        <p className="text-gray-400 text-center py-8">
          Seja o primeiro a comentar!
        </p>
      ) : (
        comments.map((comment) => (
          <CommentItem key={comment.id} comment={comment} />
        ))
      )}
    </div>
  );
};

// Helper function to fetch comments
async function getCommentsByPost(postId: string) {
  const { data, error } = await supabase
    .from('comments')
    .select(`
      *,
      profiles (first_name, last_name, avatar_url)
    `)
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error('Failed to fetch comments');
  }

  return data;
}

export default CommentList;