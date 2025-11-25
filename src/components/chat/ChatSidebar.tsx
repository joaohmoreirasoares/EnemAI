import { motion } from 'framer-motion';
import { MessageSquare, Flame, Calendar, Clock, Trash2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChatStats } from '@/lib/streak';

interface ChatSidebarProps {
    conversations: any[];
    activeConversationId: string | null;
    onSelectConversation: (id: string) => void;
    onDeleteConversation: (id: string) => void;
    stats: ChatStats;
    onCreateNew: () => void;
}

const ChatSidebar = ({
    conversations,
    activeConversationId,
    onSelectConversation,
    onDeleteConversation,
    stats,
    onCreateNew
}: ChatSidebarProps) => {
    return (
        <div className="w-full md:w-80 flex flex-col h-full bg-gray-900/50 border-r border-gray-800">
            {/* Stats Section */}
            <div className="p-4 grid grid-cols-2 gap-3 border-b border-gray-800">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-3 flex flex-col items-center justify-center"
                >
                    <div className="flex items-center gap-1 text-purple-400 mb-1">
                        <Flame className="h-4 w-4" />
                        <span className="text-xs font-bold uppercase">Streak</span>
                    </div>
                    <span className="text-2xl font-bold text-white">{stats.streakDays}</span>
                    <span className="text-[10px] text-gray-400">dias seguidos</span>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-3 flex flex-col items-center justify-center"
                >
                    <div className="flex items-center gap-1 text-blue-400 mb-1">
                        <MessageSquare className="h-4 w-4" />
                        <span className="text-xs font-bold uppercase">Total</span>
                    </div>
                    <span className="text-2xl font-bold text-white">{stats.totalChats}</span>
                    <span className="text-[10px] text-gray-400">conversas</span>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="col-span-2 bg-gray-800/50 border border-gray-700 rounded-xl p-3 flex items-center justify-between"
                >
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-green-500/10 rounded-lg">
                            <Calendar className="h-4 w-4 text-green-400" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-400">Hoje</span>
                            <span className="text-sm font-bold text-white">{stats.chatsToday} chats criados</span>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* New Chat Button */}
            <div className="p-4 pb-2">
                <Button
                    onClick={onCreateNew}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg shadow-purple-900/20"
                >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Nova Conversa
                </Button>
            </div>

            {/* Conversations List */}
            <ScrollArea className="flex-1 px-2">
                <div className="space-y-1 p-2">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3 px-2">Histórico</h3>
                    {conversations.map((conv, index) => (
                        <motion.div
                            key={conv.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="group relative"
                        >
                            <button
                                onClick={() => onSelectConversation(conv.id)}
                                className={`w-full text-left p-3 rounded-xl transition-all duration-200 flex items-start gap-3 ${activeConversationId === conv.id
                                        ? 'bg-gray-800 text-white shadow-md border border-gray-700'
                                        : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'
                                    }`}
                            >
                                <MessageSquare className={`h-4 w-4 mt-1 flex-shrink-0 ${activeConversationId === conv.id ? 'text-purple-400' : 'text-gray-600'
                                    }`} />
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-medium truncate ${activeConversationId === conv.id ? 'text-white' : 'text-gray-300'
                                        }`}>
                                        {conv.title || 'Nova Conversa'}
                                    </p>
                                    <div className="flex items-center gap-1 mt-1">
                                        <Clock className="h-3 w-3 text-gray-600" />
                                        <span className="text-[10px] text-gray-500">
                                            {formatDistanceToNow(new Date(conv.updated_at), { addSuffix: true, locale: ptBR })}
                                        </span>
                                    </div>
                                </div>
                            </button>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteConversation(conv.id);
                                }}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </motion.div>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
};

export default ChatSidebar;
