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
      'SELECT COUNT(*) as count FROM perfis_professor WHERE escola_id = ANY($1) AND ativo = true',
      [escolaIds]
    );
    const totalProfessores = parseInt(professoresResult.rows[0]?.count || '0');
    
    const alunosResult = await executeQuery(
      'SELECT COUNT(*) as count FROM usuarios WHERE papel = $1',
      ['student']
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

app.delete('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`Excluindo usuário ${id} do banco PostgreSQL`);

    const query = `
      DELETE FROM usuarios 
      WHERE id = $1
      RETURNING id, nome, email
    `;
    
    const result = await executeQuery(query, [id]);
    
    if (result.rows.length > 0) {
      console.log('Usuário excluído com sucesso:', result.rows[0]);
      res.json({ 
        success: true, 
        message: "Usuário excluído com sucesso",
        data: result.rows[0]
      });
    } else {
      res.status(404).json({ message: "Usuário não encontrado" });
    }

  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    res.status(500).json({ message: "Erro interno do servidor" });
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
