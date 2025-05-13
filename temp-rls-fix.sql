
      -- Verificar se tabela existe
      DO $$
      BEGIN
          IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'turmas') THEN
              -- Desativar RLS para a tabela turmas
              ALTER TABLE "public"."turmas" DISABLE ROW LEVEL SECURITY;
              
              -- Verificar e remover políticas existentes
              DO $$
              DECLARE
                  policy_record RECORD;
              BEGIN
                  FOR policy_record IN 
                      SELECT policyname 
                      FROM pg_policies 
                      WHERE tablename = 'turmas' AND schemaname = 'public'
                  LOOP
                      EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON "public"."turmas"';
                      RAISE NOTICE 'Dropped policy: %', policy_record.policyname;
                  END LOOP;
              END
              $$;
              
              -- Criar política que permita todas as operações para todos os usuários
              CREATE POLICY "Allow all operations for all users" ON "public"."turmas" FOR ALL USING (true) WITH CHECK (true);
              
              -- Garantir que RLS esteja ativado para usar a política
              ALTER TABLE "public"."turmas" ENABLE ROW LEVEL SECURITY;
              
              RAISE NOTICE 'RLS configuration updated for turmas table';
          ELSE
              RAISE NOTICE 'Table turmas does not exist';
          END IF;
      END
      $$;
    