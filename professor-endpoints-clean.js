// ENDPOINTS LIMPOS COM DADOS FICTÍCIOS PARA O PROFESSOR
// Este arquivo substitui todos os endpoints problemáticos

const professorEndpoints = `
  // === DADOS FICTÍCIOS PARA PAINEL DO PROFESSOR ===
  
  // Turmas do professor
  app.get("/api/professor/turmas-detalhes", authenticate, authorize(["professor"]), async (req, res) => {
    const dados = {
      total: 3,
      turmas: [
        { id: 1, nome: "1º Ano – Manhã", periodo: "Manhã", alunos: 15 },
        { id: 2, nome: "2º Ano – Integral", periodo: "Integral", alunos: 18 },
        { id: 3, nome: "3º Ano – Vespertino", periodo: "Vespertino", alunos: 12 }
      ]
    };
    return res.status(200).json(dados);
  });

  // Componentes do professor
  app.get("/api/professor/componentes-detalhes", authenticate, authorize(["professor"]), async (req, res) => {
    const dados = {
      total: 4,
      componentes: [
        { id: 1, nome: "Linguagens", turmas: 3 },
        { id: 2, nome: "Matemática", turmas: 2 },
        { id: 3, nome: "Ciências", turmas: 3 },
        { id: 4, nome: "História", turmas: 1 }
      ]
    };
    return res.status(200).json(dados);
  });

  // Planos de aula
  app.get("/api/professor/planos-detalhes", authenticate, authorize(["professor"]), async (req, res) => {
    const dados = {
      total: 5,
      planos: [
        { id: 1, titulo: "Interpretação de Textos", trimestre: "1º Tri", componente: "Linguagens" },
        { id: 2, titulo: "Equações do 1º Grau", trimestre: "1º Tri", componente: "Matemática" },
        { id: 3, titulo: "Sistema Solar", trimestre: "1º Tri", componente: "Ciências" },
        { id: 4, titulo: "Brasil Colonial", trimestre: "2º Tri", componente: "História" },
        { id: 5, titulo: "Figuras de Linguagem", trimestre: "2º Tri", componente: "Linguagens" }
      ]
    };
    return res.status(200).json(dados);
  });

  // Detalhes dos alunos
  app.get("/api/professor/alunos-detalhes", authenticate, authorize(["professor"]), async (req, res) => {
    const dados = {
      total: 45,
      alunos: [
        { id: 1, nome: "João Silva", turma: "1º Ano – Manhã", xp: 1250 },
        { id: 2, nome: "Ana Beatriz", turma: "2º Ano – Integral", xp: 1100 },
        { id: 3, nome: "Pedro Maranhão", turma: "3º Ano – Vespertino", xp: 980 },
        { id: 4, nome: "Júlia Mendes", turma: "1º Ano – Manhã", xp: 870 },
        { id: 5, nome: "Lucas Tavares", turma: "2º Ano – Integral", xp: 760 }
      ]
    };
    return res.status(200).json(dados);
  });

  // Alunos ativos
  app.get("/api/professor/alunos-ativos", authenticate, authorize(["professor"]), async (req, res) => {
    const dados = {
      ultimos_7_dias: 18,
      ultimos_30_dias: 37
    };
    return res.status(200).json(dados);
  });

  // Alunos em risco
  app.get("/api/professor/alunos-risco", authenticate, authorize(["professor"]), async (req, res) => {
    const dados = [
      { nome: "Carlos Mendes", ultimo_acesso: "2025-06-10", status: "Em Risco" },
      { nome: "Maria Santos", ultimo_acesso: "2025-06-08", status: "Em Risco" },
      { nome: "Rafael Lima", ultimo_acesso: "2025-06-05", status: "Em Risco" }
    ];
    return res.status(200).json(dados);
  });

  // Dados de desempenho (62% / 23% / 15%)
  app.get("/api/professor/desempenho", authenticate, authorize(["professor"]), async (req, res) => {
    const dados = {
      concluidas_pct: 62.0,
      pendentes_pct: 23.0,
      nao_iniciadas_pct: 15.0
    };
    return res.status(200).json(dados);
  });

  // Ranking XP com João Silva em primeiro
  app.get("/api/professor/ranking-xp", authenticate, authorize(["professor"]), async (req, res) => {
    const dados = [
      { nome: "João Silva", xp: 1250 },
      { nome: "Ana Beatriz", xp: 1100 },
      { nome: "Pedro Maranhão", xp: 980 },
      { nome: "Júlia Mendes", xp: 870 },
      { nome: "Lucas Tavares", xp: 760 }
    ];
    return res.status(200).json(dados);
  });

  // Progresso por componentes
  app.get("/api/professor/progresso-componentes", authenticate, authorize(["professor"]), async (req, res) => {
    const dados = [
      { componente: "Ciências da Natureza", media: 72 },
      { componente: "Linguagens e suas Tecnologias", media: 68 },
      { componente: "Matemática e suas Tecnologias", media: 54 },
      { componente: "História", media: 47 }
    ];
    return res.status(200).json(dados);
  });

  // Evolução trimestral
  app.get("/api/professor/evolucao-trimestral", authenticate, authorize(["professor"]), async (req, res) => {
    const dados = [
      { trimestre: "1º Trimestre", conclusao_pct: 48.0 },
      { trimestre: "2º Trimestre", conclusao_pct: 57.0 },
      { trimestre: "3º Trimestre", conclusao_pct: 63.0 }
    ];
    return res.status(200).json(dados);
  });

  // Engajamento (gráfico de linha)
  app.get("/api/professor/engajamento", authenticate, authorize(["professor"]), async (req, res) => {
    const dados = [
      { dia: "2025-05-01", acessos: 4 },
      { dia: "2025-05-05", acessos: 8 },
      { dia: "2025-05-10", acessos: 12 },
      { dia: "2025-05-15", acessos: 9 },
      { dia: "2025-05-20", acessos: 14 },
      { dia: "2025-05-25", acessos: 11 },
      { dia: "2025-05-30", acessos: 16 }
    ];
    return res.status(200).json(dados);
  });

  // Tempo médio de missões
  app.get("/api/professor/tempo-medio-missoes", authenticate, authorize(["professor"]), async (req, res) => {
    const dados = { tempo_medio: 12 };
    return res.status(200).json(dados);
  });

  // Atividades futuras
  app.get("/api/professor/atividades-futuras", authenticate, authorize(["professor"]), async (req, res) => {
    const dados = [
      { titulo: "Prova de Matemática", data: "2025-06-25" },
      { titulo: "Trabalho de História", data: "2025-06-27" },
      { titulo: "Seminário de Ciências", data: "2025-06-29" },
      { titulo: "Redação de Linguagens", data: "2025-07-01" }
    ];
    return res.status(200).json(dados);
  });

  // Conquistas coletivas
  app.get("/api/professor/conquistas-coletivas", authenticate, authorize(["professor"]), async (req, res) => {
    const dados = { total_xp: 320 };
    return res.status(200).json(dados);
  });

  // Relatórios consolidados
  app.get("/api/professor/relatorios", authenticate, authorize(["professor"]), async (req, res) => {
    const dados = {
      tempo_medio_missoes: 12,
      atividades_futuras: 4,
      conquistas_coletivas: 320
    };
    return res.status(200).json(dados);
  });
`;

module.exports = professorEndpoints;