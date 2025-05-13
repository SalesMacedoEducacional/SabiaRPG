/**
 * Script para desabilitar RLS via SQL direto
 */
import { supabase } from '../db/supabase.js';
import fs from 'fs';

async function executarSQLManual() {
  try {
    console.log('Criando arquivo SQL para desabilitar RLS...');
    
    // Criar arquivo SQL
    const sqlContent = `
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
    `;
    
    // Salvar SQL em arquivo temporário
    fs.writeFileSync('temp-rls-fix.sql', sqlContent);
    console.log('Arquivo SQL criado: temp-rls-fix.sql');
    
    console.log('Enviando SQL para Supabase via API REST...');
    console.log('Este SQL deve ser executado diretamente no painel SQL do Supabase.');
    console.log('Por favor, acesse o painel administrativo do Supabase e execute o SQL acima.');
    
    const mensagemAcao = `
    =================================================================
    AÇÃO NECESSÁRIA:
    
    Para corrigir o problema de RLS (Row Level Security) nas turmas,
    por favor, siga estes passos:
    
    1. Acesse o painel administrativo do Supabase
    2. Vá para a seção "SQL Editor"
    3. Cole o seguinte SQL e execute:
    
    ${sqlContent}
    
    Isto desabilitará a proteção RLS restritiva e criará uma política
    que permitirá visualizar e modificar as turmas no sistema.
    =================================================================
    `;
    
    console.log(mensagemAcao);
    
    return { success: true };
  } catch (error) {
    console.error('Erro ao executar script:', error);
    return { success: false, error };
  }
}

// Executar função principal
executarSQLManual().then(resultado => {
  console.log('Resultado final:', resultado);
}).catch(erro => {
  console.error('Erro fatal na execução:', erro);
});