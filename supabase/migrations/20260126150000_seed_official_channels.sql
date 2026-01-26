-- Ensure admin_settings exists (redundant if using existing structure but safe)
CREATE TABLE IF NOT EXISTS public.admin_settings (
    key TEXT PRIMARY KEY,
    settings JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS if not enabled
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Policy for reading settings (public access for official channels if needed, but here we use authenticated for app context, 
-- however for public pages we might need anon access. Let's ensure anon can read this specific key or generally read settings if they are public config)
-- Actually the user story implies public access. Let's add policy for anon read on admin_settings
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'admin_settings' AND policyname = 'Enable read access for anon users'
    ) THEN
        CREATE POLICY "Enable read access for anon users" ON public.admin_settings
            FOR SELECT
            TO anon
            USING (true);
    END IF;
END
$$;

-- Insert Data
INSERT INTO public.admin_settings (key, settings)
VALUES (
  'external_official_channels',
  '{
    "mato_grosso": [
      {
        "name": "Ouvidoria Geral do Estado de MT",
        "description": "Canal para registrar denúncias, reclamações e sugestões sobre serviços estaduais.",
        "url": "http://www.ouvidoria.mt.gov.br/"
      },
      {
        "name": "Controladoria Geral do Estado (CGE-MT)",
        "description": "Órgão de controle interno, transparência e combate à corrupção no âmbito estadual.",
        "url": "http://www.controladoria.mt.gov.br/"
      },
      {
        "name": "Ministério Público de Mato Grosso (MPMT)",
        "description": "Denúncias sobre crimes, improbidade administrativa e defesa de direitos coletivos.",
        "url": "https://www.mpmt.mp.br/"
      }
    ],
    "brasil": [
      {
        "name": "Fala.BR (CGU)",
        "description": "Plataforma Integrada de Ouvidoria e Acesso à Informação do Poder Executivo Federal.",
        "url": "https://falabr.cgu.gov.br/"
      },
      {
        "name": "Tribunal de Contas da União (TCU)",
        "description": "Denúncias sobre irregularidades na aplicação de recursos públicos federais.",
        "url": "https://portal.tcu.gov.br/ouvidoria/"
      },
      {
        "name": "Ministério da Educação (MEC)",
        "description": "Canais de atendimento e ouvidoria para assuntos relacionados à educação federal.",
        "url": "https://www.gov.br/mec/pt-br/canais_atendimento/ouvidoria"
      }
    ]
  }'::jsonb
) ON CONFLICT (key) DO UPDATE
SET settings = EXCLUDED.settings;
