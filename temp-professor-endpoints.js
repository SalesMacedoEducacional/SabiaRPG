// Clean fictitious data endpoints for professor dashboard
const professorFicticiousEndpoints = `
  // Endpoints fictícios para o painel do professor
  app.get("/api/professor/turmas-detalhes", authenticate, authorize(["professor"]), async (req, res) => {
    const ficticiousData = {
      total: 3,
      turmas: [
        { id: 1, nome: "1º Ano – Manhã", periodo: "Manhã", alunos: 15 },
        { id: 2, nome: "2º Ano – Integral", periodo: "Integral", alunos: 18 },
        { id: 3, nome: "3º Ano – Vespertino", periodo: "Vespertino", alunos: 12 }
      ]
    };
    return res.status(200).json(ficticiousData);
  });

  app.get("/api/professor/componentes-detalhes", authenticate, authorize(["professor"]), async (req, res) => {
    const ficticiousData = {
      total: 4,
      componentes: [
        { id: 1, nome: "Linguagens", turmas: 3 },
        { id: 2, nome: "Matemática", turmas: 2 },
        { id: 3, nome: "Ciências", turmas: 3 },
        { id: 4, nome: "História", turmas: 1 }
      ]
    };
    return res.status(200).json(ficticiousData);
  });

  app.get("/api/professor/planos-detalhes", authenticate, authorize(["professor"]), async (req, res) => {
    const ficticiousData = {
      total: 5,
      planos: [
        { id: 1, titulo: "Interpretação de Textos", trimestre: "1º Tri", componente: "Linguagens" },
        { id: 2, titulo: "Equações do 1º Grau", trimestre: "1º Tri", componente: "Matemática" },
        { id: 3, titulo: "Sistema Solar", trimestre: "1º Tri", componente: "Ciências" },
        { id: 4, titulo: "Brasil Colonial", trimestre: "2º Tri", componente: "História" },
        { id: 5, titulo: "Figuras de Linguagem", trimestre: "2º Tri", componente: "Linguagens" }
      ],
      porTrimestre: {
        "1º Tri": 3,
        "2º Tri": 2,
        "3º Tri": 0
      }
    };
    return res.status(200).json(ficticiousData);
  });

  app.get("/api/professor/alunos-detalhes", authenticate, authorize(["professor"]), async (req, res) => {
    const ficticiousData = {
      total: 45,
      alunos: [
        { id: 1, nome: "João Silva", turma: "1º Ano – Manhã", xp: 1250 },
        { id: 2, nome: "Ana Beatriz", turma: "2º Ano – Integral", xp: 1100 },
        { id: 3, nome: "Pedro Maranhão", turma: "3º Ano – Vespertino", xp: 980 },
        { id: 4, nome: "Júlia Mendes", turma: "1º Ano – Manhã", xp: 870 },
        { id: 5, nome: "Lucas Tavares", turma: "2º Ano – Integral", xp: 760 }
      ]
    };
    return res.status(200).json(ficticiousData);
  });

  app.get("/api/professor/engajamento", authenticate, authorize(["professor"]), async (req, res) => {
    const ficticiousData = [
      { dia: "2025-05-01", acessos: 4 },
      { dia: "2025-05-05", acessos: 8 },
      { dia: "2025-05-10", acessos: 12 },
      { dia: "2025-05-15", acessos: 9 },
      { dia: "2025-05-20", acessos: 14 },
      { dia: "2025-05-25", acessos: 11 },
      { dia: "2025-05-30", acessos: 16 }
    ];
    return res.status(200).json(ficticiousData);
  });

  app.get("/api/professor/alunos-ativos", authenticate, authorize(["professor"]), async (req, res) => {
    const ficticiousData = {
      seteDias: 18,
      trintaDias: 37,
      detalhes: [
        { nome: "João Silva", ultimoAcesso: "2025-06-20", status: "ativo" },
        { nome: "Ana Beatriz", ultimoAcesso: "2025-06-19", status: "ativo" },
        { nome: "Pedro Maranhão", ultimoAcesso: "2025-06-20", status: "ativo" }
      ]
    };
    return res.status(200).json(ficticiousData);
  });

  app.get("/api/professor/alunos-risco", authenticate, authorize(["professor"]), async (req, res) => {
    const ficticiousData = {
      total: 5,
      alunos: [
        { nome: "Carlos Mendes", ultimoAcesso: "2025-06-10", diasInativo: 10 },
        { nome: "Maria Santos", ultimoAcesso: "2025-06-08", diasInativo: 12 },
        { nome: "Rafael Lima", ultimoAcesso: "2025-06-05", diasInativo: 15 }
      ]
    };
    return res.status(200).json(ficticiousData);
  });

  app.get("/api/professor/desempenho", authenticate, authorize(["professor"]), async (req, res) => {
    const ficticiousData = {
      taxaConclusao: {
        concluidas: 62,
        pendentes: 23,
        naoIniciadas: 15
      }
    };
    return res.status(200).json(ficticiousData);
  });

  app.get("/api/professor/ranking-xp", authenticate, authorize(["professor"]), async (req, res) => {
    const ficticiousData = [
      { nome: "João Silva", xp: 1250 },
      { nome: "Ana Beatriz", xp: 1100 },
      { nome: "Pedro Maranhão", xp: 980 },
      { nome: "Júlia Mendes", xp: 870 },
      { nome: "Lucas Tavares", xp: 760 }
    ];
    return res.status(200).json(ficticiousData);
  });

  app.get("/api/professor/progresso-componentes", authenticate, authorize(["professor"]), async (req, res) => {
    const ficticiousData = [
      { componente: "Linguagens e suas Tecnologias", media: 68 },
      { componente: "Matemática e suas Tecnologias", media: 54 },
      { componente: "Ciências da Natureza", media: 72 },
      { componente: "História", media: 47 }
    ];
    return res.status(200).json(ficticiousData);
  });

  app.get("/api/professor/evolucao-trimestral", authenticate, authorize(["professor"]), async (req, res) => {
    const ficticiousData = [
      { tri: "2025 Q1", media: 48 },
      { tri: "2025 Q2", media: 57 },
      { tri: "2025 Q3", media: 63 }
    ];
    return res.status(200).json(ficticiousData);
  });

  app.get("/api/professor/tempo-medio-missoes", authenticate, authorize(["professor"]), async (req, res) => {
    const ficticiousData = { tempoMedio: 12 };
    return res.status(200).json(ficticiousData);
  });

  app.get("/api/professor/atividades-futuras", authenticate, authorize(["professor"]), async (req, res) => {
    const ficticiousData = { 
      total: 4,
      atividades: [
        { titulo: "Prova de Matemática", data: "2025-06-25" },
        { titulo: "Trabalho de História", data: "2025-06-27" },
        { titulo: "Seminário de Ciências", data: "2025-06-29" },
        { titulo: "Redação de Linguagens", data: "2025-07-01" }
      ]
    };
    return res.status(200).json(ficticiousData);
  });

  app.get("/api/professor/conquistas-coletivas", authenticate, authorize(["professor"]), async (req, res) => {
    const ficticiousData = { totalXP: 320 };
    return res.status(200).json(ficticiousData);
  });

  app.get("/api/professor/login-trends", authenticate, authorize(["professor"]), async (req, res) => {
    const ficticiousData = [
      { dia: "2025-05-01", acessos: 4 },
      { dia: "2025-05-05", acessos: 8 },
      { dia: "2025-05-10", acessos: 12 },
      { dia: "2025-05-15", acessos: 9 },
      { dia: "2025-05-20", acessos: 14 },
      { dia: "2025-05-25", acessos: 11 },
      { dia: "2025-05-30", acessos: 16 }
    ];
    return res.status(200).json(ficticiousData);
  });

  app.get("/api/professor/relatorios", authenticate, authorize(["professor"]), async (req, res) => {
    const ficticiousData = {
      tempoMedioMissoes: 12,
      atividadesFuturas: 4,
      conquistasColetivas: 320
    };
    return res.status(200).json(ficticiousData);
  });
`;

module.exports = professorFicticiousEndpoints;