-- Migration to ensure public access for complaint submission
-- This migration updates RLS policies and creates a trigger for logging

-- 1. STATUS DENUNCIA
-- Ensure 'A designar' status exists as it is required by the portal
INSERT INTO public.status_denuncia (id, nome_status, created_at, updated_at)
SELECT gen_random_uuid(), 'A designar', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM public.status_denuncia WHERE nome_status = 'A designar');

-- Enable RLS on status_denuncia and allow public read
ALTER TABLE "public"."status_denuncia" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Status" ON "public"."status_denuncia";
CREATE POLICY "Public Read Status" ON "public"."status_denuncia"
FOR SELECT
TO anon, authenticated
USING (true);

-- 2. DENUNCIAS
-- Enable RLS on denuncias
ALTER TABLE "public"."denuncias" ENABLE ROW LEVEL SECURITY;

-- Allow INSERT for public (anon) and authenticated users
-- We drop existing policies to ensure clean state
DROP POLICY IF EXISTS "Enable public insert for complaints" ON "public"."denuncias";
DROP POLICY IF EXISTS "Public Insert Complaint" ON "public"."denuncias";

CREATE POLICY "Public Insert Complaint" ON "public"."denuncias"
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Note: We DO NOT add a SELECT policy for 'anon' to protect privacy. 
-- The client will not be able to SELECT the row after insert, so we use a Trigger for logging.

-- 3. COMPLIANCE WORKFLOW LOGS
-- We rely on a Trigger (SECURITY DEFINER) to insert logs, so no public INSERT policy needed here.
-- But we ensure RLS is enabled to be safe.
ALTER TABLE "public"."compliance_workflow_logs" ENABLE ROW LEVEL SECURITY;

-- 4. PUBLIC DOCUMENTS
-- Allow reading Code of Conduct and Management Commitment
ALTER TABLE "public"."compromisso_alta_gestao" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Compromisso" ON "public"."compromisso_alta_gestao";

CREATE POLICY "Public Read Compromisso" ON "public"."compromisso_alta_gestao"
FOR SELECT
TO anon, authenticated
USING (true);

ALTER TABLE "public"."codigo_conduta" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Codigo" ON "public"."codigo_conduta";

CREATE POLICY "Public Read Codigo" ON "public"."codigo_conduta"
FOR SELECT
TO anon, authenticated
USING (true);

-- 5. SCHOOLS
-- Ensure schools are readable (dropdown)
ALTER TABLE "public"."escolas_instituicoes" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read schools" ON "public"."escolas_instituicoes";

CREATE POLICY "Allow public read schools" ON "public"."escolas_instituicoes"
FOR SELECT
TO anon, authenticated
USING (ativo = true);

-- 6. TRIGGER FOR LOGGING
-- Since the public user cannot SELECT the complaint to get the ID for logging,
-- we use a Trigger to automatically create the initial log entry.

CREATE OR REPLACE FUNCTION public.handle_new_complaint_log()
RETURNS TRIGGER AS $$
DECLARE
  status_label text;
BEGIN
  -- Get status name
  SELECT nome_status INTO status_label FROM public.status_denuncia WHERE id = NEW.status;
  
  -- Insert log
  INSERT INTO public.compliance_workflow_logs (complaint_id, new_status, comments)
  VALUES (NEW.id, COALESCE(status_label, 'Status Inicial'), 'Denúncia registrada via Portal (Status Inicial)');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists to avoid duplication
DROP TRIGGER IF EXISTS on_complaint_created ON public.denuncias;

CREATE TRIGGER on_complaint_created
AFTER INSERT ON public.denuncias
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_complaint_log();
