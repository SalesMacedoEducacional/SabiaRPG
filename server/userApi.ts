import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.DATABASE_URL?.replace('postgresql://', 'https://').split('@')[1]?.split('/')[0] || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function updateUser(userId: string, userData: any) {
  try {
    console.log('=== ATUALIZANDO USUÁRIO ===');
    console.log('ID:', userId);
    console.log('Dados:', userData);

    // Tentar atualizar diretamente na tabela usuarios
    const { data: updatedUser, error } = await supabase
      .from('usuarios')
      .update({
        nome: userData.nome,
        email: userData.email,
        telefone: userData.telefone,
        cpf: userData.cpf,
        ativo: userData.ativo
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar usuário:', error);
      return { success: false, message: "Usuário não encontrado" };
    }

    console.log('Usuário atualizado:', updatedUser);
    return { success: true, data: updatedUser };

  } catch (error) {
    console.error('Erro na atualização:', error);
    return { success: false, message: "Erro interno" };
  }
}

export async function deleteUser(userId: string) {
  try {
    console.log('=== EXCLUINDO USUÁRIO ===');
    console.log('ID:', userId);

    // Buscar usuário antes de excluir
    const { data: user, error: fetchError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', userId)
      .single();

    if (fetchError || !user) {
      console.error('Usuário não encontrado:', fetchError);
      return { success: false, message: "Usuário não encontrado" };
    }

    // Excluir perfis relacionados primeiro
    if (user.papel === 'gestor') {
      await supabase.from('perfis_gestor').delete().eq('usuario_id', userId);
    } else if (user.papel === 'professor') {
      await supabase.from('perfis_professor').delete().eq('usuario_id', userId);
    } else if (user.papel === 'aluno') {
      await supabase.from('perfis_aluno').delete().eq('usuario_id', userId);
    }

    // Excluir usuário
    const { data: deletedUser, error: deleteError } = await supabase
      .from('usuarios')
      .delete()
      .eq('id', userId)
      .select()
      .single();

    if (deleteError) {
      console.error('Erro ao excluir usuário:', deleteError);
      return { success: false, message: "Erro ao excluir usuário" };
    }

    console.log('Usuário excluído:', deletedUser);
    return { success: true, data: deletedUser };

  } catch (error) {
    console.error('Erro na exclusão:', error);
    return { success: false, message: "Erro interno" };
  }
}