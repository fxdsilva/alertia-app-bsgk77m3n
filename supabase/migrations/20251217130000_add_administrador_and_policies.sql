-- Update constraint to include 'administrador'
ALTER TABLE public.usuarios_escola DROP CONSTRAINT usuarios_escola_perfil_check;
ALTER TABLE public.usuarios_escola ADD CONSTRAINT usuarios_escola_perfil_check CHECK (perfil IN ('publico_externo', 'colaborador', 'gestor', 'alta_gestao', 'administrador'));

-- Create storage bucket for school documents if it doesn't exist
INSERT INTO storage.buckets (id, name, public) VALUES ('school-documents', 'school-documents', true) ON CONFLICT DO NOTHING;

-- Policies for school-documents storage
-- Allow public read access to school-documents
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'school-documents');
-- Allow administrators to upload/update/delete files in school-documents
CREATE POLICY "Admin Upload" ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'school-documents' AND
    EXISTS (
        SELECT 1 FROM public.usuarios_escola ue
        WHERE ue.id = auth.uid()
        AND ue.perfil = 'administrador'
    )
);
CREATE POLICY "Admin Update" ON storage.objects FOR UPDATE USING (
    bucket_id = 'school-documents' AND
    EXISTS (
        SELECT 1 FROM public.usuarios_escola ue
        WHERE ue.id = auth.uid()
        AND ue.perfil = 'administrador'
    )
);
CREATE POLICY "Admin Delete" ON storage.objects FOR DELETE USING (
    bucket_id = 'school-documents' AND
    EXISTS (
        SELECT 1 FROM public.usuarios_escola ue
        WHERE ue.id = auth.uid()
        AND ue.perfil = 'administrador'
    )
);


-- RLS Policies for codigo_conduta
-- Drop existing policy if it exists or is too broad
DROP POLICY IF EXISTS "Public read access for codigo_conduta" ON public.codigo_conduta;
CREATE POLICY "Public read access for codigo_conduta" ON public.codigo_conduta FOR SELECT USING (true);

CREATE POLICY "Admin full access codigo_conduta" ON public.codigo_conduta
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.usuarios_escola ue
            WHERE ue.id = auth.uid()
            AND ue.perfil = 'administrador'
            AND ue.escola_id = codigo_conduta.escola_id
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.usuarios_escola ue
            WHERE ue.id = auth.uid()
            AND ue.perfil = 'administrador'
            AND ue.escola_id = codigo_conduta.escola_id
        )
    );

-- RLS Policies for compromisso_alta_gestao
DROP POLICY IF EXISTS "Public read access for compromisso_alta_gestao" ON public.compromisso_alta_gestao;
CREATE POLICY "Public read access for compromisso_alta_gestao" ON public.compromisso_alta_gestao FOR SELECT USING (true);

CREATE POLICY "Admin full access compromisso_alta_gestao" ON public.compromisso_alta_gestao
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.usuarios_escola ue
            WHERE ue.id = auth.uid()
            AND ue.perfil = 'administrador'
            AND ue.escola_id = compromisso_alta_gestao.escola_id
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.usuarios_escola ue
            WHERE ue.id = auth.uid()
            AND ue.perfil = 'administrador'
            AND ue.escola_id = compromisso_alta_gestao.escola_id
        )
    );

-- RLS Policies for denuncias
-- Existing policies: "Public create access for denuncias", "View denuncias based on school role or ownership"
-- We need to ensure 'administrador' is covered.
-- Drop old view policy to replace with inclusive one
DROP POLICY IF EXISTS "View denuncias based on school role or ownership" ON public.denuncias;

CREATE POLICY "View and Manage denuncias based on school role or ownership" ON public.denuncias
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.usuarios_escola ue
            WHERE ue.id = auth.uid()
            AND ue.escola_id = denuncias.escola_id
            AND ue.perfil IN ('gestor', 'alta_gestao', 'administrador')
        )
        OR denunciante_id = auth.uid()
    )
    WITH CHECK (
       -- Allow admins/managers to update status or delete
        EXISTS (
            SELECT 1 FROM public.usuarios_escola ue
            WHERE ue.id = auth.uid()
            AND ue.escola_id = denuncias.escola_id
            AND ue.perfil IN ('gestor', 'alta_gestao', 'administrador')
        )
        OR 
        -- Allow creator to insert (already covered by public insert but good to be explicit for update if needed)
        denunciante_id = auth.uid()
        OR
        -- Allow public insert (handled by separate policy "Public create access for denuncias")
        true
    );

