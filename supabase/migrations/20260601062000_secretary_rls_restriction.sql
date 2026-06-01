-- Drop policies that granted direct access to individual records for SECRETARIA DE EDUCAÇÃO
DROP POLICY IF EXISTS "secretary_view_complaints" ON public.denuncias;
DROP POLICY IF EXISTS "secretary_view_investigations" ON public.investigacoes;
DROP POLICY IF EXISTS "secretary_view_mediations" ON public.mediacoes;
DROP POLICY IF EXISTS "secretary_view_trainings" ON public.treinamentos;

-- Create a SECURITY DEFINER function to compute dashboard aggregates securely
CREATE OR REPLACE FUNCTION public.get_secretary_dashboard_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
    result jsonb;
    schools_data jsonb;
BEGIN
    -- Ensure user has appropriate profile
    IF NOT EXISTS (
        SELECT 1 FROM public.usuarios_escola 
        WHERE id = auth.uid() 
        AND perfil IN ('SECRETARIA DE EDUCAÇÃO', 'senior', 'administrador', 'admin_gestor')
    ) THEN
        RAISE EXCEPTION 'Acesso Restrito: Você não tem permissão para visualizar.';
    END IF;

    SELECT jsonb_agg(
        jsonb_build_object(
            'id', e.id,
            'nome_escola', e.nome_escola,
            'rede_municipal', e.rede_municipal,
            'rede_estadual', e.rede_estadual,
            'rede_federal', e.rede_federal,
            'rede_particular', e.rede_particular,
            'endereco', e.endereco,
            'localizacao', e.localizacao,
            'complaintsCount', COALESCE((SELECT count(*) FROM public.denuncias d WHERE d.escola_id = e.id AND d.status NOT IN ('arquivado', 'resolvido')), 0),
            'investigationsCount', COALESCE((SELECT count(*) FROM public.investigacoes i WHERE i.escola_id = e.id AND i.status != 'concluida'), 0),
            'mediationsCount', COALESCE((SELECT count(*) FROM public.mediacoes m WHERE m.escola_id = e.id AND m.status != 'concluido'), 0),
            'trainingsCount', COALESCE((SELECT count(*) FROM public.treinamentos t WHERE t.escola_id = e.id AND t.ativo = true), 0)
        )
    ) INTO schools_data
    FROM public.escolas_instituicoes e
    WHERE e.ativo = true;

    result := jsonb_build_object(
        'schools', COALESCE(schools_data, '[]'::jsonb),
        'totalSchools', COALESCE(jsonb_array_length(schools_data), 0)
    );

    RETURN result;
END;
$function$;
