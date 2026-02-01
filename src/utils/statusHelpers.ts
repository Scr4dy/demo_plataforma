

export type StatusType = 
  | 'Completado' | 'En Progreso' | 'Pendiente'
  | 'Vigente' | 'Expirado' | 'Por Vencer'
  | 'completed' | 'pending' | 'active' | 'inactive'
  | 'urgent' | 'warning' | 'info'
  | 'COMPLETADO' | 'APROBADO' | 'EN_PROGRESO' | 'PENDIENTE' | 'REPROBADO' | 'REVISANDO';

export const getStatusColor = (status: StatusType | string): string => {
  const statusMap: Record<string, string> = {
    
    'Completado': '#38a169',
    'completed': '#38a169',
    'COMPLETADO': '#10b981',
    'APROBADO': '#10b981',
    
    
    'En Progreso': '#d69e2e',
    'EN_PROGRESO': '#f59e0b',
    'pending': '#d69e2e',
    'Pendiente': '#a0aec0',
    'PENDIENTE': '#3b82f6',
    
    
    'Vigente': '#38a169',
    'active': '#38a169',
    'Expirado': '#e53e3e',
    'Por Vencer': '#ed8936',
    
    
    'REPROBADO': '#ef4444',
    'REVISANDO': '#8b5cf6',
    
    
    'urgent': '#e53e3e',
    'warning': '#d69e2e',
    'info': '#3182ce',
    
    
    'inactive': '#a0aec0',
  };
  
  return statusMap[status] || '#2b6cb0';
};

export const getStatusLabel = (status: string): string => {
  const statusLabels: Record<string, string> = {
    'COMPLETADO': 'Completado',
    'APROBADO': 'Aprobado',
    'EN_PROGRESO': 'En Progreso',
    'PENDIENTE': 'Pendiente',
    'REPROBADO': 'Reprobado',
    'REVISANDO': 'Revisando',
    'completed': 'Completado',
    'pending': 'Pendiente',
    'active': 'Activo',
    'inactive': 'Inactivo',
  };
  
  return statusLabels[status] || status;
};

export const getProgressColor = (progress: number): string => {
  if (progress >= 80) return '#38a169';
  if (progress >= 50) return '#d69e2e';
  if (progress >= 20) return '#ed8936';
  return '#e53e3e';
};

export type ModuleStatus = 'completed' | 'in-progress' | 'locked';

export const getModuleStatusColor = (status: ModuleStatus): string => {
  const colors: Record<ModuleStatus, string> = {
    'completed': '#38a169',
    'in-progress': '#d69e2e',
    'locked': '#a0aec0',
  };
  return colors[status] || '#a0aec0';
};

export const getModuleStatusIcon = (status: ModuleStatus): string => {
  const icons: Record<ModuleStatus, string> = {
    'completed': 'checkmark-circle',
    'in-progress': 'time',
    'locked': 'lock-closed',
  };
  return icons[status] || 'help-circle';
};
