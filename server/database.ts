import { Pool } from 'pg';

console.log('🔗 CONFIGURANDO CONEXÃO COM BANCO...');

function getDatabaseUrl(): string {
  if (process.env.PGHOST && process.env.PGUSER && process.env.PGPASSWORD && process.env.PGDATABASE) {
    const url = `postgresql://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${process.env.PGPORT || '5432'}/${process.env.PGDATABASE}?sslmode=require`;
    console.log('✅ CONECTADO AO NEON/REPLIT:', `${process.env.PGHOST.substring(0, 30)}...`);
    return url;
  }
  
  const databaseUrl = process.env.DATABASE_URL;
  if (databaseUrl) {
    const isSupabase = databaseUrl.includes('supabase.co');
    const isNeon = databaseUrl.includes('neon.tech');
    if (isSupabase) {
      console.log('✅ CONECTADO AO SUPABASE:', databaseUrl.substring(0, 50) + '...');
    } else if (isNeon) {
      console.log('✅ CONECTADO AO NEON:', databaseUrl.substring(0, 50) + '...');
    } else {
      console.log('⚠️ CONECTADO AO BANCO:', databaseUrl.substring(0, 50) + '...');
    }
    return databaseUrl;
  }
  
  throw new Error('❌ Nenhuma configuração de banco de dados encontrada');
}

const databaseUrl = getDatabaseUrl();

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
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