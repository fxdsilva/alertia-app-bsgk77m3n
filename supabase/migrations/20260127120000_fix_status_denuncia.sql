-- Ensure "Denúncia registrada" status exists in status_denuncia table
-- This is critical for the public complaint registration flow
INSERT INTO public.status_denuncia (id, nome_status, created_at, updated_at)
SELECT gen_random_uuid(), 'Denúncia registrada', now(), now()
WHERE NOT EXISTS (
    SELECT 1 FROM public.status_denuncia WHERE nome_status = 'Denúncia registrada'
);

-- Ensure other critical statuses exist as well to prevent workflow failures
INSERT INTO public.status_denuncia (id, nome_status, created_at, updated_at)
SELECT gen_random_uuid(), s.nome, now(), now()
FROM (VALUES 
    ('Aguardando designação de Analista 1'),
    ('Em análise de procedência – Analista 1'),
    ('Parecer preliminar enviado para aprovação do Diretor de Compliance'),
    ('Parecer devolvido para reavaliação – Analista 1'),
    ('Arquivamento aprovado'),
    ('Procedência aprovada – aguardando designação de Analista 2'),
    ('Em investigação – Analista 2'),
    ('Relatório de investigação enviado para aprovação do Diretor de Compliance'),
    ('Aguardando designação de Analista 3'),
    ('Em mediação – Analista 3'),
    ('Em medida disciplinar – Analista 3'),
    ('Execução concluída – aguardando aprovação do Diretor de Compliance'),
    ('Denúncia encerrada')
) AS s(nome)
WHERE NOT EXISTS (
    SELECT 1 FROM public.status_denuncia WHERE nome_status = s.nome
);
