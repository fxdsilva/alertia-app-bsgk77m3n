DO $DO$
BEGIN
  INSERT INTO public.admin_settings (key, settings)
  VALUES (
    'support_contact_info',
    '{"email": "suporte@alertia.com.br", "phone": "(11) 99999-9999", "whatsapp": "5511999999999", "receivingEmail": "suporte@alertia.com.br"}'::jsonb
  )
  ON CONFLICT (key) DO NOTHING;
END $DO$;
