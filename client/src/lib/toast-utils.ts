import { useToast } from "@/hooks/use-toast";

// Tipos para as notificações padronizadas
export type ToastVariant = "default" | "destructive" | "success" | "warning" | "info";

// Função utilitária para criar toasts padronizados
export const createStandardToast = (toast: ReturnType<typeof useToast>["toast"]) => ({
  // Toast de sucesso para ações concluídas
  success: (title: string, description?: string) => {
    toast({
      variant: "success" as ToastVariant,
      title,
      description,
      duration: 4000,
    });
  },

  // Toast de erro para falhas
  error: (title: string, description?: string) => {
    toast({
      variant: "destructive" as ToastVariant,
      title,
      description,
      duration: 6000,
    });
  },

  // Toast de aviso
  warning: (title: string, description?: string) => {
    toast({
      variant: "warning" as ToastVariant,
      title,
      description,
      duration: 5000,
    });
  },

  // Toast informativo
  info: (title: string, description?: string) => {
    toast({
      variant: "info" as ToastVariant,
      title,
      description,
      duration: 4000,
    });
  },

  // Toast padrão
  default: (title: string, description?: string) => {
    toast({
      variant: "default" as ToastVariant,
      title,
      description,
      duration: 4000,
    });
  },

  // Toasts específicos do sistema
  loginSuccess: (userName?: string) => {
    toast({
      variant: "success" as ToastVariant,
      title: "Login realizado com sucesso!",
      description: userName ? `Bem-vindo de volta, ${userName}!` : "Bem-vindo de volta!",
      duration: 4000,
    });
  },

  logoutSuccess: () => {
    toast({
      variant: "info" as ToastVariant,
      title: "Logout realizado com sucesso!",
      description: "Você foi desconectado do sistema com segurança.",
      duration: 3000,
    });
  },

  userCreated: (userName: string) => {
    toast({
      variant: "success" as ToastVariant,
      title: "Usuário criado com sucesso!",
      description: `O usuário "${userName}" foi cadastrado no sistema.`,
      duration: 5000,
    });
  },

  userUpdated: (userName: string) => {
    toast({
      variant: "success" as ToastVariant,
      title: "Usuário atualizado!",
      description: `Os dados de "${userName}" foram atualizados com sucesso.`,
      duration: 4000,
    });
  },

  userDeleted: (userName: string) => {
    toast({
      variant: "warning" as ToastVariant,
      title: "Usuário removido!",
      description: `O usuário "${userName}" foi removido do sistema.`,
      duration: 4000,
    });
  },

  classCreated: (className: string, schoolName: string) => {
    toast({
      variant: "success" as ToastVariant,
      title: "Turma criada com sucesso!",
      description: `A turma "${className}" foi vinculada à escola "${schoolName}".`,
      duration: 5000,
    });
  },

  schoolCreated: (schoolName: string) => {
    toast({
      variant: "success" as ToastVariant,
      title: "Escola cadastrada!",
      description: `A escola "${schoolName}" foi criada com sucesso.`,
      duration: 5000,
    });
  },

  accessDenied: () => {
    toast({
      variant: "destructive" as ToastVariant,
      title: "Acesso negado!",
      description: "Você não tem permissão para realizar esta ação.",
      duration: 5000,
    });
  },

  sessionExpired: () => {
    toast({
      variant: "warning" as ToastVariant,
      title: "Sessão expirada!",
      description: "Por favor, faça login novamente para continuar.",
      duration: 6000,
    });
  },

  networkError: () => {
    toast({
      variant: "destructive" as ToastVariant,
      title: "Erro de conexão!",
      description: "Verifique sua conexão com a internet e tente novamente.",
      duration: 6000,
    });
  },

  validationError: (field: string) => {
    toast({
      variant: "destructive" as ToastVariant,
      title: "Dados inválidos!",
      description: `Verifique o campo "${field}" e tente novamente.`,
      duration: 5000,
    });
  },
});

// Hook personalizado que retorna as funções padronizadas
export const useStandardToast = () => {
  const { toast } = useToast();
  return createStandardToast(toast);
};