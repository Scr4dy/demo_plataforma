import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, useWindowDimensions, Platform, TextInput, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useHeader } from '../../context/HeaderContext';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { courseService } from '../../services/courseService';
import { categoryService, Categoria } from '../../services/categoryService';
import { useUserRole } from '../../hooks/useUserRole';
import { useAuth } from '../../context/AuthContext';
import adminCourseService from '../../services/adminCourseService';
import { useRoute } from '@react-navigation/native';
import AdminCoursesScreen from '../admin/AdminCoursesScreen';

const isWeb = Platform.OS === 'web';

interface AllCoursesProps {
  adminMode?: boolean;
}

const AllCoursesScreen: React.FC<AllCoursesProps> = ({ adminMode = false }) => {
  const navigation = useNavigation<any>();
  const { theme, colors, getFontSize } = useTheme();
  const { header, setHeader } = useHeader();
  const { width } = useWindowDimensions();
  const { isAdmin, isInstructor } = useUserRole();
  const { state } = useAuth();
  const route = useRoute();
  const routeAdminMode = (route as any)?.params?.adminMode;
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminCourses, setAdminCourses] = useState<any[]>([]);
  const [categories, setCategories] = useState<Categoria[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState<'titulo' | 'fecha_creacion' | 'activo'>('titulo');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCourse, setEditingCourse] = useState<string | undefined>(undefined);
  const [showAdmin, setShowAdmin] = useState<boolean>(adminMode);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const ITEMS_PER_PAGE = 20;
  const [refreshing, setRefreshing] = useState(false);

  
  const cacheRef = React.useRef<{ data: any[] | null; timestamp: number | null }>({ data: null, timestamp: null });
  const CACHE_TTL = 5 * 60 * 1000; 
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedCourseMaterialsId, setSelectedCourseMaterialsId] = useState<string | null>(null);
  const [materialsModalVisible, setMaterialsModalVisible] = useState(false);

  
  const filteredAdmin = useMemo(() => {
    const list = (adminCourses || []).filter((c: any) => {
      if (statusFilter === 'active' && !c.activo) return false;
      if (statusFilter === 'inactive' && c.activo) return false;
      if (search && !(String(c.titulo || '').toLowerCase().includes(search.toLowerCase()) || String(c.descripcion || '').toLowerCase().includes(search.toLowerCase()))) return false;
      return true;
    });
    list.sort((a: any, b: any) => {
      if (sortBy === 'titulo') return String(a.titulo || '').localeCompare(String(b.titulo || ''));
      if (sortBy === 'fecha_creacion') return (new Date(b.fecha_creacion).getTime() || 0) - (new Date(a.fecha_creacion).getTime() || 0);
      if (sortBy === 'activo') return (a.activo === b.activo) ? 0 : (a.activo ? -1 : 1);
      return 0;
    });
    return list;
  }, [adminCourses, search, statusFilter, sortBy]);

  useEffect(() => {
    
    if (adminMode || routeAdminMode) setShowAdmin(true);
    if (!adminMode && !routeAdminMode) setShowAdmin(false);
  }, [adminMode, routeAdminMode]);

  useEffect(() => {
    
    if (showAdmin) {
      setHeader({
        title: 'Gestión de Cursos',
        subtitle: 'Gestión y edición de cursos del sistema',
        showBack: true,
        owner: 'AllCoursesAdmin',
        manual: true,
      });
    } else {
      setHeader({
        title: 'Todos los cursos',
        owner: 'AllCourses',
        containerStyle: { backgroundColor: theme.colors.background, borderBottomColor: theme.colors.primary, borderTopLeftRadius: 8, borderTopRightRadius: 8 },
        titleStyle: { fontSize: getFontSize(20), color: theme.colors.card },
        right: (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity style={[styles.adminToggle, showAdmin ? { borderColor: colors.primary, backgroundColor: colors.primaryLight } : {}]} onPress={() => setShowAdmin(s => !s)}>
              <Text style={{ color: showAdmin ? colors.primary : theme.colors.text, fontWeight: '600' }}>{showAdmin ? 'Modo Admin' : 'Ver público'}</Text>
            </TouchableOpacity>
          </View>
        ),
      });
    }

    return () => {
      try {
        if (header && (header.owner === 'AllCourses' || header.owner === 'AllCoursesAdmin')) setHeader(null);
      } catch (e) {  }
    };
  }, [setHeader, showAdmin, adminMode, routeAdminMode, theme.colors.background, theme, getFontSize, colors]);

  const isWeb = Platform.OS === 'web';
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const isDesktop = width >= 1024;
  const DESIRED_CARD_MIN_WIDTH = 360;
  const MAX_COLUMNS = 6;
  const cardGap = 24;
  const numColumns = isWeb && width >= 768 ? Math.max(1, Math.min(MAX_COLUMNS, Math.floor((width - 40) / DESIRED_CARD_MIN_WIDTH))) : 1;

  const { useSidebar } = require('../../context/SidebarContext') as any; 
  const sidebar = useSidebar ? useSidebar() : null;
  const sidebarOpen = !!(sidebar && (sidebar as any).isSidebarOpen);
  
  const adminUseCards = isMobile || (width < 920 && !sidebarOpen); 

  const loadCourses = useCallback(async (useLoadingState = true) => {
    if (useLoadingState) setLoading(true);
    try {
      
      let cats: Categoria[] = [];
      try {
        cats = await categoryService.getCategorias();
        setCategories(cats || []);
      } catch (catErr) {
        
        setCategories([]);
      }

      const data = await courseService.getAllCourses({ limit: 200 });
       ? data.length : typeof data);
      const enriched = (data || []).map((c: any) => {
        if (c.categorias) return c;
        const catById = cats.find(ct => String(ct.id) === String(c.categoria_id || c.categoriaId || c.categoria_id_hash));
        if (catById) return { ...c, categorias: catById };
        const catByName = cats.find(ct => String(ct.nombre).toLowerCase() === String(c.categoria || c.categorias?.nombre || '').toLowerCase());
        if (catByName) return { ...c, categorias: catByName };
        return c;
      });

      
      try {
        const { supabase } = require('../../config/supabase');
        const instructorIds = Array.from(new Set((enriched || [])
          .map((c: any) => c.id_instructor ?? c.instructor_id ?? c.instructorId ?? c.idInstructor)
          .filter(Boolean)
          .map(String)));
        let instructorMap: Record<string, string> = {};
        if (instructorIds.length > 0) {
          try {
            const { data: usersByIdUsuario } = await supabase.from('usuarios').select('id_usuario,nombre').in('id_usuario', instructorIds as any);
            usersByIdUsuario?.forEach((u: any) => { if (u?.id_usuario) instructorMap[String(u.id_usuario)] = u.nombre || ''; });
            const missing = instructorIds.filter(id => !instructorMap[id]);
            if (missing.length > 0) {
              
              const { data: usersById } = await supabase.from('usuarios').select('id_usuario,nombre').in('id_usuario', missing as any);
              usersById?.forEach((u: any) => { if (u?.id_usuario) instructorMap[String(u.id_usuario)] = u.nombre || ''; });
            }
          } catch (e) {
            :', e);
          }
        }

        const withInstructors = (enriched || []).map((c: any) => ({
          ...c,
          instructor_nombre: c.instructor || c.instructor_nombre || (c.id_instructor ? instructorMap[String(c.id_instructor)] : '') || '',
        }));

        ', { instructorIds: instructorIds.length, sample: withInstructors.slice(0, 5).map((x: any) => ({ id: x.id || x.id_curso, instructor: x.instructor, instructor_nombre: x.instructor_nombre })) });
        setCourses(withInstructors || []);
      } catch (e) {
        
        setCourses(enriched || []);
      }
    } catch (err) {
      
    } finally {
      if (useLoadingState) setLoading(false);
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadCourses(false);
    setRefreshing(false);
  }, [loadCourses]);

  const loadAdminCourses = useCallback(async () => {
    setLoading(true);
    try {
      setLoadError(null);

      
      const [cats, list] = await Promise.all([
        categoryService.getCategorias().catch(err => {
          
          return [];
        }),
        adminCourseService.listAll()
      ]);

      setCategories(cats || []);
       ? list.length : typeof list);
      

      
      const enriched = (list || []).map((c: any) => {
        const categoriaNombre = c.categoria || 'Sin categoría';
        
        let categoriaObj = cats.find(ct => String(ct.nombre).toLowerCase() === String(categoriaNombre).toLowerCase());
        if (!categoriaObj && c.categoria_id) {
          categoriaObj = cats.find(ct => String(ct.id) === String(c.categoria_id));
        }

        return {
          ...c,
          categoria: categoriaNombre,
          categoria_id: c.categoria_id || null,
          categorias: categoriaObj || (categoriaNombre !== 'Sin categoría' ? { nombre: categoriaNombre } : null)
        };
      });

      
      try {
        const { supabase } = require('../../config/supabase');
        const instructorIds = Array.from(new Set((enriched || [])
          .map((c: any) => c.id_instructor ?? c.instructor_id ?? c.instructorId ?? c.idInstructor)
          .filter(Boolean)
          .map(String)));
        let instructorMap: Record<string, string> = {};
        if (instructorIds.length > 0) {
          
          const { data: users } = await supabase
            .from('usuarios')
            .select('id_usuario,nombre')
            .in('id_usuario', instructorIds);

          users?.forEach((u: any) => {
            if (u?.id_usuario) instructorMap[String(u.id_usuario)] = u.nombre || '';
          });
        }

        const withInstructors = (enriched || []).map((c: any) => ({
          ...c,
          instructor_nombre: c.instructor || c.instructor_nombre || (c.id_instructor ? instructorMap[String(c.id_instructor)] : '') || '',
        }));

        ', { instructorIds: instructorIds.length, sample: withInstructors.slice(0, 5).map((x: any) => ({ id: x.id || x.id_curso, instructor: x.instructor, instructor_nombre: x.instructor_nombre })) });
        setAdminCourses(withInstructors || []);
      } catch (e) {
        
        setAdminCourses(enriched || []);
      }
    } catch (err: any) {
      
      const msg = err?.message || 'No se pudieron cargar los cursos (admin)';
      
      
      setLoadError(msg);
      
      try {
        
        await loadCourses();
      } catch (fallbackErr) {
        
      }
    } finally {
      setLoading(false);
    }
  }, [loadCourses]);

  
  const loadFunctionsRef = React.useRef({ loadCourses, loadAdminCourses });

  useEffect(() => {
    loadFunctionsRef.current = { loadCourses, loadAdminCourses };
  }, [loadCourses, loadAdminCourses]);

  useEffect(() => {
    
    if ((adminMode || routeAdminMode) && isAdmin) {
      loadFunctionsRef.current.loadAdminCourses();
    } else {
      loadFunctionsRef.current.loadCourses();
    }
    
  }, [adminMode, routeAdminMode, isAdmin]); 

  useEffect(() => {
    if (materialsModalVisible) {
      
    } else {
      
    }
  }, [materialsModalVisible, selectedCourseMaterialsId]);

  const renderItem = ({ item }: any) => {
    const containerStyle: any = isMobile ? { width: '100%', paddingHorizontal: 0 } : { width: Math.min(DESIRED_CARD_MIN_WIDTH, Math.max(260, Math.floor((Math.min(1400, numColumns * DESIRED_CARD_MIN_WIDTH + 40) - (numColumns - 1) * cardGap - 40) / numColumns))), paddingHorizontal: Math.floor(cardGap / 2) };

    const onOpen = () => {
      const params = {
        courseId: String(item.id || item.id_curso || item._id),
        adminMode: !!showAdmin,
        courseTitle: item.titulo || item.title,
        courseCategory: item.categoria || item.categorias?.nombre
      };
      if (Platform.OS === 'web') {
        const { goToWebRoute } = require('../../utils/webNav');
        goToWebRoute('CourseDetail', params);
      } else {
        navigation.navigate('CourseDetail', params);
      }
    };

    return (
      <View style={containerStyle}>
        <TouchableOpacity
          style={[styles.item, { backgroundColor: theme.colors.card }]}
          onPress={onOpen}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={[
                styles.title,
                { color: theme.colors.text, fontSize: getFontSize(18) },
                Platform.select({ web: { whiteSpace: 'normal' } as any })
              ]}
              numberOfLines={2}
            >
              {item.titulo || item.title || 'Sin título'}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
              {}
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: item.categorias?.color || '#95A5A6',
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 12,
                marginRight: 8
              }}>
                <Ionicons 
                  name={(item.categorias?.icono as any) || 'folder'} 
                  size={14} 
                  color="#fff" 
                  style={{ marginRight: 4 }}
                />
                <Text style={{ color: '#fff', fontSize: getFontSize(12), fontWeight: '600' }}>
                  {item.categoria || item.categorias?.nombre || 'Sin categoría'}
                </Text>
              </View>
            </View>
              {(item.instructor_nombre || item.instructor) ? (
                <Text style={[styles.subtitle, { color: theme.dark ? '#999' : '#666', fontSize: getFontSize(12), marginTop: 4 }]} numberOfLines={1}>
                  {item.instructor_nombre || item.instructor}
                </Text>
              ) : null}

          </View>
          <Text style={[styles.actionText, { color: colors.primary, fontSize: getFontSize(14) }]}>Ver</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }
  
  if (showAdmin && isAdmin) {
    return <AdminCoursesScreen />;
  }

  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>

      <FlatList
        data={courses}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        key={numColumns}
        numColumns={numColumns}
        keyExtractor={(item, index) => String(item.id || item.id_curso || item._id || String(index))}
        renderItem={renderItem}
        contentContainerStyle={[
          { padding: isMobile ? 12 : isTablet ? 20 : 24 },
          
          isWeb && isDesktop && { maxWidth: Math.min(1400, numColumns * DESIRED_CARD_MIN_WIDTH + 40), alignSelf: 'center', alignItems: 'center' }
        ]}
        
        columnWrapperStyle={numColumns > 1 ? { justifyContent: 'center', paddingHorizontal: Math.floor(cardGap / 2) } : undefined}
        ListEmptyComponent={() => (
          <View style={{ padding: 16 }}>
            <Text style={{ color: theme.colors.text }}>No se encontraron cursos</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  item: {
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 240,
    
    ...Platform.select({
      web: {
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    })
  },
  title: { fontWeight: '700', marginBottom: 4, fontSize: 15, ...Platform.select({ web: { whiteSpace: 'normal', overflowWrap: 'break-word', wordBreak: 'break-word' } as any }) },
  subtitle: { fontSize: 13 },
  actionText: { fontWeight: '600', fontSize: 14 },
  addBtn: { padding: 8, borderRadius: 6 },
  filters: { padding: 12, borderBottomWidth: 1 },
  searchInput: { borderWidth: 1, borderRadius: 8, padding: 8, marginBottom: 12 },
  filterRow: { flexDirection: 'row', alignItems: 'center' },
  filterBtn: { paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderRadius: 8, marginRight: 8 },
  sortBtn: { marginLeft: 'auto', paddingHorizontal: 10, paddingVertical: 6 },
  tableHeader: { flexDirection: 'row', paddingHorizontal: 8, paddingVertical: 10, backgroundColor: 'transparent', borderBottomWidth: 1 },
  th: { fontWeight: '700', fontSize: 12 },
  tableRow: { flexDirection: 'row', paddingHorizontal: 8, paddingVertical: 10, borderBottomWidth: 1, alignItems: 'center' },
  td: { fontSize: 12, paddingHorizontal: 4 },
  iconBtn: { padding: 8, marginLeft: 6, borderRadius: 8, minWidth: 36, minHeight: 36, justifyContent: 'center', alignItems: 'center' },
  iconBtnLabel: { marginLeft: 8, fontSize: 13, fontWeight: '600' },
  
  mobileActionWrapperSmall: { alignItems: 'center', minWidth: 56, marginHorizontal: 6, paddingVertical: 4, justifyContent: 'center' },
  mobileActionLabelSmall: { marginTop: 6, textAlign: 'center', fontWeight: '700', fontSize: 12 },
  iconBtnInline: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, justifyContent: 'center' },
  adminToggle: { paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: 'transparent', borderRadius: 8 },
  adminPanel: { margin: 12, borderRadius: 12, padding: 12, boxShadow: Platform.OS === 'web' ? '0 6px 18px rgba(0,0,0,0.12)' : undefined, flex: 1 },
  adminToolbarRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, paddingHorizontal: 4 },
  adminSubtitle: { fontSize: 13, fontWeight: '500' },
  emptyState: { padding: 32, alignItems: 'center', justifyContent: 'center', minHeight: 160 },
  emptyTitle: { fontSize: 20, fontWeight: '700', marginTop: 8 },
  emptyText: { marginTop: 8, textAlign: 'center', maxWidth: 460 },
  createPrimary: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  importBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, backgroundColor: 'transparent' },
  batchBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10, marginTop: 8 },
});

export default AllCoursesScreen;