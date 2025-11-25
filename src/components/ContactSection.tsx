'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Github, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Link } from 'react-router-dom';

export function ContactSection() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'submitted'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setTimeout(() => {
      setStatus('submitted');
    }, 1500); // Simulate network delay
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 md:p-12 mb-16 overflow-hidden min-h-[500px]">
      <AnimatePresence>
        {status !== 'submitted' && (
          <motion.div
            className="relative z-10"
            initial={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 text-center">Entre em Contato</h2>
            <p className="text-gray-300 mb-8 text-center max-w-2xl mx-auto">
              Tem dúvidas, sugestões ou quer contribuir com o projeto? Preencha o formulário abaixo ou nos encontre nas redes.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input type="text" placeholder="Seu nome" required className="bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-200" />
                <Input type="email" placeholder="Seu e-mail" required className="bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-200" />
              </div>
              <Textarea placeholder="Sua mensagem..." required className="bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-200" />
              <div className="text-center">
                <Button type="submit" size="lg" disabled={status === 'sending'}>
                  {status === 'sending' ? (
                    <div className="flex items-center">
                      <motion.div
                        className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      />
                      Enviando...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Send className="w-4 h-4 mr-2" />
                      Enviar Mensagem
                    </div>
                  )}
                </Button>
              </div>
            </form>

            <div className="flex justify-center gap-8 mt-8">
              <a href="mailto:joaohms329@gmail.com" className="flex items-center gap-2 text-gray-300 hover:text-purple-400 transition-colors">
                <Mail className="w-5 h-5" />
                <span>joaohms329@gmail.com</span>
              </a>
              <a href="https://github.com/joaohmoreirasoares" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-300 hover:text-purple-400 transition-colors">
                <Github className="w-5 h-5" />
                <span>github.com/joaohmoreirasoares</span>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {status === 'submitted' && (
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center z-20 text-center p-8 bg-purple-600"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-3xl font-bold text-white mb-4">Obrigado pelo seu interesse!</h3>
            <p className="text-white text-lg mb-6">Para interagir com nossas funcionalidades, por favor, crie uma conta.</p>
            <Link to="/register">
              <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-purple-600">
                Criar Conta
              </Button>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}