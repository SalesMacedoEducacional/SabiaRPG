/**
 * Script para corrigir permissões da tabela turmas diretamente
 * Usando supabase.from() para tentar as operações CRUD básicas
 */
import { supabase } from './db/supabase.js';

async function fixarTurmas() {
  try {
    console.log('Iniciando tentativa de conserto direto da tabela turmas...');
    
    // 1. Tentar inserir uma turma de teste diretamente
    const testId = 'teste-' + Date.now();
    console.log('Tentando inserir turma de teste com ID:', testId);
    
    const turmaTeste = {
      id: testId,
      nome: 'Turma Teste Direto',
      ano_letivo: 2025,
      turno: 'Manhã',
      modalidade: 'Ensino Fundamental',
      serie: '1º Ano',
      descricao: 'Turma de teste para verificar permissões',
      escola_id: 'aef2e4c5-582c-4f36-a024-3c27f90fe6b8', // ID de uma escola existente
      criado_em: new Date().toISOString()
    };
    
    const { data: inserirResultado, error: inserirErro } = await supabase
      .from('turmas')
      .insert(turmaTeste)
      .select();
      
    if (inserirErro) {
      console.error('Erro ao inserir turma de teste:', inserirErro);
    } else {
      console.log('✅ Turma de teste inserida com sucesso:', inserirResultado);
      
      // 2. Tentar ler a turma inserida
      const { data: lerResultado, error: lerErro } = await supabase
        .from('turmas')
        .select('*')
        .eq('id', testId);
        
      if (lerErro) {
        console.error('Erro ao ler turma de teste:', lerErro);
      } else {
        console.log('✅ Turma de teste lida com sucesso:', lerResultado);
      }
      
      // 3. Tentar atualizar a turma
      const { data: atualizarResultado, error: atualizarErro } = await supabase
        .from('turmas')
        .update({ descricao: 'Descrição atualizada para teste' })
        .eq('id', testId)
        .select();
        
      if (atualizarErro) {
        console.error('Erro ao atualizar turma de teste:', atualizarErro);
      } else {
        console.log('✅ Turma de teste atualizada com sucesso:', atualizarResultado);
      }
      
      // 4. Tentar excluir a turma de teste
      const { error: excluirErro } = await supabase
        .from('turmas')
        .delete()
        .eq('id', testId);
        
      if (excluirErro) {
        console.error('Erro ao excluir turma de teste:', excluirErro);
      } else {
        console.log('✅ Turma de teste excluída com sucesso');
      }
    }
    
    // 5. Tentar listar todas as turmas
    const { data: turmas, error: turmasErro } = await supabase
      .from('turmas')
      .select('*');
      
    if (turmasErro) {
      console.error('Erro ao listar todas as turmas:', turmasErro);
    } else {
      console.log(`✅ Listagem de turmas bem-sucedida. Total de turmas: ${turmas.length}`);
      console.log('Primeiras 3 turmas:', turmas.slice(0, 3));
    }
    
    return { success: true, message: 'Verificação de permissões concluída' };
  } catch (error) {
    console.error('Erro ao executar fixarTurmas:', error);
    return { success: false, error };
  }
}

// Auto-executar o script
fixarTurmas().then(resultado => {
  console.log('Resultado final:', resultado);
  process.exit(0);
}).catch(erro => {
  console.error('Erro fatal:', erro);
  process.exit(1);
});