import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  useWindowDimensions,
  Animated 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Certificate, CertificateUIHelpers, CertificateActions } from '../../types/certificate.types';
import { formatDate, formatFullDate } from '../../utils/certificateHelpers';

interface CertificateCardWebProps extends CertificateActions, CertificateUIHelpers {
  certificate: Certificate;
  isMobile?: boolean;
}

export const CertificateCardWeb: React.FC<CertificateCardWebProps> = ({
  certificate,
  onDownload,
  onRenew,
  onContinue,
  getStatusColor,
  getStatusIcon
}) => {
  const { width } = useWindowDimensions();
  const [scaleAnim] = useState(new Animated.Value(1));
  
  const cardWidth = Math.min(400, (width - 72) / 2);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const StatusBadge = () => (
    <View style={styles.statusBadge}>
      <Ionicons 
        name={getStatusIcon(certificate.status) as any} 
        size={16} 
        color={getStatusColor(certificate.status)} 
      />
      <Text style={[styles.statusText, { color: getStatusColor(certificate.status) }]}>
        {certificate.status}
      </Text>
    </View>
  );

  const getButtonConfig = () => {
    switch (certificate.status) {
      case 'Vigente':
        return {
          icon: 'download' as const,
          text: 'Descargar PDF',
          onPress: () => onDownload?.(certificate),
          style: styles.downloadButton
        };
      case 'En Progreso':
        return {
          icon: 'play-circle' as const,
          text: 'Continuar Curso',
          onPress: () => onContinue?.(certificate),
          style: styles.continueButton
        };
      case 'Expirado':
        return {
          icon: 'refresh' as const,
          text: 'Renovar Certificación',
          onPress: () => onRenew?.(certificate),
          style: styles.renewButton
        };
      default:
        return null;
    }
  };

  const buttonConfig = getButtonConfig();

  const renderDetails = () => {
    switch (certificate.status) {
      case 'Vigente':
        return (
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Obtenido</Text>
              <Text style={styles.detailValue}>
                {certificate.obtained ? formatFullDate(certificate.obtained) : 'N/A'}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Válido hasta</Text>
              <Text style={styles.detailValue}>
                {certificate.validUntil ? formatDate(certificate.validUntil) : 'N/A'}
              </Text>
            </View>
            {certificate.folio && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Folio</Text>
                <Text style={styles.detailValue}>{certificate.folio}</Text>
              </View>
            )}
          </View>
        );
      
      case 'En Progreso':
        return certificate.progress ? (
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressText}>Progreso: {certificate.progress}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${certificate.progress}%` }
                ]} 
              />
            </View>
            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Vence</Text>
                <Text style={[styles.detailValue, { color: '#d69e2e' }]}>
                  {certificate.expires ? formatFullDate(certificate.expires) : 'N/A'}
                </Text>
              </View>
            </View>
          </View>
        ) : null;
      
      case 'Expirado':
        return (
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Obtenido</Text>
              <Text style={styles.detailValue}>
                {certificate.obtained ? formatFullDate(certificate.obtained) : 'N/A'}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Expirado</Text>
              <Text style={[styles.detailValue, { color: '#e53e3e' }]}>
                {certificate.validUntil ? formatDate(certificate.validUntil) : 'N/A'}
              </Text>
            </View>
          </View>
        );
      
      default:
        return null;
    }
  };

  return (
    <Animated.View style={[styles.certificateCard, { width: cardWidth, transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity 
        style={styles.cardContent}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
        accessibilityLabel={`Certificado ${certificate.title}, estado ${certificate.status}`}
        accessibilityRole="button"
      >
        <View style={styles.cardHeader}>
          <StatusBadge />
          <Text style={styles.categoryText}>{certificate.category}</Text>
        </View>
        
        <Text style={styles.certificateTitle}>{certificate.title}</Text>
        
        {certificate.instructor && (
          <Text style={styles.instructorText}>Instructor: {certificate.instructor}</Text>
        )}
        
        {renderDetails()}
      </TouchableOpacity>
      
      {buttonConfig && (
        <TouchableOpacity 
          style={[styles.actionButton, buttonConfig.style]}
          onPress={buttonConfig.onPress}
          accessibilityLabel={buttonConfig.text}
          accessibilityRole="button"
        >
          <Ionicons name={buttonConfig.icon} size={18} color="white" />
          <Text style={styles.actionButtonText}>
            {buttonConfig.text}
          </Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  certificateCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
    minHeight: 200,
  },
  cardContent: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  categoryText: {
    fontSize: 11,
    color: '#718096',
    backgroundColor: '#f7fafc',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  certificateTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 8,
  },
  instructorText: {
    fontSize: 12,
    color: '#718096',
    marginBottom: 16,
  },
  detailsGrid: {
    gap: 12,
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: '#718096',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 12,
    color: '#2d3748',
    fontWeight: '600',
  },
  progressSection: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 12,
    color: '#718096',
    fontWeight: '500',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#d69e2e',
    borderRadius: 3,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
    marginTop: 'auto',
  },
  downloadButton: {
    backgroundColor: '#2b6cb0',
  },
  continueButton: {
    backgroundColor: '#38a169',
  },
  renewButton: {
    backgroundColor: '#d69e2e',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});