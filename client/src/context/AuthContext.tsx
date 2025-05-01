import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(true);

  // Fetch current user
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['/api/auth/me'],
    onError: () => {
      setIsLoading(false);
    },
    onSuccess: () => {
      setIsLoading(false);
    },
    retry: false,
    enabled: true
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const response = await apiRequest('POST', '/api/auth/login', { email, password });
      return response.json();
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

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
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
