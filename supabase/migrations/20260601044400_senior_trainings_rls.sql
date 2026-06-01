DROP POLICY IF EXISTS "Senior Global Read Treinamentos" ON public.treinamentos;
CREATE POLICY "Senior Global Read Treinamentos" ON public.treinamentos
  FOR SELECT TO authenticated USING (
    EXISTS ( SELECT 1 FROM public.usuarios_escola ue WHERE ue.id = auth.uid() AND ue.perfil = 'senior' )
  );

DROP POLICY IF EXISTS "Senior Global Read Treinamentos Conclusoes" ON public.treinamentos_conclusoes;
CREATE POLICY "Senior Global Read Treinamentos Conclusoes" ON public.treinamentos_conclusoes
  FOR SELECT TO authenticated USING (
    EXISTS ( SELECT 1 FROM public.usuarios_escola ue WHERE ue.id = auth.uid() AND ue.perfil = 'senior' )
  );
