import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check, BookOpen, GraduationCap, Target, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/auth/GlassCard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const TOTAL_STEPS = 4;

const SUBJECTS = [
    "Matemática", "Física", "Química", "Biologia",
    "História", "Geografia", "Filosofia/Sociologia",
    "Português", "Literatura", "Redação", "Inglês/Espanhol"
];

export function OnboardingWizard() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        school_year: "",
        dream_course: "",
        dream_university: "",
        struggle_subjects: [] as string[],
        terms_accepted: false
    });

    const handleNext = () => {
        if (step === 1 && !formData.school_year) {
            toast.error("Por favor, selecione sua fase escolar.");
            return;
        }
        if (step < TOTAL_STEPS) setStep(step + 1);
        else handleSubmit();
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    const handleSubmit = async () => {
        if (!formData.terms_accepted) {
            toast.error("Você precisa aceitar os termos para continuar.");
            return;
        }

        setIsLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Usuário não encontrado");

            const { error } = await supabase
                .from("profiles")
                .update({
                    // @ts-ignore - Columns might not exist yet, user needs to run migration
                    school_year: formData.school_year,
                    dream_course: formData.dream_course,
                    dream_university: formData.dream_university,
                    struggle_subjects: formData.struggle_subjects,
                    onboarding_completed: true
                })
                .eq("id", user.id);

            if (error) throw error;

            toast.success("Perfil configurado com sucesso!");
            navigate("/chat");
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Erro desconhecido";
            toast.error("Erro ao salvar perfil: " + message);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleSubject = (subject: string) => {
        setFormData(prev => ({
            ...prev,
            struggle_subjects: prev.struggle_subjects.includes(subject)
                ? prev.struggle_subjects.filter(s => s !== subject)
                : [...prev.struggle_subjects, subject]
        }));
    };

    return (
        <div className="w-full max-w-2xl">
            <div className="mb-4 flex items-center justify-between text-white">
                <span className="text-sm font-medium text-purple-400">Passo {step} de {TOTAL_STEPS}</span>
                <div className="h-2 flex-1 mx-4 rounded-full bg-white/10 overflow-hidden">
                    <motion.div
                        className="h-full bg-purple-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>
            </div>

            <GlassCard className="p-8 min-h-[400px] flex flex-col">
                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <StepContent key="step1" title="Qual sua fase atual?" icon={<GraduationCap className="text-purple-400" size={32} />}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {["1º Ano Ensino Médio", "2º Ano Ensino Médio", "3º Ano Ensino Médio", "Pré-Vestibular/Cursinho"].map((opt) => (
                                    <OptionButton
                                        key={opt}
                                        selected={formData.school_year === opt}
                                        onClick={() => setFormData({ ...formData, school_year: opt })}
                                    >
                                        {opt}
                                    </OptionButton>
                                ))}
                            </div>
                        </StepContent>
                    )}

                    {step === 2 && (
                        <StepContent key="step2" title="Qual seu grande sonho?" icon={<Target className="text-purple-400" size={32} />}>
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    placeholder="Curso dos sonhos (ex: Medicina, Direito)"
                                    className="w-full rounded-xl border border-white/10 bg-black/40 p-4 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                                    value={formData.dream_course}
                                    onChange={(e) => setFormData({ ...formData, dream_course: e.target.value })}
                                />
                                <input
                                    type="text"
                                    placeholder="Universidade Alvo (ex: USP, UFRJ)"
                                    className="w-full rounded-xl border border-white/10 bg-black/40 p-4 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                                    value={formData.dream_university}
                                    onChange={(e) => setFormData({ ...formData, dream_university: e.target.value })}
                                />
                            </div>
                        </StepContent>
                    )}

                    {step === 3 && (
                        <StepContent key="step3" title="Onde você tem mais dificuldade?" icon={<BookOpen className="text-purple-400" size={32} />}>
                            <div className="flex flex-wrap gap-2">
                                {SUBJECTS.map((subject) => (
                                    <button
                                        key={subject}
                                        onClick={() => toggleSubject(subject)}
                                        className={cn(
                                            "rounded-full px-4 py-2 text-sm transition-all border",
                                            formData.struggle_subjects.includes(subject)
                                                ? "bg-purple-500/20 border-purple-500 text-purple-300"
                                                : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                                        )}
                                    >
                                        {subject}
                                    </button>
                                ))}
                            </div>
                        </StepContent>
                    )}

                    {step === 4 && (
                        <StepContent key="step4" title="Tudo pronto?" icon={<ShieldCheck className="text-purple-400" size={32} />}>
                            <div className="bg-white/5 rounded-xl p-6 border border-white/10 text-sm text-gray-300 space-y-4">
                                <p>
                                    Para personalizar seu aprendizado, a <strong>KIAra (nossa IA)</strong> utilizará esses dados para criar planos de estudo e sugerir conteúdos.
                                </p>
                                <p>
                                    <strong className="text-white">Seus dados estão seguros.</strong> Não compartilhamos suas informações pessoais com terceiros para fins comerciais. Seus dados escolares são usados exclusivamente para fins pedagógicos dentro da plataforma.
                                </p>
                                <label className="flex items-start gap-3 mt-4 cursor-pointer group">
                                    <div className="relative pt-0.5">
                                        <input
                                            type="checkbox"
                                            className="peer sr-only"
                                            id="terms-check"
                                            checked={formData.terms_accepted}
                                            onChange={(e) => setFormData({ ...formData, terms_accepted: e.target.checked })}
                                        />
                                        <div
                                            className={cn(
                                                "w-5 h-5 rounded border flex items-center justify-center transition-colors peer-focus:ring-2 peer-focus:ring-purple-500/50",
                                                formData.terms_accepted ? "bg-purple-500 border-purple-500" : "border-gray-500 group-hover:border-purple-400"
                                            )}
                                        >
                                            {formData.terms_accepted && <Check size={14} className="text-white" />}
                                        </div>
                                    </div>
                                    <span className="text-gray-400 group-hover:text-gray-200 transition-colors select-none">
                                        Li e concordo com os Termos de Uso e Política de Privacidade do EnemAI.
                                    </span>
                                </label>
                            </div>
                        </StepContent>
                    )}
                </AnimatePresence>

                <div className="mt-auto flex justify-between pt-8">
                    <Button
                        variant="ghost"
                        onClick={handleBack}
                        className={`text-gray-400 hover:text-white ${step === 1 ? "invisible" : ""}`}
                    >
                        Voltar
                    </Button>
                    <Button
                        onClick={handleNext}
                        disabled={step === 4 && !formData.terms_accepted}
                        className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl px-8"
                    >
                        {isLoading ? "Salvando..." : step === TOTAL_STEPS ? "Concluir" : "Próximo"}
                        {!isLoading && step !== TOTAL_STEPS && <ArrowRight size={16} className="ml-2" />}
                    </Button>
                </div>
            </GlassCard>
        </div>
    );
}

function StepContent({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col"
        >
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                    {icon}
                </div>
                <h2 className="text-2xl font-bold text-white">{title}</h2>
            </div>
            {children}
        </motion.div>
    );
}

function OptionButton({ children, selected, onClick }: { children: React.ReactNode; selected: boolean; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "w-full p-4 rounded-xl border text-left transition-all",
                selected
                    ? "bg-purple-500/20 border-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.2)]"
                    : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/20"
            )}
        >
            {children}
        </button>
    );
}
