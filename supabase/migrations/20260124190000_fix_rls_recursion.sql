-- Fix infinite recursion in RLS policies by using SECURITY DEFINER functions
-- This ensures that policy checks do not trigger RLS on the table being checked recursively

-- 1. Create a secure helper function to check school management permissions
-- SECURITY DEFINER allows this function to bypass RLS when querying usuarios_escola
CREATE OR REPLACE FUNCTION public.check_is_school_manager(target_escola_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Returns true if the current user is a manager/admin of the target school
  -- and is active
  RETURN EXISTS (
    SELECT 1
    FROM public.usuarios_escola
    WHERE id = auth.uid()
      AND escola_id = target_escola_id
      AND perfil IN ('gestor', 'alta_gestao', 'administrador', 'admin_gestor')
      AND ativo = true
  );
END;
$$;

-- 2. Refactor policies on usuarios_escola to use the helper function
-- Drop potentially problematic policies
DROP POLICY IF EXISTS "School Managers Read School Profiles" ON public.usuarios_escola;

-- Create cleaner policy using the function
CREATE POLICY "School Managers Read School Profiles" ON public.usuarios_escola
FOR SELECT
TO authenticated
USING (
  -- Use the function to check if the current user manages the school of the row being accessed
  public.check_is_school_manager(escola_id)
);

-- 3. Refactor policies on denuncias to prevent indirect recursion and improve performance
DROP POLICY IF EXISTS "School Users Select Denuncias" ON public.denuncias;

CREATE POLICY "School Users Select Denuncias" ON public.denuncias
FOR SELECT
TO authenticated
USING (
  -- Use the function for permission check
  public.check_is_school_manager(escola_id)
  OR denunciante_id = auth.uid()
);

DROP POLICY IF EXISTS "School Users Update Denuncias" ON public.denuncias;

CREATE POLICY "School Users Update Denuncias" ON public.denuncias
FOR UPDATE
TO authenticated
USING (
  -- Use the function for permission check
  public.check_is_school_manager(escola_id)
);

-- 4. Update utility function get_user_escola_id to be SECURITY DEFINER to avoid RLS issues in other contexts
CREATE OR REPLACE FUNCTION public.get_user_escola_id(user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_escola_id uuid;
BEGIN
  SELECT escola_id INTO v_escola_id
  FROM public.usuarios_escola
  WHERE id = user_id;
  
  RETURN v_escola_id;
END;
$$;
