
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Certificate, DashboardUIHelpers } from '../../types/dashboard.types';
import { useTheme } from '../../context/ThemeContext';

interface CertificateCardProps {
  certificate: Certificate;
  onCertificatePress: (certificate: Certificate) => void;
  getStatusColor?: (status: string) => string;
  isMobile?: boolean;
}

export const CertificateCard: React.FC<CertificateCardProps> = ({
  certificate,
  onCertificatePress,
  getStatusColor
}) => {
  const { colors } = useTheme();
  return (
    <TouchableOpacity 
      style={styles.certificateCard}
      onPress={() => onCertificatePress(certificate)}
    >
      <View style={styles.certificateHeader}>
        <Ionicons name="document-text" size={18} color={getStatusColor?.(certificate.status ?? '') ?? colors.primary} />
        <Text style={[styles.certificateStatus, { color: getStatusColor?.(certificate.status ?? '') ?? colors.primary }]}>
          {certificate.status}
        </Text>
      </View>
      <Text style={styles.certificateTitle} numberOfLines={2}>
        {certificate.title}
      </Text>
      {certificate.validUntil && (
        <Text style={styles.certificateValid}>Válido hasta: {certificate.validUntil}</Text>
      )}
      <TouchableOpacity style={styles.viewCertificateButton}>
        <Text style={styles.viewCertificateText}>Ver</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  certificateCard: {
    width: 160,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginHorizontal: 4,
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
    elevation: 1,
    minHeight: 140,
  },
  certificateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  certificateStatus: {
    fontSize: 10,
    fontWeight: '500',
  },
  certificateTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 6,
    height: 36,
  },
  certificateValid: {
    fontSize: 10,
    color: '#38a169',
    marginBottom: 12,
  },
  viewCertificateButton: {
    backgroundColor: '#2b6cb0',
    padding: 6,
    borderRadius: 4,
    alignItems: 'center',
  },
  viewCertificateText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
});