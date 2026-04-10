CREATE TABLE IF NOT EXISTS public.support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pendente',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public to insert support tickets" ON public.support_tickets;
CREATE POLICY "Allow public to insert support tickets" ON public.support_tickets
    FOR INSERT TO public WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated to read support tickets" ON public.support_tickets;
CREATE POLICY "Allow authenticated to read support tickets" ON public.support_tickets
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated to update support tickets" ON public.support_tickets;
CREATE POLICY "Allow authenticated to update support tickets" ON public.support_tickets
    FOR UPDATE TO authenticated USING (true);
