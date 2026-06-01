DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.admin_settings WHERE key = 'secretary_dashboard_config') THEN
    INSERT INTO public.admin_settings (key, settings)
    VALUES (
      'secretary_dashboard_config',
      '{
        "welcomeMessage": "Bem-vindo ao painel da Secretaria de Educação. Aqui você acompanha a evolução do programa de integridade nas escolas da rede.",
        "showStats": true,
        "showSchools": true,
        "showReports": true,
        "customLinks": []
      }'::jsonb
    );
  END IF;
END $$;

DROP POLICY IF EXISTS "secretary_read_config" ON public.admin_settings;
CREATE POLICY "secretary_read_config" ON public.admin_settings
  FOR SELECT TO authenticated
  USING (key = 'secretary_dashboard_config');

DROP POLICY IF EXISTS "director_update_config" ON public.admin_settings;
CREATE POLICY "director_update_config" ON public.admin_settings
  FOR ALL TO authenticated
  USING (key = 'secretary_dashboard_config')
  WITH CHECK (key = 'secretary_dashboard_config');
