import { Bot, BookOpen, Sparkles, ScrollText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface WelcomeMessageProps {
  onCreateConversation: (agentName: string) => void;
  agent: string | null;
}

const WelcomeMessage = ({ onCreateConversation, agent }: WelcomeMessageProps) => {

  const isSelected = !!agent;

  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8 max-w-4xl mx-auto relative overflow-hidden min-h-[500px]">
      <AnimatePresence mode="wait">
        {!isSelected ? (
          <motion.div
            key="selection"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="w-full"
          >
            <div className="mb-8">
              <h3 className="text-3xl font-bold mb-2 text-white bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
                Escolha seu Mentor
              </h3>
              <p className="text-gray-400">
                Selecione o modo de estudo ideal para o seu momento.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
              {/* Option 1: KIAra */}
              <button
                onClick={() => onCreateConversation('KIAra')}
                className="group relative flex flex-col items-center p-8 rounded-2xl border border-gray-700 bg-gray-800/30 hover:bg-gray-800 hover:border-purple-500/50 transition-all duration-300 text-left"
              >
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mb-6 shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform">
                  <Bot className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-purple-400 transition-colors">KIAra</h3>
                <p className="text-sm text-gray-400 text-center leading-relaxed">
                  Sua tutora oficial. Tira dúvidas gerais, resolve questões e ajuda com qualquer matéria do ENEM com rigor e didática.
                </p>
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Sparkles className="h-5 w-5 text-purple-400" />
                </div>
              </button>

              {/* Option 2: LIAn */}
              <button
                onClick={() => onCreateConversation('LIAn')}
                className="group relative flex flex-col items-center p-8 rounded-2xl border border-gray-700 bg-gray-800/30 hover:bg-gray-800 hover:border-emerald-500/50 transition-all duration-300 text-left"
              >
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-emerald-400 transition-colors">LIAn</h3>
                <p className="text-sm text-gray-400 text-center leading-relaxed">
                  Estudo focado nas <strong>suas anotações</strong>. Só responde com base no que você já estudou e registrou no sistema.
                </p>
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ScrollText className="h-5 w-5 text-emerald-400" />
                </div>
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="info"
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex flex-col items-center justify-center w-full"
          >
            <div className={`h-32 w-32 rounded-full flex items-center justify-center mb-6 shadow-2xl ${agent === 'LIAn' ? 'bg-gradient-to-br from-emerald-500 to-teal-500 shadow-emerald-500/30' : 'bg-gradient-to-br from-purple-500 to-blue-500 shadow-purple-500/30'}`}>
              {agent === 'LIAn' ? (
                <BookOpen className="h-16 w-16 text-white" />
              ) : (
                <Bot className="h-16 w-16 text-white" />
              )}
            </div>

            <h2 className={`text-3xl font-bold mb-4 ${agent === 'LIAn' ? 'text-emerald-400' : 'text-purple-400'}`}>
              {agent}
            </h2>

            <p className="text-gray-300 text-lg max-w-lg leading-relaxed">
              {agent === 'LIAn'
                ? "Modo de estudo ativado. Vou usar exclusivamente suas anotações para criar conexões e tirar dúvidas. Vamos estudar?"
                : "Seu tutor pessoal está pronto. Pergunte sobre qualquer matéria, peça resumos ou resolva questões do ENEM."}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WelcomeMessage;