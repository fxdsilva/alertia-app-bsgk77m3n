-- Create table escolas_instituicoes
CREATE TABLE public.escolas_instituicoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome_escola TEXT NOT NULL UNIQUE,
    rede_publica BOOLEAN NOT NULL,
    rede_municipal BOOLEAN NOT NULL,
    rede_estadual BOOLEAN NOT NULL,
    rede_federal BOOLEAN NOT NULL,
    rede_particular BOOLEAN NOT NULL,
    localizacao TEXT NOT NULL CHECK (localizacao IN ('Urbana', 'Rural')),
    endereco TEXT NOT NULL DEFAULT 'Sem dados',
    status_adesao TEXT NOT NULL DEFAULT 'inativo' CHECK (status_adesao IN ('ativo', 'inativo')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT one_network_type_true CHECK (
        (CASE WHEN rede_municipal THEN 1 ELSE 0 END +
         CASE WHEN rede_estadual THEN 1 ELSE 0 END +
         CASE WHEN rede_federal THEN 1 ELSE 0 END +
         CASE WHEN rede_particular THEN 1 ELSE 0 END) = 1
    ),
    CONSTRAINT public_network_logic CHECK (
        (rede_particular AND NOT rede_publica) OR
        ((rede_municipal OR rede_estadual OR rede_federal) AND rede_publica)
    )
);

-- Create table usuarios_escola
CREATE TABLE public.usuarios_escola (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    escola_id UUID NOT NULL REFERENCES public.escolas_instituicoes(id) ON DELETE CASCADE,
    perfil TEXT NOT NULL CHECK (perfil IN ('publico_externo', 'colaborador', 'gestor', 'alta_gestao')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create table denuncias
CREATE TABLE public.denuncias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    escola_id UUID NOT NULL REFERENCES public.escolas_instituicoes(id) ON DELETE CASCADE,
    protocolo TEXT NOT NULL UNIQUE,
    descricao TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_analise', 'investigado', 'resolvido', 'arquivado')),
    anonimo BOOLEAN NOT NULL DEFAULT TRUE,
    denunciante_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT anonymous_check CHECK (
        (anonimo IS TRUE AND denunciante_id IS NULL) OR
        (anonimo IS FALSE)
    )
);

-- Enable RLS
ALTER TABLE public.escolas_instituicoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios_escola ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.denuncias ENABLE ROW LEVEL SECURITY;

-- RLS Policies for escolas_instituicoes
CREATE POLICY "Public read access for escolas_instituicoes" ON public.escolas_instituicoes
    FOR SELECT USING (true);

-- RLS Policies for usuarios_escola
CREATE POLICY "Users can read own profile" ON public.usuarios_escola
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Managers can read profiles of their school" ON public.usuarios_escola
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.usuarios_escola manager
            WHERE manager.id = auth.uid()
            AND manager.escola_id = usuarios_escola.escola_id
            AND manager.perfil IN ('gestor', 'alta_gestao')
        )
    );

-- RLS Policies for denuncias
CREATE POLICY "Public create access for denuncias" ON public.denuncias
    FOR INSERT WITH CHECK (true);

CREATE POLICY "View denuncias based on school role or ownership" ON public.denuncias
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.usuarios_escola ue
            WHERE ue.id = auth.uid()
            AND ue.escola_id = denuncias.escola_id
            AND ue.perfil IN ('gestor', 'alta_gestao')
        )
        OR denunciante_id = auth.uid()
    );

-- Function to handle user creation and updates
CREATE OR REPLACE FUNCTION public.handle_user_changes()
RETURNS TRIGGER AS $$
BEGIN
    -- Only try to insert/update if metadata is present
    IF (NEW.raw_user_meta_data->>'escola_id') IS NOT NULL AND (NEW.raw_user_meta_data->>'perfil') IS NOT NULL THEN
        INSERT INTO public.usuarios_escola (id, escola_id, perfil)
        VALUES (
            NEW.id,
            (NEW.raw_user_meta_data->>'escola_id')::UUID,
            NEW.raw_user_meta_data->>'perfil'
        )
        ON CONFLICT (id) DO UPDATE SET
            escola_id = EXCLUDED.escola_id,
            perfil = EXCLUDED.perfil,
            updated_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_user_changes();

-- Trigger for user update
CREATE TRIGGER on_auth_user_updated
    AFTER UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_user_changes();
