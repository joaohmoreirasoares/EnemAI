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
import { AccessibilityHelper } from '@/components/accessibility/AccessibilityHelper';

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
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const renderDashboard = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      exit={{ opacity: 0, y: -20 }}
      className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12"
    >
      {/* Left Column: Leaderboard & Stats */}
      <div className="lg:col-span-4 space-y-8">
        <motion.div variants={itemVariants}>
          <Leaderboard />
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 border border-purple-500/30 rounded-2xl p-8 text-center shadow-lg shadow-purple-900/20 backdrop-blur-sm relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <h3 className="text-xl font-bold text-white mb-3 relative z-10">Participe da Comunidade</h3>
          <p className="text-gray-300 mb-6 leading-relaxed relative z-10">
            Compartilhe suas dúvidas, ajude outros estudantes e troque conhecimentos para evoluir nos estudos.
          </p>
          <Button
            className="w-full bg-purple-600 hover:bg-purple-700 text-white h-12 text-lg shadow-lg shadow-purple-500/25 relative z-10 transition-all hover:scale-[1.02]"
            onClick={handleCreateDiscussion}
          >
            <Plus className="h-5 w-5 mr-2" /> Nova Discussão
          </Button>
        </motion.div>
      </div>

      {/* Right Column: Top Discussions & Actions */}
      <div className="lg:col-span-8 space-y-10">
        {/* Quick Actions */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AccessibilityHelper description="Fórum: Acesse todas as discussões da comunidade.">
            <button
              onClick={() => setViewMode('discussions')}
              className="relative p-8 bg-gray-900/60 border border-gray-800 rounded-2xl hover:bg-gray-800/80 hover:border-purple-500/50 transition-all text-left group w-full overflow-hidden shadow-xl"
            >
              <div className="absolute top-0 right-0 p-32 bg-purple-500/5 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-purple-500/10" />

              <div className="relative z-10">
                <div className="h-14 w-14 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-purple-500/20">
                  <MessageSquare className="h-7 w-7 text-purple-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">Fórum de Discussões</h3>
                <p className="text-gray-400 flex items-center text-base">
                  Navegue por {discussions.length} tópicos <ArrowRight className="h-4 w-4 ml-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                </p>
              </div>
            </button>
          </AccessibilityHelper>

          <AccessibilityHelper description="Diretório: Encontre e conecte-se com outros estudantes e professores.">
            <button
              onClick={() => setViewMode('directory')}
              className="relative p-8 bg-gray-900/60 border border-gray-800 rounded-2xl hover:bg-gray-800/80 hover:border-blue-500/50 transition-all text-left group w-full overflow-hidden shadow-xl"
            >
              <div className="absolute top-0 right-0 p-32 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-blue-500/10" />

              <div className="relative z-10">
                <div className="h-14 w-14 rounded-2xl bg-blue-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-blue-500/20">
                  <BookOpen className="h-7 w-7 text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">Diretório de Usuários</h3>
                <p className="text-gray-400 flex items-center text-base">
                  Encontre professores e alunos <ArrowRight className="h-4 w-4 ml-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                </p>
              </div>
            </button>
          </AccessibilityHelper>
        </motion.div>

        {/* Top Discussions Preview */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <Sparkles className="h-6 w-6 text-yellow-500" /> Destaques
            </h2>
            <Button variant="link" onClick={() => setViewMode('discussions')} className="text-purple-400 hover:text-purple-300">
              Ver tudo
            </Button>
          </div>

          <div className="space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => <div key={i} className="h-40 bg-gray-800/30 rounded-2xl animate-pulse" />)}
              </div>
            ) : discussions.slice(0, 3).map((discussion, index) => (
              <motion.div
                key={discussion.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <DiscussionCard
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
              </motion.div>
            ))}
          </div>
        </motion.div>
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
        <AccessibilityHelper description="Voltar: Retorna para o painel principal da comunidade.">
          <Button variant="ghost" onClick={() => setViewMode('dashboard')} className="text-gray-400 hover:text-white">
            ← Voltar
          </Button>
        </AccessibilityHelper>
        <h2 className="text-2xl font-bold text-white">Todas as Discussões</h2>
      </div>

      {/* Search Bar */}
      <AccessibilityHelper description="Busca: Pesquise por tópicos específicos na comunidade.">
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
      </AccessibilityHelper>

      <AccessibilityHelper
        description="Lista de Discussões: Navegue por todos os tópicos criados pela comunidade."
        borderClassName="-inset-4"
      >
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
      </AccessibilityHelper>
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
        <AccessibilityHelper description="Voltar: Retorna para o painel principal da comunidade.">
          <Button variant="ghost" onClick={() => setViewMode('dashboard')} className="text-gray-400 hover:text-white">
            ← Voltar
          </Button>
        </AccessibilityHelper>
        <h2 className="text-2xl font-bold text-white">Diretório de Usuários</h2>
      </div>

      <AccessibilityHelper
        description="Lista de Usuários: Encontre pessoas para seguir e interagir."
        borderClassName="-inset-4"
      >
        <UserDirectory />
      </AccessibilityHelper>
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
          <AccessibilityHelper
            description="Comunidade: Espaço para interação e aprendizado colaborativo."
            borderClassName="-inset-4"
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
          </AccessibilityHelper>

          <div className="flex gap-3">
            <AccessibilityHelper description="Perfil: Visualize e edite seu perfil público.">
              <Button
                onClick={handleProfileClick}
                variant="outline"
                className="bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white backdrop-blur-sm"
              >
                <User className="h-4 w-4 mr-2" />
                Perfil
              </Button>
            </AccessibilityHelper>
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