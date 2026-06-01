-- Drop if exists to ensure idempotency
DROP POLICY IF EXISTS "Senior global read denuncias" ON public.denuncias;

-- Create policy allowing 'senior' profile to read all complaints without escola_id check
CREATE POLICY "Senior global read denuncias" ON public.denuncias
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios_escola ue
      WHERE ue.id = auth.uid() AND ue.perfil = 'senior'
    )
  );

-- Idempotent seed script for the senior test user
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
      new_user_id, '00000000-0000-0000-0000-000000000000', 'fxdsilva@gmail.com',
      crypt('Skip@Pass123!', gen_salt('bf')), NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}', '{"name": "Admin Senior", "perfil": "senior"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );

    INSERT INTO public.usuarios_escola (id, email, nome_usuario, perfil, escola_id, ativo)
    VALUES (new_user_id, 'fxdsilva@gmail.com', 'Admin Senior', 'senior', NULL, true)
    ON CONFLICT (id) DO NOTHING;
  ELSE
    SELECT id INTO new_user_id FROM auth.users WHERE email = 'fxdsilva@gmail.com';
    
    INSERT INTO public.usuarios_escola (id, email, nome_usuario, perfil, escola_id, ativo)
    VALUES (new_user_id, 'fxdsilva@gmail.com', 'Admin Senior', 'senior', NULL, true)
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;
