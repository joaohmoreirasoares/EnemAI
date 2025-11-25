import { differenceInCalendarDays, isSameDay, parseISO } from 'date-fns';

export interface ChatStats {
    totalChats: number;
    chatsToday: number;
    streakDays: number;
}

export function calculateStats(conversations: any[]): ChatStats {
    if (!conversations || conversations.length === 0) {
        return { totalChats: 0, chatsToday: 0, streakDays: 0 };
    }

    const now = new Date();
    const sortedConversations = [...conversations].sort((a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );

    // Total chats
    const totalChats = conversations.length;

    // Chats today
    const chatsToday = conversations.filter(c =>
        isSameDay(parseISO(c.created_at), now)
    ).length;

    // Streak calculation
    // We need to find consecutive days with at least one conversation (created or updated?)
    // Usually streak implies activity. Let's use 'updated_at' as activity.
    // We get all unique days from updated_at
    const uniqueDays = Array.from(new Set(
        conversations.map(c => parseISO(c.updated_at).toISOString().split('T')[0])
    )).sort().reverse(); // Newest first

    let streak = 0;
    const todayStr = now.toISOString().split('T')[0];
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Check if there is activity today or yesterday to start the streak
    // If no activity today OR yesterday, streak is 0 (broken)
    // Unless we want to be lenient and say streak doesn't break until end of today.
    // But usually streak is "consecutive days up to now".

    if (uniqueDays.length === 0) return { totalChats, chatsToday, streakDays: 0 };

    // If the most recent activity is not today or yesterday, streak is 0
    const lastActivityDate = uniqueDays[0];
    if (lastActivityDate !== todayStr && lastActivityDate !== yesterdayStr) {
        return { totalChats, chatsToday, streakDays: 0 };
    }

    // Count consecutive days
    // We iterate through uniqueDays. 
    // uniqueDays[0] is either today or yesterday.
    // We check if uniqueDays[i] is 1 day before uniqueDays[i-1] (conceptually)
    // Actually, simpler:
    // We just check if we have a sequence.

    let currentCheckDate = new Date(uniqueDays[0]); // Start from the latest active day
    streak = 1; // We have at least one day (today or yesterday)

    for (let i = 1; i < uniqueDays.length; i++) {
        const prevDate = new Date(uniqueDays[i]);
        const diff = differenceInCalendarDays(currentCheckDate, prevDate);

        if (diff === 1) {
            streak++;
            currentCheckDate = prevDate;
        } else {
            break;
        }
    }

    return {
        totalChats,
        chatsToday,
        streakDays: streak
    };
}
