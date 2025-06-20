/**
 * Script para criar dados de teste para o professor
 * Vincula o professor a turmas e componentes para testar o painel
 */

import { Pool } from 'pg';

// Configuração de conexão com o banco
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function criarDadosProfessorTeste() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 CRIANDO DADOS DE TESTE PARA O PROFESSOR...');
    
    const professorId = '4813f089-70f1-4c27-995f-6badc90a4359';
    
    // 1. Buscar turmas e componentes existentes
    const turmasResult = await client.query('SELECT id, nome FROM turmas LIMIT 3');
    const componentesResult = await client.query('SELECT id, nome FROM componentes LIMIT 5');
    
    console.log(`Turmas encontradas: ${turmasResult.rows.length}`);
    console.log(`Componentes encontrados: ${componentesResult.rows.length}`);
    
    if (turmasResult.rows.length === 0 || componentesResult.rows.length === 0) {
      console.log('❌ Não há turmas ou componentes suficientes no banco');
      return;
    }
    
    // 2. Criar vínculos turma_componentes para o professor
    for (const turma of turmasResult.rows) {
      for (let i = 0; i < Math.min(2, componentesResult.rows.length); i++) {
        const componente = componentesResult.rows[i];
        
        try {
          await client.query(`
            INSERT INTO turma_componentes (id, turma_id, componente_id, professor_id, criado_em)
            VALUES (gen_random_uuid(), $1, $2, $3, NOW())
            ON CONFLICT DO NOTHING
          `, [turma.id, componente.id, professorId]);
          
          console.log(`✅ Vinculado: ${turma.nome} - ${componente.nome}`);
        } catch (error) {
          console.log(`⚠️ Vínculo já existe: ${turma.nome} - ${componente.nome}`);
        }
      }
    }
    
    // 3. Criar alguns planos de aula de teste
    const vinculosResult = await client.query(`
      SELECT tc.id, c.nome as componente_nome, t.nome as turma_nome
      FROM turma_componentes tc
      JOIN componentes c ON tc.componente_id = c.id
      JOIN turmas t ON tc.turma_id = t.id
      WHERE tc.professor_id = $1
      LIMIT 3
    `, [professorId]);
    
    for (const vinculo of vinculosResult.rows) {
      try {
        await client.query(`
          INSERT INTO planos_aula (id, turma_componente_id, trimestre, titulo, conteudo, criado_em)
          VALUES (
            gen_random_uuid(), 
            $1, 
            '1º', 
            'Plano de Aula - ${vinculo.componente_nome}',
            'Conteúdo do plano de aula para ${vinculo.componente_nome} na turma ${vinculo.turma_nome}',
            NOW()
          )
          ON CONFLICT DO NOTHING
        `, [vinculo.id]);
        
        console.log(`✅ Plano criado: ${vinculo.componente_nome} - ${vinculo.turma_nome}`);
      } catch (error) {
        console.log(`⚠️ Erro ao criar plano: ${error.message}`);
      }
    }
    
    // 4. Verificar dados criados
    const estatisticas = await client.query(`
      SELECT 
        (SELECT COUNT(*) FROM turma_componentes WHERE professor_id = $1) as total_vinculos,
        (SELECT COUNT(*) FROM planos_aula pa 
         JOIN turma_componentes tc ON pa.turma_componente_id = tc.id 
         WHERE tc.professor_id = $1) as total_planos
    `, [professorId]);
    
    console.log('📊 ESTATÍSTICAS FINAIS:');
    console.log(`   Vínculos professor-turma-componente: ${estatisticas.rows[0].total_vinculos}`);
    console.log(`   Planos de aula criados: ${estatisticas.rows[0].total_planos}`);
    
  } catch (error) {
    console.error('❌ Erro ao criar dados de teste:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

// Executar se chamado diretamente
criarDadosProfessorTeste()
  .then(() => {
    console.log('✅ DADOS DE TESTE CRIADOS COM SUCESSO!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ ERRO:', error);
    process.exit(1);
  });

export { criarDadosProfessorTeste };