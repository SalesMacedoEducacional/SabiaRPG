/**
 * Script para criar e ler uma turma de teste usando Supabase
 * Isso nos ajudará a diagnosticar o problema de acesso às turmas
 */
import { supabase } from '../db/supabase.js';
import { v4 as uuidv4 } from 'uuid';

async function criarETurma() {
  try {
    console.log('Iniciando teste de criação e leitura de turma...');
    
    // ID da escola para associar a turma
    const escolaId = 'aef2e4c5-582c-4f36-a024-3c27f90fe6b8';
    
    // 1. Criar uma turma de teste usando a API do Supabase
    const turmaTeste = {
      // Criar um UUID válido para o ID
      id: uuidv4(),
      nome: 'Turma Teste Diagnóstico',
      ano_letivo: '2025',
      turno: 'Manhã',
      modalidade: 'Ensino Fundamental II',
      serie: '8º Ano',
      descricao: 'Turma criada para diagnosticar problemas de acesso',
      escola_id: escolaId,
      ativo: true,
      criado_em: new Date().toISOString()
    };
    
    console.log('Dados da turma a ser criada:', turmaTeste);
    
    const { data: turmaCriada, error: erroCreate } = await supabase
      .from('turmas')
      .insert([turmaTeste])
      .select();
      
    if (erroCreate) {
      console.error('Erro ao criar turma de teste:', erroCreate);
      
      // Se for erro de RLS (segurança), vamos verificar se há políticas de segurança ativas
      if (erroCreate.message.includes('policy')) {
        console.log('Detectado erro de políticas de segurança (RLS)');
      }
    } else {
      console.log('Turma criada com sucesso:', turmaCriada);
      
      // 2. Verificar se conseguimos ler a turma criada
      const { data: turmasLidas, error: erroRead } = await supabase
        .from('turmas')
        .select('*')
        .eq('id', turmaTeste.id);
        
      if (erroRead) {
        console.error('Erro ao ler turma criada:', erroRead);
      } else {
        console.log(`Foram encontradas ${turmasLidas.length} turmas com o ID ${turmaTeste.id}:`);
        console.log(JSON.stringify(turmasLidas, null, 2));
      }
      
      // 3. Verificar todas as turmas da escola
      const { data: todasTurmas, error: erroTodas } = await supabase
        .from('turmas')
        .select('*')
        .eq('escola_id', escolaId);
        
      if (erroTodas) {
        console.error('Erro ao listar todas as turmas da escola:', erroTodas);
      } else {
        console.log(`Foram encontradas ${todasTurmas.length} turmas para a escola ${escolaId}:`);
        console.log(JSON.stringify(todasTurmas, null, 2));
      }
    }
    
    return { success: true };
  } catch (error) {
    console.error('Erro ao executar teste:', error);
    return { success: false, error };
  }
}

// Executar função principal
criarETurma().then(resultado => {
  console.log('Resultado final:', resultado);
  process.exit(resultado.success ? 0 : 1);
}).catch(erro => {
  console.error('Erro fatal na execução:', erro);
  process.exit(1);
});