import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, ActivityIndicator } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { evaluacionesService } from '../../services/evaluacionesService';
import { useAuth } from '../../context/AuthContext';
import { categoryService } from '../../services/categoryService';

import { useHeader } from '../../context/HeaderContext';
import { useNavigation } from '@react-navigation/native';
import { Platform } from 'react-native';

const InstructorEvaluationsScreen: React.FC = () => {
  const { theme, colors } = useTheme();
  const { state } = useAuth();
  const navigation = useNavigation();
  const { setHeader } = useHeader();

  
  useEffect(() => {
    if (Platform.OS !== 'web') {
      setHeader({
        title: 'Evaluaciones',
        subtitle: 'Instructor',
        showBack: true,
        alignLeftOnMobile: true
      });
    }
    return () => {
      if (Platform.OS !== 'web') {
        setHeader(null);
      }
    };
  }, [setHeader]);
  const [cursoId, setCursoId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [evaluaciones, setEvaluaciones] = useState<any[]>([]);
  const [filterEmpleado, setFilterEmpleado] = useState<string>('');

  const [courses, setCourses] = React.useState<any[]>([]);
  const [avgInstructorScore, setAvgInstructorScore] = React.useState<number | null>(null);

  useEffect(() => {
    
    const loadCourses = async () => {
      try {
        const uid = state.user?.id || '';
        const cursos = await categoryService.getCursosDisponibles(String(uid));
        setCourses(Array.isArray(cursos) ? cursos : []);
        
        if (!cursoId && Array.isArray(cursos) && cursos.length > 0) {
          const firstId = cursos[0].id || cursos[0].id_curso || cursos[0].id;
          if (firstId) handleCourseSelect(Number(firstId));
        }
      } catch (err) {
        
      }
    };
    loadCourses();
  }, []);

  useEffect(() => {
    if (cursoId) {
      cargarEvaluaciones(cursoId);
      cargarPromedio(cursoId);
    }
  }, [cursoId]);

  const cargarEvaluaciones = async (cId?: number) => {
    if (!cId) return;
    setLoading(true);
    try {
      const data = await evaluacionesService.getEvaluacionesInstructorByCurso(cId);
      setEvaluaciones(Array.isArray(data) ? data : []);
    } catch (err) {
      
    } finally {
      setLoading(false);
    }
  };

  const cargarPromedio = async (cId: number) => {
    try {
      const avg = await evaluacionesService.getPromedioInstructor(cId);
      setAvgInstructorScore(avg ?? null);
    } catch (err) {
      
      setAvgInstructorScore(null);
    }
  };

  const handleCourseSelect = (id: number) => {
    setCursoId(id);
    cargarEvaluaciones(id);
  };

  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        {Platform.OS === 'web' && <Text style={[styles.title, { color: theme.colors.text }]}>Evaluaciones de Instructor</Text>}
      </View>

      {}
      <View style={{ paddingHorizontal: 12 }}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={courses}
          keyExtractor={(c) => String(c.id || c.id_curso || c.id_c)}
          renderItem={({ item }) => {
            const cid = Number(item.id || item.id_curso || item.id);
            const selected = cid === cursoId;
            return (
              <TouchableOpacity onPress={() => handleCourseSelect(cid)} style={[styles.courseChip, { backgroundColor: selected ? colors.primary : theme.colors.card }]}>
                <Text style={{ color: selected ? theme.colors.card : theme.colors.text }}>{item.titulo || item.title || `Curso ${cid}`}</Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      <View style={styles.controls}>
        <TextInput
          placeholder="Filtrar por ID empleado"
          placeholderTextColor={theme.colors.border}
          style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.text }]}
          value={filterEmpleado}
          onChangeText={setFilterEmpleado}
        />
        <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={() => cursoId && cargarEvaluaciones(cursoId)}>
          <Text style={[styles.buttonText, { color: theme.colors.card }]}>Cargar</Text>
        </TouchableOpacity>
      </View>

      {cursoId && (
        <View style={[styles.summary, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <Text style={{ color: theme.colors.text, fontWeight: '700' }}>Resumen curso {cursoId}</Text>
          <Text style={{ color: theme.colors.text }}>{avgInstructorScore ? `Promedio instructor: ${avgInstructorScore}` : 'Sin evaluaciones'}</Text>
        </View>
      )}

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 24 }} />
      ) : (
        <FlatList
          data={evaluaciones.filter(ev => filterEmpleado ? String(ev.id_empleado) === filterEmpleado : true)}
          keyExtractor={(i) => String(i.id_evaluacion)}
          ListEmptyComponent={() => (
            <View style={styles.empty}><Text style={{ color: theme.colors.border }}>Sin evaluaciones</Text></View>
          )}
          renderItem={({ item }) => (
            <View style={[styles.item, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.itemTitle, { color: theme.colors.text }]}>Empleado #{item.id_empleado}</Text>
                <Text style={{ color: theme.colors.text }}>Puntuación: {item.puntuacion}</Text>
                {item.comentarios && <Text style={{ color: theme.colors.text }}>{item.comentarios}</Text>}
                <Text style={{ color: theme.colors.border, marginTop: 6 }}>{item.fecha_evaluacion ? new Date(item.fecha_evaluacion).toLocaleString() : ''}</Text>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 16 },
  title: { fontSize: 20, fontWeight: '700' },
  controls: { flexDirection: 'row', gap: 8, paddingHorizontal: 12, alignItems: 'center' },
  input: { flex: 1, borderWidth: 1, borderRadius: 8, padding: 8, marginVertical: 12 },
  button: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8 },
  buttonText: { fontWeight: '600' },
  item: { padding: 12, marginHorizontal: 12, marginVertical: 6, borderRadius: 8, borderWidth: 1 },
  itemTitle: { fontWeight: '600' },
  empty: { padding: 20, alignItems: 'center' },
  courseChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, marginHorizontal: 8, marginVertical: 12 },
  summary: { padding: 12, margin: 12, borderWidth: 1, borderRadius: 8 }
});

export default InstructorEvaluationsScreen;
