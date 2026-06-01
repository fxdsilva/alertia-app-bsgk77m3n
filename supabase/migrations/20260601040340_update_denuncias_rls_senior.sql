-- Update RLS for denuncias so Senior profile can view all records globally
DROP POLICY IF EXISTS "Senior can view all complaints" ON public.denuncias;

CREATE POLICY "Senior can view all complaints" ON public.denuncias
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios_escola ue
      WHERE ue.id = auth.uid()
      AND ue.perfil IN ('senior', 'administrador', 'admin_gestor', 'DIRETOR_COMPLIANCE')
    ) OR public.check_is_admin_master()
  );

-- Update RLS for mediacoes to ensure global visibility for Senior
DROP POLICY IF EXISTS "Senior can view all mediacoes" ON public.mediacoes;

CREATE POLICY "Senior can view all mediacoes" ON public.mediacoes
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios_escola ue
      WHERE ue.id = auth.uid()
      AND ue.perfil IN ('senior', 'administrador', 'admin_gestor', 'DIRETOR_COMPLIANCE')
    ) OR public.check_is_admin_master()
  );

-- Update RLS for processos_disciplinares to ensure global visibility for Senior
DROP POLICY IF EXISTS "Senior can view all processos_disciplinares" ON public.processos_disciplinares;

CREATE POLICY "Senior can view all processos_disciplinares" ON public.processos_disciplinares
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios_escola ue
      WHERE ue.id = auth.uid()
      AND ue.perfil IN ('senior', 'administrador', 'admin_gestor', 'DIRETOR_COMPLIANCE')
    ) OR public.check_is_admin_master()
  );

-- Seed user for testing senior profile (idempotent)
DO $$
DECLARE
  v_user_id uuid;
  v_escola_id uuid;
BEGIN
  -- Create a dummy school for the seed user if not exists
  INSERT INTO public.escolas_instituicoes (id, nome_escola, rede_publica, rede_municipal, rede_estadual, rede_federal, rede_particular, localizacao, status_adesao)
  VALUES ('00000000-0000-0000-0000-000000000001'::uuid, 'Escola Global Senior', false, false, false, false, true, 'Urbana', 'ativo')
  ON CONFLICT (nome_escola) DO NOTHING;

  SELECT id INTO v_escola_id FROM public.escolas_instituicoes WHERE nome_escola = 'Escola Global Senior' LIMIT 1;

  -- Seed user for testing senior profile
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'fxdsilva@gmail.com') THEN
    v_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      v_user_id,
      '00000000-0000-0000-0000-000000000000',
      'fxdsilva@gmail.com',
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Senior Global", "perfil": "senior"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );

    INSERT INTO public.usuarios_escola (id, escola_id, email, nome_usuario, perfil, ativo)
    VALUES (v_user_id, v_escola_id, 'fxdsilva@gmail.com', 'Senior Global', 'senior', true)
    ON CONFLICT (id) DO NOTHING;
  ELSE
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'fxdsilva@gmail.com';
    UPDATE public.usuarios_escola SET perfil = 'senior' WHERE id = v_user_id;
  END IF;
END $$;
