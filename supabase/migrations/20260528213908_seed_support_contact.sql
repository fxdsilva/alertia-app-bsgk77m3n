-- Ensure RLS is enabled
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Recreate policies idempotently
DROP POLICY IF EXISTS "Allow public read access to support settings" ON public.admin_settings;
CREATE POLICY "Allow public read access to support settings" ON public.admin_settings
  FOR SELECT USING (key IN ('support_contact_info', 'support_faqs', 'external_official_channels'));

DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.admin_settings;
CREATE POLICY "Enable all access for authenticated users" ON public.admin_settings
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable read access for anon users" ON public.admin_settings;
CREATE POLICY "Enable read access for anon users" ON public.admin_settings
  FOR SELECT TO anon USING (true);

-- Insert seed data
DO $$
BEGIN
  INSERT INTO public.admin_settings (key, settings)
  VALUES (
    'support_contact_info',
    '{"phone": "5511999999999", "email": "support@alertia.com.br"}'::jsonb
  )
  ON CONFLICT (key) DO NOTHING;
END $$;
