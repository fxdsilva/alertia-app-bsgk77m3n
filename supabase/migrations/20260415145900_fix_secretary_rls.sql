DO $$
BEGIN
  -- Denuncias: Secretaria de Educação
  DROP POLICY IF EXISTS "secretary_view_complaints" ON public.denuncias;
  CREATE POLICY "secretary_view_complaints" ON public.denuncias
    FOR SELECT TO authenticated
    USING (EXISTS (
      SELECT 1 FROM public.usuarios_escola ue
      WHERE ue.id = auth.uid() AND ue.perfil = 'SECRETARIA DE EDUCAÇÃO'
    ));

  -- Denuncias: Gestão Escolar (can see complaints of their school)
  DROP POLICY IF EXISTS "gestor_view_school_complaints" ON public.denuncias;
  CREATE POLICY "gestor_view_school_complaints" ON public.denuncias
    FOR SELECT TO authenticated
    USING (EXISTS (
      SELECT 1 FROM public.usuarios_escola ue
      WHERE ue.id = auth.uid() AND ue.perfil = 'gestao_escola' AND ue.escola_id = denuncias.escola_id
    ));

  -- Investigacoes: Secretaria de Educação
  DROP POLICY IF EXISTS "secretary_view_investigations" ON public.investigacoes;
  CREATE POLICY "secretary_view_investigations" ON public.investigacoes
    FOR SELECT TO authenticated
    USING (EXISTS (
      SELECT 1 FROM public.usuarios_escola ue
      WHERE ue.id = auth.uid() AND ue.perfil = 'SECRETARIA DE EDUCAÇÃO'
    ));

  -- Mediacoes: Secretaria de Educação
  DROP POLICY IF EXISTS "secretary_view_mediations" ON public.mediacoes;
  CREATE POLICY "secretary_view_mediations" ON public.mediacoes
    FOR SELECT TO authenticated
    USING (EXISTS (
      SELECT 1 FROM public.usuarios_escola ue
      WHERE ue.id = auth.uid() AND ue.perfil = 'SECRETARIA DE EDUCAÇÃO'
    ));

  -- Treinamentos: Secretaria de Educação
  DROP POLICY IF EXISTS "secretary_view_trainings" ON public.treinamentos;
  CREATE POLICY "secretary_view_trainings" ON public.treinamentos
    FOR SELECT TO authenticated
    USING (EXISTS (
      SELECT 1 FROM public.usuarios_escola ue
      WHERE ue.id = auth.uid() AND ue.perfil = 'SECRETARIA DE EDUCAÇÃO'
    ));
END $$;
