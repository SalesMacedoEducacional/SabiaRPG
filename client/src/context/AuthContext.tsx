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
        const response = await fetch('/api/auth/me');
        
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
    onSuccess: (data) => {
      queryClient.setQueryData(['/api/auth/me'], data);
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
