-- Add Foreign Keys to link modules back to the original complaint (denuncia)
ALTER TABLE public.mediacoes ADD COLUMN IF NOT EXISTS denuncia_id UUID REFERENCES public.denuncias(id);
ALTER TABLE public.processos_disciplinares ADD COLUMN IF NOT EXISTS denuncia_id UUID REFERENCES public.denuncias(id);
ALTER TABLE public.auditorias ADD COLUMN IF NOT EXISTS denuncia_id UUID REFERENCES public.denuncias(id);
ALTER TABLE public.matriz_riscos ADD COLUMN IF NOT EXISTS denuncia_id UUID REFERENCES public.denuncias(id);
ALTER TABLE public.controles_internos ADD COLUMN IF NOT EXISTS denuncia_id UUID REFERENCES public.denuncias(id);

-- Ensure RLS on compliance_workflow_logs
ALTER TABLE public.compliance_workflow_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for authenticated users" ON public.compliance_workflow_logs
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert for authenticated users" ON public.compliance_workflow_logs
    FOR INSERT TO authenticated WITH CHECK (true);

-- Ensure RLS on denuncias prevents analysts from updating fields they shouldn't
-- This is a complex logic usually handled by service/backend, but we can add a constraint check via trigger or rely on app logic for now
-- given the complexity of dynamic analyst assignment permissions.
-- We will rely on the application layer validation in workflowService for specific field updates (parecer_1, etc).
