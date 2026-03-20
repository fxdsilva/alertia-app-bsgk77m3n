-- Migration to fix zombie users and sync specific user
CREATE OR REPLACE FUNCTION public.get_user_id_by_email(p_email text)
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT id FROM auth.users WHERE email = p_email LIMIT 1;
$$;

DO $$
DECLARE
  new_user_id uuid;
  target_email text := 'sophia.b@aluno.ufr.edu.br';
  target_password text := 'Ufr2025@@';
  target_escola_id uuid := '65128de7-a7d1-497c-b68c-ddfe5e30ac9d';
BEGIN
  -- Insert school if not exists to avoid FK violation
  IF NOT EXISTS (SELECT 1 FROM public.escolas_instituicoes WHERE id = target_escola_id) THEN
    INSERT INTO public.escolas_instituicoes (
      id, nome_escola, rede_publica, rede_municipal, rede_estadual, rede_federal, rede_particular, localizacao, endereco, status_adesao, ativo
    ) VALUES (
      target_escola_id,
      'Escola Target Sophia',
      false, false, false, false, true,
      'Urbana', 'Endereço', 'ativo', true
    ) ON CONFLICT (nome_escola) DO NOTHING;
  END IF;

  -- Ensure target_escola_id exists (in case name conflict occurred and didn't insert)
  IF NOT EXISTS (SELECT 1 FROM public.escolas_instituicoes WHERE id = target_escola_id) THEN
    -- Get first available school id just as fallback
    SELECT id INTO target_escola_id FROM public.escolas_instituicoes LIMIT 1;
    IF target_escola_id IS NULL THEN
      target_escola_id := '65128de7-a7d1-497c-b68c-ddfe5e30ac9d';
      INSERT INTO public.escolas_instituicoes (
        id, nome_escola, rede_publica, rede_municipal, rede_estadual, rede_federal, rede_particular, localizacao, endereco, status_adesao, ativo
      ) VALUES (
        target_escola_id,
        'Escola Target Sophia ' || encode(gen_random_bytes(4), 'hex'),
        false, false, false, false, true,
        'Urbana', 'Endereço', 'ativo', true
      );
    END IF;
  END IF;

  -- Fix auth.users nulls just in case before operating
  UPDATE auth.users
  SET
    confirmation_token = COALESCE(confirmation_token, ''),
    recovery_token = COALESCE(recovery_token, ''),
    email_change_token_new = COALESCE(email_change_token_new, ''),
    email_change = COALESCE(email_change, ''),
    email_change_token_current = COALESCE(email_change_token_current, ''),
    phone_change = COALESCE(phone_change, ''),
    phone_change_token = COALESCE(phone_change_token, ''),
    reauthentication_token = COALESCE(reauthentication_token, '')
  WHERE
    confirmation_token IS NULL OR recovery_token IS NULL
    OR email_change_token_new IS NULL OR email_change IS NULL
    OR email_change_token_current IS NULL
    OR phone_change IS NULL OR phone_change_token IS NULL
    OR reauthentication_token IS NULL;

  -- Create or find auth user
  SELECT id INTO new_user_id FROM auth.users WHERE email = target_email;

  IF new_user_id IS NULL THEN
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
      target_email,
      crypt(target_password, gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Sophia B.", "perfil": "DIRETOR_COMPLIANCE"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );
  ELSE
    -- Update password and ensure string fields are not NULL
    UPDATE auth.users
    SET encrypted_password = crypt(target_password, gen_salt('bf'))
    WHERE id = new_user_id;
  END IF;

  -- Upsert into usuarios_escola
  INSERT INTO public.usuarios_escola (
    id, email, nome_usuario, perfil, escola_id, cargo, departamento, ativo
  ) VALUES (
    new_user_id,
    target_email,
    'Sophia B.',
    'DIRETOR_COMPLIANCE',
    target_escola_id,
    'gestor',
    'diretor',
    true
  ) ON CONFLICT (id) DO UPDATE SET
    perfil = 'DIRETOR_COMPLIANCE',
    escola_id = target_escola_id,
    cargo = 'gestor',
    departamento = 'diretor',
    ativo = true;

END $$;
