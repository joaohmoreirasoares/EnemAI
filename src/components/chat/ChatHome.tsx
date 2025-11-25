import { motion } from 'framer-motion';
import { MessageSquare, Flame, Calendar, Plus, ArrowRight, Clock, Trash2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChatStats } from '@/lib/streak';

interface ChatHomeProps {
    conversations: any[];
    onSelectConversation: (id: string) => void;
    onDeleteConversation: (id: string) => void;
    stats: ChatStats;
    onCreateNew: () => void;
}

const ChatHome = ({
    conversations,
    onSelectConversation,
    onDeleteConversation,
    stats,
    onCreateNew
}: ChatHomeProps) => {
    return (
        <div className="flex flex-col h-full bg-gradient-to-b from-gray-900 to-gray-950 p-6 md:p-10 overflow-hidden">
            <div className="max-w-5xl mx-auto w-full flex flex-col h-full">

                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
                        Olá, Estudante!
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Pronto para aprender algo novo hoje?
                    </p>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6 flex items-center gap-4 hover:bg-gray-800/80 transition-colors"
                    >
                        <div className="p-3 bg-orange-500/10 rounded-xl">
                            <Flame className="h-8 w-8 text-orange-500" />
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">Streak</p>
                            <p className="text-3xl font-bold text-white">{stats.streakDays} <span className="text-sm font-normal text-gray-500">dias</span></p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6 flex items-center gap-4 hover:bg-gray-800/80 transition-colors"
                    >
                        <div className="p-3 bg-blue-500/10 rounded-xl">
                            <MessageSquare className="h-8 w-8 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">Total de Chats</p>
                            <p className="text-3xl font-bold text-white">{stats.totalChats}</p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6 flex items-center gap-4 hover:bg-gray-800/80 transition-colors"
                    >
                        <div className="p-3 bg-green-500/10 rounded-xl">
                            <Calendar className="h-8 w-8 text-green-500" />
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">Hoje</p>
                            <p className="text-3xl font-bold text-white">{stats.chatsToday} <span className="text-sm font-normal text-gray-500">novos</span></p>
                        </div>
                    </motion.div>
                </div>

                {/* Action & Recent List */}
                <div className="flex-1 flex flex-col min-h-0">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                            <Clock className="h-5 w-5 text-gray-400" />
                            Recentes
                        </h2>
                        <Button
                            onClick={onCreateNew}
                            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg shadow-purple-900/20 rounded-full px-6"
                        >
                            <Plus className="h-5 w-5 mr-2" />
                            Nova Conversa
                        </Button>
                    </div>

                    <ScrollArea className="flex-1 -mx-2 px-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-10">
                            {/* New Chat Card (Alternative entry) */}
                            <motion.button
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.4 }}
                                onClick={onCreateNew}
                                className="group flex flex-col items-center justify-center h-40 rounded-2xl border-2 border-dashed border-gray-700 hover:border-purple-500/50 hover:bg-purple-500/5 transition-all duration-300"
                            >
                                <div className="h-12 w-12 rounded-full bg-gray-800 group-hover:bg-purple-500/20 flex items-center justify-center mb-3 transition-colors">
                                    <Plus className="h-6 w-6 text-gray-400 group-hover:text-purple-400" />
                                </div>
                                <span className="text-gray-400 group-hover:text-purple-300 font-medium">Iniciar nova conversa</span>
                            </motion.button>

                            {conversations.map((conv, index) => (
                                <motion.div
                                    key={conv.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.4 + (index * 0.05) }}
                                    className="group relative"
                                >
                                    <Card
                                        onClick={() => onSelectConversation(conv.id)}
                                        className="h-40 p-5 bg-gray-800/40 border-gray-700/50 hover:bg-gray-800 hover:border-gray-600 transition-all duration-300 cursor-pointer flex flex-col justify-between group-hover:shadow-xl group-hover:shadow-purple-900/10"
                                    >
                                        <div>
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="p-2 bg-purple-500/10 rounded-lg">
                                                    <MessageSquare className="h-5 w-5 text-purple-400" />
                                                </div>
                                                <span className="text-xs text-gray-500 font-medium bg-gray-900/50 px-2 py-1 rounded-full">
                                                    {formatDistanceToNow(new Date(conv.updated_at), { addSuffix: true, locale: ptBR })}
                                                </span>
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-200 group-hover:text-white line-clamp-2 transition-colors">
                                                {conv.title || 'Nova Conversa'}
                                            </h3>
                                        </div>

                                        <div className="flex justify-between items-center mt-2">
                                            <span className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors">
                                                {conv.messages?.length || 0} mensagens
                                            </span>
                                            <div className="flex items-center text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300">
                                                <span className="text-sm font-medium mr-1">Abrir</span>
                                                <ArrowRight className="h-4 w-4" />
                                            </div>
                                        </div>
                                    </Card>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDeleteConversation(conv.id);
                                        }}
                                        className="absolute top-4 right-4 p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200"
                                        title="Excluir conversa"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
            </div>
        </div>
    );
};

export default ChatHome;
