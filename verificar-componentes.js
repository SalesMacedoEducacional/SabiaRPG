const { Pool } = require('pg');

async function verificarComponentes() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  try {
    console.log('🔍 VERIFICANDO TABELA COMPONENTES...');
    
    // Verificar se a tabela existe
    const tabelaExiste = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'componentes'
      );
    `);
    
    console.log('Tabela componentes existe:', tabelaExiste.rows[0].exists);
    
    if (tabelaExiste.rows[0].exists) {
      // Verificar estrutura da tabela
      const estrutura = await pool.query(`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'componentes' 
        ORDER BY ordinal_position;
      `);
      
      console.log('Estrutura da tabela:');
      estrutura.rows.forEach(col => {
        console.log(`- ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
      });
      
      // Contar registros
      const count = await pool.query('SELECT COUNT(*) FROM componentes;');
      console.log(`Total de componentes: ${count.rows[0].count}`);
      
      // Listar todos os componentes
      const componentes = await pool.query('SELECT * FROM componentes ORDER BY nome, ano_serie;');
      console.log('Componentes cadastrados:');
      componentes.rows.forEach(comp => {
        console.log(`- ${comp.nome} (${comp.ano_serie}) - ${comp.cor_hex}`);
      });
    }
    
  } catch (error) {
    console.error('Erro ao verificar componentes:', error);
  } finally {
    await pool.end();
  }
}

verificarComponentes();