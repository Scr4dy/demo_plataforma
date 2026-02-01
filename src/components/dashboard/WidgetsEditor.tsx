
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Switch,
  Alert,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WidgetType, useDashboardWidgets } from '../../hooks/useDashboardWidgets';

interface WidgetsEditorProps {
  isVisible: boolean;
  onClose: () => void;
  isMobile?: boolean;
}

export const WidgetsEditor: React.FC<WidgetsEditorProps> = ({
  isVisible,
  onClose
}) => {
  
  const colors = {
    background: '#f7fafc',
    card: '#ffffff',
    text: '#333333',
    textSecondary: '#666666',
    primary: '#2196F3',
    primaryLight: '#E3F2FD',
    border: '#e0e0e0',
    error: '#e53e3e'
  };

  const {
    widgetsLayout,
    toggleWidget,
    reorderWidgets,
    changeWidgetSize,
    resetToDefault,
    visibleWidgetsCount,
    getWidgetConfig
  } = useDashboardWidgets();

  const widgetDefinitions: {
    id: WidgetType;
    title: string;
    description: string;
    icon: string;
    defaultSize: 'small' | 'medium' | 'large';
  }[] = [
    {
      id: 'welcome',
      title: 'Tarjeta de Bienvenida',
      description: 'Mensaje de bienvenida y progreso general',
      icon: 'person-circle',
      defaultSize: 'medium'
    },
    {
      id: 'quickActions',
      title: 'Acciones Rápidas',
      description: 'Accesos directos a funciones frecuentes',
      icon: 'flash',
      defaultSize: 'small'
    },
    {
      id: 'progress',
      title: 'Progreso General',
      description: 'Porcentaje de completitud general',
      icon: 'stats-chart',
      defaultSize: 'small'
    },
    {
      id: 'stats',
      title: 'Estadísticas',
      description: 'Métricas y números clave',
      icon: 'analytics',
      defaultSize: 'small'
    },
    {
      id: 'courses',
      title: 'Mis Cursos',
      description: 'Lista de cursos en progreso',
      icon: 'school',
      defaultSize: 'large'
    },
    {
      id: 'certificates',
      title: 'Certificados',
      description: 'Certificados obtenidos y en progreso',
      icon: 'document-text',
      defaultSize: 'medium'
    },
    {
      id: 'alerts',
      title: 'Alertas Personales',
      description: 'Notificaciones y recordatorios',
      icon: 'notifications',
      defaultSize: 'medium'
    },
    {
      id: 'teamAlerts',
      title: 'Alertas del Equipo',
      description: 'Notificaciones del equipo',
      icon: 'people',
      defaultSize: 'medium'
    },
    {
      id: 'progressSummary',
      title: 'Resumen de Progreso',
      description: 'Estadísticas detalladas de progreso',
      icon: 'trending-up',
      defaultSize: 'large'
    }
  ];

  const handleResetConfirm = () => {
    Alert.alert(
      'Restablecer Widgets',
      '¿Estás seguro de que quieres volver a la configuración inicial?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Restablecer', 
          style: 'destructive',
          onPress: resetToDefault
        }
      ]
    );
  };

  const SizeButton = ({ 
    size, 
    isActive,
    onPress 
  }: { 
    size: 'small' | 'medium' | 'large';
    isActive: boolean;
    onPress: () => void;
  }) => {
    const sizeLabels = {
      small: 'S',
      medium: 'M',
      large: 'L'
    };

    return (
      <TouchableOpacity
        style={[
          styles.sizeButton,
          { 
            backgroundColor: isActive ? colors.primary : colors.card,
            borderColor: colors.border
          }
        ]}
        onPress={onPress}
      >
        <Text style={[
          styles.sizeButtonText,
          { color: isActive ? 'white' : colors.text }
        ]}>
          {sizeLabels[size]}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {}
        <View style={[styles.header, { backgroundColor: colors.card }]}>
          <View style={styles.headerContent}>
            <Text style={[styles.title, { color: colors.text }]}>
              Personalizar Dashboard
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {visibleWidgetsCount()} widgets visibles
            </Text>
          </View>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {}
          {widgetDefinitions.map((widgetDef) => {
            const widgetConfig = getWidgetConfig(widgetDef.id);
            const isVisible = widgetConfig?.visible ?? true;
            const size = widgetConfig?.size ?? widgetDef.defaultSize;

            return (
              <View 
                key={widgetDef.id}
                style={[
                  styles.widgetItem, 
                  { backgroundColor: colors.card },
                  Platform.select({
                    web: {
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                    },
                    default: {
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 3,
                      elevation: 3,
                    }
                  })
                ]}
              >
                {}
                <View style={styles.widgetInfo}>
                  <View style={styles.widgetHeader}>
                    <Ionicons 
                      name={widgetDef.icon as any} 
                      size={24} 
                      color={colors.primary} 
                    />
                    <View style={styles.widgetText}>
                      <Text style={[styles.widgetTitle, { color: colors.text }]}>
                        {widgetDef.title}
                      </Text>
                      <Text style={[styles.widgetDescription, { color: colors.textSecondary }]}>
                        {widgetDef.description}
                      </Text>
                    </View>
                  </View>

                  {}
                  <View style={styles.sizeControls}>
                    <Text style={[styles.sizeLabel, { color: colors.textSecondary }]}>
                      Tamaño:
                    </Text>
                    <View style={styles.sizeButtons}>
                      {(['small', 'medium', 'large'] as const).map((sizeOption) => (
                        <SizeButton
                          key={sizeOption}
                          size={sizeOption}
                          isActive={size === sizeOption}
                          onPress={() => changeWidgetSize(widgetDef.id, sizeOption)}
                        />
                      ))}
                    </View>
                  </View>
                </View>

                {}
                <Switch
                  value={isVisible}
                  onValueChange={() => toggleWidget(widgetDef.id)}
                  trackColor={{ 
                    false: colors.border, 
                    true: colors.primary 
                  }}
                  thumbColor={isVisible ? colors.primaryLight : '#f4f3f4'}
                />
              </View>
            );
          })}

          {}
          <View style={styles.resetSection}>
            <TouchableOpacity
              style={[styles.resetButton, { borderColor: colors.error }]}
              onPress={handleResetConfirm}
            >
              <Ionicons name="refresh" size={20} color={colors.error} />
              <Text style={[styles.resetButtonText, { color: colors.error }]}>
                Restablecer a Valores por Defecto
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footerSpace} />
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  widgetItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  widgetInfo: {
    flex: 1,
  },
  widgetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  widgetText: {
    flex: 1,
    marginLeft: 12,
  },
  widgetTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  widgetDescription: {
    fontSize: 14,
    lineHeight: 18,
  },
  sizeControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sizeLabel: {
    fontSize: 14,
    marginRight: 12,
  },
  sizeButtons: {
    flexDirection: 'row',
    
  },
  sizeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  sizeButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  resetSection: {
    marginTop: 24,
    alignItems: 'center',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    marginLeft: 8,
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  footerSpace: {
    height: 20,
  },
});

export default WidgetsEditor;