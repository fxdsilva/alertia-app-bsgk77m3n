-- Enable RLS on denuncias if not already enabled (it usually is)
ALTER TABLE "public"."denuncias" ENABLE ROW LEVEL SECURITY;

-- Allow public (anon) and authenticated users to insert anonymous complaints
-- Rule: anonimo must be true and denunciante_id must be null for public access pattern
CREATE POLICY "Allow public anonymous complaints" 
ON "public"."denuncias" 
FOR INSERT 
TO anon, authenticated
WITH CHECK (
  (anonimo = true) AND (denunciante_id IS NULL)
);

-- Allow public read access to schools for the dropdown
-- This assumes escolas_instituicoes contains public information about schools
ALTER TABLE "public"."escolas_instituicoes" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read schools" 
ON "public"."escolas_instituicoes" 
FOR SELECT 
TO anon, authenticated 
USING (status_adesao = 'ativo');
