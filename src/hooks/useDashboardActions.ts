
import { useNavigation } from '@react-navigation/native';
import { Alert, Platform } from 'react-native';
import type { Course, Certificate, TeamAlert, Alert as AppAlert } from '../types/dashboard.types';
import { useHeader } from '../context/HeaderContext';

export const useDashboardActions = (navigation: any) => {
  const { header, setHeader } = useHeader();

  const handleCoursePress = (course: Course) => {
    
    if (!course || !course.id) {
      
      Alert.alert('Error', 'No se pudo cargar la información del curso');
      return;
    }

    try {
      
      try {
        if (typeof setHeader === 'function') {
          const shouldSet = !(header?.title === String(course.title) && header?.owner === 'CourseDetail' && header?.manual === true && header?.showBack === true);
          if (shouldSet) {
            setHeader({
              title: course.title ? String(course.title) : 'Detalle del Curso',
              subtitle: course.categoria ? String(course.categoria) : undefined,
              showBack: true,
              manual: true,
              owner: 'CourseDetail'
            } as any);
          }
        }
      } catch (e) {
        
        
      }

      if (Platform.OS === 'web') {
        const { goToWebRoute } = require('../utils/webNav');
        goToWebRoute('CourseDetail', { 
          courseId: course.id.toString(),
          certificateTitle: course.title || 'Curso sin título',
          isInProgress: course.status === 'En Progreso',
          isRenewal: course.status === 'Completado' && course.expires !== undefined
        });
      } else {
        navigation.navigate('CourseDetail', { 
          courseId: course.id.toString(),
          certificateTitle: course.title || 'Curso sin título',
          isInProgress: course.status === 'En Progreso',
          isRenewal: course.status === 'Completado' && course.expires !== undefined
        });
      }
    } catch (error) {
      
      Alert.alert('Error', 'No se pudo abrir el detalle del curso');
    }
  };

  const handleCertificatePress = (certificate: Certificate) => {
    Alert.alert(
      '🚧 En Desarrollo', 
      `Certificado: ${certificate.title || 'Certificado sin título'}\n\nEsta funcionalidad estará disponible próximamente.`,
      [{ text: 'OK', style: 'default' }]
    );
  };

  const handleTeamAlertPress = (alert: TeamAlert) => {
    Alert.alert(
      'Alerta de Equipo',
      `${alert.teamName || 'Equipo'}: ${alert.message || 'Sin mensaje'}`,
      [{ text: 'OK', style: 'default' }]
    );
  };

  const handleAlertPress = (alert: AppAlert) => {
    Alert.alert(
      alert.title || 'Alerta',
      alert.message || 'Sin mensaje',
      [{ text: 'OK', style: 'default' }]
    );
  };

  const handleSeeAllCertificates = () => {
    try {
      navigation.navigate('Certificates');
    } catch (error) {
      
      Alert.alert('Error', 'No se pudo abrir la pantalla de certificados');
    }
  };

  const handleQuickAction = (action: any) => {
    Alert.alert(
      '⚡ Acción Rápida',
      `Ejecutando: ${action.title || 'Acción sin título'}`,
      [{ text: 'OK', style: 'default' }]
    );
  };

  
  const handleShareProgress = () => {
    Alert.alert(
      '📤 Compartir Progreso',
      'Tu progreso ha sido compartido exitosamente!',
      [{ text: 'OK', style: 'default' }]
    );
  };

  const handleActionPress = (action: string, data?: any) => {
    Alert.alert(
      '🔘 Acción',
      `Ejecutando: ${action}`,
      [{ text: 'OK', style: 'default' }]
    );
  };

  return {
    onCoursePress: handleCoursePress,
    onCertificatePress: handleCertificatePress,
    onTeamAlertPress: handleTeamAlertPress,
    onAlertPress: handleAlertPress,
    onSeeAllCertificates: handleSeeAllCertificates,
    onQuickAction: handleQuickAction,
    onShareProgress: handleShareProgress, 
    onActionPress: handleActionPress,
    
    handleCoursePress,
    handleCertificatePress,
    handleTeamAlertPress,
    handleAlertPress,
    handleSeeAllCertificates,
    handleQuickAction,
    handleShareProgress,
    handleActionPress
  };
};