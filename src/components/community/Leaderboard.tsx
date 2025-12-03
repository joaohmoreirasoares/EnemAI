import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, Medal, Flame, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { calculateStats } from '@/lib/streak';

interface LeaderboardUser {
    id: string;
    name: string;
    avatar_url: string | null;
    points: number;
    streak: number;
    rank: number;
}

export const Leaderboard = () => {
    const { data: leaderboard = [], isLoading } = useQuery({
        queryKey: ['leaderboard'],
        queryFn: async () => {
            // Fetch profiles
            const { data: profiles, error: profilesError } = await supabase
                .from('profiles')
                .select('id, name, avatar_url');

            if (profilesError) throw profilesError;

            // Fetch discussions for XP calculation
            const { data: discussions, error: discussionsError } = await supabase
                .from('discussions')
                .select('author_id');

            if (discussionsError) throw discussionsError;

            // Fetch notes for Streak calculation
            // Note: RLS might restrict this to only the current user's notes, 
            // so streaks for others might be 0, which is expected behavior for now.
            const { data: notes, error: notesError } = await supabase
                .from('notes_metadata')
                .select('user_id, updated_at, created_at');

            if (notesError) throw notesError;

            // Process data
            const stats = profiles.map(profile => {
                const userDiscussions = discussions?.filter(d => d.author_id === profile.id) || [];
                const userNotes = notes?.filter(n => n.user_id === profile.id) || [];

                // XP: 50 points per discussion
                const points = userDiscussions.length * 50;

                // Streak: Calculated from notes activity
                const { streakDays } = calculateStats(userNotes);

                return {
                    id: profile.id,
                    name: profile.name || 'Usuário',
                    avatar_url: profile.avatar_url,
                    points,
                    streak: streakDays,
                };
            });

            // Sort by points (descending) and assign rank
            return stats
                .sort((a, b) => b.points - a.points)
                .slice(0, 5) // Top 5
                .map((user, index) => ({
                    ...user,
                    rank: index + 1
                }));
        }
    });

    return (
        <div className="bg-gray-900/50 backdrop-blur-md border border-gray-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                        <Trophy className="h-5 w-5 text-yellow-500" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Top Estudantes</h3>
                </div>
                <div className="text-xs font-medium text-purple-400 bg-purple-500/10 px-2 py-1 rounded border border-purple-500/20">
                    Semanal
                </div>
            </div>

            <div className="space-y-4">
                {isLoading ? (
                    [1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-14 bg-gray-800/30 rounded-xl animate-pulse" />
                    ))
                ) : leaderboard.map((user, index) => (
                    <motion.div
                        key={user.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`group flex items-center gap-4 p-3 rounded-xl transition-all duration-300 ${index === 0 ? 'bg-gradient-to-r from-yellow-500/10 to-transparent border border-yellow-500/20' :
                                index === 1 ? 'bg-gradient-to-r from-gray-400/10 to-transparent border border-gray-400/20' :
                                    index === 2 ? 'bg-gradient-to-r from-amber-700/10 to-transparent border border-amber-700/20' :
                                        'hover:bg-gray-800/40 border border-transparent hover:border-gray-700/50'
                            }`}
                    >
                        <div className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm ${index === 0 ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20' :
                                index === 1 ? 'bg-gray-300 text-black shadow-lg shadow-gray-300/20' :
                                    index === 2 ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20' :
                                        'text-gray-500 bg-gray-800'
                            }`}>
                            {index + 1}
                        </div>

                        <div className="relative">
                            <Avatar className={`h-10 w-10 border-2 ${index === 0 ? 'border-yellow-500' :
                                    index === 1 ? 'border-gray-300' :
                                        index === 2 ? 'border-amber-600' :
                                            'border-gray-700 group-hover:border-gray-600'
                                }`}>
                                <AvatarImage src={user.avatar_url || undefined} />
                                <AvatarFallback className="bg-gray-800 text-xs text-gray-300">
                                    {user.name.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            {user.streak > 0 && (
                                <div className="absolute -bottom-1 -right-1 bg-gray-900 rounded-full p-0.5 border border-gray-800">
                                    <Flame className="h-3 w-3 text-orange-500 fill-orange-500" />
                                </div>
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <p className={`text-sm font-bold truncate ${index === 0 ? 'text-yellow-500' :
                                    index === 1 ? 'text-gray-300' :
                                        index === 2 ? 'text-amber-500' :
                                            'text-gray-300 group-hover:text-white'
                                }`}>
                                {user.name}
                            </p>
                            <p className="text-xs text-gray-500 flex items-center gap-1 group-hover:text-gray-400 transition-colors">
                                {user.points} XP
                            </p>
                        </div>

                        {index < 3 && (
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <Medal className={`h-5 w-5 ${index === 0 ? 'text-yellow-500' :
                                        index === 1 ? 'text-gray-300' :
                                            'text-amber-600'
                                    }`} />
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-800 text-center">
                <button className="text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors hover:underline decoration-purple-500/30 underline-offset-4">
                    Ver ranking completo
                </button>
            </div>
        </div>
    );
};
