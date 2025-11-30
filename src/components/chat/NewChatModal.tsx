import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Bot, BookOpen, Sparkles, ScrollText } from "lucide-react";
import { cn } from "@/lib/utils";

interface NewChatModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectAgent: (agentName: string) => void;
}

const NewChatModal = ({ isOpen, onClose, onSelectAgent }: NewChatModalProps) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] bg-gray-900 border-gray-800 text-white">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-center mb-2">Escolha seu Mentor</DialogTitle>
                    <DialogDescription className="text-center text-gray-400">
                        Selecione o modo de estudo ideal para o seu momento.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    {/* Option 1: Tutor ENEM AI */}
                    <button
                        onClick={() => onSelectAgent('Tutor ENEM AI')}
                        className="group relative flex flex-col items-center p-6 rounded-xl border border-gray-700 bg-gray-800/50 hover:bg-gray-800 hover:border-purple-500/50 transition-all duration-300 text-left"
                    >
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mb-4 shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform">
                            <Bot className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">Tutor ENEM AI</h3>
                        <p className="text-sm text-gray-400 text-center leading-relaxed">
                            O assistente padrão. Tira dúvidas gerais, resolve questões e ajuda com qualquer matéria do ENEM usando conhecimento amplo.
                        </p>
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Sparkles className="h-4 w-4 text-purple-400" />
                        </div>
                    </button>

                    {/* Option 2: LIAn */}
                    <button
                        onClick={() => onSelectAgent('LIAn')}
                        className="group relative flex flex-col items-center p-6 rounded-xl border border-gray-700 bg-gray-800/50 hover:bg-gray-800 hover:border-emerald-500/50 transition-all duration-300 text-left"
                    >
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                            <BookOpen className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">LIAn</h3>
                        <p className="text-sm text-gray-400 text-center leading-relaxed">
                            Estudo focado nas <strong>suas anotações</strong>. Só responde com base no que você já estudou e registrou no sistema.
                        </p>
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <ScrollText className="h-4 w-4 text-emerald-400" />
                        </div>
                    </button>
                </div>

                <div className="mt-6 flex justify-center">
                    <Button variant="ghost" onClick={onClose} className="text-gray-500 hover:text-white">
                        Cancelar
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default NewChatModal;
