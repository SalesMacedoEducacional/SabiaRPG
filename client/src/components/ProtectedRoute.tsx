import React from 'react';
import { Route, Redirect } from 'wouter';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  path: string;
  component: React.ComponentType<any>;
  permissions?: string[]; // Lista de permissões necessárias para acessar a rota
  requireAuth?: boolean; // Se true, requer autenticação mesmo sem permissões específicas
}

/**
 * Componente para proteger rotas com base em autenticação e permissões.
 * Se o usuário não estiver autenticado ou não tiver as permissões necessárias,
 * será redirecionado para a página de login ou página de acesso negado.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  path,
  component: Component,
  permissions = [],
  requireAuth = true
}) => {
  const { user, isLoading } = useAuth();
  
  // Mostra um spinner de carregamento enquanto verifica a autenticação
  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      </Route>
    );
  }

  // Verifica autenticação se necessário
  if (requireAuth && !user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  // Se não há permissões específicas requeridas, apenas renderiza o componente
  if (permissions.length === 0) {
    return <Route path={path} component={Component} />;
  }

  // Verifica se o usuário tem TODAS as permissões requeridas
  const { hasPermission } = useAuth();
  const hasAllPermissions = permissions.every(permissionId => 
    hasPermission(permissionId)
  );

  if (!hasAllPermissions) {
    return (
      <Route path={path}>
        <Redirect to="/acesso-negado" />
      </Route>
    );
  }

  // Se chegou aqui, o usuário está autenticado e tem todas as permissões necessárias
  return <Route path={path} component={Component} />;
};

export default ProtectedRoute;