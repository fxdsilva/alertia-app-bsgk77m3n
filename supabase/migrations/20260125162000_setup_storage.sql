-- Create storage bucket for evidence
INSERT INTO storage.buckets (id, name, public)
VALUES ('complaint-evidence', 'complaint-evidence', true)
ON CONFLICT (id) DO NOTHING;

-- RLS for storage to allow public uploads (for anonymous complaints)
-- Adjust as needed for stricter security (e.g., authenticated only, or specific role)
-- Here we allow public insert to support the public complaint form
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE schemaname = 'storage'
        AND tablename = 'objects'
        AND policyname = 'Public Upload Evidence'
    ) THEN
        CREATE POLICY "Public Upload Evidence"
        ON storage.objects FOR INSERT
        TO public
        WITH CHECK (bucket_id = 'complaint-evidence');
    END IF;
END
$$;

-- Allow public read so the uploaded files can be accessed via the public URL returned by upload()
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE schemaname = 'storage'
        AND tablename = 'objects'
        AND policyname = 'Public Read Evidence'
    ) THEN
        CREATE POLICY "Public Read Evidence"
        ON storage.objects FOR SELECT
        TO public
        USING (bucket_id = 'complaint-evidence');
    END IF;
END
$$;
