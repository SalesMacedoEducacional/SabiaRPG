import { createContext, ReactNode, useContext } from "react";
import { useQuery, useMutation, UseMutationResult } from "@tanstack/react-query";
import { apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth as useExistingAuth } from './use-auth.ts';

type User = {
  id: string;
  email: string;
  username: string;
  fullName?: string;
  role: "student" | "teacher" | "manager";
  avatarUrl?: string;
  level?: number;
  xp?: number;
  createdAt?: Date;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<User, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<User, Error, RegisterData>;
};

type LoginData = {
  email: string;
  password: string;
};

type RegisterData = {
  email: string;
  username: string;
  password: string;
  fullName?: string;
  role?: "student" | "teacher" | "manager";
};

export function useAuth() {
  const existingAuth = useExistingAuth();
  const { toast } = useToast();
  
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