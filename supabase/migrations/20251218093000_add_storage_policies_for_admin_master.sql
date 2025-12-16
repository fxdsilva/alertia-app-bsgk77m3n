-- Policies for Admin Master (Senior) on Storage
-- "school-documents" bucket

-- Allow Admin Master to upload files
CREATE POLICY "Admin Master Upload" ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'school-documents' AND
    public.check_is_admin_master()
);

-- Allow Admin Master to update files
CREATE POLICY "Admin Master Update" ON storage.objects FOR UPDATE USING (
    bucket_id = 'school-documents' AND
    public.check_is_admin_master()
);

-- Allow Admin Master to delete files
CREATE POLICY "Admin Master Delete" ON storage.objects FOR DELETE USING (
    bucket_id = 'school-documents' AND
    public.check_is_admin_master()
);

