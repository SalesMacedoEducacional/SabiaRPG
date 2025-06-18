import { Request, Response } from 'express';
import { executeQuery } from './database';

// Middleware para verificar se o usuário é gestor
const requireGestor = async (req: Request, res: Response, next: Function) => {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }

    const userResult = await executeQuery('SELECT papel FROM usuarios WHERE id = $1', [userId]);
    if (!userResult.rows[0] || userResult.rows[0].papel !== 'gestor') {
      return res.status(403).json({ message: 'Acesso negado. Apenas gestores podem gerenciar usuários.' });
    }

    next();
  } catch (error) {
    console.error('Erro na verificação de permissão:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// IDs dos 3 usuários reais específicos
const USUARIOS_REAIS = [
  'e9d4401b-3ebf-49ae-a5a3-80d0a78d0982', // Aluno Teste
  '4813f089-70f1-4c27-995f-6badc90a4359', // Professor Teste  
  '72e7feef-0741-46ec-bdb4-68dcdfc6defe'  // Gestor Teste
];

// Listar os 3 usuários específicos
export const listarUsuarios = async (req: Request, res: Response) => {
  try {
    const usuariosResult = await executeQuery(`
      SELECT 
        u.id, u.nome, u.email, u.papel, u.cpf, u.telefone, 
        u.data_nascimento, u.endereco, u.cidade, u.estado, u.cep,
        u.ativo, u.criado_em,
        ue.escola_id,
        e.nome as escola_nome
      FROM usuarios u
      LEFT JOIN usuario_escola ue ON u.id = ue.usuario_id
      LEFT JOIN escolas e ON ue.escola_id = e.id
      WHERE u.id = ANY($1)
      ORDER BY 
        CASE u.papel 
          WHEN 'gestor' THEN 1
          WHEN 'professor' THEN 2
          WHEN 'aluno' THEN 3
          ELSE 4
        END, u.nome
    `, [USUARIOS_REAIS]);
    
    console.log(`Retornando dados dos ${usuariosResult.rows.length} usuários reais`);
    
    res.json({
      message: 'Usuários obtidos com sucesso',
      total: usuariosResult.rows.length,
      usuarios: usuariosResult.rows
    });
    
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// Obter detalhes de um usuário específico
export const obterUsuario = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.session?.userId;
    
    // Verificar se o ID está na lista de usuários permitidos
    if (!USUARIOS_REAIS.includes(id)) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    
    // Verificar se é gestor ou o próprio usuário
    const userResult = await executeQuery('SELECT papel FROM usuarios WHERE id = $1', [userId]);
    const isGestor = userResult.rows[0]?.papel === 'gestor';
    const isSameUser = userId === id;
    
    if (!isGestor && !isSameUser) {
      return res.status(403).json({ message: 'Acesso negado.' });
    }
    
    const usuarioResult = await executeQuery(`
      SELECT 
        u.id, u.nome, u.email, u.papel, u.cpf, u.telefone,
        u.data_nascimento, u.endereco, u.cidade, u.estado, u.cep,
        u.ativo, u.criado_em,
        ue.escola_id,
        e.nome as escola_nome
      FROM usuarios u
      LEFT JOIN usuario_escola ue ON u.id = ue.usuario_id
      LEFT JOIN escolas e ON ue.escola_id = e.id
      WHERE u.id = $1
    `, [id]);
    
    if (usuarioResult.rows.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    
    res.json({
      message: 'Usuário encontrado',
      usuario: usuarioResult.rows[0]
    });
    
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// Editar dados de usuário
export const editarUsuario = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.session?.userId;
    const { nome, telefone, cpf, data_nascimento, endereco, cidade, estado, cep, escola_id } = req.body;
    
    // Verificar se o ID está na lista de usuários permitidos
    if (!USUARIOS_REAIS.includes(id)) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    
    // Verificar se é gestor ou o próprio usuário
    const userResult = await executeQuery('SELECT papel FROM usuarios WHERE id = $1', [userId]);
    const isGestor = userResult.rows[0]?.papel === 'gestor';
    const isSameUser = userId === id;
    
    if (!isGestor && !isSameUser) {
      return res.status(403).json({ message: 'Acesso negado.' });
    }
    
    // Atualizar dados do usuário
    await executeQuery(`
      UPDATE usuarios SET 
        nome = $1, telefone = $2, cpf = $3, data_nascimento = $4,
        endereco = $5, cidade = $6, estado = $7, cep = $8,
        atualizado_em = NOW()
      WHERE id = $9
    `, [nome, telefone, cpf, data_nascimento, endereco, cidade, estado, cep, id]);
    
    // Se for gestor e forneceu escola_id, atualizar vinculação
    if (isGestor && escola_id) {
      await executeQuery('DELETE FROM usuario_escola WHERE usuario_id = $1', [id]);
      await executeQuery('INSERT INTO usuario_escola (usuario_id, escola_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [id, escola_id]);
    }
    
    console.log(`Usuário ${id} atualizado com sucesso`);
    res.json({ message: 'Usuário atualizado com sucesso' });
    
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// Ativar/Desativar usuário (apenas gestores)
export const alterarStatusUsuario = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { ativo } = req.body;
    
    // Verificar se o ID está na lista de usuários permitidos
    if (!USUARIOS_REAIS.includes(id)) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    
    await executeQuery('UPDATE usuarios SET ativo = $1, atualizado_em = NOW() WHERE id = $2', [ativo, id]);
    
    console.log(`Status do usuário ${id} alterado para ${ativo ? 'ativo' : 'inativo'}`);
    res.json({ 
      message: `Usuário ${ativo ? 'ativado' : 'desativado'} com sucesso`
    });
    
  } catch (error) {
    console.error('Erro ao alterar status do usuário:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// Alterar papel do usuário (apenas gestores) - RESTRITO aos 3 usuários
export const alterarPapelUsuario = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { papel } = req.body;
    
    // Verificar se o ID está na lista de usuários permitidos
    if (!USUARIOS_REAIS.includes(id)) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    
    // Validar papel
    const papeisValidos = ['aluno', 'professor', 'gestor'];
    if (!papeisValidos.includes(papel)) {
      return res.status(400).json({ message: 'Papel inválido' });
    }
    
    await executeQuery('UPDATE usuarios SET papel = $1, atualizado_em = NOW() WHERE id = $2', [papel, id]);
    
    console.log(`Papel do usuário ${id} alterado para ${papel}`);
    res.json({ message: 'Papel do usuário alterado com sucesso' });
    
  } catch (error) {
    console.error('Erro ao alterar papel do usuário:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// Middleware para verificar se é gestor (exportado para uso nas rotas)
export { requireGestor };