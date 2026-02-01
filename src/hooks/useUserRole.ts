import { useAuth } from '../context/AuthContext';

export interface UserRole {
  isAdmin: boolean;
  isInstructor: boolean;
  isUser: boolean;
  userRole: string;
  permissions: string[];
}

export const useUserRole = (): UserRole => {
  const { state } = useAuth();
  
  const rawRole = (state.user?.role || 'Empleado').toString();
  const userRole = rawRole;
  const roleLower = rawRole.toLowerCase();
  const isAdmin = roleLower === 'administrador' || roleLower === 'admin';
  const isInstructor = roleLower === 'instructor' || isAdmin;
  
  
  const getPermissions = (): string[] => {
    const basePermissions = ['view_courses', 'view_profile'];
    
    if (isAdmin) {
      return [...basePermissions, 'manage_users', 'manage_courses', 'view_reports', 'system_config'];
    }
    
    if (isInstructor) {
      return [...basePermissions, 'manage_own_courses', 'view_student_progress'];
    }
    
    return basePermissions;
  };

  return {
    isAdmin,
    isInstructor,
    isUser: !isAdmin && !isInstructor,
    userRole,
    permissions: getPermissions()
  };
};
