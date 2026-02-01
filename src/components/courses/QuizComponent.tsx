
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { quizService } from '../../services/quizService';
import { PreguntaQuiz, ResultadoQuiz } from '../../types/quiz.types';
import { platformShadow } from '../../utils/styleHelpers';

interface QuizComponentProps {
  idContenido: number;
  onComplete: (resultado: ResultadoQuiz) => void;
}

export const QuizComponent: React.FC<QuizComponentProps> = ({ idContenido, onComplete }) => {
  const { theme, colors } = useTheme();
  const { state } = useAuth();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [preguntas, setPreguntas] = useState<PreguntaQuiz[]>([]);
  const [preguntaActual, setPreguntaActual] = useState(0);
  const [respuestas, setRespuestas] = useState<Map<number, number | string>>(new Map());
  const [idIntento, setIdIntento] = useState<number | null>(null);
  const [mostrarResultado, setMostrarResultado] = useState(false);
  const [resultado, setResultado] = useState<ResultadoQuiz | null>(null);
  const [tiempoInicio] = useState(Date.now());

  useEffect(() => {
    cargarQuiz();
  }, [idContenido]);

  const cargarQuiz = async () => {
    try {
      setLoading(true);

      
      if (state.user?.id_usuario) {
        const intentosPrevios = await quizService.getIntentosUsuario(idContenido, state.user.id_usuario);
        const intentoAprobado = intentosPrevios.find(intento => intento.aprobado);
        
        if (intentoAprobado) {
          
          
          const respuestasIntento = await quizService.getRespuestasIntento(intentoAprobado.id_intento);
          const respuestasCorrectas = respuestasIntento.filter(r => r.es_correcta).length;
          const totalPreguntas = respuestasIntento.length;
          
          const resultadoExistente: ResultadoQuiz = {
            aprobado: intentoAprobado.aprobado,
            porcentaje: intentoAprobado.porcentaje || 0,
            puntos_obtenidos: intentoAprobado.puntos_obtenidos || 0,
            puntos_totales: intentoAprobado.puntos_totales || 0,
            respuestas_correctas: respuestasCorrectas,
            total_preguntas: totalPreguntas,
            tiempo_empleado: intentoAprobado.tiempo_empleado || 0
          };
          
          setResultado(resultadoExistente);
          setMostrarResultado(true);
          
          
          onComplete(resultadoExistente);
          
          setLoading(false);
          return;
        }
      }

      
      const preguntasData = await quizService.getPreguntasQuiz(idContenido);
      
      if (preguntasData.length === 0) {
        Alert.alert('Error', 'No hay preguntas disponibles para este quiz');
        return;
      }

      setPreguntas(preguntasData);

      
      if (state.user?.id_usuario) {
        const intento = await quizService.iniciarIntento(idContenido, state.user.id_usuario);
        setIdIntento(intento.id_intento);
      }
    } catch (error) {
      
      Alert.alert('Error', 'No se pudo cargar el quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleSeleccionarRespuesta = (preguntaId: number, valor: number | string) => {
    const nuevasRespuestas = new Map(respuestas);
    nuevasRespuestas.set(preguntaId, valor);
    setRespuestas(nuevasRespuestas);
  };

  const handleSiguiente = () => {
    if (preguntaActual < preguntas.length - 1) {
      setPreguntaActual(preguntaActual + 1);
    }
  };

  const handleAnterior = () => {
    if (preguntaActual > 0) {
      setPreguntaActual(preguntaActual - 1);
    }
  };

  const handleEnviarQuiz = async () => {
    
    const preguntasSinResponder = preguntas.filter(p => !respuestas.has(p.id_pregunta));
    
    if (preguntasSinResponder.length > 0) {
      Alert.alert(
        'Preguntas sin responder',
        `Tienes ${preguntasSinResponder.length} pregunta(s) sin responder. ¿Deseas enviar el quiz de todos modos?`,
        [
          { text: 'Revisar', style: 'cancel' },
          { text: 'Enviar', onPress: enviarQuiz }
        ]
      );
      return;
    }

    enviarQuiz();
  };

  const enviarQuiz = async () => {
    if (!idIntento) {
      Alert.alert('Error', 'No se pudo guardar el intento');
      return;
    }

    try {
      setSubmitting(true);

      
      const resultadoQuiz = await quizService.calificarQuiz(idIntento, preguntas, respuestas);
      
      setResultado(resultadoQuiz);
      setMostrarResultado(true);
      
      
      onComplete(resultadoQuiz);
    } catch (error) {
      
      Alert.alert('Error', 'No se pudo enviar el quiz. Intenta nuevamente.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.card }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>Cargando quiz...</Text>
      </View>
    );
  }

  if (mostrarResultado && resultado) {
    return (
      <View style={[styles.resultadoContainer, { backgroundColor: colors.card }]}>
        <View style={[styles.resultadoIcono, { backgroundColor: resultado.aprobado ? colors.success + '20' : colors.error + '20' }]}>
          <MaterialIcons 
            name={resultado.aprobado ? "check-circle" : "cancel"} 
            size={80} 
            color={resultado.aprobado ? colors.success : colors.error} 
          />
        </View>
        
        <Text style={[styles.resultadoTitulo, { color: colors.text }]}>
          {resultado.aprobado ? '¡Felicidades!' : 'No aprobaste'}
        </Text>
        
        <Text style={[styles.resultadoSubtitulo, { color: colors.textSecondary }]}>
          {resultado.aprobado 
            ? 'Has aprobado el quiz exitosamente' 
            : 'Necesitas al menos 70% para aprobar'}
        </Text>

        <View style={[styles.resultadoStats, { backgroundColor: colors.background }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statValor, { color: colors.primary }]}>
              {resultado.porcentaje.toFixed(1)}%
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Calificación
            </Text>
          </View>

          <View style={styles.statItem}>
            <Text style={[styles.statValor, { color: colors.primary }]}>
              {resultado.respuestas_correctas}/{resultado.total_preguntas}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Correctas
            </Text>
          </View>

          <View style={styles.statItem}>
            <Text style={[styles.statValor, { color: colors.primary }]}>
              {Math.floor(resultado.tiempo_empleado / 60)}:{(resultado.tiempo_empleado % 60).toString().padStart(2, '0')}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Tiempo
            </Text>
          </View>
        </View>

        <View style={[styles.resultadoPuntos, { backgroundColor: colors.background }]}>
          <Text style={[styles.puntosTexto, { color: colors.text }]}>
            Puntos obtenidos: {resultado.puntos_obtenidos} / {resultado.puntos_totales}
          </Text>
        </View>

        {}
        {!resultado.aprobado && (
          <TouchableOpacity
            style={[styles.botonReintentar, { backgroundColor: colors.primary }]}
            onPress={async () => {
              
              setMostrarResultado(false);
              setResultado(null);
              setRespuestas(new Map());
              setPreguntaActual(0);
              setIdIntento(null);
              
              
              await cargarQuiz();
            }}
          >
            <Ionicons name="reload" size={20} color="#fff" />
            <Text style={[styles.botonReintentarTexto, { color: '#fff' }]}>
              {resultado.aprobado ? 'Intentar de nuevo' : 'Reintentar evaluación'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  const pregunta = preguntas[preguntaActual];
  const respuestaActual = respuestas.get(pregunta?.id_pregunta);
  const progreso = ((preguntaActual + 1) / preguntas.length) * 100;

  
  if (!pregunta || !pregunta.pregunta) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.card }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          {preguntas.length === 0 ? 'Cargando preguntas...' : 'Error al cargar la pregunta'}
        </Text>
      </View>
    );
  }

  
  if (__DEV__ && preguntas.length > 0) {
    
    if (pregunta.pregunta.trim() === '') {
      return (
        <View style={[styles.loadingContainer, { backgroundColor: colors.card, padding: 16 }]}> 
          <Text style={{ color: colors.primary, fontWeight: '600', marginBottom: 8 }}>DEBUG: pregunta sin texto</Text>
          <ScrollView style={{ maxHeight: 240, width: '100%' }}>
            <Text style={{ color: colors.textSecondary, fontFamily: 'monospace' }}>{JSON.stringify(pregunta, null, 2)}</Text>
          </ScrollView>
          <Text style={{ color: colors.textSecondary, marginTop: 8 }}>Revisa las keys: `pregunta`, `tipo_pregunta`, `opciones` y `id_contenido`.</Text>
        </View>
      );
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      {}
      <View style={styles.progresoContainer}>
        <View style={[styles.progresoBar, { backgroundColor: colors.border }]}>
          <View 
            style={[
              styles.progresoFill, 
              { backgroundColor: colors.primary, width: `${progreso}%` }
            ]} 
          />
        </View>
        <Text style={[styles.progresoTexto, { color: colors.textSecondary }]}>
          Pregunta {preguntaActual + 1} de {preguntas.length}
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {}
        <View style={styles.preguntaContainer}>
          <Text style={[styles.preguntaTitulo, { color: colors.text }]}>
            {pregunta.pregunta}
          </Text>
          
          {pregunta.puntos > 1 && (
            <View style={[styles.puntosTag, { backgroundColor: colors.primary + '20' }]}>
              <Text style={[styles.puntosTagText, { color: colors.primary }]}>
                {pregunta.puntos} puntos
              </Text>
            </View>
          )}
        </View>

        {}
        {(pregunta.tipo_pregunta === 'multiple' || pregunta.tipo_pregunta === 'verdadero_falso') && (
          <View style={styles.opcionesContainer}>
            {pregunta.opciones?.map((opcion) => {
              const seleccionada = respuestaActual === opcion.id_opcion;
              
              return (
                <TouchableOpacity
                  key={opcion.id_opcion}
                  style={[
                    styles.opcionCard,
                    { 
                      backgroundColor: colors.background,
                      borderColor: seleccionada ? colors.primary : colors.border,
                      borderWidth: seleccionada ? 2 : 1
                    }
                  ]}
                  onPress={() => handleSeleccionarRespuesta(pregunta.id_pregunta, opcion.id_opcion)}
                >
                  <View style={[
                    styles.radioButton,
                    {
                      borderColor: seleccionada ? colors.primary : colors.border,
                      backgroundColor: seleccionada ? colors.primary : 'transparent'
                    }
                  ]}>
                    {seleccionada && (
                      <View style={[styles.radioButtonInner, { backgroundColor: '#fff' }]} />
                    )}
                  </View>
                  
                  <Text style={[styles.opcionTexto, { color: colors.text }]}>
                    {opcion.texto_opcion}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {}
        {pregunta.tipo_pregunta === 'texto' && (
          <TextInput
            style={[
              styles.textInput,
              { 
                backgroundColor: colors.background,
                borderColor: colors.border,
                color: colors.text
              }
            ]}
            placeholder="Escribe tu respuesta aquí..."
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={4}
            value={(respuestaActual as string) || ''}
            onChangeText={(text) => handleSeleccionarRespuesta(pregunta.id_pregunta, text)}
          />
        )}
      </ScrollView>

      {}
      <View style={[styles.botonesContainer, { borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[
            styles.botonNav,
            { backgroundColor: colors.background, borderColor: colors.border },
            preguntaActual === 0 && styles.botonNavDisabled
          ]}
          onPress={handleAnterior}
          disabled={preguntaActual === 0}
        >
          <Ionicons name="chevron-back" size={24} color={preguntaActual === 0 ? colors.border : colors.primary} />
          <Text style={[styles.botonNavTexto, { color: preguntaActual === 0 ? colors.border : colors.primary }]}>
            Anterior
          </Text>
        </TouchableOpacity>

        {preguntaActual < preguntas.length - 1 ? (
          <TouchableOpacity
            style={[styles.botonNav, { backgroundColor: colors.primary }]}
            onPress={handleSiguiente}
          >
            <Text style={[styles.botonNavTexto, { color: '#fff' }]}>
              Siguiente
            </Text>
            <Ionicons name="chevron-forward" size={24} color="#fff" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.botonEnviar, { backgroundColor: colors.primary }]}
            onPress={handleEnviarQuiz}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <MaterialIcons name="send" size={20} color="#fff" />
                <Text style={[styles.botonEnviarTexto, { color: '#fff' }]}>
                  Enviar Quiz
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    minHeight: 400,
    ...platformShadow({ elevation: 2, shadowOpacity: 0.1 }),
  },
  loadingContainer: {
    padding: 48,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    borderRadius: 12,
  },
  loadingText: {
    fontSize: 16,
  },
  progresoContainer: {
    padding: 16,
    gap: 8,
  },
  progresoBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progresoFill: {
    height: '100%',
    borderRadius: 4,
  },
  progresoTexto: {
    fontSize: 14,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  preguntaContainer: {
    marginBottom: 24,
  },
  preguntaTitulo: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 26,
    marginBottom: 12,
  },
  puntosTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  puntosTagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  opcionesContainer: {
    gap: 12,
  },
  opcionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  opcionTexto: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    textAlignVertical: 'top',
    minHeight: 120,
  },
  botonesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
  },
  botonNav: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
  },
  botonNavDisabled: {
    opacity: 0.5,
  },
  botonNavTexto: {
    fontSize: 16,
    fontWeight: '600',
  },
  botonEnviar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    flex: 1,
  },
  botonEnviarTexto: {
    fontSize: 16,
    fontWeight: '700',
  },
  resultadoContainer: {
    padding: 32,
    alignItems: 'center',
    gap: 20,
    borderRadius: 12,
  },
  resultadoIcono: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultadoTitulo: {
    fontSize: 28,
    fontWeight: '700',
  },
  resultadoSubtitulo: {
    fontSize: 16,
    textAlign: 'center',
  },
  resultadoStats: {
    flexDirection: 'row',
    width: '100%',
    borderRadius: 12,
    padding: 16,
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statValor: {
    fontSize: 24,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
  },
  resultadoPuntos: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  puntosTexto: {
    fontSize: 16,
    fontWeight: '600',
  },
  botonReintentar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    width: '100%',
    gap: 8,
    marginTop: 8,
  },
  botonReintentarTexto: {
    fontSize: 16,
    fontWeight: '700',
  },
});
