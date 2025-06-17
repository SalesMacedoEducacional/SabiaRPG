import { useCallback } from 'react';
import { apiRequest } from '@/lib/queryClient';

// Hook centralizado para refresh automático de dados após operações CRUD
export const useAutoRefresh = () => {
  
  // Função para refresh completo de todos os dados da plataforma
  const refreshAll = useCallback(async () => {
    try {
      // Disparar evento customizado para todos os componentes escutarem
      window.dispatchEvent(new CustomEvent('refreshAllData', {
        detail: { timestamp: Date.now() }
      }));
      
      // Refresh específico por tipo de dado
      window.dispatchEvent(new CustomEvent('refreshUserData'));
      window.dispatchEvent(new CustomEvent('refreshSchoolData'));
      window.dispatchEvent(new CustomEvent('refreshClassData'));
      window.dispatchEvent(new CustomEvent('refreshTeacherData'));
      window.dispatchEvent(new CustomEvent('refreshStudentData'));
      window.dispatchEvent(new CustomEvent('refreshComponentData'));
      
      console.log('Refresh automático disparado para todos os componentes');
    } catch (error) {
      console.error('Erro no refresh automático:', error);
    }
  }, []);

  // Função para refresh após operações de cadastro
  const refreshAfterCreate = useCallback(async (entityType: string) => {
    await refreshAll();
    console.log(`Refresh automático após criação de ${entityType}`);
  }, [refreshAll]);

  // Função para refresh após operações de atualização
  const refreshAfterUpdate = useCallback(async (entityType: string) => {
    await refreshAll();
    console.log(`Refresh automático após atualização de ${entityType}`);
  }, [refreshAll]);

  // Função para refresh após operações de exclusão
  const refreshAfterDelete = useCallback(async (entityType: string) => {
    await refreshAll();
    console.log(`Refresh automático após exclusão de ${entityType}`);
  }, [refreshAll]);

  // Função para limpar formulários após sucesso
  const resetForm = useCallback((formResetFunction: () => void) => {
    formResetFunction();
    console.log('Formulário limpo após operação bem-sucedida');
  }, []);

  return {
    refreshAll,
    refreshAfterCreate,
    refreshAfterUpdate,
    refreshAfterDelete,
    resetForm
  };
};