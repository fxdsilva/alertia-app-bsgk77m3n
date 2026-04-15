DO $$
BEGIN
  ALTER TABLE public.treinamentos ADD COLUMN IF NOT EXISTS tipo_conteudo TEXT DEFAULT 'link';
  
  -- Garante que o status de conclusão básico exista para poder registrar o progresso do questionário
  INSERT INTO public.status_treinamento_conclusao (id, nome_status) 
  VALUES ('concluido', 'Concluído')
  ON CONFLICT (id) DO NOTHING;
END $$;
