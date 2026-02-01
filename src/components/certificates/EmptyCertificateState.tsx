import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface EmptyCertificateStateProps {
  type: 'active' | 'inProgress' | 'expired';
  onNavigate: () => void;
}

type EmptyStateConfig = {
  icon: 'checkmark-circle-outline' | 'time-outline' | 'warning-outline' | 'document-text-outline';
  title: string;
  description: string;
  buttonText: string;
  buttonIcon: 'school' | 'play' | 'refresh' | 'search';
};

export const EmptyCertificateState: React.FC<EmptyCertificateStateProps> = ({
  type,
  onNavigate
}) => {
  const getEmptyStateConfig = (): EmptyStateConfig => {
    const configs: Record<'active' | 'inProgress' | 'expired', EmptyStateConfig> = {
      active: {
        icon: 'checkmark-circle-outline',
        title: 'No hay certificados vigentes',
        description: 'Completa cursos para obtener certificados válidos',
        buttonText: 'Explorar Cursos',
        buttonIcon: 'school'
      },
      inProgress: {
        icon: 'time-outline',
        title: 'No hay cursos en progreso',
        description: 'Comienza un nuevo curso para ver tu progreso aquí',
        buttonText: 'Comenzar Curso',
        buttonIcon: 'play'
      },
      expired: {
        icon: 'warning-outline',
        title: 'No hay certificados expirados',
        description: 'Todos tus certificados están actualizados',
        buttonText: 'Ver Cursos Disponibles',
        buttonIcon: 'refresh'
      }
    };
    
    return configs[type];
  };

  const config = getEmptyStateConfig();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Ionicons name={config.icon} size={64} color="#cbd5e0" />
        <Text style={styles.title}>{config.title}</Text>
        <Text style={styles.description}>{config.description}</Text>
        
        <TouchableOpacity 
          style={styles.button} 
          onPress={onNavigate}
          accessibilityLabel={config.buttonText}
          accessibilityHint={`Navega a la pantalla de ${config.buttonText}`}
          accessibilityRole="button"
          hitSlop={{ top: 8, left: 8, right: 8, bottom: 8 }}
        >
          <Ionicons name={config.buttonIcon} size={20} color="white" />
          <Text style={styles.buttonText}>{config.buttonText}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    alignItems: 'center',
    maxWidth: 400,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2d3748',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  button: {
    backgroundColor: '#2b6cb0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});