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
        let schoolId = null;
        
        // Tenta obter ID da escola associada ao gestor
        try {
          // Verificar primeiro em perfis_gestor
          const { data: perfilData, error: perfilError } = await supabase
            .from('perfis_gestor')
            .select('escola_id')
            .eq('usuario_id', userId)
            .maybeSingle();
            
          if (!perfilError && perfilData && perfilData.escola_id) {
            schoolId = perfilData.escola_id;
          } else {
            // Se não encontrou, verificar em escolas.gestor_id
            const { data: escolaData, error: escolaError } = await supabase
              .from('escolas')
              .select('id')
              .eq('gestor_id', userId)
              .maybeSingle();
              
            if (!escolaError && escolaData) {
              schoolId = escolaData.id;
            }
          }
        } catch (findError) {
          console.error('Erro ao buscar escola do gestor:', findError);
        }
        
        // Verificar se encontrou alguma escola
        if (!schoolId) {
          return res.status(404).json({ 
            message: 'Nenhuma escola vinculada a este gestor',
            stats: {
              totalSchools: 0,
              totalTeachers: 0,
              totalStudents: 0,
              activeClasses: 0,
              activeStudents7Days: 0,
              activeStudents30Days: 0,
              potentialEvasion: 0,
              engagementLevel: 0,
              missionsInProgress: 0,
              missionsCompleted: 0,
              missionsPending: 0
            },
            topSchools: [],
            recentActivities: []
          });
        }
        
        console.log(`Obtendo estatísticas para o gestor ${userId}, escola ${schoolId}`);
        
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
            
          if (teacherError) {
            console.error('Erro ao contar professores:', teacherError);
            throw teacherError;
          }
          
          // Contar alunos da escola
          const { count: studentCount, error: studentError } = await supabase
            .from('usuarios')
            .select('*', { count: 'exact', head: true })
            .eq('escola_id', schoolId)
            .eq('papel', 'aluno');
            
          if (studentError) {
            console.error('Erro ao contar alunos:', studentError);
            throw studentError;
          }
          
          // Contar turmas da escola
          const { count: classCount, error: classError } = await supabase
            .from('turmas')
            .select('*', { count: 'exact', head: true })
            .eq('escola_id', schoolId);
            
          if (classError) {
            console.error('Erro ao contar turmas:', classError);
          }
          
          // Buscar dados reais de engajamento
          let activeStudents7Days = 0;
          let activeStudents30Days = 0;
          let missionsInProgress = 0;
          let missionsCompleted = 0; 
          let missionsPending = 0;
          
          try {
            // Buscar alunos ativos nos últimos 7 dias
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            
            const { count: active7Days } = await supabase
              .from('acessos_usuarios')
              .select('*', { count: 'exact', head: true })
              .eq('escola_id', schoolId)
              .eq('papel', 'aluno')
              .gte('data_acesso', sevenDaysAgo.toISOString());
              
            activeStudents7Days = active7Days || 0;
            
            // Buscar alunos ativos nos últimos 30 dias
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            
            const { count: active30Days } = await supabase
              .from('acessos_usuarios')
              .select('*', { count: 'exact', head: true })
              .eq('escola_id', schoolId)
              .eq('papel', 'aluno')
              .gte('data_acesso', thirtyDaysAgo.toISOString());
              
            activeStudents30Days = active30Days || 0;
            
            // Buscar progresso de missões - sem usar group que não está disponível
            let missionData = null;
            try {
              // Como não podemos usar group, podemos tentar fazer uma consulta simples
              // e contar manualmente ou usar uma função SQL agregada diretamente
              const { data: missionInProgressData } = await supabase
                .from('progresso_missoes')
                .select('*', { count: 'exact', head: true })
                .eq('escola_id', schoolId)
                .eq('status', 'em_andamento');

              const { data: missionCompletedData } = await supabase
                .from('progresso_missoes')
                .select('*', { count: 'exact', head: true })
                .eq('escola_id', schoolId)
                .eq('status', 'concluida');
                
              missionsInProgress = missionInProgressData?.length || 0;
              missionsCompleted = missionCompletedData?.length || 0;
            } catch (error) {
              console.error('Erro ao buscar dados de progresso de missões:', error);
            }
              
            // O código antigo foi substituído pela implementação acima
            // que busca missões em progresso e concluídas diretamente
          } catch (error) {
            console.error('Erro ao buscar dados de engajamento:', error);
            // Não faremos fallback para dados simulados - mantemos zeros
          }
          
          // Calcular taxa de engajamento com base em dados reais
          // Se não tivermos dados suficientes, definimos como 0
          const engagementLevel = studentCount > 0 
            ? Math.round((activeStudents7Days / studentCount) * 100) 
            : 0;
            
          // Identificar possível evasão: alunos que não acessaram em 30 dias
          const potentialEvasion = studentCount > activeStudents30Days 
            ? (studentCount - activeStudents30Days) 
            : 0;
            
          // Construir estatísticas baseadas em dados reais
          const stats = {
            totalSchools: 1, // O gestor gerencia uma escola específica
            totalTeachers: teacherCount || 0,
            totalStudents: studentCount || 0,
            activeClasses: classCount || 0,
            activeStudents7Days,
            activeStudents30Days,
            potentialEvasion,
            engagementLevel,
            missionsInProgress,
            missionsCompleted,
            missionsPending
          };
          
          // Obter lista de escolas para demonstração (no caso, apenas a escola do gestor)
          const topSchools = [{
            id: schoolData.id,
            name: schoolData.nome,
            code: schoolData.codigo_escola || 'N/A',
            type: schoolData.tipo || 'Padrão',
            students: studentCount || 0,
            teachers: teacherCount || 0,
            engagement: 75, // Valor padrão para demonstração
            level: 'Médio'
          }];
          
          // Buscar atividades recentes da escola ou criar mock para demonstração
          let recentActivities = [];
          
          try {
            const { data: activitiesData, error: activitiesError } = await supabase
              .from('atividades')
              .select('*')
              .eq('escola_id', schoolId)
              .order('created_at', { ascending: false })
              .limit(5);
              
            if (activitiesError) {
              throw activitiesError;
            }
            
            if (activitiesData && activitiesData.length > 0) {
              recentActivities = activitiesData.map(act => ({
                id: act.id,
                type: act.tipo,
                title: act.titulo,
                description: act.descricao,
                date: act.created_at,
                user: act.usuario_nome
              }));
            } else {
              // Sem atividades, criar pelo menos uma com os dados da escola
              recentActivities = [
                {
                  id: 'reg1',
                  type: 'school',
                  title: 'Escola registrada',
                  description: `Escola "${schoolData.nome}" configurada no sistema`,
                  date: schoolData.criado_em || new Date().toISOString(),
                  user: 'Sistema'
                }
              ];
            }
          } catch (actError) {
            console.error('Erro ao buscar atividades:', actError);
            // Criar pelo menos uma atividade com dados da escola
            recentActivities = [
              {
                id: 'reg1',
                type: 'school',
                title: 'Escola registrada',
                description: `Escola "${schoolData.nome}" configurada no sistema`,
                date: schoolData.criado_em || new Date().toISOString(), 
                user: 'Sistema'
              }
            ];
          }
          
          return res.status(200).json({
            stats: stats,
            topSchools,
            recentActivities
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
      const userId = req.session.userId;
      
      // Buscar escolas reais do banco de dados Supabase
      console.log('Buscando escolas para o gestor ID:', userId);
      
      // Para gestor, buscar apenas escolas vinculadas a ele
      if (req.session.userRole === 'manager') {
        // Buscar primeiro via perfis_gestor
        const { data: perfilData, error: perfilError } = await supabase
          .from('perfis_gestor')
          .select('escola_id, escolas:escola_id(id, nome, codigo_escola, tipo)')
          .eq('usuario_id', userId);
          
        if (perfilError) {
          console.error('Erro ao buscar perfis de gestor:', perfilError);
          throw perfilError;
        }
        
        if (perfilData && perfilData.length > 0) {
          // Formatar os dados para retornar no formato esperado pelo frontend
          const schoolList = perfilData.map(p => {
            if (p.escolas) {
              return {
                id: p.escolas.id,
                name: p.escolas.nome,
                code: p.escolas.codigo_escola || '',
                teachers: 0, // Será atualizado depois
                students: 0, // Será atualizado depois
                active: true // Campo ativo não existe no schema real
              };
            }
            return null;
          }).filter(Boolean);
          
          // Para cada escola, buscar quantidade de professores e alunos
          for (const school of schoolList) {
            try {
              // Contar professores
              const { count: teacherCount } = await supabase
                .from('usuarios')
                .select('*', { count: 'exact', head: true })
                .eq('escola_id', school.id)
                .eq('papel', 'professor');
                
              // Contar alunos
              const { count: studentCount } = await supabase
                .from('usuarios')
                .select('*', { count: 'exact', head: true })
                .eq('escola_id', school.id)
                .eq('papel', 'aluno');
                
              // Atualizar contadores
              school.teachers = teacherCount || 0;
              school.students = studentCount || 0;
            } catch (countError) {
              console.error('Erro ao contar usuários da escola:', countError);
            }
          }
          
          return res.status(200).json(schoolList);
        }
        
        // Se não encontrou via perfis_gestor, tentar via campo gestor_id
        const { data: directSchools, error: directError } = await supabase
          .from('escolas')
          .select('*')
          .eq('gestor_id', userId);
          
        if (directError) {
          console.error('Erro ao buscar escolas diretamente:', directError);
          throw directError;
        }
        
        if (directSchools && directSchools.length > 0) {
          // Formatar os dados
          const schoolList = directSchools.map(school => ({
            id: school.id,
            name: school.nome,
            code: school.codigo_escola || '',
            teachers: 0, // Será atualizado depois
            students: 0, // Será atualizado depois
            active: true // Campo ativo não existe no schema real
          }));
          
          // Para cada escola, buscar quantidade de professores e alunos
          for (const school of schoolList) {
            try {
              // Contar professores
              const { count: teacherCount } = await supabase
                .from('usuarios')
                .select('*', { count: 'exact', head: true })
                .eq('escola_id', school.id)
                .eq('papel', 'professor');
                
              // Contar alunos
              const { count: studentCount } = await supabase
                .from('usuarios')
                .select('*', { count: 'exact', head: true })
                .eq('escola_id', school.id)
                .eq('papel', 'aluno');
                
              // Atualizar contadores
              school.teachers = teacherCount || 0;
              school.students = studentCount || 0;
            } catch (countError) {
              console.error('Erro ao contar usuários da escola:', countError);
            }
          }
          
          return res.status(200).json(schoolList);
        }
        
        // Se não encontrou nenhuma escola, retornar array vazio
        return res.status(200).json([]);
      }
      
      // Para administradores, buscar todas as escolas
      if (req.session.userRole === 'admin') {
        const { data: allSchools, error: allError } = await supabase
          .from('escolas')
          .select('*')
          .order('nome');
          
        if (allError) {
          console.error('Erro ao buscar todas as escolas:', allError);
          throw allError;
        }
        
        // Formatar os dados
        const schoolList = allSchools ? allSchools.map(school => ({
          id: school.id,
          name: school.nome,
          code: school.codigo_escola || '',
          teachers: 0, // Informação básica apenas
          students: 0, // Informação básica apenas
          active: school.ativo === undefined ? true : school.ativo
        })) : [];
        
        return res.status(200).json(schoolList);
      }
      
      // Outros perfis não autorizados
      return res.status(403).json({ message: 'Perfil não autorizado a listar escolas' });
    } catch (error) {
      console.error("Error fetching schools:", error);
      res.status(500).json({ message: "Error fetching schools" });
    }
  });
  
  // Rota para obter relatórios
  app.get("/api/reports", authenticate, requireRole(["manager", "admin"]), async (req, res) => {
    try {
      const userId = req.session.userId;
      let schoolId = null;
      
      // Buscar escola do gestor
      try {
        // Verificar primeiro em perfis_gestor
        const { data: perfilData, error: perfilError } = await supabase
          .from('perfis_gestor')
          .select('escola_id')
          .eq('usuario_id', userId)
          .maybeSingle();
          
        if (!perfilError && perfilData && perfilData.escola_id) {
          schoolId = perfilData.escola_id;
        } else {
          // Se não encontrou, verificar em escolas.gestor_id
          const { data: escolaData, error: escolaError } = await supabase
            .from('escolas')
            .select('id')
            .eq('gestor_id', userId)
            .maybeSingle();
            
          if (!escolaError && escolaData) {
            schoolId = escolaData.id;
          }
        }
      } catch (findError) {
        console.error('Erro ao buscar escola do gestor:', findError);
      }
      
      if (!schoolId) {
        // Se não encontrou escola, retornar array vazio
        return res.status(200).json([]);
      }
      
      // Buscar relatórios reais da escola
      const { data: reports, error: reportsError } = await supabase
        .from('relatorios')
        .select('*')
        .eq('escola_id', schoolId)
        .order('created_at', { ascending: false })
        .limit(10);
        
      if (reportsError) {
        console.error('Erro ao buscar relatórios:', reportsError);
        return res.status(200).json([]); // Retornar vazio em caso de erro
      }
      
      if (reports && reports.length > 0) {
        // Formatar os relatórios para o formato esperado pelo frontend
        const formattedReports = reports.map(report => ({
          id: report.id,
          title: report.titulo || `Relatório ${report.tipo || 'school'} - ${new Date(report.created_at).toISOString().substring(0, 10)}`,
          type: report.tipo || 'school',
          date: report.created_at,
          downloadUrl: report.url_download || '#'
        }));
        
        return res.status(200).json(formattedReports);
      }
      
      // Se não há relatórios cadastrados, retornar array vazio
      return res.status(200).json([]);
    } catch (error) {
      console.error("Error fetching reports:", error);
      res.status(500).json({ message: "Error fetching reports" });
    }
  });
  
  // Rota para obter integrações
  app.get("/api/integrations", authenticate, requireRole(["manager", "admin"]), async (req, res) => {
    try {
      const userId = req.session.userId;
      let schoolId = null;
      
      // Buscar escola do gestor
      try {
        // Verificar primeiro em perfis_gestor
        const { data: perfilData, error: perfilError } = await supabase
          .from('perfis_gestor')
          .select('escola_id')
          .eq('usuario_id', userId)
          .maybeSingle();
          
        if (!perfilError && perfilData && perfilData.escola_id) {
          schoolId = perfilData.escola_id;
        } else {
          // Se não encontrou, verificar em escolas.gestor_id
          const { data: escolaData, error: escolaError } = await supabase
            .from('escolas')
            .select('id')
            .eq('gestor_id', userId)
            .maybeSingle();
            
          if (!escolaError && escolaData) {
            schoolId = escolaData.id;
          }
        }
      } catch (findError) {
        console.error('Erro ao buscar escola do gestor:', findError);
      }
      
      if (!schoolId) {
        // Se não encontrou escola, retornar array vazio
        return res.status(200).json([]);
      }
      
      // Buscar integrações reais da escola
      const { data: integrations, error: integrationsError } = await supabase
        .from('integracoes')
        .select('*')
        .eq('escola_id', schoolId)
        .order('created_at', { ascending: false });
        
      if (integrationsError) {
        console.error('Erro ao buscar integrações:', integrationsError);
        return res.status(200).json([]); // Retornar vazio em caso de erro
      }
      
      if (integrations && integrations.length > 0) {
        // Formatar as integrações para o formato esperado pelo frontend
        const formattedIntegrations = integrations.map(integration => ({
          id: integration.id,
          name: integration.nome,
          type: integration.tipo || 'API',
          status: integration.status || 'inactive',
          lastSync: integration.ultima_sincronizacao || null
        }));
        
        return res.status(200).json(formattedIntegrations);
      }
      
      // Se não há integrações cadastradas, retornar array vazio
      return res.status(200).json([]);
    } catch (error) {
      console.error("Error fetching integrations:", error);
      res.status(500).json({ message: "Error fetching integrations" });
    }
  });
  
  // Rota para obter usuários da escola do gestor
  app.get("/api/users", authenticate, requireRole(["manager", "admin"]), async (req, res) => {
    try {
      const userId = req.session.userId;
      let schoolId = null;
      
      // Buscar escola do gestor
      try {
        // Verificar primeiro em perfis_gestor
        const { data: perfilData, error: perfilError } = await supabase
          .from('perfis_gestor')
          .select('escola_id')
          .eq('usuario_id', userId)
          .maybeSingle();
          
        if (!perfilError && perfilData && perfilData.escola_id) {
          schoolId = perfilData.escola_id;
        } else {
          // Se não encontrou, verificar em escolas.gestor_id
          const { data: escolaData, error: escolaError } = await supabase
            .from('escolas')
            .select('id')
            .eq('gestor_id', userId)
            .maybeSingle();
            
          if (!escolaError && escolaData) {
            schoolId = escolaData.id;
          }
        }
      } catch (findError) {
        console.error('Erro ao buscar escola do gestor:', findError);
      }
      
      if (!schoolId) {
        // Se não encontrou escola, retornar array vazio
        return res.status(200).json([]);
      }
      
      // Buscar usuários vinculados à escola
      const { data: users, error: usersError } = await supabase
        .from('usuarios')
        .select('id, email, nome_completo, papel, username, ativo, ultimo_acesso')
        .eq('escola_id', schoolId)
        .order('nome_completo');
        
      if (usersError) {
        console.error('Erro ao buscar usuários da escola:', usersError);
        return res.status(500).json({ message: 'Erro ao buscar usuários da escola' });
      }
      
      // Formatar os dados para o formato esperado pelo frontend
      const formattedUsers = users ? users.map(user => ({
        id: user.id,
        name: user.nome_completo || user.username || 'Sem nome',
        email: user.email,
        profile: user.papel || 'aluno',
        status: user.ativo === false ? 'inactive' : 'active',
        lastAccess: user.ultimo_acesso
      })) : [];
      
      return res.status(200).json(formattedUsers);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      res.status(500).json({ message: "Erro ao buscar usuários" });
    }
  });
}