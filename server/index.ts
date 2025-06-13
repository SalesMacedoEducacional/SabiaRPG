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
    
    // Buscar IDs de perfil para cada usuário
    const usuariosComPerfil = [];
    for (const user of usuarios || []) {
      let perfilId = user.id; // Por padrão, usar ID do usuário
      let tabelaPerfil = 'usuarios';
      
      // Buscar ID da tabela de perfil usando SQL direto para garantir funcionamento
      if (user.papel === 'professor') {
        const queryPerfil = 'SELECT id FROM perfis_professor WHERE usuario_id = $1';
        const resultPerfil = await executeQuery(queryPerfil, [user.id]);
        if (resultPerfil.rows.length > 0) {
          perfilId = resultPerfil.rows[0].id;
          tabelaPerfil = 'perfis_professor';
          console.log(`Usuário ${user.nome} - ID perfil professor: ${perfilId}`);
        }
      } else if (user.papel === 'gestor') {
        const queryPerfil = 'SELECT id FROM perfis_gestor WHERE usuario_id = $1';
        const resultPerfil = await executeQuery(queryPerfil, [user.id]);
        if (resultPerfil.rows.length > 0) {
          perfilId = resultPerfil.rows[0].id;
          tabelaPerfil = 'perfis_gestor';
          console.log(`Usuário ${user.nome} - ID perfil gestor: ${perfilId}`);
        }
      }
      
      usuariosComPerfil.push({
        id: perfilId, // ID para edição (perfil ou usuário)
        usuario_id: user.id, // ID original do usuário
        nome: user.nome,
        email: user.email,
        cpf: user.cpf || 'Não informado',
        papel: user.papel || 'aluno',
        telefone: user.telefone || '',
        escola_nome: 'Geral',
        ativo: user.ativo ?? true,
        criado_em: user.criado_em,
        tabela_perfil: tabelaPerfil
      });
    }
    
    const usuariosFormatados = usuariosComPerfil;

    res.json({
      total: usuariosComPerfil.length,
      usuarios: usuariosComPerfil
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

// API de teste para validar IDs de perfil
app.get('/api/test-perfil/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('=== TESTANDO ID DE PERFIL ===');
    console.log('ID recebido:', id);
    
    // Testar se é perfil gestor
    const { data: gestorData, error: gestorError } = await supabase
      .from('perfis_gestor')
      .select('id, usuario_id, ativo, cargo')
      .eq('id', id)
      .single();
    
    if (gestorData) {
      console.log('Perfil gestor encontrado:', gestorData);
      
      // Buscar dados do usuário
      const { data: userData } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', gestorData.usuario_id)
        .single();
      
      return res.json({
        tipo: 'perfil_gestor',
        perfil: gestorData,
        usuario: userData
      });
    }
    
    console.log('Perfil gestor não encontrado, testando outros...');
    res.json({ tipo: 'nao_encontrado', id });
    
  } catch (error) {
    console.error('Erro no teste:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, email, telefone, cpf, ativo } = req.body;
    
    console.log('=== INICIANDO ATUALIZAÇÃO COM SQL DIRETO ===');
    console.log('ID recebido:', id);
    console.log('Dados para atualizar:', { nome, email, telefone, cpf, ativo });
    
    // Primeiro, identificar que tipo de ID é usando SQL direto
    const identifyQuery = `
      SELECT 
        'perfil_gestor' as tipo, 
        pg.usuario_id as target_id
      FROM perfis_gestor pg WHERE pg.id = $1
      UNION ALL
      SELECT 
        'perfil_professor' as tipo, 
        pp.usuario_id as target_id
      FROM perfis_professor pp WHERE pp.id = $1
      UNION ALL
      SELECT 
        'usuario_direto' as tipo, 
        u.id as target_id
      FROM usuarios u WHERE u.id = $1
    `;
    
    const identifyResult = await executeQuery(identifyQuery, [id]);
    
    if (identifyResult.rows.length === 0) {
      return res.status(404).json({ message: "ID não encontrado em nenhuma tabela" });
    }
    
    const { tipo, target_id } = identifyResult.rows[0];
    console.log(`Tipo identificado: ${tipo}, Target ID: ${target_id}`);
    
    // Atualizar o usuário usando SQL direto
    const updateQuery = `
      UPDATE usuarios 
      SET nome = $1, email = $2, telefone = $3, cpf = $4, ativo = $5
      WHERE id = $6
      RETURNING id, nome, email, cpf, telefone, ativo, papel
    `;
    
    const updateResult = await executeQuery(updateQuery, [
      nome, email, telefone, cpf, ativo, target_id
    ]);
    
    if (updateResult.rows.length === 0) {
      return res.status(404).json({ message: "Usuário não encontrado para atualização" });
    }
    
    console.log('Usuário atualizado com sucesso:', updateResult.rows[0]);
    
    // Atualizar perfil correspondente se necessário
    if (tipo === 'perfil_professor') {
      const updatePerfilQuery = `UPDATE perfis_professor SET ativo = $1 WHERE id = $2`;
      await executeQuery(updatePerfilQuery, [ativo, id]);
      console.log('Perfil professor atualizado');
    } else if (tipo === 'perfil_gestor') {
      const updatePerfilQuery = `UPDATE perfis_gestor SET ativo = $1 WHERE id = $2`;
      await executeQuery(updatePerfilQuery, [ativo, id]);
      console.log('Perfil gestor atualizado');
    }
    
    res.json({
      success: true,
      message: "Usuário atualizado com sucesso",
      data: updateResult.rows[0]
    });

  } catch (error) {
    console.error('ERRO na atualização:', error);
    res.status(500).json({ 
      message: "Erro interno do servidor", 
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('=== INICIANDO EXCLUSÃO COM SQL DIRETO ===');
    console.log('ID recebido:', id);
    
    // Identificar que tipo de ID é usando SQL direto
    const identifyQuery = `
      SELECT 
        'perfil_gestor' as tipo, 
        pg.usuario_id as target_id
      FROM perfis_gestor pg WHERE pg.id = $1
      UNION ALL
      SELECT 
        'perfil_professor' as tipo, 
        pp.usuario_id as target_id
      FROM perfis_professor pp WHERE pp.id = $1
      UNION ALL
      SELECT 
        'usuario_direto' as tipo, 
        u.id as target_id
      FROM usuarios u WHERE u.id = $1
    `;
    
    const identifyResult = await executeQuery(identifyQuery, [id]);
    
    if (identifyResult.rows.length === 0) {
      return res.status(404).json({ message: "ID não encontrado em nenhuma tabela" });
    }
    
    const { tipo, target_id } = identifyResult.rows[0];
    console.log(`Tipo identificado: ${tipo}, Target ID: ${target_id}`);
    
    // Buscar dados do usuário antes da exclusão
    const userQuery = `SELECT id, nome, email, papel FROM usuarios WHERE id = $1`;
    const userResult = await executeQuery(userQuery, [target_id]);
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }
    
    const usuario = userResult.rows[0];
    console.log('Usuário encontrado para exclusão:', usuario);
    
    // Excluir perfil primeiro se necessário usando SQL direto
    if (tipo === 'perfil_professor') {
      const deletePerfilQuery = `DELETE FROM perfis_professor WHERE id = $1`;
      await executeQuery(deletePerfilQuery, [id]);
      console.log('Perfil professor excluído');
    } else if (tipo === 'perfil_gestor') {
      const deletePerfilQuery = `DELETE FROM perfis_gestor WHERE id = $1`;
      await executeQuery(deletePerfilQuery, [id]);
      console.log('Perfil gestor excluído');
    }
    
    // Excluir usuário da tabela usuarios
    const deleteUserQuery = `
      DELETE FROM usuarios 
      WHERE id = $1
      RETURNING id, nome, email, papel
    `;
    
    const deleteResult = await executeQuery(deleteUserQuery, [target_id]);
    
    if (deleteResult.rows.length === 0) {
      return res.status(404).json({ message: "Usuário não encontrado para exclusão" });
    }
    
    console.log('SUCESSO: Usuário excluído:', deleteResult.rows[0]);
    res.json({
      success: true,
      message: "Usuário excluído com sucesso",
      data: deleteResult.rows[0]
    });

  } catch (error) {
    console.error('ERRO na exclusão:', error);
    res.status(500).json({ 
      message: "Erro interno do servidor", 
      error: error instanceof Error ? error.message : 'Erro desconhecido'
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
