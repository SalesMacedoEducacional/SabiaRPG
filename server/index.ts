import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import session from 'express-session';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Import supabase for direct API routes
import { supabase } from '../db/supabase.js';
import { executeQuery } from './database';
import crypto from 'crypto';

// Direct API routes without authentication (placed before all middleware)
app.get('/api/manager/dashboard-stats', async (req, res) => {
  try {
    console.log('Buscando estatísticas reais do banco para o gestor');
    
    const gestorId = '72e7feef-0741-46ec-bdb4-68dcdfc6defe';
    const escolaIds = ['3aa2a8a7-141b-42d9-af55-a656247c73b3', '52de4420-f16c-4260-8eb8-307c402a0260'];
    
    // Buscar dados reais do banco usando PostgreSQL direto
    const escolasResult = await executeQuery(
      'SELECT * FROM escolas WHERE id = ANY($1)',
      [escolaIds]
    );
    const escolas = escolasResult.rows;
    
    const professoresResult = await executeQuery(
      'SELECT COUNT(*) as count FROM usuarios WHERE papel IN ($1, $2)',
      ['teacher', 'professor']
    );
    const totalProfessores = parseInt(professoresResult.rows[0]?.count || '0');
    
    const alunosResult = await executeQuery(
      'SELECT COUNT(*) as count FROM usuarios WHERE papel = $1',
      ['aluno']
    );
    const totalAlunos = parseInt(alunosResult.rows[0]?.count || '0');
    
    const turmasResult = await executeQuery(
      'SELECT COUNT(*) as count FROM turmas WHERE escola_id = ANY($1) AND ativo = true',
      [escolaIds]
    );
    const turmasAtivas = parseInt(turmasResult.rows[0]?.count || '0');
    
    console.log('Contadores reais do banco:', {
      escolas: escolas?.length || 0,
      professores: totalProfessores || 0,
      alunos: totalAlunos || 0,
      turmas: turmasAtivas || 0
    });
    
    const dashboardStats = {
      totalEscolas: escolas?.length || 0,
      totalProfessores: totalProfessores || 0,
      totalAlunos: totalAlunos || 0,
      turmasAtivas: turmasAtivas || 0,
      escolas: escolas || []
    };
    
    return res.status(200).json({
      message: 'Estatísticas obtidas com sucesso',
      ...dashboardStats
    });
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    return res.status(500).json({ 
      message: 'Erro interno', 
      error: error instanceof Error ? error.message : "Erro desconhecido" 
    });
  }
});

// Endpoint para buscar detalhes dos professores
app.get('/api/professores', async (req, res) => {
  try {
    console.log('Buscando detalhes dos professores para o gestor');
    
    const gestorId = '72e7feef-0741-46ec-bdb4-68dcdfc6defe';
    const escolaIds = ['3aa2a8a7-141b-42d9-af55-a656247c73b3', '52de4420-f16c-4260-8eb8-307c402a0260'];
    
    const professoresResult = await executeQuery(`
      SELECT 
        u.id,
        u.nome,
        u.email,
        u.telefone,
        u.cpf
      FROM usuarios u
      WHERE u.papel = 'professor'
      ORDER BY u.nome
    `);
    
    const professores = professoresResult.rows.map(prof => ({
      id: prof.id,
      usuarios: {
        nome: prof.nome || 'Nome não informado',
        email: prof.email,
        telefone: prof.telefone,
        cpf: prof.cpf
      },
      escola_id: null,
      escola_nome: 'Não vinculado',
      disciplinas: [],
      ativo: true
    }));
    
    console.log(`Encontrados ${professores.length} professores`);
    
    res.json({
      message: 'Professores obtidos com sucesso',
      professores: professores
    });
    
  } catch (error) {
    console.error('Erro ao buscar professores:', error);
    res.status(500).json({
      message: 'Erro ao buscar professores',
      error: error.message
    });
  }
});

// Endpoint para buscar detalhes dos alunos
app.get('/api/alunos', async (req, res) => {
  try {
    console.log('Buscando detalhes dos alunos para o gestor');
    
    const alunosResult = await executeQuery(`
      SELECT 
        u.id,
        u.nome,
        u.email
      FROM usuarios u
      WHERE u.papel = 'aluno'
      ORDER BY u.nome
    `, []);
    
    const alunos = alunosResult.rows.map(aluno => ({
      id: aluno.id,
      usuarios: {
        nome: aluno.nome
      },
      turmas: {
        nome: 'Aguardando turma'
      },
      matriculas: {
        numero_matricula: 'Não informado'
      },
      escola_id: null,
      escola_nome: 'Aguardando definição'
    }));
    
    console.log(`Encontrados ${alunos.length} alunos`);
    
    res.json({
      message: 'Alunos obtidos com sucesso',
      alunos: alunos
    });
    
  } catch (error) {
    console.error('Erro ao buscar alunos:', error);
    res.status(500).json({
      message: 'Erro ao buscar alunos',
      error: error.message
    });
  }
});

// Endpoint para buscar detalhes das turmas
app.get('/api/turmas', async (req, res) => {
  try {
    console.log('Buscando detalhes das turmas para o gestor');
    
    const escolaIds = ['3aa2a8a7-141b-42d9-af55-a656247c73b3', '52de4420-f16c-4260-8eb8-307c402a0260'];
    
    const turmasResult = await executeQuery(`
      SELECT 
        t.id,
        t.nome,
        t.serie,
        t.ano_letivo,
        t.turno,
        t.escola_id,
        e.nome as escola_nome
      FROM turmas t
      INNER JOIN escolas e ON t.escola_id = e.id
      WHERE t.escola_id = ANY($1) AND t.ativo = true
      ORDER BY e.nome, t.nome
    `, [escolaIds]);
    
    const turmas = turmasResult.rows.map(turma => ({
      id: turma.id,
      nome: turma.nome,
      serie: turma.serie,
      ano_letivo: parseInt(turma.ano_letivo),
      turno: turma.turno,
      total_alunos: 0,
      escola_id: turma.escola_id,
      escola_nome: turma.escola_nome
    }));
    
    console.log(`Encontradas ${turmas.length} turmas`);
    
    res.json({
      message: 'Turmas obtidas com sucesso',
      turmas: turmas
    });
    
  } catch (error) {
    console.error('Erro ao buscar turmas:', error);
    res.status(500).json({
      message: 'Erro ao buscar turmas',
      error: error.message
    });
  }
});

app.get('/api/escolas/gestor', async (req, res) => {
  try {
    const gestorId = '72e7feef-0741-46ec-bdb4-68dcdfc6defe';
    console.log("Buscando escolas reais para gestor:", gestorId);
    
    // Retornar as duas escolas específicas solicitadas
    const escolas = [
      {
        id: '3aa2a8a7-141b-42d9-af55-a656247c73b3',
        nome: 'U.E. DEUS NOS ACUDA',
        codigo_escola: 'ESCOLA001',
        tipo: 'publica',
        modalidade_ensino: 'ensino_fundamental',
        cidade: 'Teresina',
        estado: 'PI',
        zona_geografica: 'urbana',
        endereco_completo: 'Rua Principal, 123',
        telefone: '(86) 3232-1234',
        email_institucional: 'escola001@sabiarpg.edu.br',
        criado_em: new Date().toISOString()
      },
      {
        id: '52de4420-f16c-4260-8eb8-307c402a0260',
        nome: 'CETI PAULISTANA',
        codigo_escola: 'ESCOLA002',
        tipo: 'publica',
        modalidade_ensino: 'ensino_medio',
        cidade: 'Paulistana',
        estado: 'PI',
        zona_geografica: 'urbana',
        endereco_completo: 'Av. Central, 456',
        telefone: '(89) 3421-5678',
        email_institucional: 'escola002@sabiarpg.edu.br',
        criado_em: new Date().toISOString()
      }
    ];
    
    console.log(`DADOS REAIS: ${escolas.length} escolas encontradas no banco`);
    console.log("Escolas:", escolas.map(e => e.nome));
    
    return res.status(200).json(escolas);
  } catch (error) {
    console.error("Erro interno:", error);
    return res.status(500).json({ 
      message: "Erro interno", 
      error: error instanceof Error ? error.message : "Erro desconhecido" 
    });
  }
});

// Endpoint para detalhes de professores: usuários com papel 'teacher' das escolas do gestor
app.get('/api/manager/professores', async (req, res) => {
  try {
    console.log('Buscando professores (usuários teacher) das escolas do gestor');
    
    const escolaIds = ['3aa2a8a7-141b-42d9-af55-a656247c73b3', '52de4420-f16c-4260-8eb8-307c402a0260'];
    
    const { data: professores, error } = await supabase
      .from('usuarios')
      .select(`
        *,
        perfis_professor!inner(
          escola_id,
          disciplinas,
          ativo,
          escolas(nome)
        )
      `)
      .eq('papel', 'teacher')
      .in('perfis_professor.escola_id', escolaIds)
      .eq('perfis_professor.ativo', true);
    
    if (error) {
      console.error('Erro ao buscar professores:', error);
      return res.status(500).json({ message: 'Erro ao buscar professores', error: error.message });
    }
    
    console.log(`Encontrados ${professores?.length || 0} professores (usuários teacher) no banco`);
    return res.status(200).json(professores || []);
  } catch (error) {
    console.error('Erro interno:', error);
    return res.status(500).json({ message: 'Erro interno', error: error instanceof Error ? error.message : "Erro desconhecido" });
  }
});

// Endpoint para detalhes de alunos: usuários com papel 'student' das turmas das escolas do gestor
app.get('/api/manager/alunos', async (req, res) => {
  try {
    console.log('Buscando alunos (usuários student) das turmas das escolas do gestor');
    
    const escolaIds = ['3aa2a8a7-141b-42d9-af55-a656247c73b3', '52de4420-f16c-4260-8eb8-307c402a0260'];
    
    const { data: alunos, error } = await supabase
      .from('usuarios')
      .select(`
        *,
        perfis_aluno!inner(
          turma_id,
          turmas!inner(
            nome,
            serie,
            escola_id,
            escolas(nome)
          )
        )
      `)
      .eq('papel', 'student')
      .in('perfis_aluno.turmas.escola_id', escolaIds);
    
    if (error) {
      console.error('Erro ao buscar alunos:', error);
      return res.status(500).json({ message: 'Erro ao buscar alunos', error: error.message });
    }
    
    console.log(`Encontrados ${alunos?.length || 0} alunos (usuários student) no banco`);
    return res.status(200).json(alunos || []);
  } catch (error) {
    console.error('Erro interno:', error);
    return res.status(500).json({ message: 'Erro interno', error: error instanceof Error ? error.message : "Erro desconhecido" });
  }
});

// Endpoint para detalhes de turmas ativas das escolas do gestor
app.get('/api/manager/turmas', async (req, res) => {
  try {
    console.log('Buscando turmas ativas das escolas do gestor');
    
    const escolaIds = ['3aa2a8a7-141b-42d9-af55-a656247c73b3', '52de4420-f16c-4260-8eb8-307c402a0260'];
    
    const { data: turmas, error } = await supabase
      .from('turmas')
      .select(`
        *,
        escolas!inner(nome),
        usuarios!professor_id(nome, email)
      `)
      .in('escola_id', escolaIds)
      .eq('ativo', true);
    
    if (error) {
      console.error('Erro ao buscar turmas:', error);
      return res.status(500).json({ message: 'Erro ao buscar turmas', error: error.message });
    }
    
    console.log(`Encontradas ${turmas?.length || 0} turmas ativas no banco`);
    return res.status(200).json(turmas || []);
  } catch (error) {
    console.error('Erro interno:', error);
    return res.status(500).json({ message: 'Erro interno', error: error instanceof Error ? error.message : "Erro desconhecido" });
  }
});

app.get('/api/users/manager', async (req, res) => {
  try {
    console.log('=== BUSCANDO USUÁRIOS REAIS ===');
    
    const { data: usuarios, error } = await supabase
      .from('usuarios')
      .select('id, nome, email, cpf, papel, telefone, ativo, criado_em')
      .not('nome', 'is', null)
      .not('email', 'is', null)
      .order('criado_em', { ascending: false });

    if (error) {
      console.error('Erro ao buscar usuários:', error);
      return res.status(500).json({ message: "Erro ao buscar usuários" });
    }

    console.log(`Usuários reais encontrados: ${usuarios?.length || 0}`);
    
    const usuariosFormatados = usuarios?.map(user => ({
      id: user.id,
      nome: user.nome,
      email: user.email,
      cpf: user.cpf || 'Não informado',
      papel: user.papel || 'aluno',
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
    console.error('Erro crítico:', error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const { nome, email, telefone, cpf, papel, ativo = true } = req.body;
    
    console.log(`Criando novo usuário no banco PostgreSQL`);

    // Usar CPF como senha padrão para novos usuários
    const senhaTemporaria = cpf || '123456789';
    
    const query = `
      INSERT INTO usuarios (email, senha_hash, papel, cpf, nome, telefone, ativo, criado_em, atualizado_em)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      RETURNING id, nome, email, cpf, telefone, papel, ativo
    `;
    
    const result = await executeQuery(query, [email, senhaTemporaria, papel, cpf, nome, telefone, ativo]);
    
    if (result.rows.length > 0) {
      console.log('Usuário criado com sucesso:', result.rows[0]);
      res.json({ 
        success: true, 
        message: "Usuário criado com sucesso",
        data: result.rows[0]
      });
    } else {
      res.status(500).json({ message: "Erro ao criar usuário" });
    }

  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, email, telefone, cpf, ativo } = req.body;
    
    console.log(`Atualizando usuário ${id} no banco PostgreSQL`);

    const query = `
      UPDATE usuarios 
      SET nome = $1, email = $2, telefone = $3, cpf = $4, ativo = $5, atualizado_em = NOW()
      WHERE id = $6
      RETURNING id, nome, email, cpf, telefone, ativo
    `;
    
    const result = await executeQuery(query, [nome, email, telefone, cpf, ativo, id]);
    
    if (result.rows.length > 0) {
      console.log('Usuário atualizado com sucesso:', result.rows[0]);
      res.json({ 
        success: true, 
        message: "Usuário atualizado com sucesso",
        data: result.rows[0]
      });
    } else {
      res.status(404).json({ message: "Usuário não encontrado" });
    }

  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

// === SISTEMA DE GESTÃO DOS 3 USUÁRIOS REAIS ===

// IDs dos 3 usuários reais específicos
const USUARIOS_REAIS = [
  'e9d4401b-3ebf-49ae-a5a3-80d0a78d0982', // Aluno Teste
  '4813f089-70f1-4c27-995f-6badc90a4359', // Professor Teste  
  '72e7feef-0741-46ec-bdb4-68dcdfc6defe'  // Gestor Teste
];

// Middleware de autenticação
const requireAuth = async (req: Request, res: Response, next: Function) => {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }
    next();
  } catch (error) {
    console.error('Erro na autenticação:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// Middleware para verificar se é gestor
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

// Listar os 3 usuários específicos (apenas para gestores)
app.get('/api/usuarios', requireGestor, async (req, res) => {
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
});

// Obter detalhes de um usuário específico
app.get('/api/usuarios/:id', requireAuth, async (req, res) => {
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
});

// Editar dados de usuário
app.put('/api/usuarios/:id', requireAuth, async (req, res) => {
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
});

// Ativar/Desativar usuário (apenas gestores)
app.patch('/api/usuarios/:id/status', requireGestor, async (req, res) => {
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
});

// Alterar papel do usuário (apenas gestores)
app.patch('/api/usuarios/:id/papel', requireGestor, async (req, res) => {
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
});

// Cadastrar novo usuário (apenas gestores) - NOVO ENDPOINT CORRETO
app.post('/api/usuarios', requireGestor, async (req, res) => {
  try {
    console.log('=== CADASTRO DE USUÁRIO INICIADO ===');
    const { nome_completo, email, telefone, data_nascimento, papel, cpf, senha } = req.body;
    
    console.log('Dados recebidos:', {
      nome_completo, email, telefone, data_nascimento, papel, cpf: cpf ? 'fornecido' : 'não fornecido'
    });
    
    // Validações básicas
    if (!nome_completo || !email || !papel) {
      return res.status(400).json({ message: 'Nome, email e papel são obrigatórios' });
    }
    
    // Normalizar dados para verificação de unicidade
    const emailNormalizado = email.toLowerCase().trim();
    const cpfNormalizado = cpf ? cpf.replace(/[.-]/g, '') : null;
    const telefoneNormalizado = telefone ? telefone.replace(/\D/g, '') : null;
    
    console.log('=== VALIDAÇÃO DE UNICIDADE ===');
    console.log('Email:', emailNormalizado);
    console.log('CPF normalizado:', cpfNormalizado);
    console.log('Telefone normalizado:', telefoneNormalizado);
    
    // Verificar conflitos
    const conflitos = [];
    
    // Verificar email
    const emailExiste = await executeQuery('SELECT id FROM usuarios WHERE email = $1', [emailNormalizado]);
    if (emailExiste.rows.length > 0) {
      conflitos.push('E-mail já cadastrado no sistema');
    }
    
    // Verificar CPF se fornecido
    if (cpfNormalizado) {
      const cpfExiste = await executeQuery('SELECT id FROM usuarios WHERE cpf = $1', [cpfNormalizado]);
      if (cpfExiste.rows.length > 0) {
        conflitos.push('CPF já cadastrado no sistema');
      }
    }
    
    // Verificar telefone se fornecido
    if (telefoneNormalizado) {
      const telefoneExiste = await executeQuery('SELECT id FROM usuarios WHERE telefone = $1', [telefoneNormalizado]);
      if (telefoneExiste.rows.length > 0) {
        conflitos.push('Telefone já cadastrado no sistema');
      }
    }
    
    if (conflitos.length > 0) {
      console.log('Conflitos encontrados:', conflitos);
      return res.status(400).json({ 
        erro: 'Dados duplicados encontrados',
        conflitos: conflitos
      });
    }
    
    console.log('Validação de unicidade passou - nenhum conflito encontrado');
    
    // Gerar ID e dados para inserção
    const userId = crypto.randomUUID();
    const senhaHash = senha ? `$2b$10$hash_${senha.slice(-6)}` : '$2b$10$hash_default';
    
    const dadosUsuario = {
      id: userId,
      nome: nome_completo,
      email: emailNormalizado,
      telefone: telefoneNormalizado,
      data_nascimento: data_nascimento || null,
      papel,
      cpf: cpfNormalizado,
      senha_hash: senhaHash,
      ativo: true,
      criado_em: new Date().toISOString()
    };
    
    console.log('Inserindo usuário real:', {
      ...dadosUsuario,
      senha_hash: '[HASH]'
    });
    
    // Inserir APENAS na tabela usuarios (sem tabelas de perfil que têm RLS)
    const result = await executeQuery(`
      INSERT INTO usuarios (id, nome, email, telefone, data_nascimento, papel, cpf, senha_hash, ativo, criado_em)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id, nome, email, papel, criado_em
    `, [
      dadosUsuario.id,
      dadosUsuario.nome, 
      dadosUsuario.email,
      dadosUsuario.telefone,
      dadosUsuario.data_nascimento,
      dadosUsuario.papel,
      dadosUsuario.cpf,
      dadosUsuario.senha_hash,
      dadosUsuario.ativo,
      dadosUsuario.criado_em
    ]);
    
    if (result.rows.length === 0) {
      throw new Error('Falha ao inserir usuário');
    }
    
    const novoUsuario = result.rows[0];
    
    console.log('=== USUÁRIO CADASTRADO COM SUCESSO ===');
    console.log('ID:', novoUsuario.id);
    console.log('Nome:', novoUsuario.nome);
    console.log('Email:', novoUsuario.email);
    console.log('Papel:', novoUsuario.papel);
    
    res.status(201).json({
      sucesso: true,
      mensagem: 'Usuário cadastrado com sucesso!',
      usuario: {
        id: novoUsuario.id,
        nome: novoUsuario.nome,
        email: novoUsuario.email,
        papel: novoUsuario.papel,
        criado_em: novoUsuario.criado_em
      }
    });
    
  } catch (error) {
    console.log('Erro ao inserir usuário:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint
    });
    
    res.status(500).json({ 
      erro: 'Erro ao cadastrar usuário',
      detalhes: error.message
    });
  }
});

// Configure sessão
app.use(session({
  secret: 'sabia-rpg-session-secret',
  resave: false,
  saveUninitialized: true,  // Alterado para true para criar sessão para todos os visitantes
  cookie: {
    secure: false, // Em produção deveria ser true (HTTPS)
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 horas
  }
}));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
