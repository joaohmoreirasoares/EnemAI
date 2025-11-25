import { useState, useEffect } from 'react';
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Search, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export function QuickSwitcher() {
    const [open, setOpen] = useState(false);
    const [notes, setNotes] = useState<any[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    useEffect(() => {
        if (open) {
            const fetchNotes = async () => {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                const { data } = await supabase
                    .from('notes')
                    .select('id, title, updated_at')
                    .eq('user_id', user.id)
                    .order('updated_at', { ascending: false });

                if (data) setNotes(data);
            };

            fetchNotes();
        }
    }, [open]);

    return (
        <CommandDialog open={open} onOpenChange={setOpen}>
            <CommandInput placeholder="Buscar anotação..." />
            <CommandList>
                <CommandEmpty>Nenhuma anotação encontrada.</CommandEmpty>
                <CommandGroup heading="Anotações">
                    {notes.map((note) => (
                        <CommandItem
                            key={note.id}
                            onSelect={() => {
                                setOpen(false);
                                // We need a way to open the note. Since Notes is a page, 
                                // we might need to pass this state via URL or context.
                                // For now, let's assume we navigate to /notes?id=...
                                navigate(`/notes?id=${note.id}`);
                            }}
                        >
                            <FileText className="mr-2 h-4 w-4" />
                            <span>{note.title}</span>
                        </CommandItem>
                    ))}
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    );
}
