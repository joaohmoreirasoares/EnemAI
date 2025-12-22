import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { GlassCard } from "@/components/auth/GlassCard";
import { AuthInput } from "@/components/auth/AuthInput";
import { SocialButton } from "@/components/auth/SocialButton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Lock, User, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function Auth() {
    const navigate = useNavigate();
    const [mode, setMode] = useState("login");
    const [isLoading, setIsLoading] = useState(false);

    // Form States
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");

    const checkOnboardingAndRedirect = async (userId: string) => {
        try {
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('onboarding_completed')
                .eq('id', userId)
                .single();

            if (error) {
                console.error("Error fetching profile:", error);
                // Safe fallback to onboarding if error occurs (e.g. no profile found yet)
                navigate("/onboarding");
                return;
            }

            if (profile?.onboarding_completed) {
                navigate("/chat"); // Redirect to Dashboard
            } else {
                navigate("/onboarding");
            }
        } catch (error) {
            // If profile fetch fails, safe fallback to onboarding
            navigate("/onboarding");
        }
    };

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (mode === "login") {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                if (error) throw error;

                if (data.user) {
                    // Check if email confirmation is required/pending
                    // Note: In dev, confirmation might be disabled. In prod, we might want to block.
                    // For now, if Supabase lets them in, we guide them.
                    await checkOnboardingAndRedirect(data.user.id);
                }

            } else {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName,
                        },
                    },
                });

                if (error) throw error;

                // If session exists immediately, user is logged in (Auto Confirm ON)
                if (data.session && data.user) {
                    await checkOnboardingAndRedirect(data.user.id);
                } else {
                    // Email confirmation required
                    toast.success("Conta criada! Verifique seu email para continuar.");
                    setMode("login");
                }
            }
        } catch (error: any) {
            toast.error(error.message || "Erro na autenticação");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        if (isLoading) return;
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: "google",
            });
            if (error) throw error;
        } catch (error: any) {
            toast.error("Erro ao conectar com Google");
        }
    };

    return (
        <div className="w-full max-w-md">
            <div className="mb-8 text-center">
                <h1 className="mb-2 text-4xl font-bold tracking-tighter text-white">
                    Enem<span className="text-purple-400">AI</span>
                </h1>
                <p className="text-gray-400">Sua jornada para a universidade começa aqui.</p>
            </div>

            <GlassCard className="p-8">
                <Tabs value={mode} onValueChange={setMode} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6 bg-white/5">
                        <TabsTrigger value="login" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-400">Entrar</TabsTrigger>
                        <TabsTrigger value="register" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-400">Cadastrar</TabsTrigger>
                    </TabsList>

                    <form onSubmit={handleAuth} className="space-y-4">
                        <AnimatePresence mode="wait">
                            {mode === "register" && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <AuthInput
                                        label="Nome Completo"
                                        icon={<User size={18} />}
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        placeholder="Seu nome"
                                        required
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <AuthInput
                            label="Email"
                            type="email"
                            icon={<Mail size={18} />}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="seu@email.com"
                            required
                        />

                        <AuthInput
                            label="Senha"
                            type="password"
                            icon={<Lock size={18} />}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />

                        <Button
                            type="submit"
                            className="w-full rounded-xl bg-purple-600 py-6 text-base font-bold text-white hover:bg-purple-700 hover:shadow-[0_0_20px_rgba(147,51,234,0.3)] transition-all active:scale-[0.98]"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <Loader2 className="mr-2 animate-spin" />
                            ) : (
                                <>
                                    {mode === "login" ? "Entrar na Plataforma" : "Criar Conta Grátis"}
                                    <ArrowRight className="ml-2" size={18} />
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="my-6 flex items-center gap-4">
                        <div className="h-px flex-1 bg-white/10" />
                        <span className="text-xs text-gray-500 uppercase tracking-widest">Ou</span>
                        <div className="h-px flex-1 bg-white/10" />
                    </div>

                    <SocialButton
                        provider="Google"
                        onClick={handleGoogleLogin}
                        disabled={isLoading}
                        icon={
                            <svg className="h-5 w-5" viewBox="0 0 24 24">
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"
                                />
                            </svg>
                        }
                    />
                </Tabs>
            </GlassCard>
        </div>
    );
}
