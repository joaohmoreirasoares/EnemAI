import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MessageSquare, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { openOrCreateConversation } from '@/lib/social';

interface ProfileModalProps {
  onClose: () => void;
}

const ProfileModal = ({ onClose }: ProfileModalProps) => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    getCurrentUser();
  }, []);

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="bg-gray-800 border-gray-700 w-full max-w-md">
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-xl font-semibold text-white">Perfil</h2>
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
            
            <h3 className="text-lg font-semibold text-white mb-1">
              {profile?.first_name} {profile?.last_name}
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              {profile?.email}
            </p>
            
            {profile?.bio && (
              <p className="text-gray-300 text-sm mb-6 max-w-xs">
                {profile.bio}
              </p>
            )}
            
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileModal;