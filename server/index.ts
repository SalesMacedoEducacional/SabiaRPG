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
      INSERT INTO usuarios (nome, email, telefone, cpf, papel, ativo, senha_hash, criado_em, atualizado_em)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      RETURNING id, nome, email, cpf, telefone, papel, ativo
    `;
    
    const result = await executeQuery(query, [nome, email, telefone, cpf, papel, ativo, senhaTemporaria]);
    
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
