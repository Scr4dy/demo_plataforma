import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { evaluacionesService } from '../../services/evaluacionesService';
import { platformShadow } from '../../utils/styleHelpers';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface CourseFeedbackModalProps {
  visible: boolean;
  courseId: number;
  userId: number; 
  onClose: () => void;
  onSuccess: () => void;
  mode?: 'all' | 'instructor' | 'content'; 
}

export const CourseFeedbackModal: React.FC<CourseFeedbackModalProps> = ({
  visible,
  courseId,
  userId,
  onClose,
  onSuccess,
  mode = 'all'
}) => {
  const { theme, colors } = useTheme();
  const insets = useSafeAreaInsets();
  
  
  const [step, setStep] = useState(mode === 'content' ? 2 : 1);
  const [loading, setLoading] = useState(false);

  
  const [instructorRating, setInstructorRating] = useState(0);
  const [instructorComment, setInstructorComment] = useState('');

  
  const [contentUtility, setContentUtility] = useState(0);
  const [contentComprehension, setContentComprehension] = useState(0);
  const [contentComment, setContentComment] = useState('');

  
  React.useEffect(() => {
    if (visible) {
      setStep(mode === 'content' ? 2 : 1);
      setInstructorRating(0);
      setInstructorComment('');
      setContentUtility(0);
      setContentComprehension(0);
      setContentComment('');
    }
  }, [visible, mode]);

  const handleClose = () => {
    if (loading) return;
    onClose();
  };

  const handleNext = async () => {
    if (instructorRating === 0) {
      Alert.alert('Calificación requerida', 'Por favor califica al instructor antes de continuar.');
      return;
    }
    
    
    if (mode === 'instructor') {
      await submitInstructor();
    } else {
      setStep(2);
    }
  };

  const submitInstructor = async () => {
    try {
      setLoading(true);
      await evaluacionesService.evaluarInstructor({
        id_curso: courseId,
        id_empleado: userId,
        puntuacion: instructorRating,
        comentarios: instructorComment
      });
      Alert.alert('¡Gracias!', 'Tu evaluación del instructor ha sido guardada.');
      onSuccess();
    } catch (error) {
      
      Alert.alert('Error', 'Hubo un problema al guardar.');
    } finally {
      setLoading(false);
    }
  };

  const submitContent = async () => {
    if (contentUtility === 0 || contentComprehension === 0) {
      Alert.alert('Calificación requerida', 'Por favor califica ambos aspectos del contenido.');
      return;
    }

    try {
      setLoading(true);
      await evaluacionesService.evaluarContenido({
        id_curso: courseId,
        id_empleado: userId,
        utilidad: contentUtility,
        comprension: contentComprehension,
        comentarios: contentComment
      });
      Alert.alert('¡Gracias!', 'Tu evaluación del contenido ha sido guardada.');
      onSuccess();
    } catch (error) {
      
      Alert.alert('Error', 'Hubo un problema al guardar.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAll = async () => {
    
    if (contentUtility === 0 || contentComprehension === 0) {
      Alert.alert('Calificación requerida', 'Por favor califica ambos aspectos del contenido.');
      return;
    }

    try {
      setLoading(true);

      
      
      
      
      
      await evaluacionesService.evaluarInstructor({
        id_curso: courseId,
        id_empleado: userId,
        puntuacion: instructorRating,
        comentarios: instructorComment
      });

      await evaluacionesService.evaluarContenido({
        id_curso: courseId,
        id_empleado: userId,
        utilidad: contentUtility,
        comprension: contentComprehension,
        comentarios: contentComment
      });

      Alert.alert('¡Gracias!', 'Tus comentarios han sido guardados exitosamente.');
      onSuccess();
    } catch (error) {
      
      Alert.alert('Error', 'Hubo un problema al guardar tu evaluación.');
    } finally {
      setLoading(false);
    }
  };

  const onPrimaryAction = () => {
    if (mode === 'instructor') {
      handleNext(); 
    } else if (mode === 'content') {
      submitContent();
    } else {
      
      if (step === 1) handleNext();
      else handleSubmitAll();
    }
  };

  const StarRating = ({ value, onChange, size = 32 }: { value: number, onChange: (val: number) => void, size?: number }) => (
    <View style={styles.starsContainer}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => onChange(star)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={star <= value ? 'star' : 'star-outline'}
            size={size}
            color={star <= value ? '#FFC107' : colors.textSecondary}
          />
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={[styles.overlay, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={[styles.container, { backgroundColor: theme.colors.card, ...platformShadow({ elevation: 5, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } }) }]}>
          
          {}
          <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
            <Text style={[styles.title, { color: colors.text }]}>
              {step === 1 ? 'Evalúa al Instructor' : 'Evalúa el Contenido'}
            </Text>
            {!loading && (
              <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          <ScrollView style={styles.content}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Guardando tu opinión...</Text>
              </View>
            ) : (
              <>
                {step === 1 ? (
                  
                  <View style={styles.stepContainer}>
                    <Text style={[styles.description, { color: colors.textSecondary }]}>
                      ¿Qué tan satisfecho estás con el desempeño y claridad del instructor?
                    </Text>
                    
                    <View style={styles.ratingSection}>
                      <Text style={[styles.label, { color: colors.text }]}>Calificación General</Text>
                      <StarRating value={instructorRating} onChange={setInstructorRating} />
                    </View>

                    <View style={styles.inputContainer}>
                      <Text style={[styles.label, { color: colors.text }]}>Comentarios (Opcional)</Text>
                      <TextInput
                        style={[styles.input, { 
                          backgroundColor: theme.colors.background, 
                          color: colors.text,
                          borderColor: theme.colors.border 
                        }]}
                        placeholder="Comparte tu opinión sobre el instructor..."
                        placeholderTextColor={theme.colors.textSecondary}
                        multiline
                        numberOfLines={4}
                        value={instructorComment}
                        onChangeText={setInstructorComment}
                      />
                    </View>
                  </View>
                ) : (
                  
                  <View style={styles.stepContainer}>
                    <Text style={[styles.description, { color: colors.textSecondary }]}>
                      Evalúa la calidad y utilidad del material del curso.
                    </Text>

                    <View style={styles.ratingSection}>
                      <Text style={[styles.label, { color: colors.text }]}>¿Qué tan útil fue el contenido?</Text>
                      <StarRating value={contentUtility} onChange={setContentUtility} />
                    </View>

                    <View style={styles.ratingSection}>
                      <Text style={[styles.label, { color: colors.text }]}>Facilidad de comprensión</Text>
                      <StarRating value={contentComprehension} onChange={setContentComprehension} />
                    </View>

                    <View style={styles.inputContainer}>
                      <Text style={[styles.label, { color: colors.text }]}>Comentarios (Opcional)</Text>
                      <TextInput
                        style={[styles.input, { 
                          backgroundColor: theme.colors.background, 
                          color: colors.text,
                          borderColor: theme.colors.border 
                        }]}
                        placeholder="¿Hay algo que mejorar en el contenido?"
                        placeholderTextColor={theme.colors.textSecondary}
                        multiline
                        numberOfLines={4}
                        value={contentComment}
                        onChangeText={setContentComment}
                      />
                    </View>
                  </View>
                )}
              </>
            )}
          </ScrollView>

          {}
          {!loading && (
            <View style={[styles.footer, { borderTopColor: theme.colors.border }]}>
               {step === 2 && mode === 'all' && (
                <TouchableOpacity 
                  style={[styles.secondaryButton, { borderColor: theme.colors.border }]} 
                  onPress={() => setStep(1)}
                  disabled={loading}
                >
                  <Text style={[styles.secondaryButtonText, { color: colors.text }]}>Volver</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity 
                style={[styles.primaryButton, { backgroundColor: colors.primary, flex: (step === 1 && mode === 'all') ? 1 : 2 }]} 
                onPress={onPrimaryAction}
              >
                <Text style={styles.primaryButtonText}>
                  {mode === 'all' && step === 1 ? 'Siguiente' : 'Enviar Evaluación'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  container: {
    borderRadius: 16,
    maxHeight: '90%',
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeBtn: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  stepContainer: {
    gap: 20,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 8,
  },
  ratingSection: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  inputContainer: {
    gap: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    textAlignVertical: 'top',
    minHeight: 100,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    gap: 12,
  },
  primaryButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    flex: 1,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  }
});

export default CourseFeedbackModal;
