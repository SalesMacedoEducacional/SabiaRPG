import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { useStandardToast } from '@/lib/toast-utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserPermissions, hasPermission as checkPermission } from '@/lib/permissions';

interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: 'student' | 'teacher' | 'manager';
  avatarUrl?: string;
  level: number;
  xp: number;
  createdAt: string;
  escola_id?: string; // ID da escola vinculada (principalmente para gestores)
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  userPermissions: string[];
  hasPermission: (permissionId: string) => boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}

interface RegisterData {
  email: string;
  password: string;
  username: string;
  fullName: string;
  role?: 'student' | 'teacher' | 'manager';
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const toast = useStandardToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(true);

  // Fetch current user
  const { data: user, isLoading: userLoading } = useQuery<User | null>({
    queryKey: ['/api/auth/me'],
    queryFn: async () => {
      try {
        console.log('Verificando autenticação do usuário em /api/auth/me');
        const response = await apiRequest('GET', '/api/auth/me');
        
        console.log('Resposta /api/auth/me:', response.status);
        
        if (!response.ok) {
          if (response.status === 401) {
            console.log('Usuário não autenticado');
            return null;
          }
          console.error('Erro na resposta:', response.status);
          throw new Error('Failed to fetch user');
        }
        
        const userData = await response.json();
        console.log('Dados do usuário:', userData);

        // Se o usuário for um gestor, verificar imediatamente o vínculo com escolas
        if (userData && userData.role === 'manager') {
          try {
            console.log('Verificando vínculo do gestor com escolas...');
            
            // Buscar escolas vinculadas diretamente no banco
            const schoolResponse = await apiRequest('GET', '/api/manager/dashboard-stats');
            
            if (schoolResponse.ok) {
              const dashboardData = await schoolResponse.json();
              
              if (dashboardData.escolas && dashboardData.escolas.length > 0) {
                console.log('Escolas vinculadas encontradas:', dashboardData.escolas.length);
                
                // Se há apenas uma escola, definir como escola_id principal
                if (dashboardData.escolas.length === 1) {
                  userData.escola_id = dashboardData.escolas[0].id;
                  sessionStorage.setItem('saved_school_id', dashboardData.escolas[0].id);
                  sessionStorage.setItem('saved_school_name', dashboardData.escolas[0].nome || '');
                }
                
                // Marcar que o gestor tem escolas vinculadas
                localStorage.removeItem('manager_needs_school');
                sessionStorage.setItem('manager_has_schools', 'true');
              } else {
                console.log('Gestor não possui escolas vinculadas');
                // Marcar que precisa cadastrar escola
                localStorage.setItem('manager_needs_school', 'true');
                sessionStorage.removeItem('manager_has_schools');
              }
            } else if (schoolResponse.status === 404) {
              console.log('Nenhuma escola vinculada encontrada');
              localStorage.setItem('manager_needs_school', 'true');
              sessionStorage.removeItem('manager_has_schools');
            }
          } catch (error) {
            console.error('Erro ao verificar escolas vinculadas:', error);
            // Em caso de erro, assumir que precisa verificar
            localStorage.setItem('manager_needs_school', 'true');
          }
        }
        
        return userData;
      } catch (error) {
        console.error('Erro ao buscar usuário:', error);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    retry: false,
    enabled: true
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      // Debug log
      console.log('Trying to login with:', { email });
      const response = await apiRequest('POST', '/api/auth/login', { email, senha: password });
      const data = await response.json();
      console.log('Login response:', data);
      return data;
    },
    onSuccess: async (data) => {
      // Inicialmente, usar os dados retornados do login
      queryClient.setQueryData(['/api/auth/me'], data);
      
      // Salvar no localStorage para persistência
      localStorage.setItem('auth_user', JSON.stringify(data));
      
      // Se o usuário for um gestor, verificar imediatamente as escolas vinculadas
      if (data.role === 'manager') {
        try {
          console.log('Verificando escolas vinculadas após login...');
          
          // Buscar escolas vinculadas usando a API de dashboard
          const dashboardResponse = await apiRequest('GET', '/api/manager/dashboard-stats');
          
          if (dashboardResponse.ok) {
            const dashboardData = await dashboardResponse.json();
            
            if (dashboardData.escolas && dashboardData.escolas.length > 0) {
              console.log(`Gestor possui ${dashboardData.escolas.length} escola(s) vinculada(s)`);
              
              // Atualizar dados do usuário com informações da escola principal
              const updatedUserData = {
                ...data,
                escola_id: dashboardData.escolas[0].id // Usar primeira escola como principal
              };
              
              // Atualizar cache e localStorage
              queryClient.setQueryData(['/api/auth/me'], updatedUserData);
              localStorage.setItem('auth_user', JSON.stringify(updatedUserData));
              
              // Salvar informações das escolas
              sessionStorage.setItem('saved_school_id', dashboardData.escolas[0].id);
              sessionStorage.setItem('saved_school_name', dashboardData.escolas[0].nome || '');
              sessionStorage.setItem('manager_has_schools', 'true');
              
              // Remover flag de necessidade de escola
              localStorage.removeItem('manager_needs_school');
            } else {
              console.log('Gestor não possui escolas vinculadas');
              localStorage.setItem('manager_needs_school', 'true');
              sessionStorage.removeItem('manager_has_schools');
            }
          } else if (dashboardResponse.status === 404) {
            console.log('Nenhuma escola encontrada para o gestor');
            localStorage.setItem('manager_needs_school', 'true');
            sessionStorage.removeItem('manager_has_schools');
          } else {
            console.log('Erro ao verificar escolas do gestor');
            localStorage.setItem('manager_needs_school', 'true');
          }
        } catch (error) {
          console.error('Erro ao verificar escolas do gestor após login:', error);
          localStorage.setItem('manager_needs_school', 'true');
        }
      }
      
      // Buscar nome completo do usuário no banco de dados e exibir notificação
      setTimeout(async () => {
        try {
          const response = await apiRequest('GET', `/api/usuarios/${data.id}`);
          const usuario = await response.json();
          
          if (usuario && usuario.nome) {
            // Exibir notificação com nome completo do banco
            toast.success(`Login realizado com sucesso! Bem-vindo de volta, ${usuario.nome}!`);
          } else {
            // Fallback caso não encontre nome no banco
            toast.success('Login realizado com sucesso! Bem-vindo de volta!');
          }
        } catch (error) {
          console.error('Erro ao buscar dados do usuário:', error);
          // Fallback em caso de erro
          toast.success('Login realizado com sucesso! Bem-vindo de volta!');
        }
      }, 100);
    },
    onError: (error: any) => {
      toast.error("Falha no login", error.message || "Credenciais inválidas. Por favor, tente novamente.");
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (userData: RegisterData) => {
      const response = await apiRequest('POST', '/api/auth/register', userData);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['/api/auth/me'], data);
      const userName = data.fullName || data.username || 'usuário';
      toast.success("Registro bem-sucedido!", `Bem-vindo, ${userName}!`);
    },
    onError: (error: any) => {
      toast.error("Falha no registro", error.message || "Não foi possível criar sua conta. Por favor, tente novamente.");
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', '/api/auth/logout', {});
    },
    onSuccess: () => {
      queryClient.setQueryData(['/api/auth/me'], null);
      queryClient.invalidateQueries();
      toast.logoutSuccess();
    },
    onError: () => {
      toast.error("Erro ao fazer logout", "Ocorreu um erro ao tentar sair. Por favor, tente novamente.");
    },
  });

  useEffect(() => {
    if (!userLoading) {
      setIsLoading(false);
    }
  }, [userLoading]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    await loginMutation.mutateAsync({ email, password });
    setIsLoading(false);
  };

  const register = async (userData: RegisterData) => {
    setIsLoading(true);
    await registerMutation.mutateAsync(userData);
    setIsLoading(false);
  };

  const logout = async () => {
    setIsLoading(true);
    await logoutMutation.mutateAsync();
    setIsLoading(false);
  };

  // Calcular permissões do usuário
  const userPermissions = getUserPermissions(user || null);
  
  // Função para verificar se o usuário tem uma permissão específica
  const hasPermission = (permissionId: string): boolean => {
    return userPermissions.includes(permissionId);
  };
  
  // Função para atualizar os dados do usuário no contexto e localStorage
  const updateUser = (userData: Partial<User>) => {
    if (!user) return;
    
    // Combinar dados atuais com novos dados
    const updatedUser = { ...user, ...userData };
    
    // Atualizar o cache de consulta
    queryClient.setQueryData(['/api/auth/me'], updatedUser);
    
    // Atualizar também no localStorage para persistência entre recargas
    try {
      const storedUserData = localStorage.getItem('auth_user');
      if (storedUserData) {
        const parsedUserData = JSON.parse(storedUserData);
        // Mesclar com os dados existentes e atualizar
        const mergedUserData = { ...parsedUserData, ...userData };
        localStorage.setItem('auth_user', JSON.stringify(mergedUserData));
        console.log('Usuário atualizado no localStorage:', mergedUserData);
      } else {
        // Se não encontrar no localStorage, salvar o objeto atualizado completo
        localStorage.setItem('auth_user', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error('Erro ao persistir atualização no localStorage:', error);
    }
    
    console.log('Usuário atualizado no contexto:', updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        isAuthenticated: !!user,
        isLoading,
        userPermissions,
        hasPermission,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Re-exportando o hook useAuth para manter compatibilidade
export { useAuth } from '../hooks/use-auth';
