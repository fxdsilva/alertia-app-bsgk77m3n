-- Function to safely check if the current user is a senior or admin, bypassing RLS to avoid recursion
CREATE OR REPLACE FUNCTION public.is_senior_or_admin()
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.usuarios_escola
    WHERE id = auth.uid()
    AND perfil IN ('senior', 'administrador', 'admin_gestor')
  );
$$;

-- Drop and recreate the recursive policy on usuarios_escola
DROP POLICY IF EXISTS "Senior Global View Users" ON public.usuarios_escola;

CREATE POLICY "Senior Global View Users" ON public.usuarios_escola
  FOR SELECT TO authenticated
  USING (
    public.is_senior_or_admin() OR public.check_is_admin_master()
  );

-- Fix policies in compliance_tasks that were added previously to avoid recursion
DROP POLICY IF EXISTS "Senior and Admin Manage Tasks" ON public.compliance_tasks;
CREATE POLICY "Senior and Admin Manage Tasks" ON public.compliance_tasks
  FOR ALL TO authenticated
  USING (
    public.is_senior_or_admin() OR public.check_is_admin_master()
  );

-- Fix policies in compliance_task_evidences
DROP POLICY IF EXISTS "Senior and Admin view all evidences" ON public.compliance_task_evidences;
CREATE POLICY "Senior and Admin view all evidences" ON public.compliance_task_evidences
  FOR ALL TO authenticated
  USING (
    public.is_senior_or_admin() OR public.check_is_admin_master()
  );

-- Fix policies in analyst_assignments
DROP POLICY IF EXISTS "Senior and Admin manage assignments" ON public.analyst_assignments;
CREATE POLICY "Senior and Admin manage assignments" ON public.analyst_assignments
  FOR ALL TO authenticated
  USING (
    public.is_senior_or_admin() OR public.check_is_admin_master()
  );

-- Clean up inline subqueries on escolas_instituicoes to prevent further recursion when joining
DROP POLICY IF EXISTS "Admin Manage Schools" ON public.escolas_instituicoes;
CREATE POLICY "Admin Manage Schools" ON public.escolas_instituicoes
  FOR ALL TO authenticated
  USING (
    public.check_is_admin_master() OR public.is_senior_or_admin() OR public.is_compliance_director()
  );

DROP POLICY IF EXISTS "Directors can view all schools" ON public.escolas_instituicoes;
CREATE POLICY "Directors can view all schools" ON public.escolas_instituicoes
  FOR SELECT TO authenticated
  USING (
    public.is_compliance_director()
  );

DROP POLICY IF EXISTS "School Staff View Own" ON public.escolas_instituicoes;
CREATE POLICY "School Staff View Own" ON public.escolas_instituicoes
  FOR SELECT TO authenticated
  USING (
    public.is_user_member_of_escola(id)
  );

DROP POLICY IF EXISTS "School Users Read Own School" ON public.escolas_instituicoes;
CREATE POLICY "School Users Read Own School" ON public.escolas_instituicoes
  FOR SELECT TO authenticated
  USING (
    public.is_user_member_of_escola(id)
  );

DROP POLICY IF EXISTS "allow_select_escolas_for_authenticated" ON public.escolas_instituicoes;
CREATE POLICY "allow_select_escolas_for_authenticated" ON public.escolas_instituicoes
  FOR SELECT TO authenticated
  USING (
    ativo = true 
    OR public.is_user_member_of_escola(id) 
    OR public.check_is_admin_master() 
    OR public.is_compliance_director()
  );

DROP POLICY IF EXISTS "escolas_instituicoes_access" ON public.escolas_instituicoes;
CREATE POLICY "escolas_instituicoes_access" ON public.escolas_instituicoes
  FOR ALL TO authenticated
  USING (
    public.is_compliance_director() OR public.is_user_member_of_escola(id)
  )
  WITH CHECK (
    public.is_compliance_director() OR public.is_user_member_of_escola(id)
  );
