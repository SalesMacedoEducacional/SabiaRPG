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
  escolasVinculadas: Escola[] | null;
  dashboardStats: DashboardStats | null;
  isLoading: boolean;
  error: string | null;
  refreshStats: () => Promise<void>;
  loadSchoolData: () => Promise<void>;
}

export const SchoolContext = createContext<SchoolContextType | undefined>(undefined);

export const SchoolProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const toast = useStandardToast();
  const [escolasVinculadas, setEscolasVinculadas] = useState<Escola[] | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSchoolData = async () => {
    if (!isAuthenticated || !user || user.role !== 'manager') {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Buscar escolas vinculadas ao gestor
      const escolasResponse = await apiRequest("GET", "/api/escolas/gestor");
      const escolasData = await escolasResponse.json();
      console.log('loadSchoolData: Resposta escolas:', escolasData);
      
      if (escolasResponse.ok) {
        setEscolasVinculadas(escolasData || []);
        
        // Se há escolas vinculadas, buscar estatísticas do dashboard
        console.log('loadSchoolData: Verificando se há escolas:', escolasData, escolasData?.length);
        if (escolasData && escolasData.length > 0) {
          console.log('loadSchoolData: Chamando refreshStats...');
          await refreshStats();
        } else {
          console.log('loadSchoolData: Nenhuma escola encontrada, zerando stats');
          // Se não há escolas vinculadas, zerar as estatísticas
          setDashboardStats({
            totalEscolas: 0,
            totalProfessores: 0,
            totalAlunos: 0,
            turmasAtivas: 0
          });
        }
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
    if (!isAuthenticated || !user || user.role !== 'manager') {
      console.log('refreshStats: Usuário não autorizado ou não é gestor');
      return;
    }

    console.log('refreshStats: Fazendo chamada para /api/manager/dashboard-stats');
    try {
      const statsResponse = await apiRequest("GET", "/api/manager/dashboard-stats");
      console.log('refreshStats: Resposta recebida:', statsResponse.status);
      const statsData = await statsResponse.json();
      console.log('refreshStats: Dados recebidos:', statsData);
      
      if (statsResponse.ok) {
        setDashboardStats({
          totalEscolas: statsData.totalEscolas || 0,
          totalProfessores: statsData.totalProfessores || 0,
          totalAlunos: statsData.totalAlunos || 0,
          turmasAtivas: statsData.turmasAtivas || 0
        });
      } else {
        throw new Error('Erro ao carregar estatísticas do dashboard');
      }
    } catch (error) {
      console.error("Erro ao atualizar estatísticas:", error);
      toast.error("Erro ao atualizar dados", "Não foi possível atualizar as estatísticas");
    }
  };

  // Carregar dados quando o usuário autenticar como gestor
  useEffect(() => {
    if (isAuthenticated && user && user.role === 'manager') {
      loadSchoolData();
    } else {
      // Limpar dados quando não autenticado ou não é gestor
      setEscolasVinculadas(null);
      setDashboardStats(null);
      setError(null);
    }
  }, [isAuthenticated, user]);

  return (
    <SchoolContext.Provider 
      value={{
        escolasVinculadas,
        dashboardStats,
        isLoading,
        error,
        refreshStats,
        loadSchoolData
      }}
    >
      {children}
    </SchoolContext.Provider>
  );
};

export const useSchool = () => {
  const context = useContext(SchoolContext);
  if (context === undefined) {
    throw new Error('useSchool must be used within a SchoolProvider');
  }
  return context;
};