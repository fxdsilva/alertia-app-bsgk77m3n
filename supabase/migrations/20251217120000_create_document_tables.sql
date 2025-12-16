-- Create table compromisso_alta_gestao
CREATE TABLE public.compromisso_alta_gestao (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    escola_id UUID NOT NULL REFERENCES public.escolas_instituicoes(id) ON DELETE CASCADE,
    arquivo_url TEXT NOT NULL,
    descricao TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT compromisso_escola_unique UNIQUE (escola_id)
);

-- Create table codigo_conduta
CREATE TABLE public.codigo_conduta (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    escola_id UUID NOT NULL REFERENCES public.escolas_instituicoes(id) ON DELETE CASCADE,
    arquivo_url TEXT NOT NULL,
    descricao TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT codigo_conduta_escola_unique UNIQUE (escola_id)
);

-- Enable RLS
ALTER TABLE public.compromisso_alta_gestao ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.codigo_conduta ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Allow public read access filtered by school (handled by application logic, but policy allows read all for simplicity in public portal context, assuming school ID is known)
-- Ideally we restrict, but for public documents, allow public read is fine.
CREATE POLICY "Public read access for compromisso_alta_gestao" ON public.compromisso_alta_gestao
    FOR SELECT USING (true);

CREATE POLICY "Public read access for codigo_conduta" ON public.codigo_conduta
    FOR SELECT USING (true);

-- Insert seed data for documents (assuming some schools exist from previous seed, we'll try to link to them if possible, or just leave empty and handle empty state)
-- Since we can't know the IDs of existing schools easily in migration without a query, we will rely on the app handling empty states or the user creating data.
-- However, to make the app testable, let's insert a dummy school and documents if needed, but better to just handle the 'not found' case gracefully.
