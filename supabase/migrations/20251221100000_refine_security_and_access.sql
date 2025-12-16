-- RECREATE ADMIN MASTER CHECK FUNCTION
-- Ensures strict checking against usuarios_admin_master table linked to auth.uid()
CREATE OR REPLACE FUNCTION public.check_is_admin_master()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.usuarios_admin_master
    WHERE id = auth.uid() AND ativo = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ENSURE FK CONSTRAINT FOR ADMIN MASTER
-- Links usuarios_admin_master.id directly to auth.users.id
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'usuarios_admin_master_id_fkey') THEN
        ALTER TABLE public.usuarios_admin_master
        ADD CONSTRAINT usuarios_admin_master_id_fkey
        FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
EXCEPTION
    WHEN OTHERS THEN NULL; -- Ignore if constraint cannot be added due to permissions or data
END $$;


-- ==================================================================================
-- ESCOLAS_INSTITUICOES RLS
-- ==================================================================================
ALTER TABLE public.escolas_instituicoes ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies to ensure clean state and remove references to status_adesao
DROP POLICY IF EXISTS "Public read access for escolas_instituicoes" ON public.escolas_instituicoes;
DROP POLICY IF EXISTS "Public read access for active schools" ON public.escolas_instituicoes;
DROP POLICY IF EXISTS "Admin Master select all schools" ON public.escolas_instituicoes;
DROP POLICY IF EXISTS "Public and Auth read active schools" ON public.escolas_instituicoes;
DROP POLICY IF EXISTS "School users read own school" ON public.escolas_instituicoes;
DROP POLICY IF EXISTS "Admin Master can insert schools" ON public.escolas_instituicoes;
DROP POLICY IF EXISTS "Admin Master can update schools" ON public.escolas_instituicoes;
DROP POLICY IF EXISTS "Admin Master can delete schools" ON public.escolas_instituicoes;
DROP POLICY IF EXISTS "Allow public read schools" ON public.escolas_instituicoes;
DROP POLICY IF EXISTS "Admin Master Full Access Schools" ON public.escolas_instituicoes;
DROP POLICY IF EXISTS "School Users Read Own School" ON public.escolas_instituicoes;
DROP POLICY IF EXISTS "Public Read Active Schools" ON public.escolas_instituicoes;

-- 1. Admin Master Full Access (Global, no restrictions)
CREATE POLICY "Admin Master Full Access Schools" ON public.escolas_instituicoes
FOR ALL
USING (public.check_is_admin_master());

-- 2. School Users Read Own School Only
CREATE POLICY "School Users Read Own School" ON public.escolas_instituicoes
FOR SELECT
TO authenticated
USING (
  id IN (SELECT escola_id FROM public.usuarios_escola WHERE id = auth.uid())
);

-- 3. Public (Anon) Read Active Schools Only
CREATE POLICY "Public Read Active Schools" ON public.escolas_instituicoes
FOR SELECT
TO anon
USING (ativo = true);


-- ==================================================================================
-- DENUNCIAS RLS
-- ==================================================================================
ALTER TABLE public.denuncias ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Public create access for denuncias" ON public.denuncias;
DROP POLICY IF EXISTS "View denuncias based on school role or ownership" ON public.denuncias;
DROP POLICY IF EXISTS "Admin Master select all denuncias" ON public.denuncias;
DROP POLICY IF EXISTS "Admin Master can update all denuncias" ON public.denuncias;
DROP POLICY IF EXISTS "Admin Master can delete all denuncias" ON public.denuncias;
DROP POLICY IF EXISTS "Allow public anonymous complaints" ON public.denuncias;
DROP POLICY IF EXISTS "View and Manage denuncias based on school role or ownership" ON public.denuncias;
DROP POLICY IF EXISTS "Admin Master Full Access Denuncias" ON public.denuncias;
DROP POLICY IF EXISTS "Public Insert Denuncias" ON public.denuncias;
DROP POLICY IF EXISTS "School Users Select Denuncias" ON public.denuncias;
DROP POLICY IF EXISTS "School Users Update Denuncias" ON public.denuncias;

-- 1. Admin Master Full Access
CREATE POLICY "Admin Master Full Access Denuncias" ON public.denuncias
FOR ALL
USING (public.check_is_admin_master());

-- 2. Public Insert (Allows reporting without auth)
CREATE POLICY "Public Insert Denuncias" ON public.denuncias
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- 3. School Users Select (Own School or Own Complaint)
CREATE POLICY "School Users Select Denuncias" ON public.denuncias
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.usuarios_escola ue
    WHERE ue.id = auth.uid()
    AND ue.escola_id = denuncias.escola_id
    AND ue.perfil IN ('gestor', 'alta_gestao', 'administrador', 'admin_gestor')
  )
  OR denunciante_id = auth.uid()
);

-- 4. School Users Update (Limited to own school managers)
CREATE POLICY "School Users Update Denuncias" ON public.denuncias
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.usuarios_escola ue
    WHERE ue.id = auth.uid()
    AND ue.escola_id = denuncias.escola_id
    AND ue.perfil IN ('gestor', 'alta_gestao', 'administrador', 'admin_gestor')
  )
);


-- ==================================================================================
-- USUARIOS_ESCOLA RLS
-- ==================================================================================
ALTER TABLE public.usuarios_escola ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Admin Master can select all school users" ON public.usuarios_escola;
DROP POLICY IF EXISTS "Admin Master can insert school users" ON public.usuarios_escola;
DROP POLICY IF EXISTS "Admin Master can update school users" ON public.usuarios_escola;
DROP POLICY IF EXISTS "Admin Master can delete school users" ON public.usuarios_escola;
DROP POLICY IF EXISTS "Users can read own profile" ON public.usuarios_escola;
DROP POLICY IF EXISTS "Managers can read profiles of their school" ON public.usuarios_escola;
DROP POLICY IF EXISTS "Admin Gestor can view users of their school" ON public.usuarios_escola;
DROP POLICY IF EXISTS "Admin Gestor can insert users for their school" ON public.usuarios_escola;
DROP POLICY IF EXISTS "Admin Gestor can update users of their school" ON public.usuarios_escola;
DROP POLICY IF EXISTS "Admin Gestor can delete users of their school" ON public.usuarios_escola;
DROP POLICY IF EXISTS "Admin Master Full Access Users" ON public.usuarios_escola;
DROP POLICY IF EXISTS "School Users Read Own Profile" ON public.usuarios_escola;
DROP POLICY IF EXISTS "School Managers Read School Profiles" ON public.usuarios_escola;

-- 1. Admin Master Full Access
CREATE POLICY "Admin Master Full Access Users" ON public.usuarios_escola
FOR ALL
USING (public.check_is_admin_master());

-- 2. School Users Read Own Profile
CREATE POLICY "School Users Read Own Profile" ON public.usuarios_escola
FOR SELECT
TO authenticated
USING (id = auth.uid());

-- 3. School Managers Read School Profiles (For User Management features)
CREATE POLICY "School Managers Read School Profiles" ON public.usuarios_escola
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.usuarios_escola manager
    WHERE manager.id = auth.uid()
    AND manager.escola_id = usuarios_escola.escola_id
    AND manager.perfil IN ('gestor', 'alta_gestao', 'administrador', 'admin_gestor')
  )
);


-- ==================================================================================
-- TRIGGERS
-- ==================================================================================

-- Trigger to automatically update updated_at on escolas_instituicoes
CREATE OR REPLACE FUNCTION public.handle_escolas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_escolas_updated ON public.escolas_instituicoes;
CREATE TRIGGER on_escolas_updated
BEFORE UPDATE ON public.escolas_instituicoes
FOR EACH ROW EXECUTE FUNCTION public.handle_escolas_updated_at();

-- Trigger to prevent School Users from updating sensitive fields (perfil, escola_id)
-- Also effectively blocks updates if not explicitly allowed by logic, but this is a safety net
CREATE OR REPLACE FUNCTION public.prevent_sensitive_user_update()
RETURNS TRIGGER AS $$
BEGIN
  -- If user is NOT Admin Master
  IF (public.check_is_admin_master() IS FALSE) THEN
    -- Check if restricted columns are being changed
    IF (OLD.perfil IS DISTINCT FROM NEW.perfil) OR (OLD.escola_id IS DISTINCT FROM NEW.escola_id) THEN
      RAISE EXCEPTION 'You are not allowed to update perfil or escola_id';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS check_sensitive_user_update ON public.usuarios_escola;
CREATE TRIGGER check_sensitive_user_update
BEFORE UPDATE ON public.usuarios_escola
FOR EACH ROW EXECUTE FUNCTION public.prevent_sensitive_user_update();
