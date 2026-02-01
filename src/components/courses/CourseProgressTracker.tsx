import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface CourseProgressTrackerProps {
  progress: number;
  completedModules: number;
  totalModules: number;
  size?: 'normal' | 'compact';
}

export const CourseProgressTracker: React.FC<CourseProgressTrackerProps> = ({
  progress,
  completedModules,
  totalModules,
  size = 'normal'
}) => {
  const isCompact = size === 'compact';

  return (
    <View style={[styles.container, isCompact && styles.compactContainer]}>
      <Text style={[styles.progressText, isCompact && styles.compactProgressText]}>
        {progress}% completado
      </Text>
      <View style={[styles.progressBar, isCompact && styles.compactProgressBar]}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>
      <Text style={[styles.modulesText, isCompact && styles.compactModulesText]}>
        {completedModules}/{totalModules} módulos
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 8,
  },
  compactContainer: {
    gap: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2d3748',
  },
  compactProgressText: {
    fontSize: 12,
  },
  progressBar: {
    width: 120,
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  compactProgressBar: {
    width: 80,
    height: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#48bb78',
    borderRadius: 3,
  },
  modulesText: {
    fontSize: 12,
    color: '#718096',
  },
  compactModulesText: {
    fontSize: 10,
  },
});

export default CourseProgressTracker;