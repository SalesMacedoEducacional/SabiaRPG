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
  const { user, isLoading, hasPermission } = auth;
  const [checkingSchools, setCheckingSchools] = useState(false);
  const [hasSchools, setHasSchools] = useState(true); // Assume true para evitar redirecionamento desnecessário
  
  // Verificação específica para gestores - checar se possuem escolas vinculadas
  useEffect(() => {
    if (user?.role === 'manager') {
      setCheckingSchools(true);
      
      // Verificar flags no localStorage para decisão rápida
      const needsSchool = localStorage.getItem('manager_needs_school');
      const hasSchoolsFlag = sessionStorage.getItem('manager_has_schools');
      
      if (needsSchool === 'true') {
        console.log('Gestor precisa cadastrar escola');
        setHasSchools(false);
        setCheckingSchools(false);
      } else if (hasSchoolsFlag === 'true') {
        console.log('Gestor possui escolas vinculadas');
        setHasSchools(true);
        setCheckingSchools(false);
      } else {
        // Verificar no servidor se não há informação local
        console.log('Verificando escolas vinculadas no servidor...');
        checkManagerSchools();
      }
    } else {
      setCheckingSchools(false);
    }
  }, [user, path]);

  const checkManagerSchools = async () => {
    try {
      const response = await fetch('/api/manager/dashboard-stats', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.escolas && data.escolas.length > 0) {
          console.log('Escolas encontradas para o gestor');
          sessionStorage.setItem('manager_has_schools', 'true');
          localStorage.removeItem('manager_needs_school');
          setHasSchools(true);
        } else {
          console.log('Nenhuma escola vinculada encontrada');
          localStorage.setItem('manager_needs_school', 'true');
          sessionStorage.removeItem('manager_has_schools');
          setHasSchools(false);
        }
      } else if (response.status === 404) {
        console.log('Gestor não possui escolas vinculadas');
        localStorage.setItem('manager_needs_school', 'true');
        sessionStorage.removeItem('manager_has_schools');
        setHasSchools(false);
      } else {
        console.log('Erro ao verificar escolas');
        setHasSchools(false);
      }
    } catch (error) {
      console.error('Erro ao verificar escolas do gestor:', error);
      setHasSchools(false);
    } finally {
      setCheckingSchools(false);
    }
  };
  
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
  
  // Verificação específica para gestores sem escolas vinculadas
  if (user?.role === 'manager' && !hasSchools && !checkingSchools) {
    // Se o gestor não tem escolas vinculadas, redirecionar para cadastro de escola
    if (path !== '/school-registration') {
      console.log('Redirecionando gestor sem escolas para cadastro');
      return (
        <Route path={path}>
          <Redirect to="/school-registration" />
        </Route>
      );
    }
  }

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