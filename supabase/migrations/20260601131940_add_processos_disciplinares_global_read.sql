DO $$
BEGIN
  -- Drop existing policy if exists to remain idempotent
  DROP POLICY IF EXISTS "global_read_processos_disciplinares" ON public.processos_disciplinares;
  
  -- Create policy to allow global read for Master Admin, Senior, Administrator, and Secretary
  CREATE POLICY "global_read_processos_disciplinares" ON public.processos_disciplinares
    FOR SELECT TO authenticated
    USING (
      public.check_is_admin_master() OR
      EXISTS (
        SELECT 1 FROM public.usuarios_escola ue
        WHERE ue.id = auth.uid()
        AND ue.perfil IN ('senior', 'administrador', 'admin_gestor', 'SECRETARIA DE EDUCAÇÃO')
      )
    );
END $$;
