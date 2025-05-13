/**
 * Script para listar turmas diretamente do Supabase
 * Isso nos ajudará a verificar se existem turmas cadastradas
 */
import { supabase } from '../db/supabase.js';

async function listarTurmas() {
  try {
    console.log('Consultando turmas diretamente do Supabase...');
    
    // Consultar todas as turmas
    const { data: todasTurmas, error: errorAll } = await supabase
      .from('turmas')
      .select('*');
      
    if (errorAll) {
      console.error('Erro ao consultar todas as turmas:', errorAll);
    } else {
      console.log(`Total de turmas encontradas: ${todasTurmas.length}`);
      
      if (todasTurmas.length > 0) {
        console.log('Turmas encontradas:');
        todasTurmas.forEach((turma, index) => {
          console.log(`${index+1}. ${turma.nome || '(sem nome)'} - ID: ${turma.id}`);
          console.log(`   Escola: ${turma.escola_id}`);
          console.log(`   Ano Letivo: ${turma.ano_letivo}`);
          console.log(`   Modalidade: ${turma.modalidade}`);
          console.log(`   Série: ${turma.serie}`);
          console.log(`   Criado em: ${turma.criado_em}`);
          console.log('---');
        });
      } else {
        console.log('Nenhuma turma encontrada no sistema.');
        
        // Se não houver turmas, vamos tentar criar uma
        const novaTurma = {
          nome: 'Turma de Teste Via Script',
          ano_letivo: 2025,
          turno: 'Manhã',
          modalidade: 'Ensino Fundamental II',
          serie: '6º Ano',
          descricao: 'Turma criada para testar acesso direto',
          escola_id: 'aef2e4c5-582c-4f36-a024-3c27f90fe6b8',
          criado_em: new Date().toISOString()
        };
        
        console.log('Tentando criar uma turma de teste:', novaTurma);
        
        const { data: turmaCriada, error: errorCreate } = await supabase
          .from('turmas')
          .insert([novaTurma])
          .select();
          
        if (errorCreate) {
          console.error('Erro ao criar turma de teste:', errorCreate);
        } else {
          console.log('Turma de teste criada com sucesso:', turmaCriada);
          
          // Verificar se foi mesmo criada
          const { data: verificaTurma, error: errorVerifica } = await supabase
            .from('turmas')
            .select('*');
            
          if (errorVerifica) {
            console.error('Erro ao verificar criação da turma:', errorVerifica);
          } else {
            console.log(`Agora existem ${verificaTurma.length} turmas no sistema.`);
          }
        }
      }
    }
    
    // Consultar turmas de uma escola específica
    const escolaId = 'aef2e4c5-582c-4f36-a024-3c27f90fe6b8';
    console.log(`\nConsultando turmas da escola: ${escolaId}`);
    
    const { data: turmasEscola, error: errorEscola } = await supabase
      .from('turmas')
      .select('*')
      .eq('escola_id', escolaId);
      
    if (errorEscola) {
      console.error(`Erro ao consultar turmas da escola ${escolaId}:`, errorEscola);
    } else {
      console.log(`Turmas encontradas para a escola ${escolaId}: ${turmasEscola.length}`);
      
      if (turmasEscola.length > 0) {
        console.log('Turmas da escola:');
        turmasEscola.forEach((turma, index) => {
          console.log(`${index+1}. ${turma.nome || '(sem nome)'} - ${turma.serie}`);
        });
      } else {
        console.log('Nenhuma turma encontrada para esta escola.');
      }
    }
    
    return { success: true };
  } catch (error) {
    console.error('Erro ao listar turmas:', error);
    return { success: false, error };
  }
}

// Executar a função principal
listarTurmas().then(resultado => {
  console.log('Resultado final:', resultado);
  process.exit(resultado.success ? 0 : 1);
}).catch(erro => {
  console.error('Erro fatal:', erro);
  process.exit(1);
});