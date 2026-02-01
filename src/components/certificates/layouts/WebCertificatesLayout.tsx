
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  ScrollView,
  Platform,
  useWindowDimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CertificateCardWeb } from '../CertificateCardWeb';
import type { Certificate, CertificateTab } from '../../../types/certificate.types';

interface WebCertificatesLayoutProps {
  showHeader?: boolean;
  activeTab: CertificateTab;
  onTabChange: (tab: CertificateTab) => void;
  certificates: Certificate[];
  onDownload: (certificate: Certificate) => void;
  onRenew: (certificate: Certificate) => void;
  onContinue: (certificate: Certificate) => void;
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => string;
}

export const WebCertificatesLayout: React.FC<WebCertificatesLayoutProps> = ({
  showHeader = true,
  activeTab,
  onTabChange,
  certificates = [],
  onDownload,
  onRenew,
  onContinue,
  getStatusColor,
  getStatusIcon
}) => {
  const { width: windowWidth } = useWindowDimensions();
  
  
  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;
  const isDesktop = windowWidth >= 1024;
  
  
  const getGridConfig = () => {
    if (isMobile) return { columns: 1, gap: 16, padding: 16 };
    if (isTablet) return { columns: 2, gap: 20, padding: 20 };
    return { columns: 3, gap: 24, padding: 24 }; 
  };

  const { columns, gap, padding } = getGridConfig();

  
  const safeCertificates = Array.isArray(certificates) ? certificates : [];
  
  const tabs: { id: CertificateTab; label: string; count: number }[] = [
    { 
      id: 'active', 
      label: isMobile ? 'Vigentes' : 'Certificados Vigentes', 
      count: safeCertificates.filter(c => 
        c.status === 'Activo' || c.status === 'Completado' || c.status === 'active' || c.status === 'completed'
      ).length 
    },
    { 
      id: 'inProgress', 
      label: isMobile ? 'En Progreso' : 'Cursos en Progreso', 
      count: safeCertificates.filter(c => 
        c.status === 'En Progreso' || c.status === 'in-progress' || c.status === 'pending'
      ).length 
    },
    { 
      id: 'expired', 
      label: isMobile ? 'Expirados' : 'Certificados Expirados', 
      count: safeCertificates.filter(c => 
        c.status === 'Expirado' || c.status === 'expired'
      ).length 
    },
  ];

  
  const getFilteredCertificates = (): Certificate[] => {
    if (!Array.isArray(safeCertificates)) return [];
    
    switch (activeTab) {
      case 'active':
        return safeCertificates.filter(cert => 
          cert.status === 'Activo' || 
          cert.status === 'Completado' || 
          cert.status === 'active' ||
          cert.status === 'completed'
        );
      case 'inProgress':
        return safeCertificates.filter(cert => 
          cert.status === 'En Progreso' || 
          cert.status === 'in-progress' || 
          cert.status === 'pending'
        );
      case 'expired':
        return safeCertificates.filter(cert => 
          cert.status === 'Expirado' || 
          cert.status === 'expired'
        );
      default:
        return safeCertificates;
    }
  };

  const filteredCertificates = getFilteredCertificates();
  const hasCertificates = filteredCertificates.length > 0;

  const getEmptyStateConfig = () => {
    switch (activeTab) {
      case 'active':
        return {
          icon: 'document-text-outline' as const,
          title: 'No hay certificados vigentes',
          message: isMobile 
            ? 'Completa tus cursos para obtener nuevos certificados.' 
            : 'Completa tus cursos para obtener nuevos certificados. Explora nuestro catálogo de cursos disponibles para comenzar tu journey de aprendizaje.',
          actionText: 'Explorar Cursos Disponibles'
        };
      case 'inProgress':
        return {
          icon: 'time-outline' as const,
          title: 'No hay cursos en progreso',
          message: isMobile 
            ? 'Comienza un nuevo curso para verlo aquí.' 
            : 'No tienes cursos activos en este momento. Comienza un nuevo curso para ver tu progreso aquí.',
          actionText: 'Comenzar un Curso'
        };
      case 'expired':
        return {
          icon: 'alert-circle-outline' as const,
          title: 'No hay certificados expirados',
          message: isMobile 
            ? 'Todos tus certificados están actualizados.' 
            : '¡Excelente! Todos tus certificados están actualizados y vigentes. Continúa aprendiendo para mantener tus habilidades actualizadas.',
          actionText: 'Ver Cursos Disponibles'
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

  
  const renderCertificatesGrid = () => {
    if (isMobile) {
      return (
        <View style={[styles.certificatesList, { gap }]}>
          {filteredCertificates.map((certificate) => (
            <View key={certificate.id} style={styles.certificateItem}>
              <CertificateCardWeb
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
      );
    }

    
    return (
      <View style={[styles.certificatesGrid, { gap }]}>
        {filteredCertificates.map((certificate) => (
          <View 
            key={certificate.id} 
            style={[
              styles.certificateItem,
              { 
                width: isTablet ? '48%' : '32%',
                minWidth: isTablet ? 300 : 280 
              }
            ]}
          >
            <CertificateCardWeb
              certificate={certificate}
              onDownload={onDownload}
              onRenew={onRenew}
              onContinue={onContinue}
              getStatusColor={getStatusColor}
              getStatusIcon={getStatusIcon}
              isMobile={false}
            />
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {}
      {showHeader && Platform.OS !== 'web' && (
        <View style={styles.header}>
          <View style={[
            styles.headerContent,
            isMobile && styles.mobileHeaderContent
          ]}>
            <Text style={[
              styles.title,
              isMobile && styles.mobileTitle
            ]}>
              {isMobile ? 'Mis Certificados' : 'Gestión de Certificados'}
            </Text>
            <Text style={[
              styles.subtitle,
              isMobile && styles.mobileSubtitle
            ]}>
              {isMobile 
                ? 'Gestiona tus certificados de capacitación' 
                : 'Administra, descarga y renueva tus certificados de capacitación profesional'
              }
            </Text>
          </View>
        </View>
      )}

      {}
      <View style={styles.tabsContainer}>
        <View style={[
          styles.tabsContent,
          isMobile && styles.mobileTabsContent
        ]}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tab,
                isMobile && styles.mobileTab,
                activeTab === tab.id && styles.tabActive
              ]}
              onPress={() => onTabChange(tab.id)}
            >
              <Text style={[
                styles.tabText,
                isMobile && styles.mobileTabText,
                activeTab === tab.id && styles.tabTextActive
              ]}>
                {tab.label}
              </Text>
              {tab.count > 0 && (
                <View style={[
                  styles.tabCount,
                  activeTab === tab.id && styles.tabCountActive
                ]}>
                  <Text style={styles.tabCountText}>
                    {tab.count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {}
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          !hasCertificates ? styles.emptyContent : styles.certificatesContent,
          { padding }
        ]}
      >
        {!hasCertificates ? (
          <View style={[
            styles.emptyState,
            isMobile && styles.mobileEmptyState
          ]}>
            <Ionicons 
              name={emptyStateConfig.icon} 
              size={isMobile ? 56 : 80} 
              color="#cbd5e0" 
              style={styles.emptyIcon}
            />
            <Text style={[
              styles.emptyTitle,
              isMobile && styles.mobileEmptyTitle
            ]}>
              {emptyStateConfig.title}
            </Text>
            <Text style={[
              styles.emptyMessage,
              isMobile && styles.mobileEmptyMessage
            ]}>
              {emptyStateConfig.message}
            </Text>
            <TouchableOpacity 
              style={[
                styles.emptyActionButton,
                isMobile && styles.mobileEmptyActionButton
              ]}
              onPress={handleEmptyStateAction}
            >
              <Text style={[
                styles.emptyActionText,
                isMobile && styles.mobileEmptyActionText
              ]}>
                {emptyStateConfig.actionText}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          renderCertificatesGrid()
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7fafc',
  },
  header: {
    backgroundColor: 'white',
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    ...Platform.select({
      web: {
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
      }
    })
  },
  headerContent: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
  },
  mobileHeaderContent: {
    maxWidth: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a365d',
    marginBottom: 8,
  },
  mobileTitle: {
    fontSize: 24,
  },
  subtitle: {
    fontSize: 16,
    color: '#718096',
    lineHeight: 24,
    maxWidth: 600,
  },
  mobileSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  tabsContainer: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    ...Platform.select({
      web: {
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
      }
    })
  },
  tabsContent: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'row',
    paddingHorizontal: 20,
  },
  mobileTabsContent: {
    paddingHorizontal: 16,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
    marginRight: 24,
  },
  mobileTab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  tabActive: {
    borderBottomColor: '#3182ce',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#718096',
    marginRight: 8,
  },
  mobileTabText: {
    fontSize: 14,
    marginRight: 6,
  },
  tabTextActive: {
    color: '#3182ce',
    fontWeight: '600',
  },
  tabCount: {
    backgroundColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabCountActive: {
    backgroundColor: '#3182ce',
  },
  tabCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4a5568',
  },
  content: {
    flex: 1,
  },
  emptyContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 400,
  },
  certificatesContent: {
    flexGrow: 1,
  },
  certificatesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
  },
  certificatesList: {
    width: '100%',
  },
  certificateItem: {
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
    backgroundColor: 'white',
    borderRadius: 16,
    maxWidth: 600,
    width: '90%',
    ...Platform.select({
      web: {
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 4,
      }
    })
  },
  mobileEmptyState: {
    padding: 32,
    borderRadius: 12,
  },
  emptyIcon: {
    marginBottom: 20,
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 12,
    textAlign: 'center',
  },
  mobileEmptyTitle: {
    fontSize: 18,
  },
  emptyMessage: {
    fontSize: 15,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    maxWidth: 400,
  },
  mobileEmptyMessage: {
    fontSize: 14,
    lineHeight: 20,
  },
  emptyActionButton: {
    backgroundColor: '#3182ce',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 8,
    minWidth: 180,
  },
  mobileEmptyActionButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    minWidth: 160,
  },
  emptyActionText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 15,
    textAlign: 'center',
  },
  mobileEmptyActionText: {
    fontSize: 14,
  },
});

export default WebCertificatesLayout;