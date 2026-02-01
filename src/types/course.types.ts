
export interface CourseContent {
  id: string;
  id_contenido?: number;
  type: 'video' | 'pdf' | 'quiz' | 'text' | 'audio' | 'embed';
  tipo?: 'video' | 'documento' | 'evaluacion' | 'enlace' | 'presentacion' | 'otro';
  title: string;
  titulo?: string;
  duration?: number;
  duracion_estimada?: number; 
  url: string;
  thumbnail?: string;
  description?: string;
  descripcion?: string;
  isFree: boolean;
  orden?: number;
  obligatorio?: boolean;
  fecha_creacion?: string;
}

export interface Course {
  id: string; 
  id_curso?: string;
  title?: string; 
  titulo?: string;
  description?: string; 
  descripcion?: string;
  instructor: string;
  id_instructor?: string;
  category?: CourseCategory | string;
  categoria?: string | null;
  thumbnail?: string;
  price?: number;
  isFree?: boolean;
  duration?: number | string; 
  duracion?: string;
  duracion_horas?: number;
  duracionHoras?: number;
  level?: 'beginner' | 'intermediate' | 'advanced';
  rating?: number;
  studentsCount?: number;
  contents?: CourseContent[];
  objectives?: string[];
  requirements?: string[];
  createdAt?: string;
  updatedAt?: string;
  fecha_creacion?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  fechaInicio?: string;
  fechaFin?: string;
  activo?: string; 
  activo_boolean?: boolean;
  metadata?: any;
  deleted_at?: string | null;
  estado?: string;
  progreso?: number;
}

export interface Module extends CourseContent {
  id_modulo?: number;
  id_curso?: number;
  titulo?: string;
  descripcion?: string;
  order?: number;
  orden?: number;
  moduleType?: string;
  status?: string | 'locked' | 'in-progress' | 'completed';
  progress?: number;
  lessons?: any[];
  completedLessons?: number;
  lessonsList?: any[];
  contenidos?: any[]; 
  duracion_estimada?: number; 
  obligatorio?: boolean;
  fecha_creacion?: string;
}

export interface Resource {
  id: string;
  title: string;
  url?: string;
  type?: string;
  name?: string;
  size?: number;
}

export interface CourseDetail extends Course {
  modules: Module[];
  resources: Resource[];
  progress?: number;
  expiryDate?: string | null;
  dueDate?: string | null;
  lastAccessed?: string | Date;
  isEnrolled?: boolean;
}

export interface CourseActions {
  onModulePress?: (module?: Module) => void;
  onResourceDownload?: (resource?: Resource | string, resourceName?: string) => void;
  onStartExam?: (moduleId?: string) => void;
  onContinueLearning?: (module?: Module | string) => void;
  onDownloadAllResources?: () => void;
}

export interface CourseUIHelpers {
  getStatusIcon?: (status: string | number) => string;
  getStatusText?: (status: string | number) => string;
  getStatusColor?: (status: string | number) => string;
  getResourceIcon?: (type?: string) => string;
}

export type CourseUIHelpersType = CourseUIHelpers;

export type CourseCategory = 
  | 'recursos-humanos' 
  | 'seguridad-higiene' 
  | 'desarrollo-personal'
  | 'tecnologia' 
  | 'marketing' 
  | 'gestion' 
  | 'finanzas' 
  | 'operaciones';