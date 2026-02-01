
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStorageDownload } from '../../hooks/useStorageUpload';
import * as Sharing from 'expo-sharing';
import { useTheme } from '../../context/ThemeContext';

interface CertificateCardProps {
  id: number;
  titulo: string;
  cursoNombre: string;
  fechaEmision: string;
  storagePath: string; 
  estado: 'VIGENTE' | 'EXPIRADO' | 'PENDIENTE';
  instructor: string;
}

export function CertificateCard({
  id,
  titulo,
  cursoNombre,
  fechaEmision,
  storagePath,
  estado,
  instructor,
}: CertificateCardProps) {
  const { downloading, downloadCertificate, localUri } = useStorageDownload();
  const { theme, colors } = useTheme();

  const getStatusColor = () => {
    switch (estado) {
      case 'VIGENTE':
        return '#4CAF50';
      case 'EXPIRADO':
        return '#F44336';
      case 'PENDIENTE':
        return '#FF9800';
      default:
        return '#999';
    }
  };

  const getStatusIcon = () => {
    switch (estado) {
      case 'VIGENTE':
        return 'checkmark-circle';
      case 'EXPIRADO':
        return 'close-circle';
      case 'PENDIENTE':
        return 'time';
      default:
        return 'help-circle';
    }
  };

  const handleDownload = async () => {
    try {
      const fileName = `certificado_${id}_${Date.now()}.pdf`;
      const uri = await downloadCertificate(storagePath, fileName);

      if (uri) {
        Alert.alert(
          'Descarga Completa',
          'El certificado se ha descargado correctamente',
          [
            { text: 'OK' },
            {
              text: 'Compartir',
              onPress: () => handleShare(uri),
            },
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo descargar el certificado');
      
    }
  };

  const handleShare = async (uri?: string) => {
    try {
      const fileUri = uri || localUri;
      if (!fileUri) {
        Alert.alert('Error', 'Descarga el certificado primero');
        return;
      }

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Compartir Certificado',
        });
      } else {
        Alert.alert('Error', 'La función de compartir no está disponible');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo compartir el certificado');
      
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <View style={styles.card}>
      {}
      <View style={styles.header}>
        <View style={styles.statusContainer}>
          <Ionicons name={getStatusIcon()} size={20} color={getStatusColor()} />
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {estado}
          </Text>
        </View>
        <Ionicons name="ribbon" size={24} color="#FFD700" />
      </View>

      {}
      <View style={styles.content}>
        <Text style={styles.title}>{titulo}</Text>
        <Text style={styles.courseName}>{cursoNombre}</Text>

        <View style={styles.infoRow}>
          <Ionicons name="calendar" size={16} color="#666" />
          <Text style={styles.infoText}>
            Emitido: {formatDate(fechaEmision)}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="person" size={16} color="#666" />
          <Text style={styles.infoText}>{instructor}</Text>
        </View>
      </View>

      {}
      <View style={styles.actions}>
        {downloading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#2196F3" />
            <Text style={styles.loadingText}>Descargando...</Text>
          </View>
        ) : (
          <>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={handleDownload}
              disabled={estado === 'PENDIENTE'}
            >
              <Ionicons name="download" size={20} color={theme.colors.card} />
              <Text style={[styles.buttonText, { color: theme.colors.card }]}>Descargar</Text>
            </TouchableOpacity> 

            {localUri && (
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={() => handleShare()}
              >
                <Ionicons name="share-social" size={20} color={colors.primary} />
                <Text style={[styles.buttonText, { color: colors.primary }]}>
                  Compartir
                </Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  statusText: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  courseName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 13,
    color: '#666',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  primaryButton: {
    backgroundColor: '#2196F3',
  },
  secondaryButton: {
    backgroundColor: '#E3F2FD',
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  buttonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
});

export default CertificateCard;
