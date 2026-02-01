
import { useCallback } from 'react';
import { AlertType } from '../types/dashboard.types';
import { getStatusColor as getStatusColorUtil } from '../utils/statusHelpers';
import { formatDate as formatDateUtil, getDaysUntilExpiry as getDaysUntilExpiryUtil } from '../utils/dateHelpers';

export const useDashboardUI = () => {
  const getStatusColor = useCallback((status: string): string => {
    return getStatusColorUtil(status);
  }, []);

  const getCourseIcon = useCallback((title: string): string => {
    
    const safeTitle = title?.toString()?.toLowerCase() || '';
    
    const icons: { [key: string]: string } = {
      'montacargas': 'local-shipping',
      'seguridad': 'security',
      'primeros auxilios': 'medical-services',
      'calidad': 'assignment',
      'eléctrica': 'flash-on',
      'eléctrico': 'flash-on',
      'electricidad': 'flash-on',
      'soldadura': 'build',
      'soldador': 'build'
    };
    
    for (const [keyword, icon] of Object.entries(icons)) {
      if (safeTitle.includes(keyword)) {
        return icon;
      }
    }
    return 'school';
  }, []);

  const getAlertIcon = useCallback((type: AlertType): string => {
    return type === 'warning' ? "warning" : "info";
  }, []);

  const getActionIcon = useCallback((iconName: string): string => {
    return iconName;
  }, []);

  const getDaysUntilExpiry = useCallback((expiryDate: string): number => {
    return getDaysUntilExpiryUtil(expiryDate);
  }, []);

  const formatDate = useCallback((dateString: string): string => {
    return formatDateUtil(dateString);
  }, []);

  return {
    getStatusColor,
    getCourseIcon,
    getAlertIcon,
    getActionIcon,
    getDaysUntilExpiry,
    formatDate
  };
};