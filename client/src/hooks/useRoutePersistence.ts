import { useEffect } from 'react';
import { useLocation } from 'wouter';

const ROUTE_STORAGE_KEY = 'sabi_current_route';
const ROUTE_PARAMS_KEY = 'sabi_route_params';
const ROUTE_STATE_KEY = 'sabi_route_state';

interface RouteState {
  pathname: string;
  search: string;
  hash: string;
  state?: any;
  timestamp: number;
}

/**
 * Hook para persistir a rota atual e restaurar após reload
 * Mantém o usuário na mesma tela mesmo após recarregar o navegador
 */
export const useRoutePersistence = () => {
  const [location, setLocation] = useLocation();

  // Salvar rota atual sempre que mudar
  useEffect(() => {
    const saveCurrentRoute = () => {
      const routeState: RouteState = {
        pathname: window.location.pathname,
        search: window.location.search,
        hash: window.location.hash,
        state: history.state,
        timestamp: Date.now()
      };

      try {
        sessionStorage.setItem(ROUTE_STORAGE_KEY, JSON.stringify(routeState));
        console.log(`💾 Rota salva: ${routeState.pathname}${routeState.search}`);
      } catch (error) {
        console.warn('Erro ao salvar rota:', error);
      }
    };

    // Salvar a rota atual
    saveCurrentRoute();

    // Escutar mudanças de rota via popstate
    const handlePopState = () => {
      saveCurrentRoute();
    };

    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [location]);

  // Restaurar rota ao inicializar a aplicação
  useEffect(() => {
    const restoreRoute = () => {
      try {
        const savedRoute = sessionStorage.getItem(ROUTE_STORAGE_KEY);
        
        if (savedRoute) {
          const routeState: RouteState = JSON.parse(savedRoute);
          
          // Verificar se a rota não é muito antiga (máximo 24 horas)
          const maxAge = 24 * 60 * 60 * 1000; // 24 horas
          const isRouteValid = (Date.now() - routeState.timestamp) < maxAge;
          
          if (isRouteValid && routeState.pathname !== '/login') {
            const fullPath = `${routeState.pathname}${routeState.search}${routeState.hash}`;
            
            // Apenas restaurar se não estivermos já na rota correta
            if (window.location.pathname !== routeState.pathname) {
              console.log(`🔄 Restaurando rota: ${fullPath}`);
              setLocation(fullPath);
            }
          } else {
            // Limpar rota antiga ou inválida
            sessionStorage.removeItem(ROUTE_STORAGE_KEY);
          }
        }
      } catch (error) {
        console.warn('Erro ao restaurar rota:', error);
        sessionStorage.removeItem(ROUTE_STORAGE_KEY);
      }
    };

    // Executar restauração apenas se não estivermos na página de login
    if (window.location.pathname !== '/login') {
      restoreRoute();
    }
  }, [setLocation]);

  // Funções utilitárias para manipular persistência de rota
  const saveRouteState = (state: any) => {
    try {
      sessionStorage.setItem(ROUTE_STATE_KEY, JSON.stringify(state));
    } catch (error) {
      console.warn('Erro ao salvar estado da rota:', error);
    }
  };

  const getRouteState = () => {
    try {
      const saved = sessionStorage.getItem(ROUTE_STATE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.warn('Erro ao recuperar estado da rota:', error);
      return null;
    }
  };

  const clearRouteState = () => {
    try {
      sessionStorage.removeItem(ROUTE_STORAGE_KEY);
      sessionStorage.removeItem(ROUTE_PARAMS_KEY);
      sessionStorage.removeItem(ROUTE_STATE_KEY);
      console.log('🗑️ Estado de rota limpo');
    } catch (error) {
      console.warn('Erro ao limpar estado da rota:', error);
    }
  };

  // Função para forçar navegação com persistência
  const navigateWithPersistence = (path: string, state?: any) => {
    if (state) {
      saveRouteState(state);
    }
    setLocation(path);
  };

  return {
    saveRouteState,
    getRouteState,
    clearRouteState,
    navigateWithPersistence
  };
};

// Hook para salvar estado de filtros e scroll position
export const useViewStatePersistence = (viewKey: string) => {
  const saveViewState = (state: any) => {
    try {
      const viewStateKey = `sabi_view_${viewKey}`;
      const viewState = {
        ...state,
        timestamp: Date.now(),
        scrollY: window.scrollY
      };
      sessionStorage.setItem(viewStateKey, JSON.stringify(viewState));
    } catch (error) {
      console.warn(`Erro ao salvar estado da view ${viewKey}:`, error);
    }
  };

  const getViewState = () => {
    try {
      const viewStateKey = `sabi_view_${viewKey}`;
      const saved = sessionStorage.getItem(viewStateKey);
      
      if (saved) {
        const state = JSON.parse(saved);
        
        // Verificar se o estado não é muito antigo (máximo 1 hora)
        const maxAge = 60 * 60 * 1000; // 1 hora
        const isStateValid = (Date.now() - state.timestamp) < maxAge;
        
        if (isStateValid) {
          // Restaurar posição de scroll se existir
          if (state.scrollY && state.scrollY > 0) {
            setTimeout(() => {
              window.scrollTo(0, state.scrollY);
            }, 100);
          }
          
          return state;
        } else {
          // Limpar estado antigo
          sessionStorage.removeItem(viewStateKey);
        }
      }
      
      return null;
    } catch (error) {
      console.warn(`Erro ao recuperar estado da view ${viewKey}:`, error);
      return null;
    }
  };

  const clearViewState = () => {
    try {
      const viewStateKey = `sabi_view_${viewKey}`;
      sessionStorage.removeItem(viewStateKey);
    } catch (error) {
      console.warn(`Erro ao limpar estado da view ${viewKey}:`, error);
    }
  };

  return {
    saveViewState,
    getViewState,
    clearViewState
  };
};