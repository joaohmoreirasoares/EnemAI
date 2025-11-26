-- Permitir que usuários autenticados criem comentários
CREATE POLICY "Authenticated users can insert comments" 
ON comments FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = author_id);

-- Permitir que usuários autenticados vejam todos os comentários (caso ainda não exista)
CREATE POLICY "Comments are viewable by everyone" 
ON comments FOR SELECT 
TO authenticated 
USING (true);
