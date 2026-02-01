

export interface Course {
  id: string | number; 
  id_curso?: string;
  title?: string; 
  titulo?: string;
  description?: string; 
  descripcion?: string;
  progress?: number;
  progreso?: number;
  status?: CourseStatus;
  estado?: string;
  expires?: string;
  category?: string; 
  categoria?: string | null;
  duration?: string | number; 
  duracion?: string; 
  duracion_horas?: number;
  duracionHoras?: number;
  tags?: string[];
  expiryDate?: string;
  dueDate?: string | null;
  updatedAt?: string | number;
  fecha_creacion?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  fechaInicio?: string;
  fechaFin?: string;
  id_instructor?: string;
  instructor?: string;
  activo?: string; 
  activo_boolean?: boolean;
  metadata?: any;
  deleted_at?: string | null;
}

export interface Certificate {
  id: string | number;
  title: string;
  status: CertificateStatus;
  validUntil?: string;
  issueDate?: string;
  
  downloadUrl?: string;
  courseId?: number;
}

export interface DashboardComponentProps {
  dashboardData: DashboardData;
  onCoursePress: (course: Course) => void;
  onCertificatePress: (certificate: Certificate) => void;
  onTeamAlertPress: (alert: TeamAlert) => void;
  onAlertPress: (alert: Alert) => void;
  onSeeAllCertificates: () => void;
  onQuickAction: (action: QuickAction) => void;
  onShareProgress: () => void;
  refreshing?: boolean;
  onRefresh?: () => void;
}

export type CourseStatus = 'not-started' | 'in-progress' | 'completed' | 'archived' | string;
export type CertificateStatus = 'active' | 'expired' | 'in-progress' | string;
export type AlertType = 'info' | 'warning' | 'error' | 'success';

export interface Alert {
  id: string;
  title: string;
  message: string;
  type: AlertType;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
}

export interface TeamAlert {
  id: string;
  teamName: string;
  alertType: 'info' | 'update' | 'incident' | 'maintenance';
  message: string;
  timestamp: Date;
  status: 'active' | 'pending' | 'resolved';
  assignedTo?: string;
}

export interface QuickAction {
  id: string | number;
  label?: string;
  title?: string;
  icon?: string;
  type?: string;
}

export interface DashboardData {
  name?: string;
  progress?: number;
  quickActions?: QuickAction[];
  courses: Course[];
  certificates: Certificate[];
  alerts?: Alert[];
  teamAlerts?: TeamAlert[];
  stats?: DashboardStats;
}

export type AlertItem = Alert;

export interface DashboardStats {
  totalCourses?: number;
  completedCourses?: number;
  averageProgress?: number;
  inProgressCourses?: number; 
  pendingCourses?: number; 
}

export interface DashboardUIHelpers {
  getStatusColor: (status: string) => string;
  getCourseIcon: (status: string) => string;
  getDaysUntilExpiry: (expiryDate?: string) => number;
  formatDate: (iso?: string) => string;
  getAlertIcon: (type: string) => string;
  getActionIcon: (actionType: string) => string;
}

export type DashboardUIHelpersType = DashboardUIHelpers;

export interface Profile {
  id: string;
  name?: string;
  email?: string;
  position?: string;
  department?: string;
  phone?: string;
  joinDate?: string;
  status?: 'active' | 'inactive' | string;
  avatar?: string;
  stats?: {
    completedTasks?: number;
    pendingTasks?: number;
    certifications?: number;
    evaluations?: number;
  };
  certifications?: { id: string; name: string; status?: string; issueDate?: string; expiryDate?: string }[];
  skills?: string[];
  recentActivity?: { id: string; type: string; description: string; date: string; status?: string }[];
}