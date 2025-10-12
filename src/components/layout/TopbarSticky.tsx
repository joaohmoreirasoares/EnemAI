import { useState } from 'react';
import { ProfileButton } from '../profile/ProfileButton';
import { ProfileModal } from '../profile/ProfileModal';

const TopbarSticky = () => {
  const [showProfileModal, setShowProfileModal] = useState(false);

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-40 h-12 bg-gray-900/80 backdrop-blur-sm border-b border-gray-800">
        <div className="flex items-center justify-between h-full px-4">
          <div className="flex items-center">
            <h1 className="text-lg font-bold text-purple-400">Enem AI</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-400 hidden md:block">
              Comunidade de Estudos
            </div>
            <ProfileButton onClick={() => setShowProfileModal(true)} />
          </div>
        </div>
      </div>
      
      {showProfileModal && (
        <ProfileModal
          onClose={() => setShowProfileModal(false)}
        />
      )}
    </>
  );
};

export default TopbarSticky;