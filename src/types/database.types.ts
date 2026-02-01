

export interface DBUsuario {
  id_usuario: number;
  numero_control: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno?: string | null;
  correo: string;
  telefono?: string | null;
  departamento?: string | null;
  puesto?: string | null;
  fecha_ingreso?: string;
  rol: 'Empleado' | 'Instructor' | 'Administrador';
  activo?: boolean;
  ultimo_acceso?: string | null;
  fecha_registro?: string;
  auth_id: string;
  deleted_at?: string | null;
  metadata?: any;
  avatar_path?: string | null;
}

export interface DBCurso {
  id_curso: number;
  titulo: string;
  descripcion?: string | null;
  duracion: number; 
  id_instructor: number;
  fecha_inicio: string;
  fecha_fin: string;
  activo?: boolean;
  fecha_creacion?: string;
  deleted_at?: string | null;
  metadata?: any;
  categoria?: string | null;
}

export interface DBModulo {
  id_modulo: number;
  id_curso: number;
  titulo: string;
  descripcion?: string | null;
  orden?: number;
  duracion_estimada?: number; 
  obligatorio?: boolean;
  fecha_creacion?: string;
  deleted_at?: string | null;
}

export interface DBContenido {
  id_contenido: number;
  id_curso: number;
  id_modulo: number;
  tipo: 'video' | 'documento' | 'evaluacion' | 'enlace' | 'presentacion' | 'otro';
  titulo: string;
  url?: string | null;
  descripcion?: string | null;
  orden?: number;
  duracion_estimada?: number; 
  obligatorio?: boolean;
  fecha_creacion?: string;
  deleted_at?: string | null;
}

export interface DBInscripcion {
  id_inscripcion: number;
  id_empleado: number;
  id_curso: number;
  fecha_inscripcion?: string;
  estado: 'activo' | 'completado' | 'abandonado' | 'pausado';
  progreso?: number; 
  fecha_completado?: string | null;
  fecha_ultima_actividad?: string;
  nota_final?: number | null; 
  deleted_at?: string | null;
}

export interface DBProgresoContenido {
  id_progreso: number;
  id_empleado: number;
  id_contenido: number;
  completado?: boolean;
  fecha_inicio?: string;
  fecha_completado?: string | null;
  tiempo_dedicado?: number; 
  intentos?: number;
  ultima_posicion?: number;
  deleted_at?: string | null;
}

export interface DBEvaluacionContenido {
  id_evaluacion: number;
  id_curso: number;
  id_empleado: number;
  utilidad: number; 
  comprension: number; 
  comentarios?: string | null;
  fecha_evaluacion?: string;
  deleted_at?: string | null;
}

export interface DBEvaluacionInstructor {
  id_evaluacion: number;
  id_curso: number;
  id_empleado: number;
  puntuacion: number; 
  comentarios?: string | null;
  fecha_evaluacion?: string;
  deleted_at?: string | null;
}

export interface DBReporte {
  id_reporte: number;
  id_curso: number;
  promedio_instructor?: number | null;
  promedio_contenido?: number | null;
  promedio_desempeno?: number | null;
  total_inscritos?: number;
  total_completados?: number;
  tasa_completado?: number | null;
  tasa_abandono?: number | null;
  tiempo_promedio_completado?: number | null; 
  fecha_generacion?: string;
  fecha_ultima_actualizacion?: string;
}

export interface VCursoFormato {
  id_curso: number;
  titulo: string;
  descripcion?: string | null;
  duracion: number;
  id_instructor: number;
  numero_control_instructor: string;
  nombre_instructor: string;
  fecha_inicio: string; 
  fecha_fin: string; 
  activo?: boolean;
  fecha_creacion?: string; 
}

export interface VUsuarioFormato {
  id_usuario: number;
  numero_control: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno?: string | null;
  nombre_completo: string;
  correo: string;
  telefono?: string | null;
  departamento?: string | null;
  puesto?: string | null;
  fecha_ingreso?: string; 
  rol: string;
  activo?: boolean;
  ultimo_acceso?: string | null; 
  fecha_registro?: string | null; 
}

export interface MVEstadisticasCursos {
  id_curso: number;
  titulo: string;
  descripcion?: string | null;
  duracion: number;
  instructor: string;
  numero_control_instructor: string;
  fecha_inicio: string; 
  fecha_fin: string; 
  total_inscritos: number;
  total_completados: number;
  total_abandonados: number;
  total_contenidos: number;
  progreso_promedio: number;
  calificacion_instructor_promedio: number;
  calificacion_contenido_promedio: number;
  activo?: boolean;
  ultima_actualizacion: string;
}

export type EstadoInscripcion = 'activo' | 'completado' | 'abandonado' | 'pausado';
export type TipoContenido = 'video' | 'documento' | 'evaluacion' | 'enlace' | 'presentacion' | 'otro';
export type RolUsuario = 'Empleado' | 'Instructor' | 'Administrador';
