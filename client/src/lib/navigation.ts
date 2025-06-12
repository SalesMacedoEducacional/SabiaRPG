export const getProfileBasedDashboard = (user: any): string => {
  if (!user) {
    return "/";
  }

  switch (user.role) {
    case 'manager':
    case 'gestor':
      return "/manager";
    case 'admin':
      return "/manager";
    case 'teacher':
    case 'professor':
      return "/teacher";
    case 'student':
    case 'aluno':
      return "/";
    default:
      return "/";
  }
};