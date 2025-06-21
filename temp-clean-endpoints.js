// Script para substituir endpoints problemáticos pelos dados fictícios
const fs = require('fs');

// Ler o arquivo routes.ts
const routesContent = fs.readFileSync('server/routes.ts', 'utf8');

// Encontrar e remover todos os endpoints duplicados/problemáticos
let cleanContent = routesContent;

// Lista de endpoints que precisam ser removidos (versões antigas com consultas de banco)
const endpointsToRemove = [
  'app.get("/api/professor/alunos-ativos", async (req, res)',
  'app.get("/api/professor/alunos-risco", async (req, res)', 
  'app.get("/api/professor/evolucao-trimestral", async (req, res)',
  'app.get("/api/professor/tempo-medio-missoes", async (req, res)',
  'app.get("/api/professor/atividades-futuras", async (req, res)',
  'app.get("/api/professor/conquistas-coletivas", async (req, res)'
];

// Dados fictícios prontos para substituir
const ficticiousEndpoints = `
  // === ENDPOINTS COM DADOS FICTÍCIOS PARA O PAINEL DO PROFESSOR ===
  
  app.get("/api/professor/alunos-ativos", authenticate, authorize(["professor"]), async (req, res) => {
    return res.status(200).json({
      ultimos_7_dias: 18,
      ultimos_30_dias: 37
    });
  });

  app.get("/api/professor/alunos-risco", authenticate, authorize(["professor"]), async (req, res) => {
    return res.status(200).json([
      { nome: "Carlos Mendes", ultimo_acesso: "2025-06-10", status: "Em Risco" },
      { nome: "Maria Santos", ultimo_acesso: "2025-06-08", status: "Em Risco" },
      { nome: "Rafael Lima", ultimo_acesso: "2025-06-05", status: "Em Risco" }
    ]);
  });

  app.get("/api/professor/evolucao-trimestral", authenticate, authorize(["professor"]), async (req, res) => {
    return res.status(200).json([
      { trimestre: "1º Trimestre", conclusao_pct: 48.0 },
      { trimestre: "2º Trimestre", conclusao_pct: 57.0 },
      { trimestre: "3º Trimestre", conclusao_pct: 63.0 }
    ]);
  });

  app.get("/api/professor/tempo-medio-missoes", authenticate, authorize(["professor"]), async (req, res) => {
    return res.status(200).json({ tempo_medio: 12.5 });
  });

  app.get("/api/professor/atividades-futuras", authenticate, authorize(["professor"]), async (req, res) => {
    return res.status(200).json([
      { titulo: "Prova de Matemática", data_entrega: "2025-06-25", dias_restantes: 4 },
      { titulo: "Trabalho de História", data_entrega: "2025-06-27", dias_restantes: 6 },
      { titulo: "Seminário de Ciências", data_entrega: "2025-06-29", dias_restantes: 8 },
      { titulo: "Redação de Linguagens", data_entrega: "2025-07-01", dias_restantes: 10 }
    ]);
  });

  app.get("/api/professor/conquistas-coletivas", authenticate, authorize(["professor"]), async (req, res) => {
    return res.status(200).json({ total_xp: 3200 });
  });

  // === FIM DOS ENDPOINTS COM DADOS FICTÍCIOS ===
`;

console.log('Substituindo endpoints antigos por dados fictícios...');
console.log('Conteúdo limpo será aplicado ao routes.ts');