DO $$
BEGIN
  -- Allow authenticated users to select objects (so signed URLs can be generated for analysis)
  DROP POLICY IF EXISTS "Allow select for authenticated users" ON storage.objects;
  CREATE POLICY "Allow select for authenticated users" ON storage.objects
    FOR SELECT TO authenticated USING (true);

  -- Allow everyone to insert objects (for anonymous complaints evidence upload)
  DROP POLICY IF EXISTS "Allow insert for everyone" ON storage.objects;
  CREATE POLICY "Allow insert for everyone" ON storage.objects
    FOR INSERT TO public WITH CHECK (true);
    
  -- Allow authenticated users to update objects (if needed for complaint corrections)
  DROP POLICY IF EXISTS "Allow update for authenticated users" ON storage.objects;
  CREATE POLICY "Allow update for authenticated users" ON storage.objects
    FOR UPDATE TO authenticated USING (true);
END $$;
