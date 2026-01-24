-- Ensure institutional_docs_auth is JSONB and set appropriate default

-- 1. Drop old default to prepare for type change
ALTER TABLE public.compliance_tasks 
ALTER COLUMN institutional_docs_auth DROP DEFAULT;

-- 2. Convert type from boolean to JSONB using explicit mapping
-- We map TRUE to full access and FALSE (or NULL) to restricted access
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
