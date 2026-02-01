import { useMemo } from 'react';
import { Platform } from 'react-native';

type CertificateTab = 'active' | 'inProgress' | 'expired';

interface UseEmptyStateParams {
  certificates: Record<string, any[]> | null;
  loading: boolean;
  activeTab: CertificateTab;
}

export const useEmptyState = ({
  certificates,
  loading,
  activeTab
}: UseEmptyStateParams) => {
  return useMemo(() => {
    
    if (!certificates || loading) {
      return false;
    }

    const currentTabCertificates = certificates[activeTab] || [];
    const hasAnyCertificates = Object.values(certificates).some((arr: any) => 
      Array.isArray(arr) && arr.length > 0
    );
    
    if (Platform.OS === 'web') {
      return currentTabCertificates.length === 0;
    } else {
      return !hasAnyCertificates;
    }
  }, [certificates, loading, activeTab]);
};