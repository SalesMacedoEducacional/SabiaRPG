-- Este SQL desabilita o RLS na tabela estados e cria uma política de acesso total
-- IMPORTANTE: Execute este script no painel SQL do Supabase

-- Primeiro, criamos uma política de acesso total para a tabela estados
CREATE POLICY full_access_estados
  ON public.estados
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Alternativamente, você pode desativar completamente o RLS dessa tabela
-- ALTER TABLE "public"."estados" DISABLE ROW LEVEL SECURITY;

-- Conceder todas as permissões para a tabela estados aos perfis de autenticação
GRANT ALL PRIVILEGES ON TABLE public.estados TO authenticated, anon, service_role;