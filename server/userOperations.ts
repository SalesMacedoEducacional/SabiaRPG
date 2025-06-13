import { supabase } from '../db/supabase.js';

// Função para atualizar usuário com bypass de RLS usando service role
export async function updateUserWithServiceRole(userId: string, userData: any) {
  try {
    console.log('=== ATUALIZANDO COM SERVICE ROLE ===');
    console.log('ID:', userId);
    console.log('Dados:', userData);

    // Usar uma query SQL direta que bypass o RLS
    const { data, error } = await supabase.rpc('update_user_data', {
      user_id: userId,
      user_name: userData.nome,
      user_email: userData.email,
      user_phone: userData.telefone || '',
      user_cpf: userData.cpf || '',
      user_active: userData.ativo
    });

    if (error) {
      console.error('Erro na função RPC:', error);
      return { success: false, error: error.message };
    }

    if (!data || data.length === 0) {
      return { success: false, error: 'Usuário não encontrado' };
    }

    console.log('Usuário atualizado via RPC:', data[0]);
    return { success: true, data: data[0] };
  } catch (error) {
    console.error('Erro na atualização:', error);
    return { success: false, error: 'Erro interno' };
  }
}

// Função alternativa usando REST API direto
export async function updateUserDirect(userId: string, userData: any) {
  try {
    // Primeiro verificar se é ID de perfil ou usuário
    let realUserId = userId;
    
    // Verificar perfis usando consultas que não dependem de RLS
    const queries = [
      { table: 'perfis_gestor', id: userId },
      { table: 'perfis_professor', id: userId },
      { table: 'perfis_aluno', id: userId }
    ];
    
    for (const query of queries) {
      try {
        const { data: perfil } = await supabase
          .from(query.table)
          .select('usuario_id')
          .eq('id', query.id)
          .limit(1);
        
        if (perfil && perfil.length > 0) {
          realUserId = perfil[0].usuario_id;
          console.log(`ID ${userId} é do perfil ${query.table}, usuario_id: ${realUserId}`);
          break;
        }
      } catch (e) {
        // Continuar se der erro na consulta
        continue;
      }
    }
    
    // Tentar atualização direta sem RLS
    const updateData = {
      nome: userData.nome,
      email: userData.email,
      telefone: userData.telefone,
      cpf: userData.cpf,
      ativo: userData.ativo
    };
    
    const { data: updated, error } = await supabase
      .from('usuarios')
      .update(updateData)
      .eq('id', realUserId)
      .select();
    
    if (error) {
      console.error('Erro na atualização direta:', error);
      return { success: false, error: error.message };
    }
    
    if (!updated || updated.length === 0) {
      return { success: false, error: 'Usuário não encontrado' };
    }
    
    console.log('Usuário atualizado:', updated[0]);
    return { success: true, data: updated[0] };
    
  } catch (error) {
    console.error('Erro geral:', error);
    return { success: false, error: 'Erro interno' };
  }
}

// Função para deletar usuário
export async function deleteUserComplete(userId: string) {
  try {
    console.log('=== EXCLUINDO USUÁRIO ===');
    console.log('ID:', userId);
    
    // Identificar tipo de ID
    let realUserId = userId;
    let profileToDelete = null;
    
    const profileTables = ['perfis_gestor', 'perfis_professor', 'perfis_aluno'];
    
    for (const table of profileTables) {
      try {
        const { data: perfil } = await supabase
          .from(table)
          .select('usuario_id')
          .eq('id', userId)
          .limit(1);
        
        if (perfil && perfil.length > 0) {
          realUserId = perfil[0].usuario_id;
          profileToDelete = { table, id: userId };
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    // Buscar dados do usuário
    const { data: user } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', realUserId)
      .single();
    
    if (!user) {
      return { success: false, error: 'Usuário não encontrado' };
    }
    
    // Excluir perfil se existir
    if (profileToDelete) {
      await supabase.from(profileToDelete.table).delete().eq('id', profileToDelete.id);
      console.log(`Perfil ${profileToDelete.table} excluído`);
    }
    
    // Excluir usuário
    const { data: deleted, error } = await supabase
      .from('usuarios')
      .delete()
      .eq('id', realUserId)
      .select()
      .single();
    
    if (error) {
      console.error('Erro ao excluir:', error);
      return { success: false, error: error.message };
    }
    
    console.log('Usuário excluído:', deleted);
    return { success: true, data: deleted };
    
  } catch (error) {
    console.error('Erro na exclusão:', error);
    return { success: false, error: 'Erro interno' };
  }
}