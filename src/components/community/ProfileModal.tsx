"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
}

const SUBJECTS = [
  'Matemática', 'Português', 'História', 'Geografia', 
  'Física', 'Química', 'Biologia', 'Redação'
];

const SERIES = ['1º Ano', '2º Ano', '3º Ano', 'Pré-Vestibular'];

const ProfileModal = ({ isOpen, onClose, userId }: ProfileModalProps) => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchProfile();
    }
  }, [isOpen, userId]);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const targetUserId = userId;
      if (!targetUserId) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', targetUserId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setProfile(data);
        setSelectedSubjects(data.subjects || []);
      } else {
        // Create new profile if it doesn't exist
        setProfile({
          name: '',
          serie: '',
          subjects: [],
          career_goal: ''
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Não foi possível carregar as informações do perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile?.name?.trim()) {
      setError('Nome é obrigatório');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const targetUserId = userId;
      if (!targetUserId) return;

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: targetUserId,
          user_id: targetUserId,
          name: profile.name.trim(),
          serie: profile.serie,
          subjects: selectedSubjects,
          career_goal: profile.career_goal?.trim() || '',
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      
      onClose();
    } catch (error) {
      console.error('Error saving profile:', error);
      setError('Erro ao salvar perfil. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleSubjectToggle = (subject: string) => {
    setSelectedSubjects(prev => 
      prev.includes(subject) 
        ? prev.filter(s => s !== subject)
        : [...prev, subject]
    );
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-gray-800 border-gray-700">
          <div className="text-center text-white py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p>Carregando perfil...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">
            {userId ? 'Perfil do Usuário' : 'Meu Perfil'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {error && (
            <div className="p-3 bg-red-900/30 border border-red-700 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Name */}
          <div>
            <Label htmlFor="name" className="text-gray-300 mb-2 block">
              Nome Completo *
            </Label>
            <Input
              id="name"
              value={profile?.name || ''}
              onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Seu nome completo"
              className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
            />
          </div>

          {/* Series */}
          <div>
            <Label htmlFor="serie" className="text-gray-300 mb-2 block">
              Série
            </Label>
            <Select
              value={profile?.serie || ''}
              onValueChange={(value) => setProfile(prev => ({ ...prev, serie: value }))}
            >
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Selecione sua série" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                {SERIES.map((serie) => (
                  <SelectItem key={serie} value={serie} className="text-white">
                    {serie}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Subjects */}
          <div>
            <Label className="text-gray-300 mb-2 block">
              Matérias Favoritas
            </Label>
            <div className="flex flex-wrap gap-2">
              {SUBJECTS.map((subject) => (
                <Badge
                  key={subject}
                  variant={selectedSubjects.includes(subject) ? "default" : "secondary"}
                  className={`cursor-pointer transition-colors ${
                    selectedSubjects.includes(subject) 
                      ? 'bg-purple-600 hover:bg-purple-700' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                  onClick={() => handleSubjectToggle(subject)}
                >
                  {subject}
                </Badge>
              ))}
            </div>
          </div>

          {/* Career Goal */}
          <div>
            <Label htmlFor="career_goal" className="text-gray-300 mb-2 block">
              Curso Desejado
            </Label>
            <Input
              id="career_goal"
              value={profile?.career_goal || ''}
              onChange={(e) => setProfile(prev => ({ ...prev, career_goal: e.target.value }))}
              placeholder="Ex: Medicina, Engenharia, Direito..."
              className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
            />
          </div>

          {/* Preview */}
          {profile?.name && (
            <Card className="bg-gray-700 border-gray-600">
              <CardContent className="p-4">
                <h4 className="text-sm font-medium text-gray-300 mb-2">Pré-visualização</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="text-gray-400">Nome:</span> {profile.name}</p>
                  {profile.serie && (
                    <p><span className="text-gray-400">Série:</span> {profile.serie}</p>
                  )}
                  {selectedSubjects.length > 0 && (
                    <p><span className="text-gray-400">Matérias:</span> {selectedSubjects.join(', ')}</p>
                  )}
                  {profile.career_goal && (
                    <p><span className="text-gray-400">Curso:</span> {profile.career_goal}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t border-gray-700">
            <Button
              variant="outline"
              onClick={onClose}
              className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !profile?.name?.trim()}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileModal;