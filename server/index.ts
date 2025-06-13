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
      
        // Buscar ID da tabela de perfil usando SQL direto para professor e gestor
      if (user.papel === 'professor') {
        try {
          const queryPerfil = 'SELECT id FROM perfis_professor WHERE usuario_id = $1';
          const resultPerfil = await executeQuery(queryPerfil, [user.id]);
          if (resultPerfil.rows.length > 0) {
            perfilId = resultPerfil.rows[0].id;
            tabelaPerfil = 'perfis_professor';
            console.log(`Usuário ${user.nome} - ID perfil professor: ${perfilId}`);
          }
        } catch (error) {
          console.log(`Erro ao buscar perfil professor para ${user.nome}:`, error);
        }
      } else if (user.papel === 'gestor') {
        try {
          const queryPerfil = 'SELECT id FROM perfis_gestor WHERE usuario_id = $1';
          const resultPerfil = await executeQuery(queryPerfil, [user.id]);
          if (resultPerfil.rows.length > 0) {
            perfilId = resultPerfil.rows[0].id;
            tabelaPerfil = 'perfis_gestor';
            console.log(`Usuário ${user.nome} - ID perfil gestor: ${perfilId}`);
          }
        } catch (error) {
          console.log(`Erro ao buscar perfil gestor para ${user.nome}:`, error);
        }
      } else if (user.papel === 'aluno') {
        // Para alunos, usar Supabase já que perfis_aluno só existe no Supabase
        try {
          const { data: perfil } = await supabase
            .from('perfis_aluno')
            .select('id')
            .eq('usuario_id', user.id)
            .single();
          if (perfil) {
            perfilId = perfil.id;
            tabelaPerfil = 'perfis_aluno';
            console.log(`Usuário ${user.nome} - ID perfil aluno: ${perfilId}`);
          }
        } catch (error) {
          console.log(`Erro ao buscar perfil aluno para ${user.nome}:`, error);
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

// API de teste para validar IDs de perfil com query direta
app.get('/api/test-perfil/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('=== TESTANDO ID DE PERFIL COM SQL DIRETO ===');
    console.log('ID recebido:', id);
    
    // Testar com SQL direto primeiro
    const testQuery = `
      SELECT 'perfil_gestor' as tipo, id::text, usuario_id::text 
      FROM perfis_gestor WHERE id = $1
      UNION ALL
      SELECT 'perfil_professor' as tipo, id::text, usuario_id::text 
      FROM perfis_professor WHERE id = $1
    `;
    
    const result = await executeQuery(testQuery, [id]);
    
    if (result.rows.length > 0) {
      console.log('Perfil encontrado via SQL:', result.rows[0]);
      return res.json({
        tipo: result.rows[0].tipo,
        id: result.rows[0].id,
        usuario_id: result.rows[0].usuario_id
      });
    }
    
    // Testar também com Supabase para perfis_aluno
    const { data: alunoData } = await supabase
      .from('perfis_aluno')
      .select('id, usuario_id')
      .eq('id', id)
      .single();
    
    if (alunoData) {
      console.log('Perfil aluno encontrado via Supabase:', alunoData);
      return res.json({
        tipo: 'perfil_aluno',
        perfil: alunoData
      });
    }
    
    console.log('ID não encontrado em nenhuma tabela de perfil');
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
    
    console.log('=== INICIANDO ATUALIZAÇÃO COM SUPABASE ===');
    console.log('ID recebido:', id);
    console.log('Dados para atualizar:', { nome, email, telefone, cpf, ativo });
    
    // Usar SQL direto para identificar tipo de ID
    const identificarQuery = `
      SELECT 'perfil_gestor' as tipo, usuario_id::text
      FROM perfis_gestor WHERE id = $1
      UNION ALL
      SELECT 'perfil_professor' as tipo, usuario_id::text
      FROM perfis_professor WHERE id = $1
    `;
    
    const identificarResult = await executeQuery(identificarQuery, [id]);
    
    let usuarioId = null;
    let tipoTabela = null;
    
    if (identificarResult.rows.length > 0) {
      usuarioId = identificarResult.rows[0].usuario_id;
      tipoTabela = identificarResult.rows[0].tipo;
      console.log(`Perfil encontrado via SQL: ${tipoTabela}, Usuario ID: ${usuarioId}`);
    } else {
      // Verificar perfil_aluno usando Supabase
      const { data: perfilAluno } = await supabase
        .from('perfis_aluno')
        .select('usuario_id')
        .eq('id', id)
        .single();
      
      if (perfilAluno) {
        usuarioId = perfilAluno.usuario_id;
        tipoTabela = 'perfil_aluno';
        console.log(`Perfil aluno encontrado: Usuario ID: ${usuarioId}`);
      } else {
        // É ID de usuário direto
        usuarioId = id;
        tipoTabela = 'usuario_direto';
        console.log(`ID é de usuário direto: ${usuarioId}`);
      }
    }
    
    // Atualizar usuário usando Supabase (dados reais)
    const { data: usuarioAtualizado, error: updateError } = await supabase
      .from('usuarios')
      .update({ nome, email, telefone, cpf, ativo })
      .eq('id', usuarioId)
      .select()
      .single();
    
    if (updateError || !usuarioAtualizado) {
      console.error('Erro ao atualizar usuário:', updateError);
      return res.status(404).json({ message: "Usuário não encontrado para atualização" });
    }
    
    console.log('Usuário atualizado com sucesso:', usuarioAtualizado);
    
    // Atualizar perfil correspondente usando SQL direto
    if (tipoTabela === 'perfil_professor') {
      const updatePerfilQuery = `UPDATE perfis_professor SET ativo = $1 WHERE id = $2`;
      await executeQuery(updatePerfilQuery, [ativo, id]);
      console.log('Perfil professor atualizado');
    } else if (tipoTabela === 'perfil_gestor') {
      const updatePerfilQuery = `UPDATE perfis_gestor SET ativo = $1 WHERE id = $2`;
      await executeQuery(updatePerfilQuery, [ativo, id]);
      console.log('Perfil gestor atualizado');
    } else if (tipoTabela === 'perfil_aluno') {
      await supabase.from('perfis_aluno').update({ ativo }).eq('id', id);
      console.log('Perfil aluno atualizado');
    }
    
    res.json({
      success: true,
      message: "Usuário atualizado com sucesso",
      data: usuarioAtualizado
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
    
    // Usar SQL direto para identificar tipo de ID
    const identificarQuery = `
      SELECT 'perfil_gestor' as tipo, usuario_id::text
      FROM perfis_gestor WHERE id = $1
      UNION ALL
      SELECT 'perfil_professor' as tipo, usuario_id::text
      FROM perfis_professor WHERE id = $1
    `;
    
    const identificarResult = await executeQuery(identificarQuery, [id]);
    
    let usuarioId = null;
    let tipoTabela = null;
    
    if (identificarResult.rows.length > 0) {
      usuarioId = identificarResult.rows[0].usuario_id;
      tipoTabela = identificarResult.rows[0].tipo;
      console.log(`Perfil encontrado via SQL: ${tipoTabela}, Usuario ID: ${usuarioId}`);
    } else {
      // Verificar perfil_aluno usando Supabase
      const { data: perfilAluno } = await supabase
        .from('perfis_aluno')
        .select('usuario_id')
        .eq('id', id)
        .single();
      
      if (perfilAluno) {
        usuarioId = perfilAluno.usuario_id;
        tipoTabela = 'perfil_aluno';
        console.log(`Perfil aluno encontrado: Usuario ID: ${usuarioId}`);
      } else {
        // É ID de usuário direto
        usuarioId = id;
        tipoTabela = 'usuario_direto';
        console.log(`ID é de usuário direto: ${usuarioId}`);
      }
    }
    
    // Buscar dados do usuário antes da exclusão usando Supabase
    const { data: usuario, error: userError } = await supabase
      .from('usuarios')
      .select('id, nome, email, papel')
      .eq('id', usuarioId)
      .single();
    
    if (userError || !usuario) {
      console.error('Usuário não encontrado:', userError);
      return res.status(404).json({ message: "Usuário não encontrado" });
    }
    
    console.log('Usuário encontrado para exclusão:', usuario);
    
    // Excluir perfil primeiro usando SQL direto
    if (tipoTabela === 'perfil_professor') {
      const deletePerfilQuery = `DELETE FROM perfis_professor WHERE id = $1`;
      await executeQuery(deletePerfilQuery, [id]);
      console.log('Perfil professor excluído');
    } else if (tipoTabela === 'perfil_gestor') {
      const deletePerfilQuery = `DELETE FROM perfis_gestor WHERE id = $1`;
      await executeQuery(deletePerfilQuery, [id]);
      console.log('Perfil gestor excluído');
    } else if (tipoTabela === 'perfil_aluno') {
      await supabase.from('perfis_aluno').delete().eq('id', id);
      console.log('Perfil aluno excluído');
    }
    
    // Excluir usuário usando Supabase
    const { data: usuarioExcluido, error: deleteError } = await supabase
      .from('usuarios')
      .delete()
      .eq('id', usuarioId)
      .select()
      .single();
    
    if (deleteError || !usuarioExcluido) {
      console.error('Erro ao excluir usuário:', deleteError);
      return res.status(500).json({ message: "Erro ao excluir usuário" });
    }
    
    console.log('SUCESSO: Usuário excluído:', usuarioExcluido);
    res.json({
      success: true,
      message: "Usuário excluído com sucesso",
      data: usuarioExcluido
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
