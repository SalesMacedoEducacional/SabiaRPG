import { useEffect } from 'react';
import { useLocation } from 'wouter';

/**
 * Hook para persistir a rota atual e restaurá-la após reload
 */
export const useRoutePersistence = () => {
  const [location, setLocation] = useLocation();

  // Salvar rota atual sempre que mudar
  useEffect(() => {
    const currentRoute = window.location.pathname + window.location.search;
    sessionStorage.setItem('sabiarpg_current_route', currentRoute);
  }, [location]);

  // Restaurar rota salva na inicialização
  useEffect(() => {
    const savedRoute = sessionStorage.getItem('sabiarpg_current_route');
    
    if (savedRoute && savedRoute !== '/' && savedRoute !== window.location.pathname + window.location.search) {
      // Aguardar autenticação antes de redirecionar
      const timer = setTimeout(() => {
        setLocation(savedRoute);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [setLocation]);

  // Limpar rota salva quando necessário
  const clearSavedRoute = () => {
    sessionStorage.removeItem('sabiarpg_current_route');
  };

  // Salvar rota específica
  const saveCurrentRoute = () => {
    const currentRoute = window.location.pathname + window.location.search;
    sessionStorage.setItem('sabiarpg_current_route', currentRoute);
  };

  return {
    clearSavedRoute,
    saveCurrentRoute
  };
};