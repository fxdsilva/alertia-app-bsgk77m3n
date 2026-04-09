CREATE OR REPLACE FUNCTION public.get_complaint_tracking_details(protocol_query text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_complaint record;
  v_result jsonb;
  v_team_decision text := null;
  v_leader_agreed boolean := null;
  v_director_log record;
  v_votes jsonb;
  v_has_multiple boolean := false;
  v_total_analysts int := 0;
  v_is_assigned boolean := false;
BEGIN
  -- Get base complaint
  SELECT
    d.id,
    d.protocolo,
    COALESCE(s.nome_status, d.status) as status_nome,
    d.updated_at,
    d.parecer_1,
    d.analista_1_id,
    d.analista_id
  INTO v_complaint
  FROM denuncias d
  LEFT JOIN status_denuncia s ON d.status = s.id
  WHERE d.protocolo = protocol_query;

  IF v_complaint.id IS NULL THEN
    RETURN NULL;
  END IF;

  -- Check if an analyst is assigned
  IF v_complaint.analista_1_id IS NOT NULL OR v_complaint.analista_id IS NOT NULL THEN
    v_is_assigned := true;
  END IF;

  -- Check multiple analysts (from workflow_analistas)
  IF EXISTS (SELECT 1 FROM workflow_analistas WHERE denuncia_id = v_complaint.id AND fase = 1) THEN
    v_is_assigned := true;
  END IF;

  -- Get phase 1 votes
  SELECT 
    COALESCE(jsonb_agg(jsonb_build_object(
      'analista_id', w.analista_id,
      'conclusao', w.conclusao
    )), '[]'::jsonb)
  INTO v_votes
  FROM workflow_pareceres w
  WHERE w.denuncia_id = v_complaint.id AND w.fase = 1;

  v_total_analysts := jsonb_array_length(v_votes);
  IF v_total_analysts > 1 THEN
    v_has_multiple := true;
  END IF;

  -- Calculate team decision
  IF v_total_analysts > 0 THEN
    -- Check consensus
    DECLARE
      v_first_conc text := v_votes->0->>'conclusao';
      v_is_consensus boolean := true;
      v_elem jsonb;
      v_rec record;
      v_leader_vote text := null;
      v_counts jsonb := '{}'::jsonb;
      v_max_count int := 0;
      v_max_conc text := null;
    BEGIN
      FOR v_elem IN SELECT * FROM jsonb_array_elements(v_votes)
      LOOP
        IF v_elem->>'conclusao' != v_first_conc THEN
          v_is_consensus := false;
        END IF;
        
        IF (v_elem->>'analista_id')::uuid = v_complaint.analista_1_id THEN
          v_leader_vote := v_elem->>'conclusao';
        END IF;

        -- Count for majority
        v_counts := jsonb_set(
          v_counts, 
          ARRAY[v_elem->>'conclusao'], 
          to_jsonb(COALESCE((v_counts->>(v_elem->>'conclusao'))::int, 0) + 1),
          true
        );
      END LOOP;

      IF v_is_consensus THEN
        v_team_decision := v_first_conc;
        v_leader_agreed := true;
      ELSIF v_leader_vote IS NOT NULL THEN
        v_team_decision := v_leader_vote;
        v_leader_agreed := true;
      ELSE
        -- Find max
        FOR v_rec IN SELECT * FROM jsonb_each(v_counts)
        LOOP
          IF (v_rec.value)::text::int > v_max_count THEN
            v_max_count := (v_rec.value)::text::int;
            v_max_conc := v_rec.key;
          END IF;
        END LOOP;
        v_team_decision := v_max_conc;
        IF v_leader_vote IS NOT NULL THEN
          v_leader_agreed := (v_leader_vote = v_max_conc);
        END IF;
      END IF;
    END;
  ELSIF v_complaint.parecer_1 IS NOT NULL THEN
    v_team_decision := 'Parecer preliminar emitido';
  END IF;

  -- Get latest director log
  SELECT 
    l.new_status,
    l.comments,
    l.created_at
  INTO v_director_log
  FROM compliance_workflow_logs l
  JOIN usuarios_escola u ON l.changed_by = u.id
  WHERE l.complaint_id = v_complaint.id 
    AND u.perfil IN ('DIRETOR_COMPLIANCE', 'senior', 'administrador')
  ORDER BY l.created_at DESC
  LIMIT 1;

  -- Build final JSON
  v_result := jsonb_build_object(
    'status', v_complaint.status_nome,
    'lastUpdate', v_complaint.updated_at,
    'hasMultipleAnalysts', v_has_multiple,
    'totalAnalysts', v_total_analysts,
    'teamDecision', v_team_decision,
    'leaderAgreed', v_leader_agreed,
    'isAssigned', v_is_assigned,
    'directorDecision', CASE 
      WHEN v_director_log.new_status IS NOT NULL THEN jsonb_build_object(
        'new_status', v_director_log.new_status,
        'comments', v_director_log.comments,
        'created_at', v_director_log.created_at
      )
      ELSE NULL
    END
  );

  RETURN v_result;
END;
$function$;
