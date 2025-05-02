import { Express, Request, Response } from "express";
import { storage } from "./storage";

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
      if (!schoolData.name || !schoolData.code) {
        return res.status(400).json({ 
          message: "School name and code are required" 
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
  app.get("/api/reports", authenticate, requireRole(["manager", "admin"]), async (req, res) => {
    try {
      const reportType = req.query.type as string;
      const timeframe = req.query.timeframe as string;
      
      // Simular dados de relatórios (na implementação real, isto viria do banco de dados)
      const reports = [
        { 
          id: 'r1', 
          title: 'Desempenho Escolar 2023', 
          type: 'school', 
          date: '20/04/2023',
          downloadUrl: '#' 
        },
        { 
          id: 'r2', 
          title: 'Progresso Regional', 
          type: 'region', 
          date: '15/03/2023',
          downloadUrl: '#'  
        },
        { 
          id: 'r3', 
          title: 'Estatísticas de Uso', 
          type: 'school', 
          date: '10/05/2023',
          downloadUrl: '#'  
        },
      ];
      
      // Filtrar por tipo se especificado
      const filteredReports = reportType 
        ? reports.filter(report => report.type === reportType)
        : reports;
      
      res.status(200).json(filteredReports);
    } catch (error) {
      console.error("Error fetching reports:", error);
      res.status(500).json({ message: "Error fetching reports" });
    }
  });
  
  // Gerar um novo relatório
  app.post("/api/reports", authenticate, requireRole(["manager", "admin"]), async (req, res) => {
    try {
      const { type, title, parameters } = req.body;
      
      // Validação básica
      if (!type || !title) {
        return res.status(400).json({ 
          message: "Report type and title are required" 
        });
      }
      
      // Simular geração de relatório (na implementação real, isto geraria um relatório real)
      const newReport = {
        id: `r${Date.now()}`,
        title,
        type,
        date: new Date().toLocaleDateString('pt-BR'),
        downloadUrl: '#',
        parameters,
        createdBy: req.session.userId as number
      };
      
      res.status(201).json(newReport);
    } catch (error) {
      console.error("Error generating report:", error);
      res.status(500).json({ message: "Error generating report" });
    }
  });
  
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