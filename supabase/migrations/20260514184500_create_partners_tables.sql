CREATE TABLE IF NOT EXISTS public.instituicoes_parceiras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL,
  categoria TEXT,
  logo_url TEXT,
  link_url TEXT,
  descricao TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.documentos_parceiros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  tipo TEXT NOT NULL,
  data_documento DATE,
  arquivo_url TEXT NOT NULL,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.instituicoes_parceiras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documentos_parceiros ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read parceiros" ON public.instituicoes_parceiras;
CREATE POLICY "Public read parceiros" ON public.instituicoes_parceiras FOR SELECT USING (ativo = true);

DROP POLICY IF EXISTS "Public read documentos_parceiros" ON public.documentos_parceiros;
CREATE POLICY "Public read documentos_parceiros" ON public.documentos_parceiros FOR SELECT USING (ativo = true);

DROP POLICY IF EXISTS "Admin write parceiros" ON public.instituicoes_parceiras;
CREATE POLICY "Admin write parceiros" ON public.instituicoes_parceiras 
  FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.usuarios_escola ue WHERE ue.id = auth.uid() AND ue.perfil IN ('senior', 'administrador', 'admin_gestor')));

DROP POLICY IF EXISTS "Admin write documentos_parceiros" ON public.documentos_parceiros;
CREATE POLICY "Admin write documentos_parceiros" ON public.documentos_parceiros 
  FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.usuarios_escola ue WHERE ue.id = auth.uid() AND ue.perfil IN ('senior', 'administrador', 'admin_gestor')));

-- Seed data
INSERT INTO public.instituicoes_parceiras (nome, tipo, categoria, logo_url, descricao) VALUES
  ('Instituto Educar', 'parceiro', 'Instituição de Ensino', 'https://img.usecurling.com/i?q=education&shape=outline&color=blue', 'Comprometidos com a educação de qualidade.'),
  ('Fundação Futuro', 'parceiro', 'ONG', 'https://img.usecurling.com/i?q=foundation&shape=outline&color=green', 'Apoiando iniciativas educacionais.'),
  ('Tech Escola', 'parceiro', 'EdTech', 'https://img.usecurling.com/i?q=tech&shape=outline&color=cyan', 'Tecnologia a favor do ensino.'),
  ('Rede Aprender', 'parceiro', 'Rede de Escolas', 'https://img.usecurling.com/i?q=school&shape=outline&color=orange', 'Uma das maiores redes do país.'),
  ('Saber Mais', 'parceiro', 'Instituição de Ensino', 'https://img.usecurling.com/i?q=book&shape=outline&color=purple', 'Projeto de aceleração do aprendizado.'),
  ('Educa Brasil', 'parceiro', 'ONG', 'https://img.usecurling.com/i?q=globe&shape=outline&color=azure', 'Atuando em prol de um ensino igualitário.'),
  ('TechCorp', 'patrocinador', 'Corporativo', 'https://img.usecurling.com/i?q=corporate&shape=fill&color=black', 'Inovação corporativa para escolas.'),
  ('Banco Inova', 'patrocinador', 'Banco', 'https://img.usecurling.com/i?q=bank&shape=fill&color=blue', 'Investimento no futuro das crianças.'),
  ('Fundação Global', 'patrocinador', 'Fundação', 'https://img.usecurling.com/i?q=globe&shape=fill&color=green', 'Apoiador master internacional.'),
  ('Ministério da Educação', 'apoio', 'Governo', 'https://img.usecurling.com/i?q=government&shape=lineal-color&color=multicolor', 'Parceria estratégica nacional.'),
  ('Universidade Federal', 'apoio', 'Universidade', 'https://img.usecurling.com/i?q=university&shape=lineal-color&color=multicolor', 'Desenvolvimento de pesquisas conjuntas.'),
  ('Secretaria Estadual', 'apoio', 'Governo', 'https://img.usecurling.com/i?q=building&shape=lineal-color&color=multicolor', 'Integração regional.')
ON CONFLICT DO NOTHING;

INSERT INTO public.documentos_parceiros (titulo, tipo, data_documento, arquivo_url) VALUES
  ('Certificado de Conformidade 2023', 'Certificado', '2023-12-01', '#'),
  ('Termo de Cooperação Técnica - MEC', 'Termo', '2024-01-15', '#'),
  ('Certificação ISO 37001', 'Certificado', '2024-02-10', '#'),
  ('Convênio Universidade Federal', 'Termo', '2024-03-20', '#')
ON CONFLICT DO NOTHING;

-- Storage Bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('parceiros-logos', 'parceiros-logos', true) ON CONFLICT DO NOTHING;

DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'parceiros-logos');

DROP POLICY IF EXISTS "Admin Upload Parceiros" ON storage.objects;
CREATE POLICY "Admin Upload Parceiros" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'parceiros-logos' AND 
  EXISTS (SELECT 1 FROM public.usuarios_escola ue WHERE ue.id = auth.uid() AND ue.perfil IN ('senior', 'administrador', 'admin_gestor'))
);

DROP POLICY IF EXISTS "Admin Update Parceiros" ON storage.objects;
CREATE POLICY "Admin Update Parceiros" ON storage.objects FOR UPDATE USING (
  bucket_id = 'parceiros-logos' AND 
  EXISTS (SELECT 1 FROM public.usuarios_escola ue WHERE ue.id = auth.uid() AND ue.perfil IN ('senior', 'administrador', 'admin_gestor'))
);

DROP POLICY IF EXISTS "Admin Delete Parceiros" ON storage.objects;
CREATE POLICY "Admin Delete Parceiros" ON storage.objects FOR DELETE USING (
  bucket_id = 'parceiros-logos' AND 
  EXISTS (SELECT 1 FROM public.usuarios_escola ue WHERE ue.id = auth.uid() AND ue.perfil IN ('senior', 'administrador', 'admin_gestor'))
);
