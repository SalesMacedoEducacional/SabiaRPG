import express from 'express';
import pg from 'pg';

const { Pool } = pg;

const PORT = parseInt(process.env.PORT || '3000', 10);
const PGPORT = parseInt(process.env.PGPORT || '5432', 10);

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'sabia',
  port: PGPORT,
});

const app = express();

app.get('/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() as now');
    res.json({ ok: true, now: result.rows[0].now });
  } catch (error: any) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

app.get('/usuarios', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM public.usuarios LIMIT 10');
    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`API local rodando em http://localhost:${PORT}`);
  console.log(`Conectando ao PostgreSQL na porta ${PGPORT}`);
});

export default app;
