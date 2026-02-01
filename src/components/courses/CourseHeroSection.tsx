
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProgressBar } from './ProgressBar';
import type { CourseDetail } from '../../types/course.types';

interface CourseHeroSectionProps {
  courseData: CourseDetail;
  getStatusText: (status: string) => string;
}

export const CourseHeroSection: React.FC<CourseHeroSectionProps> = ({
  courseData,
  getStatusText
}) => {
  return (
    <View style={styles.heroContent}>
      <View style={styles.courseBadge}>
        <Text style={styles.courseBadgeText}>{courseData.category}</Text>
      </View>
      
      <Text style={styles.courseTitle}>{courseData.title}</Text>
      <Text style={styles.courseDescription}>
        {courseData.description}
      </Text>
      
      <View style={styles.courseMeta}>
        <View style={styles.metaItem}>
          <Ionicons name="person-outline" size={16} color="#718096" />
          <Text style={styles.metaText}>{courseData.instructor}</Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="time-outline" size={16} color="#718096" />
          <Text style={styles.metaText}>{courseData.duration}</Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="school-outline" size={16} color="#718096" />
          <Text style={styles.metaText}>{courseData.level}</Text>
        </View>
      </View>

      {}
      <View style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Progreso del Curso</Text>
          <Text style={styles.progressPercentage}>{courseData.progress}%</Text>
        </View>
        <ProgressBar progress={courseData.progress ?? 0} />
        <View style={styles.progressFooter}>
          <Text style={styles.progressSubtext}>
            Último acceso: {typeof courseData.lastAccessed === 'string' ? courseData.lastAccessed : courseData.lastAccessed?.toString?.() || 'N/A'}
          </Text>
          <Text style={styles.progressSubtext}>
            Vence: {courseData.expiryDate}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  heroContent: {
    flex: 2,
  },
  courseBadge: {
    backgroundColor: '#ebf4ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  courseBadgeText: {
    color: '#2b6cb0',
    fontSize: 12,
    fontWeight: '600',
  },
  courseTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a365d',
    marginBottom: 12,
    lineHeight: 32,
  },
  courseDescription: {
    fontSize: 16,
    color: '#4a5568',
    lineHeight: 24,
    marginBottom: 20,
  },
  courseMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    
    marginBottom: 24,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  metaText: {
    color: '#718096',
    fontSize: 14,
    marginLeft: 6,
  },
  progressCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3748',
  },
  progressPercentage: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2b6cb0',
  },
  progressFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressSubtext: {
    fontSize: 12,
    color: '#718096',
  },
});