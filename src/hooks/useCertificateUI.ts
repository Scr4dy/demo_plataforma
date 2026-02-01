import { useCallback } from 'react';
import { CertificateStatus } from '../types/certificate.types';
import { getStatusColor as getStatusColorUtil } from '../utils/statusHelpers';

const STATUS_CONFIG = {
  'Vigente': {
    icon: 'checkmark-circle' as const,
    label: 'Vigente'
  },
  'En Progreso': {
    icon: 'time' as const,
    label: 'En Progreso'
  },
  'Expirado': {
    icon: 'warning' as const,
    label: 'Expirado'
  }
} as const;

export const useCertificateUI = () => {
  const getStatusColor = useCallback((status: CertificateStatus): string => {
    return getStatusColorUtil(status);
  }, []);

  const getStatusIcon = useCallback((status: CertificateStatus): string => {
    return (STATUS_CONFIG as any)[status]?.icon || 'help-circle';
  }, []);

  const getStatusLabel = useCallback((status: CertificateStatus): string => {
    return (STATUS_CONFIG as any)[status]?.label || status;
  }, []);

  return {
    getStatusColor,
    getStatusIcon,
    getStatusLabel
  };
};