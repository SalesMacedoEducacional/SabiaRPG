import React, { createContext, useContext, useCallback, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
  if (!context) {
    throw new Error('useSchool deve ser usado dentro de um SchoolProvider');
  }
  return context;
};

export const SchoolProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const toast = useStandardToast();
  const queryClient = useQueryClient();

  // React Query para cache otimizado
  const { 
    data: dashboardData, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      console.log('🚀 ENDPOINT INSTANTÂNEO');
      const startTime = Date.now();
      const response = await apiRequest('GET', '/api/manager/dashboard-instant');
      const endTime = Date.now();
      console.log(`⚡ ${endTime - startTime}ms`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📊 Dados do dashboard carregados:', data);
        return data;
      } else {
        throw new Error('Falha ao carregar dados do dashboard');
      }
    },
    enabled: isAuthenticated && user?.papel === 'gestor',
    staleTime: 0, // Sempre buscar dados frescos
    gcTime: 0, // Não manter cache
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
    retry: 1,
    retryDelay: 0
  });

  const dashboardStats: DashboardStats = {
    totalEscolas: dashboardData?.totalEscolas || 0,
    totalProfessores: dashboardData?.totalProfessores || 0,
    totalAlunos: dashboardData?.totalAlunos || 0,
    turmasAtivas: dashboardData?.turmasAtivas || 0
  };

  const escolasVinculadas: Escola[] = dashboardData?.escolas || [];

  // Função para refresh manual
  const refreshStats = useCallback(async () => {
    await refetch();
    queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
  }, [refetch, queryClient]);

  const loadSchoolData = useCallback(async () => {
    await refreshStats();
  }, [refreshStats]);

  // Efeito para logging
  useEffect(() => {
    console.log('SchoolContext useEffect:', { isAuthenticated, user });
    
    if (!isAuthenticated || (user?.papel !== 'manager' && user?.papel !== 'gestor')) {
      console.log('SchoolContext: Limpando dados');
    }
  }, [isAuthenticated, user]);

  const contextValue: SchoolContextType = {
    escolasVinculadas,
    dashboardStats,
    isLoading,
    error: error?.message || null,
    loadSchoolData,
    refreshStats
  };

  return (
    <SchoolContext.Provider value={contextValue}>
      {children}
    </SchoolContext.Provider>
  );
};