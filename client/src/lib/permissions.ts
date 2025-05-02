// Importação de tipos
interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: 'student' | 'teacher' | 'manager' | 'admin';
  avatarUrl?: string;
  level?: number;
  xp?: number;
  createdAt?: string;
  password?: string;
}

// Definição dos papéis de usuário
export type UserRole = 'student' | 'teacher' | 'manager' | 'admin';

// Interface para representar uma permissão
export interface Permission {
  id: string;
  description: string;
}

// Lista de todas as permissões disponíveis no sistema
export const PERMISSIONS = {
  // Permissões de perfil
  PROFILE_VIEW: { id: 'profile:view', description: 'Visualizar próprio perfil' },
  PROFILE_EDIT: { id: 'profile:edit', description: 'Editar próprio perfil' },
  
  // Permissões de missões
  MISSION_VIEW: { id: 'mission:view', description: 'Visualizar missões' },
  MISSION_START: { id: 'mission:start', description: 'Iniciar missões' },
  MISSION_COMPLETE: { id: 'mission:complete', description: 'Concluir missões' },
  MISSION_CREATE: { id: 'mission:create', description: 'Criar missões' },
  MISSION_ASSIGN: { id: 'mission:assign', description: 'Atribuir missões a alunos' },
  
  // Permissões de diagnóstico
  DIAGNOSTIC_START: { id: 'diagnostic:start', description: 'Iniciar triagem diagnóstica' },
  DIAGNOSTIC_VIEW_RESULTS: { id: 'diagnostic:view_results', description: 'Ver resultados do diagnóstico' },
  
  // Permissões de feedback
  FEEDBACK_RECEIVE: { id: 'feedback:receive', description: 'Receber feedback da IA' },
  FEEDBACK_SEND: { id: 'feedback:send', description: 'Enviar feedback personalizado' },
  
  // Permissões de conquistas
  ACHIEVEMENT_VIEW: { id: 'achievement:view', description: 'Visualizar conquistas' },
  ACHIEVEMENT_MANAGE: { id: 'achievement:manage', description: 'Gerenciar conquistas' },
  
  // Permissões de fórum
  FORUM_VIEW: { id: 'forum:view', description: 'Visualizar fóruns' },
  FORUM_POST: { id: 'forum:post', description: 'Postar em fóruns' },
  FORUM_MODERATE: { id: 'forum:moderate', description: 'Moderar fóruns' },
  
  // Permissões de turma
  CLASS_VIEW: { id: 'class:view', description: 'Visualizar turmas' },
  CLASS_MANAGE: { id: 'class:manage', description: 'Gerenciar turmas' },
  
  // Permissões de relatórios
  REPORT_STUDENT_VIEW: { id: 'report:student_view', description: 'Visualizar relatórios de alunos individuais' },
  REPORT_CLASS_VIEW: { id: 'report:class_view', description: 'Visualizar relatórios de turmas' },
  REPORT_SCHOOL_VIEW: { id: 'report:school_view', description: 'Visualizar relatórios de escolas' },
  REPORT_EXPORT: { id: 'report:export', description: 'Exportar relatórios' },
  
  // Permissões de usuários
  USER_MANAGE_STUDENTS: { id: 'user:manage_students', description: 'Gerenciar contas de alunos' },
  USER_MANAGE_TEACHERS: { id: 'user:manage_teachers', description: 'Gerenciar contas de professores' },
  USER_MANAGE_MANAGERS: { id: 'user:manage_managers', description: 'Gerenciar contas de gestores' },
  
  // Permissões de sistema
  SYSTEM_VIEW_LOGS: { id: 'system:view_logs', description: 'Visualizar logs do sistema' },
  SYSTEM_BACKUP: { id: 'system:backup', description: 'Realizar backup do sistema' },
  SYSTEM_RESTORE: { id: 'system:restore', description: 'Restaurar a partir de backup' },
  SYSTEM_CONFIG: { id: 'system:config', description: 'Alterar configurações do sistema' },
};

// Mapeamento de permissões por papel
const rolePermissionsMap: Record<UserRole, Array<string>> = {
  // Permissões de Aluno
  student: [
    PERMISSIONS.PROFILE_VIEW.id,
    PERMISSIONS.PROFILE_EDIT.id,
    PERMISSIONS.MISSION_VIEW.id,
    PERMISSIONS.MISSION_START.id,
    PERMISSIONS.MISSION_COMPLETE.id,
    PERMISSIONS.DIAGNOSTIC_START.id,
    PERMISSIONS.DIAGNOSTIC_VIEW_RESULTS.id,
    PERMISSIONS.FEEDBACK_RECEIVE.id,
    PERMISSIONS.ACHIEVEMENT_VIEW.id,
    PERMISSIONS.FORUM_VIEW.id,
    PERMISSIONS.FORUM_POST.id,
  ],
  
  // Permissões de Professor (inclui todas do Aluno + específicas)
  teacher: [
    // Herda permissões do aluno
    PERMISSIONS.PROFILE_VIEW.id,
    PERMISSIONS.PROFILE_EDIT.id,
    PERMISSIONS.MISSION_VIEW.id,
    PERMISSIONS.DIAGNOSTIC_VIEW_RESULTS.id,
    PERMISSIONS.ACHIEVEMENT_VIEW.id,
    PERMISSIONS.FORUM_VIEW.id,
    PERMISSIONS.FORUM_POST.id,
    
    // Permissões específicas de professor
    PERMISSIONS.MISSION_CREATE.id,
    PERMISSIONS.MISSION_ASSIGN.id,
    PERMISSIONS.FEEDBACK_SEND.id,
    PERMISSIONS.FORUM_MODERATE.id,
    PERMISSIONS.CLASS_VIEW.id,
    PERMISSIONS.CLASS_MANAGE.id,
    PERMISSIONS.REPORT_STUDENT_VIEW.id,
    PERMISSIONS.REPORT_CLASS_VIEW.id,
    PERMISSIONS.REPORT_EXPORT.id,
    PERMISSIONS.USER_MANAGE_STUDENTS.id,
  ],
  
  // Permissões de Gestor (inclui todas do Professor + específicas)
  manager: [
    // Herda permissões do professor (que já inclui as do aluno)
    PERMISSIONS.PROFILE_VIEW.id,
    PERMISSIONS.PROFILE_EDIT.id,
    PERMISSIONS.MISSION_VIEW.id,
    PERMISSIONS.MISSION_CREATE.id,
    PERMISSIONS.MISSION_ASSIGN.id,
    PERMISSIONS.DIAGNOSTIC_VIEW_RESULTS.id,
    PERMISSIONS.FEEDBACK_SEND.id,
    PERMISSIONS.ACHIEVEMENT_VIEW.id,
    PERMISSIONS.ACHIEVEMENT_MANAGE.id,
    PERMISSIONS.FORUM_VIEW.id,
    PERMISSIONS.FORUM_POST.id,
    PERMISSIONS.FORUM_MODERATE.id,
    PERMISSIONS.CLASS_VIEW.id,
    PERMISSIONS.CLASS_MANAGE.id,
    PERMISSIONS.REPORT_STUDENT_VIEW.id,
    PERMISSIONS.REPORT_CLASS_VIEW.id,
    PERMISSIONS.REPORT_EXPORT.id,
    PERMISSIONS.USER_MANAGE_STUDENTS.id,
    
    // Permissões específicas de gestor
    PERMISSIONS.REPORT_SCHOOL_VIEW.id,
    PERMISSIONS.USER_MANAGE_TEACHERS.id,
  ],
  
  // Permissões de Administrador (todas)
  admin: [
    // Todas as permissões
    ...Object.values(PERMISSIONS).map(permission => permission.id),
  ],
};

/**
 * Verifica se um usuário tem uma permissão específica
 * @param user O usuário a ser verificado
 * @param permissionId O ID da permissão a ser verificada
 * @returns true se o usuário possui a permissão, false caso contrário
 */
export function hasPermission(user: User | null, permissionId: string): boolean {
  if (!user) return false;
  
  // Mapeia o papel do usuário no esquema SQL para o papel no sistema de permissões
  const userRole = mapUserRole(user.role);
  
  // Verifica se o papel do usuário está no mapa de permissões
  if (!(userRole in rolePermissionsMap)) return false;
  
  // Verifica se a permissão está na lista de permissões do papel
  return rolePermissionsMap[userRole].includes(permissionId);
}

/**
 * Obtém todas as permissões de um usuário
 * @param user O usuário para obter as permissões
 * @returns Array de IDs de permissão que o usuário possui
 */
export function getUserPermissions(user: User | null): string[] {
  if (!user) return [];
  
  const userRole = mapUserRole(user.role);
  
  if (!(userRole in rolePermissionsMap)) return [];
  
  return rolePermissionsMap[userRole];
}

/**
 * Mapeia o papel do usuário no esquema para o papel no sistema de permissões
 * @param role Papel do usuário no esquema
 * @returns Papel equivalente no sistema de permissões
 */
function mapUserRole(role: string): UserRole {
  switch (role) {
    case 'student': return 'student';
    case 'teacher': return 'teacher';
    case 'manager': return 'manager';
    case 'admin': return 'admin';
    default: return 'student'; // Papel padrão para segurança
  }
}