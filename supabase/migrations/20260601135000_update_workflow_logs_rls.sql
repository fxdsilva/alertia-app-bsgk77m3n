-- Ensure index exists to fetch logs by complaint efficiently
CREATE INDEX IF NOT EXISTS idx_compliance_workflow_logs_complaint_id ON public.compliance_workflow_logs(complaint_id);

-- Ensure RLS is enabled on compliance_workflow_logs
ALTER TABLE public.compliance_workflow_logs ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert logs
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.compliance_workflow_logs;
CREATE POLICY "Enable insert for authenticated users" ON public.compliance_workflow_logs
  FOR INSERT TO authenticated WITH CHECK (true);

-- Allow authenticated users to read logs
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.compliance_workflow_logs;
CREATE POLICY "Enable read access for authenticated users" ON public.compliance_workflow_logs
  FOR SELECT TO authenticated USING (true);
