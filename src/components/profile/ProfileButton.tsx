import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const ProfileButton = ({ onClick }: { onClick?: () => void }) => {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  if (!user) {
    return (
      <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
        <div className="w-6 h-6 bg-gray-600 rounded-full animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="relative group">
      <button
        onClick={onClick}
        className="w-10 h-10 rounded-full ring-1 ring-offset-1 ring-gray-700 overflow-hidden flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 hover:ring-purple-500 transition-all duration-200"
      >
        {user.user_metadata?.avatar_url ? (
          <img
            src={user.user_metadata.avatar_url}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        ) : (
          <User className="h-5 w-5 text-gray-400" />
        )}
      </button>
      
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
        Meu Perfil
      </div>
      
      {/* Dropdown menu */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
        <div className="p-3 border-b border-gray-700">
          <p className="text-sm font-medium text-white truncate">
            {user.user_metadata?.first_name} {user.user_metadata?.last_name}
          </p>
          <p className="text-xs text-gray-400 truncate">
            {user.email}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full px-3 py-2 text-sm text-red-400 hover:bg-red-900/20 flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </div>
    </div>
  );
};

export default ProfileButton;