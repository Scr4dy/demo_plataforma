import React, { useEffect, useState } from 'react';
import { useWindowDimensions, Pressable, TouchableOpacity, View, Text, StyleSheet, ScrollView, Alert, Platform, Modal, TextInput, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import IconActionButton from '../../components/common/IconActionButton';
import ThemedButton from '../../components/common/ThemedButton';
import adminCourseService from '../../services/adminCourseService';
import { useAuth } from '../../context/AuthContext';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import CourseFormModal from '../../components/admin/CourseFormModal';
import AdminCertificateUploadModal from '../../components/admin/AdminCertificateUploadModal';
import InlineHeader from '../../components/common/InlineHeader';
import { useTheme } from '../../context/ThemeContext';
import { useHeader } from '../../context/HeaderContext';
import { getCourseDurationText } from '../../utils/courseHelpers';

const AdminCoursesScreen = () => {
  const auth = useAuth();
  const navigation = useNavigation<any>();
  const { theme, colors } = useTheme();
  const isAdmin = auth?.isAdmin ?? !!(auth?.state?.user?.role?.toLowerCase?.().includes('admin'));
  const authLoading = auth?.loading ?? false;
  const { width } = useWindowDimensions();

  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<string | undefined>(undefined);
  
  const [certModalVisible, setCertModalVisible] = useState(false);
  const [certModalCourse, setCertModalCourse] = useState<string | undefined>(undefined);
  
  const [showCertPicker, setShowCertPicker] = useState(false);

  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const { header, setHeader } = useHeader();
  const isFocused = useIsFocused();

  useEffect(() => {
    if (authLoading) return; 
    if (!isAdmin) return; 
    try {
      fetchCourses();
    } catch (err) {
      
    }
  }, [isAdmin, authLoading]);

  
  const headerReapplyRef = React.useRef<any>(null);

  React.useEffect(() => {
    if (Platform.OS === 'web') return;

    
    const applyHeader = () => {
      setHeader({
        title: 'Gestión de Cursos',
        subtitle: 'Gestión y edición de cursos del sistema',
        showBack: true,
        manual: true,
        owner: 'AdminCourses'
      });
    };

    if (isFocused) {
      
      applyHeader();
      if (headerReapplyRef.current) clearTimeout(headerReapplyRef.current);
      headerReapplyRef.current = setTimeout(() => {
        applyHeader();
        headerReapplyRef.current = null;
      }, 120);
    } else {
      
      if (header && (header.owner === 'AdminCourses' || (header.manual && header.title === 'Gestión de Cursos'))) {
        setHeader(null);
      }
      if (headerReapplyRef.current) { clearTimeout(headerReapplyRef.current); headerReapplyRef.current = null; }
    }

    
    return () => {
      if (header && (header.owner === 'AdminCourses' || (header.manual && header.title === 'Gestión de Cursos'))) {
        setHeader(null);
      }
      if (headerReapplyRef.current) { clearTimeout(headerReapplyRef.current); headerReapplyRef.current = null; }
    };
  }, [setHeader, navigation, isFocused]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const list = await adminCourseService.listAll();
      setCourses(list);
    } catch (err: any) {
      
      Alert.alert('Error', err.message || 'No se pudieron cargar los cursos');
    } finally { setLoading(false); }
  };

  const onCreate = () => {
    setSelectedCourse(undefined);
    setModalVisible(true);
  };

  const onEdit = (id: string) => {
    setSelectedCourse(id);
    setModalVisible(true);
  };

  const onDelete = async (id: string) => {
    if (Platform.OS === 'web') {
      if (window.confirm('¿Estás seguro de que deseas eliminar este curso?')) {
        try {
          await adminCourseService.delete(id);
          fetchCourses();
          alert('Curso eliminado exitosamente');
        } catch (err: any) {
          alert('Error: ' + (err.message || 'No se pudo eliminar'));
        }
      }
    } else {
      Alert.alert('Confirmar', '¿Eliminar curso?', [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar', style: 'destructive', onPress: async () => {
            try { await adminCourseService.delete(id); fetchCourses(); Alert.alert('Éxito', 'Curso eliminado'); } catch (err: any) { Alert.alert('Error', err.message || 'No se pudo eliminar'); }
          }
        }
      ]);
    }
  };

  const openCourse = (course: any) => {
    if (Platform.OS === 'web') {
      try {
        const { goToWebRoute } = require('../../utils/webNav');
        goToWebRoute('CourseDetail', { courseId: String(course.id || course.id_curso) });
      } catch (e) {
        navigation.navigate('CourseDetail', { courseId: course.id || course.id_curso });
      }
    } else {
      navigation.navigate('CourseDetail', { courseId: course.id || course.id_curso });
    }
  };

  
  const filteredCourses = courses.filter(c => {
    if (statusFilter === 'active' && !c.activo) return false;
    if (statusFilter === 'inactive' && c.activo) return false;
    if (search && !(String(c.titulo || '').toLowerCase().includes(search.toLowerCase()) || String(c.descripcion || '').toLowerCase().includes(search.toLowerCase()))) return false;
    return true;
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>

      {}
      <View style={{
        backgroundColor: theme.colors.background,
        paddingTop: 10,
        paddingBottom: 20,
        paddingHorizontal: 16,
        zIndex: 10
      }}>
        {}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 10 }}>
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
            height: 50,
          }}>
            <Ionicons name="search" size={20} color="#999" style={{ marginRight: 8 }} />
            <TextInput
              placeholder="Buscar..."
              placeholderTextColor="#999"
              value={search}
              onChangeText={setSearch}
              style={{ flex: 1, fontSize: 16, color: theme.colors.text }}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Ionicons name="close-circle" size={18} color="#ccc" />
              </TouchableOpacity>
            )}
          </View>

          {}
          <TouchableOpacity
            onPress={() => setShowCertPicker(true)}
            style={{
              backgroundColor: theme.colors.card,
              height: 40,
              paddingHorizontal: 16,
              borderRadius: 20,
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: theme.colors.border,
              marginRight: 8
            }}
          >
            <Ionicons name="cloud-upload-outline" size={20} color={theme.colors.text} />
            {width > 600 && <Text style={{ color: theme.colors.text, fontWeight: '600', marginLeft: 6, fontSize: 13 }}>Subir Certificado</Text>}
          </TouchableOpacity>

          {}
          <TouchableOpacity
            onPress={onCreate}
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

      <View style={styles.content}>

        {}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
          marginTop: 16
        }}>
          <Text style={{ fontSize: 15, color: theme.colors.textSecondary }}>
            Mostrando {filteredCourses.length} cursos
          </Text>
        </View>

        {loading && <Text style={{ textAlign: 'center', marginVertical: 20, color: theme.colors.textSecondary }}>Cargando cursos...</Text>}

        {!loading && (
          <FlatList
            data={filteredCourses}
            keyExtractor={(item) => String(item.id || item.id_curso)}
            contentContainerStyle={{ paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
                {}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    {}
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

                    {}
                    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: theme.dark ? '#333' : '#f3f4f6', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                      <Ionicons name="pricetag-outline" size={10} color={theme.colors.textSecondary} style={{ marginRight: 4 }} />
                      <Text style={{ color: theme.colors.textSecondary, fontSize: 11, fontWeight: '600' }}>
                        {item.categoria || item.categorias?.nombre || 'Sin categoría'}
                      </Text>
                    </View>
                  </View>
                </View>

                {}
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.colors.text, marginBottom: 8 }}>
                  {item.titulo}
                </Text>

                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                  <Ionicons name="person-circle-outline" size={18} color={colors.primary} style={{ marginRight: 6 }} />
                  <Text style={{ color: theme.colors.textSecondary, fontSize: 14 }}>
                    {item.instructor_nombre || item.instructor || 'Instructor desconocido'}
                  </Text>
                </View>

                {}
                <View style={{ height: 1, backgroundColor: theme.dark ? '#333' : '#f0f0f0', marginBottom: 12 }} />

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flexDirection: 'row', gap: 16 }}>
                    <View style={{ alignItems: 'flex-start' }}>
                      <Text style={{ fontSize: 11, color: theme.colors.textSecondary, marginBottom: 2 }}>DURACIÓN</Text>
                      <Text style={{ fontSize: 13, fontWeight: '600', color: theme.colors.text }}>{getCourseDurationText(item) || '0m'}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-start' }}>
                      <Text style={{ fontSize: 11, color: theme.colors.textSecondary, marginBottom: 2 }}>CREADO</Text>
                      <Text style={{ fontSize: 13, fontWeight: '600', color: theme.colors.text }}>{new Date(item.fecha_creacion).toLocaleDateString('es-ES', { month: 'short', day: 'numeric', year: 'numeric' })}</Text>
                    </View>
                  </View>

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
                            goToWebRoute('Modules', { courseId: String(item.id_curso || item.id) });
                          } catch (e) {
                            navigation.navigate('Modules', { courseId: item.id_curso || item.id });
                          }
                        } else {
                          navigation.navigate('Modules', { courseId: item.id_curso || item.id });
                        }
                      }}
                      accessibilityLabel="Ver módulos"
                    >
                      <Ionicons name="layers-outline" size={20} color={theme.colors.text} />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={{
                        width: 40, height: 40, borderRadius: 20,
                        backgroundColor: 'rgba(34, 197, 94, 0.1)',
                        alignItems: 'center', justifyContent: 'center'
                      }}
                      onPress={() => onEdit(item.id || item.id_curso)}
                      accessibilityLabel="Editar curso"
                    >
                      <Ionicons name="pencil" size={20} color="#16a34a" />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={{
                        width: 40, height: 40, borderRadius: 20,
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        alignItems: 'center', justifyContent: 'center'
                      }}
                      onPress={() => onDelete(item.id || item.id_curso)}
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

        <CourseFormModal visible={modalVisible} courseId={selectedCourse} onClose={() => { setModalVisible(false); setSelectedCourse(undefined); }} onSuccess={() => fetchCourses()} />

        {}
        <Modal visible={showCertPicker} animationType="slide" transparent>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 20 }}>
            <View style={{ backgroundColor: theme.colors.card, borderRadius: 12, maxHeight: '80%', padding: 12 }}>
              <Text style={{ fontWeight: '700', marginBottom: 8, color: theme.colors.text }}>Seleccionar curso para subir certificado</Text>
              <ScrollView style={{ marginBottom: 12 }}>
                {courses.map((c: any) => (
                  <TouchableOpacity key={String(c.id || c.id_curso)} style={{ padding: 12, borderBottomWidth: 1, borderBottomColor: theme.colors.border }} onPress={() => { setCertModalCourse((c.id || c.id_curso).toString()); setCertModalVisible(true); setShowCertPicker(false); }}>
                    <Text style={{ color: theme.colors.text, fontWeight: '600' }}>{c.titulo || c.nombre || `Curso ${c.id || c.id_curso}`}</Text>
                    {c.descripcion ? <Text style={{ color: theme.colors.textSecondary, marginTop: 4 }}>{String(c.descripcion).slice(0, 120)}</Text> : null}
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                <TouchableOpacity onPress={() => setShowCertPicker(false)} style={{ padding: 10 }}>
                  <Text style={{ color: theme.colors.primary }}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {}
        {certModalCourse && (
          <React.Suspense fallback={null}>
            <AdminCertificateUploadModal visible={certModalVisible} courseId={Number(certModalCourse)} onClose={() => { setCertModalVisible(false); setCertModalCourse(undefined); }} onSuccess={() => { setCertModalVisible(false); setCertModalCourse(undefined); fetchCourses(); }} />
          </React.Suspense>
        )}

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 16, width: '100%' },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2
  }
});

export default AdminCoursesScreen;