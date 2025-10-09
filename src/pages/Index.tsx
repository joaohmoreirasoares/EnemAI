import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import CircularGallery from '@/components/CircularGallery';

export default function Index() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 p-4">
      <LiquidEther colors={['#8B5CF6', '#A855F7', '#C084FC']} />
      
      <div className="relative z-10 text-center max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 tracking-tight">
            Enem AI
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
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
        
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
              <MessageSquare className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Chat com IA</h3>
            <p className="text-gray-300">
              Converse com agentes especializados em cada área do ENEM. Obtenha explicações detalhadas, 
              resolução de exercícios e simulados personalizados com feedback instantâneo.
            </p>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Anotações Inteligentes</h3>
            <p className="text-gray-300">
              Crie anotações organizadas com tags, exporte para PDF, e utilize ferramentas de 
              edição avançadas. Sistema de salvamento automático e busca inteligente.
            </p>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Comunidade</h3>
            <p className="text-gray-300">
              Conecte-se com estudantes e professores. Partilhe materiais, participe de 
              discussões e construa uma rede de apoio para sua jornada de estudos.
            </p>
          </div>
        </div>

        {/* Testimonials Section with Circular Gallery */}
        <div className="mt-20">
          <h2 className="text-4xl font-bold text-white mb-12 text-center">O que nossos alunos dizem</h2>
          <div className="h-96">
            <CircularGallery
              items={[
                {
                  image: 'placeholder',
                  text: '"O chat da IA me ajudou a entender conceitos difíceis de Matemática que eu nunca tinha conseguido antes. Minha nota melhorou 200 pontos em 3 meses!" - Ana Silva'
                },
                {
                  image: 'placeholder',
                  text: '"As anotações inteligentes organizam meu estudo de forma incrível. Consigo encontrar qualquer conteúdo rapidamente e exportar resumos perfeitos para revisão." - Carlos Mendes'
                },
                {
                  image: 'placeholder',
                  text: '"A plataforma é fantástica para meus alunos. Eles têm acesso a explicações 24/7 e a comunidade ajuda muito no aprendizado colaborativo." - Prof. Maria Santos'
                },
                {
                  image: 'placeholder',
                  text: '"Finalmente consegui entender Redação! A IA me dá feedbacks detalhados que meus professores não tinham tempo para dar." - Pedro Oliveira'
                },
                {
                  image: 'placeholder',
                  text: '"O sistema de simulados personalizados me ajudou a identificar minhas fraquezas e focar no que realmente importava para o ENEM." - Juliana Costa'
                }
              ]}
              bend={3}
              textColor="#ffffff"
              borderRadius={0.05}
              font="bold 24px Figtree"
              scrollSpeed={2}
              scrollEase={0.05}
            />
          </div>
        </div>

        {/* Contact Section */}
        <div className="mt-20 bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">Entre em contato</h2>
          <p className="text-gray-300 mb-8 text-center max-w-2xl mx-auto">
              Tem dúvidas, sugestões ou quer contribuir com o projeto? Fale conosco!
          </p>
          <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
            <div className="flex items-center text-gray-300">
              <span className="text-2xl mr-3">📧</span>
              <span>joaohms329@gmail.com</span>
            </div>
            <div className="flex items-center text-gray-300">
              <span className="text-2xl mr-3">💻</span>
              <a href="https://github.com/joaohmoreirasoares" target="_blank" rel="noopener noreferrer" 
                 className="hover:text-purple-400 transition-colors">
                github.com/joaohmoreirasoares
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { MessageSquare, FileText, Users } from 'lucide-react';
import LiquidEther from '@/components/LiquidEther';