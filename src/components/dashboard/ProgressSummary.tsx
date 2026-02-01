
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ProgressSummaryProps {
  completedCourses: number;
  totalCourses: number;
  averageProgress: number;
  isMobile?: boolean;
}

export const ProgressSummary: React.FC<ProgressSummaryProps> = ({
  completedCourses,
  totalCourses,
  averageProgress
}) => {
  const completionRate = totalCourses > 0 ? (completedCourses / totalCourses) * 100 : 0;

  return (
    <View style={[styles.container, { backgroundColor: '#ffffff' }]}>
      <Text style={[styles.title, { color: '#333333' }]}>Resumen de Progreso</Text>
      
      <View style={styles.statsContainer}>
        <View style={styles.stat}>
          <Text style={[styles.statNumber, { color: '#2196F3' }]}>
            {completedCourses}
          </Text>
          <Text style={[styles.statLabel, { color: '#666666' }]}>
            Completados
          </Text>
        </View>
        
        <View style={styles.stat}>
          <Text style={[styles.statNumber, { color: '#2196F3' }]}>
            {totalCourses}
          </Text>
          <Text style={[styles.statLabel, { color: '#666666' }]}>
            Total Cursos
          </Text>
        </View>
        
        <View style={styles.stat}>
          <Text style={[styles.statNumber, { color: '#2196F3' }]}>
            {completionRate.toFixed(0)}%
          </Text>
          <Text style={[styles.statLabel, { color: '#666666' }]}>
            Tasa de Finalización
          </Text>
        </View>
        
        <View style={styles.stat}>
          <Text style={[styles.statNumber, { color: '#2196F3' }]}>
            {averageProgress}%
          </Text>
          <Text style={[styles.statLabel, { color: '#666666' }]}>
            Progreso Promedio
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stat: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
});