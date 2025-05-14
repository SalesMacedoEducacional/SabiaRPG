-- SQL para desabilitar RLS na tabela turmas e permitir todas as operações
ALTER TABLE "public"."turmas" DISABLE ROW LEVEL SECURITY;

-- Criar uma função RPC para executar SQL 
-- (caso não exista no Supabase, use no painel de administração)
CREATE OR REPLACE FUNCTION public.execute_sql(sql_query text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    EXECUTE sql_query;
    RETURN json_build_object('success', true);
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- Conceder permissões para que o perfil anon tenha acesso à tabela turmas
GRANT SELECT, INSERT, UPDATE, DELETE ON public.turmas TO anon, authenticated, service_role;

-- Garantir que a sequência de IDs (se existir) também tenha permissões
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;