import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { queryClient } from '@/lib/queryClient';

// Hook para assinaturas realtime do Supabase
export function useRealtimeSubscriptions() {
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || (!user?.papel?.includes('gestor') && user?.papel !== 'manager')) {
      return;
    }

    console.log('🔄 CONFIGURANDO ASSINATURAS REALTIME...');

    // Função para recarregar dados dos cards instantaneamente
    const recarregarCards = () => {
      console.log('⚡ RECARREGANDO CARDS POR MUDANÇA REALTIME');
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['escolas'] });
      queryClient.invalidateQueries({ queryKey: ['turmas'] });
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
    };

    // Simular subscriptions usando polling otimizado
    const subscriptions = [
      // Monitorar mudanças em usuários
      setInterval(() => {
        // Verificar se houve mudanças recentes no cache
        const lastUpdate = localStorage.getItem('lastDataUpdate');
        const now = Date.now();
        
        if (!lastUpdate || (now - parseInt(lastUpdate)) > 5000) {
          // Se passou mais de 5 segundos, forçar revalidação
          recarregarCards();
          localStorage.setItem('lastDataUpdate', now.toString());
        }
      }, 10000), // Verificar a cada 10 segundos
      
      // Listener para mudanças locais (após mutações)
      setInterval(() => {
        const shouldRefresh = localStorage.getItem('forceRefreshCards');
        if (shouldRefresh === 'true') {
          recarregarCards();
          localStorage.removeItem('forceRefreshCards');
        }
      }, 1000) // Verificar a cada segundo
    ];

    // Cleanup ao desmontar
    return () => {
      subscriptions.forEach(clearInterval);
      console.log('🔄 Assinaturas realtime desconectadas');
    };
  }, [isAuthenticated, user]);

  // Função para forçar refresh após mutações
  const forceRefreshAfterMutation = () => {
    console.log('🔄 FORÇANDO REFRESH APÓS MUTAÇÃO');
    localStorage.setItem('forceRefreshCards', 'true');
    queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
  };

  return { forceRefreshAfterMutation };
}