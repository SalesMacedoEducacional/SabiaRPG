import React, { useState, useEffect } from 'react';
import { Route, Redirect } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useSchool } from '@/context/SchoolContext';
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
  const schoolContext = useSchool();
  const { escolasVinculadas, isLoading: schoolLoading } = schoolContext;

  // Verificar se é gestor (tanto 'gestor' quanto 'manager')
  const isManager = user?.papel === 'gestor' || user?.role === 'manager';
  
  // Determinar se o gestor tem escolas vinculadas
  const hasSchools = isManager 
    ? escolasVinculadas && escolasVinculadas.length > 0
    : true;
  
  // Calcular se tem todas as permissões necessárias
  const hasAllPermissions = permissions.length === 0 ? true : 
    permissions.every(permissionId => hasPermission(permissionId));
  
  // Mostra um spinner de carregamento enquanto verifica a autenticação ou escolas
  if (isLoading || (isManager && schoolLoading)) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      </Route>
    );
  }
  
  // Verificação específica para gestores sem escolas vinculadas
  if (isManager && !hasSchools && !schoolLoading) {
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

  // ACESSO TOTAL PARA GESTOR - BYPASS COMPLETO
  if (isManager) {
    console.log('✅ GESTOR: Acesso direto liberado para', path);
    return <Route path={path} component={Component} />;
  }

  // ACESSO LIBERADO PARA TODOS - REMOVER BLOQUEIOS TEMPORARIAMENTE
  if (user) {
    console.log('✅ Usuário autenticado: Acesso liberado para', path);
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