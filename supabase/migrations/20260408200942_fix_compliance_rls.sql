DO $$
BEGIN
  -- Denuncias: Update policy for Compliance members
  DROP POLICY IF EXISTS "Compliance members can update complaints" ON public.denuncias;
  CREATE POLICY "Compliance members can update complaints" ON public.denuncias
    FOR UPDATE TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM usuarios_escola ue
        WHERE ue.id = auth.uid()
        AND ue.perfil IN ('DIRETOR_COMPLIANCE', 'ANALISTA_COMPLIANCE', 'senior', 'administrador', 'admin_gestor')
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM usuarios_escola ue
        WHERE ue.id = auth.uid()
        AND ue.perfil IN ('DIRETOR_COMPLIANCE', 'ANALISTA_COMPLIANCE', 'senior', 'administrador', 'admin_gestor')
      )
    );

  -- Investigacoes: Update for Compliance Directors and assigned Analysts
  DROP POLICY IF EXISTS "Compliance can update investigacoes" ON public.investigacoes;
  CREATE POLICY "Compliance can update investigacoes" ON public.investigacoes
    FOR UPDATE TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM usuarios_escola ue
        WHERE ue.id = auth.uid()
        AND ue.perfil IN ('DIRETOR_COMPLIANCE', 'ANALISTA_COMPLIANCE', 'senior', 'administrador', 'admin_gestor')
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM usuarios_escola ue
        WHERE ue.id = auth.uid()
        AND ue.perfil IN ('DIRETOR_COMPLIANCE', 'ANALISTA_COMPLIANCE', 'senior', 'administrador', 'admin_gestor')
      )
    );

  -- Processos_disciplinares: Update for Compliance
  DROP POLICY IF EXISTS "Compliance can update processos" ON public.processos_disciplinares;
  CREATE POLICY "Compliance can update processos" ON public.processos_disciplinares
    FOR UPDATE TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM usuarios_escola ue
        WHERE ue.id = auth.uid()
        AND ue.perfil IN ('DIRETOR_COMPLIANCE', 'ANALISTA_COMPLIANCE', 'senior', 'administrador', 'admin_gestor')
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM usuarios_escola ue
        WHERE ue.id = auth.uid()
        AND ue.perfil IN ('DIRETOR_COMPLIANCE', 'ANALISTA_COMPLIANCE', 'senior', 'administrador', 'admin_gestor')
      )
    );

  -- Mediacoes: Update for Compliance
  DROP POLICY IF EXISTS "Compliance can update mediacoes" ON public.mediacoes;
  CREATE POLICY "Compliance can update mediacoes" ON public.mediacoes
    FOR UPDATE TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM usuarios_escola ue
        WHERE ue.id = auth.uid()
        AND ue.perfil IN ('DIRETOR_COMPLIANCE', 'ANALISTA_COMPLIANCE', 'senior', 'administrador', 'admin_gestor')
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM usuarios_escola ue
        WHERE ue.id = auth.uid()
        AND ue.perfil IN ('DIRETOR_COMPLIANCE', 'ANALISTA_COMPLIANCE', 'senior', 'administrador', 'admin_gestor')
      )
    );

  -- Investigacoes: INSERT for Compliance
  DROP POLICY IF EXISTS "Compliance can insert investigacoes" ON public.investigacoes;
  CREATE POLICY "Compliance can insert investigacoes" ON public.investigacoes
    FOR INSERT TO authenticated
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM usuarios_escola ue
        WHERE ue.id = auth.uid()
        AND ue.perfil IN ('DIRETOR_COMPLIANCE', 'ANALISTA_COMPLIANCE', 'senior', 'administrador', 'admin_gestor')
      )
    );

  -- Processos_disciplinares: INSERT for Compliance
  DROP POLICY IF EXISTS "Compliance can insert processos" ON public.processos_disciplinares;
  CREATE POLICY "Compliance can insert processos" ON public.processos_disciplinares
    FOR INSERT TO authenticated
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM usuarios_escola ue
        WHERE ue.id = auth.uid()
        AND ue.perfil IN ('DIRETOR_COMPLIANCE', 'ANALISTA_COMPLIANCE', 'senior', 'administrador', 'admin_gestor')
      )
    );

  -- Mediacoes: INSERT for Compliance
  DROP POLICY IF EXISTS "Compliance can insert mediacoes" ON public.mediacoes;
  CREATE POLICY "Compliance can insert mediacoes" ON public.mediacoes
    FOR INSERT TO authenticated
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM usuarios_escola ue
        WHERE ue.id = auth.uid()
        AND ue.perfil IN ('DIRETOR_COMPLIANCE', 'ANALISTA_COMPLIANCE', 'senior', 'administrador', 'admin_gestor')
      )
    );
    
  -- Auditorias: INSERT for Compliance (integration module)
  DROP POLICY IF EXISTS "Compliance can insert auditorias" ON public.auditorias;
  CREATE POLICY "Compliance can insert auditorias" ON public.auditorias
    FOR INSERT TO authenticated
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM usuarios_escola ue
        WHERE ue.id = auth.uid()
        AND ue.perfil IN ('DIRETOR_COMPLIANCE', 'ANALISTA_COMPLIANCE', 'senior', 'administrador', 'admin_gestor')
      )
    );

  -- status_denuncia: INSERT for Compliance (to allow getStatusId to create missing statuses)
  DROP POLICY IF EXISTS "Compliance can insert status_denuncia" ON public.status_denuncia;
  CREATE POLICY "Compliance can insert status_denuncia" ON public.status_denuncia
    FOR INSERT TO authenticated
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM usuarios_escola ue
        WHERE ue.id = auth.uid()
        AND ue.perfil IN ('DIRETOR_COMPLIANCE', 'ANALISTA_COMPLIANCE', 'senior', 'administrador', 'admin_gestor')
      )
    );

  -- logs_sistema: UPDATE for Compliance
  DROP POLICY IF EXISTS "Compliance can update logs" ON public.logs_sistema;
  CREATE POLICY "Compliance can update logs" ON public.logs_sistema
    FOR UPDATE TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM usuarios_escola ue
        WHERE ue.id = auth.uid()
        AND ue.perfil IN ('DIRETOR_COMPLIANCE', 'ANALISTA_COMPLIANCE', 'senior', 'administrador', 'admin_gestor')
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM usuarios_escola ue
        WHERE ue.id = auth.uid()
        AND ue.perfil IN ('DIRETOR_COMPLIANCE', 'ANALISTA_COMPLIANCE', 'senior', 'administrador', 'admin_gestor')
      )
    );
END $$;
