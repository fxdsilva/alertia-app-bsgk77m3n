-- Create function to check if user is Admin Master
CREATE OR REPLACE FUNCTION public.check_is_admin_master()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.usuarios_admin_master
    WHERE id = auth.uid() AND ativo = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get complaint status by protocol (Public access)
CREATE OR REPLACE FUNCTION public.get_complaint_by_protocol(protocol_query TEXT)
RETURNS TABLE (
  status TEXT,
  updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT d.status, d.updated_at
  FROM public.denuncias d
  WHERE d.protocolo = protocol_query;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_complaint_by_protocol(TEXT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.check_is_admin_master() TO authenticated, service_role;

-- Enable RLS on usuarios_admin_master if not enabled (though usually good practice to be explicit)
ALTER TABLE public.usuarios_admin_master ENABLE ROW LEVEL SECURITY;

-- Policies for usuarios_admin_master
CREATE POLICY "Admin Master can view all admin masters" ON public.usuarios_admin_master
    FOR SELECT USING (public.check_is_admin_master());

CREATE POLICY "Admin Master can update admin masters" ON public.usuarios_admin_master
    FOR UPDATE USING (public.check_is_admin_master());
    
CREATE POLICY "Users can view own admin master profile" ON public.usuarios_admin_master
    FOR SELECT USING (auth.uid() = id);

-- Policies for escolas_instituicoes (Admin Master Write Access)
-- Read is already public, so we only need to add write permissions
CREATE POLICY "Admin Master can insert schools" ON public.escolas_instituicoes
    FOR INSERT WITH CHECK (public.check_is_admin_master());

CREATE POLICY "Admin Master can update schools" ON public.escolas_instituicoes
    FOR UPDATE USING (public.check_is_admin_master());

CREATE POLICY "Admin Master can delete schools" ON public.escolas_instituicoes
    FOR DELETE USING (public.check_is_admin_master());

-- Policies for usuarios_escola (Admin Master Full Access)
CREATE POLICY "Admin Master can select all school users" ON public.usuarios_escola
    FOR SELECT USING (public.check_is_admin_master());

CREATE POLICY "Admin Master can insert school users" ON public.usuarios_escola
    FOR INSERT WITH CHECK (public.check_is_admin_master());

CREATE POLICY "Admin Master can update school users" ON public.usuarios_escola
    FOR UPDATE USING (public.check_is_admin_master());

CREATE POLICY "Admin Master can delete school users" ON public.usuarios_escola
    FOR DELETE USING (public.check_is_admin_master());

-- Policies for denuncias (Admin Master Full Access)
CREATE POLICY "Admin Master can select all denuncias" ON public.denuncias
    FOR SELECT USING (public.check_is_admin_master());

CREATE POLICY "Admin Master can update all denuncias" ON public.denuncias
    FOR UPDATE USING (public.check_is_admin_master());

CREATE POLICY "Admin Master can delete all denuncias" ON public.denuncias
    FOR DELETE USING (public.check_is_admin_master());

-- Policies for documents (Admin Master Full Access)
-- codigo_conduta
CREATE POLICY "Admin Master can insert codigo_conduta" ON public.codigo_conduta
    FOR INSERT WITH CHECK (public.check_is_admin_master());

CREATE POLICY "Admin Master can update codigo_conduta" ON public.codigo_conduta
    FOR UPDATE USING (public.check_is_admin_master());

CREATE POLICY "Admin Master can delete codigo_conduta" ON public.codigo_conduta
    FOR DELETE USING (public.check_is_admin_master());

-- compromisso_alta_gestao
CREATE POLICY "Admin Master can insert compromisso" ON public.compromisso_alta_gestao
    FOR INSERT WITH CHECK (public.check_is_admin_master());

CREATE POLICY "Admin Master can update compromisso" ON public.compromisso_alta_gestao
    FOR UPDATE USING (public.check_is_admin_master());

CREATE POLICY "Admin Master can delete compromisso" ON public.compromisso_alta_gestao
    FOR DELETE USING (public.check_is_admin_master());

