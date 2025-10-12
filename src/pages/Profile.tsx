import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, User } from 'lucide-react';
import PostList from '../components/community/PostList';
import { openOrCreateConversation } from '../lib/social';

const ProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const { data: posts } = useQuery({
    queryKey: ['user-posts', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          post_tags (tag_id),
          tags (name)
        `)
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
              <h2 className="text-2xl font-bold text-white mb-2">
                {profile.first_name} {profile.last_name}
              </h2>
              <p className="text-gray-400 mb-4">{profile.email}</p>
              
              {profile.bio && (
                <p className="text-gray-300 mb-6 max-w-2xl">
                  {profile.bio}
                </p>
              )}
              
              <div className="flex flex-wrap gap-2 mb-6">
                <Badge variant="secondary" className="bg-gray-700 text-gray-300">
                  Matemática
                </Badge>
                <Badge variant="secondary" className="bg-gray-700 text-gray-300">
                  ENEM 2024
                </Badge>
                <Badge variant="secondary" className="bg-gray-700 text-gray-300">
                  Dicas
                </Badge>
              </div>
              
              {currentUser?.id !== profile.id && (
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

      {/* User posts */}
      <div className="flex-1">
        <h3 className="text-xl font-semibold text-white mb-4">Publicações</h3>
        <PostList filterByTag="" />
      </div>
    </div>
  );
};

export default ProfilePage;