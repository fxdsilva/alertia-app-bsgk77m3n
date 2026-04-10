DO $$
BEGIN
    -- Update codigo_conduta
    DROP POLICY IF EXISTS "Gestores can manage codigo_conduta" ON public.codigo_conduta;
    CREATE POLICY "Gestores can manage codigo_conduta" ON public.codigo_conduta
      FOR ALL TO public
      USING (EXISTS (SELECT 1 FROM public.usuarios_escola ue WHERE ue.id = auth.uid() AND ue.escola_id = codigo_conduta.escola_id AND ue.perfil IN ('gestao_escola', 'gestor', 'alta_gestao', 'admin_gestor', 'administrador', 'senior')));

    -- Update compromisso_alta_gestao
    DROP POLICY IF EXISTS "Gestores can manage compromisso_alta_gestao" ON public.compromisso_alta_gestao;
    CREATE POLICY "Gestores can manage compromisso_alta_gestao" ON public.compromisso_alta_gestao
      FOR ALL TO public
      USING (EXISTS (SELECT 1 FROM public.usuarios_escola ue WHERE ue.id = auth.uid() AND ue.escola_id = compromisso_alta_gestao.escola_id AND ue.perfil IN ('gestao_escola', 'gestor', 'alta_gestao', 'admin_gestor', 'administrador', 'senior')));

    -- Update treinamentos
    DROP POLICY IF EXISTS "Gestores can manage treinamentos" ON public.treinamentos;
    CREATE POLICY "Gestores can manage treinamentos" ON public.treinamentos
      FOR ALL TO public
      USING (EXISTS (SELECT 1 FROM public.usuarios_escola ue WHERE ue.id = auth.uid() AND ue.escola_id = treinamentos.escola_id AND ue.perfil IN ('gestao_escola', 'gestor', 'alta_gestao', 'admin_gestor', 'administrador', 'senior')));

    -- Storage policy for school-documents
    INSERT INTO storage.buckets (id, name, public) 
    VALUES ('school-documents', 'school-documents', true) 
    ON CONFLICT (id) DO NOTHING;
    
    DROP POLICY IF EXISTS "Authenticated users can upload school documents" ON storage.objects;
    CREATE POLICY "Authenticated users can upload school documents" ON storage.objects
      FOR INSERT TO authenticated WITH CHECK (bucket_id = 'school-documents');
      
    DROP POLICY IF EXISTS "Authenticated users can update school documents" ON storage.objects;
    CREATE POLICY "Authenticated users can update school documents" ON storage.objects
      FOR UPDATE TO authenticated USING (bucket_id = 'school-documents');
      
    DROP POLICY IF EXISTS "Public can read school documents" ON storage.objects;
    CREATE POLICY "Public can read school documents" ON storage.objects
      FOR SELECT TO public USING (bucket_id = 'school-documents');
      
    DROP POLICY IF EXISTS "Authenticated users can delete school documents" ON storage.objects;
    CREATE POLICY "Authenticated users can delete school documents" ON storage.objects
      FOR DELETE TO authenticated USING (bucket_id = 'school-documents');
END $$;
