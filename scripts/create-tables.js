import { db, pool } from '../server/db.ts';
import * as schema from '../shared/schema.ts';
import { sql } from 'drizzle-orm';

async function createTables() {
  try {
    console.log('🔄 Criando tabelas no PostgreSQL...');
    
    // Criar tabela escolas
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS escolas (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        nome TEXT NOT NULL,
        codigo_escola TEXT NOT NULL UNIQUE,
        endereco TEXT,
        telefone TEXT,
        config_trilhas JSONB DEFAULT '{}',
        calendario_triagens JSONB DEFAULT '{}',
        criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        ativo BOOLEAN DEFAULT TRUE
      );
    `);
    console.log('✅ Tabela escolas criada com sucesso!');
    
    // Criar tabela usuarios
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS usuarios (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT NOT NULL UNIQUE,
        senha_hash TEXT NOT NULL,
        papel TEXT NOT NULL,
        criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log('✅ Tabela usuarios criada com sucesso!');
    
    // Criar tabela perfis_gestor
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS perfis_gestor (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
        escola_id UUID REFERENCES escolas(id) ON DELETE RESTRICT,
        cargo TEXT,
        permissoes_especiais JSONB DEFAULT '{}',
        ativo BOOLEAN DEFAULT TRUE,
        criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log('✅ Tabela perfis_gestor criada com sucesso!');
    
    console.log('✅ Todas as tabelas foram criadas com sucesso!');
    
    return true;
  } catch (error) {
    console.error('❌ Erro durante a criação das tabelas:', error);
    return false;
  } finally {
    await pool.end();
  }
}

createTables().then(success => {
  if (success) {
    console.log('✅ Processo concluído com sucesso!');
    process.exit(0);
  } else {
    console.error('❌ Processo concluído com erros!');
    process.exit(1);
  }
});