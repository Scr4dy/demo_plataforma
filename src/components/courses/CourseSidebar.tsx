import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import type { CourseDetail, Module } from '../../types/course.types';
import { Platform, Alert, Linking } from 'react-native';
import { safeOpenUrl } from '../../utils/safeOpenUrl';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { certificateService } from '../../services/certificateService';

interface CourseSidebarProps {
  courseData: CourseDetail;
  nextModule?: Module;
  onContinueLearning: (module?: Module) => void;
  onStartExam: () => void;
}

export const CourseSidebar: React.FC<CourseSidebarProps> = ({
  courseData,
  nextModule,
  onContinueLearning,
  onStartExam
}) => {
  const getCourseStatus = () => {
    const completedModules = courseData.modules.filter(m => m.status === 'completed').length;
    const totalModules = courseData.modules.length;
    
    if (completedModules === totalModules) return 'completed';
    if (completedModules > 0) return 'in-progress';
    return 'not-started';
  };

  const status = getCourseStatus();
  const completedModules = courseData.modules.filter(m => m.status === 'completed').length;
  const totalModules = courseData.modules.length;
  const { colors, theme } = useTheme();
  const navigation = useNavigation<any>();
  const { state } = useAuth();

  const StatusBadge = () => {
    const statusConfig = {
      'completed': { text: 'Completado', color: colors.success || '#38a169', bgColor: (colors.success ? `${colors.success}22` : '#f0fff4') },
      'in-progress': { text: 'En Progreso', color: colors.warning || '#d69e2e', bgColor: (colors.warning ? `${colors.warning}22` : '#fef5e7') },
      'not-started': { text: 'No Iniciado', color: colors.textSecondary || '#718096', bgColor: (theme.dark ? '#111' : (colors.primaryLight || '#f7fafc')) }
    };

    const config = statusConfig[status];

    return (
      <View style={[styles.statusIndicator, { backgroundColor: config.bgColor }]}>
        <Ionicons 
          name={status === 'completed' ? 'checkmark-circle' : 'time'} 
          size={16} 
          color={config.color} 
        />
        <Text style={[styles.statusText, { color: config.color }]}>
          {config.text}
        </Text>
      </View>
    );
  };

  const SidebarStats = () => (
    <View style={styles.sidebarStats}>
      <View style={styles.stat}>
        <Text style={styles.statNumber}>{totalModules}</Text>
        <Text style={styles.statLabel}>Módulos</Text>
      </View>
      <View style={styles.stat}>
        <Text style={styles.statNumber}>{completedModules}</Text>
        <Text style={styles.statLabel}>Completados</Text>
      </View>
      <View style={styles.stat}>
        <Text style={styles.statNumber}>{courseData.resources.length}</Text>
        <Text style={styles.statLabel}>Recursos</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.sidebar}>
      <View style={styles.actionCard}>
        <StatusBadge />
        
            <TouchableOpacity 
          style={[styles.primaryAction, { backgroundColor: colors.primary } as any]}
          onPress={async () => {
            if (status === 'completed') {
              try {
                const userId = Number((state.user as any)?.id_usuario || state.user?.id || 0);
                const courseIdNum = Number((courseData as any).id_curso || (courseData as any).id || 0);

                if (userId && courseIdNum) {
                  const myCerts = await certificateService.getMyCertificates();
                  const cert = (myCerts || []).find((c: any) => Number(c.cursoId) === courseIdNum);
                  if (cert) {
                    try {
                      const res = await certificateService.downloadCertificate(cert.id);
                      const url = res?.url;
                      if (!url) throw new Error('URL no disponible');

                      if (Platform.OS === 'web') {
                        if (typeof window !== 'undefined') safeOpenUrl(url);
                      } else {
                        const can = await Linking.canOpenURL(url).catch(() => false);
                        if (can) await Linking.openURL(url);
                        else Alert.alert('Info', 'No se pudo abrir el certificado automáticamente. Revisa la pantalla de Certificados.');
                      }
                      return;
                    } catch (err) {
                      
                    }
                  }
                }

                
                if (Platform.OS === 'web') {
                  const { goToWebRoute } = require('../../utils/webNav');
                  goToWebRoute('Certificates');
                } else {
                  navigation.navigate('Certificates');
                }
              } catch (err) {
                
              }
              return;
            }
            onContinueLearning(nextModule);
          }}
        >
          <Ionicons 
            color={theme.colors.card} 
          />
          <Text style={[styles.primaryActionText, { color: theme.colors.card }]}>
            {status === 'completed' ? 'Ver Certificado' : 
             nextModule ? 'Continuar Aprendiendo' : 'Comenzar Curso'}
          </Text>
        </TouchableOpacity>

        {status === 'in-progress' && completedModules >= totalModules * 0.8 && (
          <TouchableOpacity 
            style={[styles.secondaryAction, { borderColor: colors.primary }] as any}
            onPress={onStartExam}
          >
            <Ionicons name="document-text" size={18} color={colors.primary} />
            <Text style={[styles.secondaryActionText, { color: colors.primary }]}>Realizar Examen</Text>
          </TouchableOpacity>
        )}

        <View style={styles.sidebarDivider} />

        <SidebarStats />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    flex: 1,
    minWidth: 280,
  },
  actionCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    padding: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  primaryAction: {
    backgroundColor: '#2b6cb0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    gap: 8,
  },
  primaryActionText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryAction: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2b6cb0',
    gap: 8,
    marginBottom: 16,
  },
  secondaryActionText: {
    color: '#2b6cb0',
    fontSize: 14,
    fontWeight: '600',
  },
  sidebarDivider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 16,
  },
  sidebarStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3748',
  },
  statLabel: {
    fontSize: 12,
    color: '#718096',
    marginTop: 4,
  },
});

export default CourseSidebar;