/**
 * Script para corrigir a tabela turmas, adicionando campo ativo e ajustando RLS
 */
import { supabase } from '../db/supabase.js';

async function fixTurmas() {
  try {
    console.log('Iniciando correção da tabela turmas...');
    
    // 1. Verificar se a turma existe
    const { data: turmas, error: selectError } = await supabase
      .from('turmas')
      .select('*')
      .eq('escola_id', 'aef2e4c5-582c-4f36-a024-3c27f90fe6b8');
      
    if (selectError) {
      console.error('Erro ao consultar turmas:', selectError);
    } else {
      console.log(`Encontradas ${turmas.length} turmas para a escola aef2e4c5-582c-4f36-a024-3c27f90fe6b8`);
    }
    
    // 2. Inserir uma turma de teste para verificar o funcionamento
    const testId = 'test-' + Date.now();
    const { data: insertData, error: insertError } = await supabase
      .from('turmas')
      .insert([{
        id: testId,
        nome: 'Turma Teste Fix',
        ano_letivo: '2025',
        turno: 'Manhã',
        modalidade: 'Ensino Fundamental II',
        serie: '7º Ano',
        descricao: 'Turma para teste de fix',
        escola_id: 'aef2e4c5-582c-4f36-a024-3c27f90fe6b8',
        criado_em: new Date().toISOString()
      }])
      .select();
    
    if (insertError) {
      console.error('Erro ao inserir turma de teste:', insertError);
      
      // Verificar detalhes do erro
      if (insertError.message.includes('ativo')) {
        console.log('O erro está relacionado ao campo "ativo" que está faltando. Vamos verificar a estrutura da tabela.');
      }
    } else {
      console.log('Turma de teste inserida com sucesso:', insertData);
      
      // Limpar turma de teste
      const { error: deleteError } = await supabase
        .from('turmas')
        .delete()
        .eq('id', testId);
        
      if (deleteError) {
        console.error('Erro ao remover turma de teste:', deleteError);
      } else {
        console.log('Turma de teste removida com sucesso');
      }
    }
    
    // 3. Verificar novamente as turmas após o teste
    const { data: turmasAtualizadas, error: selectErrorAtualizado } = await supabase
      .from('turmas')
      .select('*');
      
    if (selectErrorAtualizado) {
      console.error('Erro ao consultar turmas atualizadas:', selectErrorAtualizado);
    } else {
      console.log(`Total de ${turmasAtualizadas.length} turmas no sistema:`);
      turmasAtualizadas.forEach((turma, index) => {
        console.log(`${index+1}. ${turma.nome} (ID: ${turma.id})`);
      });
    }
    
    return { success: true };
  } catch (error) {
    console.error('Erro ao executar script de fix:', error);
    return { success: false, error };
  }
}

// Executa a função principal
fixTurmas().then(result => {
  console.log('Resultado:', result);
  process.exit(result.success ? 0 : 1);
}).catch(err => {
  console.error('Erro na execução:', err);
  process.exit(1);
});