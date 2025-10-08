import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function Index() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 p-4">
      <LiquidEther colors={['#8B5CF6', '#A855F7', '#C084FC']} />
      
      <div className="relative z-10 text-center max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 tracking-tight">
            Enem AI
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Plataforma completa para preparação para o ENEM com inteligência artificial, anotações inteligentes e comunidade de estudos
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link to="/register">
            <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white text-lg px-8 py-3">
              Começar Agora
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="outline" className="border-gray-800 text-black hover:bg-gray-900 hover:text-white text-lg px-8 py-3">
              Entrar
            </Button>
          </Link>
        </div>
        
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
              <MessageSquare className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Chat com IA</h3>
            <p className="text-gray-300">
              Converse com agentes especializados em cada área do ENEM e obtenha respostas personalizadas
            </p>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Anotações Inteligentes</h3>
            <p className="text-gray-300">
              Crie, organize e exporte suas anotações com ferramentas avançadas de edição
            </p>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Comunidade</h3>
            <p className="text-gray-300">
              Conecte-se com outros estudantes e professores para compartilhar conhecimento
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

import { MessageSquare, FileText, Users } from 'lucide-react';
import LiquidEther from '@/components/LiquidEther';