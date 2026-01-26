-- Ensure the storage bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('complaint-evidence', 'complaint-evidence', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Policy to allow anyone (anon) to upload evidence
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

-- Policy to allow anyone to read evidence (needed for the public URLs to work)
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
