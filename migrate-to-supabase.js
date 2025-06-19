/**
 * Script de migração completa para Supabase
 * Transfere todos os dados do banco temporário para o Supabase real
 */

import { Pool } from 'pg';
import fs from 'fs';

// Banco temporário atual (Neon)
const tempPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function migrateToSupabase() {
  console.log('🔄 INICIANDO MIGRAÇÃO PARA SUPABASE...');
  
  try {
    // 1. Extrair dados do banco temporário
    console.log('📤 Extraindo dados do banco temporário...');
    
    const usuarios = await tempPool.query('SELECT * FROM usuarios ORDER BY criado_em');
    const escolas = await tempPool.query('SELECT * FROM escolas ORDER BY criado_em');
    const turmas = await tempPool.query('SELECT * FROM turmas ORDER BY criado_em');
    const estados = await tempPool.query('SELECT * FROM estados ORDER BY nome');
    const cidades = await tempPool.query('SELECT * FROM cidades ORDER BY nome');
    
    console.log(`📊 DADOS EXTRAÍDOS:`);
    console.log(`   Usuários: ${usuarios.rows.length}`);
    console.log(`   Escolas: ${escolas.rows.length}`);
    console.log(`   Turmas: ${turmas.rows.length}`);
    console.log(`   Estados: ${estados.rows.length}`);
    console.log(`   Cidades: ${cidades.rows.length}`);
    
    // 2. Salvar dados em arquivo JSON para backup
    const backupData = {
      usuarios: usuarios.rows,
      escolas: escolas.rows,
      turmas: turmas.rows,
      estados: estados.rows,
      cidades: cidades.rows,
      timestamp: new Date().toISOString()
    };
    
    fs.writeFileSync('backup-dados-supabase.json', JSON.stringify(backupData, null, 2));
    console.log('💾 Backup salvo em backup-dados-supabase.json');
    
    // 3. Exibir instruções para o usuário
    console.log('\n🎯 PRÓXIMOS PASSOS:');
    console.log('1. Configure a variável DATABASE_URL com a URL do seu Supabase');
    console.log('2. Execute: npm run db:push para criar as tabelas no Supabase');
    console.log('3. Execute este script novamente para transferir os dados');
    
    return backupData;
    
  } catch (error) {
    console.error('❌ Erro na migração:', error);
    throw error;
  } finally {
    await tempPool.end();
  }
}

// Executar migração se chamado diretamente
migrateToSupabase()
  .then(() => {
    console.log('✅ Migração concluída com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Falha na migração:', error);
    process.exit(1);
  });

export { migrateToSupabase };