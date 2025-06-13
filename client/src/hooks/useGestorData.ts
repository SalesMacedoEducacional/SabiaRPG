import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export function useGestorTurmas() {
  return useQuery({
    queryKey: ['gestor', 'turmas'],
    queryFn: async () => {
      const response = await apiRequest('/api/turmas-gestor-real');
      return response;
    },
  });
}

export function useGestorProfessores() {
  return useQuery({
    queryKey: ['gestor', 'professores'],
    queryFn: async () => {
      const response = await apiRequest('/api/professores-gestor-real');
      return response;
    },
  });
}

export function useGestorAlunos() {
  return useQuery({
    queryKey: ['gestor', 'alunos'],
    queryFn: async () => {
      const response = await apiRequest('/api/alunos-gestor-real');
      return response;
    },
  });
}