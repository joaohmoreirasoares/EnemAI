import { useState } from 'react';
import { MessageCircle, MoreVertical, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PostCardProps {
  post: any;
  onClick?: () => void;
  onMenuClick?: (e: React.MouseEvent) => void;
}

const PostCard = ({ post, onClick, onMenuClick }: PostCardProps) => {
  const [showMenu, setShowMenu] = useState(false);

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
    onMenuClick?.(e);
  };

  const tags = post.tags || [];

  return (
    <Card 
      className="bg-gray-800 border-gray-700 hover:bg-gray-750 cursor-pointer transition-colors"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="w-10 h-10 flex-shrink-0">
            <AvatarImage src={post.profiles?.avatar_url} />
            <AvatarFallback>
              {post.profiles?.first_name?.[0]}{post.profiles?.last_name?.[0]}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-gray-200">
                {post.profiles?.first_name} {post.profiles?.last_name}
              </span>
              <span className="text-gray-500">•</span>
              <span className="text-sm text-gray-400 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDistanceToNow(new Date(post.created_at), { 
                  addSuffix: true, 
                  locale: ptBR 
                })}
              </span>
            </div>
            
            <h3 className="font-semibold text-white mb-2 line-clamp-2">
              {post.title}
            </h3>
            
            {post.body && (
              <p className="text-gray-300 text-sm mb-3 line-clamp-3">
                {post.body}
              </p>
            )}
            
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {tags.map((tag: any, index: number) => (
                  <Badge 
                    key={index} 
                    variant="secondary"
                    className="text-xs bg-gray-700 text-gray-300 hover:bg-gray-600"
                  >
                    #{tag.name}
                  </Badge>
                ))}
              </div>
            )}
            
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-1">
                <MessageCircle className="h-4 w-4" />
                <span>0 comentários</span>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMenuClick}
              className="text-gray-400 hover:text-white p-1 h-8 w-8"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
            
            {showMenu && (
              <div className="absolute right-0 top-8 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10">
                <div className="py-1">
                  <button className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700">
                    Reportar
                  </button>
                  {post.author_id === 'current-user-id' && (
                    <>
                      <button className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700">
                        Editar
                      </button>
                      <button className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-900/20">
                        Excluir
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PostCard;