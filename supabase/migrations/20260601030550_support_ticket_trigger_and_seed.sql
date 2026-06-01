DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Seed user fxdsilva@gmail.com
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'fxdsilva@gmail.com') THEN
    new_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      new_user_id,
      '00000000-0000-0000-0000-000000000000',
      'fxdsilva@gmail.com',
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Admin"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );

    INSERT INTO public.usuarios_admin_master (id, email, nome, senha_hash, ativo)
    VALUES (new_user_id, 'fxdsilva@gmail.com', 'Admin Master', 'MANAGED_BY_SUPABASE_AUTH', true)
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- Create extension pg_net if not exists
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Function to send support email via webhook
CREATE OR REPLACE FUNCTION public.trigger_send_support_email()
RETURNS trigger
SECURITY DEFINER
AS $$
DECLARE
  request_id bigint;
  url text := 'https://quygstnufewyyenaccre.supabase.co/functions/v1/send-support-email';
BEGIN
  -- Fire and forget the webhook using pg_net
  SELECT net.http_post(
      url := url,
      headers := '{"Content-Type": "application/json"}'::jsonb,
      body := jsonb_build_object('type', 'INSERT', 'table', 'support_tickets', 'record', row_to_json(NEW))
  ) INTO request_id;
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Do not block the insert if webhook fails
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_support_ticket_created ON public.support_tickets;
CREATE TRIGGER on_support_ticket_created
  AFTER INSERT ON public.support_tickets
  FOR EACH ROW EXECUTE FUNCTION public.trigger_send_support_email();
