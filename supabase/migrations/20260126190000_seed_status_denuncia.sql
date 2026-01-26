-- Seed status_denuncia with initial workflow statuses if they don't exist
-- Using gen_random_uuid() for IDs to ensure compatibility with UUID columns
INSERT INTO public.status_denuncia (id, nome_status, created_at, updated_at)
SELECT gen_random_uuid(), status_name, now(), now()
FROM (VALUES 
  ('Denúncia registrada'),
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
) AS s(status_name)
WHERE NOT EXISTS (
  SELECT 1 FROM public.status_denuncia WHERE nome_status = s.status_name
);
