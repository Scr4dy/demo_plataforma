import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import type { CourseDetail, Module } from '../../types/course.types';

interface QuickActionsBarProps {
  courseData: CourseDetail;
  nextModule?: Module;
  activeTab: 'modules' | 'resources' | 'details';
  onTabChange: (tab: 'modules' | 'resources' | 'details') => void;
  onContinueLearning: (module?: Module) => void;
  onStartExam: () => void;
}

export const QuickActionsBar: React.FC<QuickActionsBarProps> = React.memo(({
  courseData,
  nextModule,
  activeTab,
  onTabChange,
  onContinueLearning,
  onStartExam
}) => {
  const quickActions = [
    {
      id: 'continue',
      label: 'Continuar',
      icon: 'play-arrow' as const,
      color: '#2b6cb0',
      visible: (courseData.progress ?? 0) < 100 && nextModule,
      onPress: () => onContinueLearning?.(nextModule)
    },
    {
      id: 'exam',
      label: 'Examen Final',
      icon: 'assignment' as const,
      color: '#d69e2e',
      visible: (courseData.progress ?? 0) >= 80,
      onPress: onStartExam
    },
    {
      id: 'resources',
      label: 'Recursos',
      icon: 'folder' as const,
      color: '#38a169',
      visible: (courseData.resources?.length || 0) > 0,
      onPress: () => onTabChange('resources')
    },
    {
      id: 'modules',
      label: 'Módulos',
      icon: 'library-books' as const,
      color: '#6b46c1',
      visible: true,
      onPress: () => onTabChange('modules')
    }
  ];

  const visibleActions = quickActions.filter(action => action.visible);

  if (visibleActions.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.actionsContainer}>
        {visibleActions.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={[styles.actionButton, { backgroundColor: action.color }]}
            onPress={action.onPress}
            activeOpacity={0.7}
          >
            <MaterialIcons name={action.icon} size={16} color="white" />
            <Text style={styles.actionText}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.progressSection}>
        <Text style={styles.progressLabel}>Progreso General</Text>
        <View style={styles.progressBar}>
          <View 
            style={[styles.progressFill, { width: `${courseData.progress ?? 0}%` }]} 
          />
        </View>
        <Text style={styles.progressText}>{courseData.progress ?? 0}%</Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    marginHorizontal: 24,
    marginTop: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    flex: 1,
    flexWrap: 'wrap',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 4,
  },
  actionText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  progressSection: {
    alignItems: 'flex-end',
    minWidth: 120,
  },
  progressLabel: {
    fontSize: 12,
    color: '#718096',
    marginBottom: 4,
  },
  progressBar: {
    width: 100,
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#48bb78',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2d3748',
  },
});

export default QuickActionsBar;