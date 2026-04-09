CREATE TABLE IF NOT EXISTS public.workflow_analistas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  denuncia_id UUID NOT NULL REFERENCES public.denuncias(id) ON DELETE CASCADE,
  analista_id UUID NOT NULL REFERENCES public.usuarios_escola(id) ON DELETE CASCADE,
  fase INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(denuncia_id, analista_id, fase)
);

ALTER TABLE public.workflow_analistas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_all_workflow_analistas" ON public.workflow_analistas;
CREATE POLICY "allow_all_workflow_analistas" ON public.workflow_analistas 
  FOR ALL TO authenticated 
  USING (true) 
  WITH CHECK (true);
