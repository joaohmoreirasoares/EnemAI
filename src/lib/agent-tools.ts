import { supabase } from '@/integrations/supabase/client';

/**
 * Interface defining the structure of an AI tool.
 * Used to generate the JSON schema passed to the LLM system prompt.
 */
export interface AgentTool {
    name: string;
    description: string;
    parameters: {
        type: string;
        properties: Record<string, {
            type: string;
            description: string;
            enum?: string[];
        }>;
        required: string[];
    };
}

/**
 * List of available tools for the AI Agent.
 * These definitions are injected into the system prompt.
 */
export const TOOLS: AgentTool[] = [
    {
        name: 'list_notes',
        description: 'List all available notes from the user. Use this to discover what notes exist before reading a specific one.',
        parameters: {
            type: 'object',
            properties: {},
            required: [],
        },
    },
    {
        name: 'read_note',
        description: 'Read the full content of a specific note. Use this when you need to see the details of a note found via search or list.',
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

// ============================================================================
// Tool Implementations
// ============================================================================

/**
 * Lists all notes for the authenticated user.
 * Optimization: Returns only titles to minimize token usage.
 */
export async function listNotes() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
        .from('notes')
        .select('title') // Only fetch titles for efficiency
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

    if (error) throw error;

    // Return a simple list of strings to be friendly to the LLM
    return data.map(note => note.title);
}

/**
 * Reads the full content of a specific note by title.
 */
export async function readNote(title: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
        .from('notes')
        .select('title, content, updated_at')
        .eq('user_id', user.id)
        .eq('title', title)
        .single();

    if (error) throw error;
    return data;
}

/**
 * Searches for notes matching a query string.
 */
export async function searchNotes(query: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
        .from('notes')
        .select('title, updated_at') // Don't fetch full content in search results to save tokens
        .eq('user_id', user.id)
        .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
        .limit(5);

    if (error) throw error;
    return data;
}

/**
 * Updates the content of an existing note.
 */
export async function updateNote(title: string, content: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // First check if note exists to get its ID
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
