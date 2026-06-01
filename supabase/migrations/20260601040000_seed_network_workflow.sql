DO $$
DECLARE
  v_senior_id uuid;
  v_school_1_id uuid;
  v_school_2_id uuid;
  v_status_f1 text;
  v_status_f2 text;
  v_status_f3 text;
  v_status_closed text;
  v_denuncia_f1_id uuid := gen_random_uuid();
  v_denuncia_f2_id uuid := gen_random_uuid();
  v_denuncia_f3_id uuid := gen_random_uuid();
  v_denuncia_closed_id uuid := gen_random_uuid();
BEGIN
  -- 1. Create Schools if not exist
  INSERT INTO public.escolas_instituicoes (nome_escola, rede_publica, rede_municipal, rede_estadual, rede_federal, rede_particular, localizacao, status_adesao)
  VALUES 
    ('Escola Estadual de Teste 1', true, false, true, false, false, 'Urbana', 'ativo'),
    ('Escola Municipal de Teste 2', true, true, false, false, false, 'Urbana', 'ativo')
  ON CONFLICT (nome_escola) DO NOTHING;

  SELECT id INTO v_school_1_id FROM public.escolas_instituicoes WHERE nome_escola = 'Escola Estadual de Teste 1' LIMIT 1;
  SELECT id INTO v_school_2_id FROM public.escolas_instituicoes WHERE nome_escola = 'Escola Municipal de Teste 2' LIMIT 1;

  -- 2. Create Senior User
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'fxdsilva@gmail.com') THEN
    v_senior_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      v_senior_id,
      '00000000-0000-0000-0000-000000000000',
      'fxdsilva@gmail.com',
      crypt('Skip@Pass123', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Senior Admin"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );

    INSERT INTO public.usuarios_escola (id, email, nome_usuario, perfil, ativo, escola_id)
    VALUES (v_senior_id, 'fxdsilva@gmail.com', 'Senior Admin', 'senior', true, NULL)
    ON CONFLICT (id) DO NOTHING;
  ELSE
    SELECT id INTO v_senior_id FROM auth.users WHERE email = 'fxdsilva@gmail.com' LIMIT 1;
    INSERT INTO public.usuarios_escola (id, email, nome_usuario, perfil, ativo, escola_id)
    VALUES (v_senior_id, 'fxdsilva@gmail.com', 'Senior Admin', 'senior', true, NULL)
    ON CONFLICT (id) DO NOTHING;
  END IF;

  -- 3. Get or create Statuses
  -- F1
  INSERT INTO public.status_denuncia (id, nome_status) VALUES ('pendente', 'Pendente') ON CONFLICT (id) DO NOTHING;
  SELECT id INTO v_status_f1 FROM public.status_denuncia WHERE id = 'pendente' LIMIT 1;
  
  -- F2
  INSERT INTO public.status_denuncia (id, nome_status) VALUES ('em_investigacao_analista_2', 'Em investigação – Analista 2') ON CONFLICT (id) DO NOTHING;
  SELECT id INTO v_status_f2 FROM public.status_denuncia WHERE id = 'em_investigacao_analista_2' LIMIT 1;
  
  -- F3
  INSERT INTO public.status_denuncia (id, nome_status) VALUES ('em_mediacao_analista_3', 'Em mediação – Analista 3') ON CONFLICT (id) DO NOTHING;
  SELECT id INTO v_status_f3 FROM public.status_denuncia WHERE id = 'em_mediacao_analista_3' LIMIT 1;
  
  -- Closed
  INSERT INTO public.status_denuncia (id, nome_status) VALUES ('denuncia_encerrada', 'Denúncia encerrada') ON CONFLICT (id) DO NOTHING;
  SELECT id INTO v_status_closed FROM public.status_denuncia WHERE id = 'denuncia_encerrada' LIMIT 1;

  -- 4. Insert Complaints
  -- F1
  INSERT INTO public.denuncias (id, escola_id, protocolo, descricao, status, anonimo, user_id)
  VALUES (
    v_denuncia_f1_id,
    v_school_1_id,
    'TEST-F1-001',
    'Denúncia Teste Fase 1 (Entrada) - Escola 1',
    v_status_f1,
    true,
    NULL
  ) ON CONFLICT (protocolo) DO NOTHING;

  -- F2
  INSERT INTO public.denuncias (id, escola_id, protocolo, descricao, status, anonimo, user_id)
  VALUES (
    v_denuncia_f2_id,
    v_school_2_id,
    'TEST-F2-002',
    'Denúncia Teste Fase 2 (Investigação) - Escola 2',
    v_status_f2,
    true,
    NULL
  ) ON CONFLICT (protocolo) DO NOTHING;
  
  -- Also add the investigation to ensure F2 logic catches it if status matching fails
  INSERT INTO public.investigacoes (denuncia_id, escola_id, status, data_inicio)
  VALUES (v_denuncia_f2_id, v_school_2_id, 'em_andamento', NOW())
  ON CONFLICT DO NOTHING;

  -- F3
  INSERT INTO public.denuncias (id, escola_id, protocolo, descricao, status, anonimo, user_id)
  VALUES (
    v_denuncia_f3_id,
    v_school_1_id,
    'TEST-F3-003',
    'Denúncia Teste Fase 3 (Mediação) - Escola 1',
    v_status_f3,
    true,
    NULL
  ) ON CONFLICT (protocolo) DO NOTHING;
  
  -- Ensure mediation statuses exist
  INSERT INTO public.status_mediacao (id, nome_status) 
  VALUES 
    ('Em Andamento', 'Em Andamento'),
    ('Agendada', 'Agendada')
  ON CONFLICT (id) DO NOTHING;

  -- Also add the mediation
  INSERT INTO public.mediacoes (denuncia_id, escola_id, caso, partes_envolvidas, status, data_inicio)
  VALUES (v_denuncia_f3_id, v_school_1_id, 'Mediação Teste', 'Partes', 'Em Andamento', NOW())
  ON CONFLICT DO NOTHING;

  -- Closed
  INSERT INTO public.denuncias (id, escola_id, protocolo, descricao, status, anonimo, user_id)
  VALUES (
    v_denuncia_closed_id,
    v_school_2_id,
    'TEST-CL-004',
    'Denúncia Teste Encerrada - Escola 2',
    v_status_closed,
    true,
    NULL
  ) ON CONFLICT (protocolo) DO NOTHING;

END $$;
