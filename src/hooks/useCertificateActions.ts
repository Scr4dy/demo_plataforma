import { useCallback } from 'react';
import { Alert, Platform, Linking } from 'react-native';
import { safeOpenUrl } from '../utils/safeOpenUrl';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation.types';
import { Certificate } from '../types/certificate.types';

export const useCertificateActions = (setError?: (error: string) => void) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleDownload = useCallback(async (certificate: Certificate) => {
    try {
      if (Platform.OS === 'web') {
        if (certificate.downloadUrl) {
          safeOpenUrl(certificate.downloadUrl);
        } else {
          throw new Error('URL de descarga no disponible');
        }
      } else {
        Alert.alert(
          'Descargar Certificado',
          `¿Descargar "${certificate.title}" como PDF?`,
          [
            { text: 'Cancelar', style: 'cancel' },
            { 
              text: 'Descargar', 
              onPress: async () => {
                try {
                  if (certificate.downloadUrl) {
                    await Linking.openURL(certificate.downloadUrl);
                  } else {
                    Alert.alert('Éxito', `Certificado ${certificate.title} preparado para descarga`);
                  }
                } catch (error) {
                  setError?.('Error al descargar el certificado');
                }
              }
            }
          ]
        );
      }
    } catch (error) {
      setError?.('Error al descargar el certificado');
    }
  }, [setError]);

  const handleRenew = useCallback((certificate: Certificate) => {
    
    if (!navigation || typeof navigation.navigate !== 'function') {
      
      return;
    }

    Alert.alert(
      'Renovar Certificación',
      `¿Deseas renovar tu certificación de "${certificate.title}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Renovar', 
          onPress: () => {
            try {
              if (Platform.OS === 'web') {
                const { goToWebRoute } = require('../utils/webNav');
                goToWebRoute('CourseDetail', { 
                  courseId: certificate.id,
                  certificateTitle: certificate.title,
                  isRenewal: true
                });
              } else {
                navigation.navigate('CourseDetail', { 
                  courseId: certificate.id,
                  certificateTitle: certificate.title,
                  isRenewal: true
                });
              }
            } catch (navError) {
              
              setError?.('Error al navegar al curso');
            }
          }
        }
      ]
    );
  }, [navigation, setError]);

  const handleContinueCourse = useCallback((certificate: Certificate) => {
    
    if (!navigation || typeof navigation.navigate !== 'function') {
      
      return;
    }

    try {
      if (Platform.OS === 'web') {
        const { goToWebRoute } = require('../utils/webNav');
        goToWebRoute('CourseDetail', { 
          courseId: certificate.id,
          certificateTitle: certificate.title,
          isInProgress: certificate.status === 'En Progreso'
        });
      } else {
        navigation.navigate('CourseDetail', { 
          courseId: certificate.id,
          certificateTitle: certificate.title,
          isInProgress: certificate.status === 'En Progreso'
        });
      }
    } catch (navError) {
      
      setError?.('Error al navegar al curso');
    }
  }, [navigation, setError]);

  return {
    handleDownload,
    handleRenew,
    handleContinueCourse
  };
};