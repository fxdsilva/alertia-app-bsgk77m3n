-- Create the bucket for complaint evidence if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'complaint-evidence', 
    'complaint-evidence', 
    true, 
    52428800, -- 50MB
    ARRAY[
        'image/jpeg', 
        'image/png', 
        'image/gif', 
        'image/webp', 
        'application/pdf', 
        'audio/mpeg', -- mp3
        'audio/wav', 
        'audio/mp4', 
        'audio/x-m4a', -- m4a
        'audio/ogg',
        'video/mp4', 
        'video/quicktime', -- mov
        'video/webm',
        'video/x-msvideo' -- avi
    ]
)
ON CONFLICT (id) DO UPDATE SET 
    public = true,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- RLS: Allow public upload to the evidence bucket
DROP POLICY IF EXISTS "Allow public upload evidence" ON storage.objects;

CREATE POLICY "Allow public upload evidence"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'complaint-evidence');

-- RLS: Enable public insert for complaints table
ALTER TABLE "public"."denuncias" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable public insert for complaints" ON "public"."denuncias";

CREATE POLICY "Enable public insert for complaints"
ON "public"."denuncias"
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Ensure schools list is readable by public (for the dropdown)
ALTER TABLE "public"."escolas_instituicoes" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read schools" ON "public"."escolas_instituicoes";

CREATE POLICY "Allow public read schools"
ON "public"."escolas_instituicoes"
FOR SELECT
TO anon, authenticated
USING (ativo = true);
