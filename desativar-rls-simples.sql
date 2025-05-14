-- Este SQL desabilita completamente o RLS na tabela turmas
-- IMPORTANTE: Execute este script no painel SQL do Supabase

-- Desativar RLS para a tabela turmas
ALTER TABLE "public"."turmas" DISABLE ROW LEVEL SECURITY;

-- Conceder todas as permissões para a tabela turmas aos perfis auth
GRANT ALL PRIVILEGES ON TABLE public.turmas TO authenticated, anon, service_role;