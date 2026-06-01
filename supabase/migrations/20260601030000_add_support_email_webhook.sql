DO $$
BEGIN
  CREATE EXTENSION IF NOT EXISTS pg_net;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

CREATE OR REPLACE FUNCTION public.trigger_send_support_email()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_support_ticket_created ON public.support_tickets;
CREATE TRIGGER on_support_ticket_created
  AFTER INSERT ON public.support_tickets
  FOR EACH ROW EXECUTE FUNCTION public.trigger_send_support_email();
