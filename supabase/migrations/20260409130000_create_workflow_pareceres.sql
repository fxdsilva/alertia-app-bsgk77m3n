CREATE TABLE IF NOT EXISTS public.workflow_pareceres (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  denuncia_id UUID NOT NULL REFERENCES public.denuncias(id) ON DELETE CASCADE,
  analista_id UUID NOT NULL REFERENCES public.usuarios_escola(id) ON DELETE CASCADE,
  fase INTEGER NOT NULL,
  conclusao TEXT NOT NULL CHECK (conclusao IN ('Procedente', 'Improcedente', 'Necessita mais análise')),
  parecer_texto TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(denuncia_id, analista_id, fase)
);

ALTER TABLE public.workflow_pareceres ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_all_workflow_pareceres" ON public.workflow_pareceres;
CREATE POLICY "allow_all_workflow_pareceres" ON public.workflow_pareceres 
  FOR ALL TO authenticated 
  USING (true) 
  WITH CHECK (true);
