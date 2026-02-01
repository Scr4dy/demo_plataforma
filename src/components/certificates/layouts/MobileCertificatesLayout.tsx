
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  ScrollView,
  Platform,
  RefreshControl,
  useWindowDimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CertificateCardMobile } from '../CertificateCardMobile';
import type { Certificate, CertificateTab } from '../../../types/certificate.types';

interface MobileCertificatesLayoutProps {
  showHeader?: boolean;
  activeTab: CertificateTab;
  onTabChange: (tab: CertificateTab) => void;
  certificates?: Certificate[];
  onDownload: (certificate: Certificate) => void;
  onRenew: (certificate: Certificate) => void;
  onContinue: (certificate: Certificate) => void;
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => string;
  refreshing?: boolean;
  onRefresh?: () => void;
}

export const MobileCertificatesLayout: React.FC<MobileCertificatesLayoutProps> = ({
  showHeader = true,
  activeTab,
  onTabChange,
  certificates = [],
  onDownload,
  onRenew,
  onContinue,
  getStatusColor,
  getStatusIcon,
  refreshing = false,
  onRefresh
}) => {
  const { width: windowWidth } = useWindowDimensions();
  const isSmallScreen = windowWidth < 375;
  
  
  const safeCertificates = Array.isArray(certificates) ? certificates : [];
  
  const tabs: { id: CertificateTab; label: string; count: number }[] = [
    { 
      id: 'active', 
      label: 'Vigentes', 
      count: safeCertificates.filter(c => 
        c?.status && (c.status === 'Activo' || c.status === 'Completado' || c.status === 'active')
      ).length 
    },
    { 
      id: 'inProgress', 
      label: 'En Progreso', 
      count: safeCertificates.filter(c => 
        c?.status && (c.status === 'En Progreso' || c.status === 'in-progress' || c.status === 'pending')
      ).length 
    },
    { 
      id: 'expired', 
      label: 'Expirados', 
      count: safeCertificates.filter(c => 
        c?.status && (c.status === 'Expirado' || c.status === 'expired')
      ).length 
    },
  ];

  
  const getFilteredCertificates = (): Certificate[] => {
    if (!Array.isArray(safeCertificates)) return [];
    
    try {
      switch (activeTab) {
        case 'active':
          return safeCertificates.filter(cert => 
            cert?.status && (
              cert.status === 'Activo' || 
              cert.status === 'Completado' || 
              cert.status === 'active' ||
              cert.status === 'completed'
            )
          );
        case 'inProgress':
          return safeCertificates.filter(cert => 
            cert?.status && (
              cert.status === 'En Progreso' || 
              cert.status === 'in-progress' || 
              cert.status === 'pending'
            )
          );
        case 'expired':
          return safeCertificates.filter(cert => 
            cert?.status && (
              cert.status === 'Expirado' || 
              cert.status === 'expired'
            )
          );
        default:
          return safeCertificates;
      }
    } catch (error) {
      
      return [];
    }
  };

  const filteredCertificates = getFilteredCertificates();
  const hasCertificates = filteredCertificates.length > 0;
  const isIOS = Platform.OS === 'ios';

  const getEmptyStateConfig = () => {
    switch (activeTab) {
      case 'active':
        return {
          icon: 'document-text-outline' as const,
          title: 'No hay certificados vigentes',
          message: 'Completa tus cursos para obtener nuevos certificados.',
          actionText: 'Explorar Cursos'
        };
      case 'inProgress':
        return {
          icon: 'time-outline' as const,
          title: 'No hay cursos en progreso',
          message: 'Comienza un nuevo curso para verlo aquí.',
          actionText: 'Ver Cursos Disponibles'
        };
      case 'expired':
        return {
          icon: 'warning-outline' as const,
          title: 'No hay certificados expirados',
          message: 'Todos tus certificados están actualizados.',
          actionText: 'Ver Certificados Vigentes'
        };
      default:
        return {
          icon: 'document-text-outline' as const,
          title: 'No hay certificados',
          message: 'No se encontraron certificados en esta categoría.',
          actionText: 'Ir al Dashboard'
        };
    }
  };

  const emptyStateConfig = getEmptyStateConfig();

  const handleEmptyStateAction = () => {
  };

  return (
    <SafeAreaView edges={['top','left','right','bottom']} style={styles.safeArea}>
      {}
      {showHeader && (
        <View style={styles.header}>
          <Text style={[
            styles.title,
            isSmallScreen && styles.smallTitle
          ]}>
            Mis Certificados
          </Text>
          <Text style={[
            styles.subtitle,
            isSmallScreen && styles.smallSubtitle
          ]}>
            Gestiona tus certificados de capacitación
          </Text>
        </View>
      )}

      {}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.tabsScrollContainer}
        contentContainerStyle={styles.tabsContentContainer}
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              isSmallScreen && styles.smallTab,
              activeTab === tab.id && styles.tabActive
            ]}
            onPress={() => onTabChange(tab.id)}
          >
            <Text style={[
              styles.tabText,
              isSmallScreen && styles.smallTabText,
              activeTab === tab.id && styles.tabTextActive
            ]}>
              {tab.label}
            </Text>
            {tab.count > 0 && (
              <View style={[
                styles.tabCount,
                isSmallScreen && styles.smallTabCount,
                activeTab === tab.id && styles.tabCountActive
              ]}>
                <Text style={[
                  styles.tabCountText,
                  isSmallScreen && styles.smallTabCountText
                ]}>
                  {tab.count}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {}
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={isIOS ? undefined : ['#007AFF']}
              tintColor={isIOS ? "#007AFF" : undefined}
            />
          ) : undefined
        }
      >
        {!hasCertificates ? (
          <View style={[
            styles.emptyState,
            isSmallScreen && styles.smallEmptyState
          ]}>
            <Ionicons 
              name={emptyStateConfig.icon} 
              size={isSmallScreen ? 48 : 56} 
              color="#cbd5e0" 
              style={styles.emptyIcon}
            />
            <Text style={[
              styles.emptyTitle,
              isSmallScreen && styles.smallEmptyTitle
            ]}>
              {emptyStateConfig.title}
            </Text>
            <Text style={[
              styles.emptyMessage,
              isSmallScreen && styles.smallEmptyMessage
            ]}>
              {emptyStateConfig.message}
            </Text>
            <TouchableOpacity 
              style={[
                styles.emptyActionButton,
                isSmallScreen && styles.smallEmptyActionButton
              ]}
              onPress={handleEmptyStateAction}
            >
              <Text style={[
                styles.emptyActionText,
                isSmallScreen && styles.smallEmptyActionText
              ]}>
                {emptyStateConfig.actionText}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.certificatesList}>
            {filteredCertificates.map((certificate) => (
              <View key={certificate.id} style={styles.certificateItem}>
                <CertificateCardMobile
                  certificate={certificate}
                  onDownload={onDownload}
                  onRenew={onRenew}
                  onContinue={onContinue}
                  getStatusColor={getStatusColor}
                  getStatusIcon={getStatusIcon}
                  isMobile={true}
                />
              </View>
            ))}
          </View>
        )}
        
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f7fafc',
  },
  header: {
    backgroundColor: 'white',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      }
    })
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a365d',
    marginBottom: 4,
  },
  smallTitle: {
    fontSize: 20,
  },
  subtitle: {
    fontSize: 14,
    color: '#718096',
    lineHeight: 20,
  },
  smallSubtitle: {
    fontSize: 13,
  },
  tabsScrollContainer: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    maxHeight: 56,
  },
  tabsContentContainer: {
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    marginRight: 8,
  },
  smallTab: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginRight: 6,
  },
  tabActive: {
    borderBottomColor: '#3182ce',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#718096',
    marginRight: 6,
  },
  smallTabText: {
    fontSize: 13,
    marginRight: 4,
  },
  tabTextActive: {
    color: '#3182ce',
    fontWeight: '600',
  },
  tabCount: {
    backgroundColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallTabCount: {
    borderRadius: 8,
    paddingHorizontal: 4,
    minWidth: 16,
  },
  tabCountActive: {
    backgroundColor: '#3182ce',
  },
  tabCountText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4a5568',
  },
  smallTabCountText: {
    fontSize: 10,
  },
  content: {
    flex: 1,
  },
  certificatesList: {
    padding: 12,
    gap: 12,
  },
  certificateItem: {
    marginBottom: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: 'white',
    borderRadius: 12,
    margin: 16,
    marginTop: 32,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      }
    })
  },
  smallEmptyState: {
    padding: 24,
    margin: 12,
    marginTop: 24,
  },
  emptyIcon: {
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 8,
    textAlign: 'center',
  },
  smallEmptyTitle: {
    fontSize: 16,
  },
  emptyMessage: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  smallEmptyMessage: {
    fontSize: 13,
    lineHeight: 18,
  },
  emptyActionButton: {
    backgroundColor: '#3182ce',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 140,
  },
  smallEmptyActionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    minWidth: 120,
  },
  emptyActionText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'center',
  },
  smallEmptyActionText: {
    fontSize: 13,
  },
  bottomSpacer: {
    height: 20,
  },
});

export default MobileCertificatesLayout;