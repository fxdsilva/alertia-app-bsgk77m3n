-- Update the official channels setting with new structure and content
-- This migration updates the content of the external_official_channels key in the admin_settings table

INSERT INTO public.admin_settings (key, settings)
VALUES ('external_official_channels', '{
    "brasil": [
      {
        "name": "Disque 100",
        "description": "Canal de denúncias de violações de direitos humanos.",
        "url": "https://www.gov.br/mdh/pt-br/disque100",
        "label": "Atendimento 24h | Denúncia anônima ou identificada"
      },
      {
        "name": "Ligue 180",
        "description": "Central de Atendimento à Mulher em situação de violência.",
        "url": "https://www.gov.br/mdh/pt-br/assuntos/denuncie-violencia-contra-a-mulher/ligue-180",
        "label": "Atendimento 24h | Gratuito"
      },
      {
        "name": "Fala.BR (CGU)",
        "description": "Plataforma integrada de Ouvidoria e Acesso à Informação do Poder Executivo Federal.",
        "url": "https://falabr.cgu.gov.br/",
        "label": "Acompanhamento de protocolo"
      },
      {
        "name": "SaferNet Brasil",
        "description": "Denúncias de crimes cibernéticos e pornografia infantil.",
        "url": "https://new.safernet.org.br/denuncie",
        "label": "Denúncia anônima | Foco em ambiente digital"
      }
    ],
    "mato_grosso": [
      {
        "name": "E-Denúncias (PJC-MT)",
        "description": "Canal da Polícia Judiciária Civil para crimes gerais, corrupção e tráfico.",
        "url": "http://portal.pjc.mt.gov.br/e-denuncia"
      },
      {
        "name": "Disque-Denúncia (PM-MT)",
        "description": "Canal da Polícia Militar para ações preventivas e ostensivas (0800 65 3939).",
        "url": "http://www.pm.mt.gov.br/"
      },
      {
        "name": "Ouvidoria Geral do Estado (Fale Cidadão)",
        "description": "Canal para registrar denúncias e reclamações sobre serviços públicos estaduais.",
        "url": "http://www.ouvidoria.mt.gov.br/"
      },
      {
        "name": "Ouvidoria do Governo de Mato Grosso",
        "description": "Canal para orientação institucional e acesso à informação.",
        "url": "http://www.ouvidoria.mt.gov.br/"
      }
    ],
    "emergency": [
      {
        "number": "190",
        "name": "Polícia Militar",
        "description": "Emergências policiais e risco imediato."
      },
      {
        "number": "197",
        "name": "Polícia Civil",
        "description": "Denúncias e investigações."
      },
      {
        "number": "193",
        "name": "Corpo de Bombeiros",
        "description": "Incêndios, acidentes e resgates."
      }
    ]
}'::jsonb)
ON CONFLICT (key) DO UPDATE
SET settings = EXCLUDED.settings;
