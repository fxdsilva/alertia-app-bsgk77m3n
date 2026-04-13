DO $$
BEGIN
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
END $$;

CREATE OR REPLACE FUNCTION public.handle_user_changes()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_escola_id UUID := NULL;
    v_escola_id_str TEXT;
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

    -- Insert or Update user profile
    IF (NEW.raw_user_meta_data->>'perfil') IS NOT NULL THEN
        INSERT INTO public.usuarios_escola (id, escola_id, perfil, nome_usuario, email, ativo, cargo, departamento)
        VALUES (
            NEW.id,
            v_escola_id,
            NEW.raw_user_meta_data->>'perfil',
            COALESCE(NEW.raw_user_meta_data->>'nome_usuario', NEW.raw_user_meta_data->>'name', 'Usuário'),
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
            -- We DO NOT update perfil or escola_id on conflict to prevent 
            -- triggering `prevent_sensitive_user_update` and failing logins 
            -- when metadata is out of sync with the database.
    END IF;
    
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.prevent_sensitive_user_update()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  _claims jsonb;
  _role text;
BEGIN
  -- Safely extract role from JWT claims
  BEGIN
    _claims := current_setting('request.jwt.claims', true)::jsonb;
    _role := _claims->>'role';
  EXCEPTION WHEN OTHERS THEN
    _role := NULL;
  END;

  -- Allow bypass for service_role
  IF _role = 'service_role' THEN
    RETURN NEW;
  END IF;

  -- If user is NOT Admin Master
  IF (public.check_is_admin_master() IS FALSE) THEN
    -- Check if restricted columns are being changed
    IF (OLD.perfil IS DISTINCT FROM NEW.perfil) OR (OLD.escola_id IS DISTINCT FROM NEW.escola_id) THEN
      RAISE EXCEPTION 'You are not allowed to update perfil or escola_id';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;
