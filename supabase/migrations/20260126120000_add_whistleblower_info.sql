ALTER TABLE denuncias ADD COLUMN IF NOT EXISTS denunciante_nome TEXT;
ALTER TABLE denuncias ADD COLUMN IF NOT EXISTS denunciante_email TEXT;
ALTER TABLE denuncias ADD COLUMN IF NOT EXISTS denunciante_telefone TEXT;
ALTER TABLE denuncias ADD COLUMN IF NOT EXISTS denunciante_vinculo TEXT;
