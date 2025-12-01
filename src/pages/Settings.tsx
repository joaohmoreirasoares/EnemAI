import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Loader2, Save, Lock, Mail, Eye, EyeOff, Shield, Globe, Settings as SettingsIcon, Accessibility } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useAccessibility } from '@/context/AccessibilityContext';
import { AccessibilityHelper } from '@/components/accessibility/AccessibilityHelper';

const SettingsPage = () => {
    const queryClient = useQueryClient();
    const { showAccessibility, setAccessibility } = useAccessibility();

    const { data: sessionUser } = useQuery({
        queryKey: ['sessionUser'],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            return user;
        },
        staleTime: Infinity,
    });

    const { data: profile } = useQuery({
        queryKey: ['profile', sessionUser?.id],
        queryFn: async () => {
            if (!sessionUser?.id) return null;
            const { data, error } = await supabase.from('profiles').select('*').eq('id', sessionUser.id).single();
            if (error) throw error;
            return data;
        },
        enabled: !!sessionUser?.id,
    });

    const [isPublic, setIsPublic] = useState(profile?.is_public ?? true);
    // showAccessibility is now managed by AccessibilityContext
    const [emailForm, setEmailForm] = useState({ newEmail: '', password: '' });
    const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [showPassword, setShowPassword] = useState(false);

    // Update local state when profile loads
    if (profile && isPublic !== profile.is_public && profile.is_public !== undefined) {
        setIsPublic(profile.is_public);
    }

    // Visibility Mutation
    const updateVisibilityMutation = useMutation({
        mutationFn: async (checked: boolean) => {
            if (!profile?.id) return;
            const { error } = await supabase.from('profiles').update({ is_public: checked }).eq('id', profile.id);
            if (error) throw error;
        },
        onSuccess: (_, checked) => {
            setIsPublic(checked);
            toast.success(`Perfil agora está ${checked ? 'Público' : 'Privado'}`);
            queryClient.invalidateQueries({ queryKey: ['profile', profile?.id] });
        },
        onError: (error) => toast.error(`Erro ao atualizar visibilidade: ${error.message}`)
    });

    // Email Mutation
    const updateEmailMutation = useMutation({
        mutationFn: async () => {
            // 1. Re-authenticate
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: sessionUser!.email!,
                password: emailForm.password,
            });
            if (signInError) throw new Error("Senha incorreta.");

            // 2. Update Email
            const { error: updateError } = await supabase.auth.updateUser({ email: emailForm.newEmail });
            if (updateError) throw updateError;
        },
        onSuccess: () => {
            toast.success("E-mail atualizado! Verifique sua caixa de entrada para confirmar.");
            setEmailForm({ newEmail: '', password: '' });
        },
        onError: (error) => toast.error(error.message)
    });

    // Password Mutation
    const updatePasswordMutation = useMutation({
        mutationFn: async () => {
            if (passwordForm.newPassword !== passwordForm.confirmPassword) throw new Error("As senhas não coincidem.");
            if (passwordForm.newPassword.length < 6) throw new Error("A senha deve ter pelo menos 6 caracteres.");

            // 1. Re-authenticate
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: sessionUser!.email!,
                password: passwordForm.currentPassword,
            });
            if (signInError) throw new Error("Senha atual incorreta.");

            // 2. Update Password
            const { error: updateError } = await supabase.auth.updateUser({ password: passwordForm.newPassword });
            if (updateError) throw updateError;
        },
        onSuccess: () => {
            toast.success("Senha atualizada com sucesso!");
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        },
        onError: (error) => toast.error(error.message)
    });

    if (!profile || !sessionUser) {
        return <div className="flex justify-center items-center h-screen bg-gray-950"><Loader2 className="w-12 h-12 animate-spin text-purple-500" /></div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white pb-20">
            {/* Header Background Decoration */}
            <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-purple-900/20 to-transparent pointer-events-none" />

            <div className="container mx-auto p-4 md:p-8 space-y-8 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-4 mb-8"
                >
                    <div className="p-3 bg-gray-800/50 rounded-xl border border-gray-700/50 backdrop-blur-sm">
                        <SettingsIcon className="w-8 h-8 text-purple-500" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white">Configurações</h1>
                        <p className="text-gray-400">Gerencie sua conta, privacidade e segurança.</p>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="max-w-4xl mx-auto space-y-8"
                >
                    {/* Privacy Section */}
                    <Card className="bg-gray-900/60 border-gray-800 backdrop-blur-md overflow-hidden shadow-xl shadow-purple-900/10">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-white"><Globe className="w-5 h-5 text-purple-500" /> Privacidade</CardTitle>
                            <CardDescription className="text-gray-400">Controle quem pode ver seu perfil na comunidade.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-gray-800/40 rounded-xl border border-gray-700/50 hover:border-purple-500/20 transition-colors">
                                <div className="space-y-1">
                                    <Label className="text-base text-gray-200">Perfil Público</Label>
                                    <p className="text-sm text-gray-500">
                                        {isPublic
                                            ? "Seu perfil está visível para outros membros da comunidade."
                                            : "Apenas você pode ver seu perfil. Você não aparecerá em buscas."}
                                    </p>
                                </div>
                                <Switch
                                    checked={isPublic}
                                    onCheckedChange={(checked) => updateVisibilityMutation.mutate(checked)}
                                    className="data-[state=checked]:bg-purple-600"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Accessibility Section */}
                    <Card className="bg-gray-900/60 border-gray-800 backdrop-blur-md overflow-hidden shadow-xl shadow-purple-900/10">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-white"><Accessibility className="w-5 h-5 text-purple-500" /> Acessibilidade</CardTitle>
                            <CardDescription className="text-gray-400">Opções de acessibilidade para melhorar sua experiência.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <AccessibilityHelper description="Ative esta opção para ver descrições de ajuda em elementos da interface.">
                                <div className="flex items-center justify-between p-4 bg-gray-800/40 rounded-xl border border-gray-700/50 hover:border-purple-500/20 transition-colors">
                                    <div className="space-y-1">
                                        <Label className="text-base text-gray-200">Mostrar Acessibilidade</Label>
                                        <p className="text-sm text-gray-500">
                                            {showAccessibility
                                                ? "As opções de acessibilidade serão exibidas nas abas."
                                                : "As opções de acessibilidade estão ocultas."}
                                        </p>
                                    </div>
                                    <Switch
                                        checked={showAccessibility}
                                        onCheckedChange={(checked) => {
                                            setAccessibility(checked);
                                            toast.success(`Acessibilidade ${checked ? 'ativada' : 'desativada'}`);
                                        }}
                                        className="data-[state=checked]:bg-purple-600"
                                    />
                                </div>
                            </AccessibilityHelper>
                        </CardContent>
                    </Card>

                    {/* Security Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Change Email */}
                        <Card className="bg-gray-900/60 border-gray-800 backdrop-blur-md flex flex-col shadow-xl shadow-purple-900/10">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-white"><Mail className="w-5 h-5 text-purple-500" /> Alterar E-mail</CardTitle>
                                <CardDescription className="text-gray-400">Atualize seu endereço de e-mail.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 flex-1">
                                <div className="space-y-2">
                                    <Label className="text-gray-300">Novo E-mail</Label>
                                    <Input
                                        type="email"
                                        placeholder="novo@email.com"
                                        value={emailForm.newEmail}
                                        onChange={(e) => setEmailForm({ ...emailForm, newEmail: e.target.value })}
                                        className="bg-gray-800 border-gray-700 text-white focus:border-purple-500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-gray-300">Senha Atual (para confirmar)</Label>
                                    <Input
                                        type="password"
                                        placeholder="••••••••"
                                        value={emailForm.password}
                                        onChange={(e) => setEmailForm({ ...emailForm, password: e.target.value })}
                                        className="bg-gray-800 border-gray-700 text-white focus:border-purple-500"
                                    />
                                </div>
                            </CardContent>
                            <CardFooter className="border-t border-gray-800 pt-4">
                                <Button
                                    onClick={() => updateEmailMutation.mutate()}
                                    disabled={!emailForm.newEmail || !emailForm.password || updateEmailMutation.isPending}
                                    className="w-full bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-900/20"
                                >
                                    {updateEmailMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                    Atualizar E-mail
                                </Button>
                            </CardFooter>
                        </Card>

                        {/* Change Password */}
                        <Card className="bg-gray-900/60 border-gray-800 backdrop-blur-md flex flex-col shadow-xl shadow-purple-900/10">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-white"><Shield className="w-5 h-5 text-purple-500" /> Alterar Senha</CardTitle>
                                <CardDescription className="text-gray-400">Proteja sua conta com uma nova senha.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 flex-1">
                                <div className="space-y-2">
                                    <Label className="text-gray-300">Senha Atual</Label>
                                    <div className="relative">
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            value={passwordForm.currentPassword}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                            className="bg-gray-800 border-gray-700 text-white focus:border-purple-500 pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-gray-300">Nova Senha</Label>
                                    <Input
                                        type="password"
                                        placeholder="••••••••"
                                        value={passwordForm.newPassword}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                        className="bg-gray-800 border-gray-700 text-white focus:border-purple-500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-gray-300">Confirmar Nova Senha</Label>
                                    <Input
                                        type="password"
                                        placeholder="••••••••"
                                        value={passwordForm.confirmPassword}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                        className="bg-gray-800 border-gray-700 text-white focus:border-purple-500"
                                    />
                                </div>
                            </CardContent>
                            <CardFooter className="border-t border-gray-800 pt-4">
                                <Button
                                    onClick={() => updatePasswordMutation.mutate()}
                                    disabled={!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword || updatePasswordMutation.isPending}
                                    className="w-full bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-900/20"
                                >
                                    {updatePasswordMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                    Atualizar Senha
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default SettingsPage;
