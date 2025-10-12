import { Link, useLocation } from 'react-router-dom';
import { 
  MessageSquare, 
  FileText, 
  Users, 
  LogOut,
  Home,
  User
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';

const Sidebar = () => {
  const location = useLocation();

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data;
    }
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const navItems = [
    { name: 'Chat IA', href: '/chat', icon: MessageSquare },
    { name: 'Anotações', href: '/notes', icon: FileText },
    { name: 'Comunidade', href: '/community', icon: Users },
    { name: 'Meu Perfil', href: '/profile', icon: User },
  ];

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white w-48 border-r border-gray-800">
      <div className="p-3 border-b border-gray-800">
        <div className="flex items-center">
          
          <h1 className="text-lg font-bold text-purple-400">Enem AI</h1>
        </div>
        {profile && (
          <p className="text-xs text-gray-400 mt-1">
            {profile.name || profile.first_name} {profile.last_name}
          </p>
        )}
      </div>
      
      <nav className="flex-1 p-2">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <li key={item.name}>
                <Link
                  to={item.href}
                  className={`flex items-center p-2 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-purple-900 text-white' 
                      : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  <span className="text-sm">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="p-3 border-t border-gray-800">
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          <span className="text-sm">Sair</span>
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;