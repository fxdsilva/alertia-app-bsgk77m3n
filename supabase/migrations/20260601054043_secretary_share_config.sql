DO $$
BEGIN
  -- Insert default setting if it doesn't exist
  INSERT INTO public.admin_settings (key, settings)
  VALUES (
    'secretary_share_app_config',
    '{"enabled": true, "title": "Compartilhar App", "description": "Ajude a promover um ambiente mais ético compartilhando nosso aplicativo.", "url": "https://alertia.goskip.app/public/portal"}'::jsonb
  )
  ON CONFLICT (key) DO NOTHING;
END $$;

-- Ensure director_update_config covers both dashboard config and share app config
DROP POLICY IF EXISTS "director_update_config" ON public.admin_settings;
CREATE POLICY "director_update_config" ON public.admin_settings
  FOR ALL TO authenticated
  USING (key IN ('secretary_dashboard_config', 'secretary_share_app_config'))
  WITH CHECK (key IN ('secretary_dashboard_config', 'secretary_share_app_config'));

-- Ensure secretary_read_config covers both dashboard config and share app config
DROP POLICY IF EXISTS "secretary_read_config" ON public.admin_settings;
CREATE POLICY "secretary_read_config" ON public.admin_settings
  FOR SELECT TO authenticated
  USING (key IN ('secretary_dashboard_config', 'secretary_share_app_config'));

-- Add specific read policy for secretary specifically for share app config (safety measure)
DROP POLICY IF EXISTS "secretary_specific_read_share_config" ON public.admin_settings;
CREATE POLICY "secretary_specific_read_share_config" ON public.admin_settings
  FOR SELECT TO authenticated
  USING (
    key = 'secretary_share_app_config' AND 
    EXISTS (
      SELECT 1 FROM public.usuarios_escola 
      WHERE id = auth.uid() AND perfil = 'SECRETARIA DE EDUCAÇÃO'
    )
  );
