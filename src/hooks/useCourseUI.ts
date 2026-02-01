
import { useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';

export type ModuleStatus = 'completed' | 'in-progress' | 'locked' | 'available';
export type ResourceType = 'pdf' | 'video' | 'doc' | 'link' | 'quiz';

export const useCourseUI = () => {
  const getStatusIcon = useCallback((status: ModuleStatus): string => {
    switch (status) {
      case 'completed':
        return 'checkmark-circle';
      case 'in-progress':
        return 'time';
      case 'locked':
        return 'lock-closed';
      default:
        return 'play-circle';
    }
  }, []);

  const getStatusText = useCallback((status: ModuleStatus): string => {
    switch (status) {
      case 'completed': return 'Completado';
      case 'in-progress': return 'En Progreso';
      case 'locked': return 'Bloqueado';
      default: return 'Disponible';
    }
  }, []);

  const { colors: themeColors } = useTheme();

  const getStatusColor = useCallback((status: ModuleStatus): string => {
    const colorsMap: Record<ModuleStatus, string> = {
      'completed': themeColors.success || '#38a169',
      'in-progress': themeColors.warning || '#d69e2e',
      'locked': themeColors.icon || '#a0aec0',
      'available': themeColors.primary || '#2b6cb0'
    };
    return colorsMap[status] || themeColors.primary || '#2b6cb0';
  }, [themeColors]);

  const getResourceIcon = useCallback((type: ResourceType): string => {
    switch (type) {
      case 'pdf': return 'document-text';
      case 'video': return 'videocam';
      case 'doc': return 'document';
      default: return 'document-text';
    }
  }, []);

  return {
    getStatusIcon,
    getStatusText,
    getStatusColor,
    getResourceIcon
  };
};