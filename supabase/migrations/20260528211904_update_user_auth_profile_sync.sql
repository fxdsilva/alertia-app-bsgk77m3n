-- 1. Update the handle_user_changes trigger function
CREATE OR REPLACE FUNCTION public.handle_user_changes()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_escola_id UUID := NULL;
    v_escola_id_str TEXT;
    v_perfil TEXT;
BEGIN
    -- Extract escola_id safely
    v_escola_id_str := NEW.raw_user_meta_data->>'escola_id';
    IF v_escola_id_str IS NOT NULL AND v_escola_id_str != '' AND v_escola_id_str != 'null' THEN
        BEGIN
            v_escola_id := v_escola_id_str::UUID;
        EXCEPTION WHEN OTHERS THEN
            v_escola_id := NULL;
        END;
    END IF;

    -- Determine perfil (default to 'publico_externo' for social logins missing metadata)
    v_perfil := COALESCE(NEW.raw_user_meta_data->>'perfil', 'publico_externo');

    -- Insert or Update user profile
    INSERT INTO public.usuarios_escola (id, escola_id, perfil, nome_usuario, email, ativo, cargo, departamento)
    VALUES (
        NEW.id,
        v_escola_id,
        v_perfil,
        COALESCE(NEW.raw_user_meta_data->>'nome_usuario', NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Usuário'),
        NEW.email,
        COALESCE((NEW.raw_user_meta_data->>'ativo')::BOOLEAN, TRUE),
        NEW.raw_user_meta_data->>'cargo',
        NEW.raw_user_meta_data->>'departamento'
    )
    ON CONFLICT (id) DO UPDATE SET
        nome_usuario = EXCLUDED.nome_usuario,
        email = EXCLUDED.email,
        ativo = EXCLUDED.ativo,
        cargo = EXCLUDED.cargo,
        departamento = EXCLUDED.departamento,
        updated_at = NOW();
    
    RETURN NEW;
END;
$function$;

-- 2. Update RLS policies for usuarios_escola to allow self update
DROP POLICY IF EXISTS "usuarios_escola_update_own_or_admin" ON public.usuarios_escola;
CREATE POLICY "usuarios_escola_update_own_or_admin" ON public.usuarios_escola
  FOR UPDATE TO authenticated
  USING (
    id = auth.uid() 
    OR (auth.jwt() ->> 'role' = 'admin') 
    OR check_is_admin_master()
  )
  WITH CHECK (
    id = auth.uid() 
    OR (auth.jwt() ->> 'role' = 'admin') 
    OR check_is_admin_master()
  );

-- 3. Seed Admin User
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
      new_user_id,
      '00000000-0000-0000-0000-000000000000',
      'fxdsilva@gmail.com',
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"nome_usuario": "Admin Skip", "perfil": "senior"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL,
      '', '', ''
    );

    -- handle_user_changes trigger automatically inserts into usuarios_escola,
    -- but we insert with ON CONFLICT DO NOTHING to be absolutely safe
    INSERT INTO public.usuarios_escola (id, email, nome_usuario, perfil, ativo)
    VALUES (new_user_id, 'fxdsilva@gmail.com', 'Admin Skip', 'senior', true)
    ON CONFLICT (id) DO NOTHING;
    
    INSERT INTO public.usuarios_admin_master (id, email, nome, senha_hash, ativo)
    VALUES (new_user_id, 'fxdsilva@gmail.com', 'Admin Skip', 'MANAGED_BY_SUPABASE_AUTH', true)
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;
