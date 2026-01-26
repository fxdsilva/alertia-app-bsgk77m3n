-- Enable Row Level Security on relevant tables
ALTER TABLE "public"."denuncias" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."escolas_instituicoes" ENABLE ROW LEVEL SECURITY;

-- 1. COMPLAINTS (DENUNCIAS)
-- Drop existing restrictive policies to ensure the new permissive one takes effect
DROP POLICY IF EXISTS "Allow public anonymous complaints" ON "public"."denuncias";
DROP POLICY IF EXISTS "Enable insert for public" ON "public"."denuncias";
DROP POLICY IF EXISTS "Enable insert for authenticated" ON "public"."denuncias";
DROP POLICY IF EXISTS "Allow public and auth inserts" ON "public"."denuncias";

-- Create a permissive policy for INSERT operations
-- This allows both anonymous (public) and authenticated users to submit complaints
-- We remove constraints on 'anonimo' column to allow identified public complaints (via text)
CREATE POLICY "Enable public insert for complaints"
ON "public"."denuncias"
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Ensure SELECT/UPDATE/DELETE are NOT allowed for anon (Default Deny applies if no policy exists)
-- Existing policies for admins/analysts should handle their access. 
-- We do not add SELECT for anon here to protect privacy.

-- 2. SCHOOLS (ESCOLAS_INSTITUICOES)
-- Ensure public users can fetch the list of schools for the dropdown
DROP POLICY IF EXISTS "Allow public read schools" ON "public"."escolas_instituicoes";

CREATE POLICY "Allow public read schools"
ON "public"."escolas_instituicoes"
FOR SELECT
TO anon, authenticated
USING (ativo = true);

-- 3. STORAGE (EVIDENCE UPLOAD)
-- Ensure the bucket exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('complaint-evidence', 'complaint-evidence', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public uploads to the specific bucket
DROP POLICY IF EXISTS "Allow public upload evidence" ON storage.objects;

CREATE POLICY "Allow public upload evidence"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'complaint-evidence');

-- Allow public read of evidence (required for seeing what was uploaded or if public bucket)
-- Since the bucket is set to public=true, direct URL access works.
-- But RLS on objects might still block 'SELECT' via API if we were listing files.
-- For simple direct access via public URL, usually no RLS select policy is strictly needed if bucket is public.
