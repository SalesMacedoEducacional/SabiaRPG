import { Pool } from 'pg';

const componentesPadroes = [
  // Linguagens e suas Tecnologias
  { nome: 'Linguagens e suas Tecnologias - 1º Ano', ano_serie: '1º Ano', cor_hex: '#4DA3A9' },
  { nome: 'Linguagens e suas Tecnologias - 2º Ano', ano_serie: '2º Ano', cor_hex: '#4DA3A9' },
  { nome: 'Linguagens e suas Tecnologias - 3º Ano', ano_serie: '3º Ano', cor_hex: '#4DA3A9' },
  
  // Matemática e suas Tecnologias
  { nome: 'Matemática e suas Tecnologias - 1º Ano', ano_serie: '1º Ano', cor_hex: '#D4A054' },
  { nome: 'Matemática e suas Tecnologias - 2º Ano', ano_serie: '2º Ano', cor_hex: '#D4A054' },
  { nome: 'Matemática e suas Tecnologias - 3º Ano', ano_serie: '3º Ano', cor_hex: '#D4A054' },
  
  // Ciências da Natureza e suas Tecnologias
  { nome: 'Ciências da Natureza e suas Tecnologias - 1º Ano', ano_serie: '1º Ano', cor_hex: '#A6E3E9' },
  { nome: 'Ciências da Natureza e suas Tecnologias - 2º Ano', ano_serie: '2º Ano', cor_hex: '#A6E3E9' },
  { nome: 'Ciências da Natureza e suas Tecnologias - 3º Ano', ano_serie: '3º Ano', cor_hex: '#A6E3E9' },
  
  // Ciências Humanas e Sociais Aplicadas
  { nome: 'Ciências Humanas e Sociais Aplicadas - 1º Ano', ano_serie: '1º Ano', cor_hex: '#FFC23C' },
  { nome: 'Ciências Humanas e Sociais Aplicadas - 2º Ano', ano_serie: '2º Ano', cor_hex: '#FFC23C' },
  { nome: 'Ciências Humanas e Sociais Aplicadas - 3º Ano', ano_serie: '3º Ano', cor_hex: '#FFC23C' },
  
  // Arte e Educação Física
  { nome: 'Arte e Educação Física - 1º Ano', ano_serie: '1º Ano', cor_hex: '#312E26' },
  { nome: 'Arte e Educação Física - 2º Ano', ano_serie: '2º Ano', cor_hex: '#312E26' },
  { nome: 'Arte e Educação Física - 3º Ano', ano_serie: '3º Ano', cor_hex: '#312E26' }
];

async function inserirComponentesPadroes() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  try {
    console.log('🔧 INSERINDO COMPONENTES PADRÃO...');
    
    // Primeiro, limpar tabela se houver dados
    await pool.query('DELETE FROM componentes;');
    console.log('✅ Tabela componentes limpa');
    
    // Inserir cada componente
    for (const componente of componentesPadroes) {
      const query = `
        INSERT INTO componentes (id, nome, ano_serie, cor_hex)
        VALUES (gen_random_uuid(), $1, $2, $3)
        ON CONFLICT (nome) DO NOTHING;
      `;
      
      await pool.query(query, [componente.nome, componente.ano_serie, componente.cor_hex]);
      console.log(`✅ Inserido: ${componente.nome}`);
    }
    
    // Verificar resultado
    const result = await pool.query('SELECT COUNT(*) FROM componentes;');
    console.log(`🎯 Total de componentes inseridos: ${result.rows[0].count}`);
    
    // Listar componentes inseridos
    const componentes = await pool.query('SELECT nome, ano_serie, cor_hex FROM componentes ORDER BY nome;');
    console.log('\n📋 COMPONENTES CADASTRADOS:');
    componentes.rows.forEach(comp => {
      console.log(`- ${comp.nome} (${comp.cor_hex})`);
    });
    
  } catch (error) {
    console.error('❌ Erro ao inserir componentes:', error);
  } finally {
    await pool.end();
  }
}

inserirComponentesPadroes();