import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { MessageSquare, FileText, Users, Star, Award, BookOpen, Target } from 'lucide-react';
import LiquidEther from '@/components/LiquidEther';
import { StickyScroll } from '@/components/ui/sticky-scroll-reveal';

export default function Index() {
  const content = [
    {
      title: "Chat com IA Especializada",
      description: "Converse com agentes inteligentes especializados em cada área do ENEM. Obtenha explicações detalhadas, resolução de exercícios e simulados personalizados com feedback instantâneo. Nossos modelos de IA foram treinados especificamente para o contexto do ENEM, garantindo respostas precisas e relevantes para sua preparação.",
      content: (
        <div className="h-full w-full bg-[linear-gradient(to_bottom_right,var(--cyan-500),var(--emerald-500))] flex flex-col items-center justify-center text-white p-6">
          <div className="text-center">
            <MessageSquare className="h-16 w-16 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Inteligência Artificial</h3>
            <p className="text-lg">Especializada em ENEM</p>
          </div>
        </div>
      ),
    },
    {
      title: "Anotações Inteligentes",
      description: "Crie anotações organizadas com tags, exporte para PDF, e utilize ferramentas de edição avançadas. Sistema de salvamento automático e busca inteligente. Suas anotações são sincronizadas em tempo real e podem ser acessadas de qualquer dispositivo, permitindo que você continue seus estudos onde parou.",
      content: (
        <div className="h-full w-full bg-[linear-gradient(to_bottom_right,var(--pink-500),var(--indigo-500))] flex flex-col items-center justify-center text-white p-6">
          <div className="text-center">
            <FileText className="h-16 w-16 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Anotações</h3>
            <p className="text-lg">Inteligentes e Organizadas</p>
          </div>
        </div>
      ),
    },
    {
      title: "Comunidade de Estudos",
      description: "Conecte-se com estudantes e professores. Partilhe materiais, participe de discussões e construa uma rede de apoio para sua jornada de estudos. Troque experiências, resolva dúvidas coletivas e encontre parceiros de estudo para alcançar seus objetivos juntos.",
      content: (
        <div className="h-full w-full bg-[linear-gradient(to_bottom_right,var(--orange-500),var(--yellow-500))] flex flex-col items-center justify-center text-white p-6">
          <div className="text-center">
            <Users className="h-16 w-16 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Comunidade</h3>
            <p className="text-lg">Conecte-se e Aprenda</p>
          </div>
        </div>
      ),
    },
    {
      title: "Plataforma Completa",
      description: "Tudo o que você precisa para se preparar para o ENEM em um único lugar. Desde o chat com IA até anotações inteligentes e comunidade, nossa plataforma oferece uma experiência integrada que acompanha sua jornada de estudos do início ao fim.",
      content: (
        <div className="h-full w-full bg-[linear-gradient(to_bottom_right,var(--purple-500),var(--violet-500))] flex flex-col items-center justify-center text-white p-6">
          <div className="text-center">
            <Award className="h-16 w-16 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Solução Completa</h3>
            <p className="text-lg">Para seu Sucesso no ENEM</p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 p-4">
      <LiquidEther colors={['#8B5CF6', '#A855F7', '#C084FC']} />
      
      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="min-h-screen flex flex-col justify-center items-center text-center">
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
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left mb-16">
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

        {/* Full screen sticky scroll section */}
        <div className="min-h-screen">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Conheça Nossas Funcionalidades</h2>
          <div className="h-[100vh]">
            <StickyScroll content={content} />
          </div>
        </div>

        {/* Contact Section */}
        <div className="mt-20 bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700 mb-16">
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