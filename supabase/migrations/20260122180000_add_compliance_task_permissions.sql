-- Add permissions and configuration columns to compliance_tasks
-- Using IF NOT EXISTS to avoid errors if columns were already added

ALTER TABLE public.compliance_tasks 
ADD COLUMN IF NOT EXISTS institutional_docs_auth BOOLEAN DEFAULT FALSE;

ALTER TABLE public.compliance_tasks 
ADD COLUMN IF NOT EXISTS school_manager_access_config JSONB DEFAULT NULL;

ALTER TABLE public.compliance_tasks 
ADD COLUMN IF NOT EXISTS gestor_escolar_id UUID REFERENCES public.usuarios_escola(id);
