import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner"; // Assuming you have sonner for toasts

interface CreateSimuladoModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

// Define the type for a single note
interface Note {
  id: string;
  title: string;
}

export function CreateSimuladoModal({
  isOpen,
  onOpenChange,
}: CreateSimuladoModalProps) {
  const navigate = useNavigate();
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
  const [numQuestions, setNumQuestions] = useState<number>(10);

  // Fetch user's notes (only id and title)
  const { data: notes = [], isLoading: isLoadingNotes } = useQuery<Note[]>({
    queryKey: ['notes-list'], // Use a different key to avoid conflict with the main notes page
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('notes')
        .select('id, title')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error("Error fetching notes:", error);
        throw error;
      };
      return data;
    },
    enabled: isOpen, // Only fetch when the modal is open
  });

  // Mutation for generating the simulado
  const generateSimuladoMutation = useMutation({
    mutationFn: async ({ selectedNoteIds, numQuestions, userId }: { selectedNoteIds: string[], numQuestions: number, userId: string }) => {
      const { data, error } = await supabase.functions.invoke('generate-simulado', {
        body: { selectedNoteIds, numQuestions, userId },
      });

      if (error) {
        throw new Error(error.message || 'Failed to generate simulado');
      }

      return data;
    },
    onSuccess: (data) => {
      toast.success("Simulado gerado com sucesso!");
      onOpenChange(false); // Close modal
      if (data && data.simuladoId) {
        navigate(`/simulado/${data.simuladoId}`); // Navigate to the new simulado page
      } else {
        throw new Error("Simulado ID not returned from function.");
      }
    },
    onError: (error: Error) => {
      toast.error(`Erro ao gerar simulado: ${error.message}`);
      console.error("Simulado generation error:", error);
    },
  });

  const handleNoteSelection = (noteId: string) => {
    setSelectedNotes((prev) =>
      prev.includes(noteId)
        ? prev.filter((id) => id !== noteId)
        : [...prev, noteId]
    );
  };

  const handleGenerate = async () => {
    if (selectedNotes.length === 0) {
      toast.warning("Selecione pelo menos uma anotação.");
      return;
    }
    if (numQuestions <= 0) {
      toast.warning("O número de questões deve ser positivo.");
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Usuário não autenticado. Faça login para criar um simulado.");
      return;
    }

    generateSimuladoMutation.mutate({
      selectedNoteIds: selectedNotes,
      numQuestions: numQuestions,
      userId: user.id,
    });
  };

  const isGenerating = generateSimuladoMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Criar Novo Simulado</DialogTitle>
          <DialogDescription>
            Selecione as anotações que servirão de base e defina o número de questões.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="flex flex-col gap-3">
            <Label htmlFor="notes-list">1. Selecione as Anotações</Label>
            <ScrollArea className="h-48 w-full rounded-md border p-4">
              {isLoadingNotes ? (
                <p className="text-sm text-muted-foreground">Carregando anotações...</p>
              ) : notes.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma anotação encontrada.</p>
              ) : (
                <div className="space-y-2">
                  {notes.map((note) => (
                    <div key={note.id} className="flex items-center gap-2">
                      <Checkbox
                        id={`note-${note.id}`}
                        checked={selectedNotes.includes(note.id)}
                        onCheckedChange={() => handleNoteSelection(note.id)}
                      />
                      <Label htmlFor={`note-${note.id}`} className="font-normal cursor-pointer">
                        {note.title}
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
          <div className="flex flex-col gap-3">
            <Label htmlFor="num-questions">2. Número de Questões</Label>
            <Input
              id="num-questions"
              type="number"
              value={numQuestions}
              onChange={(e) => setNumQuestions(Math.max(1, parseInt(e.target.value, 10)))}
              className="w-24"
              min="1"
              disabled={isGenerating}
            />
          </div>
        </div>
        <DialogFooter>
          <Button 
            onClick={handleGenerate} 
            disabled={selectedNotes.length === 0 || isLoadingNotes || isGenerating}
          >
            {isGenerating ? "Gerando..." : "Gerar Simulado"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
