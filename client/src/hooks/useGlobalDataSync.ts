import { useEffect, useRef, useState, useCallback } from 'react';
import { queryClient } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';

interface PerformanceMetric {
  operation: string;
  duration: number;
  timestamp: number;
  success: boolean;
}

/**
 * Sistema global de sincronização de dados em tempo real
 * Escuta mutações e dispara refetch automático de todas as queries relacionadas
 */
export const useGlobalDataSync = () => {
  const { user } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
  const [mutationCount, setMutationCount] = useState(0);
  const [lastMutationType, setLastMutationType] = useState('');
  const lastRefreshTime = useRef<number>(0);
  const refreshTimeoutRef = useRef<NodeJS.Timeout>();

  // Track performance function
  const trackPerformance = useCallback((operation: string, duration: number, success: boolean) => {
    const metric: PerformanceMetric = {
      operation,
      duration,
      timestamp: Date.now(),
      success
    };
    
    setPerformanceMetrics(prev => [...prev.slice(-19), metric]);
    
    if (operation.includes('mutation')) {
      setMutationCount(prev => prev + 1);
      setLastMutationType(operation);
    }
  }, []);

  // Debounce para evitar múltiplos refetches simultâneos
  const debounceRefresh = useCallback((callback: () => void, delay: number = 300) => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
    refreshTimeoutRef.current = setTimeout(callback, delay);
  }, []);

  // Função principal de refresh com performance tracking
  const refreshAllData = useCallback(async (source: string = 'manual') => {
    const startTime = performance.now();
    console.log(`🔄 Iniciando refresh global de dados - Fonte: ${source}`);
    
    setIsRefreshing(true);
    
    try {
      // Invalidar todas as queries relacionadas a dados principais
      const queriesToRefresh = [
        // Dados do gestor
        '/api/manager/dashboard-stats',
        '/api/manager/dashboard-instant',
        '/api/escolas/gestor',
        
        // Usuários
        '/api/usuarios',
        '/api/usuarios/gestor',
        '/api/students/manager',
        '/api/teachers/manager',
        
        // Escolas e turmas
        '/api/escolas',
        '/api/turmas',
        '/api/turmas/gestor',
        
        // Componentes e matrículas
        '/api/componentes',
        '/api/matriculas',
        
        // Estados e localizações
        '/api/estados',
        '/api/cidades'
      ];

      // Executar invalidações em paralelo
      await Promise.all(
        queriesToRefresh.map(queryKey => 
          queryClient.invalidateQueries({ queryKey: [queryKey] })
        )
      );

      // Forçar refetch das queries ativas
      await queryClient.refetchQueries({ 
        type: 'active',
        stale: true 
      });

      const endTime = performance.now();
      const duration = endTime - startTime;
      
      console.log(`✅ Refresh global concluído em ${duration.toFixed(2)}ms - Fonte: ${source}`);
      
      // Track performance metrics
      trackPerformance(`refresh-${source}`, duration, true);
      
      // QoS Test - verificar se está dentro do limite de 500ms
      if (duration > 500) {
        console.warn(`⚠️ Refresh demorou ${duration.toFixed(2)}ms - acima do limite de 500ms`);
      }
      
      lastRefreshTime.current = Date.now();
      
    } catch (error) {
      console.error('❌ Erro durante refresh global:', error);
      
      trackPerformance(`refresh-${source}`, performance.now() - startTime, false);
      
      // Fallback para notificação discreta
      const errorMessage = document.createElement('div');
      errorMessage.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded z-50 text-sm';
      errorMessage.textContent = 'Não foi possível atualizar: tente novamente';
      document.body.appendChild(errorMessage);
      
      setTimeout(() => {
        if (document.body.contains(errorMessage)) {
          document.body.removeChild(errorMessage);
        }
      }, 5000);
      
    } finally {
      setIsRefreshing(false);
    }
  }, [trackPerformance]);

  // Função para refresh específico por tipo de dados
  const refreshSpecificData = useCallback(async (dataType: 'usuarios' | 'escolas' | 'turmas' | 'componentes' | 'matriculas') => {
    const startTime = performance.now();
    console.log(`🔄 Refresh específico: ${dataType}`);
    
    setIsRefreshing(true);
    
    try {
      let queriesToRefresh: string[] = [];
      
      switch (dataType) {
        case 'usuarios':
          queriesToRefresh = [
            '/api/usuarios',
            '/api/usuarios/gestor',
            '/api/students/manager',
            '/api/teachers/manager',
            '/api/manager/dashboard-stats',
            '/api/manager/dashboard-instant'
          ];
          break;
          
        case 'escolas':
          queriesToRefresh = [
            '/api/escolas',
            '/api/escolas/gestor',
            '/api/manager/dashboard-stats',
            '/api/manager/dashboard-instant'
          ];
          break;
          
        case 'turmas':
          queriesToRefresh = [
            '/api/turmas',
            '/api/turmas/gestor',
            '/api/manager/dashboard-stats',
            '/api/manager/dashboard-instant'
          ];
          break;
          
        case 'componentes':
          queriesToRefresh = [
            '/api/componentes',
            '/api/manager/dashboard-stats'
          ];
          break;
          
        case 'matriculas':
          queriesToRefresh = [
            '/api/matriculas',
            '/api/students/manager',
            '/api/manager/dashboard-stats',
            '/api/manager/dashboard-instant'
          ];
          break;
      }
      
      await Promise.all(
        queriesToRefresh.map(queryKey => 
          queryClient.invalidateQueries({ queryKey: [queryKey] })
        )
      );
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      console.log(`✅ Refresh ${dataType} concluído em ${duration.toFixed(2)}ms`);
      trackPerformance(`refresh-specific-${dataType}`, duration, true);
      
    } catch (error) {
      console.error(`❌ Erro no refresh de ${dataType}:`, error);
      trackPerformance(`refresh-specific-${dataType}`, performance.now() - startTime, false);
    } finally {
      setIsRefreshing(false);
    }
  }, [trackPerformance]);

  // Auto-refresh periódico para dados críticos (a cada 30 segundos)
  useEffect(() => {
    if (!user) return;
    
    const interval = setInterval(() => {
      // Só faz auto-refresh se não houve refresh manual recente (últimos 10 segundos)
      const timeSinceLastRefresh = Date.now() - lastRefreshTime.current;
      if (timeSinceLastRefresh > 10000) {
        debounceRefresh(() => refreshAllData('auto-refresh'));
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, [user, debounceRefresh, refreshAllData]);

  // Escutar eventos personalizados de mutação
  useEffect(() => {
    const handleDataMutation = (event: CustomEvent) => {
      const { type, data } = event.detail;
      console.log(`📡 Evento de mutação detectado: ${type}`, data);
      
      // Track mutation event
      trackPerformance(`mutation-${type}`, 0, true);
      
      debounceRefresh(() => {
        if (type.includes('usuario')) {
          refreshSpecificData('usuarios');
        } else if (type.includes('escola')) {
          refreshSpecificData('escolas');
        } else if (type.includes('turma')) {
          refreshSpecificData('turmas');
        } else if (type.includes('componente')) {
          refreshSpecificData('componentes');
        } else if (type.includes('matricula')) {
          refreshSpecificData('matriculas');
        } else {
          refreshAllData('mutation-event');
        }
      });
    };

    // Registrar listener para eventos de mutação
    window.addEventListener('data-mutation', handleDataMutation as EventListener);
    
    return () => {
      window.removeEventListener('data-mutation', handleDataMutation as EventListener);
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [debounceRefresh, refreshAllData, refreshSpecificData, trackPerformance]);

  return {
    isRefreshing,
    refreshAllData,
    refreshSpecificData,
    lastRefreshTime: lastRefreshTime.current,
    performanceMetrics,
    mutationCount,
    lastMutationType
  };
};

// Função utilitária para disparar eventos de mutação
export const triggerDataMutation = (type: string, data?: any) => {
  const event = new CustomEvent('data-mutation', {
    detail: { type, data, timestamp: Date.now() }
  });
  window.dispatchEvent(event);
  console.log(`🚀 Evento de mutação disparado: ${type}`, data);
};