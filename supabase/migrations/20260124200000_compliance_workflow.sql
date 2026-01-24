-- Fix any potential invalid data in tipo_modulo before applying the constraint
-- We fallback invalid types to 'auditoria' which is a safe default
UPDATE public.compliance_tasks 
SET tipo_modulo = 'auditoria' 
WHERE tipo_modulo NOT IN ('compromisso', 'codigo_conduta', 'treinamentos', 'auditoria', 'riscos', 'controles_internos', 'consolidacao', 'denuncias', 'documentacao');

-- Ensure institutional_docs_auth is BOOLEAN (fix for potential JSONB type mismatch error)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'compliance_tasks' 
    AND column_name = 'institutional_docs_auth' 
    AND data_type = 'jsonb'
  ) THEN
    -- 1. Drop the default value first to avoid casting errors during type change
    ALTER TABLE public.compliance_tasks ALTER COLUMN institutional_docs_auth DROP DEFAULT;
    
    -- 2. Convert column to boolean with explicit casting
    -- We use a CASE statement to handle potential text representations of jsonb boolean values
    ALTER TABLE public.compliance_tasks 
    ALTER COLUMN institutional_docs_auth TYPE BOOLEAN 
    USING (
      CASE 
        WHEN institutional_docs_auth::text = 'true' THEN true
        WHEN institutional_docs_auth::text = 'false' THEN false
        ELSE false -- Default to false for any other value or null
      END
    );
    
    -- 3. Set the default back to FALSE (boolean)
    ALTER TABLE public.compliance_tasks ALTER COLUMN institutional_docs_auth SET DEFAULT FALSE;
  END IF;
END $$;

-- Ensure investigation status enum or checks
-- First, ensure all existing statuses are valid
UPDATE public.investigacoes 
SET status = 'em_andamento' 
WHERE status NOT IN ('em_andamento', 'concluida', 'pausada', 'arquivada');

ALTER TABLE public.investigacoes
DROP CONSTRAINT IF EXISTS investigacoes_status_check;

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

-- Add column to tasks for specific module type if not exists
ALTER TABLE public.compliance_tasks
DROP CONSTRAINT IF EXISTS compliance_tasks_tipo_modulo_check;

ALTER TABLE public.compliance_tasks
ADD CONSTRAINT compliance_tasks_tipo_modulo_check
CHECK (tipo_modulo IN ('compromisso', 'codigo_conduta', 'treinamentos', 'auditoria', 'riscos', 'controles_internos', 'consolidacao', 'denuncias', 'documentacao'));
