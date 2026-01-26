-- Migration to ensure 'A designar' status exists
INSERT INTO public.status_denuncia (id, nome_status, created_at, updated_at)
SELECT gen_random_uuid(), 'A designar', now(), now()
WHERE NOT EXISTS (
    SELECT 1 FROM public.status_denuncia WHERE nome_status = 'A designar'
);
