-- Ensure institutional_docs_auth is JSONB and set appropriate default
ALTER TABLE public.compliance_tasks 
ALTER COLUMN institutional_docs_auth DROP DEFAULT;

-- We assume the column is already JSONB or can be cast to it. 
-- If it was boolean, a previous migration should have handled it. 
-- This statement ensures the type is JSONB.
ALTER TABLE public.compliance_tasks
ALTER COLUMN institutional_docs_auth TYPE JSONB USING institutional_docs_auth::JSONB;

-- Set the default to a safe JSONB object structure
ALTER TABLE public.compliance_tasks
ALTER COLUMN institutional_docs_auth SET DEFAULT '{"include": false, "elaborate": false, "update": false, "consolidate": false}'::jsonb;
