-- Ensure the storage bucket exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('complaint-evidence', 'complaint-evidence', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Allow public (anon) access to insert/upload files
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public Access Insert Evidence'
    ) THEN
        CREATE POLICY "Public Access Insert Evidence"
        ON storage.objects FOR INSERT
        TO public
        WITH CHECK (bucket_id = 'complaint-evidence');
    END IF;
END $$;

-- Allow authenticated users (internal roles) and public (for getPublicUrl) to view files
-- Since the bucket is public and we use getPublicUrl, we allow SELECT to public to ensure the links work
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public Access Select Evidence'
    ) THEN
        CREATE POLICY "Public Access Select Evidence"
        ON storage.objects FOR SELECT
        TO public
        USING (bucket_id = 'complaint-evidence');
    END IF;
END $$;
