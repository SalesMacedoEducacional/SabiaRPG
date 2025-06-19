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
    queryFn: () => apiRequest('/api/manager/dashboard-fast'),
    enabled: isAuthenticated && user?.papel === 'manager',
    staleTime: 5000, // 5 segundos
    gcTime: 30000, // 30 segundos
    refetchOnWindowFocus: false,
    retry: 2
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
    
    if (!isAuthenticated || user?.papel !== 'manager') {
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