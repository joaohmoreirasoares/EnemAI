"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MessageSquare, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { openOrCreateConversation } from '@/lib/social';

interface ProfileModalProps {
  onClose: () => void;
  userId?: string; // Add prop for viewing other users' profiles
}

const ProfileModal = ({ onClose, userId }: ProfileModalProps) => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    getCurrentUser();
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId && !currentUser) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const targetUserId = userId || currentUser?.id;
        if (!targetUserId) return;

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', targetUserId)
          .single();

        if (error) throw error;
        setProfile(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('Não foi possível carregar as informações do perfil');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [userId, currentUser]);

  const handleChat = async () => {
    if (!currentUser || !profile) return;
    
    setLoading(true);
    try {
      const conversationId = await openOrCreateConversation(currentUser.id, profile.id);
      onClose();
      navigate(`/chat/${conversationId}`);
    } catch (error) {
      console.error('Error opening conversation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewProfile = () => {
    if (profile) {
      onClose();
      navigate(`/profile/${profile.id}`);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <Card className="bg-gray-800 border-gray-700 w-full max-w-md">
          <CardContent className="p-6">
            <div className="text-center text-white">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p>Carregando perfil...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <Card className="bg-gray-800 border-gray-700 w-full max-w-md">
          <CardContent className="p-6">
            <div className="text-center text-red-400">
              <p>{error}</p>
              <Button 
                onClick={onClose} 
                className="mt-4 bg-purple-600 hover:bg-purple-700"
              >
                Fechar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="bg-gray-800 border-gray-700 w-full max-w-md">
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-xl font-semibold text-white">
              {userId ? 'Perfil do Usuário' : 'Meu Perfil'}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </Button>
          </div>
          
          <div className="flex flex-col items-center text-center">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center mb-4">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User className="h-10 w-10 text-white" />
              )}
            </div>
            
            {/* Nome completo */}
            <h3 className="text-lg font-semibold text-white mb-1">
              {profile?.first_name} {profile?.last_name}
            </h3>
            
            {/* Email - only show for own profile */}
            {!userId && profile?.email && (
              <p className="text-sm text-gray-400 mb-2">
                {profile.email}
              </p>
            )}
            
            {/* Papel/Role */}
            {profile?.role && (
              <div className="mb-3">
                <span className="inline-block px-2 py-1 text-xs font-medium bg-purple-600 text-white rounded-full">
                  {profile.role === 'student' ? 'Estudante' : 
                   profile.role === 'teacher' ? 'Professor' : 
                   profile.role === 'admin' ? 'Administrador' : profile.role}
                </span>
              </div>
            )}
            
            {/* Bio */}
            {profile?.bio && (
              <p className="text-gray-300 text-sm mb-6 max-w-xs">
                {profile.bio}
              </p>
            )}
            
            {/* Data de cadastro */}
            {profile?.created_at && (
              <p className="text-xs text-gray-500 mb-4">
                Membro desde {new Date(profile.created_at).toLocaleDateString('pt-BR')}
              </p>
            )}
            
            {/* Ações - only show for other users' profiles */}
            {userId && currentUser && currentUser.id !== profile?.id && (
              <div className="flex gap-3 w-full">
                <Button
                  onClick={handleChat}
                  disabled={loading}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  {loading ? 'Abrindo...' : 'Conversar'}
                </Button>
                <Button
                  onClick={handleViewProfile}
                  variant="outline"
                  className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Ver Perfil
                </Button>
              </div>
            )}
            
            {/* Close button for own profile */}
            {!userId && (
              <Button
                onClick={onClose}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white"
              >
                Fechar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileModal;