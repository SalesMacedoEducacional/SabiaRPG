import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { triggerDataMutation } from '@/hooks/useGlobalDataSync';

interface MutationConfig {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  invalidateQueries?: string[];
  mutationType?: string;
}

/**
 * Hook aprimorado para mutações com auto-refresh automático
 * Dispara eventos de sincronização global após cada operação CRUD
 */
export const useEnhancedMutation = (
  endpoint: string,
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'POST',
  config?: MutationConfig
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data?: any) => {
      const startTime = performance.now();
      
      let response;
      switch (method) {
        case 'POST':
          response = await apiRequest(endpoint, 'POST', data);
          break;
        case 'PUT':
          response = await apiRequest(endpoint, 'PUT', data);
          break;
        case 'PATCH':
          response = await apiRequest(endpoint, 'PATCH', data);
          break;
        case 'DELETE':
          response = await apiRequest(endpoint, 'DELETE', data);
          break;
        default:
          response = await apiRequest(endpoint, 'POST', data);
      }

      const duration = performance.now() - startTime;
      console.log(`📊 Mutação ${method} ${endpoint} concluída em ${duration.toFixed(2)}ms`);

      return response;
    },
    
    onSuccess: (data, variables) => {
      // Trigger global data mutation event
      const mutationType = config?.mutationType || `${method.toLowerCase()}-${endpoint.split('/').pop()}`;
      triggerDataMutation(mutationType, { data, variables });

      // Invalidate specific queries if provided
      if (config?.invalidateQueries) {
        config.invalidateQueries.forEach(queryKey => {
          queryClient.invalidateQueries({ queryKey: [queryKey] });
        });
      }

      // Call custom onSuccess handler
      config?.onSuccess?.(data);
    },

    onError: (error) => {
      console.error(`❌ Erro na mutação ${method} ${endpoint}:`, error);
      config?.onError?.(error);
    }
  });
};

// Hooks específicos para operações CRUD

export const useCreateMutation = (endpoint: string, config?: MutationConfig) => {
  return useEnhancedMutation(endpoint, 'POST', {
    ...config,
    mutationType: config?.mutationType || `create-${endpoint.split('/').pop()}`
  });
};

export const useUpdateMutation = (endpoint: string, config?: MutationConfig) => {
  return useEnhancedMutation(endpoint, 'PUT', {
    ...config,
    mutationType: config?.mutationType || `update-${endpoint.split('/').pop()}`
  });
};

export const useDeleteMutation = (endpoint: string, config?: MutationConfig) => {
  return useEnhancedMutation(endpoint, 'DELETE', {
    ...config,
    mutationType: config?.mutationType || `delete-${endpoint.split('/').pop()}`
  });
};

// Hooks específicos para entidades do sistema

export const useUsuarioMutations = () => {
  const createUsuario = useCreateMutation('/api/usuarios', {
    mutationType: 'create-usuario',
    invalidateQueries: [
      '/api/usuarios',
      '/api/usuarios/gestor',
      '/api/manager/dashboard-stats',
      '/api/manager/dashboard-instant'
    ]
  });

  const updateUsuario = useUpdateMutation('/api/usuarios', {
    mutationType: 'update-usuario',
    invalidateQueries: [
      '/api/usuarios',
      '/api/usuarios/gestor',
      '/api/manager/dashboard-stats'
    ]
  });

  const deleteUsuario = useDeleteMutation('/api/usuarios', {
    mutationType: 'delete-usuario',
    invalidateQueries: [
      '/api/usuarios',
      '/api/usuarios/gestor',
      '/api/manager/dashboard-stats',
      '/api/manager/dashboard-instant'
    ]
  });

  return {
    createUsuario,
    updateUsuario,
    deleteUsuario
  };
};

export const useEscolaMutations = () => {
  const createEscola = useCreateMutation('/api/escolas', {
    mutationType: 'create-escola',
    invalidateQueries: [
      '/api/escolas',
      '/api/escolas/gestor',
      '/api/manager/dashboard-stats',
      '/api/manager/dashboard-instant'
    ]
  });

  const updateEscola = useUpdateMutation('/api/escolas', {
    mutationType: 'update-escola',
    invalidateQueries: [
      '/api/escolas',
      '/api/escolas/gestor',
      '/api/manager/dashboard-stats'
    ]
  });

  const deleteEscola = useDeleteMutation('/api/escolas', {
    mutationType: 'delete-escola',
    invalidateQueries: [
      '/api/escolas',
      '/api/escolas/gestor',
      '/api/manager/dashboard-stats',
      '/api/manager/dashboard-instant'
    ]
  });

  return {
    createEscola,
    updateEscola,
    deleteEscola
  };
};

export const useTurmaMutations = () => {
  const createTurma = useCreateMutation('/api/turmas', {
    mutationType: 'create-turma',
    invalidateQueries: [
      '/api/turmas',
      '/api/turmas/gestor',
      '/api/manager/dashboard-stats',
      '/api/manager/dashboard-instant'
    ]
  });

  const updateTurma = useUpdateMutation('/api/turmas', {
    mutationType: 'update-turma',
    invalidateQueries: [
      '/api/turmas',
      '/api/turmas/gestor',
      '/api/manager/dashboard-stats'
    ]
  });

  const deleteTurma = useDeleteMutation('/api/turmas', {
    mutationType: 'delete-turma',
    invalidateQueries: [
      '/api/turmas',
      '/api/turmas/gestor',
      '/api/manager/dashboard-stats',
      '/api/manager/dashboard-instant'
    ]
  });

  return {
    createTurma,
    updateTurma,
    deleteTurma
  };
};

export const useComponenteMutations = () => {
  const createComponente = useCreateMutation('/api/componentes', {
    mutationType: 'create-componente',
    invalidateQueries: [
      '/api/componentes',
      '/api/manager/dashboard-stats'
    ]
  });

  const updateComponente = useUpdateMutation('/api/componentes', {
    mutationType: 'update-componente',
    invalidateQueries: [
      '/api/componentes',
      '/api/manager/dashboard-stats'
    ]
  });

  const deleteComponente = useDeleteMutation('/api/componentes', {
    mutationType: 'delete-componente',
    invalidateQueries: [
      '/api/componentes',
      '/api/manager/dashboard-stats'
    ]
  });

  return {
    createComponente,
    updateComponente,
    deleteComponente
  };
};

export const useMatriculaMutations = () => {
  const createMatricula = useCreateMutation('/api/matriculas', {
    mutationType: 'create-matricula',
    invalidateQueries: [
      '/api/matriculas',
      '/api/students/manager',
      '/api/manager/dashboard-stats',
      '/api/manager/dashboard-instant'
    ]
  });

  const updateMatricula = useUpdateMutation('/api/matriculas', {
    mutationType: 'update-matricula',
    invalidateQueries: [
      '/api/matriculas',
      '/api/students/manager',
      '/api/manager/dashboard-stats'
    ]
  });

  const deleteMatricula = useDeleteMutation('/api/matriculas', {
    mutationType: 'delete-matricula',
    invalidateQueries: [
      '/api/matriculas',
      '/api/students/manager',
      '/api/manager/dashboard-stats',
      '/api/manager/dashboard-instant'
    ]
  });

  return {
    createMatricula,
    updateMatricula,
    deleteMatricula
  };
};