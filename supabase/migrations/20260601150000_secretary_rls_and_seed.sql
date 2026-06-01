DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Seed Secretary User (idempotent)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'secretary@example.com') THEN
    new_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      new_user_id,
      '00000000-0000-0000-0000-000000000000',
      'secretary@example.com',
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"nome_usuario": "Secretário de Educação", "perfil": "SECRETARIA DE EDUCAÇÃO"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );

    -- Insert into dependent table
    INSERT INTO public.usuarios_escola (id, email, nome_usuario, perfil, ativo)
    VALUES (new_user_id, 'secretary@example.com', 'Secretário de Educação', 'SECRETARIA DE EDUCAÇÃO', true)
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- RLS Policy for SECRETARIA DE EDUCAÇÃO to read all complaints network-wide
DROP POLICY IF EXISTS "secretary_read_denuncias" ON public.denuncias;
CREATE POLICY "secretary_read_denuncias" ON public.denuncias
  FOR SELECT TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM public.usuarios_escola 
    WHERE id = auth.uid() AND perfil = 'SECRETARIA DE EDUCAÇÃO'
  ));
