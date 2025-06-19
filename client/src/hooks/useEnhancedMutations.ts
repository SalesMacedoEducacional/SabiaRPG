import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { triggerDataMutation } from '@/hooks/useGlobalDataSync';

/**
 * Hook para mutações com auto-refresh e sincronização global
 */
export const useEnhancedMutation = (config: {
  mutationFn: (data: any) => Promise<any>;
  mutationType: 'usuarios' | 'escolas' | 'turmas' | 'componentes' | 'matriculas';
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: config.mutationFn,
    onSuccess: (data, variables) => {
      const startTime = performance.now();
      
      // Disparar evento de mutação global
      triggerDataMutation(`${config.mutationType}_updated`, { data, variables });
      
      // Invalidar queries específicas baseadas no tipo de mutação
      const queriesToInvalidate = getQueriesToInvalidate(config.mutationType);
      
      Promise.all(
        queriesToInvalidate.map(queryKey => 
          queryClient.invalidateQueries({ queryKey: [queryKey] })
        )
      ).then(() => {
        const endTime = performance.now();
        console.log(`✅ Mutação ${config.mutationType} processada em ${(endTime - startTime).toFixed(2)}ms`);
      });

      // Executar callback customizado se fornecido
      config.onSuccess?.(data);
    },
    onError: (error, variables) => {
      console.error(`❌ Erro na mutação ${config.mutationType}:`, error);
      config.onError?.(error);
    }
  });
};

// Função para determinar quais queries invalidar baseado no tipo de mutação
const getQueriesToInvalidate = (mutationType: string): string[] => {
  const baseQueries = [
    '/api/manager/dashboard-stats',
    '/api/manager/dashboard-instant'
  ];

  switch (mutationType) {
    case 'usuarios':
      return [
        ...baseQueries,
        '/api/usuarios',
        '/api/usuarios/gestor',
        '/api/students/manager',
        '/api/teachers/manager'
      ];
      
    case 'escolas':
      return [
        ...baseQueries,
        '/api/escolas',
        '/api/escolas/gestor'
      ];
      
    case 'turmas':
      return [
        ...baseQueries,
        '/api/turmas',
        '/api/turmas/gestor'
      ];
      
    case 'componentes':
      return [
        ...baseQueries,
        '/api/componentes'
      ];
      
    case 'matriculas':
      return [
        ...baseQueries,
        '/api/matriculas',
        '/api/students/manager'
      ];
      
    default:
      return baseQueries;
  }
};

// Hooks específicos para cada tipo de operação
export const useCreateUsuario = () => {
  return useEnhancedMutation({
    mutationFn: (userData) => apiRequest('POST', '/api/usuarios', userData),
    mutationType: 'usuarios'
  });
};

export const useUpdateUsuario = () => {
  return useEnhancedMutation({
    mutationFn: ({ id, ...userData }) => apiRequest('PUT', `/api/usuarios/${id}`, userData),
    mutationType: 'usuarios'
  });
};

export const useDeleteUsuario = () => {
  return useEnhancedMutation({
    mutationFn: (id) => apiRequest('DELETE', `/api/usuarios/${id}`),
    mutationType: 'usuarios'
  });
};

export const useCreateEscola = () => {
  return useEnhancedMutation({
    mutationFn: (escolaData) => apiRequest('POST', '/api/escolas', escolaData),
    mutationType: 'escolas'
  });
};

export const useUpdateEscola = () => {
  return useEnhancedMutation({
    mutationFn: ({ id, ...escolaData }) => apiRequest('PUT', `/api/escolas/${id}`, escolaData),
    mutationType: 'escolas'
  });
};

export const useCreateTurma = () => {
  return useEnhancedMutation({
    mutationFn: (turmaData) => apiRequest('POST', '/api/turmas', turmaData),
    mutationType: 'turmas'
  });
};

export const useUpdateTurma = () => {
  return useEnhancedMutation({
    mutationFn: ({ id, ...turmaData }) => apiRequest('PUT', `/api/turmas/${id}`, turmaData),
    mutationType: 'turmas'
  });
};

export const useCreateMatricula = () => {
  return useEnhancedMutation({
    mutationFn: (matriculaData) => apiRequest('POST', '/api/matriculas', matriculaData),
    mutationType: 'matriculas'
  });
};