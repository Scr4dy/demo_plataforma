
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Course, CourseContent } from '../../types/course.types';

interface CoursePreviewProps {
  course: Course;
  isVisible: boolean;
  onClose: () => void;
  onEnroll: (courseId: string) => void;
}

export const CoursePreview: React.FC<CoursePreviewProps> = ({
  course,
  isVisible,
  onClose,
  onEnroll
}) => {
  const [selectedContent, setSelectedContent] = useState<number>(0);

  const renderContentPreview = (content: CourseContent) => {
    switch (content.type) {
      case 'video':
        return (
          <View style={styles.videoContainer}>
            <Ionicons name="play-circle" size={64} color="#3b82f6" />
            <Text style={styles.previewText}>Vista previa del video</Text>
          </View>
        );
      case 'pdf':
        return (
          <View style={styles.pdfContainer}>
            <Ionicons name="document-text" size={64} color="#ef4444" />
            <Text style={styles.previewText}>Vista previa del PDF</Text>
          </View>
        );
      case 'quiz':
        return (
          <View style={styles.quizContainer}>
            <Ionicons name="help-circle" size={64} color="#f59e0b" />
            <Text style={styles.previewText}>Ejemplo de pregunta</Text>
          </View>
        );
      default:
        return (
          <View style={styles.defaultContainer}>
            <Text style={styles.previewText}>
              {content.description || 'Contenido disponible al inscribirse'}
            </Text>
          </View>
        );
    }
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#6b7280" />
          </TouchableOpacity>
          <Text style={styles.title}>Vista Previa del Curso</Text>
        </View>

        <ScrollView>
          {}
          <View style={styles.courseInfo}>
            <Text style={styles.courseTitle}>{course.title}</Text>
            <Text style={styles.courseInstructor}>Por: {course.instructor}</Text>
            <Text style={styles.courseDescription}>{course.description}</Text>
            
            <View style={styles.courseMeta}>
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={16} color="#6b7280" />
                <Text style={styles.metaText}>Duración: {course.duration} horas</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="people-outline" size={16} color="#6b7280" />
                <Text style={styles.metaText}>{course.studentsCount} estudiantes</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="star" size={16} color="#f59e0b" />
                <Text style={styles.metaText}>{course.rating}/5</Text>
              </View>
            </View>
          </View>

          {}
          <View style={styles.previewSection}>
            <Text style={styles.sectionTitle}>Contenido de Muestra</Text>
            {course.contents?.slice(0, 3).map((content, index) => (
              <TouchableOpacity
                key={content.id}
                style={[
                  styles.contentItem,
                  selectedContent === index && styles.selectedContent
                ]}
                onPress={() => setSelectedContent(index)}
              >
                <Ionicons 
                  name={
                    content.type === 'video' ? 'play-circle' :
                    content.type === 'pdf' ? 'document-text' :
                    content.type === 'quiz' ? 'help-circle' : 'text'
                  } 
                  size={20} 
                  color="#3b82f6" 
                />
                <Text style={styles.contentTitle}>{content.title}</Text>
                {(content.duration) ? (
                  <Text style={styles.contentDuration}>{content.duration}m</Text>
                ) : null}
              </TouchableOpacity>
            ))}
          </View>

          {}
          {course.contents?.[selectedContent] && (
            <View style={styles.contentPreview}>
              {renderContentPreview(course.contents[selectedContent])}
            </View>
          )}

          {}
          <View style={styles.objectivesSection}>
            <Text style={styles.sectionTitle}>Lo que aprenderás</Text>
            {course.objectives?.map((objective, index) => (
              <View key={index} style={styles.objectiveItem}>
                <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                <Text style={styles.objectiveText}>{objective}</Text>
              </View>
            ))}
          </View>
        </ScrollView>

        {}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.enrollButton}
            onPress={() => onEnroll(course.id)}
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
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  closeButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginLeft: 16,
  },
  courseInfo: {
    padding: 16,
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
    marginBottom: 12,
  },
  courseDescription: {
    fontSize: 16,
    color: '#4b5563',
    lineHeight: 24,
    marginBottom: 16,
  },
  courseMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 14,
    color: '#6b7280',
  },
  previewSection: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  contentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f8fafc',
  },
  selectedContent: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
    borderWidth: 1,
  },
  contentTitle: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    marginLeft: 12,
  },
  contentDuration: {
    fontSize: 12,
    color: '#6b7280',
  },
  contentPreview: {
    padding: 16,
    minHeight: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  videoContainer: {
    alignItems: 'center',
  },
  pdfContainer: {
    alignItems: 'center',
  },
  quizContainer: {
    alignItems: 'center',
  },
  defaultContainer: {
    alignItems: 'center',
    padding: 20,
  },
  previewText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 12,
  },
  objectivesSection: {
    padding: 16,
  },
  objectiveItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 8,
  },
  objectiveText: {
    flex: 1,
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  enrollButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  enrollGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  enrollText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});