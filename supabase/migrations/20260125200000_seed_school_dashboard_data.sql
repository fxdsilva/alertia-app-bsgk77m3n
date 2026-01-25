-- Create a demo school if it doesn't exist (using a fixed UUID for demo purposes or selecting one)
DO $$
DECLARE
    v_escola_id UUID;
    v_user_id UUID;
BEGIN
    -- Try to get an existing school or create one
    SELECT id INTO v_escola_id FROM escolas_instituicoes LIMIT 1;
    
    IF v_escola_id IS NULL THEN
        INSERT INTO escolas_instituicoes (nome_escola, localizacao, rede_municipal, rede_estadual, rede_federal, rede_particular, rede_publica, endereco, status_adesao, ativo)
        VALUES ('EE LA SALLE', 'Urbana', false, true, false, false, true, 'Rua da Educação, 123', 'Ativa', true)
        RETURNING id INTO v_escola_id;
    END IF;

    -- Ensure we have a school manager user for this school
    SELECT id INTO v_user_id FROM usuarios_escola WHERE perfil = 'gestao_escola' AND escola_id = v_escola_id LIMIT 1;

    -- If no manager exists, let's just use the first user or skip user-specific inserts
    IF v_user_id IS NULL THEN
        SELECT id INTO v_user_id FROM usuarios_escola LIMIT 1;
    END IF;

    -- Seed Data for Dashboard

    -- 1. Código de Conduta (Ensure it exists)
    INSERT INTO codigo_conduta (escola_id, arquivo_url, descricao)
    VALUES (v_escola_id, 'https://example.com/codigo.pdf', 'Código de Conduta 2025')
    ON CONFLICT (id) DO NOTHING;

    -- 2. Compromisso Alta Gestão (Ensure it exists)
    INSERT INTO compromisso_alta_gestao (escola_id, arquivo_url, descricao)
    VALUES (v_escola_id, 'https://example.com/compromisso.pdf', 'Compromisso da Gestão 2025')
    ON CONFLICT (id) DO NOTHING;

    -- 3. Denúncias (Sample data)
    INSERT INTO denuncias (escola_id, protocolo, descricao, status, anonimo, created_at)
    VALUES 
    (v_escola_id, 'DEN-2025-001', 'Problema com infraestrutura', 'pendente', true, NOW() - INTERVAL '2 days'),
    (v_escola_id, 'DEN-2025-002', 'Falta de material', 'resolvido', false, NOW() - INTERVAL '10 days'),
    (v_escola_id, 'DEN-2025-003', 'Comportamento inadequado', 'em_analise', true, NOW() - INTERVAL '5 days'),
    (v_escola_id, 'DEN-2025-004', 'Irregularidade na merenda', 'pendente', true, NOW() - INTERVAL '1 day');

    -- 4. Treinamentos (Sample data)
    INSERT INTO treinamentos (escola_id, titulo, descricao, ativo, obrigatorio, data_inicio, data_fim)
    VALUES 
    (v_escola_id, 'Ética no Trabalho', 'Treinamento sobre ética', true, true, NOW(), NOW() + INTERVAL '30 days'),
    (v_escola_id, 'Segurança de Dados', 'LGPD na escola', true, false, NOW(), NOW() + INTERVAL '60 days');

    -- 5. Auditorias
    INSERT INTO auditorias (escola_id, data_auditoria, tipo, responsavel, status, pendencias)
    VALUES 
    (v_escola_id, NOW() - INTERVAL '1 month', 'Interna', 'Auditoria Central', 'Concluída', 0),
    (v_escola_id, NOW() + INTERVAL '1 month', 'Externa', 'MEC', 'Agendada', 0);

    -- 6. Matriz de Riscos
    INSERT INTO matriz_riscos (escola_id, risco, probabilidade, impacto, nivel_risco_calculado)
    VALUES 
    (v_escola_id, 'Evasão Escolar', 'Alta', 'Alto', 'Crítico'),
    (v_escola_id, 'Falha na Segurança', 'Média', 'Alto', 'Alto');

    -- 7. Mediações
    INSERT INTO mediacoes (escola_id, caso, partes_envolvidas, status, data_inicio)
    VALUES 
    (v_escola_id, 'Conflito entre alunos', 'Aluno A e Aluno B', 'Em Andamento', NOW());

    -- 8. Due Diligence
    INSERT INTO due_diligence (escola_id, fornecedor, status, nivel_risco)
    VALUES 
    (v_escola_id, 'Fornecedor de Alimentos Ltda', 'Em Análise', 'Médio');

    -- 9. Processos Disciplinares
    INSERT INTO processos_disciplinares (escola_id, titulo, status, created_at)
    VALUES 
    (v_escola_id, 'Indisciplina recorrente', 'Aberto', NOW());

    -- 10. Relatórios IA (Mock entry if table structure allows)
    INSERT INTO relatorios_ia (escola_id, titulo, tipo, data_geracao, conteudo_json)
    VALUES 
    (v_escola_id, 'Análise Preditiva Q1', 'Preditivo', NOW(), '{"score": 95}'::json);

    -- 11. Relatórios Consolidados
    INSERT INTO relatorios_consolidados (escola_id, ano, arquivo_url)
    VALUES 
    (v_escola_id, 2024, 'https://example.com/relatorio2024.pdf');

END $$;
