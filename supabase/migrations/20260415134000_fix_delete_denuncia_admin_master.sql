CREATE OR REPLACE FUNCTION public.delete_denuncia(p_denuncia_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Verify if user is senior or admin_master
  IF NOT EXISTS (
    SELECT 1 FROM public.usuarios_escola 
    WHERE id = auth.uid() AND (perfil = 'senior' OR perfil = 'administrador')
  ) AND NOT public.check_is_admin_master() THEN
    RAISE EXCEPTION 'Access denied. Only senior can delete complaints.';
  END IF;

  -- Delete from dependent tables that don't have cascade
  DELETE FROM public.processos_disciplinares WHERE denuncia_id = p_denuncia_id;
  DELETE FROM public.mediacoes WHERE denuncia_id = p_denuncia_id;
  DELETE FROM public.auditorias WHERE denuncia_id = p_denuncia_id;
  DELETE FROM public.controles_internos WHERE denuncia_id = p_denuncia_id;
  DELETE FROM public.matriz_riscos WHERE denuncia_id = p_denuncia_id;
  
  -- Delete from compliance tasks that might be referencing this
  DELETE FROM public.compliance_tasks WHERE referencia_id = p_denuncia_id AND tipo_modulo IN ('Denúncia', 'Denuncia');
  
  -- Finally delete the complaint (cascades to investigacoes, workflow_logs, etc.)
  DELETE FROM public.denuncias WHERE id = p_denuncia_id;
END;
$function$;
