import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import session from 'express-session';
import path from 'path';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Servir arquivos estáticos PRIMEIRO (antes de qualquer endpoint)
app.use('/attached_assets', express.static(path.join(process.cwd(), 'attached_assets')));

// Configure sessão ANTES dos endpoints
app.use(session({
  secret: 'sabia-rpg-session-secret',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// Import database utilities
import { executeQuery } from './database';
import crypto from 'crypto';

// =================================================================
// TODOS OS ENDPOINTS DA API DEVEM VIR ANTES DA CONFIGURAÇÃO DO VITE
// =================================================================

// Direct API routes without authentication (placed before all middleware)
// Endpoint para detalhes das escolas do gestor
app.get('/api/escolas/detalhes', async (req, res) => {
  try {
    if (!req.session?.userId) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }

    const gestorId = req.session.userId;
    
    const escolasResult = await executeQuery(`
      SELECT 
        e.*,
        COUNT(DISTINCT pp.id) as total_professores,
        COUNT(DISTINCT pa.id) as total_alunos,
        COUNT(DISTINCT t.id) as total_turmas
      FROM escolas e
      LEFT JOIN perfis_professor pp ON e.id = pp.escola_id AND pp.ativo = true
      LEFT JOIN perfis_aluno pa ON e.id = pa.escola_id AND pa.ativo = true
      LEFT JOIN turmas t ON e.id = t.escola_id AND t.ativo = true
      WHERE e.gestor_id = $1
      GROUP BY e.id
      ORDER BY e.nome
    `, [gestorId]);

    return res.status(200).json({
      message: 'Escolas obtidas com sucesso',
      escolas: escolasResult.rows
    });
  } catch (error) {
    console.error('Erro ao buscar detalhes das escolas:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Endpoint para detalhes dos professores do gestor
app.get('/api/professores/detalhes', async (req, res) => {
  try {
    if (!req.session?.userId) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }

    const gestorId = req.session.userId;
    
    const professoresResult = await executeQuery(`
      SELECT 
        u.id,
        u.nome,
        u.email,
        pp.cpf,
        pp.telefone,
        pp.data_nascimento,
        pp.endereco,
        u.ativo,
        e.nome as escola_nome,
        e.id as escola_id
      FROM usuarios u
      JOIN perfis_professor pp ON u.id = pp.usuario_id
      JOIN escolas e ON pp.escola_id = e.id
      WHERE e.gestor_id = $1 AND u.ativo = true AND u.papel = 'professor'
      ORDER BY u.nome
    `, [gestorId]);

    return res.status(200).json({
      message: 'Professores obtidos com sucesso',
      professores: professoresResult.rows
    });
  } catch (error) {
    console.error('Erro ao buscar detalhes dos professores:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Endpoint para detalhes dos alunos do gestor
app.get('/api/alunos/detalhes', async (req, res) => {
  try {
    if (!req.session?.userId) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }

    const gestorId = req.session.userId;
    
    const alunosResult = await executeQuery(`
      SELECT 
        u.id,
        u.nome,
        u.email,
        pa.cpf,
        pa.telefone,
        pa.matricula,
        pa.data_nascimento,
        pa.endereco,
        u.ativo,
        e.nome as escola_nome,
        e.id as escola_id,
        t.nome as turma_nome,
        t.id as turma_id
      FROM usuarios u
      JOIN perfis_aluno pa ON u.id = pa.usuario_id
      JOIN escolas e ON pa.escola_id = e.id
      LEFT JOIN matriculas m ON pa.matricula_id = m.id
      LEFT JOIN turmas t ON m.turma_id = t.id
      WHERE e.gestor_id = $1 AND u.ativo = true AND u.papel = 'aluno'
      ORDER BY u.nome
    `, [gestorId]);

    return res.status(200).json({
      message: 'Alunos obtidos com sucesso',
      alunos: alunosResult.rows
    });
  } catch (error) {
    console.error('Erro ao buscar detalhes dos alunos:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Endpoint para detalhes das turmas do gestor
app.get('/api/turmas/detalhes', async (req, res) => {
  try {
    if (!req.session?.userId) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }

    const gestorId = req.session.userId;
    
    const turmasResult = await executeQuery(`
      SELECT 
        t.*,
        e.nome as escola_nome,
        e.id as escola_id,
        COUNT(DISTINCT m.id) as numero_alunos,
        pp.nome as professor_nome,
        up.nome as professor_usuario_nome
      FROM turmas t
      JOIN escolas e ON t.escola_id = e.id
      LEFT JOIN matriculas m ON t.id = m.turma_id AND m.ativo = true
      LEFT JOIN perfis_professor pp ON t.professor_id = pp.id
      LEFT JOIN usuarios up ON pp.usuario_id = up.id
      WHERE e.gestor_id = $1
      GROUP BY t.id, e.id, e.nome, pp.id, pp.nome, up.nome
      ORDER BY e.nome, t.nome
    `, [gestorId]);

    return res.status(200).json({
      message: 'Turmas obtidas com sucesso',
      turmas: turmasResult.rows
    });
  } catch (error) {
    console.error('Erro ao buscar detalhes das turmas:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

app.get('/api/manager/dashboard-stats', async (req, res) => {
  try {
    console.log('Buscando estatísticas reais baseadas em perfis_professor, perfis_aluno e turmas');
    
    // Verificar se há sessão ativa
    if (!req.session?.userId) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }
    
    const gestorId = req.session.userId;
    
    // Buscar escolas vinculadas ao gestor através da tabela escolas diretamente
    console.log('Buscando escolas vinculadas ao gestor:', gestorId);
    const escolasResult = await executeQuery(
      'SELECT * FROM escolas WHERE gestor_id = $1',
      [gestorId]
    );
    console.log('Escolas encontradas via gestor_id:', escolasResult.rows.length);
    console.log('Nomes das escolas encontradas:', escolasResult.rows.map(e => e.nome));
    
    // Se não encontrar por gestor_id, tentar via perfis_gestor
    let escolaIds = [];
    let escolas = [];
    
    if (escolasResult.rows.length > 0) {
      escolaIds = escolasResult.rows.map(row => row.id);
      escolas = escolasResult.rows;
      console.log('Usando escolas encontradas via gestor_id:', escolas.map(e => e.nome));
    } else {
      // Fallback para perfis_gestor
      const perfilGestorResult = await executeQuery(
        'SELECT escola_id FROM perfis_gestor WHERE usuario_id = $1 AND ativo = true',
        [gestorId]
      );
      
      if (perfilGestorResult.rows.length > 0) {
        escolaIds = perfilGestorResult.rows.map(row => row.escola_id);
        
        // Buscar detalhes das escolas
        const escolasDetalhes = await executeQuery(
          'SELECT id, nome FROM escolas WHERE id = ANY($1)',
          [escolaIds]
        );
        escolas = escolasDetalhes.rows;
        console.log('Usando escolas encontradas via perfis_gestor:', escolas.map(e => e.nome));
      }
    }
    
    if (escolaIds.length === 0) {
      console.log('Nenhuma escola vinculada encontrada para o gestor');
      return res.status(200).json({
        totalEscolas: 0,
        totalProfessores: 0,
        totalAlunos: 0,
        turmasAtivas: 0,
        escolas: [],
        message: 'Nenhuma escola vinculada encontrada'
      });
    }
    
    // Se não temos escolas detalhadas, buscar detalhes completos
    if (escolas.length === 0 && escolaIds.length > 0) {
      const escolasDetalhesResult = await executeQuery(
        'SELECT * FROM escolas WHERE id = ANY($1)',
        [escolaIds]
      );
      escolas = escolasDetalhesResult.rows;
    }
    
    // Contar dados reais das tabelas usuarios e turmas
    console.log('=== CONSULTANDO DADOS REAIS DAS TABELAS ===');
    console.log('Escolas IDs para contagem:', escolaIds);
    
    // Contar professores reais da tabela usuarios com papel='professor'
    const professoresResult = await executeQuery(`
      SELECT COUNT(DISTINCT u.id) as count
      FROM usuarios u
      JOIN perfis_professor pp ON u.id = pp.usuario_id
      WHERE pp.escola_id = ANY($1) AND u.ativo = true AND u.papel = 'professor'
    `, [escolaIds]);
    const totalProfessores = parseInt(professoresResult.rows[0]?.count || '0');
    
    // Contar alunos reais da tabela usuarios com papel='aluno'  
    const alunosResult = await executeQuery(`
      SELECT COUNT(DISTINCT u.id) as count
      FROM usuarios u
      JOIN perfis_aluno pa ON u.id = pa.usuario_id
      WHERE pa.escola_id = ANY($1) AND u.ativo = true AND u.papel = 'aluno'
    `, [escolaIds]);
    const totalAlunos = parseInt(alunosResult.rows[0]?.count || '0');
    
    // Contar turmas reais da tabela turmas
    const turmasResult = await executeQuery(`
      SELECT COUNT(*) as count 
      FROM turmas 
      WHERE escola_id = ANY($1) AND ativo = true
    `, [escolaIds]);
    const totalTurmasAtivas = parseInt(turmasResult.rows[0]?.count || '0');
    
    console.log('=== CONTADORES REAIS ===');
    console.log('Professores encontrados:', totalProfessores);
    console.log('Alunos encontrados:', totalAlunos);
    console.log('Turmas ativas encontradas:', totalTurmasAtivas);

    
    // Contar o número correto de escolas vinculadas
    const totalEscolas = escolaIds.length;
    
    const dashboardStats = {
      totalEscolas: totalEscolas,
      totalProfessores: totalProfessores || 0,
      totalAlunos: totalAlunos || 0,
      turmasAtivas: totalTurmasAtivas || 0,
      escolas: escolas || []
    };
    
    console.log('=== RESPOSTA FINAL ===');
    console.log('Dados sendo enviados:', dashboardStats);
    
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

// Endpoint para buscar detalhes dos professores baseado em perfis_professor
app.get('/api/professores', async (req, res) => {
  try {
    console.log('Buscando detalhes dos professores REAIS baseado em perfis_professor');
    
    // Verificar se há sessão ativa
    if (!req.session?.userId) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }
    
    const gestorId = req.session.userId;
    
    // Buscar escolas do gestor através da tabela perfis_gestor
    const perfilGestorResult = await executeQuery(`
      SELECT escola_id FROM perfis_gestor WHERE usuario_id = $1 AND ativo = true
    `, [gestorId]);
    
    const escolaIds = perfilGestorResult.rows.map(row => row.escola_id);
    
    if (escolaIds.length === 0) {
      return res.json({
        message: 'Nenhuma escola encontrada para o gestor',
        professores: []
      });
    }
    
    // Buscar professores através da tabela perfis_professor
    const professoresResult = await executeQuery(`
      SELECT 
        pp.id as perfil_id,
        pp.usuario_id,
        pp.escola_id,
        pp.disciplinas,
        pp.turmas,
        pp.ativo,
        u.nome,
        u.email,
        u.cpf,
        u.telefone,
        e.nome as escola_nome
      FROM perfis_professor pp
      JOIN usuarios u ON pp.usuario_id = u.id
      JOIN escolas e ON pp.escola_id = e.id
      WHERE pp.escola_id = ANY($1) AND pp.ativo = true
      ORDER BY u.nome
    `, [escolaIds]);
    
    const professores = professoresResult.rows.map(prof => ({
      id: prof.perfil_id,
      usuarios: {
        nome: prof.nome || 'Nome não informado',
        email: prof.email || 'Não informado',
        telefone: prof.telefone || 'Não informado',
        cpf: prof.cpf || 'Não informado'
      },
      escola_id: prof.escola_id,
      escola_nome: prof.escola_nome,
      disciplinas: prof.disciplinas || ['Não informado'],
      turmas: prof.turmas || ['Não informado'],
      ativo: prof.ativo
    }));
    
    console.log(`DADOS REAIS perfis_professor: Encontrados ${professores.length} professores`);
    
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

// Endpoint para buscar detalhes dos alunos baseado em perfis_aluno
app.get('/api/alunos', async (req, res) => {
  try {
    console.log('Buscando detalhes dos alunos REAIS baseado em perfis_aluno');
    
    const gestorId = '72e7feef-0741-46ec-bdb4-68dcdfc6defe';
    
    // Buscar escolas do gestor primeiro
    const escolasResult = await executeQuery(`
      SELECT id FROM escolas WHERE gestor_id = $1
    `, [gestorId]);
    
    const escolaIds = escolasResult.rows.map(e => e.id);
    
    if (escolaIds.length === 0) {
      return res.json({
        message: 'Nenhuma escola encontrada para o gestor',
        alunos: []
      });
    }
    
    // Buscar alunos através das tabelas perfis_aluno e matriculas com LEFT JOIN para incluir todos os alunos
    const alunosResult = await executeQuery(`
      SELECT 
        pa.id as perfil_id,
        pa.usuario_id,
        pa.matricula_id,
        pa.nivel,
        pa.xp,
        u.nome,
        u.email,
        u.cpf,
        u.telefone,
        COALESCE(m.numero_matricula, 'Não informado') as numero_matricula,
        m.turma_id,
        m.escola_id,
        COALESCE(t.nome, 'Sem turma') as turma_nome,
        COALESCE(e.nome, 'Não informado') as escola_nome
      FROM perfis_aluno pa
      JOIN usuarios u ON pa.usuario_id = u.id
      LEFT JOIN matriculas m ON pa.matricula_id = m.id
      LEFT JOIN turmas t ON m.turma_id = t.id
      LEFT JOIN escolas e ON m.escola_id = e.id
      WHERE (m.escola_id = ANY($1) OR m.escola_id IS NULL) AND u.ativo = true
      ORDER BY u.nome
    `, [escolaIds]);
    
    const alunos = alunosResult.rows.map(aluno => ({
      id: aluno.perfil_id,
      usuarios: {
        nome: aluno.nome || 'Nome não informado',
        email: aluno.email || 'Não informado',
        cpf: aluno.cpf || 'Não informado',
        telefone: aluno.telefone || 'Não informado'
      },
      turmas: {
        nome: aluno.turma_nome || 'Sem turma'
      },
      matriculas: {
        numero_matricula: aluno.numero_matricula || 'Não informado'
      },
      escola_id: aluno.escola_id,
      turma_id: aluno.turma_id,
      matricula_id: aluno.matricula_id,
      escola_nome: aluno.escola_nome || 'Não informado',
      nivel: aluno.nivel || 1,
      xp: aluno.xp || 0,
      ativo: true
    }));
    
    console.log(`DADOS REAIS perfis_aluno: Encontrados ${alunos.length} alunos`);
    
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

// Endpoint para detalhes completos das escolas
app.get('/api/escolas/detalhes', async (req, res) => {
  try {
    console.log('Buscando detalhes completos das escolas para o gestor');
    
    // Verificar se há sessão ativa
    if (!req.session || !req.session.userId) {
      return res.status(401).json({
        message: 'Não autorizado',
        detalhes: 'Sessão inválida'
      });
    }
    
    const gestorId = req.session.userId;
    console.log('Buscando escolas para gestor:', gestorId);
    
    const escolasResult = await executeQuery(`
      SELECT 
        e.id,
        e.nome,
        e.endereco_completo as endereco,
        e.cidade,
        e.estado,
        e.telefone,
        e.email_institucional,
        e.criado_em
      FROM escolas e
      WHERE e.gestor_id = $1
      ORDER BY e.nome
    `, [gestorId]);
    
    console.log(`DADOS REAIS: Encontradas ${escolasResult.rows.length} escolas no banco`);
    
    res.json({
      message: 'Escolas obtidas com sucesso',
      escolas: escolasResult.rows
    });
    
  } catch (error) {
    console.error('Erro ao buscar detalhes das escolas:', error);
    res.status(500).json({
      message: 'Erro ao buscar escolas',
      error: error.message
    });
  }
});

// Endpoint para detalhes completos das turmas com contagem de alunos
app.get('/api/turmas/detalhes', async (req, res) => {
  try {
    console.log('Buscando detalhes completos das turmas para o gestor');
    
    const gestorId = '72e7feef-0741-46ec-bdb4-68dcdfc6defe';
    
    const turmasResult = await executeQuery(`
      SELECT 
        t.id,
        t.nome,
        t.serie,
        t.ano_letivo,
        t.modalidade,
        t.turno,
        t.capacidade_maxima,
        t.escola_id,
        t.ativo,
        e.nome as escola_nome,
        COUNT(pa.id) as total_alunos
      FROM turmas t
      JOIN escolas e ON t.escola_id = e.id
      LEFT JOIN perfis_aluno pa ON t.id = pa.turma_id AND pa.ativo = true
      WHERE e.gestor_id = $1 AND t.ativo = true
      GROUP BY t.id, t.nome, t.serie, t.ano_letivo, t.modalidade, t.turno, t.capacidade_maxima, t.escola_id, t.ativo, e.nome
      ORDER BY e.nome, t.serie, t.nome
    `, [gestorId]);
    
    console.log(`DADOS REAIS: Encontradas ${turmasResult.rows.length} turmas no banco`);
    
    res.json({
      message: 'Turmas obtidas com sucesso',
      turmas: turmasResult.rows
    });
    
  } catch (error) {
    console.error('Erro ao buscar detalhes das turmas:', error);
    res.status(500).json({
      message: 'Erro ao buscar turmas',
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
    
    // Buscar dados reais do PostgreSQL
    const escolasResult = await executeQuery(`
      SELECT 
        id::text, 
        nome, 
        codigo_escola,
        tipo,
        modalidade_ensino,
        cidade, 
        estado, 
        zona_geografica,
        endereco_completo,
        telefone,
        email_institucional,
        criado_em
      FROM escolas
      WHERE gestor_id = $1
      ORDER BY nome ASC
    `, [gestorId]);
    
    const escolas = escolasResult.rows;
    
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
    
    const professoresResult = await executeQuery(`
      SELECT u.*, pp.escola_id, pp.disciplinas, e.nome as escola_nome
      FROM usuarios u
      INNER JOIN perfis_professor pp ON u.id = pp.usuario_id
      INNER JOIN escolas e ON pp.escola_id = e.id
      WHERE u.papel = 'professor' 
      AND pp.escola_id = ANY($1)
      AND pp.ativo = true
    `, [escolaIds]);
    
    const professores = professoresResult.rows;
    const error = null;
    
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
    
    const alunosResult = await executeQuery(`
      SELECT u.*, pa.turma_id, t.nome as turma_nome, t.serie, t.escola_id, e.nome as escola_nome
      FROM usuarios u
      INNER JOIN perfis_aluno pa ON u.id = pa.usuario_id
      INNER JOIN turmas t ON pa.turma_id = t.id
      INNER JOIN escolas e ON t.escola_id = e.id
      WHERE u.papel = 'aluno' 
      AND t.escola_id = ANY($1)
    `, [escolaIds]);
    
    const alunos = alunosResult.rows;
    const error = null;
    
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
    
    const turmasResult = await executeQuery(`
      SELECT t.*, e.nome as escola_nome, u.nome as professor_nome, u.email as professor_email
      FROM turmas t
      INNER JOIN escolas e ON t.escola_id = e.id
      LEFT JOIN usuarios u ON t.professor_id = u.id
      WHERE t.escola_id = ANY($1)
      AND t.ativo = true
    `, [escolaIds]);
    
    const turmas = turmasResult.rows;
    const error = null;
    
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
    
    const usuariosResult = await executeQuery(`
      SELECT id, nome, email, cpf, papel, telefone, ativo, criado_em
      FROM usuarios
      WHERE nome IS NOT NULL 
      AND email IS NOT NULL
      ORDER BY criado_em DESC
    `);
    
    const usuarios = usuariosResult.rows;
    const error = null;

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
    console.log('=== VERIFICAÇÃO DE AUTENTICAÇÃO GESTOR ===');
    console.log('Session:', req.session);
    console.log('Session ID:', req.session?.id);
    console.log('User ID na sessão:', req.session?.userId);
    
    const userId = req.session?.userId;
    if (!userId) {
      console.log('❌ Usuário não autenticado - sem userId na sessão');
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }

    const userResult = await executeQuery('SELECT papel FROM usuarios WHERE id = $1', [userId]);
    if (!userResult.rows[0] || userResult.rows[0].papel !== 'gestor') {
      console.log('❌ Usuário não é gestor:', userResult.rows[0]?.papel);
      return res.status(403).json({ message: 'Acesso negado. Apenas gestores podem gerenciar usuários.' });
    }

    console.log('✅ Verificação de gestor passou');
    next();
  } catch (error) {
    console.error('Erro na verificação de permissão:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// Listar todos os usuários do PostgreSQL (apenas para gestores)
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
      ORDER BY 
        CASE u.papel 
          WHEN 'gestor' THEN 1
          WHEN 'professor' THEN 2
          WHEN 'aluno' THEN 3
          ELSE 4
        END, u.criado_em DESC
    `);
    
    console.log(`Retornando dados de ${usuariosResult.rows.length} usuários do PostgreSQL`);
    
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

// Endpoint para listar escolas (para cadastro de usuários)
app.get('/api/escolas-cadastro', async (req, res) => {
  try {
    console.log('=== LISTAGEM DE ESCOLAS PARA CADASTRO ===');
    
    // Verificar se há sessão ativa
    if (!req.session || !req.session.userId) {
      return res.status(401).json({
        erro: 'Não autorizado',
        detalhes: 'Sessão inválida'
      });
    }
    
    const gestorId = req.session.userId;
    console.log('Buscando escolas para gestor:', gestorId);
    
    const escolasResult = await executeQuery(`
      SELECT 
        id, 
        nome, 
        cidade, 
        estado, 
        codigo_escola
      FROM escolas
      WHERE gestor_id = $1
      ORDER BY nome ASC
    `, [gestorId]);
    
    console.log(`Encontradas ${escolasResult.rows.length} escolas para o gestor`);
    
    res.json({
      sucesso: true,
      escolas: escolasResult.rows
    });
    
  } catch (error) {
    console.error('Erro ao listar escolas:', error);
    res.status(500).json({ 
      erro: 'Erro ao buscar escolas',
      detalhes: error.message
    });
  }
});

// Endpoint para listar escolas do gestor (para página de escolas)
app.get('/api/escolas/gestor', async (req, res) => {
  try {
    console.log('=== LISTAGEM DE ESCOLAS DO GESTOR (POSTGRESQL) ===');
    
    // Verificar se há sessão ativa
    if (!req.session || !req.session.userId) {
      return res.status(401).json({
        erro: 'Não autorizado',
        detalhes: 'Sessão inválida'
      });
    }
    
    const gestorId = req.session.userId;
    console.log('Buscando escolas PostgreSQL para gestor:', gestorId);
    
    // Usar executeQuery para garantir conexão PostgreSQL
    const escolasResult = await executeQuery(`
      SELECT 
        id::text, 
        nome, 
        cidade, 
        estado, 
        codigo_escola,
        tipo,
        modalidade_ensino,
        endereco_completo as endereco,
        telefone,
        email_institucional,
        criado_em
      FROM escolas
      WHERE gestor_id = $1
      ORDER BY nome ASC
    `, [gestorId]);
    
    console.log('CIDADES CORRETAS DO POSTGRESQL:', escolasResult.rows.map(e => `${e.nome}: ${e.cidade}`));
    console.log('DADOS COMPLETOS DA QUERY:', JSON.stringify(escolasResult.rows, null, 2));
    console.log(`Encontradas ${escolasResult.rows.length} escolas do gestor no PostgreSQL`);
    
    res.json(escolasResult.rows);
    
  } catch (error) {
    console.error('Erro ao listar escolas do gestor:', error);
    res.status(500).json({
      erro: 'Erro ao buscar escolas',
      detalhes: error.message
    });
  }
});

// Endpoint para listar turmas por escola (para cadastro de alunos)
app.get('/api/turmas-por-escola/:escolaId', async (req, res) => {
  try {
    const { escolaId } = req.params;
    console.log(`=== LISTAGEM DE TURMAS PARA ESCOLA: ${escolaId} ===`);
    
    const turmasResult = await executeQuery(`
      SELECT 
        id, 
        nome, 
        serie, 
        ano_letivo,
        turno
      FROM turmas
      WHERE escola_id = $1 AND ativo = true
      ORDER BY serie ASC, nome ASC
    `, [escolaId]);
    
    console.log(`Encontradas ${turmasResult.rows.length} turmas ativas para a escola`);
    
    res.json({
      sucesso: true,
      turmas: turmasResult.rows
    });
    
  } catch (error) {
    console.error('Erro ao listar turmas:', error);
    res.status(500).json({ 
      erro: 'Erro ao buscar turmas',
      detalhes: error.message
    });
  }
});

// Endpoint para listar todos os usuários (para o painel do gestor)
app.get('/api/listar-usuarios', async (req, res) => {
  try {
    console.log('=== LISTAGEM DE USUÁRIOS ===');
    
    const usuariosResult = await executeQuery(`
      SELECT 
        u.id, 
        u.nome, 
        u.email, 
        u.papel, 
        u.cpf, 
        u.telefone, 
        u.data_nascimento, 
        u.ativo, 
        u.criado_em,
        CASE 
          WHEN u.papel = 'gestor' THEN 'Gestor Escolar'
          WHEN u.papel = 'professor' THEN 'Professor'
          WHEN u.papel = 'aluno' THEN 'Aluno'
          ELSE u.papel
        END as papel_formatado
      FROM usuarios u
      WHERE u.ativo = true
      ORDER BY u.criado_em DESC
    `);
    
    const usuarios = usuariosResult.rows.map(usuario => ({
      ...usuario,
      cpf_formatado: usuario.cpf ? usuario.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') : null,
      telefone_formatado: usuario.telefone ? usuario.telefone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3') : null,
      criado_em_formatado: new Date(usuario.criado_em).toLocaleDateString('pt-BR')
    }));
    
    console.log(`Encontrados ${usuarios.length} usuários ativos`);
    
    res.json({
      sucesso: true,
      total: usuarios.length,
      usuarios: usuarios
    });
    
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({ 
      erro: 'Erro ao buscar usuários',
      detalhes: error.message
    });
  }
});

// Endpoint simples para cadastro de usuários (sem dependência de sessão complexa)
app.post('/api/cadastrar-usuario-direto', async (req, res) => {
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

// Sessão já configurada no início do arquivo

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

// =================================================================
// FIM DOS ENDPOINTS DA API - AGORA CONFIGURAR VITE E SERVIDOR
// =================================================================

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
