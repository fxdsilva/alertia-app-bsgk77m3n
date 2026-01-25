-- Add workflow specific columns to denuncias table
ALTER TABLE public.denuncias ADD COLUMN IF NOT EXISTS analista_1_id UUID REFERENCES public.usuarios_escola(id);
ALTER TABLE public.denuncias ADD COLUMN IF NOT EXISTS analista_2_id UUID REFERENCES public.usuarios_escola(id);
ALTER TABLE public.denuncias ADD COLUMN IF NOT EXISTS analista_3_id UUID REFERENCES public.usuarios_escola(id);
ALTER TABLE public.denuncias ADD COLUMN IF NOT EXISTS diretor_id UUID REFERENCES public.usuarios_escola(id);
ALTER TABLE public.denuncias ADD COLUMN IF NOT EXISTS parecer_1 TEXT;
ALTER TABLE public.denuncias ADD COLUMN IF NOT EXISTS relatorio_2 TEXT;
ALTER TABLE public.denuncias ADD COLUMN IF NOT EXISTS relatorio_3 TEXT;
ALTER TABLE public.denuncias ADD COLUMN IF NOT EXISTS tipo_resolucao TEXT; -- 'mediacao' | 'disciplinar'

-- Create compliance_workflow_logs table for audit trail
CREATE TABLE IF NOT EXISTS public.compliance_workflow_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id UUID NOT NULL REFERENCES public.denuncias(id),
    previous_status TEXT,
    new_status TEXT NOT NULL,
    changed_by UUID REFERENCES public.usuarios_escola(id),
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert new statuses ensuring they exist
DO $$
DECLARE
    status_name text;
BEGIN
    FOREACH status_name IN ARRAY ARRAY[
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
    ]
    LOOP
        INSERT INTO public.status_denuncia (id, nome_status)
        VALUES (gen_random_uuid(), status_name)
        ON CONFLICT DO NOTHING;
        
        -- If name is unique constraint exists (depends on schema), we might need checking first
        -- Assuming simple insert or using exists check if needed in future
        IF NOT EXISTS (SELECT 1 FROM public.status_denuncia WHERE nome_status = status_name) THEN
            INSERT INTO public.status_denuncia (id, nome_status) VALUES (gen_random_uuid(), status_name);
        END IF;
    END LOOP;
END $$;
