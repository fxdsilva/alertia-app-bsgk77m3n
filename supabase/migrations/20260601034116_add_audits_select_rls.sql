DO $$
BEGIN
  -- Drop existing policy if it exists to make it idempotent
  DROP POLICY IF EXISTS "Compliance view all audits" ON public.auditorias;
  
  -- Create policy for compliance profiles and admins
  CREATE POLICY "Compliance view all audits" ON public.auditorias
    FOR SELECT TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM public.usuarios_escola ue
        WHERE ue.id = auth.uid() 
        AND ue.perfil IN ('DIRETOR_COMPLIANCE', 'ANALISTA_COMPLIANCE', 'senior', 'administrador', 'admin_gestor')
      )
    );
END $$;
