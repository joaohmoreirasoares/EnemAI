import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import { Bot, Brain, Eye, Users, Sparkles, MessageSquare, ToggleLeft, ToggleRight, ArrowRight, Zap } from 'lucide-react';

// --- 1. Agent Showcase (Formerly DuelCard) ---
const AgentShowcase = () => {
    const [activeAgent, setActiveAgent] = useState<'kiara' | 'lian'>('kiara');
    const [displayedText, setDisplayedText] = useState("");

    const kiaraIntro = " Olá! Sou a KIAra. Eu sou sua tutora proativa. Eu te ajudo a entender qualquer matéria, corrijo suas redações e crio planos de estudo personalizados para você.";
    const lianIntro = " Olá! Sou o LIAn. Eu sou seu tutor socrático. Eu não te dou respostas prontas. Eu uso EXCLUSIVAMENTE suas anotações para testar se você realmente aprendeu o conteúdo.";

    useEffect(() => {
        let currentText = activeAgent === 'kiara' ? kiaraIntro : lianIntro;
        let index = 0;
        setDisplayedText("");

        const interval = setInterval(() => {
            if (index < currentText.length) {
                setDisplayedText(prev => prev + currentText.charAt(index));
                index++;
            } else {
                clearInterval(interval);
                // Wait a bit then switch
                setTimeout(() => {
                    setActiveAgent(prev => prev === 'kiara' ? 'lian' : 'kiara');
                }, 4000);
            }
        }, 30);

        return () => clearInterval(interval);
    }, [activeAgent]);

    return (
        <div className="w-full grid md:grid-cols-2 gap-8 items-center">
            {/* Visual Side */}
            <div className="relative h-[400px] rounded-3xl overflow-hidden border border-white/10 bg-gray-900/50 backdrop-blur-md">
                <div className={`absolute inset-0 transition-colors duration-1000 ${activeAgent === 'kiara' ? 'bg-purple-900/20' : 'bg-cyan-900/20'}`} />

                {/* Avatar / Icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <AnimatePresence mode="wait">
                        {activeAgent === 'kiara' ? (
                            <motion.div
                                key="kiara-icon"
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                className="w-32 h-32 rounded-full bg-purple-600/20 border border-purple-500/50 flex items-center justify-center shadow-[0_0_50px_rgba(147,51,234,0.3)]"
                            >
                                <Bot className="w-16 h-16 text-purple-400" />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="lian-icon"
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                className="w-32 h-32 rounded-full bg-cyan-600/20 border border-cyan-500/50 flex items-center justify-center shadow-[0_0_50px_rgba(6,182,212,0.3)]"
                            >
                                <Brain className="w-16 h-16 text-cyan-400" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Floating Badges */}
                <div className="absolute top-6 left-6">
                    <div className={`px-3 py-1 rounded-full text-xs font-bold border ${activeAgent === 'kiara' ? 'bg-purple-500/20 border-purple-500 text-purple-300' : 'bg-gray-800 border-gray-700 text-gray-500'}`}>
                        Tutor Proativo
                    </div>
                </div>
                <div className="absolute bottom-6 right-6">
                    <div className={`px-3 py-1 rounded-full text-xs font-bold border ${activeAgent === 'lian' ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300' : 'bg-gray-800 border-gray-700 text-gray-500'}`}>
                        Tutor Socrático
                    </div>
                </div>
            </div>

            {/* Text Side */}
            <div className="flex flex-col justify-center space-y-6 p-4">
                <h3 className="text-3xl font-bold">
                    <span className={activeAgent === 'kiara' ? 'text-purple-400' : 'text-gray-600'}>KIAra</span>
                    <span className="text-gray-600 mx-2">vs</span>
                    <span className={activeAgent === 'lian' ? 'text-cyan-400' : 'text-gray-600'}>LIAn</span>
                </h3>

                <div className="min-h-[120px] text-xl leading-relaxed text-gray-200">
                    "{displayedText}"
                    <span className="inline-block w-2 h-5 ml-1 bg-white animate-pulse align-middle" />
                </div>

                <div className="flex gap-4 pt-4">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Zap className="w-4 h-4 text-yellow-400" />
                        <span>IA Especializada</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Sparkles className="w-4 h-4 text-purple-400" />
                        <span>Personalização Total</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- 2. Community Hub (Formerly SocialCard) ---
const CommunityHub = () => {
    return (
        <div className="w-full grid md:grid-cols-2 gap-12 items-center">
            {/* Text Side */}
            <div className="order-2 md:order-1 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-300 text-sm">
                    <Users className="w-4 h-4" />
                    Comunidade Ativa
                </div>
                <h3 className="text-4xl font-bold">Não estude sozinho.</h3>
                <p className="text-lg text-gray-400 leading-relaxed">
                    O EnemAI conecta você a milhares de outros estudantes. Participe de discussões, compartilhe seus resumos e suba no ranking global.
                </p>
                <ul className="space-y-4">
                    {[
                        "Fóruns de discussão por matéria",
                        "Compartilhamento de materiais",
                        "Ranking gamificado com XP"
                    ].map((item, i) => (
                        <li key={i} className="flex items-center gap-3 text-gray-300">
                            <div className="w-6 h-6 rounded-full bg-pink-500/20 flex items-center justify-center">
                                <ArrowRight className="w-3 h-3 text-pink-400" />
                            </div>
                            {item}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Visual Side - Animated Forum Thread */}
            <div className="order-1 md:order-2 relative h-[400px] rounded-3xl border border-white/10 bg-gray-900/50 backdrop-blur-md overflow-hidden p-6 flex flex-col gap-4">
                {/* Question */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gray-800/80 p-4 rounded-2xl rounded-tl-none border border-white/5"
                >
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full bg-blue-500" />
                        <span className="text-xs font-bold text-gray-300">Pedro H.</span>
                        <span className="text-xs text-gray-500">• 2 min atrás</span>
                    </div>
                    <p className="text-sm text-gray-200">Alguém tem um macete pra decorar a Tabela Periódica? 🧪</p>
                </motion.div>

                {/* Answers */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.5 }}
                    className="self-end bg-pink-600/20 border border-pink-500/20 p-4 rounded-2xl rounded-tr-none max-w-[80%]"
                >
                    <div className="flex items-center gap-2 mb-2 justify-end">
                        <span className="text-xs text-gray-500">Agora</span>
                        <span className="text-xs font-bold text-pink-300">Ana L.</span>
                        <div className="w-6 h-6 rounded-full bg-pink-500" />
                    </div>
                    <p className="text-sm text-gray-200">Tem sim! Pra família 1A: "Hoje Li Na Kama Robinson Crusoé em Francês" 😂 Ajuda muito!</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 3 }}
                    className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-green-500/20 border border-green-500/50 px-4 py-2 rounded-full flex items-center gap-2"
                >
                    <Sparkles className="w-4 h-4 text-green-400" />
                    <span className="text-xs font-bold text-green-300">Resposta Verificada pela IA</span>
                </motion.div>
            </div>
        </div>
    );
};

// --- 3. Notes Showcase (Intelligent Notes) ---
const NotesShowcase = () => {
    const [text, setText] = useState("");
    const fullText = "A Revolução Industrial foi impulsionada pela [[Máquina a Vapor]].";
    const [showNode, setShowNode] = useState(false);

    useEffect(() => {
        let index = 0;
        const interval = setInterval(() => {
            if (index <= fullText.length) {
                setText(fullText.slice(0, index));
                if (fullText.slice(0, index).includes("[[Máquina a Vapor]]")) {
                    setShowNode(true);
                } else {
                    setShowNode(false);
                }
                index++;
            } else {
                // Reset animation
                setTimeout(() => {
                    index = 0;
                    setText("");
                    setShowNode(false);
                }, 3000);
            }
        }, 100);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Editor Side */}
            <div className="h-[300px] rounded-3xl border border-white/10 bg-gray-950 overflow-hidden flex flex-col">
                {/* Fake Toolbar */}
                <div className="h-10 border-b border-white/10 bg-gray-900/50 flex items-center px-4 gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/20" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/20" />
                    <div className="w-3 h-3 rounded-full bg-green-500/20" />
                </div>
                {/* Editor Content */}
                <div className="p-6 font-mono text-gray-300 text-sm md:text-base leading-relaxed">
                    {text}
                    <span className="inline-block w-2 h-5 ml-1 bg-purple-500 animate-pulse align-middle" />
                </div>
            </div>

            {/* Graph Side */}
            <div className="h-[300px] rounded-3xl border border-white/10 bg-gray-900/50 backdrop-blur-md overflow-hidden relative flex items-center justify-center">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.1),transparent_70%)]" />

                {/* Central Node */}
                <motion.div
                    className="absolute w-4 h-4 bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,0.5)] z-10"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                />
                <div className="absolute mt-8 text-xs text-gray-400 bg-black/50 px-2 rounded">Revolução Industrial</div>

                {/* Connected Node */}
                <AnimatePresence>
                    {showNode && (
                        <>
                            <motion.div
                                initial={{ scale: 0, x: 0, y: 0 }}
                                animate={{ scale: 1, x: 100, y: -50 }}
                                exit={{ scale: 0, opacity: 0 }}
                                className="absolute w-3 h-3 bg-purple-400 rounded-full shadow-[0_0_15px_rgba(168,85,247,0.5)] z-10"
                            />
                            <motion.div
                                initial={{ opacity: 0, x: 100, y: -30 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute mt-8 ml-[200px] text-xs text-purple-300 bg-purple-900/50 px-2 rounded border border-purple-500/30"
                            >
                                Máquina a Vapor
                            </motion.div>
                            <svg className="absolute inset-0 w-full h-full pointer-events-none">
                                <motion.line
                                    x1="50%" y1="50%"
                                    x2="calc(50% + 100px)" y2="calc(50% - 50px)"
                                    stroke="rgba(168,85,247,0.5)"
                                    strokeWidth="2"
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    exit={{ opacity: 0 }}
                                />
                            </svg>
                        </>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

// --- 4. Accessibility Showcase (Real Feature: Contextual Help) ---
const AccessibilityShowcase = () => {
    const [accessibilityMode, setAccessibilityMode] = useState(false);

    return (
        <div className="w-full rounded-3xl border border-white/10 bg-gray-900/50 backdrop-blur-md overflow-hidden">
            <div className="p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-12">

                {/* Text Side */}
                <div className="space-y-6 max-w-xl order-2 md:order-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm border bg-yellow-500/10 text-yellow-300 border-yellow-500/20">
                        <Eye className="w-4 h-4" />
                        Navegação Assistida
                    </div>
                    <h3 className="text-3xl md:text-4xl font-bold text-white">
                        Não se perca na interface.
                    </h3>
                    <p className="text-lg text-gray-400">
                        O EnemAI possui um <span className="text-yellow-400 font-bold">Modo de Acessibilidade</span> nativo.
                        Ao ativá-lo, elementos importantes ganham destaque e explicações contextuais para guiar sua jornada.
                    </p>

                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-3 text-sm text-gray-300">
                            <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center border border-yellow-500/30">
                                <span className="text-yellow-400 font-bold">?</span>
                            </div>
                            <span>Ícones de ajuda em cada função</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-300">
                            <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center border border-yellow-500/30">
                                <div className="w-4 h-4 border-2 border-dashed border-yellow-400 rounded-sm" />
                            </div>
                            <span>Bordas de alto contraste para foco</span>
                        </div>
                    </div>
                </div>

                {/* Interactive Demo Side */}
                <div className="flex flex-col items-center gap-8 order-1 md:order-2 w-full md:w-auto">

                    {/* Mock Interface */}
                    <div className="relative bg-gray-950 border border-gray-800 rounded-2xl p-6 w-full max-w-xs shadow-2xl">
                        <div className="absolute -top-3 left-4 bg-gray-900 px-2 text-xs text-gray-500 font-mono border border-gray-800 rounded">
                            Exemplo de Interface
                        </div>

                        <div className="space-y-4">
                            {/* Mock Chat Bubble */}
                            <div className="bg-gray-800/50 p-3 rounded-lg rounded-tl-none text-xs text-gray-400">
                                Olá! Como posso ajudar nos seus estudos hoje?
                            </div>

                            {/* Mock Actions */}
                            <div className="flex gap-2">
                                <MockActionButton icon={<MessageSquare className="w-4 h-4" />} active={accessibilityMode} label="Enviar Mensagem" />
                                <MockActionButton icon={<Bot className="w-4 h-4" />} active={accessibilityMode} label="Trocar Agente" />
                                <MockActionButton icon={<Sparkles className="w-4 h-4" />} active={accessibilityMode} label="Gerar Resumo" />
                            </div>
                        </div>

                    </div>

                    {/* Toggle Switch */}
                    <div
                        className="flex items-center gap-4 cursor-pointer group"
                        onClick={() => setAccessibilityMode(!accessibilityMode)}
                    >
                        <span className={`text-sm font-medium transition-colors ${accessibilityMode ? 'text-gray-500' : 'text-white'}`}>
                            Normal
                        </span>

                        {/* Custom Switch Component */}
                        <div className={`w-16 h-8 rounded-full p-1 transition-colors duration-300 ${accessibilityMode ? 'bg-yellow-500' : 'bg-gray-700'}`}>
                            <motion.div
                                className="w-6 h-6 bg-white rounded-full shadow-md"
                                layout
                                transition={{ type: "spring", stiffness: 700, damping: 30 }}
                                style={{
                                    x: accessibilityMode ? 32 : 0
                                }}
                            />
                        </div>

                        <span className={`text-sm font-medium transition-colors ${accessibilityMode ? 'text-yellow-400' : 'text-gray-500'}`}>
                            Acessibilidade
                        </span>
                    </div>

                </div>

            </div>
        </div>
    );
};

// Helper for Mock Buttons
const MockActionButton = ({ icon, active, label }: { icon: any, active: boolean, label: string }) => {
    return (
        <div className="relative group/btn">
            <div className={`p-3 rounded-xl bg-gray-800 text-white transition-all duration-300 ${active ? 'border-2 border-dashed border-yellow-400/50' : 'border border-transparent'}`}>
                {icon}
            </div>

            {/* Accessibility Badge */}
            <AnimatePresence>
                {active && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -top-2 -right-2 bg-yellow-400 text-black rounded-full p-0.5 z-10"
                    >
                        <span className="sr-only">Ajuda</span>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                            <path d="M12 17h.01" />
                        </svg>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Tooltip (Only on Hover + Active) */}
            {active && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-yellow-100 text-yellow-900 text-xs font-bold rounded opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20">
                    {label}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-yellow-100" />
                </div>
            )}
        </div>
    );
};

// --- Main Component ---
export default function LivingEcosystem() {
    return (
        <section className="relative z-10 py-24 px-4 md:px-6 max-w-7xl mx-auto space-y-32">

            {/* 1. Agents Section */}
            <div className="space-y-8">
                <div className="text-center max-w-3xl mx-auto">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4">Conheça seus Tutores</h2>
                    <p className="text-gray-400">
                        Dois agentes, duas metodologias. Escolha o que melhor se adapta ao seu momento de estudo.
                    </p>
                </div>
                <AgentShowcase />
            </div>

            {/* 2. Community Section */}
            <CommunityHub />

            {/* 3. Intelligent Notes Section */}
            <div className="space-y-8">
                <div className="text-center max-w-3xl mx-auto">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4">Escreva e Conecte</h2>
                    <p className="text-gray-400">
                        O único editor que entende o que você escreve. Crie conexões automáticas entre tópicos e construa seu Segundo Cérebro.
                    </p>
                </div>
                <NotesShowcase />
            </div>

            {/* 4. Accessibility Section */}
            <AccessibilityShowcase />

        </section>
    );
}
