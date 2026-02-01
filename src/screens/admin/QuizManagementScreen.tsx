
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  Modal,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useCommonHeader } from '../../hooks/useCommonHeader';
import { useHeader } from '../../context/HeaderContext';
import { quizService } from '../../services/quizService';
import { PreguntaQuiz, OpcionRespuesta } from '../../types/quiz.types';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';

type RouteParams = {
  QuizManagement: {
    contentId: string;
    contentTitle?: string;
  };
};

type Props = {
  contentId?: string | number;
  contentTitle?: string;
};

export const QuizManagementScreen: React.FC<Props> = ({ contentId: propContentId, contentTitle: propContentTitle }) => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, 'QuizManagement'>>();
  const { theme, colors } = useTheme();

  
  const resolvedContentId = route.params?.contentId ?? propContentId;
  const resolvedContentTitle = route.params?.contentTitle ?? propContentTitle;

  const { header, setHeader } = useHeader();
  const [preguntas, setPreguntas] = useState<PreguntaQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPregunta, setEditingPregunta] = useState<PreguntaQuiz | null>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [preguntaToDelete, setPreguntaToDelete] = useState<PreguntaQuiz | null>(null);

  
  const [textoPregunta, setTextoPregunta] = useState('');
  const [tipoPregunta, setTipoPregunta] = useState<'multiple' | 'verdadero_falso' | 'texto'>('multiple');
  const [puntos, setPuntos] = useState('10');
  const [opciones, setOpciones] = useState<{ texto: string; correcta: boolean }[]>([
    { texto: '', correcta: false },
    { texto: '', correcta: false },
  ]);

  useCommonHeader(resolvedContentTitle || 'Gestión de Quiz');

  React.useEffect(() => {
    
    setHeader({
      title: 'Gestión de Quiz',
      subtitle: resolvedContentTitle ? String(resolvedContentTitle) : undefined,
      showBack: true,
      manual: true,
      owner: 'QuizManagement',
      onBack: () => navigation.goBack(),
      containerStyle: Platform.OS !== 'web' ? { backgroundColor: colors.primary } : undefined,
      backIconColor: Platform.OS !== 'web' ? theme.colors.card : undefined,
      alignLeftOnMobile: true,
    } as any);

    return () => {
      
      try {
        if (header && (header.owner === 'QuizManagement' || (header.manual && header.title === 'Gestión de Quiz'))) {
          setHeader(null);
        }
      } catch (e) {
        
      }
    };
  }, [setHeader, navigation, resolvedContentTitle, colors.primary, theme.colors.card]);

  
  React.useEffect(() => {
    if (Platform.OS === 'web') {
      try {
        const { goToWebRoute, clearWebRoute } = require('../../utils/webNav');
        goToWebRoute('QuizManagement', { contentId: resolvedContentId, contentTitle: resolvedContentTitle });
        return () => { try { clearWebRoute(); } catch (_) {  } };
      } catch (e) {  }
    }
  }, [resolvedContentId, resolvedContentTitle]);

  useEffect(() => {
    
    const cidRaw = resolvedContentId;
    if (!cidRaw) {
      if (process.env.NODE_ENV !== 'production') 
      setLoading(false);
      return;
    }

    loadPreguntas();
  }, [resolvedContentId]);

  const loadPreguntas = async () => {
    try {
      setLoading(true);
      const raw = resolvedContentId;
      if (!raw) throw new Error('No contentId parameter');

      const contentId = Number.isInteger(Number(raw)) ? Number(raw) : parseInt(String(raw), 10);
      if (!Number.isFinite(contentId) || Number.isNaN(contentId)) throw new Error('Invalid contentId parameter: ' + String(raw));

      const data = await quizService.getPreguntasQuiz(contentId);
      setPreguntas(data || []);
    } catch (error: any) {
      
      
      if (error?.message && !error.message.includes('No contentId')) {
        Alert.alert('Error', 'No se pudieron cargar las preguntas');
      }
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingPregunta(null);
    setTextoPregunta('');
    setTipoPregunta('multiple');
    setPuntos('10');
    setOpciones([
      { texto: '', correcta: false },
      { texto: '', correcta: false },
    ]);
    setModalVisible(true);
  };

  const openEditModal = (pregunta: PreguntaQuiz) => {
    setEditingPregunta(pregunta);
    setTextoPregunta(pregunta.pregunta);
    setTipoPregunta(pregunta.tipo_pregunta);
    setPuntos(pregunta.puntos.toString());
    setOpciones(
      pregunta.opciones?.map(op => ({
        texto: op.texto_opcion,
        correcta: op.es_correcta,
      })) || [{ texto: '', correcta: false }, { texto: '', correcta: false }]
    );
    setModalVisible(true);
  };

  const handleSave = async () => {
    
    try {
      
      
      if (!textoPregunta.trim()) {
        
        Alert.alert('Error', 'Ingresa el texto de la pregunta');
        return;
      }

      if (tipoPregunta !== 'texto') {
        const opcionesValidas = opciones.filter(op => op.texto.trim());
        if (opcionesValidas.length < 2) {
          
          Alert.alert('Error', 'Debes agregar al menos 2 opciones con texto');
          return;
        }
        if (!opcionesValidas.some(op => op.correcta)) {
          
          Alert.alert('Error', 'Debes marcar al menos una opción como correcta');
          return;
        }
      }

      const puntosNum = parseInt(puntos) || 10;
      

      if (editingPregunta) {
        
        
        await quizService.actualizarPregunta(editingPregunta.id_pregunta, {
          pregunta: textoPregunta,
          tipo_pregunta: tipoPregunta,
          puntos: puntosNum,
        });

        
        if (tipoPregunta !== 'texto' && editingPregunta.opciones) {
          
          for (let i = 0; i < opciones.length; i++) {
            const opcion = opciones[i];
            if (!opcion.texto.trim()) continue;

            if (editingPregunta.opciones[i]) {
              
              await quizService.actualizarOpcion(editingPregunta.opciones[i].id_opcion, {
                texto_opcion: opcion.texto,
                es_correcta: opcion.correcta,
              });
            } else {
              
              await quizService.crearOpcion(
                editingPregunta.id_pregunta,
                opcion.texto,
                opcion.correcta,
                i + 1
              );
            }
          }
        }

        Alert.alert('Éxito', 'Pregunta actualizada');
      } else {
        
        const contentId = parseInt(String(resolvedContentId), 10);
        

        const nuevaPregunta = await quizService.crearPregunta(
          contentId,
          textoPregunta,
          tipoPregunta,
          puntosNum
        );
        

        
        if (tipoPregunta !== 'texto') {
          
          for (let i = 0; i < opciones.length; i++) {
            const opcion = opciones[i];
            if (!opcion.texto.trim()) continue;

            await quizService.crearOpcion(
              nuevaPregunta.id_pregunta,
              opcion.texto,
              opcion.correcta,
              i + 1
            );
          }
        }

        Alert.alert('Éxito', 'Pregunta creada');
      }

      setModalVisible(false);
      loadPreguntas();
    } catch (error) {
      
      Alert.alert('Error', 'No se pudo guardar la pregunta. Revisa la consola para más detalles.');
    }
  };

  const handleDelete = (pregunta: PreguntaQuiz) => {
    setPreguntaToDelete(pregunta);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (!preguntaToDelete) return;
    try {
      await quizService.eliminarPregunta(preguntaToDelete.id_pregunta);
      Alert.alert('Éxito', 'Pregunta eliminada');
      loadPreguntas();
    } catch (error) {
      
      Alert.alert('Error', 'No se pudo eliminar la pregunta');
    } finally {
      setDeleteModalVisible(false);
      setPreguntaToDelete(null);
    }
  };

  const addOpcion = () => {
    setOpciones([...opciones, { texto: '', correcta: false }]);
  };

  const removeOpcion = (index: number) => {
    if (opciones.length > 2) {
      setOpciones(opciones.filter((_, i) => i !== index));
    }
  };

  const updateOpcion = (index: number, field: 'texto' | 'correcta', value: any) => {
    const nuevasOpciones = [...opciones];
    if (field === 'texto') {
      nuevasOpciones[index].texto = value;
    } else {
      
      if (tipoPregunta === 'verdadero_falso') {
        nuevasOpciones.forEach((op, i) => {
          op.correcta = i === index;
        });
      } else {
        nuevasOpciones[index].correcta = value;
      }
    }
    setOpciones(nuevasOpciones);
  };

  const handleTypeChange = (value: 'multiple' | 'verdadero_falso' | 'texto') => {
    setTipoPregunta(value);
    if (value === 'verdadero_falso') {
      setOpciones([
        { texto: 'Verdadero', correcta: true },
        { texto: 'Falso', correcta: false }
      ]);
    } else if (value === 'multiple' && opciones.length === 2 && opciones[0].texto === 'Verdadero') {
      
      setOpciones([
        { texto: '', correcta: false },
        { texto: '', correcta: false }
      ]);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {preguntas.length} {preguntas.length === 1 ? 'pregunta' : 'preguntas'}
          </Text>
          <TouchableOpacity
            style={[styles.createButton, { backgroundColor: colors.primary }]}
            onPress={openCreateModal}
          >
            <MaterialIcons name="add" size={20} color="#fff" />
            <Text style={styles.createButtonText}>Nueva Pregunta</Text>
          </TouchableOpacity>
        </View>

        {}
        {preguntas.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.card }]}>
            <MaterialIcons name="quiz" size={64} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.text }]}>
              No hay preguntas
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
              Crea la primera pregunta para este quiz
            </Text>
          </View>
        ) : (
          preguntas.map((pregunta, index) => (
            <View
              key={pregunta.id_pregunta}
              style={[styles.preguntaCard, { backgroundColor: colors.card }]}
            >
              <View style={styles.preguntaHeader}>
                <View style={styles.preguntaInfo}>
                  <Text style={[styles.preguntaNumero, { color: colors.primary }]}>
                    Pregunta {index + 1}
                  </Text>
                  <View style={styles.badgeRow}>
                    <View style={[styles.badge, { backgroundColor: colors.primary + '20' }]}>
                      <Text style={[styles.badgeText, { color: colors.primary }]}>
                        {pregunta.tipo_pregunta === 'multiple'
                          ? 'Opción Múltiple'
                          : pregunta.tipo_pregunta === 'verdadero_falso'
                            ? 'V/F'
                            : 'Texto'}
                      </Text>
                    </View>
                    <View style={[styles.badge, { backgroundColor: colors.success + '20' }]}>
                      <Text style={[styles.badgeText, { color: colors.success }]}>
                        {pregunta.puntos} pts
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={styles.preguntaActions}>
                  <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => openEditModal(pregunta)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <MaterialIcons name="edit" size={20} color={colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => handleDelete(pregunta)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    activeOpacity={0.6}
                  >
                    <MaterialIcons name="delete" size={20} color={colors.error} />
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={[styles.preguntaTexto, { color: colors.text }]}>
                {pregunta.pregunta}
              </Text>

              {pregunta.opciones && pregunta.opciones.length > 0 && (
                <View style={styles.opcionesList}>
                  {pregunta.opciones.map((opcion, idx) => (
                    <View
                      key={opcion.id_opcion}
                      style={[
                        styles.opcionItem,
                        {
                          backgroundColor: opcion.es_correcta
                            ? colors.success + '15'
                            : colors.background,
                        },
                      ]}
                    >
                      <MaterialIcons
                        name={opcion.es_correcta ? 'check-circle' : 'radio-button-unchecked'}
                        size={16}
                        color={opcion.es_correcta ? colors.success : colors.textSecondary}
                      />
                      <Text
                        style={[
                          styles.opcionTexto,
                          {
                            color: opcion.es_correcta ? colors.success : colors.textSecondary,
                          },
                        ]}
                      >
                        {opcion.texto_opcion}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>

      {}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {editingPregunta ? 'Editar Pregunta' : 'Nueva Pregunta'}
            </Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <MaterialIcons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {}
            <Text style={[styles.label, { color: colors.text }]}>Pregunta *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
              value={textoPregunta}
              onChangeText={setTextoPregunta}
              placeholder="Escribe la pregunta..."
              placeholderTextColor={colors.textSecondary}
              multiline
            />

            {}
            <Text style={[styles.label, { color: colors.text }]}>Tipo *</Text>
            <View style={styles.tipoRow}>
              {[
                { value: 'multiple', label: 'Opción Múltiple' },
                { value: 'verdadero_falso', label: 'Verdadero/Falso' },
              ].map((tipo) => (
                <TouchableOpacity
                  key={tipo.value}
                  style={[
                    styles.tipoButton,
                    {
                      backgroundColor:
                        tipoPregunta === tipo.value ? colors.primary : colors.card,
                    },
                  ]}
                  onPress={() => handleTypeChange(tipo.value as any)}
                >
                  <Text
                    style={[
                      styles.tipoButtonText,
                      {
                        color: tipoPregunta === tipo.value ? '#fff' : colors.text,
                      },
                    ]}
                  >
                    {tipo.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {}
            <Text style={[styles.label, { color: colors.text }]}>Puntos *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
              value={puntos}
              onChangeText={setPuntos}
              placeholder="10"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
            />

            {}
            {tipoPregunta !== 'texto' && (
              <>
                <View style={styles.opcionesHeader}>
                  <Text style={[styles.label, { color: colors.text }]}>Opciones *</Text>
                  {tipoPregunta === 'multiple' && (
                    <TouchableOpacity
                      style={[styles.addOpcionButton, { borderColor: colors.primary }]}
                      onPress={addOpcion}
                    >
                      <MaterialIcons name="add" size={16} color={colors.primary} />
                      <Text style={[styles.addOpcionText, { color: colors.primary }]}>
                        Agregar
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                {opciones.map((opcion, index) => (
                  <View key={index} style={styles.opcionRow}>
                    <TouchableOpacity
                      style={styles.checkboxContainer}
                      onPress={() => {
                        if (tipoPregunta === 'verdadero_falso') {
                          
                          const newOpciones = opciones.map((o, i) => ({
                            ...o,
                            correcta: i === index
                          }));
                          setOpciones(newOpciones);
                        } else {
                          
                          updateOpcion(index, 'correcta', !opcion.correcta);
                        }
                      }}
                    >
                      <MaterialIcons
                        name={
                          tipoPregunta === 'verdadero_falso'
                            ? (opcion.correcta ? 'radio-button-checked' : 'radio-button-unchecked')
                            : (opcion.correcta ? 'check-box' : 'check-box-outline-blank')
                        }
                        size={24}
                        color={opcion.correcta ? colors.success : colors.textSecondary}
                      />
                    </TouchableOpacity>
                    <TextInput
                      style={[
                        styles.opcionInput,
                        { backgroundColor: colors.card, color: colors.text },
                      ]}
                      value={opcion.texto}
                      onChangeText={(text) => updateOpcion(index, 'texto', text)}
                      placeholder={`Opción ${index + 1}`}
                      placeholderTextColor={colors.textSecondary}
                      editable={true}
                    />
                    {tipoPregunta === 'multiple' && opciones.length > 2 && (
                      <TouchableOpacity onPress={() => removeOpcion(index)}>
                        <MaterialIcons name="delete" size={20} color={colors.error} />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </>
            )}
          </ScrollView>

          {}
          <View style={[styles.modalFooter, { borderTopColor: colors.border }]}>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: colors.card }]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={[styles.modalButtonText, { color: colors.text }]}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: colors.primary }]}
              onPress={handleSave}
            >
              <Text style={[styles.modalButtonText, { color: '#fff' }]}>Guardar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal >

      {}
      <ConfirmationModal
        visible={deleteModalVisible}
        title="Eliminar pregunta"
        message="¿Estás seguro de eliminar esta pregunta? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={confirmDelete}
        onCancel={() => {
          setDeleteModalVisible(false);
          setPreguntaToDelete(null);
        }}
      />
    </View >
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyCard: {
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  preguntaCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  preguntaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  preguntaInfo: {
    flex: 1,
  },
  preguntaNumero: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  preguntaActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    padding: 8,
    minWidth: 32,
    minHeight: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  preguntaTexto: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 12,
  },
  opcionesList: {
    gap: 6,
  },
  opcionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 6,
    gap: 8,
  },
  opcionTexto: {
    fontSize: 14,
    flex: 1,
  },
  
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  tipoRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tipoButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  tipoButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  opcionesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addOpcionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    gap: 4,
  },
  addOpcionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  opcionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  checkboxContainer: {
    padding: 4,
  },
  opcionInput: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    fontSize: 14,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
