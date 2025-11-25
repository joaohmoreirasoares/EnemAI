import { useState } from 'react';
import { Search, GraduationCap, BookOpen, User, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
    id: string;
    name: string;
    avatar_url: string | null;
    serie: string | null;
    subjects: string[] | null;
    career_goal: string | null;
    // Inferred role for now since DB doesn't have it
    role: 'student' | 'professor';
}

export const UserDirectory = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState<'all' | 'professor' | 'student'>('all');

    const { data: users = [], isLoading } = useQuery({
        queryKey: ['profiles'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('profiles')
                .select('*');

            if (error) throw error;

            return data.map((profile: any) => ({
                id: profile.id,
                name: profile.name || 'Usuário Sem Nome',
                avatar_url: profile.avatar_url,
                serie: profile.serie,
                subjects: profile.subjects,
                career_goal: profile.career_goal,
                // Simple heuristic: if name starts with "Prof" or "Dr", assume professor, else student
                role: (profile.name?.toLowerCase().startsWith('prof') || profile.name?.toLowerCase().startsWith('dr'))
                    ? 'professor'
                    : 'student'
            })) as UserProfile[];
        }
    });

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.subjects?.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesFilter = filter === 'all' || user.role === filter;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="space-y-6">
            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Buscar por nome ou matéria..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-gray-800/50 border-gray-700 text-white focus:ring-purple-500/50"
                    />
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'all' ? 'bg-purple-600 text-white' : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700'
                            }`}
                    >
                        Todos
                    </button>
                    <button
                        onClick={() => setFilter('professor')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'professor' ? 'bg-purple-600 text-white' : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700'
                            }`}
                    >
                        Professores
                    </button>
                    <button
                        onClick={() => setFilter('student')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'student' ? 'bg-purple-600 text-white' : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700'
                            }`}
                    >
                        Alunos
                    </button>
                </div>
            </div>

            {/* Users Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {isLoading ? (
                    [1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="h-24 bg-gray-800/30 rounded-xl animate-pulse" />
                    ))
                ) : filteredUsers.map((user, index) => (
                    <motion.div
                        key={user.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 flex items-center gap-4 hover:bg-gray-800/60 transition-colors group"
                    >
                        <Avatar className="h-12 w-12 border-2 border-gray-700 group-hover:border-purple-500/50 transition-colors">
                            <AvatarImage src={user.avatar_url || undefined} />
                            <AvatarFallback className="bg-gray-700 text-gray-300">
                                {user.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                            <h4 className="text-white font-medium truncate">{user.name}</h4>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                                {user.role === 'professor' ? (
                                    <Badge variant="secondary" className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-xs px-2 py-0.5 h-auto">
                                        <GraduationCap className="h-3 w-3 mr-1" /> Professor
                                    </Badge>
                                ) : (
                                    <Badge variant="secondary" className="bg-green-500/10 text-green-400 border-green-500/20 text-xs px-2 py-0.5 h-auto">
                                        <BookOpen className="h-3 w-3 mr-1" /> Aluno
                                    </Badge>
                                )}

                                {user.serie && (
                                    <span className="text-xs text-gray-500 truncate border border-gray-700 px-1.5 py-0.5 rounded">
                                        {user.serie}
                                    </span>
                                )}
                            </div>
                            {user.subjects && user.subjects.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1">
                                    {user.subjects.slice(0, 2).map(subject => (
                                        <span key={subject} className="text-[10px] text-gray-400 bg-gray-800 px-1.5 py-0.5 rounded">
                                            {subject}
                                        </span>
                                    ))}
                                    {user.subjects.length > 2 && (
                                        <span className="text-[10px] text-gray-500 px-1">+{user.subjects.length - 2}</span>
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>

            {!isLoading && filteredUsers.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                    <User className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    <p>Nenhum usuário encontrado.</p>
                </div>
            )}
        </div>
    );
};
