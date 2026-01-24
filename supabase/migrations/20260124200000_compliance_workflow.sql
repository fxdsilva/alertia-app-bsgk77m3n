-- Ensure investigation status enum or checks
ALTER TABLE public.investigacoes
ADD CONSTRAINT investigacoes_status_check
CHECK (status IN ('em_andamento', 'concluida', 'pausada', 'arquivada'));

-- Ensure RLS for investigations
ALTER TABLE public.investigacoes ENABLE ROW LEVEL SECURITY;

-- Analyst can view their investigations
DROP POLICY IF EXISTS "Analyst View Investigations" ON public.investigacoes;
CREATE POLICY "Analyst View Investigations" ON public.investigacoes
FOR SELECT
TO authenticated
USING (
  analista_id = auth.uid() OR
  EXISTS (
     SELECT 1 FROM public.usuarios_escola
     WHERE id = auth.uid() AND perfil IN ('DIRETOR_COMPLIANCE', 'senior')
  )
);

-- Analyst can update their investigations
DROP POLICY IF EXISTS "Analyst Update Investigations" ON public.investigacoes;
CREATE POLICY "Analyst Update Investigations" ON public.investigacoes
FOR UPDATE
TO authenticated
USING (
  analista_id = auth.uid()
);

-- Denuncias RLS update to allow reading by designated analyst
DROP POLICY IF EXISTS "Analyst View Assigned Complaints" ON public.denuncias;
CREATE POLICY "Analyst View Assigned Complaints" ON public.denuncias
FOR SELECT
TO authenticated
USING (
  analista_id = auth.uid() OR
  EXISTS (
     SELECT 1 FROM public.usuarios_escola
     WHERE id = auth.uid() AND perfil IN ('DIRETOR_COMPLIANCE', 'senior')
  )
);

-- Add column to tasks for specific module type if not exists (already in schema but good to ensure constraints)
ALTER TABLE public.compliance_tasks
DROP CONSTRAINT IF EXISTS compliance_tasks_tipo_modulo_check;

ALTER TABLE public.compliance_tasks
ADD CONSTRAINT compliance_tasks_tipo_modulo_check
CHECK (tipo_modulo IN ('compromisso', 'codigo_conduta', 'treinamentos', 'auditoria', 'riscos', 'controles_internos', 'consolidacao', 'denuncias', 'documentacao'));

