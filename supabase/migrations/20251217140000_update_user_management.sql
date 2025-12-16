-- Update usuarios_escola table structure
ALTER TABLE public.usuarios_escola
ADD COLUMN IF NOT EXISTS nome_usuario TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT TRUE NOT NULL;

-- Attempt to populate new columns from auth.users to avoid null constraint violations
DO $$
BEGIN
    UPDATE public.usuarios_escola ue
    SET
        email = au.email,
        nome_usuario = COALESCE(au.raw_user_meta_data->>'name', au.raw_user_meta_data->>'nome_usuario', 'Usuário')
    FROM auth.users au
    WHERE ue.id = au.id;
END $$;

-- Now set constraints
ALTER TABLE public.usuarios_escola
ALTER COLUMN nome_usuario SET DEFAULT 'Usuário',
ALTER COLUMN nome_usuario SET NOT NULL;

ALTER TABLE public.usuarios_escola
ALTER COLUMN email SET NOT NULL;

ALTER TABLE public.usuarios_escola
ADD CONSTRAINT usuarios_escola_email_key UNIQUE (email);

-- Update profile check constraint to include 'admin_gestor'
ALTER TABLE public.usuarios_escola DROP CONSTRAINT IF EXISTS usuarios_escola_perfil_check;
ALTER TABLE public.usuarios_escola ADD CONSTRAINT usuarios_escola_perfil_check
CHECK (perfil IN ('publico_externo', 'colaborador', 'gestor', 'alta_gestao', 'admin_gestor', 'administrador'));

-- Update handle_user_changes function
CREATE OR REPLACE FUNCTION public.handle_user_changes()
RETURNS TRIGGER AS $$
BEGIN
    -- Only try to insert/update if metadata is present
    IF (NEW.raw_user_meta_data->>'escola_id') IS NOT NULL AND (NEW.raw_user_meta_data->>'perfil') IS NOT NULL THEN
        INSERT INTO public.usuarios_escola (id, escola_id, perfil, nome_usuario, email, ativo)
        VALUES (
            NEW.id,
            (NEW.raw_user_meta_data->>'escola_id')::UUID,
            NEW.raw_user_meta_data->>'perfil',
            COALESCE(NEW.raw_user_meta_data->>'nome_usuario', NEW.raw_user_meta_data->>'name', 'Usuário'),
            NEW.email,
            COALESCE((NEW.raw_user_meta_data->>'ativo')::BOOLEAN, TRUE)
        )
        ON CONFLICT (id) DO UPDATE SET
            escola_id = EXCLUDED.escola_id,
            perfil = EXCLUDED.perfil,
            nome_usuario = EXCLUDED.nome_usuario,
            email = EXCLUDED.email,
            ativo = EXCLUDED.ativo,
            updated_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policies for admin_gestor
CREATE POLICY "Admin Gestor can view users of their school" ON public.usuarios_escola
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.usuarios_escola manager
            WHERE manager.id = auth.uid()
            AND manager.escola_id = usuarios_escola.escola_id
            AND manager.perfil = 'admin_gestor'
        )
    );

CREATE POLICY "Admin Gestor can insert users for their school" ON public.usuarios_escola
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.usuarios_escola manager
            WHERE manager.id = auth.uid()
            AND manager.escola_id = usuarios_escola.escola_id
            AND manager.perfil = 'admin_gestor'
        )
    );

CREATE POLICY "Admin Gestor can update users of their school" ON public.usuarios_escola
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.usuarios_escola manager
            WHERE manager.id = auth.uid()
            AND manager.escola_id = usuarios_escola.escola_id
            AND manager.perfil = 'admin_gestor'
        )
    ) WITH CHECK (
        -- Prevent updating own profile or school
        usuarios_escola.id <> auth.uid()
    );

CREATE POLICY "Admin Gestor can delete users of their school" ON public.usuarios_escola
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.usuarios_escola manager
            WHERE manager.id = auth.uid()
            AND manager.escola_id = usuarios_escola.escola_id
            AND manager.perfil = 'admin_gestor'
        )
    );

