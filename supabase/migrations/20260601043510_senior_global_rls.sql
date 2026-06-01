DO $$
BEGIN
    -- Denuncias
    DROP POLICY IF EXISTS "Senior global read denuncias" ON public.denuncias;
    CREATE POLICY "Senior global read denuncias" ON public.denuncias
      FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM usuarios_escola ue
            WHERE ue.id = auth.uid() AND ue.perfil = 'senior'
        )
      );

    -- Investigacoes
    DROP POLICY IF EXISTS "Senior global read investigacoes" ON public.investigacoes;
    CREATE POLICY "Senior global read investigacoes" ON public.investigacoes
      FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM usuarios_escola ue
            WHERE ue.id = auth.uid() AND ue.perfil = 'senior'
        )
      );

    -- Processos Disciplinares
    DROP POLICY IF EXISTS "Senior global read processos" ON public.processos_disciplinares;
    CREATE POLICY "Senior global read processos" ON public.processos_disciplinares
      FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM usuarios_escola ue
            WHERE ue.id = auth.uid() AND ue.perfil = 'senior'
        )
      );

    -- Mediacoes
    DROP POLICY IF EXISTS "Senior global read mediacoes" ON public.mediacoes;
    CREATE POLICY "Senior global read mediacoes" ON public.mediacoes
      FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM usuarios_escola ue
            WHERE ue.id = auth.uid() AND ue.perfil = 'senior'
        )
      );

    -- Auditorias
    DROP POLICY IF EXISTS "Senior global read auditorias" ON public.auditorias;
    CREATE POLICY "Senior global read auditorias" ON public.auditorias
      FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM usuarios_escola ue
            WHERE ue.id = auth.uid() AND ue.perfil = 'senior'
        )
      );

    -- Matriz Riscos
    DROP POLICY IF EXISTS "Senior global read matriz_riscos" ON public.matriz_riscos;
    CREATE POLICY "Senior global read matriz_riscos" ON public.matriz_riscos
      FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM usuarios_escola ue
            WHERE ue.id = auth.uid() AND ue.perfil = 'senior'
        )
      );

    -- Controles Internos
    DROP POLICY IF EXISTS "Senior global read controles" ON public.controles_internos;
    CREATE POLICY "Senior global read controles" ON public.controles_internos
      FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM usuarios_escola ue
            WHERE ue.id = auth.uid() AND ue.perfil = 'senior'
        )
      );
END $$;

-- Ensure fxdsilva@gmail.com has 'senior' profile
DO $$
DECLARE
    target_user_id uuid;
BEGIN
    SELECT id INTO target_user_id FROM auth.users WHERE email = 'fxdsilva@gmail.com';
    IF target_user_id IS NOT NULL THEN
        UPDATE public.usuarios_escola
        SET perfil = 'senior'
        WHERE id = target_user_id;
        
        IF NOT FOUND THEN
            INSERT INTO public.usuarios_escola (id, email, perfil, nome_usuario, ativo)
            VALUES (target_user_id, 'fxdsilva@gmail.com', 'senior', 'Administrador Senior', true);
        END IF;
    END IF;
END $$;
