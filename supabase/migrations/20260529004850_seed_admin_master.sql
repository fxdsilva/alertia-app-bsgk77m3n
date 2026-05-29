DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Seed user fxdsilva@gmail.com (idempotent: skip if email already exists)
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
      new_user_id,
      '00000000-0000-0000-0000-000000000000',
      'fxdsilva@gmail.com',
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Administrador Master", "perfil": "senior"}',
      false, 'authenticated', 'authenticated',
      '',    -- confirmation_token: MUST be '' not NULL
      '',    -- recovery_token: MUST be '' not NULL
      '',    -- email_change_token_new: MUST be '' not NULL
      '',    -- email_change: MUST be '' not NULL
      '',    -- email_change_token_current: MUST be '' not NULL
      NULL,  -- phone: MUST be NULL (not '') due to UNIQUE constraint
      '',    -- phone_change: MUST be '' not NULL
      '',    -- phone_change_token: MUST be '' not NULL
      ''     -- reauthentication_token: MUST be '' not NULL
    );

    -- Insert into usuarios_admin_master
    INSERT INTO public.usuarios_admin_master (id, email, nome, senha_hash, ativo)
    VALUES (new_user_id, 'fxdsilva@gmail.com', 'Administrador Master', 'MANAGED_BY_SUPABASE_AUTH', true)
    ON CONFLICT (email) DO NOTHING;

    -- Insert into usuarios_escola to ensure standard dashboard accessibility
    INSERT INTO public.usuarios_escola (id, email, nome_usuario, perfil, ativo, permissoes)
    VALUES (new_user_id, 'fxdsilva@gmail.com', 'Administrador Master', 'senior', true, '{"read": true, "write": true, "delete": true, "reports": true}'::jsonb)
    ON CONFLICT (id) DO NOTHING;
  END IF;

  -- Clean up any legacy localhost configurations in admin_settings that might redirect wrongly
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'admin_settings') THEN
    UPDATE public.admin_settings
    SET settings = (
      SELECT jsonb_object_agg(
        key,
        CASE 
          WHEN jsonb_typeof(value) = 'string' AND value::text LIKE '%localhost%' THEN 
            to_jsonb(REPLACE(REPLACE(value::text, '"', ''), 'http://localhost:3000', 'https://alertia.goskip.app'))
          WHEN jsonb_typeof(value) = 'string' AND value::text LIKE '%127.0.0.1%' THEN 
            to_jsonb(REPLACE(REPLACE(value::text, '"', ''), 'http://127.0.0.1:3000', 'https://alertia.goskip.app'))
          ELSE value
        END
      )
      FROM jsonb_each(settings)
    )
    WHERE settings::text LIKE '%localhost%' OR settings::text LIKE '%127.0.0.1%';
  END IF;

  -- Clean up any legacy localhost configurations in instituicoes_parceiras links
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'instituicoes_parceiras') THEN
    UPDATE public.instituicoes_parceiras
    SET link_url = REPLACE(link_url, 'http://localhost:3000', 'https://alertia.goskip.app')
    WHERE link_url LIKE '%localhost%';
  END IF;

END $$;
