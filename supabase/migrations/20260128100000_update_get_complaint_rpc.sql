-- Update the function to return status name instead of ID
-- This joins the status_denuncia table to provide human-readable status
CREATE OR REPLACE FUNCTION get_complaint_by_protocol(protocol_query text)
RETURNS TABLE (status text, updated_at timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(s.nome_status, 'Status não definido') as status,
    d.updated_at
  FROM denuncias d
  LEFT JOIN status_denuncia s ON d.status = s.id
  WHERE d.protocolo = protocol_query;
END;
$$;
