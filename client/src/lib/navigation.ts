export const getProfileBasedDashboard = (user: any): string => {
  if (!user) {
    return "/";
  }

  switch (user.role) {
    case 'manager':
    case 'gestor':
      return "/manager-dashboard";
    case 'admin':
      return "/admin-dashboard";
    case 'teacher':
    case 'professor':
      return "/teacher-dashboard";
    case 'student':
    case 'aluno':
      return "/student-dashboard";
    default:
      return "/";
  }
};