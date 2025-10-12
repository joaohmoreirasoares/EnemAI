import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, User, Edit, Calendar } from 'lucide-react';
import ProfileModal from '../components/community/ProfileModal';
import { openOrCreateConversation } from '../lib/social';

const ProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);

  const { data: discussions } = useQuery({
    queryKey: ['user-discussions', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('discussions')
        .select('*')
        .eq('author_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    getCurrentUser();
  }, []);

  useEffect(() => {
    if (id) {
      const fetchProfile = async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          navigate('/404');
          return;
        }

        setProfile(data);
        setLoading(false);
      };
      fetchProfile();
    }
  }, [id, navigate]);

  const handleChat = async () => {
    if (!currentUser || !profile) return;

    try {
      const conversationId = await openOrCreateConversation(currentUser.id, profile.id);
      navigate(`/chat/${conversationId}`);
    } catch (error) {
      console.error('Error opening conversation:', error);
    }
  };

  const handleEditProfile = () => {
    setShowEditModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-8 text-gray-400">
        Perfil não encontrado
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === profile.id;

  return (
    <div className="flex flex-col h-full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Perfil</h1>
        <p className="text-gray-400">Informações e publicações do usuário</p>
      </div>

      {/* Profile header */}
      <Card className="bg-gray-800 border-gray-700 mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center flex-shrink-0">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User className="h-12 w-12 text-white" />
              )}
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold text-white">
                  {profile.name || profile.first_name} {profile.last_name}
                </h2>
                {isOwnProfile && (
                  <Button
                    onClick={handleEditProfile}
                    size="sm"
                    variant="outline"
                    className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                )}
              </div>
              
              <p className="text-gray-400 mb-4">{profile.email}</p>
              
              {/* Series */}
              {profile.serie && (
                <div className="mb-3">
                  <span className="text-sm text-gray-400">Série:</span>
                  <span className="ml-2 text-white font-medium">{profile.serie}</span>
                </div>
              )}
              
              {/* Subjects */}
              {profile.subjects && profile.subjects.length > 0 && (
                <div className="mb-3">
                  <span className="text-sm text-gray-400">Matérias Favoritas:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {profile.subjects.map((subject: string, index: number) => (
                      <Badge key={index} variant="secondary" className="bg-gray-700 text-gray-300 text-xs">
                        {subject}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Career Goal */}
              {profile.career_goal && (
                <div className="mb-4">
                  <span className="text-sm text-gray-400">Curso Desejado:</span>
                  <p className="text-white mt-1">{profile.career_goal}</p>
                </div>
              )}
              
              {/* Created Date */}
              {profile.created_at && (
                <div className="flex items-center gap-1 text-sm text-gray-500 mb-4">
                  <Calendar className="h-4 w-4" />
                  Membro desde {new Date(profile.created_at).toLocaleDateString('pt-BR')}
                </div>
              )}
              
              {/* Actions */}
              {!isOwnProfile && (
                <Button
                  onClick={handleChat}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Conversar
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User discussions */}
      <div className="flex-1">
        <h3 className="text-xl font-semibold text-white mb-4">Minhas Discussões</h3>
        {discussions && discussions.length > 0 ? (
          <div className="space-y-4">
            {discussions.map((discussion) => (
              <Card key={discussion.id} className="bg-gray-800 border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-white mb-1">{discussion.title}</h4>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className="bg-gray-700 text-gray-300">
                          {discussion.tag}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(discussion.created_at).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      {discussion.content && (
                        <p className="text-gray-300 text-sm line-clamp-2">
                          {discussion.content}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-8 text-center">
              <p className="text-gray-400">
                {isOwnProfile ? 'Você ainda não criou nenhuma discussão.' : 'Este usuário ainda não criou nenhuma discussão.'}
              </p>
              {isOwnProfile && (
                <Button 
                  onClick={() => navigate('/community')}
                  className="mt-4 bg-purple-600 hover:bg-purple-700"
                >
                  Criar Primeira Discussão
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <ProfileModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          userId={currentUser?.id}
        />
      )}
    </div>
  );
};

export default ProfilePage;