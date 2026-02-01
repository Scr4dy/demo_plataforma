

import { SearchResultType } from '../types/search.types';

export const getSearchTypeIcon = (type: SearchResultType): string => {
  const icons: Record<SearchResultType, string> = {
    course: 'school-outline',
    category: 'layers-outline',
    user: 'person-outline',
    certificate: 'ribbon-outline',
  };
  return icons[type] || 'document-outline';
};

export const getSearchTypeColor = (type: SearchResultType): string => {
  const colors: Record<SearchResultType, string> = {
    course: '#2196F3',
    category: '#4CAF50',
    user: '#FF9800',
    certificate: '#9C27B0',
  };
  return colors[type] || '#666';
};

export const getSearchTypeLabel = (type: SearchResultType): string => {
  const labels: Record<SearchResultType, string> = {
    course: 'Curso',
    category: 'Categoría',
    user: 'Usuario',
    certificate: 'Certificado',
  };
  return labels[type] || '';
};

export const getResourceTypeIcon = (type: string): string => {
  const icons: Record<string, string> = {
    pdf: 'document-text-outline',
    video: 'videocam-outline',
    doc: 'document-outline',
    ppt: 'easel-outline',
    xls: 'grid-outline',
    zip: 'archive-outline',
    image: 'image-outline',
  };
  return icons[type.toLowerCase()] || 'document-outline';
};

export const getResourceTypeColor = (type: string): string => {
  const colors: Record<string, string> = {
    pdf: '#e53e3e',
    video: '#805ad5',
    doc: '#3182ce',
    ppt: '#f56565',
    xls: '#38a169',
    zip: '#718096',
    image: '#d69e2e',
  };
  return colors[type.toLowerCase()] || '#718096';
};

export const getResourceTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    pdf: 'PDF',
    video: 'VIDEO',
    doc: 'DOC',
    ppt: 'PPT',
    xls: 'XLS',
    zip: 'ZIP',
    image: 'IMAGEN',
  };
  return labels[type.toLowerCase()] || 'ARCHIVO';
};

export const getCertificateStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    valid: '#4CAF50',
    expired: '#f44336',
    pending: '#FF9800',
  };
  return colors[status.toLowerCase()] || '#999';
};

export const getCertificateStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    valid: 'Válido',
    expired: 'Expirado',
    pending: 'Pendiente',
  };
  return labels[status.toLowerCase()] || status;
};

export const getUserRoleColor = (role: string): string => {
  const colors: Record<string, string> = {
    admin: '#e53e3e',
    instructor: '#f59e0b',
    empleado: '#3182ce',
  };
  return colors[role.toLowerCase()] || '#718096';
};

export const getUserRoleLabel = (role: string): string => {
  const labels: Record<string, string> = {
    admin: 'Administrador',
    instructor: 'Instructor',
    empleado: 'Empleado',
  };
  return labels[role.toLowerCase()] || role;
};

export const getNotificationPriorityColor = (_priority: string): string => {
  
  return '#718096';
};

