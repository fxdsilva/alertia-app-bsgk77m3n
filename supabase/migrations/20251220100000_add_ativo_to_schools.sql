-- Add ativo column to escolas_instituicoes
ALTER TABLE public.escolas_instituicoes ADD COLUMN IF NOT EXISTS ativo BOOLEAN NOT NULL DEFAULT TRUE;

-- Update existing rows to have ativo = true if status_adesao is 'ativo', else false
UPDATE public.escolas_instituicoes SET ativo = (status_adesao = 'ativo');

-- Drop old RLS policies on escolas_instituicoes to replace with new logic
DROP POLICY IF EXISTS "Public read access for escolas_instituicoes" ON public.escolas_instituicoes;
DROP POLICY IF EXISTS "Public read access for active schools" ON public.escolas_instituicoes;

-- Enable RLS (already enabled but ensures state)
ALTER TABLE public.escolas_instituicoes ENABLE ROW LEVEL SECURITY;

-- Policy 1: Admin Masters can see ALL schools
CREATE POLICY "Admin Master select all schools" ON public.escolas_instituicoes
  FOR SELECT
  TO authenticated
  USING (public.check_is_admin_master());

-- Policy 2: Public (Anon) and Authenticated users can see ACTIVE schools
CREATE POLICY "Public and Auth read active schools" ON public.escolas_instituicoes
  FOR SELECT
  USING (ativo = true);

-- Policy 3: School users can read their OWN school (even if inactive)
CREATE POLICY "School users read own school" ON public.escolas_instituicoes
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT escuela_id FROM public.usuarios_escola WHERE id = auth.uid()
    )
  );

-- Note: Admin Master UPDATE/DELETE policies are handled in migration 20251218090000_implement_security_and_access_control.sql
-- We need to make sure Admin Master can UPDATE the 'ativo' column.
-- The existing policy "Admin Master can update schools" uses CHECK (public.check_is_admin_master()) which covers all columns.

