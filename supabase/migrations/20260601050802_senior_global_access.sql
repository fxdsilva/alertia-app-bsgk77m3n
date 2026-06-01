-- 1. Recreate policies for denuncias to allow senior
DROP POLICY IF EXISTS "Senior global read denuncias" ON public.denuncias;
CREATE POLICY "Senior global read denuncias" ON public.denuncias
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.usuarios_escola ue 
    WHERE ue.id = auth.uid() AND ue.perfil = 'senior'
  ));

-- 2. Recreate policies for investigacoes
DROP POLICY IF EXISTS "Senior global read investigacoes" ON public.investigacoes;
CREATE POLICY "Senior global read investigacoes" ON public.investigacoes
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.usuarios_escola ue 
    WHERE ue.id = auth.uid() AND ue.perfil = 'senior'
  ));

-- 3. Recreate policies for auditorias
DROP POLICY IF EXISTS "Senior global read auditorias" ON public.auditorias;
CREATE POLICY "Senior global read auditorias" ON public.auditorias
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.usuarios_escola ue 
    WHERE ue.id = auth.uid() AND ue.perfil = 'senior'
  ));

-- 4. Recreate policies for mediacoes
DROP POLICY IF EXISTS "Senior global read mediacoes" ON public.mediacoes;
CREATE POLICY "Senior global read mediacoes" ON public.mediacoes
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.usuarios_escola ue 
    WHERE ue.id = auth.uid() AND ue.perfil = 'senior'
  ));

-- 5. Recreate policies for processos_disciplinares
DROP POLICY IF EXISTS "Senior global read processos" ON public.processos_disciplinares;
CREATE POLICY "Senior global read processos" ON public.processos_disciplinares
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.usuarios_escola ue 
    WHERE ue.id = auth.uid() AND ue.perfil = 'senior'
  ));

-- 6. Recreate policies for usuarios_escola
DROP POLICY IF EXISTS "Senior Global View Users" ON public.usuarios_escola;
CREATE POLICY "Senior Global View Users" ON public.usuarios_escola
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.usuarios_escola ue 
    WHERE ue.id = auth.uid() AND ue.perfil IN ('senior', 'administrador', 'admin_gestor')
  ));

-- Seed user fxdsilva@gmail.com
DO $$
DECLARE
  new_user_id uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'fxdsilva@gmail.com') THEN
    new_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      new_user_id, '00000000-0000-0000-0000-000000000000',
      'fxdsilva@gmail.com', crypt('Skip@Pass', gen_salt('bf')), NOW(),
      NOW(), NOW(), '{"provider": "email", "providers": ["email"]}', '{"name": "Senior Admin"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );

    INSERT INTO public.usuarios_escola (id, email, nome_usuario, perfil, escola_id, ativo)
    VALUES (new_user_id, 'fxdsilva@gmail.com', 'Senior Admin', 'senior', NULL, true)
    ON CONFLICT (id) DO UPDATE SET perfil = 'senior', escola_id = NULL;
  ELSE
    SELECT id INTO new_user_id FROM auth.users WHERE email = 'fxdsilva@gmail.com';
    INSERT INTO public.usuarios_escola (id, email, nome_usuario, perfil, escola_id, ativo)
    VALUES (new_user_id, 'fxdsilva@gmail.com', 'Senior Admin', 'senior', NULL, true)
    ON CONFLICT (id) DO UPDATE SET perfil = 'senior', escola_id = NULL;
  END IF;
END $$;
