import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export function useGestorTurmas() {
  return useQuery({
    queryKey: ['gestor', 'turmas'],
    queryFn: () => apiRequest('/api/turmas-gestor-real'),
  });
}

export function useGestorProfessores() {
  return useQuery({
    queryKey: ['gestor', 'professores'],
    queryFn: () => apiRequest('/api/professores-gestor-real'),
  });
}

export function useGestorAlunos() {
  return useQuery({
    queryKey: ['gestor', 'alunos'],
    queryFn: () => apiRequest('/api/alunos-gestor-real'),
  });
}