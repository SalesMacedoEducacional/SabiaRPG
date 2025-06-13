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

// Função para atualizar usuário usando PostgreSQL direto com transação
export async function updateUserDirect(userId: string, userData: any) {
  const client = getDirectClient();
  
  try {
    await client.connect();
    console.log('=== ATUALIZANDO COM TRANSAÇÃO ===');
    console.log('ID do usuário:', userId);
    console.log('Dados:', userData);

    // Iniciar transação
    await client.query('BEGIN');

    // Primeiro, buscar o usuário e seu papel
    const userQuery = 'SELECT id, papel FROM usuarios WHERE id = $1';
    const userResult = await client.query(userQuery, [userId]);
    
    if (userResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return { success: false, error: 'Usuário não encontrado' };
    }

    const user = userResult.rows[0];
    const papel = user.papel;
    console.log('Papel do usuário:', papel);

    // Mapear papel para tabela de perfil
    let profileTable = null;
    switch (papel) {
      case 'professor':
        profileTable = 'perfis_professor';
        break;
      case 'gestor':
        profileTable = 'perfis_gestor';
        break;
      case 'aluno':
        profileTable = 'perfis_aluno';
        break;
    }

    // Atualizar na tabela de perfil primeiro
    if (profileTable) {
      const profileUpdateQuery = `
        UPDATE ${profileTable} 
        SET ativo = $1 
        WHERE usuario_id = $2
      `;
      await client.query(profileUpdateQuery, [userData.ativo, userId]);
      console.log(`Perfil ${profileTable} atualizado para usuario_id:`, userId);
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
      RETURNING id, nome, email, telefone, cpf, ativo, papel
    `;
    
    const updateResult = await client.query(updateQuery, [
      userData.nome,
      userData.email,
      userData.telefone || '',
      userData.cpf || '',
      userData.ativo,
      userId
    ]);

    if (updateResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return { success: false, error: 'Falha ao atualizar usuário' };
    }

    // Commit da transação
    await client.query('COMMIT');

    const updatedUser = updateResult.rows[0];
    console.log('Usuário atualizado com sucesso:', updatedUser);
    
    return { success: true, data: updatedUser };

  } catch (error) {
    console.error('Erro na atualização:', error);
    await client.query('ROLLBACK');
    return { success: false, error: 'Erro interno do servidor' };
  } finally {
    await client.end();
  }
}

// Função para excluir usuário usando PostgreSQL direto com transação
export async function deleteUserDirect(userId: string) {
  const client = getDirectClient();
  
  try {
    await client.connect();
    console.log('=== EXCLUINDO COM TRANSAÇÃO ===');
    console.log('ID do usuário:', userId);

    // Iniciar transação
    await client.query('BEGIN');

    // Buscar o usuário e seu papel
    const userQuery = 'SELECT id, papel, nome, email FROM usuarios WHERE id = $1';
    const userResult = await client.query(userQuery, [userId]);
    
    if (userResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return { success: false, error: 'Usuário não encontrado' };
    }

    const userData = userResult.rows[0];
    const papel = userData.papel;
    console.log('Papel do usuário:', papel);

    // Mapear papel para tabela de perfil
    let profileTable = null;
    switch (papel) {
      case 'professor':
        profileTable = 'perfis_professor';
        break;
      case 'gestor':
        profileTable = 'perfis_gestor';
        break;
      case 'aluno':
        profileTable = 'perfis_aluno';
        break;
    }

    // Excluir perfil primeiro se existir
    if (profileTable) {
      const deleteProfileQuery = `DELETE FROM ${profileTable} WHERE usuario_id = $1`;
      const profileResult = await client.query(deleteProfileQuery, [userId]);
      console.log(`Perfil ${profileTable} excluído para usuario_id:`, userId);
      console.log(`Registros de perfil excluídos:`, profileResult.rowCount);
    }

    // Excluir usuário
    const deleteUserQuery = 'DELETE FROM usuarios WHERE id = $1 RETURNING *';
    const deleteResult = await client.query(deleteUserQuery, [userId]);
    
    if (deleteResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return { success: false, error: 'Falha ao excluir usuário' };
    }

    // Commit da transação
    await client.query('COMMIT');
    
    const deletedUser = deleteResult.rows[0];
    console.log('Usuário excluído com sucesso:', deletedUser);
    return { success: true, data: deletedUser };

  } catch (error) {
    console.error('Erro na exclusão:', error);
    await client.query('ROLLBACK');
    return { success: false, error: 'Erro interno do servidor' };
  } finally {
    await client.end();
  }
}