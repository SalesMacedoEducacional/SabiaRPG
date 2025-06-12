import { Request, Response } from 'express';
import { supabase } from '../db/supabase';

// API para buscar usuários reais usando nova query
export async function getRealUsersFromPostgreSQL(req: Request, res: Response) {
  try {
    console.log('=== BUSCANDO USUÁRIOS REAIS DO POSTGRESQL ===');
    console.log('Método:', req.method);
    console.log('URL:', req.url);
    console.log('Session:', req.session?.userId);
    
    // Query nova com timestamp para forçar dados atuais
    const timestamp = Date.now();
    const { data: usuarios, error } = await supabase
      .from('usuarios')
      .select('id, nome, email, cpf, papel, telefone, ativo, criado_em')
      .not('id', 'is', null)
      .order('criado_em', { ascending: false });

    if (error) {
      console.error('Erro ao buscar usuários:', error);
      return res.status(500).json({ message: "Erro ao buscar usuários" });
    }

    // Filtrar apenas usuários que realmente existem (com dados válidos)
    const usuariosValidos = usuarios?.filter(u => u.id && (u.nome || u.email)) || [];
    
    console.log(`Usuários válidos encontrados: ${usuariosValidos.length}`);
    console.log('IDs válidos:', usuariosValidos.map((u: any) => u.id));

    const usuariosFormatados = usuariosValidos.map((user: any) => ({
      id: user.id,
      nome: user.nome || 'Nome não informado',
      email: user.email || 'Email não informado',
      cpf: user.cpf || 'CPF não informado',
      papel: user.papel,
      telefone: user.telefone || '',
      escola_nome: 'Geral',
      ativo: user.ativo ?? true,
      criado_em: user.criado_em
    }));

    res.json({
      total: usuariosFormatados.length,
      usuarios: usuariosFormatados
    });

  } catch (error) {
    console.error('Erro crítico na busca de usuários:', error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
}

// API para atualizar usuário
export async function updateUser(req: Request, res: Response) {
  try {
    console.log('=== ATUALIZANDO USUÁRIO ===');
    const { id } = req.params;
    const { nome, email, cpf, telefone, ativo } = req.body;
    
    console.log('ID do usuário:', id);
    console.log('Dados recebidos:', { nome, email, cpf, telefone, ativo });
    
    if (!id) {
      return res.status(400).json({ message: 'ID do usuário é obrigatório' });
    }

    // Preparar dados para atualização
    const updateData: any = {};
    if (nome !== undefined) updateData.nome = nome;
    if (email !== undefined) updateData.email = email;
    if (cpf !== undefined) updateData.cpf = cpf;
    if (telefone !== undefined) updateData.telefone = telefone;
    if (ativo !== undefined) updateData.ativo = ativo;
    
    console.log('Dados para atualização:', updateData);

    const { data, error } = await supabase
      .from('usuarios')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar usuário:', error);
      return res.status(500).json({ 
        message: 'Erro ao atualizar usuário',
        error: error.message 
      });
    }

    console.log('Usuário atualizado com sucesso:', data);
    res.json({ 
      message: 'Usuário atualizado com sucesso',
      usuario: data 
    });

  } catch (error) {
    console.error('Erro crítico na atualização de usuário:', error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
}

// API para excluir usuário
export async function deleteUser(req: Request, res: Response) {
  try {
    console.log('=== EXCLUINDO USUÁRIO ===');
    const { id } = req.params;
    
    console.log('ID do usuário para exclusão:', id);
    
    if (!id) {
      return res.status(400).json({ message: 'ID do usuário é obrigatório' });
    }

    // Primeiro, verificar se o usuário existe
    const { data: usuario, error: fetchError } = await supabase
      .from('usuarios')
      .select('id, nome, email')
      .eq('id', id)
      .single();

    if (fetchError || !usuario) {
      console.error('Usuário não encontrado:', fetchError);
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    console.log('Usuário encontrado para exclusão:', usuario);

    // Excluir o usuário
    const { error: deleteError } = await supabase
      .from('usuarios')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Erro ao excluir usuário:', deleteError);
      return res.status(500).json({ 
        message: 'Erro ao excluir usuário',
        error: deleteError.message 
      });
    }

    console.log('Usuário excluído com sucesso');
    res.json({ 
      message: 'Usuário excluído com sucesso',
      usuario: usuario 
    });

  } catch (error) {
    console.error('Erro crítico na exclusão de usuário:', error);
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