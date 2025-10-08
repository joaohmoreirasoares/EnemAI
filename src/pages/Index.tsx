import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function Index() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      <LiquidEther colors={['#8B5CF6', '#A855F7', '#C084FC']} />
      
      <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-500 to-purple-400 bg-clip-text text-transparent">
            Enem AI
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8">
            Sua plataforma completa de preparação para o ENEM com inteligência artificial
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">🤖</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Chat com IA</h3>
            <p className="text-gray-400">
              Converse com agentes especializados em cada área do ENEM e obtenha respostas instantâneas
            </p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">📝</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Anotações Inteligentes</h3>
            <p className="text-gray-400">
              Crie, organize e exporte suas anotações com ferramentas avançadas de edição
            </p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">👥</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Comunidade</h3>
            <p className="text-gray-400">
              Conecte-se com outros estudantes e professores para compartilhar conhecimento
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link to="/register">
            <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg">
              Começar Agora
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="outline" className="border-gray-800 text-black hover:bg-gray-900 hover:text-white px-8 py-3 text-lg">
              Entrar
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

import LiquidEther from '@/components/LiquidEther';