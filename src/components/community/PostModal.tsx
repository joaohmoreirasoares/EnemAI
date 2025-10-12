import { useState, useEffect } from 'react';
import { X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import CommentList from './CommentList';
import { getPostById, createComment } from '@/lib/social';
import { supabase } from '@/integrations/supabase/client';

interface PostModalProps {
  postId?: string;
  onClose: () => void;
  onCreatePost?: (title: string, body: string, tags: string[]) => Promise<void>;
}

const PostModal = ({ postId, onClose, onCreatePost }: PostModalProps) => {
  const [post, setPost] = useState<any>(null);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    getCurrentUser();
  }, []);

  useEffect(() => {
    if (postId) {
      const fetchPost = async () => {
        try {
          const postData = await getPostById(postId);
          setPost(postData);
        } catch (error) {
          console.error('Error fetching post:', error);
        }
      };
      fetchPost();
    }
  }, [postId]);

  const handleCommentSubmit = async () => {
    if (!newComment.trim() || !post || !currentUser) return;

    setLoading(true);
    try {
      await createComment({
        post_id: post.id,
        author_id: currentUser.id,
        body: newComment
      });
      setNewComment('');
    } catch (error) {
      console.error('Error creating comment:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!post) return null;

  const tags = post.tags || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="bg-gray-800 border-gray-700 w-full max-w-4xl max-h-[90vh] flex flex-col">
        <CardContent className="p-0 flex-1 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-700 flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={post.profiles?.avatar_url} />
                  <AvatarFallback>
                    {post.profiles?.first_name?.[0]}{post.profiles?.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                
                <div>
                  <p className="font-medium text-gray-200">
                    {post.profiles?.first_name} {post.profiles?.last_name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(post.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
              
              <h2 className="text-xl font-semibold text-white mb-2">
                {post.title}
              </h2>
              
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {tags.map((tag: any, index: number) => (
                    <Badge 
                      key={index} 
                      variant="secondary"
                      className="text-xs bg-gray-700 text-gray-300"
                    >
                      #{tag.name}
                    </Badge>
                  ))}
                </div>
              )}
              
              {post.body && (
                <p className="text-gray-300 whitespace-pre-wrap">
                  {post.body}
                </p>
              )}
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-white p-1"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Comments section */}
          <div className="flex-1 overflow-y-auto p-4">
            <CommentList postId={post.id} />
          </div>
          
          {/* Comment input */}
          <div className="p-4 border-t border-gray-700">
            <div className="flex gap-2">
              <Input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Adicione um comentário..."
                className="bg-gray-700 border-gray-600 text-white"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleCommentSubmit();
                  }
                }}
              />
              <Button
                onClick={handleCommentSubmit}
                disabled={!newComment.trim() || loading}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PostModal;