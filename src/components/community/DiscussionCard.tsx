import { MessageSquare, Trash2, Link as LinkIcon, Share2 } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion } from 'framer-motion';

interface DiscussionCardProps {
  id: string;
  title: string;
  content: string;
  author: {
    name: string;
    avatar_url: string;
  };
  tag: string;
  created_at: string;
  onClick: () => void;
  onComment: () => void;
  onDelete: (id: string) => void;
  isOwnDiscussion: boolean;
}

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
  isOwnDiscussion
}: DiscussionCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className="bg-gray-900/50 backdrop-blur-md border-gray-800 hover:bg-gray-800/60 hover:border-purple-500/40 transition-all duration-300 cursor-pointer overflow-hidden group shadow-lg hover:shadow-purple-500/10"
        onClick={onClick}
      >
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3 pt-6 px-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12 border-2 border-gray-800 ring-2 ring-transparent group-hover:ring-purple-500/30 transition-all shadow-md">
              <AvatarImage src={author?.avatar_url} />
              <AvatarFallback className="bg-gradient-to-br from-purple-900 to-indigo-900 text-white font-bold">
                {author?.name?.substring(0, 2).toUpperCase() || 'AN'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-base font-semibold text-gray-200 group-hover:text-white transition-colors">
                {author?.name || 'Anônimo'}
              </p>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                {formatDistanceToNow(new Date(created_at), { addSuffix: true, locale: ptBR })}
              </p>
            </div>
          </div>
          <span className="inline-flex items-center rounded-full bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-400 border border-purple-500/20 shadow-sm">
            {tag}
          </span>
        </CardHeader>
        <CardContent className="px-6 pb-4">
          <h3 className="text-xl font-bold text-gray-100 mb-3 group-hover:text-purple-300 transition-colors line-clamp-1">
            {title}
          </h3>
          <p className="text-sm text-gray-400 line-clamp-3 leading-relaxed">
            {content}
          </p>
        </CardContent>
        <CardFooter className="flex justify-between pt-4 pb-6 px-6 border-t border-gray-800/50 mt-2 bg-gray-900/30">
          <div className="flex gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-purple-400 hover:bg-purple-500/10 gap-2 h-9 px-4 rounded-full transition-all"
              onClick={(e) => { e.stopPropagation(); onComment(); }}
            >
              <MessageSquare className="h-4 w-4" />
              <span className="text-xs font-medium">Responder</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 gap-2 h-9 px-4 rounded-full transition-all"
              onClick={(e) => { e.stopPropagation(); }}
            >
              <LinkIcon className="h-4 w-4" />
              <span className="text-xs font-medium">Vincular Nota</span>
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-gray-500 hover:text-white hover:bg-gray-700 rounded-full"
              onClick={(e) => { e.stopPropagation(); }}
            >
              <Share2 className="h-4 w-4" />
            </Button>
            {isOwnDiscussion && (
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(id);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default DiscussionCard;