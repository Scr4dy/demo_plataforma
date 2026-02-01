
import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Alert } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useEvaluaciones } from '../../hooks/useEvaluaciones';
import { Ionicons } from '@expo/vector-icons';

interface CourseEvaluationModalProps {
  visible: boolean;
  onClose: () => void;
  cursoId: number;
  empleadoId: number;
  cursoTitulo: string;
  onEvaluationComplete?: () => void;
}

export const CourseEvaluationModal: React.FC<CourseEvaluationModalProps> = ({
  visible,
  onClose,
  cursoId,
  empleadoId,
  cursoTitulo,
  onEvaluationComplete,
}) => {
  const { theme } = useTheme();
  const { evaluarContenido, evaluarInstructor, obtenerEvaluacionContenido, obtenerEvaluacionInstructor, loading } = useEvaluaciones();

  
  const [utilidad, setUtilidad] = useState(0);
  const [comprension, setComprension] = useState(0);
  const [comentariosContenido, setComentariosContenido] = useState('');

  
  const [puntuacionInstructor, setPuntuacionInstructor] = useState(0);
  const [comentariosInstructor, setComentariosInstructor] = useState('');

  const [yaEvaluado, setYaEvaluado] = useState(false);

  useEffect(() => {
    if (visible) {
      cargarEvaluacionExistente();
    }
  }, [visible, cursoId, empleadoId]);

  const cargarEvaluacionExistente = async () => {
    try {
      const [evalContenido, evalInstructor] = await Promise.all([
        obtenerEvaluacionContenido(cursoId, empleadoId),
        obtenerEvaluacionInstructor(cursoId, empleadoId),
      ]);

      if (evalContenido) {
        setUtilidad(evalContenido.utilidad);
        setComprension(evalContenido.comprension);
        setComentariosContenido(evalContenido.comentarios || '');
        setYaEvaluado(true);
      }

      if (evalInstructor) {
        setPuntuacionInstructor(evalInstructor.puntuacion);
        setComentariosInstructor(evalInstructor.comentarios || '');
      }
    } catch (error) {
      
    }
  };

  const handleSubmit = async () => {
    
    if (utilidad === 0 || comprension === 0) {
      Alert.alert('Evaluación incompleta', 'Por favor califica la utilidad y comprensión del contenido');
      return;
    }

    if (puntuacionInstructor === 0) {
      Alert.alert('Evaluación incompleta', 'Por favor califica al instructor');
      return;
    }

    try {
      
      const resultadoContenido = await evaluarContenido({
        id_curso: cursoId,
        id_empleado: empleadoId,
        utilidad,
        comprension,
        comentarios: comentariosContenido.trim() || undefined,
      });

      
      const resultadoInstructor = await evaluarInstructor({
        id_curso: cursoId,
        id_empleado: empleadoId,
        puntuacion: puntuacionInstructor,
        comentarios: comentariosInstructor.trim() || undefined,
      });

      if (resultadoContenido && resultadoInstructor) {
        Alert.alert(
          '¡Gracias por tu evaluación!',
          yaEvaluado ? 'Tu evaluación ha sido actualizada' : 'Tu opinión nos ayuda a mejorar',
          [
            {
              text: 'Cerrar',
              onPress: () => {
                onEvaluationComplete?.();
                onClose();
              },
            },
          ]
        );
      }
    } catch (error) {
      
      Alert.alert('Error', 'No se pudo guardar tu evaluación. Intenta nuevamente.');
    }
  };

  const renderStars = (rating: number, setRating: (val: number) => void, label: string) => (
    <View style={styles.ratingSection}>
      <Text style={[styles.ratingLabel, { color: theme.colors.text }]}>{label}</Text>
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setRating(star)}
            style={styles.starButton}
          >
            <Ionicons
              name={star <= rating ? 'star' : 'star-outline'}
              size={32}
              color={star <= rating ? '#FFD700' : theme.colors.border}
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: theme.colors.card }]}>
          {}
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              {yaEvaluado ? 'Actualizar Evaluación' : 'Evaluar Curso'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.courseTitle, { color: theme.colors.primary }]}>
            {cursoTitulo}
          </Text>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {}
            <View style={styles.section}>
              <View style={styles.sectionTitleContainer}>
                <Ionicons name="book" size={20} color={theme.colors.primary} />
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                  Evaluación del Contenido
                </Text>
              </View>

              {renderStars(utilidad, setUtilidad, '¿Qué tan útil fue el contenido?')}
              {renderStars(comprension, setComprension, '¿Qué tan fácil fue de comprender?')}

              <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
                Comentarios sobre el contenido (opcional)
              </Text>
              <TextInput
                style={[styles.textInput, { 
                  backgroundColor: theme.colors.background, 
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                }]}
                value={comentariosContenido}
                onChangeText={setComentariosContenido}
                placeholder="¿Qué te pareció el material del curso?"
                placeholderTextColor={theme.colors.border}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {}
            <View style={styles.section}>
              <View style={styles.sectionTitleContainer}>
                <Ionicons name="person" size={20} color={theme.colors.primary} />
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                  Evaluación del Instructor
                </Text>
              </View>

              {renderStars(puntuacionInstructor, setPuntuacionInstructor, '¿Cómo calificarías al instructor?')}

              <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
                Comentarios sobre el instructor (opcional)
              </Text>
              <TextInput
                style={[styles.textInput, { 
                  backgroundColor: theme.colors.background, 
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                }]}
                value={comentariosInstructor}
                onChangeText={setComentariosInstructor}
                placeholder="¿Qué opinas de la instrucción recibida?"
                placeholderTextColor={theme.colors.border}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {}
            <View style={styles.buttons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton, { borderColor: theme.colors.primary }]}
                onPress={onClose}
              >
                <Text style={[styles.buttonText, { color: theme.colors.primary }]}>
                  Cancelar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.submitButton, { backgroundColor: theme.colors.primary }]}
                onPress={handleSubmit}
                disabled={loading}
              >
                <Text style={[styles.buttonText, { color: '#FFF' }]}>
                  {loading ? 'Guardando...' : yaEvaluado ? 'Actualizar' : 'Enviar Evaluación'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    maxWidth: 600,
    maxHeight: '90%',
    borderRadius: 12,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  ratingSection: {
    marginBottom: 20,
  },
  ratingLabel: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  starButton: {
    padding: 4,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 8,
    marginTop: 8,
    fontWeight: '500',
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    minHeight: 80,
    fontSize: 14,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    marginBottom: 20,
  },
  button: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  submitButton: {
    
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CourseEvaluationModal;
