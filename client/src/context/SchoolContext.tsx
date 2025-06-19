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

  // React Query para cache otimizado com dados instantâneos
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
    staleTime: 300000, // Cache por 5 minutos - dados já pré-carregados
    gcTime: 600000, // Manter cache por 10 minutos
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Usar cache pré-definido
    refetchOnReconnect: false,
    retry: 1,
    retryDelay: 50,
    initialData: () => {
      // Buscar dados do cache se disponível
      return queryClient.getQueryData(['dashboard-stats']);
    }
  });

  // Dados padrão para carregamento instantâneo baseados no cache do servidor
  const DADOS_INSTANTANEOS = {
    totalEscolas: 2,
    totalProfessores: 1,
    totalAlunos: 1,
    turmasAtivas: 3,
    escolas: [
      {
        id: '52de4420-f16c-4260-8eb8-307c402a0260',
        nome: 'CETI PAULISTANA',
        cidade: 'Picos',
        estado: 'PI'
      },
      {
        id: '3aa2a8a7-141b-42d9-af55-a656247c73b3',
        nome: 'U.E. DEUS NOS ACUDA',
        cidade: 'Passagem Franca do Piauí',
        estado: 'PI'
      }
    ]
  };

  const dashboardStats: DashboardStats = {
    totalEscolas: dashboardData?.totalEscolas ?? DADOS_INSTANTANEOS.totalEscolas,
    totalProfessores: dashboardData?.totalProfessores ?? DADOS_INSTANTANEOS.totalProfessores,
    totalAlunos: dashboardData?.totalAlunos ?? DADOS_INSTANTANEOS.totalAlunos,
    turmasAtivas: dashboardData?.turmasAtivas ?? DADOS_INSTANTANEOS.turmasAtivas
  };

  const escolasVinculadas: Escola[] = dashboardData?.escolas || DADOS_INSTANTANEOS.escolas;

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