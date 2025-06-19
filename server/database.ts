import { Pool } from 'pg';

// CONFIGURAÇÃO DE BANCO - AGUARDANDO URL DO SUPABASE
const databaseUrl = process.env.DATABASE_URL;

console.log('📊 CONECTANDO AO BANCO:', databaseUrl?.includes('supabase') ? 'SUPABASE' : 'BANCO TEMPORÁRIO');

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