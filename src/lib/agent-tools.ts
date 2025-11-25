import { supabase } from '@/integrations/supabase/client';

export interface AgentTool {
    name: string;
    description: string;
    parameters: any;
}

export const TOOLS: AgentTool[] = [
    {
        name: 'search_notes',
        description: 'Search for notes by title or content. Use this to find relevant notes when the user asks about a specific topic.',
        parameters: {
            type: 'object',
            properties: {
                query: {
                    type: 'string',
                    description: 'The search query to find notes.',
                },
            },
            required: ['query'],
        },
    },
    {
        name: 'read_note',
        description: 'Read the full content of a specific note. Use this when you need to see the details of a note found via search.',
        parameters: {
            type: 'object',
            properties: {
                title: {
                    type: 'string',
                    description: 'The exact title of the note to read.',
                },
            },
            required: ['title'],
        },
    },
    {
        name: 'update_note',
        description: 'Update the content of an existing note. Use this to append information or rewrite a note.',
        parameters: {
            type: 'object',
            properties: {
                title: {
                    type: 'string',
                    description: 'The exact title of the note to update.',
                },
                content: {
                    type: 'string',
                    description: 'The new content for the note. This replaces the old content, so be sure to include everything.',
                },
            },
            required: ['title', 'content'],
        },
    },
];

export async function searchNotes(query: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
        .from('notes')
        .select('id, title, updated_at')
        .eq('user_id', user.id)
        .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
        .limit(5);

    if (error) throw error;
    return data;
}

export async function readNote(title: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
        .from('notes')
        .select('id, title, content, updated_at')
        .eq('user_id', user.id)
        .eq('title', title)
        .single();

    if (error) throw error;
    return data;
}

export async function updateNote(title: string, content: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // First check if note exists
    const { data: existingNote } = await supabase
        .from('notes')
        .select('id')
        .eq('user_id', user.id)
        .eq('title', title)
        .single();

    if (!existingNote) {
        throw new Error(`Note with title "${title}" not found.`);
    }

    const { data, error } = await supabase
        .from('notes')
        .update({ content, updated_at: new Date().toISOString() })
        .eq('id', existingNote.id)
        .select()
        .single();

    if (error) throw error;
    return data;
}
