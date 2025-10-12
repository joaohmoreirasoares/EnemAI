"use client";

import { useState } from 'react';
import { MessageCircle, Heart, Share2, MoreVertical } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import CommentSection from './CommentSection';

interface PostItemProps {
  post: {
    id: string;
    title: string;
    body?: string;
    created_at: string;
    profiles: {
      first_name: string;
      last_name: string;
      avatar_url?: string;
    };
    tags?: Array<{
      name: string;
    }>;
  };
  currentUser?: any;
}

const PostItem = ({ post, currentUser }: PostItemProps) => {
  const [showComments, setShowComments] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  const handleLike = async () => {
    if (!currentUser) return;
    
    setLiked(!liked);
    setLikesCount(prev => liked ? prev - 1 : prev + 1);
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
    <Card className="bg-gray-800 border-gray-700 mb-4">
      <CardContent className="p-4">
        {/* Header com info do usuário */}
        <div className="flex items-center mb-4">
          <Avatar className="h-10 w-10 mr-3">
            <AvatarImage src={post.profiles.avatar_url} alt={post.profiles.first_name} />
            <AvatarFallback>
              {post.profiles.first_name?.[0]}{post.profiles.last_name?.[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-white">
                {post.profiles.first_name} {post.profiles.last_name}
              </span>
              <span className="text-gray-400 text-sm">•</span>
              <span className="text-gray-400 text-sm">{formatDate(post.created_at)}</span>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>

        {/* Conteúdo do post */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-white mb-2">{post.title}</h3>
          {post.body && (
            <p className="text-gray-300 mb-3">{post.body}</p>
          )}
          
          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="bg-gray-700 text-gray-300">
                  #{tag.name}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Ações do post */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-700">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`flex items-center gap-1 ${liked ? 'text-red-500' : 'text-gray-400 hover:text-white'}`}
            >
              <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
              <span>{likesCount}</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowComments(!showComments)}
              className="text-gray-400 hover:text-white flex items-center gap-1"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Comentários</span>
            </Button>
            
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Seção de comentários */}
        {showComments && (
          <div className="mt-4 pt-4 border-t border-gray-700">
            <CommentSection postId={post.id} currentUser={currentUser} />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PostItem;