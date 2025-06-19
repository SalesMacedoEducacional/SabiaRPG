import { Pool } from 'pg';

async function corrigirSchemaComponentes() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  try {
    console.log('🔧 CORRIGINDO SCHEMA DAS TABELAS DE COMPONENTES...');
    
    // 1. Remover colunas desnecessárias da tabela componentes
    console.log('1. Ajustando tabela componentes...');
    
    // Verificar estrutura atual
    const estruturaAtual = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'componentes' 
      ORDER BY ordinal_position;
    `);
    
    console.log('Estrutura atual da tabela componentes:');
    estruturaAtual.rows.forEach(col => {
      console.log(`- ${col.column_name}: ${col.data_type}`);
    });
    
    // Remover colunas que não devem existir (turma_id, area_id)
    try {
      await pool.query('ALTER TABLE componentes DROP COLUMN IF EXISTS turma_id;');
      await pool.query('ALTER TABLE componentes DROP COLUMN IF EXISTS area_id;');
      console.log('✅ Colunas desnecessárias removidas');
    } catch (error) {
      console.log('Colunas já não existem ou erro esperado:', error.message);
    }
    
    // 2. Verificar se turma_componentes tem as colunas corretas
    console.log('2. Verificando tabela turma_componentes...');
    
    const estruturaTurmaComponentes = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'turma_componentes' 
      ORDER BY ordinal_position;
    `);
    
    console.log('Estrutura da tabela turma_componentes:');
    estruturaTurmaComponentes.rows.forEach(col => {
      console.log(`- ${col.column_name}: ${col.data_type}`);
    });
    
    // 3. Adicionar constraint único para evitar duplicatas
    try {
      await pool.query(`
        ALTER TABLE turma_componentes 
        ADD CONSTRAINT unique_turma_componente_professor 
        UNIQUE (turma_id, componente_id, professor_id);
      `);
      console.log('✅ Constraint única adicionada');
    } catch (error) {
      console.log('Constraint já existe ou erro esperado:', error.message);
    }
    
    // 4. Verificar se professor_id referencia perfis_professor.usuario_id
    console.log('3. Verificando referência de professor_id...');
    
    // Ajustar referência para apontar para perfis_professor.usuario_id
    try {
      await pool.query(`
        ALTER TABLE turma_componentes 
        DROP CONSTRAINT IF EXISTS turma_componentes_professor_id_fkey;
      `);
      
      await pool.query(`
        ALTER TABLE turma_componentes 
        ADD CONSTRAINT turma_componentes_professor_id_fkey 
        FOREIGN KEY (professor_id) REFERENCES usuarios(id);
      `);
      console.log('✅ Referência de professor_id corrigida');
    } catch (error) {
      console.log('Erro ao ajustar referência (esperado se já estiver correto):', error.message);
    }
    
    // 5. Verificar dados atuais
    const countComponentes = await pool.query('SELECT COUNT(*) FROM componentes;');
    const countTurmaComponentes = await pool.query('SELECT COUNT(*) FROM turma_componentes;');
    
    console.log(`📊 Total de componentes: ${countComponentes.rows[0].count}`);
    console.log(`📊 Total de vínculos turma-componentes: ${countTurmaComponentes.rows[0].count}`);
    
    // 6. Listar componentes com suas informações
    const componentes = await pool.query(`
      SELECT id, nome, ano_serie, cor_hex 
      FROM componentes 
      ORDER BY nome, ano_serie;
    `);
    
    console.log('\n📋 COMPONENTES DISPONÍVEIS:');
    componentes.rows.forEach(comp => {
      console.log(`- ${comp.nome} (${comp.ano_serie}) - ${comp.cor_hex}`);
    });
    
    console.log('\n✅ SCHEMA CORRIGIDO COM SUCESSO!');
    
  } catch (error) {
    console.error('❌ Erro ao corrigir schema:', error);
  } finally {
    await pool.end();
  }
}

corrigirSchemaComponentes();