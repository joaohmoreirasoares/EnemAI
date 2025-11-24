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
import { Loader2, Edit, User, Calendar, MessageSquare, Info, Save } from 'lucide-react';
import { openOrCreateConversation } from '../lib/social';
import { toast } from 'sonner';

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

  if (isLoading) return <div className="flex justify-center items-center h-screen"><Loader2 className="w-12 h-12 animate-spin text-primary" /></div>;
  
  if (!profile) {
    if (isOwnProfile && sessionUser) {
      return <CreateProfileView user={sessionUser} />;
    } else {
      return (
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold">Perfil não encontrado</h2>
          <p className="text-muted-foreground">O usuário que você está procurando não existe ou não completou o perfil.</p>
          <Button onClick={() => navigate('/community')} className="mt-4">Voltar para a Comunidade</Button>
        </div>
      );
    }
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <AnimatePresence mode="wait">
        {isEditing ? (
          <motion.div key="edit">
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
          <motion.div key="view">
            <ViewProfileView 
              profile={profile} 
              isOwnProfile={isOwnProfile} 
              onEdit={() => setIsEditing(true)} 
              sessionUserId={sessionUser?.id}
            />
          </motion.div>
        )}
      </AnimatePresence>
      <UserDiscussions discussions={discussions} isOwnProfile={isOwnProfile} profileId={profile.id} />
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
    const newItems = currentItems.includes(item) ? currentItems.filter((i:string) => i !== item) : [...currentItems, item];
    setFormData({ ...formData, [field]: newItems as any });
  };

  return (
    <div className="container mx-auto p-4">
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Complete seu Perfil</CardTitle>
                <CardDescription>Notamos que seu perfil está incompleto. Por favor, preencha os dados abaixo para continuar a usar o EnemAI.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={(e) => { e.preventDefault(); createProfileMutation.mutate(); }} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="fullName">Nome Completo</Label>
                            <Input id="fullName" placeholder="Seu nome" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="username">Nome de Usuário</Label>
                            <Input id="username" placeholder="@usuario" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} required />
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <Label>Você é?</Label>
                        <RadioGroup value={formData.role} onValueChange={(v: 'student' | 'teacher') => setFormData({...formData, role: v})} className="flex gap-4">
                            <div className="flex items-center space-x-2"><RadioGroupItem value="student" id="r-student" /><Label htmlFor="r-student">Estudante</Label></div>
                            <div className="flex items-center space-x-2"><RadioGroupItem value="teacher" id="r-teacher" /><Label htmlFor="r-teacher">Professor</Label></div>
                        </RadioGroup>
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div key={formData.role} initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="space-y-4 border-t pt-4">
                            {formData.role === 'student' ? (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="studentGrade">Série</Label>
                                        <Select onValueChange={value => setFormData({...formData, grade: value})} value={formData.grade}>
                                            <SelectTrigger id="studentGrade"><SelectValue placeholder="Selecione sua série" /></SelectTrigger>
                                            <SelectContent>{grades.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="desiredMajor">Curso Desejado</Label>
                                        <Input id="desiredMajor" value={formData.desired_major} onChange={e => setFormData({...formData, desired_major: e.target.value})} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="flex items-center">Matérias com Dificuldade <InfoIcon /></Label>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                                            {subjects.map(s => (
                                                <div key={s} className="flex items-center space-x-2">
                                                    <Checkbox id={`diff-${s}`} onCheckedChange={() => handleCheckboxChange('difficult_subjects', s)} checked={formData.difficult_subjects.includes(s)} />
                                                    <label htmlFor={`diff-${s}`} className="cursor-pointer">{s}</label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </> 
                            ) : (
                                <>
                                    <div className="space-y-2">
                                        <Label>Séries que leciona</Label>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                                            {grades.map(g => (
                                                <div key={g} className="flex items-center space-x-2">
                                                    <Checkbox id={`teach-grade-${g}`} onCheckedChange={() => handleCheckboxChange('grades_taught', g)} checked={formData.grades_taught.includes(g)} />
                                                    <label htmlFor={`teach-grade-${g}`} className="cursor-pointer">{g}</label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Matérias que leciona</Label>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                                            {subjects.map(s => (
                                                <div key={s} className="flex items-center space-x-2">
                                                    <Checkbox id={`teach-subj-${s}`} onCheckedChange={() => handleCheckboxChange('subjects_taught', s)} checked={formData.subjects_taught.includes(s)} />
                                                    <label htmlFor={`teach-subj-${s}`} className="cursor-pointer">{s}</label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    <div className="flex justify-end pt-4">
                        <Button type="submit" disabled={createProfileMutation.isPending}>
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
    <Card>
        <CardHeader>
            <div className="flex justify-between items-start">
                <div>
                    <CardTitle className="text-2xl">{profile.full_name}</CardTitle>
                    <CardDescription>@{profile.username}</CardDescription>
                </div>
                {isOwnProfile ? (
                    <Button onClick={onEdit} size="sm" variant="outline"><Edit className="h-4 w-4 mr-2" />Editar</Button>
                ) : (
                    <Button onClick={handleChat} size="sm"><MessageSquare className="h-4 w-4 mr-2" />Conversar</Button>
                )}
            </div>
        </CardHeader>
      <CardContent className="p-6 pt-0">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <Avatar className="w-24 h-24 border-2 border-primary">
            <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
            <AvatarFallback><User className="w-10 h-10" /></AvatarFallback>
          </Avatar>
          <div className="flex-1 w-full">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <Badge variant={profile.role === 'student' ? 'default' : 'secondary'}>{profile.role === 'student' ? 'Estudante' : 'Professor'}</Badge>
              <span className="flex items-center"><Calendar className="h-4 w-4 mr-1" />Membro desde {new Date(profile.created_at).toLocaleDateString('pt-BR')}</span>
            </div>
            
            <div className="space-y-3 text-sm">
              {profile.role === 'student' ? (
                <>
                  <p><strong className="font-medium text-foreground">Série:</strong> {profile.grade || "Não informado"}</p>
                  <p><strong className="font-medium text-foreground">Curso Desejado:</strong> {profile.desired_major || "Não informado"}</p>
                  <div>
                    <strong className="font-medium text-foreground flex items-center">Matérias com Dificuldade <InfoIcon /></strong>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {profile.difficult_subjects?.length > 0 ? profile.difficult_subjects.map((s:string) => <Badge key={s} variant="destructive">{s}</Badge>) : <p className="text-muted-foreground text-xs">Nenhuma</p>}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <strong className="font-medium text-foreground">Leciona para:</strong>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {profile.grades_taught?.length > 0 ? profile.grades_taught.map((g:string) => <Badge key={g}>{g}</Badge>) : <p className="text-muted-foreground text-xs">Não informado</p>}
                    </div>
                  </div>
                  <div>
                    <strong className="font-medium text-foreground">Especialista em:</strong>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {profile.subjects_taught?.length > 0 ? profile.subjects_taught.map((s:string) => <Badge key={s} variant="secondary">{s}</Badge>) : <p className="text-muted-foreground text-xs">Não informado</p>}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
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
      const { error } = await supabase.from('profiles').update(updatedProfile).eq('id', profile.id);
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
    const newItems = currentItems.includes(item) ? currentItems.filter((i:string) => i !== item) : [...currentItems, item];
    setFormData({ ...formData, [field]: newItems });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { created_at, id, email, ...updateData } = formData;
    updateProfileMutation.mutate(updateData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Editar Perfil</CardTitle>
        <CardDescription>Atualize suas informações. As mudanças serão salvas para todos.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nome Completo</Label>
              <Input id="fullName" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Nome de Usuário</Label>
              <Input id="username" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
            </div>
          </div>

          {formData.role === 'student' ? (
            <div className="space-y-4 border-t pt-4">
              <div className="space-y-2">
                <Label htmlFor="studentGrade">Série</Label>
                <Select onValueChange={value => setFormData({...formData, grade: value})} value={formData.grade}>
                  <SelectTrigger id="studentGrade"><SelectValue placeholder="Selecione sua série" /></SelectTrigger>
                  <SelectContent>{grades.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="desiredMajor">Curso Desejado</Label>
                <Input id="desiredMajor" value={formData.desired_major || ''} onChange={e => setFormData({...formData, desired_major: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center">Matérias com Dificuldade <InfoIcon /></Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                  {subjects.map(s => (
                    <div key={s} className="flex items-center space-x-2">
                      <Checkbox id={`diff-${s}`} onCheckedChange={() => handleCheckboxChange('difficult_subjects', s)} checked={formData.difficult_subjects?.includes(s)} />
                      <label htmlFor={`diff-${s}`} className="cursor-pointer">{s}</label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
             <div className="space-y-4 border-t pt-4">
                <div className="space-y-2">
                  <Label>Séries que leciona</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    {grades.map(g => (
                      <div key={g} className="flex items-center space-x-2">
                        <Checkbox id={`teach-grade-${g}`} onCheckedChange={() => handleCheckboxChange('grades_taught', g)} checked={formData.grades_taught?.includes(g)} />
                        <label htmlFor={`teach-grade-${g}`} className="cursor-pointer">{g}</label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Matérias que leciona</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                    {subjects.map(s => (
                      <div key={s} className="flex items-center space-x-2">
                        <Checkbox id={`teach-subj-${s}`} onCheckedChange={() => handleCheckboxChange('subjects_taught', s)} checked={formData.subjects_taught?.includes(s)} />
                        <label htmlFor={`teach-subj-${s}`} className="cursor-pointer">{s}</label>
                      </div>
                    ))}
                  </div>
                </div>
            </div>
          )}

          <div className="flex justify-end gap-4 pt-4 border-t">
            <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
            <Button type="submit" disabled={updateProfileMutation.isPending}>
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
    <Card>
      <CardHeader>
        <CardTitle>Discussões Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        {discussions.length > 0 ? (
          <div className="space-y-4">
            {discussions.map((d: any) => (
              <div key={d.id} className="border-b pb-2 last:border-0 last:pb-0">
                <a onClick={() => navigate(`/discussion/${d.id}`)} className="font-semibold hover:underline cursor-pointer">{d.title}</a>
                <p className="text-sm text-muted-foreground">em <Badge variant="secondary">{d.tag}</Badge> - {new Date(d.created_at).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">{isOwnProfile ? 'Você ainda não iniciou nenhuma discussão.' : 'Este usuário não possui discussões.'}</p>
            {isOwnProfile && <Button className="mt-4" onClick={() => navigate('/community')}>Criar Discussão</Button>}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const InfoIcon = () => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild><Info className="w-4 h-4 ml-1.5 cursor-help text-muted-foreground" /></TooltipTrigger>
      <TooltipContent><p>Esta informação é privada e não será exibida no seu perfil público.</p></TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

export default ProfilePage;