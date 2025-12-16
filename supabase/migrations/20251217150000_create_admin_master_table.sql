-- Create extension for hashing if not exists
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create the usuarios_admin_master table
CREATE TABLE IF NOT EXISTS public.usuarios_admin_master (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT,
    email TEXT NOT NULL UNIQUE,
    senha_hash TEXT NOT NULL,
    ativo BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Insert the Master Administrator user into auth.users (so they can login via Supabase Auth)
-- and into usuarios_admin_master (as per requirements)
DO $$
DECLARE
    v_user_id UUID;
    v_email TEXT := 'fxdsilva@gmail.com';
    v_password TEXT := 'Joao0109@@';
    v_hash TEXT;
BEGIN
    -- Generate hash for password
    v_hash := crypt(v_password, gen_salt('bf'));

    -- Check if user exists in auth.users
    SELECT id INTO v_user_id FROM auth.users WHERE email = v_email;
    
    IF v_user_id IS NULL THEN
        v_user_id := gen_random_uuid();
        INSERT INTO auth.users (
            instance_id, id, aud, role, email, encrypted_password, 
            email_confirmed_at, raw_app_meta_data, raw_user_meta_data, 
            created_at, updated_at, confirmation_token, recovery_token
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            v_user_id,
            'authenticated',
            'authenticated',
            v_email,
            v_hash,
            now(),
            '{"provider": "email", "providers": ["email"]}',
            '{"nome": "Administrador Master", "type": "senior"}',
            now(),
            now(),
            '',
            ''
        );
    END IF;

    -- Insert into usuarios_admin_master
    INSERT INTO public.usuarios_admin_master (nome, email, senha_hash, ativo)
    VALUES (
        'Administrador Master',
        v_email,
        v_hash,
        TRUE
    )
    ON CONFLICT (email) DO NOTHING;
END $$;
