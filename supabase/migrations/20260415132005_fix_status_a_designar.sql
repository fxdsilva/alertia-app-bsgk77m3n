DO $$
BEGIN
  -- Safely insert the 'A designar' status if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM public.status_denuncia WHERE nome_status = 'A designar') THEN
    INSERT INTO public.status_denuncia (id, nome_status, created_at, updated_at)
    VALUES ('a_designar', 'A designar', NOW(), NOW());
  END IF;

  -- Ensure the default fallback status 'pendente' exists
  IF NOT EXISTS (SELECT 1 FROM public.status_denuncia WHERE id = 'pendente') THEN
    INSERT INTO public.status_denuncia (id, nome_status, created_at, updated_at)
    VALUES ('pendente', 'Pendente', NOW(), NOW());
  END IF;
END $$;
