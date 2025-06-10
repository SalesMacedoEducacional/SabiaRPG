import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import session from 'express-session';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Import supabase for direct API routes
import { supabase } from '../db/supabase.js';

// Direct API routes without authentication (placed before all middleware)
app.get('/api/users/manager', async (req, res) => {
  try {
    console.log('=== BUSCANDO USUÁRIOS (DIRETO) ===');
    
    const { data: usuarios, error } = await supabase
      .from('usuarios')
      .select('id, nome, email, cpf, papel, telefone, ativo, criado_em')
      .order('criado_em', { ascending: false });

    if (error) {
      console.error('Erro ao buscar usuários:', error);
      return res.status(500).json({ message: "Erro ao buscar usuários" });
    }

    console.log(`Usuários encontrados: ${usuarios?.length || 0}`);
    
    const usuariosFormatados = usuarios?.map(user => ({
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
    console.error('Erro crítico:', error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    console.log(`Atualizando usuário ${id}:`, updateData);

    // Filtrar apenas campos que existem na tabela usuarios
    const allowedFields = {
      nome: updateData.nome,
      email: updateData.email,
      telefone: updateData.telefone,
      cpf: updateData.cpf,
      ativo: updateData.ativo
    };

    // Remover campos undefined
    Object.keys(allowedFields).forEach(key => {
      if (allowedFields[key] === undefined) {
        delete allowedFields[key];
      }
    });

    const { data, error } = await supabase
      .from('usuarios')
      .update(allowedFields)
      .eq('id', id)
      .select();

    if (error) {
      console.error('Erro ao atualizar:', error);
      return res.status(500).json({ message: "Erro ao atualizar usuário" });
    }

    console.log('Dados atualizados no banco:', data);
    
    if (!data || data.length === 0) {
      console.log('Nenhum registro foi atualizado - ID não encontrado:', id);
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    res.json({ success: true, message: "Usuário atualizado com sucesso", data: data[0] });
  } catch (error) {
    console.error('Erro na atualização:', error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`Excluindo usuário ${id}`);

    // Excluir perfis relacionados primeiro
    await supabase.from('perfis_aluno').delete().eq('usuario_id', id);
    await supabase.from('perfis_professor').delete().eq('usuario_id', id);
    await supabase.from('perfis_gestor').delete().eq('usuario_id', id);

    const { error } = await supabase
      .from('usuarios')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao excluir:', error);
      return res.status(500).json({ message: "Erro ao excluir usuário" });
    }

    res.json({ success: true, message: "Usuário excluído com sucesso" });
  } catch (error) {
    console.error('Erro na exclusão:', error);
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
