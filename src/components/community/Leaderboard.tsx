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
                .from('notes')
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
        <div className="bg-gray-900/30 backdrop-blur-sm border border-gray-800/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-4">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <h3 className="text-lg font-bold text-white">Top Estudantes</h3>
            </div>

            <div className="space-y-3">
                {isLoading ? (
                    [1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-12 bg-gray-800/30 rounded-lg animate-pulse" />
                    ))
                ) : leaderboard.map((user, index) => (
                    <motion.div
                        key={user.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${index < 3 ? 'bg-gradient-to-r from-gray-800/50 to-transparent border border-gray-700/30' : 'hover:bg-gray-800/30'
                            }`}
                    >
                        <div className="flex-shrink-0 w-6 text-center font-bold text-gray-500">
                            {index === 0 && <Medal className="h-5 w-5 text-yellow-400 mx-auto" />}
                            {index === 1 && <Medal className="h-5 w-5 text-gray-300 mx-auto" />}
                            {index === 2 && <Medal className="h-5 w-5 text-amber-600 mx-auto" />}
                            {index > 2 && `#${user.rank}`}
                        </div>

                        <Avatar className="h-8 w-8 border border-gray-700">
                            <AvatarImage src={user.avatar_url || undefined} />
                            <AvatarFallback className="bg-purple-900 text-xs text-purple-200">
                                {user.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-200 truncate">{user.name}</p>
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                                <Star className="h-3 w-3 text-purple-400" /> {user.points} XP
                            </p>
                        </div>

                        {user.streak > 0 && (
                            <div className="flex items-center gap-0.5 text-orange-500" title={`${user.streak} dias seguidos`}>
                                <Flame className="h-3 w-3 fill-orange-500" />
                                <span className="text-xs font-bold">{user.streak}</span>
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-800 text-center">
                <button className="text-xs text-purple-400 hover:text-purple-300 transition-colors">
                    Ver ranking completo
                </button>
            </div>
        </div>
    );
};
