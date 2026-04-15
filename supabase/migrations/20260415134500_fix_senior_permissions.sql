-- Update the delete_denuncia function to allow more admin roles
CREATE OR REPLACE FUNCTION public.delete_denuncia(p_denuncia_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $$
BEGIN
  -- Verify if user is senior, admin_master, administrador, admin_gestor or DIRETOR_COMPLIANCE
  IF NOT EXISTS (
    SELECT 1 FROM public.usuarios_escola 
    WHERE id = auth.uid() AND perfil IN ('senior', 'administrador', 'admin_gestor', 'DIRETOR_COMPLIANCE')
  ) AND NOT public.check_is_admin_master() THEN
    RAISE EXCEPTION 'Access denied. Only senior or admin can delete complaints.';
  END IF;

  -- Delete from dependent tables that don't have cascade
  DELETE FROM public.processos_disciplinares WHERE denuncia_id = p_denuncia_id;
  DELETE FROM public.mediacoes WHERE denuncia_id = p_denuncia_id;
  DELETE FROM public.auditorias WHERE denuncia_id = p_denuncia_id;
  DELETE FROM public.controles_internos WHERE denuncia_id = p_denuncia_id;
  DELETE FROM public.matriz_riscos WHERE denuncia_id = p_denuncia_id;
  
  -- Delete from compliance tasks that might be referencing this
  DELETE FROM public.compliance_tasks WHERE referencia_id = p_denuncia_id AND tipo_modulo IN ('Denúncia', 'Denuncia');
  
  -- Finally delete the complaint (cascades to investigacoes, workflow_logs, workflow_analistas, workflow_pareceres etc.)
  DELETE FROM public.denuncias WHERE id = p_denuncia_id;
END;
$;

DO $$
BEGIN
    -- Allow Senior and Admins to manage compliance tasks to have parity with Compliance Director
    DROP POLICY IF EXISTS "Senior and Admin Manage Tasks" ON public.compliance_tasks;
    CREATE POLICY "Senior and Admin Manage Tasks" ON public.compliance_tasks
      FOR ALL TO authenticated
      USING (
        EXISTS ( SELECT 1 FROM public.usuarios_escola WHERE id = auth.uid() AND perfil IN ('senior', 'administrador', 'admin_gestor') )
        OR public.check_is_admin_master()
      );

    -- Allow Senior and Admins to view all compliance task evidences
    DROP POLICY IF EXISTS "Senior and Admin view all evidences" ON public.compliance_task_evidences;
    CREATE POLICY "Senior and Admin view all evidences" ON public.compliance_task_evidences
      FOR ALL TO authenticated
      USING (
        EXISTS ( SELECT 1 FROM public.usuarios_escola WHERE id = auth.uid() AND perfil IN ('senior', 'administrador', 'admin_gestor') )
        OR public.check_is_admin_master()
      );

    -- Allow Senior and Admins to manage analyst assignments
    DROP POLICY IF EXISTS "Senior and Admin manage assignments" ON public.analyst_assignments;
    CREATE POLICY "Senior and Admin manage assignments" ON public.analyst_assignments
      FOR ALL TO authenticated
      USING (
        EXISTS ( SELECT 1 FROM public.usuarios_escola WHERE id = auth.uid() AND perfil IN ('senior', 'administrador', 'admin_gestor') )
        OR public.check_is_admin_master()
      );

    -- Allow Senior and Admins global view of all users to manage workflows
    DROP POLICY IF EXISTS "Senior Global View Users" ON public.usuarios_escola;
    CREATE POLICY "Senior Global View Users" ON public.usuarios_escola
      FOR SELECT TO authenticated
      USING (
        EXISTS ( SELECT 1 FROM public.usuarios_escola ue WHERE ue.id = auth.uid() AND ue.perfil IN ('senior', 'administrador', 'admin_gestor') )
        OR public.check_is_admin_master()
      );

END $$;
