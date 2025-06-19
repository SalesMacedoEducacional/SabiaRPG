import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { useStandardToast } from '@/lib/toast-utils';
import { useAuth } from './AuthContext';

interface Escola {
  id: string;
  nome: string;
  cidade: string;
  estado?: string;
  endereco?: string;
  telefone?: string;
  email?: string;
  diretor?: string;
  ativo?: boolean;
}

interface DashboardStats {
  totalEscolas: number;
  totalProfessores: number;
  totalAlunos: number;
  turmasAtivas: number;
}

interface SchoolContextType {
  escolasVinculadas: Escola[];
  dashboardStats: DashboardStats;
  isLoading: boolean;
  error: string | null;
  loadSchoolData: () => Promise<void>;
  refreshStats: () => Promise<void>;
}

const SchoolContext = createContext<SchoolContextType | undefined>(undefined);

export const useSchool = () => {
  const context = useContext(SchoolContext);
  if (context === undefined) {
    throw new Error('useSchool must be used within a SchoolProvider');
  }
  return context;
};

export const SchoolProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [escolasVinculadas, setEscolasVinculadas] = useState<Escola[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalEscolas: 0,
    totalProfessores: 0,
    totalAlunos: 0,
    turmasAtivas: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { isAuthenticated, user } = useAuth();
  const toast = useStandardToast();

  const loadSchoolData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Buscar escolas vinculadas ao gestor
      const escolasResponse = await apiRequest("GET", "/api/escolas/gestor");
      const escolasData = await escolasResponse.json();
      console.log('loadSchoolData: Resposta escolas:', escolasData);
      
      if (escolasResponse.ok) {
        setEscolasVinculadas(escolasData || []);
        
        // Sempre buscar estatísticas do dashboard após login
        console.log('loadSchoolData: Forçando chamada de refreshStats');
        await refreshStats();
      } else {
        throw new Error('Erro ao carregar escolas vinculadas');
      }
    } catch (error) {
      console.error("Erro ao carregar dados das escolas:", error);
      setError("Erro ao carregar dados de escolas vinculadas");
      setEscolasVinculadas([]);
      setDashboardStats({
        totalEscolas: 0,
        totalProfessores: 0,
        totalAlunos: 0,
        turmasAtivas: 0
      });
      
      toast.error("Erro ao carregar escolas", "Não foi possível carregar as escolas vinculadas");
    } finally {
      setIsLoading(false);
    }
  };

  const refreshStats = async () => {
    if (!isAuthenticated || !user || (user.role !== 'manager' && user.papel !== 'gestor')) {
      console.log('refreshStats: Usuário não autorizado ou não é gestor', { 
        isAuthenticated, 
        user: user ? { role: user.role, papel: user.papel } : null 
      });
      return;
    }

    console.log('refreshStats: FORÇANDO chamada para /api/manager/dashboard-stats');
    try {
      const statsResponse = await apiRequest("GET", "/api/manager/dashboard-stats");
      console.log('refreshStats: Status da resposta:', statsResponse.status);
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        console.log('refreshStats: Dados recebidos do backend:', statsData);
        
        setDashboardStats({
          totalEscolas: statsData.totalEscolas || 0,
          totalProfessores: statsData.totalProfessores || 0,
          totalAlunos: statsData.totalAlunos || 0,
          turmasAtivas: statsData.totalTurmas || 0
        });
        
        console.log('refreshStats: Estado atualizado com:', {
          totalEscolas: statsData.totalEscolas || 0,
          totalProfessores: statsData.totalProfessores || 0,
          totalAlunos: statsData.totalAlunos || 0,
          turmasAtivas: statsData.turmasAtivas || 0
        });
      } else {
        const errorData = await statsResponse.json();
        console.error('refreshStats: Erro na resposta:', errorData);
        throw new Error('Erro ao carregar estatísticas do dashboard');
      }
    } catch (error) {
      console.error("Erro ao atualizar estatísticas:", error);
      toast.error("Erro ao atualizar dados", "Não foi possível atualizar as estatísticas");
    }
  };

  // Effect para carregar dados quando o usuário autenticar
  useEffect(() => {
    console.log('SchoolContext useEffect:', { isAuthenticated, user });
    
    if (!isAuthenticated || !user) {
      console.log('SchoolContext: Limpando dados');
      setEscolasVinculadas([]);
      setDashboardStats({
        totalEscolas: 0,
        totalProfessores: 0,
        totalAlunos: 0,
        turmasAtivas: 0
      });
      setError(null);
      return;
    }

    if (isAuthenticated && user && (user.role === 'manager' || user.papel === 'gestor')) {
      console.log('SchoolContext: Carregando dados para gestor', { role: user.role, papel: user.papel });
      loadSchoolData();
    }
  }, [isAuthenticated, user]);

  const value = {
    escolasVinculadas,
    dashboardStats,
    isLoading,
    error,
    loadSchoolData,
    refreshStats
  };

  return (
    <SchoolContext.Provider value={value}>
      {children}
    </SchoolContext.Provider>
  );
};