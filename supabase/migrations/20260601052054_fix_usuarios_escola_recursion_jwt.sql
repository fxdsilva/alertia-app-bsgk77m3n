-- Fix infinite recursion in RLS policies by moving role and school checks to use auth.jwt() metadata
-- instead of querying the usuarios_escola table directly.

-- 1. Update helper functions to use JWT metadata
CREATE OR REPLACE FUNCTION public.is_senior_or_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT (auth.jwt() -> 'user_metadata' ->> 'perfil') IN ('senior', 'administrador', 'admin_gestor');
$$;

CREATE OR REPLACE FUNCTION public.is_compliance_member()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT (auth.jwt() -> 'user_metadata' ->> 'perfil') IN ('DIRETOR_COMPLIANCE', 'ANALISTA_COMPLIANCE');
$$;

CREATE OR REPLACE FUNCTION public.is_compliance_director()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT (auth.jwt() -> 'user_metadata' ->> 'perfil') = 'DIRETOR_COMPLIANCE';
$$;

CREATE OR REPLACE FUNCTION public.is_compliance_analyst()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT (auth.jwt() -> 'user_metadata' ->> 'perfil') = 'ANALISTA_COMPLIANCE';
$$;

CREATE OR REPLACE FUNCTION public.check_is_operational()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT (auth.jwt() -> 'user_metadata' ->> 'perfil') = 'operacional';
$$;

CREATE OR REPLACE FUNCTION public.check_is_school_manager(target_escola_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT (
    (auth.jwt() -> 'user_metadata' ->> 'escola_id') = target_escola_id::text
    AND
    (auth.jwt() -> 'user_metadata' ->> 'perfil') IN ('gestor', 'alta_gestao', 'administrador', 'admin_gestor', 'gestao_escola')
    AND
    COALESCE((auth.jwt() -> 'user_metadata' ->> 'ativo')::boolean, true) = true
  );
$$;

CREATE OR REPLACE FUNCTION public.is_user_member_of_escola(p_escola_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT (auth.jwt() -> 'user_metadata' ->> 'escola_id') = p_escola_id::text;
$$;

-- 2. Drop and recreate policies on usuarios_escola to be strictly non-recursive
DROP POLICY IF EXISTS "Senior Global View Users" ON public.usuarios_escola;
CREATE POLICY "Senior Global View Users" ON public.usuarios_escola
  FOR SELECT TO authenticated
  USING (
    public.is_senior_or_admin()
  );

DROP POLICY IF EXISTS "Director View All Users" ON public.usuarios_escola;
CREATE POLICY "Director View All Users" ON public.usuarios_escola
  FOR SELECT TO authenticated
  USING (
    public.is_compliance_director()
  );

DROP POLICY IF EXISTS "Compliance Global View Users" ON public.usuarios_escola;
CREATE POLICY "Compliance Global View Users" ON public.usuarios_escola
  FOR SELECT TO authenticated
  USING (
    public.is_compliance_member()
  );

DROP POLICY IF EXISTS "School Managers Read School Profiles" ON public.usuarios_escola;
CREATE POLICY "School Managers Read School Profiles" ON public.usuarios_escola
  FOR SELECT TO authenticated
  USING (
    public.check_is_school_manager(escola_id)
  );

-- Recreate Admin Master policy to guarantee it continues operating securely 
DROP POLICY IF EXISTS "Admin Master Full Access Users" ON public.usuarios_escola;
CREATE POLICY "Admin Master Full Access Users" ON public.usuarios_escola
  FOR ALL TO authenticated
  USING (
    public.check_is_admin_master()
  )
  WITH CHECK (
    public.check_is_admin_master()
  );
