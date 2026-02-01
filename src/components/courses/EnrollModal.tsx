
import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface Course {
  id: string;
  title: string;
  description?: string;
  duration?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  category?: string;
  instructor?: string;
  price?: number;
  isFree?: boolean;
}

interface EnrollModalProps {
  course: Course;
  isVisible: boolean;
  onClose: () => void;
  
  onEnroll: () => Promise<any> | void;
  isProcessing?: boolean;
}

const EnrollModal: React.FC<EnrollModalProps> = ({
  course,
  isVisible,
  onClose,
  onEnroll,
  isProcessing = false
}) => {
  const { theme, colors } = useTheme();
  const handleEnroll = async () => {
    try {
      const result = await Promise.resolve(onEnroll());
      return result;
    } catch (err) {
      
      throw err;
    }
    
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {}
            <View style={styles.header}>
              <Text style={[styles.title, { color: theme.colors.text }]}>Inscribirse en el Curso</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={[styles.closeText, { color: theme.colors.textSecondary }]}>×</Text>
              </TouchableOpacity>
            </View>

            {}
            <View style={styles.courseInfo}>
              <Text style={[styles.courseTitle, { color: theme.colors.text }]}>{course.title}</Text>
              
              {course.description && (
                <Text style={[styles.courseDescription, { color: theme.colors.textSecondary }]}> 
                  {course.description}
                </Text>
              )}

              {}
              <View style={styles.detailsGrid}>
                {course.duration && (
                  <View style={styles.detailItem}>
                    <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Duración</Text>
                    <Text style={[styles.detailValue, { color: theme.colors.text }]}>{course.duration}</Text>
                  </View>
                )}
                
                {course.category && (
                  <View style={styles.detailItem}>
                    <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Categoría</Text>
                    <Text style={[styles.detailValue, { color: theme.colors.text }]}>{course.category}</Text>
                  </View>
                )}
                
                {course.instructor && (
                  <View style={styles.detailItem}>
                    <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Instructor</Text>
                    <Text style={[styles.detailValue, { color: theme.colors.text }]}>{course.instructor}</Text>
                  </View>
                )}
              </View>

              {}
              <View style={styles.priceSection}>
                {course.price && course.price > 0 ? (
                  <Text style={[styles.paidPrice, { color: theme.colors.text }]}>{`$${course.price}`}</Text>
                ) : null}
              </View>
            </View>

            {}
            <View style={styles.benefitsSection}>
              <Text style={[styles.benefitsTitle, { color: theme.colors.text }]}>Lo que obtendrás:</Text>
              
              <View style={styles.benefitItem}>
                <Text style={styles.benefitIcon}>✓</Text>
                <Text style={[styles.benefitText, { color: theme.colors.textSecondary }]}>Acceso completo al contenido del curso</Text>
              </View>
              
              <View style={styles.benefitItem}>
                <Text style={styles.benefitIcon}>✓</Text>
                <Text style={styles.benefitText}>Recursos descargables</Text>
              </View>
              
              <View style={styles.benefitItem}>
                <Text style={styles.benefitIcon}>✓</Text>
                <Text style={styles.benefitText}>Certificado de finalización</Text>
              </View>
              
              <View style={styles.benefitItem}>
                <Text style={styles.benefitIcon}>✓</Text>
                <Text style={styles.benefitText}>Acceso a la comunidad</Text>
              </View>
            </View>
          </ScrollView>

          {}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.cancelButton, { backgroundColor: theme.colors.card }]} 
              onPress={onClose}
            >
              <Text style={[styles.cancelButtonText, { color: theme.colors.text }]}>Cancelar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.enrollButton, { backgroundColor: colors.primary }]} 
              onPress={handleEnroll}
              disabled={isProcessing}
            >
              <Text style={[styles.enrollButtonText, { color: '#fff' }]}>
                {isProcessing ? 'Procesando...' : 'Inscribirse'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  scrollContent: {
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a202c',
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  closeText: {
    fontSize: 24,
    color: '#718096',
    fontWeight: 'bold',
  },
  courseInfo: {
    marginBottom: 24,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 8,
  },
  courseDescription: {
    fontSize: 14,
    color: '#718096',
    lineHeight: 20,
    marginBottom: 16,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
    marginBottom: 16,
  },
  detailItem: {
    width: '50%',
    paddingHorizontal: 8,
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 12,
    color: '#718096',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    color: '#2d3748',
    fontWeight: '500',
  },
  priceSection: {
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  freePrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#48bb78',
  },
  paidPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d3748',
  },
  benefitsSection: {
    marginBottom: 24,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  benefitIcon: {
    color: '#48bb78',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
    marginTop: 2,
  },
  benefitText: {
    fontSize: 14,
    color: '#4a5568',
    flex: 1,
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: '#f7fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cancelButtonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#4a5568',
  },
  enrollButton: {
    flex: 2,
    paddingVertical: 14,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  enrollButtonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

export default EnrollModal;