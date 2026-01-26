-- Create bucket for evidence if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('complaint-evidence', 'complaint-evidence', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to upload evidence
-- We drop existing policies to avoid conflicts if they exist and re-create them
DROP POLICY IF EXISTS "Public Upload Evidence" ON storage.objects;
DROP POLICY IF EXISTS "Public Read Evidence" ON storage.objects;

CREATE POLICY "Public Upload Evidence"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'complaint-evidence');

CREATE POLICY "Public Read Evidence"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'complaint-evidence');

-- Function to ensure statuses exist without duplication
DO $$
DECLARE
    status_name text;
    status_names text[] := ARRAY[
        'Denúncia registrada',
        'Aguardando designação de Analista 1',
        'Em análise de procedência – Analista 1',
        'Parecer preliminar enviado para aprovação do Diretor de Compliance',
        'Parecer devolvido para reavaliação – Analista 1',
        'Arquivamento aprovado',
        'Procedência aprovada – aguardando designação de Analista 2',
        'Em investigação – Analista 2',
        'Relatório de investigação enviado para aprovação do Diretor de Compliance',
        'Aguardando designação de Analista 3',
        'Em mediação – Analista 3',
        'Em medida disciplinar – Analista 3',
        'Execução concluída – aguardando aprovação do Diretor de Compliance',
        'Denúncia encerrada'
    ];
BEGIN
    FOREACH status_name IN ARRAY status_names
    LOOP
        IF NOT EXISTS (SELECT 1 FROM public.status_denuncia WHERE nome_status = status_name) THEN
            INSERT INTO public.status_denuncia (id, nome_status, created_at, updated_at)
            VALUES (gen_random_uuid(), status_name, now(), now());
        END IF;
    END LOOP;
END $$;
