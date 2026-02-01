import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Platform, Alert, useWindowDimensions, TextInput, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { adminCourseService } from '../../services/adminCourseService';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { useHeader } from '../../context/HeaderContext';
import { platformShadow } from '../../utils/styleHelpers';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CourseFormModal from '../../components/admin/CourseFormModal';
import { getCourseDurationText } from '../../utils/courseHelpers';

export default function InstructorDashboard() {
  const { theme, colors, getFontSize } = useTheme();
  const { state } = useAuth();
  const navigation = useNavigation<any>();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCourse, setEditingCourse] = useState<string | undefined>(undefined);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const userId = state.user?.id_usuario;

  const getGreetingText = () => {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Buenos días' : (hour < 18 ? 'Buenas tardes' : 'Buenas noches');
    const firstName = state.user?.nombre ? String(state.user.nombre).split(' ')[0] : (state.user?.email || '');
    return `${greeting}${firstName ? ', ' + firstName : ''}!`;
  };

  useEffect(() => {
    loadMyCourses();
  }, [userId]);

  
  const { setHeader } = useHeader(); 
  const isFocused = useIsFocused();

  React.useEffect(() => {
    if (Platform.OS === 'web') return;

    if (isFocused) {
      setHeader({
        title: 'Panel de Instructor',
        subtitle: 'Gestiona tus cursos y materiales',
        showBack: false,
        
        manual: true,
        owner: 'InstructorDashboard',
      });
    }

    return () => {
      try { setHeader(null); } catch (_) { }
    };
  }, [setHeader, isFocused, navigation]);

  const loadMyCourses = async () => {
    setLoading(true);
    try {
      const list = await adminCourseService.listAll();
      if (!userId) {
        setCourses([]);
        return;
      }
      
      const mine = (list || []).filter((c: any) => Number(c.id_instructor) === Number(userId));
      
      setCourses((mine || []).map((c: any) => ({ ...c, _showMaterials: false })));
    } catch (err) {
      
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const openCourse = (course: any) => {
    if (Platform.OS === 'web') {
      const { goToWebRoute } = require('../../utils/webNav');
      goToWebRoute('CourseDetail', { courseId: String(course.id || course.id_curso) });
    } else {
      navigation.navigate('CourseDetail', { courseId: String(course.id || course.id_curso) });
    }
  };

  const editCourse = (course: any) => {
    setEditingCourse(String(course.id || course.id_curso));
    setModalVisible(true);
  };

  const deleteCourse = (course: any) => {
    Alert.alert(
      'Eliminar Curso',
      `¿Estás seguro de que deseas eliminar "${course.titulo}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await adminCourseService.delete(String(course.id || course.id_curso));
              await loadMyCourses();
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar el curso');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const insets = useSafeAreaInsets();

  const { width } = useWindowDimensions();
  const isWide = width > 700;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {}

      {}

      {}
      <View style={{ padding: 16, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        {}
        <View style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: theme.dark ? '#333' : '#fff',
          borderWidth: 1,
          borderColor: theme.dark ? '#444' : '#e0e0e0',
          borderRadius: 30,
          paddingHorizontal: 16,
          height: 40,
        }}>
          <Ionicons name="search" size={20} color="#999" style={{ marginRight: 8 }} />
          <TextInput
            placeholder="Buscar..."
            placeholderTextColor="#999"
            value={search}
            onChangeText={setSearch}
            style={{ flex: 1, fontSize: 14, color: theme.colors.text }}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color="#ccc" />
            </TouchableOpacity>
          )}
        </View>

        {}
        <TouchableOpacity
          onPress={() => { setEditingCourse(undefined); setModalVisible(true); }}
          style={{
            backgroundColor: colors.primary,
            height: 40,
            paddingHorizontal: 16,
            borderRadius: 20,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={{ color: '#fff', fontWeight: 'bold', marginLeft: 6, fontSize: 13 }}>Crear Curso</Text>
        </TouchableOpacity>
      </View>

      {}
      <View style={{ paddingHorizontal: 16, paddingBottom: 12 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
          {[
            { id: 'all', label: 'Todos' },
            { id: 'active', label: 'Activos' },
            { id: 'inactive', label: 'Inactivos' }
          ].map((f) => (
            <TouchableOpacity
              key={f.id}
              onPress={() => setStatusFilter(f.id as any)}
              style={{
                paddingHorizontal: 20,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor: statusFilter === f.id ? colors.primary : (theme.dark ? '#333' : '#f3f4f6'),
                borderWidth: 1,
                borderColor: statusFilter === f.id ? colors.primary : (theme.dark ? '#444' : '#e0e0e0')
              }}
            >
              <Text style={{
                fontWeight: statusFilter === f.id ? '700' : '500',
                color: statusFilter === f.id ? '#fff' : theme.colors.text,
                fontSize: 14
              }}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>
      ) : (
        <View style={{ flex: 1, padding: 16 }}>
          {courses.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyTitle, { color: theme.colors.text, fontSize: getFontSize(18) }]}>No tienes cursos asignados</Text>
              <Text style={[styles.emptyHint, { color: theme.colors.textSecondary, fontSize: getFontSize(14) }]}>Contacta al administrador para asignarte cursos o crea uno nuevo si tienes permisos.</Text>
            </View>
          ) : (
            <FlatList
              data={courses.filter(c => {
                if (statusFilter === 'active' && !c.activo) return false;
                if (statusFilter === 'inactive' && c.activo) return false;
                if (search && !(c.titulo && c.titulo.toLowerCase().includes(search.toLowerCase()))) return false;
                return true;
              })}
              keyExtractor={(i) => String(i.id || i.id_curso || Math.random())}
              renderItem={({ item }) => (
                <View style={[
                  styles.card,
                  {
                    backgroundColor: theme.colors.card,
                    borderColor: 'transparent',
                    width: '100%',
                    maxWidth: 800,
                    alignSelf: 'center',
                    ...Platform.select({
                      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
                      android: { elevation: 3 },
                      web: { boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }
                    })
                  }
                ]}>
                  {}
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      {item.activo ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(34, 197, 94, 0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#22c55e', marginRight: 6 }} />
                          <Text style={{ color: '#16a34a', fontSize: 11, fontWeight: '700' }}>ACTIVO</Text>
                        </View>
                      ) : (
                        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(239, 68, 68, 0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#ef4444', marginRight: 6 }} />
                          <Text style={{ color: '#dc2626', fontSize: 11, fontWeight: '700' }}>INACTIVO</Text>
                        </View>
                      )}
                      <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: theme.dark ? '#333' : '#f3f4f6', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                        <Ionicons name="pricetag-outline" size={10} color={theme.colors.textSecondary} style={{ marginRight: 4 }} />
                        <Text style={{ color: theme.colors.textSecondary, fontSize: 11, fontWeight: '600' }}>
                          {item.categoria || 'Sin categoría'}
                        </Text>
                      </View>
                    </View>

                  </View>

                  {}
                  <View style={{ marginBottom: 16 }}>
                    <Text style={[styles.title, { color: theme.colors.text, fontSize: getFontSize(18) }]} numberOfLines={2}>{item.titulo}</Text>
                  </View>

                  {}
                  <View style={{ height: 1, backgroundColor: theme.dark ? '#333' : '#f0f0f0', marginBottom: 12 }} />

                  {}
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>

                    {}
                    <View style={{ flexDirection: 'row', gap: 16, flex: 1, paddingRight: 8 }}>
                      <View style={{ alignItems: 'flex-start' }}>
                        <Text style={{ fontSize: 11, color: theme.colors.textSecondary, marginBottom: 2 }}>DURACIÓN</Text>
                        <Text style={{ fontSize: 13, fontWeight: '600', color: theme.colors.text }}>{getCourseDurationText(item) || '0m'}</Text>
                      </View>
                      <View style={{ alignItems: 'flex-start' }}>
                        <Text style={{ fontSize: 11, color: theme.colors.textSecondary, marginBottom: 2 }}>CREADO</Text>
                        <Text style={{ fontSize: 13, fontWeight: '600', color: theme.colors.text }}>
                          {item.fecha_creacion ? new Date(item.fecha_creacion).toLocaleDateString('es-ES', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}
                        </Text>
                      </View>
                    </View>

                    {}
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                      <TouchableOpacity
                        style={{
                          width: 40, height: 40, borderRadius: 20,
                          backgroundColor: 'rgba(59, 130, 246, 0.1)',
                          alignItems: 'center', justifyContent: 'center'
                        }}
                        onPress={() => openCourse(item)}
                        accessibilityLabel="Ver curso"
                      >
                        <Ionicons name="eye" size={20} color="#3B82F6" />
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={{
                          width: 40, height: 40, borderRadius: 20,
                          backgroundColor: theme.dark ? '#333' : '#f3f4f6',
                          alignItems: 'center', justifyContent: 'center'
                        }}
                        onPress={() => {
                          if (Platform.OS === 'web') {
                            try {
                              const { goToWebRoute } = require('../../utils/webNav');
                              goToWebRoute('Modules', { courseId: item.id || item.id_curso });
                            } catch (e) {  }
                          } else {
                            navigation.navigate('Modules', { courseId: item.id || item.id_curso });
                          }
                        }}
                        accessibilityLabel="Gestionar contenido"
                      >
                        <Ionicons name="layers" size={20} color={theme.colors.text} />
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={{
                          width: 40, height: 40, borderRadius: 20,
                          backgroundColor: 'rgba(245, 158, 11, 0.1)',
                          alignItems: 'center', justifyContent: 'center'
                        }}
                        onPress={() => editCourse(item)}
                        accessibilityLabel="Editar curso"
                      >
                        <Ionicons name="pencil" size={20} color="#F59E0B" />
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={{
                          width: 40, height: 40, borderRadius: 20,
                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                          alignItems: 'center', justifyContent: 'center'
                        }}
                        onPress={() => deleteCourse(item)}
                        accessibilityLabel="Eliminar curso"
                      >
                        <Ionicons name="trash" size={20} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}
            />
          )}
        </View>
      )}

      {}
      <CourseFormModal
        visible={modalVisible}
        courseId={editingCourse}
        onClose={() => { setModalVisible(false); setEditingCourse(undefined); loadMyCourses(); }}
        onSuccess={() => {  }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { alignItems: 'center', padding: 24 },
  emptyTitle: { fontWeight: '700', marginBottom: 6 },
  emptyHint: { textAlign: 'center', maxWidth: 480 },
  card: { padding: 16, borderRadius: 16, marginBottom: 16 },
  title: { fontWeight: '700' },
  meta: { marginTop: 4 },
  actions: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8 },
  actionBtnText: { fontSize: 13, fontWeight: '600', marginLeft: 4 },
  btn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, marginLeft: 8 },
  btnText: { color: '#fff', fontWeight: '600' },
  iconBtn: { paddingVertical: 6, paddingHorizontal: 8, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  iconLabel: { color: '#fff', fontWeight: '600' },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
});
