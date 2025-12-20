import { DynamicWave } from '@/components/DynamicWave';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import {
  Bot,
  Brain,
  Users,
  Accessibility,
  CheckCircle,
  Sparkles,
  Github,
  Mail,
  ChevronRight
} from 'lucide-react';
import ScrollCard from '@/components/ui/scroll-card';
import LivingEcosystem from '@/components/landing/LivingEcosystem';

export default function Index() {
  return (
    <div className="min-h-screen bg-gray-950 text-white selection:bg-purple-500/30 overflow-x-hidden">
      <div className="fixed inset-0 z-0">
        <DynamicWave className="w-full h-full" strokeColor="rgba(139, 92, 246, 0.3)" backgroundColor="transparent" />
      </div>

      {/* Navigation / Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-gray-900/20 backdrop-blur-lg border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-tr from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">EnemAI</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login">
            <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-white/10">
              Entrar
            </Button>
          </Link>
          <Link to="/register">
            <Button className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/20">
              Começar Agora
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-32 pb-20 px-4 md:px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm mb-8 animate-fade-in">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
          </span>
          Nova versão disponível com KIAra 2.0
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400 max-w-4xl">
          Revolucione seus estudos para o ENEM com <span className="text-purple-400">Inteligência Artificial</span>
        </h1>

        <p className="text-xl text-gray-400 mb-10 max-w-2xl leading-relaxed">
          Anotações inteligentes, comunidade ativa e a tutora KIAra ao seu lado para guiar sua jornada rumo à aprovação.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link to="/register">
            <Button size="lg" className="w-full sm:w-auto h-12 px-8 text-lg bg-white text-black hover:bg-gray-200 transition-all">
              Criar conta grátis
              <ChevronRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
          <Link to="/login">
            <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 px-8 text-lg border-gray-700 hover:bg-gray-800 hover:text-white backdrop-blur-sm bg-gray-900/30">
              Já tenho conta
            </Button>
          </Link>
        </div>
      </section>

      {/* KIAra Spotlight Section */}
      <section className="relative z-10 py-20 px-4 md:px-6">
        <div className="max-w-6xl mx-auto bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
          <div className="grid md:grid-cols-2 gap-12 p-8 md:p-12 items-center">
            <div className="space-y-6">
              <div className="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center border border-purple-500/30">
                <Bot className="w-6 h-6 text-purple-400" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold">Conheça a KIAra</h2>
              <p className="text-lg text-gray-400 leading-relaxed">
                Sua tutora virtual disponível 24/7. A KIAra não apenas responde perguntas, ela entende seu contexto de estudo, sugere tópicos e corrige suas redações com precisão cirúrgica.
              </p>
              <ul className="space-y-3">
                {[
                  'Tire dúvidas instantaneamente',
                  'Correção detalhada de redações',
                  'Recomendações personalizadas de estudo'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-300">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative h-[400px] bg-gray-950/50 rounded-2xl border border-white/5 p-6 flex flex-col">
              {/* Mock Chat Interface */}
              <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-4">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-xs font-bold">K</div>
                <div>
                  <div className="font-semibold text-sm">KIAra</div>
                  <div className="text-xs text-green-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span> Online
                  </div>
                </div>
              </div>
              <div className="space-y-4 flex-1 overflow-hidden relative">
                <div className="bg-gray-800/50 p-3 rounded-lg rounded-tl-none max-w-[85%] text-sm text-gray-300">
                  Olá! Como posso ajudar nos seus estudos de hoje?
                </div>
                <div className="bg-purple-600/20 border border-purple-500/20 p-3 rounded-lg rounded-tr-none max-w-[85%] ml-auto text-sm text-white">
                  Estou com dúvida em Estequiometria, pode me explicar?
                </div>
                <div className="bg-gray-800/50 p-3 rounded-lg rounded-tl-none max-w-[85%] text-sm text-gray-300">
                  Claro! Estequiometria é o cálculo das quantidades de reagentes e produtos em uma reação química. Vamos começar pelo básico: o balanceamento de equações...
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-gray-950/50 to-transparent"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Living Ecosystem Section */}
      <LivingEcosystem />

      {/* Scroll Card Section */}
      <section className="relative z-10 py-10">
        <ScrollCard />
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-gray-950 py-12 px-4 md:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold">EnemAI</span>
          </div>

          <div className="flex items-center gap-6 text-sm text-gray-400">
            <a href="#" className="hover:text-white transition-colors">Sobre</a>
            <a href="#" className="hover:text-white transition-colors">Privacidade</a>
            <a href="#" className="hover:text-white transition-colors">Termos</a>
            <a href="#" className="hover:text-white transition-colors">Contato</a>
          </div>

          <div className="flex items-center gap-4">
            <a href="https://github.com/joaohmoreirasoares" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-white">
              <Github className="w-5 h-5" />
            </a>
            <a href="mailto:joaohms329@gmail.com" className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-white">
              <Mail className="w-5 h-5" />
            </a>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-8 text-center text-xs text-gray-600">
          © 2024 EnemAI. Desenvolvido com 💜 para a educação.
        </div>
      </footer>
    </div>
  );
}