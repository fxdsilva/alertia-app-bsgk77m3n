CREATE TABLE IF NOT EXISTS public.email_delivery_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID REFERENCES public.support_tickets(id) ON DELETE CASCADE NOT NULL,
    status TEXT NOT NULL,
    resend_id TEXT,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.email_delivery_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_admin_read" ON public.email_delivery_logs;
CREATE POLICY "allow_admin_read" ON public.email_delivery_logs
    FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.usuarios_escola ue
            WHERE ue.id = auth.uid() AND ue.perfil IN ('senior', 'administrador', 'admin_gestor')
        ) OR public.check_is_admin_master()
    );

DROP POLICY IF EXISTS "allow_service_role" ON public.email_delivery_logs;
CREATE POLICY "allow_service_role" ON public.email_delivery_logs
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.trigger_send_support_email()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$;

DROP TRIGGER IF EXISTS on_support_ticket_created ON public.support_tickets;
CREATE TRIGGER on_support_ticket_created
  AFTER INSERT ON public.support_tickets
  FOR EACH ROW EXECUTE FUNCTION public.trigger_send_support_email();
