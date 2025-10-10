import { useState } from 'react';
import { Button } from '@/components/ui/button';

const ChatPage = () => {
  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold text-white mb-6">Chat IA</h1>
      <div className="bg-gray-800 rounded-lg p-6">
        <p className="text-gray-400">Interface do chat será implementada aqui...</p>
        <Button className="mt-4 bg-purple-600 hover:bg-purple-700">
          Iniciar Conversa
        </Button>
      </div>
    </div>
  );
};

export default ChatPage;