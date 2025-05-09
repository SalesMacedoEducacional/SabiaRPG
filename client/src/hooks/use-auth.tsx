import { useContext } from "react";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "../lib/queryClient";
import { useToast } from "../hooks/use-toast";
import { AuthContext } from '../context/AuthContext';

// Interface para a tipagem do contexto de autenticação
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
  escola_id?: string;
}

interface RegisterData {
  email: string;
  password: string;
  username: string;
  fullName: string;
  role?: 'student' | 'teacher' | 'manager';
}

export function useAuth() {
  const existingAuth = useContext(AuthContext);
  const { toast } = useToast();
  
  if (!existingAuth) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  // Adaptar o uso para o formato esperado pelo ManagerDashboard
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await existingAuth.logout();
    },
    onSuccess: () => {
      queryClient.setQueryData(['/api/auth/me'], null);
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao fazer logout",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  return {
    ...existingAuth,
    logoutMutation
  };
}