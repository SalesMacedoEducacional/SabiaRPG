import { Express, Request, Response } from "express";
import { storage } from "./storage";
import { supabase } from "../db/supabase.js";
import { z } from "zod";
import './types';

// Esquema para validação dos parâmetros de geração de relatório
const reportRequestSchema = z.object({
  tipo: z.enum(["turma", "escola", "geral"]),
  escola_id: z.string().optional(),
  turma_id: z.string().optional(),
  periodo: z.enum(["bimestral", "trimestral", "semestral", "anual"]),
  metricas: z.array(z.enum(["desempenho", "missoes", "trilhas", "engajamento"])),
  formato: z.enum(["pdf", "xlsx", "ods", "csv"])
});

/**
 * Registra todas as rotas específicas para o perfil de Gestor Escolar
 * @param app Express application
 * @param authenticate Middleware de autenticação
 * @param requireRole Middleware de verificação de papel
 */
export function registerManagerRoutes(
  app: Express, 
  authenticate: (req: Request, res: Response, next: Function) => void,
  requireRole: (roles: string[]) => (req: Request, res: Response, next: Function) => Promise<void>
) {
  // Rota para obter as estatísticas do Dashboard do Gestor
  app.get(
    '/api/manager/dashboard-stats',
    authenticate,
    requireRole(['manager']),
    async (req: Request, res: Response) => {
      try {
        const userId = req.session.userId;
        const schoolId = req.session.escola_id;
        
        console.log(`Obtendo estatísticas para o gestor ${userId}, escola ${schoolId}`);
        
        // Verificar se o gestor tem uma escola vinculada
        if (!schoolId) {
          return res.status(404).json({ message: 'Nenhuma escola vinculada a este gestor' });
        }
        
        // Obter estatísticas da escola
        // Estrutura para o retorno
        type SchoolStats = {
          totalSchools: number;          // Total de escolas vinculadas ao gestor
          totalTeachers: number;         // Total de professores na escola
          totalStudents: number;         // Total de alunos matriculados
          activeClasses: number;         // Total de turmas ativas
          activeStudents7Days: number;   // Alunos ativos nos últimos 7 dias
          activeStudents30Days: number;  // Alunos ativos nos últimos 30 dias
          potentialEvasion: number;      // Alunos com mais de 10 dias sem acesso
          engagementLevel: number;       // Nível de engajamento geral (%)
          missionsInProgress: number;    // Missões em andamento
          missionsCompleted: number;     // Missões concluídas
          missionsPending: number;       // Missões pendentes
        };
        
        // Para ambiente de teste ou desenvolvimento com usuário de teste
        if (String(userId) === '1003') { // ID do usuário gestor de teste
          const mockStats: SchoolStats = {
            totalSchools: 3,
            totalTeachers: 105,
            totalStudents: 1990,
            activeClasses: 24,
            activeStudents7Days: 487,
            activeStudents30Days: 1248,
            potentialEvasion: 38,
            engagementLevel: 72,
            missionsInProgress: 149,
            missionsCompleted: 263,
            missionsPending: 92
          };
          
          // Top escolas com maior engajamento
          const topSchools = [
            {
              id: 's1',
              name: 'Escola Municipal Pedro II',
              teachers: 35,
              students: 630,
              engagementRate: 74
            },
            {
              id: 's2',
              name: 'Escola Estadual Dom Pedro I',
              teachers: 42,
              students: 820,
              engagementRate: 63
            },
            {
              id: 's3',
              name: 'CETI Zacarias de Góis',
              teachers: 28,
              students: 540,
              engagementRate: 58
            }
          ];
          
          // Atividades recentes
          const recentActivities = [
            {
              id: 'act1',
              type: 'report',
              title: 'Novo relatório gerado',
              description: 'Relatório bimestral da Escola Municipal Pedro II',
              date: new Date(Date.now() - 3600000).toISOString(), // 1 hora atrás
              user: 'Gestor de Teste'
            },
            {
              id: 'act2',
              type: 'user',
              title: 'Novos usuários cadastrados',
              description: '12 alunos adicionados à plataforma',
              date: new Date(Date.now() - 21600000).toISOString(), // 6 horas atrás
              user: 'Coordenador Silva'
            },
            {
              id: 'act3',
              type: 'class',
              title: 'Nova turma criada',
              description: 'Turma 9º ano C adicionada',
              date: new Date(Date.now() - 86400000).toISOString(), // 1 dia atrás
              user: 'Gestor de Teste'
            }
          ];
          
          return res.status(200).json({
            stats: mockStats,
            topSchools,
            recentActivities
          });
        }
        
        // Consultar dados reais no Supabase
        try {
          // Tentar obter escola do gestor
          const { data: schoolData, error: schoolError } = await supabase
            .from('escolas')
            .select('*')
            .eq('id', schoolId)
            .single();
            
          if (schoolError) {
            console.error('Erro ao obter dados da escola:', schoolError);
            throw schoolError;
          }
          
          // Contar professores da escola
          const { count: teacherCount, error: teacherError } = await supabase
            .from('usuarios')
            .select('*', { count: 'exact', head: true })
            .eq('escola_id', schoolId)
            .eq('papel', 'professor');
            
          // Contar alunos da escola
          const { count: studentCount, error: studentError } = await supabase
            .from('usuarios')
            .select('*', { count: 'exact', head: true })
            .eq('escola_id', schoolId)
            .eq('papel', 'aluno');
          
          // Montar objeto de resposta
          const stats: Partial<SchoolStats> = {
            totalSchools: 1, // Gestor está associado a uma escola
            totalTeachers: teacherCount || 0,
            totalStudents: studentCount || 0,
            activeClasses: 0, // Será implementado quando a tabela de turmas estiver disponível
            activeStudents7Days: 0, // Será preenchido com dados reais quando disponíveis
            activeStudents30Days: 0,
            potentialEvasion: 0,
            engagementLevel: 0,
            missionsInProgress: 0,
            missionsCompleted: 0,
            missionsPending: 0
          };
          
          return res.status(200).json({
            stats,
            topSchools: [],
            recentActivities: []
          });
          
        } catch (dbError) {
          console.error('Erro ao consultar dados reais:', dbError);
          return res.status(500).json({ message: 'Erro ao consultar dados da escola' });
        }
        
      } catch (error) {
        console.error('Erro ao obter estatísticas do dashboard:', error);
        return res.status(500).json({ message: 'Erro ao obter estatísticas do dashboard' });
      }
    }
  );
  // Obter lista de todas as escolas
  app.get("/api/schools", authenticate, requireRole(["manager", "admin"]), async (req, res) => {
    try {
      // Simular busca de escolas (na implementação real, isto viria do banco de dados)
      const schools = [
        {
          id: "s1",
          name: "Escola Municipal Pedro II",
          code: "EM-001",
          teachers: 35,
          students: 650,
          active: true
        },
        {
          id: "s2",
          name: "Escola Estadual Dom Pedro I",
          code: "EE-022",
          teachers: 42,
          students: 820,
          active: true
        },
        {
          id: "s3",
          name: "Centro Educacional Maria José",
          code: "CE-045",
          teachers: 28,
          students: 520,
          active: false
        }
      ];
      
      res.status(200).json(schools);
    } catch (error) {
      console.error("Error fetching schools:", error);
      res.status(500).json({ message: "Error fetching schools" });
    }
  });
  
  // Obter detalhes de uma escola específica
  app.get("/api/schools/:id", authenticate, requireRole(["manager", "admin"]), async (req, res) => {
    try {
      const schoolId = req.params.id;
      
      // Simular busca de escola (na implementação real, isto viria do banco de dados)
      type SchoolDetails = {
        id: string;
        name: string;
        code: string;
        address: string;
        phone: string;
        email: string;
        director: string;
        coordinators: string[];
        teachers: number;
        students: number;
        classes: number;
        active: boolean;
        createdAt: string;
      };
      
      const schools: Record<string, SchoolDetails> = {
        "s1": {
          id: "s1",
          name: "Escola Municipal Pedro II",
          code: "EM-001",
          address: "Rua das Palmeiras, 123",
          phone: "(86) 3222-1234",
          email: "contato@escolapedro2.edu.br",
          director: "Maria Oliveira",
          coordinators: ["João Silva", "Ana Souza"],
          teachers: 35,
          students: 650,
          classes: 18,
          active: true,
          createdAt: "2022-03-15"
        },
        "s2": {
          id: "s2",
          name: "Escola Estadual Dom Pedro I",
          code: "EE-022",
          address: "Av. Principal, 500",
          phone: "(86) 3222-5678",
          email: "contato@dompedro1.edu.br",
          director: "Roberto Santos",
          coordinators: ["Carla Lima", "Paulo Mendes"],
          teachers: 42,
          students: 820,
          classes: 23,
          active: true,
          createdAt: "2021-08-10"
        },
        "s3": {
          id: "s3",
          name: "Centro Educacional Maria José",
          code: "CE-045",
          address: "Rua das Flores, 200",
          phone: "(86) 3222-9012",
          email: "contato@mariajose.edu.br",
          director: "Antonio Ferreira",
          coordinators: ["Lucia Costa"],
          teachers: 28,
          students: 520,
          classes: 15,
          active: false,
          createdAt: "2020-02-28"
        }
      };
      
      const school = schools[schoolId];
      
      if (!school) {
        return res.status(404).json({ message: "School not found" });
      }
      
      res.status(200).json(school);
    } catch (error) {
      console.error("Error fetching school:", error);
      res.status(500).json({ message: "Error fetching school details" });
    }
  });
  
  // Criar uma nova escola
  app.post("/api/schools", authenticate, requireRole(["manager", "admin"]), async (req, res) => {
    try {
      const schoolData = req.body;
      
      // Validação básica
      if (!schoolData.nome || !schoolData.codigo_escola) {
        return res.status(400).json({ 
          message: "Nome e código da escola são obrigatórios" 
        });
      }
      
      // Simular criação (na implementação real, isto seria salvo no banco de dados)
      const newSchool = {
        id: `s${Date.now()}`,
        ...schoolData,
        teachers: 0,
        students: 0,
        active: true,
        createdAt: new Date().toISOString()
      };
      
      res.status(201).json(newSchool);
    } catch (error) {
      console.error("Error creating school:", error);
      res.status(500).json({ message: "Error creating school" });
    }
  });
  
  // Atualizar uma escola existente
  app.patch("/api/schools/:id", authenticate, requireRole(["manager", "admin"]), async (req, res) => {
    try {
      const schoolId = req.params.id;
      const schoolData = req.body;
      
      // Simular atualização (na implementação real, isto seria atualizado no banco de dados)
      res.status(200).json({
        id: schoolId,
        ...schoolData,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error updating school:", error);
      res.status(500).json({ message: "Error updating school" });
    }
  });
  
  // Obter relatórios para gestores
  app.get(
    "/api/reports", 
    authenticate, 
    requireRole(["manager", "admin"]), 
    async (req: Request, res: Response) => {
      try {
        const userId = req.session.userId;
        const schoolId = req.session.escola_id;
        const reportType = req.query.type as string;
        
        // Para o usuário de teste, simular relatórios
        if (String(userId) === '1003') {
          const mockReports = [
            { 
              id: 'r1', 
              title: 'Desempenho Escolar 2023', 
              type: 'school', 
              date: '20/04/2023',
              downloadUrl: '#',
              escola_id: schoolId
            },
            { 
              id: 'r2', 
              title: 'Relatório de Turmas - 1º Bimestre', 
              type: 'class', 
              date: '15/03/2023',
              downloadUrl: '#',
              escola_id: schoolId
            },
            { 
              id: 'r3', 
              title: 'Engajamento de Alunos', 
              type: 'school', 
              date: '10/05/2023',
              downloadUrl: '#',
              escola_id: schoolId
            },
          ];
          
          // Filtrar por tipo se especificado
          const filteredReports = reportType 
            ? mockReports.filter(report => report.type === reportType)
            : mockReports;
          
          return res.status(200).json(filteredReports);
        }
        
        // Consultar relatórios no banco de dados
        try {
          // Buscar do banco de dados para escola específica
          const { data: reports, error: reportsError } = await supabase
            .from('relatorios')
            .select('*')
            .eq('escola_id', schoolId)
            .order('data_geracao', { ascending: false });
            
          if (reportsError) {
            console.error('Erro ao consultar relatórios:', reportsError);
            return res.status(500).json({ message: 'Erro ao consultar relatórios' });
          }
          
          // Filtrar por tipo se especificado
          const filteredReports = reportType && reports 
            ? reports.filter(report => report.tipo === reportType)
            : reports;
          
          return res.status(200).json(filteredReports || []);
        } catch (dbError) {
          console.error('Erro ao buscar relatórios:', dbError);
          return res.status(500).json({ message: 'Erro ao buscar relatórios' });
        }
        
      } catch (error) {
        console.error("Error fetching reports:", error);
        res.status(500).json({ message: "Error fetching reports" });
      }
    }
  );
  
  // Gerar um novo relatório
  app.post(
    "/api/reports/generate", 
    authenticate, 
    requireRole(["manager", "admin"]), 
    async (req: Request, res: Response) => {
      try {
        const userId = req.session.userId;
        const schoolId = req.session.escola_id;
        
        // Validar dados da requisição
        const validationResult = reportRequestSchema.safeParse(req.body);
        if (!validationResult.success) {
          return res.status(400).json({ 
            message: 'Dados inválidos',
            errors: validationResult.error.format()
          });
        }
        
        const reportData = validationResult.data;
        
        // Verificar se o gestor tem permissão para gerar relatório para esta escola
        if (reportData.escola_id && reportData.escola_id !== schoolId) {
          return res.status(403).json({ message: 'Sem permissão para gerar relatório para esta escola' });
        }
        
        // Para o usuário de teste, simular geração de relatório
        if (String(userId) === '1003') {
          const newReportId = `r${Date.now()}`;
          const mockReport = {
            id: newReportId,
            titulo: `Relatório de ${reportData.tipo} - ${new Date().toLocaleDateString('pt-BR')}`,
            tipo: reportData.tipo,
            escola_id: reportData.escola_id || schoolId,
            turma_id: reportData.turma_id,
            periodo: reportData.periodo,
            metricas: reportData.metricas,
            formato: reportData.formato,
            url_arquivo: `https://example.com/reports/${newReportId}.${reportData.formato}`,
            usuario_id: userId,
            data_geracao: new Date().toISOString()
          };
          
          return res.status(201).json(mockReport);
        }
        
        // Salvar solicitação de relatório no banco
        try {
          const { data: newReport, error: reportError } = await supabase
            .from('relatorios')
            .insert({
              titulo: `Relatório de ${reportData.tipo} - ${new Date().toLocaleDateString('pt-BR')}`,
              tipo: reportData.tipo,
              escola_id: reportData.escola_id || schoolId,
              turma_id: reportData.turma_id,
              periodo: reportData.periodo,
              metricas: reportData.metricas,
              formato: reportData.formato,
              usuario_id: userId
            })
            .select()
            .single();
            
          if (reportError) {
            console.error('Erro ao salvar solicitação de relatório:', reportError);
            return res.status(500).json({ message: 'Erro ao gerar relatório' });
          }
          
          return res.status(201).json(newReport);
        } catch (dbError) {
          console.error('Erro ao gerar relatório:', dbError);
          return res.status(500).json({ message: 'Erro ao salvar relatório no banco de dados' });
        }
      } catch (error) {
        console.error("Error generating report:", error);
        res.status(500).json({ message: "Error generating report" });
      }
    }
  );
  
  // Rota para obter estatísticas de evasão (alunos com mais de 10 dias sem acesso)
  app.get(
    '/api/manager/evasion-alert',
    authenticate,
    requireRole(['manager']),
    async (req: Request, res: Response) => {
      try {
        const userId = req.session.userId;
        const schoolId = req.session.escola_id;
        
        // Verificar se o gestor tem uma escola vinculada
        if (!schoolId) {
          return res.status(404).json({ message: 'Nenhuma escola vinculada a este gestor' });
        }
        
        // Para usuário de teste, retornar dados simulados
        if (String(userId) === '1003') {
          const mockEvasionData = {
            totalStudents: 38,
            percentage: 5.3, // % do total de alunos
            details: [
              { id: 'a1', name: 'João Silva', class: '9º A', lastAccess: '2023-11-01', daysInactive: 15 },
              { id: 'a2', name: 'Maria Oliveira', class: '8º C', lastAccess: '2023-11-03', daysInactive: 13 },
              { id: 'a3', name: 'Pedro Santos', class: '7º B', lastAccess: '2023-11-05', daysInactive: 11 },
              { id: 'a4', name: 'Ana Beatriz', class: '9º B', lastAccess: '2023-11-04', daysInactive: 12 },
              { id: 'a5', name: 'Carlos Eduardo', class: '6º A', lastAccess: '2023-10-28', daysInactive: 19 }
            ]
          };
          
          return res.status(200).json(mockEvasionData);
        }
        
        // Implementar consulta real quando o banco estiver disponível
        try {
          // Na implementação real, seria necessário buscar os últimos acessos
          // dos alunos da escola e filtrar os que não acessam há mais de 10 dias
          
          // Como exemplo, estamos retornando dados vazios
          return res.status(200).json({
            totalStudents: 0,
            percentage: 0,
            details: []
          });
        } catch (dbError) {
          console.error('Erro ao buscar dados de evasão:', dbError);
          return res.status(500).json({ message: 'Erro ao buscar dados de evasão' });
        }
        
      } catch (error) {
        console.error('Erro ao obter dados de alerta de evasão:', error);
        return res.status(500).json({ message: 'Erro ao obter dados de evasão' });
      }
    }
  );
  
  // Obter integrações externas
  app.get("/api/integrations", authenticate, requireRole(["manager", "admin"]), async (req, res) => {
    try {
      // Simular busca de integrações (na implementação real, isto viria do banco de dados)
      const integrations = [
        {
          id: 'i1',
          name: 'SIGE Piauí',
          type: 'API',
          status: 'active',
          lastSync: '01/05/2023'
        },
        {
          id: 'i2',
          name: 'Google Classroom',
          type: 'OAuth',
          status: 'inactive'
        },
        {
          id: 'i3',
          name: 'Sistema Censo Escolar',
          type: 'SFTP',
          status: 'error',
          lastSync: '15/03/2023'
        }
      ];
      
      res.status(200).json(integrations);
    } catch (error) {
      console.error("Error fetching integrations:", error);
      res.status(500).json({ message: "Error fetching integrations" });
    }
  });
  
  // Configurar uma integração
  app.post("/api/integrations", authenticate, requireRole(["manager", "admin"]), async (req, res) => {
    try {
      const { name, type, credentials } = req.body;
      
      // Validação básica
      if (!name || !type) {
        return res.status(400).json({ 
          message: "Integration name and type are required" 
        });
      }
      
      // Simular criação de integração (na implementação real, isto seria salvo no banco de dados)
      const newIntegration = {
        id: `i${Date.now()}`,
        name,
        type,
        status: 'inactive',
        createdAt: new Date().toISOString()
      };
      
      res.status(201).json(newIntegration);
    } catch (error) {
      console.error("Error creating integration:", error);
      res.status(500).json({ message: "Error creating integration" });
    }
  });
  
  // Enviar comunicado
  app.post("/api/announcements", authenticate, requireRole(["manager", "teacher", "admin"]), async (req, res) => {
    try {
      const { title, content, recipients } = req.body;
      
      // Validação básica
      if (!title || !content || !recipients) {
        return res.status(400).json({ 
          message: "Title, content and recipients are required" 
        });
      }
      
      // Simular envio de comunicado (na implementação real, isto seria processado e enviado)
      const announcement = {
        id: `a${Date.now()}`,
        title,
        content,
        recipients,
        sentAt: new Date().toISOString(),
        sentBy: req.session.userId as number
      };
      
      res.status(201).json({
        ...announcement,
        message: "Announcement sent successfully"
      });
    } catch (error) {
      console.error("Error sending announcement:", error);
      res.status(500).json({ message: "Error sending announcement" });
    }
  });
}