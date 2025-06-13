import { Client } from 'pg';

export async function getUsersWithPostgreSQL() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    
    const query = `
      SELECT id, nome, email, cpf, papel, telefone, ativo, criado_em, 
             data_nascimento, endereco, cidade, estado, cep
      FROM usuarios 
      ORDER BY criado_em DESC
    `;
    
    const result = await client.query(query);
    
    console.log(`Usuários encontrados no PostgreSQL: ${result.rows.length}`);
    
    const usuarios = result.rows.map(user => ({
      id: user.id,
      usuario_id: user.id,
      nome: user.nome || '',
      email: user.email || '',
      cpf: user.cpf || '',
      papel: user.papel || '',
      telefone: user.telefone || '',
      ativo: user.ativo !== false,
      criado_em: user.criado_em,
      escola_nome: 'Geral',
      data_nascimento: user.data_nascimento,
      endereco: user.endereco,
      cidade: user.cidade,
      estado: user.estado,
      cep: user.cep
    }));

    return {
      total: usuarios.length,
      usuarios: usuarios
    };
  } finally {
    await client.end();
  }
}