"use client";

import { useState } from 'react';
import { MessageCircle, Clock, User, MoreVertical, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DiscussionCardProps {
  id: string;
  title: string;
  content?: string;
  author: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  tag: string;
  created_at: string;
  onClick?: () => void;
  onComment?: () => void;
  onDelete?: (id: string) => void;
  isOwnDiscussion?: boolean;
}

const TAG_COLORS: Record<string, string> = {
  'Matemática': 'bg-blue-600',
  'Português': 'bg-pink-600',
  'História': 'bg-amber-600',
  'Geografia': 'bg-emerald-600',
  'Física': 'bg-violet-600',
  'Química': 'bg-rose-600',
  'Biologia': 'bg-green-600',
  'Redação': 'bg-yellow-600',
  'Dúvida': 'bg-slate-600',
  'Estudo': 'bg-sky-600',
  'Geral': 'bg-gray-600'
};

const DiscussionCard = ({ 
  id, 
  title, 
  content, 
  author, 
  tag, 
  created_at, 
  onClick,
  onComment,
  onDelete,
  isOwnDiscussion = false
}: DiscussionCardProps) => {
  const [showFullContent, setShowFullContent] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const contentPreview = content ? 
    (content.length > 150 ? content.substring(0, 150) + '...' : content) : 
    '';

  const handleCardClick = () => {
    if (onClick) {
      onClick();
    } else {
      // Default behavior - could navigate to discussion detail
      console.log('Discussion clicked:', id);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true, 
        locale: ptBR 
      });
    } catch {
      return new Date(dateString).toLocaleDateString('pt-BR');
    }
  };

  // Função para obter as iniciais do nome do autor com fallback
  const getAuthorInitials = (name: string | undefined) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    onDelete?.(id);
  };

  return (
    <Card 
      className="bg-gray-800 border-gray-700 hover:bg-gray-750 cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/10"
      onClick={handleCardClick}
    >
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <Avatar className="w-10 h-10 flex-shrink-0">
            <AvatarImage src={author.avatar_url} alt={author.name} />
            <AvatarFallback>
              {getAuthorInitials(author.name)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-gray-200 truncate">
                {author.name || 'Usuário'}
              </span>
              <span className="text-gray-500">•</span>
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDate(created_at)}
              </span>
            </div>
            
            {/* Tag */}
            <Badge 
              variant="secondary"
              className={`${TAG_COLORS[tag] || TAG_COLORS['Geral']} text-white text-xs`}
            >
              {tag}
            </Badge>
          </div>

          {/* Menu dropdown */}
          {isOwnDiscussion && (
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
                    <button
                      onClick={handleDeleteClick}
                      className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-900/20 flex items-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Excluir
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="font-semibold text-white mb-2 line-clamp-2">
          {title}
        </h3>

        {/* Content Preview */}
        {contentPreview && (
          <div className="mb-3">
            <p className="text-gray-300 text-sm line-clamp-3">
              {contentPreview}
              {content && content.length > 150 && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowFullContent(!showFullContent);
                  }}
                  className="text-purple-400 hover:text-purple-300 ml-1 text-xs font-medium"
                >
                  {showFullContent ? 'Ver menos' : 'Ler mais'}
                </button>
              )}
            </p>
            {showFullContent && content && (
              <p className="text-gray-300 text-sm mt-2">
                {content}
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-700">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onComment?.();
            }}
            className="text-gray-400 hover:text-white flex items-center gap-1"
          >
            <MessageCircle className="h-4 w-4" />
            <span>Comentar</span>
          </Button>
          
          <div className="text-xs text-gray-500">
            Discussão
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DiscussionCard;