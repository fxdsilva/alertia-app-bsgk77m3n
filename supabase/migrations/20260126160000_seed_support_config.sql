-- Seed default support settings if they don't exist
INSERT INTO public.admin_settings (key, settings)
VALUES
(
  'support_contact_info',
  '{"email": "suporte@alertia.com.br", "phone": "0800 123 4567", "whatsapp": "https://wa.me/5511999999999"}'::jsonb
)
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.admin_settings (key, settings)
VALUES
(
  'support_faqs',
  '[
    {"id": "1", "question": "Como faço uma denúncia anônima?", "answer": "Para fazer uma denúncia anônima, acesse a página inicial e clique em \"Registrar Denúncia\". No formulário, certifique-se de marcar a opção \"Denúncia Anônima\" na etapa de identificação."},
    {"id": "2", "question": "Como acompanhar meu protocolo?", "answer": "Você pode acompanhar o status da sua denúncia acessando a opção \"Consultar Status\" na página inicial e informando o número do protocolo gerado no momento do registro."},
    {"id": "3", "question": "Esqueci minha senha, o que fazer?", "answer": "Na tela de login, clique em \"Esqueceu a senha?\" e siga as instruções enviadas para o seu e-mail cadastrado para redefinir sua senha de acesso."},
    {"id": "4", "question": "Os meus dados estão seguros?", "answer": "Sim. O ALERTIA utiliza criptografia de ponta a ponta e segue rigorosos padrões de segurança e privacidade em conformidade com a LGPD para proteger todas as informações."}
  ]'::jsonb
)
ON CONFLICT (key) DO NOTHING;

-- Allow public access to read support settings
CREATE POLICY "Allow public read access to support settings" ON public.admin_settings
  FOR SELECT
  TO anon
  USING (key IN ('support_contact_info', 'support_faqs', 'external_official_channels'));
