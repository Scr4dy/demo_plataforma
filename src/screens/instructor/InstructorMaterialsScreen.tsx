import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { adminCourseService } from '../../services/adminCourseService';
import CourseMaterialsPanel from '../../components/courses/CourseMaterialsPanel';
import InlineHeader from '../../components/common/InlineHeader';
import { useAuth } from '../../context/AuthContext';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { useHeader } from '../../context/HeaderContext';

export default function InstructorMaterialsScreen(props: { initialCourseId?: number } = {}) {
  const { theme, colors, getFontSize } = useTheme();
  const route: any = ({} as any);
  try {
    
    
    const { useRoute } = require('@react-navigation/native');
    const r = useRoute && useRoute();
    if (r && r.params) route.params = r.params;
  } catch (e) {
    
  }

  const { state } = useAuth();
  const userId = state.user?.id_usuario;

  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCourseId, setExpandedCourseId] = useState<number | null>(props.initialCourseId || route.params?.courseId || null);

  useEffect(() => {
    loadMyCourses();
  }, [userId]);

  useEffect(() => {
    
    const candidate = props.initialCourseId || route.params?.courseId;
    if (candidate) setExpandedCourseId(Number(candidate));
  }, [props.initialCourseId, route.params]);

  
  const { header, setHeader } = useHeader();
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const headerReapplyRef = React.useRef<any>(null);

  useEffect(() => {
    if (Platform.OS === 'web') return;

    const applyHeader = () => {
      setHeader({
        title: 'Materiales (Instructor)',
        subtitle: 'Administra materiales de tus cursos',
        showBack: true,
        onBack: () => { try { const { safeBack } = require('../../utils/navigationHelpers'); safeBack(navigation, 'Instructor'); } catch (e) {  } },
        manual: true,
      });
    };

    if (isFocused) {
      applyHeader();
      if (headerReapplyRef.current) clearTimeout(headerReapplyRef.current);
      headerReapplyRef.current = setTimeout(() => { applyHeader(); headerReapplyRef.current = null; }, 120);
    } else {
      if (header && header.manual && header.title === 'Materiales (Instructor)') setHeader(null);
      if (headerReapplyRef.current) { clearTimeout(headerReapplyRef.current); headerReapplyRef.current = null; }
    }

    return () => {
      if (header && header.manual && header.title === 'Materiales (Instructor)') setHeader(null);
      if (headerReapplyRef.current) { clearTimeout(headerReapplyRef.current); headerReapplyRef.current = null; }
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
      setCourses(mine);
    } catch (err) {
      
      Alert.alert('Error', 'No se pudieron cargar los cursos');
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  
  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!loading && (!courses || courses.length === 0)) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}> 
        <InlineHeader title="Materiales (Instructor)" titleStyle={{ fontSize: getFontSize(15) }} suppressBack={true} containerStyle={{ backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }} />
        <View style={{ padding: 24, alignItems: 'center' }}>
          <Text style={{ fontSize: getFontSize(16), fontWeight: '700', color: theme.colors.text }}>No tienes cursos asignados</Text>
          <Text style={{ marginTop: 8, color: theme.colors.textSecondary }}>No hay cursos para gestionar materiales. Contacta al administrador si crees que esto es un error.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <InlineHeader title="Materiales (Instructor)" titleStyle={{ fontSize: getFontSize(15) }} suppressBack={true} containerStyle={{ backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }} />
      <FlatList
        data={courses}
        keyExtractor={(i) => String(i.id || i.id_curso || Math.random())}
        contentContainerStyle={{ padding: 12 }}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}> 
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, { color: theme.colors.text }]}>{item.titulo}</Text>
              <Text style={[styles.meta, { color: theme.colors.textSecondary }]}>{item.categoria || 'Sin categoría'}</Text>
              {expandedCourseId === Number(item.id || item.id_curso) && (
                <View style={{ marginTop: 8 }}>
                  <CourseMaterialsPanel courseId={Number(item.id || item.id_curso)} allowUpload={true} allowDelete={true} />
                </View>
              )}
            </View>
            <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={() => setExpandedCourseId(prev => prev === Number(item.id || item.id_curso) ? null : Number(item.id || item.id_curso))}>
              <Text style={{ color: theme.colors.card, fontWeight: '600' }}>{expandedCourseId === Number(item.id || item.id_curso) ? 'Ocultar' : 'Materiales'}</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: { padding: 12, borderWidth: 1, borderRadius: 10, marginBottom: 12, flexDirection: 'row', alignItems: 'center' },
  title: { fontWeight: '700', fontSize: 16 },
  meta: { marginTop: 4, fontSize: 13 },
  btn: { padding: 8, borderRadius: 8, marginLeft: 12 }
});
