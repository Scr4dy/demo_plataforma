import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Certificate, CertificateUIHelpers, CertificateActions } from '../../types/certificate.types';
import { formatDate, formatFullDate, getProgressColor } from '../../utils/certificateHelpers';

interface CertificateCardMobileProps extends CertificateActions, CertificateUIHelpers {
  certificate: Certificate;
  isMobile?: boolean;
}

export const CertificateCardMobile: React.FC<CertificateCardMobileProps> = ({
  certificate,
  onDownload,
  onRenew,
  onContinue,
  getStatusColor,
  getStatusIcon
}) => {
  const [scaleAnim] = useState(new Animated.Value(1));

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

  const handleCardPress = () => {
    const details = [
      `• Estado: ${certificate.status}`,
      certificate.folio && `• Folio: ${certificate.folio}`,
      `• Categoría: ${certificate.category}`,
      certificate.instructor && `• Instructor: ${certificate.instructor}`,
      certificate.duration && `• Duración: ${certificate.duration}h`,
      certificate.obtained && `• Obtenido: ${formatFullDate(certificate.obtained)}`,
      certificate.validUntil && `• Válido hasta: ${formatDate(certificate.validUntil)}`,
      certificate.expires && `• Vence: ${formatFullDate(certificate.expires)}`
    ].filter(Boolean).join('\n');

    const buttons = [
      { text: 'Cerrar', style: 'cancel' as const },
      certificate.status === 'Vigente' ? { 
        text: 'Descargar PDF', 
        onPress: () => onDownload?.(certificate) 
      } : undefined,
      certificate.status === 'En Progreso' ? { 
        text: 'Continuar Curso', 
        onPress: () => onContinue?.(certificate) 
      } : undefined,
      certificate.status === 'Expirado' ? { 
        text: 'Renovar', 
        onPress: () => onRenew?.(certificate) 
      } : undefined
    ].filter(Boolean) as any[];

    Alert.alert(certificate.title, details, buttons);
  };

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
        return {
          icon: 'document-text' as const,
          text: 'Ver Detalles',
          onPress: handleCardPress,
          style: styles.downloadButton
        };
    }
  };

  const buttonConfig = getButtonConfig();

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity 
        style={styles.certificateCard}
        onPress={handleCardPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityLabel={`Certificado ${certificate.title}, estado ${certificate.status}`}
        accessibilityRole="button"
        accessibilityHint="Presiona dos veces para ver detalles del certificado"
        activeOpacity={0.9}
      >
        <View style={styles.certificateHeader}>
          <View style={styles.certificateInfo}>
            <Ionicons 
              name={(getStatusIcon?.(certificate.status) ?? 'document-text') as any} 
              size={24} 
              color={getStatusColor?.(certificate.status) ?? '#2b6cb0'} 
            />
            <View style={styles.certificateText}>
              <Text style={styles.certificateTitle}>{certificate.title}</Text>
              <View style={styles.statusRow}>
                <Text style={[styles.certificateStatus, { color: getStatusColor(certificate.status) }]}>
                  {certificate.status}
                </Text>
                <Text style={styles.categoryText}>{certificate.category}</Text>
              </View>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#a0aec0" />
        </View>
        
        {certificate.status === 'En Progreso' && certificate.progress && (
          <View style={styles.progressSection}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${certificate.progress}%`,
                    backgroundColor: getProgressColor(certificate.progress)
                  }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>{certificate.progress}% completado</Text>
          </View>
        )}
        
        <View style={styles.certificateDetails}>
          {certificate.obtained && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Obtenido:</Text>
              <Text style={styles.detailValue}>
                {formatFullDate(certificate.obtained)}
              </Text>
            </View>
          )}
          
          {certificate.validUntil && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>
                {certificate.status === 'Expirado' ? 'Expirado:' : 'Válido hasta:'}
              </Text>
              <Text style={[
                styles.detailValue, 
                certificate.status === 'Expirado' ? { color: '#e53e3e' } : 
                certificate.status === 'En Progreso' ? { color: '#d69e2e' } : {}
              ]}>
                {formatDate(certificate.validUntil)}
              </Text>
            </View>
          )}
          
          {certificate.folio && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Folio:</Text>
              <Text style={styles.detailValue}>{certificate.folio}</Text>
            </View>
          )}

          {certificate.instructor && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Instructor:</Text>
              <Text style={styles.detailValue}>{certificate.instructor}</Text>
            </View>
          )}
        </View>
        
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
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  certificateCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  certificateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  certificateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  certificateText: {
    flex: 1,
    marginLeft: 12,
  },
  certificateTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 4,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  certificateStatus: {
    fontSize: 14,
    fontWeight: '500',
  },
  categoryText: {
    fontSize: 12,
    color: '#718096',
    backgroundColor: '#f7fafc',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  certificateDetails: {
    backgroundColor: '#f7fafc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailLabel: {
    fontSize: 12,
    color: '#718096',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 12,
    color: '#2d3748',
    fontWeight: '500',
  },
  progressSection: {
    marginBottom: 12,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    marginBottom: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#718096',
    textAlign: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
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