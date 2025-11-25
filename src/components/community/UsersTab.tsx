import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, MessageSquare, Loader2, User } from 'lucide-react';
import { openOrCreateConversation } from '../../lib/social';
import { toast } from 'sonner';

const UsersTab = ({ currentUser }: { currentUser: any }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingConversation, setLoadingConversation] = useState<string | null>(null);
  const navigate = useNavigate();

  const { data: profiles, isLoading } = useQuery({
    queryKey: ['all_profiles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('*');
      if (error) {
        console.error('Error fetching profiles:', error);
        throw error;
      }
      console.log('Fetched profiles:', data);
      return data || [];
    }
  });

  const handleStartConversation = async (targetUserId: string) => {
    if (!currentUser) {
      toast.error('Você precisa estar logado para iniciar uma conversa.');
      return;
    }
    setLoadingConversation(targetUserId);
    try {
      const conversationId = await openOrCreateConversation(currentUser.id, targetUserId);
      navigate(`/chat/${conversationId}`);
    } catch (error) {
      toast.error('Erro ao iniciar a conversa. Tente novamente.');
      console.error(error);
    } finally {
      setLoadingConversation(null);
    }
  };

  const getInitials = (name: string | undefined) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  const filteredProfiles = profiles
    ?.filter(p => p.id !== currentUser?.id) // Exclude current user
    .filter(p => 
      p.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.username?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Encontre Usuários</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou usuário..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-card border-border"
          />
        </div>
      </div>

      <ScrollArea className="h-[700px] pr-4">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Carregando usuários...</p>
          </div>
        ) : filteredProfiles?.length === 0 ? (
          <div className="text-center py-12">
            <p>Nenhum usuário encontrado.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProfiles?.map(profile => (
              <Card key={profile.id} className="p-4 flex flex-col items-center text-center">
                <Avatar className="w-20 h-20 mb-4 border-2 border-primary">
                  <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
                  <AvatarFallback><User className="w-8 h-8"/></AvatarFallback>
                </Avatar>
                <p className="font-bold text-lg">{profile.full_name}</p>
                <p className="text-sm text-muted-foreground">@{profile.username}</p>
                <Badge variant={profile.role === 'student' ? 'default' : 'secondary'} className="mt-2">
                  {profile.role === 'student' ? 'Estudante' : 'Professor'}
                </Badge>
                <Button 
                  className="mt-4 w-full"
                  onClick={() => handleStartConversation(profile.id)}
                  disabled={loadingConversation === profile.id}
                >
                  {loadingConversation === profile.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <MessageSquare className="h-4 w-4 mr-2" />
                  )}
                  {loadingConversation === profile.id ? 'Iniciando...' : 'Conversar'}
                </Button>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default UsersTab;
