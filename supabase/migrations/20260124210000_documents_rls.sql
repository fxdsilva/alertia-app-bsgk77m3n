-- Enable RLS on document tables if not already
ALTER TABLE public.codigo_conduta ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compromisso_alta_gestao ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.relatorios_consolidados ENABLE ROW LEVEL SECURITY;

-- Policy: Analysts can view Code of Conduct if they have a task with institutional_docs_auth
DROP POLICY IF EXISTS "Analysts View Code of Conduct" ON public.codigo_conduta;
CREATE POLICY "Analysts View Code of Conduct" ON public.codigo_conduta
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.compliance_tasks
    WHERE compliance_tasks.escola_id = codigo_conduta.escola_id
    AND compliance_tasks.analista_id = auth.uid()
    AND compliance_tasks.institutional_docs_auth = TRUE
  )
  OR
  EXISTS (
     SELECT 1 FROM public.usuarios_escola
     WHERE id = auth.uid() AND perfil IN ('DIRETOR_COMPLIANCE', 'senior', 'gestao_escola')
  )
);

-- Policy: Analysts can view Commitment if they have a task with institutional_docs_auth
DROP POLICY IF EXISTS "Analysts View Commitment" ON public.compromisso_alta_gestao;
CREATE POLICY "Analysts View Commitment" ON public.compromisso_alta_gestao
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.compliance_tasks
    WHERE compliance_tasks.escola_id = compromisso_alta_gestao.escola_id
    AND compliance_tasks.analista_id = auth.uid()
    AND compliance_tasks.institutional_docs_auth = TRUE
  )
  OR
  EXISTS (
     SELECT 1 FROM public.usuarios_escola
     WHERE id = auth.uid() AND perfil IN ('DIRETOR_COMPLIANCE', 'senior', 'gestao_escola')
  )
);

-- Policy: Analysts can insert Consolidated Reports if assigned a 'consolidacao' task
DROP POLICY IF EXISTS "Analysts Insert Consolidated Reports" ON public.relatorios_consolidados;
CREATE POLICY "Analysts Insert Consolidated Reports" ON public.relatorios_consolidados
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.compliance_tasks
    WHERE compliance_tasks.escola_id = relatorios_consolidados.escola_id
    AND compliance_tasks.analista_id = auth.uid()
    AND compliance_tasks.tipo_modulo = 'consolidacao'
  )
  OR
  EXISTS (
     SELECT 1 FROM public.usuarios_escola
     WHERE id = auth.uid() AND perfil IN ('DIRETOR_COMPLIANCE', 'senior')
  )
);
