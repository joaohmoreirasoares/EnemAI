import { useState, useEffect } from 'react';
import { Plus, Search, User, Sparkles, Users, LayoutDashboard, MessageSquare, BookOpen, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import ProfileModal from '../components/community/ProfileModal';
import CreateDiscussionModal from '../components/community/CreateDiscussionModal';
import DiscussionCard from '../components/community/DiscussionCard';
import { Leaderboard } from '../components/community/Leaderboard';
import { UserDirectory } from '../components/community/UserDirectory';

const TAGS = [
  'Matemática', 'Português', 'História', 'Geografia',
  'Física', 'Química', 'Biologia', 'Redação',
  'Dúvida', 'Estudo', 'Geral'
];

type ViewMode = 'dashboard' | 'discussions' | 'directory';

const CommunityPage = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [discussions, setDiscussions] = useState<any[]>([]);
  const navigate = useNavigate();

  // Fetch current user
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    getCurrentUser();
  }, []);

  // Fetch discussions
  const { data: discussionsData, isLoading, refetch } = useQuery({
    queryKey: ['discussions', selectedTags, searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('discussions')
        .select(`
          *,
          profiles (
            id,
            name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      // Filter by tags if any selected
      if (selectedTags.length > 0) {
        query = query.in('tag', selectedTags);
      }

      // Filter by search term
      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    }
  });

  useEffect(() => {
    if (discussionsData) {
      setDiscussions(discussionsData);
    }
  }, [discussionsData]);

  const handleCreateDiscussion = async () => {
    setShowCreateModal(true);
  };

  const handleCreateSuccess = () => {
    refetch();
  };

  const handleProfileClick = () => {
    setShowProfileModal(true);
  };

  const handleDeleteDiscussion = async (discussionId: string) => {
    try {
      const { error } = await supabase
        .from('discussions')
        .delete()
        .eq('id', discussionId);

      if (error) throw error;
      setDiscussions(prev => prev.filter(discussion => discussion.id !== discussionId));
      alert('Discussão excluída com sucesso!');
    } catch (error: any) {
      console.error('Error deleting discussion:', error);
      alert('Erro ao excluir discussão. Tente novamente.');
    }
  };

  const handleDiscussionClick = (discussionId: string) => {
    navigate(`/discussion/${discussionId}`);
  };

  // Render Dashboard View
  const renderDashboard = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="grid grid-cols-1 lg:grid-cols-12 gap-8"
    >
      {/* Left Column: Leaderboard & Stats */}
      <div className="lg:col-span-4 space-y-6">
        <Leaderboard />

        <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/20 rounded-xl p-6 text-center">
          <h3 className="text-lg font-bold text-white mb-2">Contribua e Ganhe</h3>
          <p className="text-sm text-gray-400 mb-4">
            Ajude outros estudantes e ganhe <span className="text-purple-400 font-bold">Brain Points</span> para subir no ranking!
          </p>
          <Button
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            onClick={handleCreateDiscussion}
          >
            <Plus className="h-4 w-4 mr-2" /> Nova Discussão
          </Button>
        </div>
      </div>

      {/* Right Column: Top Discussions & Actions */}
      <div className="lg:col-span-8 space-y-6">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => setViewMode('discussions')}
            className="p-6 bg-gray-800/40 border border-gray-700/50 rounded-xl hover:bg-gray-800/60 hover:border-purple-500/30 transition-all text-left group"
          >
            <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4 group-hover:bg-purple-500/20 transition-colors">
              <MessageSquare className="h-5 w-5 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">Todas as Discussões</h3>
            <p className="text-sm text-gray-400 flex items-center">
              Navegue por {discussions.length} tópicos <ArrowRight className="h-3 w-3 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
            </p>
          </button>

          <button
            onClick={() => setViewMode('directory')}
            className="p-6 bg-gray-800/40 border border-gray-700/50 rounded-xl hover:bg-gray-800/60 hover:border-blue-500/30 transition-all text-left group"
          >
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
              <BookOpen className="h-5 w-5 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">Diretório de Usuários</h3>
            <p className="text-sm text-gray-400 flex items-center">
              Encontre professores e alunos <ArrowRight className="h-3 w-3 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
            </p>
          </button>
        </div>

        {/* Top Discussions Preview */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-500" /> Destaques
          </h2>
          <div className="space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => <div key={i} className="h-32 bg-gray-800/30 rounded-xl animate-pulse" />)}
              </div>
            ) : discussions.slice(0, 3).map((discussion, index) => (
              <DiscussionCard
                key={discussion.id}
                id={discussion.id}
                title={discussion.title}
                content={discussion.content}
                author={discussion.profiles}
                tag={discussion.tag}
                created_at={discussion.created_at}
                onClick={() => handleDiscussionClick(discussion.id)}
                onComment={() => handleDiscussionClick(discussion.id)}
                onDelete={handleDeleteDiscussion}
                isOwnDiscussion={currentUser?.id === discussion.author_id}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );

  // Render All Discussions View
  const renderDiscussions = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => setViewMode('dashboard')} className="text-gray-400 hover:text-white">
          ← Voltar
        </Button>
        <h2 className="text-2xl font-bold text-white">Todas as Discussões</h2>
      </div>

      {/* Search Bar */}
      <div className="relative group max-w-2xl">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Pesquisar tópicos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 h-12 bg-gray-900/80 border-gray-700 text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500/50 transition-all"
          />
        </div>
      </div>

      <div className="space-y-4">
        {discussions.map((discussion) => (
          <DiscussionCard
            key={discussion.id}
            id={discussion.id}
            title={discussion.title}
            content={discussion.content}
            author={discussion.profiles}
            tag={discussion.tag}
            created_at={discussion.created_at}
            onClick={() => handleDiscussionClick(discussion.id)}
            onComment={() => handleDiscussionClick(discussion.id)}
            onDelete={handleDeleteDiscussion}
            isOwnDiscussion={currentUser?.id === discussion.author_id}
          />
        ))}
      </div>
    </motion.div>
  );

  // Render Directory View
  const renderDirectory = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => setViewMode('dashboard')} className="text-gray-400 hover:text-white">
          ← Voltar
        </Button>
        <h2 className="text-2xl font-bold text-white">Diretório de Usuários</h2>
      </div>

      <UserDirectory />
    </motion.div>
  );

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-gray-900 to-gray-950 overflow-y-auto">
      <div className="max-w-7xl mx-auto w-full p-6 md:p-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4"
        >
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <Users className="h-8 w-8 text-purple-400" />
              Comunidade
            </h1>
            <p className="text-gray-400 text-lg">
              Conecte-se, aprenda e evolua com a rede.
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleProfileClick}
              variant="outline"
              className="bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white backdrop-blur-sm"
            >
              <User className="h-4 w-4 mr-2" />
              Perfil
            </Button>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {viewMode === 'dashboard' && renderDashboard()}
          {viewMode === 'discussions' && renderDiscussions()}
          {viewMode === 'directory' && renderDirectory()}
        </AnimatePresence>

      </div>

      {/* Modals */}
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        userId={currentUser?.id}
      />

      <CreateDiscussionModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
};

export default CommunityPage;