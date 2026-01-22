-- Add new columns for granular permissions in compliance_tasks
ALTER TABLE public.compliance_tasks
ADD COLUMN IF NOT EXISTS institutional_docs_auth BOOLEAN DEFAULT FALSE;

ALTER TABLE public.compliance_tasks
ADD COLUMN IF NOT EXISTS school_manager_access_config JSONB DEFAULT NULL;

ALTER TABLE public.compliance_tasks
ADD COLUMN IF NOT EXISTS gestor_escolar_id UUID REFERENCES public.usuarios_escola(id);

-- Enable RLS on compliance_tasks if not already enabled
ALTER TABLE public.compliance_tasks ENABLE ROW LEVEL SECURITY;

-- Policy for Directors to manage all tasks
DROP POLICY IF EXISTS "Director Compliance Manage Tasks" ON public.compliance_tasks;
CREATE POLICY "Director Compliance Manage Tasks" ON public.compliance_tasks
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.usuarios_escola
    WHERE id = auth.uid() AND perfil = 'DIRETOR_COMPLIANCE'
  )
);

-- Policy for Directors to read all users (to select analysts and managers)
DROP POLICY IF EXISTS "Director Compliance Read All Users" ON public.usuarios_escola;
CREATE POLICY "Director Compliance Read All Users" ON public.usuarios_escola
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.usuarios_escola
    WHERE id = auth.uid() AND perfil = 'DIRETOR_COMPLIANCE'
  )
);

-- Policy for Analysts to read their assigned tasks
DROP POLICY IF EXISTS "Analysts Read Assigned Tasks" ON public.compliance_tasks;
CREATE POLICY "Analysts Read Assigned Tasks" ON public.compliance_tasks
FOR SELECT
TO authenticated
USING (
  analista_id = auth.uid() OR secondary_analyst_id = auth.uid()
);

-- Policy for School Managers (Gestor Escolar) to read tasks where they are authorized
DROP POLICY IF EXISTS "School Managers Read Authorized Tasks" ON public.compliance_tasks;
CREATE POLICY "School Managers Read Authorized Tasks" ON public.compliance_tasks
FOR SELECT
TO authenticated
USING (
  gestor_escolar_id = auth.uid()
);
