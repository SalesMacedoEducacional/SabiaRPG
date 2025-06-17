import { Express, Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '../db/supabase.js';

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
  
  // API para obter estatísticas do dashboard do gestor
  app.get(
    '/api/manager/dashboard-stats',
    authenticate,
    requireRole(['manager']),
    async (req: Request, res: Response) => {
      try {
        const userId = req.session.userId;
        
        // Buscar todas as escolas vinculadas ao gestor através da tabela perfis_gestor
        const { data: perfilsGestor, error: perfilError } = await supabase
          .from('perfis_gestor')
          .select(`
            escola_id,
            escolas!inner (
              id,
              nome,
              codigo_escola,
              tipo,
              modalidade_ensino,
              cidade,
              estado,
              zona_geografica,
              endereco,
              telefone,
              email_institucional
            )
          `)
          .eq('usuario_id', userId)
          .eq('ativo', true);
          
        if (perfilError) {
          console.error('Erro ao buscar perfis do gestor:', perfilError);
          throw perfilError;
        }
        
        if (!perfilsGestor || perfilsGestor.length === 0) {
          return res.status(404).json({ 
            message: 'Você não possui escolas vinculadas',
            totalEscolas: 0,
            totalProfessores: 0,
            totalAlunos: 0,
            turmasAtivas: 0,
            escolas: []
          });
        }
        
        // Extrair lista de escolas e IDs
        const escolas = perfilsGestor.map(perfil => perfil.escolas);
        const schoolIds = perfilsGestor.map(perfil => perfil.escola_id);
        
        console.log(`Obtendo estatísticas para o gestor ${userId}, escolas: ${schoolIds.join(', ')}`);
        
        try {
          // Contar professores nas escolas vinculadas
          const { count: teacherCount, error: teacherError } = await supabase
            .from('perfis_professor')
            .select('*', { count: 'exact', head: true })
            .in('escola_id', schoolIds)
            .eq('ativo', true);
            
          if (teacherError) {
            console.error('Erro ao contar professores:', teacherError);
          }
          
          // Contar alunos nas escolas vinculadas
          const { count: studentCount, error: studentError } = await supabase
            .from('perfis_aluno')
            .select('*', { count: 'exact', head: true })
            .in('escola_id', schoolIds);
            
          if (studentError) {
            console.error('Erro ao contar alunos:', studentError);
          }
          
          // Contar turmas nas escolas vinculadas
          const { count: classCount, error: classError } = await supabase
            .from('turmas')
            .select('*', { count: 'exact', head: true })
            .in('escola_id', schoolIds)
            .eq('ativo', true);
            
          if (classError) {
            console.error('Erro ao contar turmas:', classError);
          }
          
          // Retornar dados das estatísticas do dashboard
          const dashboardStats = {
            totalEscolas: escolas.length,
            totalProfessores: teacherCount || 0,
            totalAlunos: studentCount || 0,
            turmasAtivas: classCount || 0
          };
          
          return res.status(200).json({
            message: 'Estatísticas obtidas com sucesso',
            ...dashboardStats,
            escolas: escolas
          });
          
        } catch (error) {
          console.error('Erro ao obter estatísticas do gestor:', error);
          return res.status(500).json({
            message: 'Erro interno do servidor ao obter estatísticas',
            totalEscolas: 0,
            totalProfessores: 0,
            totalAlunos: 0,
            turmasAtivas: 0,
            escolas: []
          });
        }
      } catch (error) {
        console.error('Erro geral na API dashboard-stats:', error);
        return res.status(500).json({
          message: 'Erro interno do servidor',
          totalEscolas: 0,
          totalProfessores: 0,
          totalAlunos: 0,
          turmasAtivas: 0,
          escolas: []
        });
      }
    }
  );

  // API para obter escolas vinculadas do gestor
  app.get(
    '/api/manager/schools',
    authenticate,
    requireRole(['manager']),
    async (req: Request, res: Response) => {
      try {
        const userId = req.session.userId;
        
        // Buscar escolas vinculadas ao gestor
        const { data: perfilsGestor, error: perfilError } = await supabase
          .from('perfis_gestor')
          .select(`
            escola_id,
            escolas!inner (
              id,
              nome,
              codigo_escola,
              tipo,
              modalidade_ensino,
              cidade,
              estado,
              zona_geografica,
              endereco,
              telefone,
              email_institucional,
              ativo
            )
          `)
          .eq('usuario_id', userId)
          .eq('ativo', true);
          
        if (perfilError) {
          console.error('Erro ao buscar escolas do gestor:', perfilError);
          throw perfilError;
        }
        
        if (!perfilsGestor || perfilsGestor.length === 0) {
          return res.status(404).json({ 
            message: 'Você não possui escolas vinculadas',
            escolas: []
          });
        }
        
        const escolas = perfilsGestor.map(perfil => perfil.escolas);
        
        return res.status(200).json({
          message: 'Escolas obtidas com sucesso',
          escolas: escolas
        });
        
      } catch (error) {
        console.error('Erro ao buscar escolas do gestor:', error);
        return res.status(500).json({
          message: 'Erro interno do servidor',
          escolas: []
        });
      }
    }
  );
}