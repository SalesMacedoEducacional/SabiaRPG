import { Pool } from 'pg';

// SISTEMA DE CONFIGURAÇÃO PARA FORÇAR USO EXCLUSIVO DO SUPABASE
const databaseUrl = process.env.DATABASE_URL;

console.log('🔗 CONFIGURANDO CONEXÃO COM BANCO...');

// Verificar se é uma URL válida do Supabase
const isSupabase = databaseUrl?.includes('supabase.co');
const isValidUrl = databaseUrl && databaseUrl.startsWith('postgresql://');

if (isSupabase && isValidUrl) {
  console.log('✅ CONECTADO AO SUPABASE REAL:', databaseUrl.substring(0, 50) + '...');
} else if (isValidUrl) {
  console.log('⚠️ CONECTADO AO BANCO TEMPORÁRIO (não é Supabase)');
} else {
  console.log('❌ URL DE BANCO INVÁLIDA');
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export async function executeQuery(query: string, params: any[] = []) {
  const client = await pool.connect();
  try {
    const result = await client.query(query, params);
    return result;
  } finally {
    client.release();
  }
}

export default pool;