DO $$
BEGIN
  -- 1. Update the profile check constraint to allow 'administrador' and 'admin_gestor'
  ALTER TABLE public.usuarios_escola DROP CONSTRAINT IF EXISTS usuarios_escola_perfil_check;
  
  ALTER TABLE public.usuarios_escola ADD CONSTRAINT usuarios_escola_perfil_check CHECK (
    perfil = ANY (ARRAY[
      'publico_externo', 'colaborador', 'professor', 'senior', 'operacional', 
      'SECRETARIA DE EDUCAÇÃO', 'gestao_escola', 'ANALISTA_COMPLIANCE', 'DIRETOR_COMPLIANCE',
      'administrador', 'admin_gestor'
    ])
  );

  -- 2. Update the RLS Policy for 'denuncias'
  DROP POLICY IF EXISTS "Senior can view all complaints" ON public.denuncias;
  
  CREATE POLICY "Senior can view all complaints" ON public.denuncias
    FOR SELECT TO authenticated 
    USING (
      EXISTS ( 
        SELECT 1 
        FROM public.usuarios_escola ue 
        WHERE ue.id = auth.uid() 
          AND ue.perfil IN ('senior', 'administrador', 'admin_gestor')
          AND (ue.escola_id IS NULL OR ue.escola_id = denuncias.escola_id)
      )
    );
END $$;
