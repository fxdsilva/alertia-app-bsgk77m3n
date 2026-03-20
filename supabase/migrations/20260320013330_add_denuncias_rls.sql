-- Migration: Add RLS for denuncias and status_denuncia to allow workflow visibility

-- 1. Policies for denuncias
DROP POLICY IF EXISTS "Compliance members can view all complaints" ON public.denuncias;
CREATE POLICY "Compliance members can view all complaints"
  ON public.denuncias
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios_escola ue
      WHERE ue.id = auth.uid()
      AND ue.perfil IN ('DIRETOR_COMPLIANCE', 'ANALISTA_COMPLIANCE')
    )
  );

DROP POLICY IF EXISTS "Users can view their own complaints" ON public.denuncias;
CREATE POLICY "Users can view their own complaints"
  ON public.denuncias
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- 2. Policy for status_denuncia
DROP POLICY IF EXISTS "Authenticated users can read status_denuncia" ON public.status_denuncia;
CREATE POLICY "Authenticated users can read status_denuncia"
  ON public.status_denuncia
  FOR SELECT
  TO authenticated
  USING (true);
