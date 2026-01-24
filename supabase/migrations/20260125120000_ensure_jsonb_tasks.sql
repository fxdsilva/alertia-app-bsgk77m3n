-- Fix: Drop dependent policies before altering column type
-- The error "cannot alter type of a column used in a policy definition" indicates we must drop policies first

DROP POLICY IF EXISTS "Analysts View Code of Conduct" ON public.codigo_conduta;
DROP POLICY IF EXISTS "Analysts View Commitment" ON public.compromisso_gestao;

-- 1. Drop old default to prepare for type change
ALTER TABLE public.compliance_tasks 
ALTER COLUMN institutional_docs_auth DROP DEFAULT;

-- 2. Convert type from boolean to JSONB using explicit mapping
ALTER TABLE public.compliance_tasks
ALTER COLUMN institutional_docs_auth TYPE JSONB 
USING (
  CASE 
    WHEN institutional_docs_auth IS TRUE THEN 
      '{"include": true, "elaborate": true, "update": true, "consolidate": true}'::jsonb
    ELSE 
      '{"include": false, "elaborate": false, "update": false, "consolidate": false}'::jsonb
  END
);

-- 3. Set the new default to a safe JSONB object structure
ALTER TABLE public.compliance_tasks
ALTER COLUMN institutional_docs_auth SET DEFAULT '{"include": false, "elaborate": false, "update": false, "consolidate": false}'::jsonb;

-- 4. Recreate policies with updated JSONB check logic
-- Recreate Policy for Code of Conduct
CREATE POLICY "Analysts View Code of Conduct" ON public.codigo_conduta
FOR SELECT
TO authenticated
USING (
  -- Check for task-based permission
  EXISTS (
    SELECT 1 FROM compliance_tasks t
    WHERE t.escola_id = codigo_conduta.escola_id
    AND t.analista_id = auth.uid()
    AND (t.institutional_docs_auth->>'include')::boolean = true
  )
  -- Or check for admin/director profile
  OR EXISTS (
    SELECT 1 FROM usuarios_escola u
    WHERE u.id = auth.uid()
    AND u.escola_id = codigo_conduta.escola_id
    AND u.perfil IN ('diretor', 'gestao_escola', 'admin', 'admin_master')
  )
);

-- Recreate Policy for Commitment (Optimistic check if table exists to prevent migration failure)
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'compromisso_gestao') THEN
        CREATE POLICY "Analysts View Commitment" ON public.compromisso_gestao
        FOR SELECT
        TO authenticated
        USING (
            -- Check for task-based permission
            EXISTS (
                SELECT 1 FROM compliance_tasks t
                WHERE t.escola_id = compromisso_gestao.escola_id
                AND t.analista_id = auth.uid()
                AND (t.institutional_docs_auth->>'include')::boolean = true
            )
            -- Or check for admin/director profile
            OR EXISTS (
                SELECT 1 FROM usuarios_escola u
                WHERE u.id = auth.uid()
                AND u.escola_id = compromisso_gestao.escola_id
                AND u.perfil IN ('diretor', 'gestao_escola', 'admin', 'admin_master')
            )
        );
    END IF;
END
$$;
