import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

async function criarUsuarioProfessorTeste() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  try {
    console.log('👨‍🏫 CRIANDO USUÁRIO PROFESSOR DE TESTE...');
    
    // Verificar se já existe
    const existingUser = await pool.query(
      'SELECT id FROM usuarios WHERE email = $1',
      ['professor@sabiarpg.edu.br']
    );
    
    if (existingUser.rows.length > 0) {
      console.log('⚠️ Professor de teste já existe');
      console.log('📧 Email: professor@sabiarpg.edu.br');
      console.log('🔑 Senha: Senha@123');
      return;
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash('Senha@123', 10);
    
    // Criar usuário professor
    const novoUsuario = await pool.query(`
      INSERT INTO usuarios (
        nome, 
        email, 
        senha_hash, 
        perfil, 
        ativo, 
        criado_em,
        atualizado_em
      ) VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING id, nome, email, perfil
    `, [
      'Professor Teste',
      'professor@sabiarpg.edu.br', 
      hashedPassword,
      'professor',
      true
    ]);

    const professorId = novoUsuario.rows[0].id;
    console.log('✅ Usuário professor criado:', novoUsuario.rows[0]);

    // Buscar escolas disponíveis
    const escolas = await pool.query('SELECT id, nome FROM escolas LIMIT 2');
    
    if (escolas.rows.length === 0) {
      console.log('⚠️ Nenhuma escola encontrada para vincular o professor');
      return;
    }

    // Vincular professor às escolas
    for (const escola of escolas.rows) {
      await pool.query(`
        INSERT INTO professor_escolas (professor_id, escola_id, ativo, criado_em)
        VALUES ($1, $2, $3, NOW())
      `, [professorId, escola.id, true]);
      
      console.log(`✅ Professor vinculado à escola: ${escola.nome}`);
    }

    // Buscar turmas disponíveis
    const turmas = await pool.query(`
      SELECT t.id, t.nome, e.nome as escola_nome 
      FROM turmas t
      JOIN escolas e ON t.escola_id = e.id
      WHERE t.ativo = true
      LIMIT 3
    `);

    console.log(`📚 Encontradas ${turmas.rows.length} turmas disponíveis`);

    // Buscar componentes disponíveis
    const componentes = await pool.query(`
      SELECT id, nome, disciplina, ano_escolar 
      FROM componentes_curriculares 
      WHERE ativo = true 
      LIMIT 5
    `);

    console.log(`📖 Encontrados ${componentes.rows.length} componentes disponíveis`);

    // Criar vínculos turma_componentes para o professor
    let vinculos = 0;
    for (const turma of turmas.rows) {
      for (const componente of componentes.rows.slice(0, 2)) { // 2 componentes por turma
        const vinculo = await pool.query(`
          INSERT INTO turma_componentes (
            turma_id, 
            componente_id, 
            professor_id, 
            ativo, 
            criado_em
          ) VALUES ($1, $2, $3, $4, NOW())
          ON CONFLICT (turma_id, componente_id) 
          DO UPDATE SET professor_id = $3, ativo = $4
          RETURNING id
        `, [turma.id, componente.id, professorId, true]);
        
        if (vinculo.rows.length > 0) {
          vinculos++;
          console.log(`✅ Vínculo criado: ${turma.nome} + ${componente.nome}`);
        }
      }
    }

    console.log(`📊 Total de vínculos criados: ${vinculos}`);

    // Resumo final
    console.log('\n🎯 PROFESSOR TESTE CRIADO COM SUCESSO!');
    console.log('📧 Email: professor@sabiarpg.edu.br');
    console.log('🔑 Senha: Senha@123');
    console.log(`🏫 Escolas vinculadas: ${escolas.rows.length}`);
    console.log(`📚 Vínculos turma-componente: ${vinculos}`);
    console.log('🌐 Acesse: /dashboard/professor');
    
  } catch (error) {
    console.error('❌ Erro ao criar professor de teste:', error);
  } finally {
    await pool.end();
  }
}

criarUsuarioProfessorTeste();