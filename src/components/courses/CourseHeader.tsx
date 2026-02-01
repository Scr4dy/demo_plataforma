
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface CourseHeaderProps {
  course: any;
  stats: any;
  onContinueLearning: (module?: any) => void;
  onEnroll: () => void;
  onPreview: () => void;
  nextModule?: any;
  compact?: boolean;
  userRole?: string;
  isEnrolled?: boolean;
  isAuthenticated?: boolean;
  isAdmin?: boolean;
}

export const CourseHeader: React.FC<CourseHeaderProps> = ({
  course,
  stats,
  onContinueLearning,
  onEnroll,
  onPreview,
  nextModule,
  compact = false,
  userRole,
  isEnrolled = false,
  isAuthenticated = false,
  isAdmin = false
}) => {
  const canPreview = !isEnrolled && !isAdmin;
  const canEnroll = !isEnrolled && isAuthenticated && !isAdmin;

  return (
    <View style={[styles.container, compact && styles.compact]}>
      <View style={styles.headerContent}>
        <View style={styles.courseInfo}>
          {stats?.categoryInfo && (
            <View style={styles.categoryBadge}>
              <Ionicons 
                name={stats.categoryInfo.icon || 'book'} 
                size={16} 
                color={stats.categoryInfo.color || '#6b7280'} 
              />
              <Text style={[styles.categoryText, { color: stats.categoryInfo.color }]}>
                {stats.categoryInfo.label}
              </Text>
            </View>
          )}
          
          <Text style={styles.courseTitle}>{course.title}</Text>
          <Text style={styles.courseInstructor}>Por: {course.instructor}</Text>
          
          <View style={styles.statsGrid}>
            {stats?.multimediaContent > 0 && (
              <View style={styles.statItem}>
                <Ionicons name="play-circle" size={16} color="#3b82f6" />
                <Text style={styles.statText}>{stats.multimediaContent} contenidos multimedia</Text>
              </View>
            )}
            {stats?.quizzesCount > 0 && (
              <View style={styles.statItem}>
                <Ionicons name="help-circle" size={16} color="#f59e0b" />
                <Text style={styles.statText}>{stats.quizzesCount} encuestas</Text>
              </View>
            )}
            <View style={styles.statItem}>
              <Ionicons name="time" size={16} color="#6b7280" />
              <Text style={styles.statText}>Duración: {stats?.estimatedTimeRemaining}</Text>
            </View>
          </View>
        </View>

        <View style={styles.actions}>
          {isEnrolled ? (
            <TouchableOpacity 
              style={styles.continueButton}
              onPress={() => onContinueLearning(nextModule)}
            >
              <LinearGradient
                colors={['#10b981', '#059669']}
                style={styles.continueGradient}
              >
                <Ionicons name="play" size={20} color="#ffffff" />
                <Text style={styles.continueText}>
                  {nextModule ? 'Continuar' : 'Revisar Curso'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <>
              {canPreview && (
                <TouchableOpacity 
                  style={styles.previewButton}
                  onPress={onPreview}
                >
                  <Ionicons name="eye" size={20} color="#3b82f6" />
                  <Text style={styles.previewText}>Vista Previa</Text>
                </TouchableOpacity>
              )}
              
              {canEnroll && (
                <TouchableOpacity 
                  style={styles.enrollButton}
                  onPress={onEnroll}
                >
                  <LinearGradient
                    colors={['#3b82f6', '#1e40af']}
                    style={styles.enrollGradient}
                  >
                    <Ionicons name="cart" size={20} color="#ffffff" />
                    <Text style={styles.enrollText}>
                      {course.isFree ? 'Inscribirse Gratis' : `Inscribirse - $${course.price}`}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}

              {!isAuthenticated && (
                <TouchableOpacity 
                  style={styles.enrollButton}
                  onPress={onEnroll}
                >
                  <LinearGradient
                    colors={['#3b82f6', '#1e40af']}
                    style={styles.enrollGradient}
                  >
                    <Ionicons name="log-in" size={20} color="#ffffff" />
                    <Text style={styles.enrollText}>Iniciar Sesión para Inscribirse</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  compact: {
    padding: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  courseInfo: {
    flex: 1,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 12,
    gap: 6,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  courseTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  courseInstructor: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 14,
    color: '#6b7280',
  },
  actions: {
    marginLeft: 16,
  },
  continueButton: {
    borderRadius: 12,
    overflow: 'hidden',
    minWidth: 140,
  },
  continueGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  continueText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  previewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#dbeafe',
    gap: 8,
    marginBottom: 8,
  },
  previewText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3b82f6',
  },
  enrollButton: {
    borderRadius: 12,
    overflow: 'hidden',
    minWidth: 140,
  },
  enrollGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  enrollText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});