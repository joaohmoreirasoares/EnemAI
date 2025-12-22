import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, Edit, User, Calendar, MessageSquare, Info, Save, GraduationCap, BookOpen, School, Target, Sparkles } from 'lucide-react';
import { openOrCreateConversation } from '../lib/social';
import { toast } from 'sonner';
import { AccessibilityHelper } from '@/components/accessibility/AccessibilityHelper';

// --- Data Constants ---
const subjects = [
  "Matemática", "Física", "Química", "Biologia",
  "História", "Geografia", "Filosofia", "Sociologia",
  "Língua Portuguesa", "Literatura", "Inglês", "Espanhol", "Redação"
];
const grades = ["1º ano", "2º ano", "3º ano", "Cursinho"];

// --- Data Fetchers ---
const fetchProfile = async (profileId: string) => {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', profileId).single();
  if (error && error.code !== 'PGRST116') { // PGRST116 = 'No rows found'
    throw new Error(error.message);
  }
  return data;
};

const fetchUserDiscussions = async (profileId: string) => {
  const { data, error } = await supabase.from('discussions').select('*').eq('author_id', profileId).order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data;
};

// --- Main Component ---
const ProfilePage = () => {
  const { id: paramId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);

  const { data: sessionUser, isLoading: isLoadingSession } = useQuery({
    queryKey: ['sessionUser'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
    staleTime: Infinity,
  });

  const profileId = paramId || sessionUser?.id;

  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['profile', profileId],
    queryFn: () => fetchProfile(profileId!),
    enabled: !!profileId, // Only run query if we have an ID
  });

  const { data: discussions } = useQuery({
    queryKey: ['userDiscussions', profileId],
    queryFn: () => fetchUserDiscussions(profileId!),
    enabled: !!profileId,
  });

  const isLoading = isLoadingSession || (!!profileId && isLoadingProfile);
  const isOwnProfile = sessionUser?.id === profileId;

  useEffect(() => {
    if (profile && (!profile.full_name || !profile.username) && isOwnProfile) {
      setIsEditing(true);
      toast.info("Por favor, complete seu perfil para continuar.");
    }
  }, [profile, isOwnProfile]);

  if (isLoading) return <div className="flex justify-center items-center h-screen bg-gray-950"><Loader2 className="w-12 h-12 animate-spin text-purple-500" /></div>;

  if (!profile) {
    if (isOwnProfile && sessionUser) {
      return <CreateProfileView user={sessionUser} />;
    } else {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-white p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-4 max-w-md"
          >
            <div className="bg-gray-900/50 p-8 rounded-2xl border border-gray-800 backdrop-blur-sm">
              <User className="w-16 h-16 mx-auto text-gray-600 mb-4" />
              <h2 className="text-2xl font-bold text-white">Perfil não encontrado</h2>
              <p className="text-gray-400">O usuário que você está procurando não existe ou não completou o perfil.</p>
              <Button onClick={() => navigate('/community')} className="mt-6 bg-purple-600 hover:bg-purple-700 text-white w-full">
                Voltar para a Comunidade
              </Button>
            </div>
          </motion.div>
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white pb-20">
      {/* Header Background Decoration */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-purple-900/20 to-transparent pointer-events-none" />

      <div className="container mx-auto p-4 md:p-8 space-y-8 relative z-10">
        <AnimatePresence mode="wait">
          {isEditing ? (
            <motion.div
              key="edit"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <EditProfileView
                profile={profile}
                onCancel={() => {
                  if (isOwnProfile && (!profile.full_name || !profile.username)) {
                    toast.error("Seu perfil está incompleto. Por favor, preencha os campos obrigatórios e salve.");
                  } else {
                    setIsEditing(false);
                  }
                }}
              />
            </motion.div>
          ) : (
            <motion.div
              key="view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ViewProfileView
                profile={profile}
                isOwnProfile={isOwnProfile}
                onEdit={() => setIsEditing(true)}
                sessionUserId={sessionUser?.id}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <UserDiscussions discussions={discussions} isOwnProfile={isOwnProfile} profileId={profile.id} />
        </motion.div>
      </div>
    </div>
  );
};

// --- Profile Creation View (for legacy users) ---
const CreateProfileView = ({ user }: { user: any }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    role: 'student',
    full_name: '',
    username: '',
    grade: '',
    desired_major: '',
    difficult_subjects: [],
    grades_taught: [],
    subjects_taught: [],
  });

  const createProfileMutation = useMutation({
    mutationFn: async () => {
      const profileData: any = {
        id: user.id,
        email: user.email,
        role: formData.role,
        full_name: formData.full_name,
        username: formData.username,
      };

      if (formData.role === 'student') {
        profileData.grade = formData.grade;
        profileData.desired_major = formData.desired_major;
        profileData.difficult_subjects = formData.difficult_subjects;
      } else {
        profileData.grades_taught = formData.grades_taught;
        profileData.subjects_taught = formData.subjects_taught;
      }

      const { error } = await supabase.from('profiles').insert(profileData);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success('Perfil criado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['profile', user.id] });
    },
    onError: (error) => {
      toast.error(`Erro ao criar perfil: ${error.message}`);
    }
  });

  const handleCheckboxChange = (field: keyof typeof formData, item: string) => {
    const currentItems = (formData[field] as string[]) || [];
    const newItems = currentItems.includes(item) ? currentItems.filter((i: string) => i !== item) : [...currentItems, item];
    setFormData({ ...formData, [field]: newItems as any });
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full bg-gray-900 border-gray-800 text-white shadow-2xl shadow-purple-900/20">
        <CardHeader className="border-b border-gray-800 pb-6">
          <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">Complete seu Perfil</CardTitle>
          <CardDescription className="text-gray-400">Notamos que seu perfil está incompleto. Por favor, preencha os dados abaixo para continuar a usar o EnemAI.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={(e) => { e.preventDefault(); createProfileMutation.mutate(); }} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-gray-300">Nome Completo</Label>
                <Input id="fullName" placeholder="Seu nome" value={formData.full_name} onChange={e => setFormData({ ...formData, full_name: e.target.value })} required className="bg-gray-800 border-gray-700 text-white focus:border-purple-500" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username" className="text-gray-300">Nome de Usuário</Label>
                <Input id="username" placeholder="@usuario" value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} required className="bg-gray-800 border-gray-700 text-white focus:border-purple-500" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Você é?</Label>
              <RadioGroup value={formData.role} onValueChange={(v: 'student' | 'teacher') => setFormData({ ...formData, role: v })} className="flex gap-4">
                <div className="flex items-center space-x-2 bg-gray-800 p-3 rounded-lg border border-gray-700 w-full hover:border-purple-500/50 transition-colors cursor-pointer">
                  <RadioGroupItem value="student" id="r-student" className="border-gray-500 text-purple-500" />
                  <Label htmlFor="r-student" className="cursor-pointer text-white">Estudante</Label>
                </div>
                <div className="flex items-center space-x-2 bg-gray-800 p-3 rounded-lg border border-gray-700 w-full hover:border-purple-500/50 transition-colors cursor-pointer">
                  <RadioGroupItem value="teacher" id="r-teacher" className="border-gray-500 text-purple-500" />
                  <Label htmlFor="r-teacher" className="cursor-pointer text-white">Professor</Label>
                </div>
              </RadioGroup>
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={formData.role} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-4 overflow-hidden">
                {formData.role === 'student' ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="studentGrade" className="text-gray-300">Série</Label>
                      <Select onValueChange={value => setFormData({ ...formData, grade: value })} value={formData.grade}>
                        <SelectTrigger id="studentGrade" className="bg-gray-800 border-gray-700 text-white"><SelectValue placeholder="Selecione sua série" /></SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700 text-white">{grades.map(g => <SelectItem key={g} value={g} className="focus:bg-gray-700 focus:text-white">{g}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="desiredMajor" className="text-gray-300">Curso Desejado</Label>
                      <Input id="desiredMajor" value={formData.desired_major} onChange={e => setFormData({ ...formData, desired_major: e.target.value })} className="bg-gray-800 border-gray-700 text-white focus:border-purple-500" />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center text-gray-300">Matérias com Dificuldade <InfoIcon /></Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                        {subjects.map(s => (
                          <div key={s} className="flex items-center space-x-2">
                            <Checkbox id={`diff-${s}`} onCheckedChange={() => handleCheckboxChange('difficult_subjects', s)} checked={formData.difficult_subjects.includes(s)} className="border-gray-500 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600" />
                            <label htmlFor={`diff-${s}`} className="cursor-pointer text-gray-400">{s}</label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label className="text-gray-300">Séries que leciona</Label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                        {grades.map(g => (
                          <div key={g} className="flex items-center space-x-2">
                            <Checkbox id={`teach-grade-${g}`} onCheckedChange={() => handleCheckboxChange('grades_taught', g)} checked={formData.grades_taught.includes(g)} className="border-gray-500 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600" />
                            <label htmlFor={`teach-grade-${g}`} className="cursor-pointer text-gray-400">{g}</label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-300">Matérias que leciona</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                        {subjects.map(s => (
                          <div key={s} className="flex items-center space-x-2">
                            <Checkbox id={`teach-subj-${s}`} onCheckedChange={() => handleCheckboxChange('subjects_taught', s)} checked={formData.subjects_taught.includes(s)} className="border-gray-500 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600" />
                            <label htmlFor={`teach-subj-${s}`} className="cursor-pointer text-gray-400">{s}</label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-end pt-4 border-t border-gray-800">
              <Button type="submit" disabled={createProfileMutation.isPending} className="bg-purple-600 hover:bg-purple-700 text-white w-full md:w-auto">
                {createProfileMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Salvar e Continuar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};


// --- View/Edit Components ---
const ViewProfileView = ({ profile, isOwnProfile, onEdit, sessionUserId }: any) => {
  const navigate = useNavigate();

  const handleChat = async () => {
    if (!sessionUserId || !profile) return;
    try {
      const conversationId = await openOrCreateConversation(sessionUserId, profile.id);
      navigate(`/chat/${conversationId}`);
    } catch (error) {
      toast.error("Erro ao iniciar conversa.");
    }
  };

  return (
    <Card className="bg-gray-900/60 border-gray-800 backdrop-blur-md overflow-hidden shadow-xl shadow-purple-900/10">
      <div className="h-32 bg-gradient-to-r from-purple-900/50 to-pink-900/50 relative">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
      </div>
      <CardContent className="px-8 pb-8 -mt-12 relative">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Avatar className="w-32 h-32 border-4 border-gray-900 shadow-2xl">
                <AvatarImage src={profile.avatar_url} alt={profile.full_name} className="object-cover" />
                <AvatarFallback className="bg-gray-800 text-gray-400 text-2xl"><User /></AvatarFallback>
              </Avatar>
            </motion.div>

            <div className="text-center md:text-left mb-2">
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="text-3xl font-bold text-white flex items-center gap-2 justify-center md:justify-start"
              >
                {profile.full_name}
                {profile.role === 'teacher' && <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 ml-2 text-xs"><Sparkles className="w-3 h-3 mr-1" />Professor</Badge>}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="text-purple-400 font-medium"
              >
                @{profile.username}
              </motion.p>
            </div>
          </div>

          <div className="flex gap-3 mt-4 md:mt-12 w-full md:w-auto">
            {isOwnProfile ? (
              <AccessibilityHelper description="Editar Perfil: Atualize suas informações pessoais e acadêmicas.">
                <Button onClick={onEdit} className="flex-1 md:flex-none bg-gray-800 border border-purple-500/30 text-purple-300 hover:bg-purple-500/20 hover:text-purple-200 transition-all hover:scale-105">
                  <Edit className="h-4 w-4 mr-2" />Editar Perfil
                </Button>
              </AccessibilityHelper>
            ) : (
              <Button onClick={handleChat} className="flex-1 md:flex-none bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-900/20 transition-all hover:scale-105">
                <MessageSquare className="h-4 w-4 mr-2" />Conversar
              </Button>
            )}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="col-span-2 space-y-6"
          >
            <div className="bg-gray-800/40 rounded-xl p-6 border border-gray-700/50 hover:border-purple-500/20 transition-colors">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-500" />
                Informações Acadêmicas
              </h3>

              <div className="space-y-4">
                {profile.role === 'student' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-800">
                      <span className="text-xs text-gray-500 uppercase tracking-wider font-bold">Fase Escolar</span>
                      <p className="text-lg text-white font-medium mt-1">{profile.school_year || profile.grade || "Não informado"}</p>
                    </div>
                    <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-800">
                      <span className="text-xs text-gray-500 uppercase tracking-wider font-bold">Sonho (Curso/Uni)</span>
                      <p className="text-lg text-white font-medium mt-1">
                        {profile.dream_course || profile.desired_major || "Não informado"}
                        {profile.dream_university && <span className="block text-sm text-gray-400 mt-0.5">@ {profile.dream_university}</span>}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <span className="text-sm text-gray-400 mb-2 block">Leciona para:</span>
                      <div className="flex flex-wrap gap-2">
                        {profile.grades_taught?.length > 0 ? profile.grades_taught.map((g: string) => <Badge key={g} className="bg-gray-700 hover:bg-gray-600">{g}</Badge>) : <p className="text-gray-500 text-sm">Não informado</p>}
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-400 mb-2 block">Especialista em:</span>
                      <div className="flex flex-wrap gap-2">
                        {profile.subjects_taught?.length > 0 ? profile.subjects_taught.map((s: string) => <Badge key={s} variant="secondary" className="bg-purple-900/30 text-purple-300 border-purple-800">{s}</Badge>) : <p className="text-gray-500 text-sm">Não informado</p>}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {profile.role === 'student' && (
              <div className="bg-gray-800/40 rounded-xl p-6 border border-gray-700/50 hover:border-purple-500/20 transition-colors">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-red-400" />
                  Focos de Estudo <InfoIcon />
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(() => {
                    const subjects = (profile.struggle_subjects?.length > 0
                      ? profile.struggle_subjects
                      : profile.difficult_subjects) || [];

                    return subjects.length > 0 ? (
                      subjects.map((s: string) => (
                        <Badge key={s} variant="outline" className="border-red-900/50 text-red-300 bg-red-900/10 hover:bg-red-900/20 py-1.5 px-3">
                          {s}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm italic">Nenhuma dificuldade listada. Continue assim! 🚀</p>
                    );
                  })()}
                </div>
              </div>
            )}
          </motion.div>

          {/* Sidebar Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-4"
          >
            <div className="bg-gray-800/40 rounded-xl p-6 border border-gray-700/50 h-full">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Detalhes</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-gray-300">
                  <div className="p-2 bg-gray-700/50 rounded-lg"><User className="w-4 h-4 text-purple-400" /></div>
                  <div>
                    <p className="text-xs text-gray-500">Função</p>
                    <p className="font-medium capitalize">{profile.role === 'student' ? 'Estudante' : 'Professor'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <div className="p-2 bg-gray-700/50 rounded-lg"><Calendar className="w-4 h-4 text-purple-400" /></div>
                  <div>
                    <p className="text-xs text-gray-500">Membro desde</p>
                    <p className="font-medium">{new Date(profile.created_at).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <div className="p-2 bg-gray-700/50 rounded-lg"><School className="w-4 h-4 text-purple-400" /></div>
                  <div>
                    <p className="text-xs text-gray-500">Status</p>
                    <p className="font-medium text-green-400">Ativo</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </CardContent>
    </Card>
  );
};

const EditProfileView = ({ profile, onCancel }: any) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState(profile);

  const updateProfileMutation = useMutation({
    mutationFn: async (updatedProfile: any) => {
      const { created_at, id, email, ...updateData } = formData;
      const { error } = await supabase.from('profiles').update(updateData).eq('id', profile.id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success('Perfil atualizado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['profile', profile.id] });
      onCancel();
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar perfil: ${error.message}`);
    }
  });

  const handleCheckboxChange = (field: string, item: string) => {
    const currentItems = formData[field] || [];
    const newItems = currentItems.includes(item) ? currentItems.filter((i: string) => i !== item) : [...currentItems, item];
    setFormData({ ...formData, [field]: newItems });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate();
  };

  return (
    <Card className="bg-gray-900 border-gray-800 text-white shadow-xl">
      <CardHeader className="border-b border-gray-800">
        <CardTitle className="text-xl flex items-center gap-2"><Edit className="w-5 h-5 text-purple-500" /> Editar Perfil</CardTitle>
        <CardDescription className="text-gray-400">Atualize suas informações. As mudanças serão salvas para todos.</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-gray-300">Nome Completo</Label>
              <Input id="fullName" value={formData.full_name} onChange={e => setFormData({ ...formData, full_name: e.target.value })} className="bg-gray-800 border-gray-700 text-white focus:border-purple-500" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username" className="text-gray-300">Nome de Usuário</Label>
              <Input id="username" value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} className="bg-gray-800 border-gray-700 text-white focus:border-purple-500" />
            </div>
          </div>

          {formData.role === 'student' ? (
            <div className="space-y-6 border-t border-gray-800 pt-6">
              <div className="space-y-2">
                <Label htmlFor="studentGrade" className="text-gray-300">Série</Label>
                <Select onValueChange={value => setFormData({ ...formData, grade: value })} value={formData.grade}>
                  <SelectTrigger id="studentGrade" className="bg-gray-800 border-gray-700 text-white"><SelectValue placeholder="Selecione sua série" /></SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700 text-white">{grades.map(g => <SelectItem key={g} value={g} className="focus:bg-gray-700 focus:text-white">{g}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="desiredMajor" className="text-gray-300">Curso Desejado</Label>
                <Input id="desiredMajor" value={formData.desired_major || ''} onChange={e => setFormData({ ...formData, desired_major: e.target.value })} className="bg-gray-800 border-gray-700 text-white focus:border-purple-500" />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center text-gray-300">Matérias com Dificuldade <InfoIcon /></Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {subjects.map(s => (
                    <div key={s} className="flex items-center space-x-2 bg-gray-800/50 p-2 rounded border border-gray-700/50">
                      <Checkbox id={`diff-${s}`} onCheckedChange={() => handleCheckboxChange('difficult_subjects', s)} checked={formData.difficult_subjects?.includes(s)} className="border-gray-500 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600" />
                      <label htmlFor={`diff-${s}`} className="cursor-pointer text-sm text-gray-300 select-none w-full">{s}</label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6 border-t border-gray-800 pt-6">
              <div className="space-y-2">
                <Label className="text-gray-300">Séries que leciona</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {grades.map(g => (
                    <div key={g} className="flex items-center space-x-2 bg-gray-800/50 p-2 rounded border border-gray-700/50">
                      <Checkbox id={`teach-grade-${g}`} onCheckedChange={() => handleCheckboxChange('grades_taught', g)} checked={formData.grades_taught?.includes(g)} className="border-gray-500 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600" />
                      <label htmlFor={`teach-grade-${g}`} className="cursor-pointer text-sm text-gray-300 select-none w-full">{g}</label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Matérias que leciona</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {subjects.map(s => (
                    <div key={s} className="flex items-center space-x-2 bg-gray-800/50 p-2 rounded border border-gray-700/50">
                      <Checkbox id={`teach-subj-${s}`} onCheckedChange={() => handleCheckboxChange('subjects_taught', s)} checked={formData.subjects_taught?.includes(s)} className="border-gray-500 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600" />
                      <label htmlFor={`teach-subj-${s}`} className="cursor-pointer text-sm text-gray-300 select-none w-full">{s}</label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-4 pt-4 border-t border-gray-800">
            <Button type="button" variant="ghost" onClick={onCancel} className="text-gray-400 hover:text-white hover:bg-gray-800">Cancelar</Button>
            <Button type="submit" disabled={updateProfileMutation.isPending} className="bg-purple-600 hover:bg-purple-700 text-white">
              {updateProfileMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Salvar Alterações
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

const UserDiscussions = ({ discussions, isOwnProfile, profileId }: any) => {
  const navigate = useNavigate();
  if (!discussions) return null;

  return (
    <Card className="bg-gray-900/40 border-gray-800 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl text-white flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-purple-500" />
          Discussões Recentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        {discussions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {discussions.map((d: any, index: number) => (
              <motion.div
                key={d.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, backgroundColor: 'rgba(31, 41, 55, 0.5)' }}
                className="p-4 rounded-xl border border-gray-800 bg-gray-900/30 cursor-pointer transition-all hover:border-purple-500/30 group"
                onClick={() => navigate(`/discussion/${d.id}`)}
              >
                <h4 className="font-semibold text-gray-200 group-hover:text-purple-300 transition-colors line-clamp-1">{d.title}</h4>
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                  <Badge variant="outline" className="border-gray-700 text-gray-400 bg-gray-800/50">{d.tag}</Badge>
                  <span>• {new Date(d.created_at).toLocaleDateString('pt-BR')}</span>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border-2 border-dashed border-gray-800 rounded-xl bg-gray-900/20">
            <MessageSquare className="w-10 h-10 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500">{isOwnProfile ? 'Você ainda não iniciou nenhuma discussão.' : 'Este usuário não possui discussões.'}</p>
            {isOwnProfile && <Button className="mt-4 bg-purple-600 hover:bg-purple-700 text-white" onClick={() => navigate('/community')}>Criar Discussão</Button>}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const InfoIcon = () => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild><Info className="w-4 h-4 ml-1.5 cursor-help text-gray-500 hover:text-purple-400 transition-colors" /></TooltipTrigger>
      <TooltipContent className="bg-gray-800 border-gray-700 text-gray-200"><p>Esta informação é privada e não será exibida no seu perfil público.</p></TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

export default ProfilePage;