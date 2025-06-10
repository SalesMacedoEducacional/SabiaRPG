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
  // BYPASS TEMPORÁRIO PARA DESENVOLVIMENTO - REMOVER EM PRODUÇÃO
  if (path === '/dashboard-gestor-moderno' || path === '/manager') {
    return <Route path={path} component={Component} />;
  }
  
  // Importante: manter todos os hooks sempre na mesma ordem
  const auth = useAuth();
  const { user, isLoading, hasPermission } = auth;
  const [checkingSchools, setCheckingSchools] = useState(false);
  const [hasSchools, setHasSchools] = useState(true); // Assume true para evitar redirecionamento desnecessário
  
  // Após a adição do campo escola_id no contexto do usuário, não precisamos mais verificar escolas
  // através de uma chamada separada - podemos verificar diretamente no objeto do usuário
  useEffect(() => {
    // Se estiver carregando o dashboard do gestor, verificar se tem escola vinculada
    if (user?.role === 'manager' && path === '/manager') {
      setCheckingSchools(true);
      
      // Se o usuário já tem o campo escola_id preenchido, não precisa fazer a chamada API
      if (user.escola_id) {
        console.log('Gestor já possui escola vinculada:', user.escola_id);
        setHasSchools(true);
        setCheckingSchools(false);
      } else {
        // Caso não tenha, verificar no servidor por segurança
        const checkForSchools = async () => {
          try {
            const response = await apiRequest('GET', '/api/schools/check-has-schools');
            
            if (response.status === 200) {
              const data = await response.json();
              setHasSchools(data.hasSchools);
              console.log('Verificação de escolas:', data);
            } else {
              // Em caso de erro, assume que não tem escolas para ser seguro
              console.warn('Erro ao verificar escolas. Status:', response.status);
              setHasSchools(false);
            }
          } catch (error) {
            console.error('Erro ao verificar escolas:', error);
            setHasSchools(false);
          } finally {
            setCheckingSchools(false);
          }
        };
        
        checkForSchools();
      }
    }
  }, [user, path]);
  
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
  
  // Verificação especial para gestores - redireciona para cadastro de escola se não tiver escola vinculada
  if (user?.role === 'manager' && path === '/manager' && !user.escola_id) {
    console.log('Gestor sem escola vinculada. Redirecionando para cadastro...');
    return (
      <Route path={path}>
        <Redirect to="/school-registration" />
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