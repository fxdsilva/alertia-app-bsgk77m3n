-- Fix Row Level Security policies for relatorios_ia table to allow insertions

DROP POLICY IF EXISTS "Permitir inserção de relatorios_ia" ON public.relatorios_ia;
CREATE POLICY "Permitir inserção de relatorios_ia" ON public.relatorios_ia
  FOR INSERT TO authenticated
  WITH CHECK (
    escola_id IN (SELECT escola_id FROM public.usuarios_escola WHERE id = auth.uid())
    OR public.check_is_admin_master()
    OR EXISTS (SELECT 1 FROM public.usuarios_escola WHERE id = auth.uid() AND perfil IN ('senior', 'administrador', 'admin_gestor', 'DIRETOR_COMPLIANCE', 'ANALISTA_COMPLIANCE'))
  );

DROP POLICY IF EXISTS "Permitir leitura global de relatorios_ia" ON public.relatorios_ia;
CREATE POLICY "Permitir leitura global de relatorios_ia" ON public.relatorios_ia
  FOR SELECT TO authenticated
  USING (
    public.check_is_admin_master()
    OR EXISTS (SELECT 1 FROM public.usuarios_escola WHERE id = auth.uid() AND perfil IN ('senior', 'administrador', 'admin_gestor', 'DIRETOR_COMPLIANCE', 'ANALISTA_COMPLIANCE'))
  );

DROP POLICY IF EXISTS "Permitir update de relatorios_ia" ON public.relatorios_ia;
CREATE POLICY "Permitir update de relatorios_ia" ON public.relatorios_ia
  FOR UPDATE TO authenticated
  USING (
    escola_id IN (SELECT escola_id FROM public.usuarios_escola WHERE id = auth.uid())
    OR public.check_is_admin_master()
    OR EXISTS (SELECT 1 FROM public.usuarios_escola WHERE id = auth.uid() AND perfil IN ('senior', 'administrador', 'admin_gestor', 'DIRETOR_COMPLIANCE', 'ANALISTA_COMPLIANCE'))
  );

DROP POLICY IF EXISTS "Permitir delete de relatorios_ia" ON public.relatorios_ia;
CREATE POLICY "Permitir delete de relatorios_ia" ON public.relatorios_ia
  FOR DELETE TO authenticated
  USING (
    public.check_is_admin_master()
    OR EXISTS (SELECT 1 FROM public.usuarios_escola WHERE id = auth.uid() AND perfil IN ('senior', 'administrador', 'admin_gestor'))
  );
