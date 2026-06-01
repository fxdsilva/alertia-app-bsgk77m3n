DO $$
BEGIN
  CREATE INDEX IF NOT EXISTS idx_denuncias_envolvidos_detalhes ON public.denuncias USING GIN (envolvidos_detalhes);
END $$;
