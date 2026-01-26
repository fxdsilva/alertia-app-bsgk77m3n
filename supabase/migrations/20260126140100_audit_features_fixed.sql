-- 1. Create table for detailed Audit Findings
CREATE TABLE IF NOT EXISTS public.audit_findings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    audit_id UUID NOT NULL REFERENCES public.auditorias(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    recommendation TEXT,
    severity TEXT NOT NULL CHECK (severity IN ('Alta', 'Média', 'Baixa')),
    status TEXT NOT NULL DEFAULT 'Pendente' CHECK (status IN ('Pendente', 'Resolvido')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.audit_findings ENABLE ROW LEVEL SECURITY;

-- Simple policies (same logic as auditorias typically)
CREATE POLICY "Allow read for authenticated users" ON public.audit_findings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow all for analysts and admins" ON public.audit_findings FOR ALL TO authenticated USING (true);

-- 2. Trigger for Audit Completion Notification
CREATE OR REPLACE FUNCTION notify_audit_completion()
RETURNS TRIGGER AS $$
DECLARE
    completed_status_id UUID;
    director_ids UUID[];
    director_id_var UUID;
    audit_record RECORD;
BEGIN
    -- Get 'Concluída' status ID
    SELECT id INTO completed_status_id FROM public.status_auditoria WHERE nome_status = 'Concluída';
    
    -- Check if status changed to completed
    IF NEW.status = completed_status_id::text AND (OLD.status IS NULL OR OLD.status != completed_status_id::text) THEN
        -- Get Audit details
        SELECT a.tipo, e.nome_escola INTO audit_record
        FROM public.auditorias a
        JOIN public.escolas_instituicoes e ON a.escola_id = e.id
        WHERE a.id = NEW.id;

        -- Find Directors (assuming profile 'DIRETOR_COMPLIANCE')
        -- We select from usuarios_escola which should match auth.users id
        SELECT ARRAY_AGG(id) INTO director_ids 
        FROM public.usuarios_escola 
        WHERE perfil = 'DIRETOR_COMPLIANCE';

        IF director_ids IS NOT NULL THEN
            FOREACH director_id_var IN ARRAY director_ids
            LOOP
                INSERT INTO public.notifications (user_id, title, message, type, link, read)
                VALUES (
                    director_id_var,
                    'Auditoria Concluída',
                    'A auditoria ' || audit_record.tipo || ' na escola ' || audit_record.nome_escola || ' foi finalizada.',
                    'success',
                    '/compliance/director/dashboard', -- Opens dashboard where they can see recent audits
                    false
                );
            END LOOP;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists to avoid duplication errors on re-run
DROP TRIGGER IF EXISTS on_audit_completion ON public.auditorias;

CREATE TRIGGER on_audit_completion
AFTER UPDATE OF status ON public.auditorias
FOR EACH ROW
EXECUTE FUNCTION notify_audit_completion();

-- Seed some findings for demo purposes (if audit exists)
DO $$
DECLARE
    v_audit_id UUID;
BEGIN
    SELECT id INTO v_audit_id FROM public.auditorias LIMIT 1;
    IF v_audit_id IS NOT NULL THEN
        -- Check if findings already exist to avoid duplicates on re-run
        IF NOT EXISTS (SELECT 1 FROM public.audit_findings WHERE audit_id = v_audit_id) THEN
            INSERT INTO public.audit_findings (audit_id, description, recommendation, severity)
            VALUES 
            (v_audit_id, 'Ausência de assinatura no termo de compromisso.', 'Coletar assinaturas de todos os colaboradores.', 'Média'),
            (v_audit_id, 'Documentação de extintores vencida.', 'Renovar licença do corpo de bombeiros.', 'Alta');
        END IF;
    END IF;
END $$;
