import React, { useState, useEffect } from 'react';
import { Route, Redirect } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

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

  
  // Importante: manter todos os hooks sempre na mesma ordem
  const auth = useAuth();
  const { user, isLoading, hasPermission, escolasVinculadas, verificarEscolasGestor } = auth;
  const [checkingSchools, setCheckingSchools] = useState(false);
  const [hasSchools, setHasSchools] = useState(true); // Assume true para evitar redirecionamento desnecessário
  
  // Verificar escolas vinculadas para gestores
  useEffect(() => {
    if (user?.role === 'manager') {
      setCheckingSchools(true);
      
      // Se não tem escolas vinculadas, verificar no servidor
      if (escolasVinculadas.length === 0) {
        verificarEscolasGestor().then(() => {
          setCheckingSchools(false);
          // Após verificar, decidir se tem escolas
          setHasSchools(escolasVinculadas.length > 0);
        }).catch(() => {
          setCheckingSchools(false);
          setHasSchools(false);
        });
      } else {
        // Já tem escolas vinculadas
        setHasSchools(true);
        setCheckingSchools(false);
      }
    } else {
      // Não é gestor, não precisa verificar escolas
      setHasSchools(true);
      setCheckingSchools(false);
    }
  }, [user, escolasVinculadas, verificarEscolasGestor]);
  
  // Calcular se tem todas as permissões necessárias (fazendo aqui para evitar hooks condicionais)
  const hasAllPermissions = permissions.length === 0 ? true : 
    permissions.every(permissionId => hasPermission(permissionId));
  
  // Mostra um spinner de carregamento enquanto verifica a autenticação ou escolas
  if (isLoading || checkingSchools) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      </Route>
    );
  }
  
  // Managers access their dashboard directly - school associations are managed through perfis_gestor table
  // No need to redirect to school registration as managers can manage multiple schools

  // Verifica autenticação se necessário
  if (requireAuth && !user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }
  
  // Verificação especial para triagem diagnóstica
  // Alunos precisam passar pela triagem, professores e gestores vão diretamente para seus painéis
  if (user && path === '/') {
    console.log('ProtectedRoute - role:', user.role);
    
    // Se for aluno, verifica se precisa fazer triagem diagnóstica
    if (user.role === 'student') {
      const needsDiagnostic = localStorage.getItem('diagnostic_completed') !== 'true';
      if (needsDiagnostic) {
        return (
          <Route path={path}>
            <Component showDiagnostic={true} />
          </Route>
        );
      }
    } 
    // Se for professor, redireciona para dashboard de professor
    else if (user.role === 'teacher') {
      console.log('Redirecionando professor para /teacher');
      return (
        <Route path={path}>
          <Redirect to="/teacher" />
        </Route>
      );
    }
    // Se for gestor, redireciona para dashboard de gestor
    else if (user.role === 'manager') {
      console.log('Redirecionando gestor para /manager');
      localStorage.setItem('force_manager_dashboard', 'true');
      return (
        <Route path={path}>
          <Redirect to="/manager" />
        </Route>
      );
    }
  }

  // Se não há permissões específicas requeridas ou o usuário tem todas, renderiza o componente
  if (hasAllPermissions) {
    return <Route path={path} component={Component} />;
  }

  // Se não tem as permissões necessárias, redireciona para acesso negado
  return (
    <Route path={path}>
      <Redirect to="/acesso-negado" />
    </Route>
  );
};

export default ProtectedRoute;