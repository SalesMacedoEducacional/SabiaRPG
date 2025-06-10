import { Request, Response } from 'express';
import { supabase } from '../db/supabase';

// API para buscar usuários diretamente do PostgreSQL
export async function getRealUsersFromPostgreSQL(req: Request, res: Response) {
  try {
    console.log('=== BUSCANDO USUÁRIOS DIRETAMENTE DO POSTGRESQL ===');
    
    // Buscar dados diretamente sem cache
    const { data: usuarios, error } = await supabase
      .from('usuarios')
      .select('id, nome, email, cpf, papel, telefone, ativo, criado_em')
      .order('criado_em', { ascending: false });

    if (error) {
      console.error('Erro ao buscar usuários:', error);
      return res.status(500).json({ message: "Erro ao buscar usuários" });
    }

    console.log(`Usuários encontrados via SQL direto: ${usuarios?.length || 0}`);
    console.log('IDs reais do PostgreSQL:', usuarios?.map((u: any) => u.id));

    const usuariosFormatados = usuarios?.map((user: any) => ({
      id: user.id,
      nome: user.nome || 'Nome não informado',
      email: user.email || 'Email não informado',
      cpf: user.cpf || 'CPF não informado',
      papel: user.papel,
      telefone: user.telefone || '',
      escola_nome: 'Geral',
      ativo: user.ativo ?? true,
      criado_em: user.criado_em
    })) || [];

    res.json({
      total: usuariosFormatados.length,
      usuarios: usuariosFormatados
    });

  } catch (error) {
    console.error('Erro crítico na busca de usuários:', error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
}

// API para atualizar usuário usando ID real
export async function updateRealUser(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    console.log(`=== ATUALIZANDO USUÁRIO ID: ${id} ===`);
    console.log('Dados para atualização:', updateData);

    // Primeiro verificar se o usuário existe
    const { data: existingUser } = await supabase
      .from('usuarios')
      .select('id')
      .eq('id', id)
      .single();

    if (!existingUser) {
      console.log(`Usuário ${id} não encontrado no banco`);
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    const { error: updateError } = await supabase
      .from('usuarios')
      .update(updateData)
      .eq('id', id);

    if (updateError) {
      console.error('Erro ao atualizar usuário:', updateError);
      return res.status(500).json({ message: "Erro ao atualizar usuário" });
    }

    console.log(`Usuário ${id} atualizado com sucesso`);
    res.json({ success: true, message: "Usuário atualizado com sucesso" });

  } catch (error) {
    console.error('Erro na atualização:', error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
}

// API para excluir usuário usando ID real
export async function deleteRealUser(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    console.log(`=== EXCLUINDO USUÁRIO ID: ${id} ===`);

    // Primeiro verificar se o usuário existe
    const { data: existingUser } = await supabase
      .from('usuarios')
      .select('id')
      .eq('id', id)
      .single();

    if (!existingUser) {
      console.log(`Usuário ${id} não encontrado no banco`);
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    // Excluir perfis relacionados primeiro
    await supabase.from('perfis_aluno').delete().eq('usuario_id', id);
    await supabase.from('perfis_professor').delete().eq('usuario_id', id);
    await supabase.from('perfis_gestor').delete().eq('usuario_id', id);

    // Excluir usuário
    const { error: deleteError } = await supabase
      .from('usuarios')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Erro ao excluir usuário:', deleteError);
      return res.status(500).json({ message: "Erro ao excluir usuário" });
    }

    console.log(`Usuário ${id} excluído com sucesso`);
    res.json({ success: true, message: "Usuário excluído com sucesso" });

  } catch (error) {
    console.error('Erro na exclusão:', error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
}