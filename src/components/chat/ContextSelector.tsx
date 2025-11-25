import { useState } from 'react';
import { Check, ChevronsUpDown, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';

interface Note {
    id: string;
    title: string;
}

interface ContextSelectorProps {
    notes: Note[];
    selectedNoteIds: string[];
    onSelectionChange: (ids: string[]) => void;
}

const ContextSelector = ({ notes, selectedNoteIds, onSelectionChange }: ContextSelectorProps) => {
    const [open, setOpen] = useState(false);

    const toggleNote = (noteId: string) => {
        if (selectedNoteIds.includes(noteId)) {
            onSelectionChange(selectedNoteIds.filter(id => id !== noteId));
        } else {
            onSelectionChange([...selectedNoteIds, noteId]);
        }
    };

    return (
        <div className="flex flex-col gap-2 p-2">
            <div className="flex items-center gap-2">
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={open}
                            className="w-full justify-between bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700 hover:text-white"
                        >
                            <div className="flex items-center truncate">
                                <FileText className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                                {selectedNoteIds.length === 0
                                    ? "Selecionar anotações para contexto..."
                                    : `${selectedNoteIds.length} anotação(ões) selecionada(s)`}
                            </div>
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0 bg-gray-800 border-gray-700 text-white">
                        <Command className="bg-gray-800 text-white">
                            <CommandInput placeholder="Buscar anotação..." className="text-white" />
                            <CommandList>
                                <CommandEmpty>Nenhuma anotação encontrada.</CommandEmpty>
                                <CommandGroup>
                                    {notes.map((note) => (
                                        <CommandItem
                                            key={note.id}
                                            value={note.title}
                                            onSelect={() => toggleNote(note.id)}
                                            className="cursor-pointer hover:bg-gray-700 aria-selected:bg-gray-700"
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    selectedNoteIds.includes(note.id) ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            {note.title}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            </div>

            {selectedNoteIds.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                    {selectedNoteIds.map(id => {
                        const note = notes.find(n => n.id === id);
                        if (!note) return null;
                        return (
                            <Badge key={id} variant="secondary" className="bg-purple-900/50 text-purple-200 hover:bg-purple-900/70">
                                {note.title}
                                <button
                                    className="ml-1 hover:text-white"
                                    onClick={() => toggleNote(id)}
                                >
                                    ×
                                </button>
                            </Badge>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ContextSelector;
