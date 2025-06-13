import { Client } from 'pg';

// Configuração do cliente PostgreSQL direto
const getDirectClient = () => {
  return new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });
};

// Função para atualizar usuário usando PostgreSQL direto (contorna RLS)
export async function updateUserDirect(userId: string, userData: any) {
  const client = getDirectClient();
  
  try {
    await client.connect();
    console.log('=== ATUALIZANDO COM CLIENTE DIRETO ===');
    console.log('ID original:', userId);
    console.log('Dados:', userData);

    // Primeiro, identificar se é ID de perfil ou usuário direto
    let realUserId = userId;
    let profileTable = null;

    // Verificar se é ID de perfil_gestor
    const gestorQuery = 'SELECT usuario_id FROM perfis_gestor WHERE id = $1 LIMIT 1';
    const gestorResult = await client.query(gestorQuery, [userId]);
    
    if (gestorResult.rows.length > 0) {
      realUserId = gestorResult.rows[0].usuario_id;
      profileTable = 'perfis_gestor';
      console.log('ID é de perfil gestor, usuario_id:', realUserId);
    } else {
      // Verificar se é ID de perfil_professor
      const professorQuery = 'SELECT usuario_id FROM perfis_professor WHERE id = $1 LIMIT 1';
      const professorResult = await client.query(professorQuery, [userId]);
      
      if (professorResult.rows.length > 0) {
        realUserId = professorResult.rows[0].usuario_id;
        profileTable = 'perfis_professor';
        console.log('ID é de perfil professor, usuario_id:', realUserId);
      } else {
        // Verificar se é ID de perfil_aluno
        const alunoQuery = 'SELECT usuario_id FROM perfis_aluno WHERE id = $1 LIMIT 1';
        const alunoResult = await client.query(alunoQuery, [userId]);
        
        if (alunoResult.rows.length > 0) {
          realUserId = alunoResult.rows[0].usuario_id;
          profileTable = 'perfis_aluno';
          console.log('ID é de perfil aluno, usuario_id:', realUserId);
        } else {
          console.log('ID é de usuário direto:', realUserId);
        }
      }
    }

    // Atualizar na tabela usuarios
    const updateQuery = `
      UPDATE usuarios 
      SET 
        nome = $1,
        email = $2,
        telefone = $3,
        cpf = $4,
        ativo = $5
      WHERE id = $6
      RETURNING id, nome, email, telefone, cpf, ativo
    `;
    
    const updateResult = await client.query(updateQuery, [
      userData.nome,
      userData.email,
      userData.telefone || '',
      userData.cpf || '',
      userData.ativo,
      realUserId
    ]);

    if (updateResult.rows.length === 0) {
      return { success: false, error: 'Usuário não encontrado' };
    }

    // Atualizar também na tabela de perfil se aplicável
    if (profileTable) {
      const profileUpdateQuery = `UPDATE ${profileTable} SET ativo = $1 WHERE id = $2`;
      await client.query(profileUpdateQuery, [userData.ativo, userId]);
      console.log(`Perfil ${profileTable} atualizado`);
    }

    const updatedUser = updateResult.rows[0];
    console.log('Usuário atualizado com sucesso:', updatedUser);
    
    return { success: true, data: updatedUser };

  } catch (error) {
    console.error('Erro na atualização direta:', error);
    return { success: false, error: 'Erro interno do servidor' };
  } finally {
    await client.end();
  }
}

// Função para excluir usuário usando PostgreSQL direto
export async function deleteUserDirect(userId: string) {
  const client = getDirectClient();
  
  try {
    await client.connect();
    console.log('=== EXCLUINDO COM CLIENTE DIRETO ===');
    console.log('ID original:', userId);

    // Identificar tipo de ID e buscar usuario_id real
    let realUserId = userId;
    let profileTable = null;
    let profileId = userId;

    // Verificar perfis
    const profileTables = ['perfis_gestor', 'perfis_professor', 'perfis_aluno'];
    
    for (const table of profileTables) {
      const query = `SELECT usuario_id FROM ${table} WHERE id = $1 LIMIT 1`;
      const result = await client.query(query, [userId]);
      
      if (result.rows.length > 0) {
        realUserId = result.rows[0].usuario_id;
        profileTable = table;
        console.log(`ID é de ${table}, usuario_id:`, realUserId);
        break;
      }
    }

    // Buscar dados do usuário antes de excluir
    const userQuery = 'SELECT * FROM usuarios WHERE id = $1';
    const userResult = await client.query(userQuery, [realUserId]);
    
    if (userResult.rows.length === 0) {
      return { success: false, error: 'Usuário não encontrado' };
    }

    const userData = userResult.rows[0];

    // Excluir perfil primeiro se existir
    if (profileTable) {
      const deleteProfileQuery = `DELETE FROM ${profileTable} WHERE id = $1`;
      await client.query(deleteProfileQuery, [profileId]);
      console.log(`Perfil ${profileTable} excluído`);
    }

    // Excluir usuário
    const deleteUserQuery = 'DELETE FROM usuarios WHERE id = $1';
    await client.query(deleteUserQuery, [realUserId]);
    
    console.log('Usuário excluído:', userData);
    return { success: true, data: userData };

  } catch (error) {
    console.error('Erro na exclusão direta:', error);
    return { success: false, error: 'Erro interno do servidor' };
  } finally {
    await client.end();
  }
}