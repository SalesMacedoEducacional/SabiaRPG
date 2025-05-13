/**
 * Script para desativar RLS (Row Level Security) da tabela turmas
 * Isso permitirá que os registros sejam visíveis e modificáveis via API do Supabase
 */
import { supabase, executeSql } from '../db/supabase.js';

async function disableRlsTurmas() {
  try {
    console.log('Desativando RLS para a tabela turmas...');
    
    // Tenta verificar se a tabela turmas tem RLS ativado
    const checkRls = await executeSql(`
      SELECT relrowsecurity 
      FROM pg_class 
      WHERE oid = 'public.turmas'::regclass;
    `);
    
    if (checkRls[0]?.relrowsecurity === true) {
      console.log('RLS está ativado para a tabela turmas, desativando...');
      
      // Desativa o RLS para a tabela turmas
      await executeSql(`ALTER TABLE turmas DISABLE ROW LEVEL SECURITY;`);
      console.log('RLS desativado com sucesso para a tabela turmas');
    } else {
      console.log('RLS já está desativado para a tabela turmas');
    }
    
    // Verifica as políticas existentes
    const policies = await executeSql(`
      SELECT policyname
      FROM pg_policies
      WHERE tablename = 'turmas';
    `);
    
    console.log('Políticas existentes:', policies);
    
    if (policies && policies.length > 0) {
      console.log(`Encontradas ${policies.length} políticas para a tabela turmas`);
      
      // Removendo políticas existentes
      for (const policy of policies) {
        await executeSql(`DROP POLICY IF EXISTS "${policy.policyname}" ON turmas;`);
        console.log(`Política "${policy.policyname}" removida`);
      }
    } else {
      console.log('Nenhuma política encontrada na tabela turmas');
    }
    
    console.log('Verificação e ajustes de RLS concluídos com sucesso');
    
    // Testando se podemos agora inserir e ler dados na tabela turmas
    console.log('Testando inserção de dados...');
    
    // Tenta inserir um registro de teste
    const testId = 'test-' + Date.now();
    const { data: insertData, error: insertError } = await supabase
      .from('turmas')
      .insert([{
        id: testId,
        nome: 'Turma Teste RLS',
        ano_letivo: 2025,
        turno: 'Manhã',
        modalidade: 'Ensino Fundamental',
        serie: '6º Ano',
        descricao: 'Turma para teste de RLS',
        escola_id: 'aef2e4c5-582c-4f36-a024-3c27f90fe6b8',
        criado_em: new Date().toISOString(),
        ativo: true
      }])
      .select();
    
    if (insertError) {
      console.error('Erro ao inserir registro de teste:', insertError);
    } else {
      console.log('Registro de teste inserido com sucesso:', insertData);
      
      // Tenta ler o registro
      const { data: readData, error: readError } = await supabase
        .from('turmas')
        .select('*')
        .eq('id', testId);
      
      if (readError) {
        console.error('Erro ao ler registro de teste:', readError);
      } else {
        console.log('Registro de teste lido com sucesso:', readData);
        
        // Limpa o registro de teste
        const { error: deleteError } = await supabase
          .from('turmas')
          .delete()
          .eq('id', testId);
        
        if (deleteError) {
          console.error('Erro ao remover registro de teste:', deleteError);
        } else {
          console.log('Registro de teste removido com sucesso');
        }
      }
    }
    
    return { success: true, message: 'RLS ajustado com sucesso para a tabela turmas' };
  } catch (error) {
    console.error('Erro ao ajustar RLS:', error);
    return { success: false, error };
  }
}

// Executa a função principal
disableRlsTurmas().then(result => {
  console.log('Resultado:', result);
  process.exit(result.success ? 0 : 1);
}).catch(err => {
  console.error('Erro na execução:', err);
  process.exit(1);
});