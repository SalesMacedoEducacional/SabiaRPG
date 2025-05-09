import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
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
  const { toast } = useToast();
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

        // Se o usuário for um gestor, verificar a escola vinculada
        if (userData && userData.role === 'manager') {
          try {
            // Verificar se já temos um school_id válido em localStorage/sessionStorage
            const savedSchoolId = sessionStorage.getItem('saved_school_id');
            if (savedSchoolId && !userData.escola_id) {
              console.log('Recuperando ID da escola salvo no sessionStorage:', savedSchoolId);
              userData.escola_id = savedSchoolId;
            }
            
            // Verificar no servidor a escola vinculada
            const schoolResponse = await apiRequest('GET', '/api/schools/check-manager-school');
            if (schoolResponse.ok) {
              const schoolData = await schoolResponse.json();
              
              if (schoolData.hasSchool && schoolData.school && schoolData.school.id) {
                console.log('Escola encontrada para o gestor:', schoolData.school.id);
                
                // Atualizar o ID da escola no usuário
                userData.escola_id = schoolData.school.id;
                
                // Salvar no sessionStorage também
                sessionStorage.setItem('saved_school_id', schoolData.school.id);
                sessionStorage.setItem('saved_school_name', schoolData.school.nome || '');
                sessionStorage.setItem('saved_school_code', schoolData.school.codigo_escola || '');
              }
            }
          } catch (error) {
            console.error('Erro ao verificar escola do gestor:', error);
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
      const response = await apiRequest('POST', '/api/auth/login', { email, password });
      const data = await response.json();
      console.log('Login response:', data);
      return data;
    },
    onSuccess: async (data) => {
      // Inicialmente, usar os dados retornados do login
      queryClient.setQueryData(['/api/auth/me'], data);
      
      // Salvar no localStorage para persistência
      localStorage.setItem('auth_user', JSON.stringify(data));
      
      // Se o usuário for um gestor, verificar se há uma escola associada
      if (data.role === 'manager') {
        try {
          // Verificar escola vinculada
          const schoolResponse = await apiRequest('GET', '/api/schools/check-manager-school');
          if (schoolResponse.ok) {
            const schoolData = await schoolResponse.json();
            
            // Se encontrou escola, atualizar o contexto do usuário com o ID da escola
            if (schoolData.hasSchool && schoolData.school && schoolData.school.id) {
              console.log('Escola encontrada para o gestor após login:', schoolData.school.id);
              
              // Atualizar o contexto e localStorage com o ID da escola
              const updatedUserData = {
                ...data,
                escola_id: schoolData.school.id
              };
              
              // Atualizar cache e localStorage
              queryClient.setQueryData(['/api/auth/me'], updatedUserData);
              localStorage.setItem('auth_user', JSON.stringify(updatedUserData));
              
              // Salvar dados básicos no sessionStorage também
              sessionStorage.setItem('saved_school_id', schoolData.school.id);
              sessionStorage.setItem('saved_school_name', schoolData.school.nome || '');
              sessionStorage.setItem('saved_school_code', schoolData.school.codigo_escola || '');
              
              // Redirecionamento para o dashboard do gestor será feito pela página de login
            } else {
              // Escola não encontrada - Definir flag para redirecionamento ao formulário de escola
              console.log('Gestor não possui escola vinculada, será redirecionado para cadastro de escola');
              localStorage.setItem('manager_needs_school', 'true');
            }
          } else {
            // Erro na verificação ou escola não encontrada
            console.log('Gestor não possui escola vinculada ou houve erro na verificação');
            localStorage.setItem('manager_needs_school', 'true');
          }
        } catch (error) {
          console.error('Erro ao verificar escola do gestor após login:', error);
          // Por segurança, também marcar para redirecionamento
          localStorage.setItem('manager_needs_school', 'true');
        }
      }
      
      toast({
        title: "Login bem-sucedido!",
        description: `Bem-vindo de volta, ${data.username}!`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Falha no login",
        description: error.message || "Credenciais inválidas. Por favor, tente novamente.",
        variant: "destructive",
      });
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
      toast({
        title: "Registro bem-sucedido!",
        description: `Bem-vindo, ${data.username}!`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Falha no registro",
        description: error.message || "Não foi possível criar sua conta. Por favor, tente novamente.",
        variant: "destructive",
      });
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
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao fazer logout",
        description: "Ocorreu um erro ao tentar sair. Por favor, tente novamente.",
        variant: "destructive",
      });
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

// Função useAuth movida para hooks/use-auth.ts
