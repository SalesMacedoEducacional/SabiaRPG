import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiRequest } from '@/lib/queryClient';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface Escola {
  id: string;
  nome: string;
  codigoEscola: string;
  tipo: string;
  modalidadeEnsino: string;
  cidade: string;
  estado: string;
  zonaGeografica: string;
  endereco?: string;
  telefone?: string;
  emailInstitucional?: string;
  ativo: boolean;
}

interface DashboardStats {
  totalEscolas: number;
  totalProfessores: number;
  totalAlunos: number;
  turmasAtivas: number;
  escolas: Escola[];
}

interface SchoolContextType {
  escolasVinculadas: Escola[];
  dashboardStats: DashboardStats | null;
  isLoading: boolean;
  error: string | null;
  refreshStats: () => void;
  hasEscolasVinculadas: boolean;
}

const SchoolContext = createContext<SchoolContextType | undefined>(undefined);

export const SchoolProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  // Query para buscar escolas vinculadas e estatísticas
  const { data: dashboardData, isLoading, refetch } = useQuery<DashboardStats>({
    queryKey: ['/api/manager/dashboard-stats'],
    queryFn: async () => {
      console.log('Buscando estatísticas do dashboard do gestor...');
      
      if (!user || user.role !== 'manager') {
        throw new Error('Usuário não é um gestor válido');
      }

      try {
        const response = await apiRequest('GET', '/api/manager/dashboard-stats');
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Você não possui escolas vinculadas');
          }
          if (response.status === 403) {
            throw new Error('Acesso negado. Verifique suas permissões.');
          }
          throw new Error('Erro ao carregar dados das escolas vinculadas');
        }

        const data = await response.json();
        console.log('Dados do dashboard carregados:', data);
        
        // Verificar se tem escolas vinculadas
        if (!data.escolas || data.escolas.length === 0) {
          throw new Error('Você não possui escolas vinculadas');
        }

        setError(null);
        return data;
      } catch (err: any) {
        console.error('Erro ao carregar dashboard:', err);
        setError(err.message || 'Erro ao carregar dados de escolas vinculadas');
        throw err;
      }
    },
    enabled: isAuthenticated && user?.role === 'manager',
    retry: (failureCount, error: any) => {
      // Não tentar novamente se o erro for de escola não vinculada
      if (error?.message?.includes('não possui escolas vinculadas')) {
        return false;
      }
      return failureCount < 2;
    },
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  const refreshStats = () => {
    console.log('Atualizando estatísticas do dashboard...');
    refetch();
    // Invalidar outras queries relacionadas
    queryClient.invalidateQueries({ queryKey: ['/api/manager'] });
    queryClient.invalidateQueries({ queryKey: ['/api/usuarios'] });
    queryClient.invalidateQueries({ queryKey: ['/api/turmas'] });
    queryClient.invalidateQueries({ queryKey: ['/api/escolas'] });
  };

  const contextValue: SchoolContextType = {
    escolasVinculadas: dashboardData?.escolas || [],
    dashboardStats: dashboardData || null,
    isLoading,
    error,
    refreshStats,
    hasEscolasVinculadas: (dashboardData?.escolas?.length || 0) > 0
  };

  return (
    <SchoolContext.Provider value={contextValue}>
      {children}
    </SchoolContext.Provider>
  );
};

export const useSchool = () => {
  const context = useContext(SchoolContext);
  if (context === undefined) {
    throw new Error('useSchool deve ser usado dentro de um SchoolProvider');
  }
  return context;
};