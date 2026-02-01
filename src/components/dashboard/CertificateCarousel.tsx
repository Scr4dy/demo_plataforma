import React from 'react';
import { 
  ScrollView, 
  View, 
  StyleSheet, 
  useWindowDimensions,
  Platform 
} from 'react-native';
import { CertificateCard } from './CertificateCard';
import type { Certificate, DashboardUIHelpers } from '../../types/dashboard.types';

interface CertificateCarouselProps {
  certificates: Certificate[];
  onCertificatePress: (certificate: Certificate) => void;
  isMobile?: boolean;
  getStatusColor?: (status: string) => string;
  getCourseIcon?: (status: string) => string;
  getDaysUntilExpiry?: (expiryDate?: string) => number;
  formatDate?: (iso?: string) => string;
  getAlertIcon?: (type: string) => string;
  getActionIcon?: (actionType: string) => string;
}

export const CertificateCarousel: React.FC<CertificateCarouselProps> = ({
  certificates,
  onCertificatePress,
  getStatusColor,
  isMobile = false
}) => {
  const { width: windowWidth } = useWindowDimensions();
  const isIOS = Platform.OS === 'ios';
  const isSmallScreen = windowWidth < 375;

  
  const itemWidth = Math.min(280, Math.max(160, Math.floor(windowWidth * 0.8)));

  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false} 
      style={styles.certificatesScroll}
      contentContainerStyle={[
        styles.certificatesContent,
        isMobile && styles.mobileCertificatesContent,
        isSmallScreen && styles.smallCertificatesContent
      ]}
      
      scrollEventThrottle={16}
      decelerationRate="fast"
      pagingEnabled={false}
      snapToAlignment="center"
      disableIntervalMomentum={false}
      
      keyboardShouldPersistTaps="handled"
    >
      {certificates.map((certificate, index) => (
        <View 
          key={certificate.id} 
          style={[
            styles.certificateItem,
            { width: itemWidth },
            isMobile && styles.mobileCertificateItem,
            isSmallScreen && styles.smallCertificateItem
          ]}
        >
          <CertificateCard
            certificate={certificate}
            onCertificatePress={onCertificatePress}
            getStatusColor={getStatusColor}
            isMobile={isMobile}
          />
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  certificatesScroll: {
    marginHorizontal: -4,
  },
  certificatesContent: {
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
  mobileCertificatesContent: {
    paddingHorizontal: 2,
    paddingVertical: 6,
  },
  smallCertificatesContent: {
    paddingHorizontal: 1,
    paddingVertical: 4,
  },
  certificateItem: {
    marginHorizontal: 8,
    
  },
  mobileCertificateItem: {
    marginHorizontal: 6,
  },
  smallCertificateItem: {
    marginHorizontal: 4,
  },
});