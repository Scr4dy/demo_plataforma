
export interface User {
  id: string;
  id_usuario?: number;
  email: string;
  name: string;
  nombre?: string;
  apellido_paterno?: string;
  apellido_materno?: string;
  numero_control?: string;
  telefono?: string;
  departamento?: string;
  puesto?: string;
  fecha_ingreso?: string;
  role: 'admin' | 'user' | 'instructor';
  rol?: 'Empleado' | 'Instructor' | 'Administrador';
  activo?: boolean;
  avatar?: string;
  avatar_path?: string;
  createdAt: string;
  fecha_registro?: string;
  ultimo_acceso?: string;
  auth_id?: string;
}

export interface UserStats {
  completedCourses: number;
  inProgressCourses: number;
  certificatesCount: number;
}