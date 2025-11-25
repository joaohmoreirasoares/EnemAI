'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, FileText, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const ChatDemo = () => (
  <div className="bg-gray-900/70 p-4 rounded-lg border border-gray-700 h-full flex flex-col shadow-lg">
    <div className="flex-grow space-y-4">
      <div className="flex gap-2 items-end">
        <div className="w-8 h-8 rounded-full bg-purple-600 flex-shrink-0 flex items-center justify-center text-white font-bold text-sm">AI</div>
        <div className="bg-gray-800 p-3 rounded-lg max-w-[80%]">
          <p className="text-sm text-gray-300">Olá! Como posso te ajudar a se preparar para o ENEM hoje?</p>
        </div>
      </div>
      <div className="flex gap-2 justify-end items-end">
        <div className="bg-blue-600 p-3 rounded-lg max-w-[80%]">
          <p className="text-sm text-white">Me explique o que foi a Revolução Industrial.</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-blue-800 flex-shrink-0 flex items-center justify-center text-white font-bold text-sm">Você</div>
      </div>
    </div>
    <div className="mt-4 flex gap-2">
      <input type="text" placeholder="Digite sua pergunta..." className="flex-grow bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none cursor-not-allowed" disabled />
      <Link to="/register">
        <Button>Começar</Button>
      </Link>
    </div>
  </div>
);

const NotesDemo = () => (
  <div className="bg-gray-900/70 p-4 rounded-lg border border-gray-700 h-full flex flex-col shadow-lg">
    <div className="flex-grow bg-gray-800 rounded-t-lg p-4 border-b border-gray-700">
      <h4 className="font-bold text-white mb-2">Revolução Industrial</h4>
      <p className="text-sm text-gray-300 line-clamp-4">A Revolução Industrial foi um período de grandes mudanças tecnológicas, sociais e econômicas que começou na Grã-Bretanha no século XVIII e se espalhou pelo mundo. Caracterizou-se pela transição de métodos de produção artesanais para a manufatura por máquinas, o que aumentou drasticamente a produção de bens.</p>
    </div>
    <div className="bg-gray-800 rounded-b-lg p-2 flex justify-end items-center">
      <span className="text-xs text-gray-400 mr-4">Salvo automaticamente</span>
      <Link to="/register">
        <Button>Salvar Anotação</Button>
      </Link>
    </div>
  </div>
);

const CommunityDemo = () => (
  <div className="bg-gray-900/70 p-4 rounded-lg border border-gray-700 h-full flex flex-col shadow-lg">
    <div className="bg-gray-800 p-4 rounded-lg mb-4">
      <div className="flex items-center mb-2">
        <div className="w-8 h-8 rounded-full bg-green-600 flex-shrink-0 mr-2 flex items-center justify-center text-white font-bold">M</div>
        <span className="font-semibold text-white">Maria Clara</span>
      </div>
      <p className="text-sm text-gray-300">Alguém tem um bom resumo sobre a Segunda Guerra Mundial? Estou com dificuldade em entender as alianças.</p>
    </div>
     <div className="bg-gray-800 p-4 rounded-lg mb-4 opacity-60">
      <div className="flex items-center mb-2">
        <div className="w-8 h-8 rounded-full bg-blue-600 flex-shrink-0 mr-2 flex items-center justify-center text-white font-bold">J</div>
        <span className="font-semibold text-white">João Pedro</span>
      </div>
      <p className="text-sm text-gray-300">Claro! Acabei de postar um mapa mental que me ajudou muito. Dá uma olhada na seção de História.</p>
    </div>
    <div className="flex-grow"></div>
    <Link to="/register" className="w-full">
      <Button className="w-full">Postar Discussão</Button>
    </Link>
  </div>
);


const features = [
  {
    id: 'chat',
    title: 'Chat com IA',
    icon: MessageSquare,
    description: 'Converse com agentes especializados em cada área do ENEM. Obtenha explicações detalhadas, resolução de exercícios e simulados personalizados com feedback instantâneo.',
    demo: <ChatDemo />,
  },
  {
    id: 'notes',
    title: 'Anotações Inteligentes',
    icon: FileText,
    description: 'Crie anotações organizadas com tags, exporte para PDF, e utilize ferramentas de edição avançadas. Sistema de salvamento automático e busca inteligente.',
    demo: <NotesDemo />,
  },
  {
    id: 'community',
    title: 'Comunidade',
    icon: Users,
    description: 'Conecte-se com estudantes e professores. Partilhe materiais, participe de discussões e construa uma rede de apoio para sua jornada de estudos.',
    demo: <CommunityDemo />,
  },
];

export function FeaturesSection() {
  const [activeTab, setActiveTab] = useState(features[0].id);
  const activeFeature = features.find((feature) => feature.id === activeTab);

  return (
    <div className="w-full max-w-6xl mx-auto mb-16">
      <div className="flex">
        {features.map((feature) => (
          <button
            key={feature.id}
            onClick={() => setActiveTab(feature.id)}
            className={cn(
              'flex-1 p-4 text-center transition-colors duration-300 focus:outline-none',
              'border-b-2',
              activeTab === feature.id
                ? 'bg-gray-800/50 border-purple-600 text-white'
                : 'border-transparent text-gray-400 hover:bg-gray-800/30 hover:text-white'
            )}
            style={{ borderTopLeftRadius: '0.75rem', borderTopRightRadius: '0.75rem' }}
          >
            <div className="flex items-center justify-center gap-2">
              <feature.icon className="h-5 w-5" />
              <span className="font-semibold">{feature.title}</span>
            </div>
          </button>
        ))}
      </div>

      <div className="relative bg-gray-800/50 backdrop-blur-sm border border-t-0 border-gray-700 rounded-b-xl overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="p-8 md:p-12"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-3xl font-bold text-white mb-4">{activeFeature?.title}</h3>
                <p className="text-gray-300 text-lg">{activeFeature?.description}</p>
              </div>
              <div className="flex items-center justify-center h-[350px]">
                {activeFeature?.demo}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}