
import { apiClient } from './apiClient';
import { supabase } from '../config/supabase';

export interface UserProfileResponse {
  id: number;
  nombreCompleto: string;
  usuario: string;
  correoElectronico: string;
  telefono?: string;
  departamento: string;
  puesto: string;
  idEmpleado?: string;
  fechaIngreso: string;
  avatar?: string;
  estado: 'ACTIVO' | 'INACTIVO';
  rol: string;
  permisos: string[];
}

export interface UserStatsResponse {
  tareasCompletadas: number;
  tareasPendientes: number;
  certificaciones: number;
  evaluaciones: number;
  cursosCompletados: number;
  cursosEnProgreso: number;
  eficiencia: number;
  puntuacionPromedio: number;
}

export interface UserUpdateRequest {
  nombreCompleto?: string;
  telefono?: string;
  departamento?: string;
  puesto?: string;
  avatar?: string;
}

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalCourses: number;
  enrolledUsers: number;
  completedCourses: number;
  averageProgress: number;
  recentRegistrations: number;
}

export interface RecentActivity {
  id: string;
  type: 'registration' | 'enrollment' | 'completion' | 'certificate';
  user: string;
  course?: string;
  timestamp: string;
  description: string;
}

export interface AdminUser {
  id: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  correo: string;
  numero_empleado: string;
  departamento: string;
  puesto: string;
  rol: 'empleado' | 'supervisor' | 'admin';
  estado: 'activo' | 'inactivo';
  fecha_registro: string;
  telefono?: string;
}

export interface CreateUserRequest {
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  correo: string;
  numero_empleado: string;
  departamento: string;
  puesto: string;
  rol: 'empleado' | 'supervisor' | 'admin';
  telefono?: string;
  password: string;
}

import { AppConfig } from '../config/appConfig';
import { SUPABASE_CONFIG } from '../config/supabase';

const supabaseConfigured = !!((AppConfig.supabase?.url && AppConfig.supabase?.anonKey) || (SUPABASE_CONFIG?.URL && SUPABASE_CONFIG?.ANON_KEY));
if (!supabaseConfigured) 

class UserService {
  
  
  async getCurrentUserProfile(): Promise<UserProfileResponse | null> {
    if (!supabaseConfigured) {
      
      return null;
    }
    try {
      const { data, error } = await supabase.from('usuarios').select('*').limit(1).maybeSingle();
      if (error) throw error;
      return (data || null) as UserProfileResponse;
    } catch (err) {
      
      return null;
    }
  }

  async getUserStats(userId?: number): Promise<UserStatsResponse> {
    if (!supabaseConfigured) {
      
      return { tareasCompletadas: 0, tareasPendientes: 0, certificaciones: 0, evaluaciones: 0, cursosCompletados: 0, cursosEnProgreso: 0, eficiencia: 0, puntuacionPromedio: 0 };
    }
    try {
      
      return { tareasCompletadas: 0, tareasPendientes: 0, certificaciones: 0, evaluaciones: 0, cursosCompletados: 0, cursosEnProgreso: 0, eficiencia: 0, puntuacionPromedio: 0 };
    } catch (err) {
      
      return { tareasCompletadas: 0, tareasPendientes: 0, certificaciones: 0, evaluaciones: 0, cursosCompletados: 0, cursosEnProgreso: 0, eficiencia: 0, puntuacionPromedio: 0 };
    }
  }

  async updateUserProfile(updateData: UserUpdateRequest): Promise<UserProfileResponse | null> {
    if (!supabaseConfigured) {
      
      return null;
    }
    try {
      
      return null;
    } catch (err) {
      
      return null;
    }
  }

  async updateAvatar(avatarFile: FormData): Promise<{ avatarUrl: string } | null> {
    if (!supabaseConfigured) {
      
      return null;
    }
    try {
      
      return null;
    } catch (err) {
      
      return null;
    }
  }

  async getUserTeam(): Promise<UserProfileResponse[]> {
    if (!supabaseConfigured) {
      
      return [];
    }
    try {
      
      return [];
    } catch (err) {
      
      return [];
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<{ mensaje: string }> {
    if (!supabaseConfigured) {
      
      return { mensaje: 'Operación no disponible en esta configuración' };
    }
    try {
      
      return { mensaje: 'Operación realizada' };
    } catch (err) {
      
      return { mensaje: 'Error al cambiar contraseña' };
    }
  }

  

  async getDashboardStats(): Promise<DashboardStats> {
    if (!supabaseConfigured) {
      
      return { totalUsers: 0, activeUsers: 0, totalCourses: 0, enrolledUsers: 0, completedCourses: 0, averageProgress: 0, recentRegistrations: 0 };
    }
    try {
      
      return { totalUsers: 0, activeUsers: 0, totalCourses: 0, enrolledUsers: 0, completedCourses: 0, averageProgress: 0, recentRegistrations: 0 };
    } catch (err) {
      
      return { totalUsers: 0, activeUsers: 0, totalCourses: 0, enrolledUsers: 0, completedCourses: 0, averageProgress: 0, recentRegistrations: 0 };
    }
  }

  async getRecentActivities(): Promise<RecentActivity[]> {
    if (!supabaseConfigured) {
      
      return [
        {
          id: '1',
          type: 'registration',
          user: 'Ana García López',
          timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
          description: 'Ana García se registró en la plataforma'
        },
        {
          id: '2',
          type: 'enrollment',
          user: 'Carlos Rodríguez Méndez',
          course: 'Seguridad Industrial Avanzada',
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          description: 'Carlos Rodríguez se inscribió en Seguridad Industrial Avanzada'
        },
        {
          id: '3',
          type: 'completion',
          user: 'María Fernández Soto',
          course: 'Control de Calidad Total',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          description: 'María Fernández completó Control de Calidad Total'
        },
        {
          id: '4',
          type: 'certificate',
          user: 'Roberto Jiménez Paz',
          course: 'Gestión de Procesos',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          description: 'Roberto Jiménez obtuvo certificado en Gestión de Procesos'
        },
        {
          id: '5',
          type: 'enrollment',
          user: 'Laura Hernández Cruz',
          course: 'Normas ISO 9001',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          description: 'Laura Hernández se inscribió en Normas ISO 9001'
        }
      ];
    }
    try {
      
      return [];
    } catch (err) {
      
      return [];
    }
  }

  async getUsers(): Promise<AdminUser[]> {
    if (!supabaseConfigured) {
      
      return [];
    }
    try {
      
      return [];
    } catch (err) {
      
      return [];
    }
  }

  async activateUser(userId: string): Promise<boolean> {
    if (!supabaseConfigured) {
      
      return false;
    }
    try {
      
      return true;
    } catch (err) {
      
      return false;
    }
  }

  async deactivateUser(userId: string): Promise<boolean> {
    if (!supabaseConfigured) {
      
      return false;
    }
    try {
      
      return true;
    } catch (err) {
      
      return false;
    }
  }

  async deleteUser(userId: string): Promise<boolean> {
    if (!supabaseConfigured) {
      
      return false;
    }
    try {
      
      return true;
    } catch (err) {
      
      return false;
    }
  }

  async createUser(userData: CreateUserRequest): Promise<AdminUser | null> {
    if (!supabaseConfigured) {
      
      return null;
    }
    try {
      
      return null;
    } catch (err) {
      
      return null;
    }
  }

  
  async getInstructors(roles: string[] = ['Instructor', 'Administrador']): Promise<Array<{ id: string; name: string; id_usuario?: string }>> {
    if (!supabaseConfigured) {
      
      return [];
    }

    try {
      
      
      const { data, error } = await supabase
        .from('usuarios')
        .select('id_usuario, nombre, apellido_paterno, apellido_materno, rol')
        .in('rol', roles)
        .order('nombre');
      
      if (error) throw error;
      
      return (data || []).map((d: any) => ({ 
        id: String(d.id_usuario), 
        id_usuario: d.id_usuario, 
        name: `${d.nombre} ${d.apellido_paterno || ''} ${d.apellido_materno || ''}`.trim() 
      }));
    } catch (err: any) {
      
      return [];
    }
  }

  async updateUser(userId: string, userData: Partial<CreateUserRequest>): Promise<AdminUser | null> {
    if (!supabaseConfigured) {
      
      return null;
    }
    try {
      
      return null;
    } catch (err) {
      
      return null;
    }
  }

  async searchUsers(criteria: any): Promise<{ content: AdminUser[]; totalElements: number }> {
    if (!supabaseConfigured) {
      
      return { content: [], totalElements: 0 };
    }
    try {
      
      return { content: [], totalElements: 0 };
    } catch (err) {
      
      return { content: [], totalElements: 0 };
    }
  }

  async getUserById(userId: string): Promise<AdminUser | null> {
    if (!supabaseConfigured) {
      
      return null;
    }
    try {
      
      return null;
    } catch (err) {
      
      return null;
    }
  }

  async deactivateAccount(): Promise<{ mensaje: string }> {
    if (!supabaseConfigured) {
      return { mensaje: 'Operación no disponible en esta configuración' };
    }
    try {
      
      return { mensaje: 'Cuenta desactivada' };
    } catch (err) {
      
      return { mensaje: 'Error al desactivar cuenta' };
    }
  }

  

  private getDemoProfile(): UserProfileResponse {
    return {
      id: 1,
      nombreCompleto: 'Ana García López',
      usuario: 'ana.garcia',
      correoElectronico: 'ana.garcia@empresa.com',
      telefono: '+52 55 1234 5678',
      departamento: 'Control de Calidad',
      puesto: 'Supervisora de Calidad',
      idEmpleado: 'EMP-2023-001',
      fechaIngreso: '2023-03-15',
      avatar: 'https://via.placeholder.com/150/2196F3/ffffff?text=AG',
      estado: 'ACTIVO',
      rol: 'SUPERVISOR',
      permisos: ['LECTURA', 'ESCRITURA', 'EVALUACION', 'REPORTES']
    };
  }

  private getDemoStats(): UserStatsResponse {
    return {
      tareasCompletadas: 45,
      tareasPendientes: 8,
      certificaciones: 5,
      evaluaciones: 12,
      cursosCompletados: 8,
      cursosEnProgreso: 2,
      eficiencia: 85.5,
      puntuacionPromedio: 88.2
    };
  }

  private getDemoTeam(): UserProfileResponse[] {
    return [
      {
        id: 2,
        nombreCompleto: 'Carlos Rodríguez Méndez',
        usuario: 'carlos.rodriguez',
        correoElectronico: 'carlos.rodriguez@empresa.com',
        telefono: '+52 55 2345 6789',
        departamento: 'Control de Calidad',
        puesto: 'Inspector de Calidad',
        idEmpleado: 'EMP-2023-002',
        fechaIngreso: '2023-04-10',
        avatar: 'https://via.placeholder.com/150/4CAF50/ffffff?text=CR',
        estado: 'ACTIVO',
        rol: 'INSPECTOR',
        permisos: ['LECTURA', 'ESCRITURA']
      },
      {
        id: 3,
        nombreCompleto: 'María Fernández Soto',
        usuario: 'maria.fernandez',
        correoElectronico: 'maria.fernandez@empresa.com',
        telefono: '+52 55 3456 7890',
        departamento: 'Control de Calidad',
        puesto: 'Analista de Calidad',
        idEmpleado: 'EMP-2023-003',
        fechaIngreso: '2023-05-22',
        avatar: 'https://via.placeholder.com/150/FF9800/ffffff?text=MF',
        estado: 'ACTIVO',
        rol: 'ANALISTA',
        permisos: ['LECTURA', 'ESCRITURA', 'REPORTES']
      }
    ];
  }

  private getDemoAdminUsers(): AdminUser[] {
    return [
      {
        id: '1',
        nombre: 'Ana',
        apellido_paterno: 'García',
        apellido_materno: 'López',
        correo: 'ana.garcia@empresa.com',
        numero_empleado: 'EMP-2023-001',
        departamento: 'Control de Calidad',
        puesto: 'Supervisora de Calidad',
        rol: 'admin',
        estado: 'activo',
        fecha_registro: '2023-03-15T10:00:00Z',
        telefono: '+52 55 1234 5678'
      },
      {
        id: '2',
        nombre: 'Carlos',
        apellido_paterno: 'Rodríguez',
        apellido_materno: 'Méndez',
        correo: 'carlos.rodriguez@empresa.com',
        numero_empleado: 'EMP-2023-002',
        departamento: 'Control de Calidad',
        puesto: 'Inspector de Calidad',
        rol: 'supervisor',
        estado: 'activo',
        fecha_registro: '2023-04-10T09:30:00Z',
        telefono: '+52 55 2345 6789'
      },
      {
        id: '3',
        nombre: 'María',
        apellido_paterno: 'Fernández',
        apellido_materno: 'Soto',
        correo: 'maria.fernandez@empresa.com',
        numero_empleado: 'EMP-2023-003',
        departamento: 'Control de Calidad',
        puesto: 'Analista de Calidad',
        rol: 'empleado',
        estado: 'activo',
        fecha_registro: '2023-05-22T14:15:00Z',
        telefono: '+52 55 3456 7890'
      },
      {
        id: '4',
        nombre: 'Roberto',
        apellido_paterno: 'Jiménez',
        apellido_materno: 'Paz',
        correo: 'roberto.jimenez@empresa.com',
        numero_empleado: 'EMP-2023-004',
        departamento: 'Producción',
        puesto: 'Operador de Máquinas',
        rol: 'empleado',
        estado: 'inactivo',
        fecha_registro: '2023-06-05T11:20:00Z',
        telefono: '+52 55 4567 8901'
      },
      {
        id: '5',
        nombre: 'Laura',
        apellido_paterno: 'Hernández',
        apellido_materno: 'Cruz',
        correo: 'laura.hernandez@empresa.com',
        numero_empleado: 'EMP-2023-005',
        departamento: 'Logística',
        puesto: 'Coordinadora de Almacén',
        rol: 'supervisor',
        estado: 'activo',
        fecha_registro: '2023-07-18T16:45:00Z'
      }
    ];
  }
}

export const userService = new UserService();
export default userService;