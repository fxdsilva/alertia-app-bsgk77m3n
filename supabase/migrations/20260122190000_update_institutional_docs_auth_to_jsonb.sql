-- Drop the default value first to avoid casting errors during type conversion
ALTER TABLE public.compliance_tasks 
ALTER COLUMN institutional_docs_auth DROP DEFAULT;

-- Change institutional_docs_auth from BOOLEAN to JSONB to support granular permissions
ALTER TABLE public.compliance_tasks
ALTER COLUMN institutional_docs_auth TYPE JSONB
USING CASE
    WHEN institutional_docs_auth::boolean = true THEN '{"include": true, "elaborate": true, "update": true, "consolidate": true}'::jsonb
    ELSE '{"include": false, "elaborate": false, "update": false, "consolidate": false}'::jsonb
END;

-- Set default value for the new JSONB column
ALTER TABLE public.compliance_tasks
ALTER COLUMN institutional_docs_auth SET DEFAULT '{"include": false, "elaborate": false, "update": false, "consolidate": false}'::jsonb;
