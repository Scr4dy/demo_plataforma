
export type CertificateStatus =
  | 'Vigente'
  | 'En Progreso'
  | 'Expirado'
  | 'Activo'
  | 'Completado'
  | 'active'
  | 'in-progress'
  | 'expired'
  | 'completed'
  | 'pending'
  | string;

export interface Certificate {
  id: string;
  title: string;
  status: CertificateStatus;
  category: string;
  instructor?: string;
  duration?: number;
  
  
  validUntil?: Date;
  obtained?: Date;
  folio?: string;
  downloadUrl?: string;
  
  
  progress?: number;
  expires?: Date;
}

export interface CertificateGroup {
  active: Certificate[];
  inProgress: Certificate[];
  expired: Certificate[];
}

export type CertificateTab = 'active' | 'inProgress' | 'expired';

export interface CertificateUIHelpers {
  getStatusColor: (status: CertificateStatus) => string;
  getStatusIcon: (status: CertificateStatus) => string;
}

export interface CertificateActions {
  onDownload?: (certificate: Certificate) => void;
  onRenew?: (certificate: Certificate) => void;
  onContinue?: (certificate: Certificate) => void;
}