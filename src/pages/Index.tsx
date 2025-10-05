import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  MessageSquare, 
  FileText, 
  Users, 
  Brain,
  BookOpen,
  Award
} from 'lucide-react';
import { MadeWithDyad } from '@/components/made-with-dyad';

const Index = () => {
  const features = [
    {
      icon: MessageSquare,
      title: "Chat com IA",
      description: "Converse com agentes especializados em cada área do ENEM para tirar dúvidas e revisar conteúdos."
    },
    {
      icon: FileText,
      title: "Anotações Inteligentes",
      description: "Crie e organize suas anotações com um editor rico, tags e exportação para diversos formatos."
    },
    {
      icon: Users,
      title: "Comunidade de Estudos",
      description: "Conecte-se com outros estudantes, compartilhe conhecimento e participe de discussões."
    }
  ];

  const benefits = [
    {
      icon: Brain,
      title: "Aprendizado Personalizado",
      description: "Nossa IA adapta as respostas ao seu nível de conhecimento e estilo de aprendizagem."
    },
    {
      icon: BookOpen,
      title: "Conteúdo Especializado",
      description: "Todo o conteúdo é baseado nas competências e habilidades cobradas no ENEM."
    },
    {
      icon: Award,
      title: "Preparação Eficaz",
      description: "Ferramentas projetadas para maximizar seu desempenho no vestibular."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      {/* Header */}
      <header className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="bg-purple-600 w-10 h-10 rounded-lg flex items-center justify-center mr-3">
              <Brain className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold">Enem AI</h1>
          </div>
          <div className="flex gap-3">
            <Link to="/login">
              <Button variant="outline" className="border-gray-600 text-black hover:bg-gray-800 hover:text-white">
                Entrar
              </Button>
            </Link>
            <Link to="/register">
              <Button className="bg-purple-600 hover:bg-purple-700">
                Começar Agora
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">
            Prepare-se para o ENEM com <span className="text-purple-400">Inteligência Artificial</span>
          </h1>
          <p className="text-xl text-gray-300 mb-10">
            A plataforma completa para estudantes que buscam excelência no vestibular. 
            Chat com IA, anotações inteligentes e comunidade de estudos em um só lugar.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/register">
              <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-lg px-8 py-6">
                Começar Gratuitamente
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="border-gray-600 text-black hover:bg-gray-800 hover:text-white text-lg px-8 py-6">
                Já tenho uma conta
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 bg-gray-800/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Tudo que você precisa em um só lugar</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Ferramentas poderosas para otimizar seus estudos e alcançar o desempenho máximo no ENEM
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-purple-500 transition-colors">
                  <div className="bg-purple-900/30 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="h-8 w-8 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Por que estudar com o Enem AI?</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Nossa plataforma foi desenvolvida com base nas melhores práticas de aprendizagem
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div key={index} className="text-center">
                  <div className="bg-gray-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-8 w-8 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-gray-400">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 bg-gray-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Pronto para transformar seus estudos?</h2>
          <p className="text-gray-300 mb-8 text-lg">
            Junte-se a milhares de estudantes que já estão se preparando para o ENEM com nossa plataforma
          </p>
          <Link to="/register">
            <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-lg px-8 py-6">
              Começar Agora Gratuitamente
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-12 sm:px-6 lg:px-8 border-t border-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-6 md:mb-0">
              <div className="bg-purple-600 w-8 h-8 rounded-lg flex items-center justify-center mr-3">
                <Brain className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold">Enem AI</h2>
            </div>
            <div className="flex flex-col items-center md:items-end">
              <MadeWithDyad />
              <p className="text-gray-500 text-sm mt-2">
                © {new Date().getFullYear()} Enem AI. Todos os direitos reservados.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;