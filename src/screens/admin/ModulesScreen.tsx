import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Platform, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import IconActionButton from '../../components/common/IconActionButton';
import { useTheme } from '../../context/ThemeContext';
import { useHeader } from '../../context/HeaderContext';
import CourseMaterialsPanel from '../../components/courses/CourseMaterialsPanel';
import { useUserRole } from '../../hooks/useUserRole';
import { supabase } from '../../config/supabase';
import ModuleFormModal from '../../components/admin/ModuleFormModal';

const ModulesScreen: React.FC<{ courseId?: number | string }> = ({ courseId: propCourseId }) => {
  const { theme, colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [modules, setModules] = useState<any[]>([]);
  const [coursesMap, setCoursesMap] = useState<Record<number, string>>({});
  const [courseTitle, setCourseTitle] = useState<string | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);

  
  const [showMaterialsModal, setShowMaterialsModal] = useState(false);
  const [materialModuleId, setMaterialModuleId] = useState<number | null>(null);
  const [materialContenidoId, setMaterialContenidoId] = useState<number | 'new' | null>(null);
  const { isAdmin, isInstructor } = useUserRole();
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { header, setHeader } = useHeader();
  const goToLessonsForModule = (moduleId: number) => {
    
    if (Platform.OS === 'web') {
      try {
        const { goToWebRoute } = require('../../utils/webNav');
        goToWebRoute('Lessons', { courseId: parsedCourseId, moduleId });
        return;
      } catch (e) {
        
      }
    }
    try { navigation.navigate('Lessons' as any, { courseId: parsedCourseId, moduleId }); } catch (e) {  }
  };

  
  const rawCid = route?.params?.courseId ?? propCourseId;
  const parsedCourseId = rawCid == null ? undefined : (typeof rawCid === 'string' ? parseInt(rawCid, 10) : rawCid);
  useEffect(() => {
    
    const rawCid = route?.params?.courseId ?? propCourseId;
    const cid = rawCid == null ? undefined : (typeof rawCid === 'string' ? parseInt(rawCid, 10) : rawCid);
    loadModules(cid);
    if (cid) loadCourseTitle(cid);

    if (Platform.OS === 'web') {
      try {
        const { goToWebRoute } = require('../../utils/webNav');
        if (cid) goToWebRoute('Modules', { courseId: cid });
        else goToWebRoute('Modules');
      } catch (e) {  }
    }

    return () => {
      if (Platform.OS === 'web') {
        try {
          const { getCurrentWebRoute, clearWebRoute } = require('../../utils/webNav');
          const current = getCurrentWebRoute ? getCurrentWebRoute() : null;
          
          if (!current || (current.name === 'Modules' && (!cid || String(current.params?.courseId) === String(cid)))) {
            clearWebRoute();
          } else {
          }
        } catch (e) {  }
      }
      setCourseTitle(null);
    };
  }, [route?.params?.courseId, propCourseId]);

  const loadModules = async (courseId?: number) => {
    try {
      setLoading(true);
      let query = supabase.from('modulos').select('*').is('deleted_at', null).order('orden', { ascending: true });
      if (courseId != null && !Number.isNaN(Number(courseId))) query = query.eq('id_curso', Number(courseId));
      const res = await query;
      const { data, error } = res as any;
      if (error) throw error;
      const mods = data || [];
      setModules(mods);

      
      const cursoIds = Array.from(new Set(mods.map((m: any) => m.id_curso).filter(Boolean)));
      if (cursoIds.length > 0) {
        const cursosRes: any = await supabase
          .from('cursos')
          .select('id_curso, titulo')
          .in('id_curso', cursoIds);
        if (!cursosRes.error && Array.isArray(cursosRes.data)) {
          const map: Record<number, string> = {};
          (cursosRes.data || []).forEach((c: any) => { map[c.id_curso] = c.titulo; });
          setCoursesMap(map);
        }
      }
    } catch (err) {
      
      Alert.alert('Error', 'No se pudieron cargar los módulos');
    } finally {
      setLoading(false);
    }
  };

  const loadCourseTitle = async (courseId?: number) => {
    if (!courseId) { setCourseTitle(null); return; }
    try {
      const res: any = await supabase.from('cursos').select('titulo').eq('id_curso', courseId).single();
      if (!res.error && res.data) setCourseTitle(res.data.titulo || null);
      else setCourseTitle(null);
    } catch (err) {
      
      setCourseTitle(null);
    }
  };

  const handleEdit = (id: number) => {
    setSelectedModuleId(id);
    setShowFormModal(true);
  };

  
  const handleCreate = () => {
    
    setSelectedModuleId(null);
    setShowFormModal(true);
  };

  const handleDelete = (id: number, titulo: string) => {
    const doDelete = async () => {
      try {
        
        const { data, error }: any = await supabase.rpc('soft_delete_modulo', {
          modulo_id: id
        });
        if (error) throw error;

        
        if (data && !data.success) {
          Alert.alert('Error', data.error || 'No se pudo eliminar el módulo');
          return;
        }

        Alert.alert('Éxito', 'Módulo eliminado');
        await loadModules(parsedCourseId);
      } catch (err: any) {
        :', err);
        const msg = err?.message || err?.error_description || JSON.stringify(err) || 'No se pudo eliminar';
        Alert.alert('Error', msg);
      }
    };

    
    if (Platform.OS === 'web') {
      try {
        const confirmed = (window as any).confirm(`¿Eliminar módulo "${titulo}"?`);
        if (!confirmed) return;
        void doDelete();
        return;
      } catch (e) {
        
        
      }
    }

    
    Alert.alert('Confirmar eliminación', `¿Eliminar módulo "${titulo}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: doDelete }
    ]);
  };

  const onSuccess = async () => {
    setShowFormModal(false);
    setSelectedModuleId(null);
    await loadModules(parsedCourseId);
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
      {}
      <View style={styles.cardTopRow}>
        <View style={[styles.orderBadge, { backgroundColor: theme.colors.primary }]}>
          <Text style={[styles.orderText, { color: '#FFFFFF' }]}>#{item.orden}</Text>
        </View>
        <Text style={[styles.cardTitle, { color: theme.colors.text, flex: 1 }]} numberOfLines={2}>
          {item.titulo}
        </Text>
      </View>

      {}
      {item.descripcion ? (
        <View style={styles.descriptionContainer}>
          <Text style={[styles.cardDescription, { color: theme.colors.textSecondary }]} numberOfLines={3}>
            {item.descripcion}
          </Text>
        </View>
      ) : null}

      {}
      <View style={styles.infoRow}>
        {item.duracion_estimada ? (
          <View style={styles.infoTag}>
            <Ionicons name="time-outline" size={14} color={theme.colors.textSecondary} />
            <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
              {item.duracion_estimada} min
            </Text>
          </View>
        ) : null}
        {item.obligatorio ? (
          <View style={[styles.infoTag, styles.requiredTag]}>
            <Ionicons name="alert-circle" size={14} color="#D97706" />
            <Text style={[styles.infoText, { color: '#D97706', fontWeight: '600' }]}>
              Obligatorio
            </Text>
          </View>
        ) : null}
      </View>

      {}
      <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

      {}
      <View style={styles.cardActions}>
        {(isAdmin || isInstructor) && parsedCourseId ? (
          <IconActionButton
            icon="book"
            label="Lecciones"
            compact={false}
            iconOnly={false}
            onPress={() => goToLessonsForModule(item.id_modulo)}
            variant="primary"
            showLabel={true}
            style={styles.actionButton}
          />
        ) : null}

        <IconActionButton
          icon="pencil"
          label="Editar"
          compact={false}
          iconOnly={false}
          onPress={() => handleEdit(item.id_modulo)}
          variant="outline"
          showLabel={true}
          style={styles.actionButton}
        />

        <IconActionButton
          icon="trash"
          label="Eliminar"
          compact={false}
          iconOnly={false}
          onPress={() => handleDelete(item.id_modulo, item.titulo)}
          variant="danger"
          showLabel={true}
          style={styles.actionButton}
        />
      </View>
    </View>
  );

  React.useEffect(() => {
    
    
    setHeader({
      title: 'Módulos',
      subtitle: courseTitle ?? undefined,
      showBack: true,
      manual: true,
      owner: 'Modules',
      onBack: () => navigation.goBack(),
      
      containerStyle: Platform.OS !== 'web' ? { backgroundColor: colors.primary } : undefined,
      backIconColor: Platform.OS !== 'web' ? theme.colors.card : undefined,
      alignLeftOnMobile: true,
    });

    
    return () => {
      try {
        setHeader(null);
      } catch (e) {
        
      }
    };
  }, [setHeader, navigation, courseTitle, colors.primary, theme.colors.card]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <View style={styles.content}>

        {}
        {Platform.OS === 'web' && (
          <View style={[styles.headerContainer, { alignItems: 'center' }]}>
            <View style={styles.headerTextContainer}>
              <Text style={[styles.pageTitle, { color: theme.colors.text }]}>Módulos</Text>
            </View>

            {(isAdmin || isInstructor) && parsedCourseId ? (
              <IconActionButton
                icon="add-circle-outline"
                label="Crear módulo"
                onPress={handleCreate}
                variant="primary"
                keepPrimaryMobile={true}
                style={[styles.createButton]}
                accessibilityLabel="Crear módulo"
              />
            ) : null}
          </View>
        )}

        {}
        {Platform.OS !== 'web' && (isAdmin || isInstructor) && parsedCourseId ? (
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 8 }}>
            <IconActionButton
              icon="add-circle-outline"
              label="Crear módulo"
              onPress={handleCreate}
              variant="primary"
              keepPrimaryMobile={true}
              style={[styles.createButton, { paddingVertical: 8, paddingHorizontal: 14 }]}
              accessibilityLabel="Crear módulo"
            />
          </View>
        ) : null}

        {}
        {!parsedCourseId && (
          <View style={styles.warningContainer}>
            <Ionicons name="information-circle" size={24} color="#D97706" style={{ marginRight: 8 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.warningTitle}>Acciones no disponibles</Text>
              <Text style={styles.warningText}>
                Para crear módulos o subir materiales, abre esta pantalla desde la página de un curso (Admin → Cursos → Módulos) o selecciona un curso primero.
              </Text>
            </View>
          </View>
        )}

        {}
        {modules.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="folder-open-outline" size={64} color={theme.colors.textSecondary} />
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
              No hay módulos creados
            </Text>
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              {parsedCourseId
                ? 'Comienza creando el primer módulo para este curso'
                : 'Selecciona un curso para ver sus módulos'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={modules}
            keyExtractor={(i) => String(i.id_modulo)}
            renderItem={renderItem}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {showMaterialsModal && parsedCourseId && (
        <Modal visible={showMaterialsModal} transparent animationType="slide" onRequestClose={() => setShowMaterialsModal(false)}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ width: '95%', maxWidth: 980, borderRadius: 12, overflow: 'hidden' }}>
              <CourseMaterialsPanel courseId={Number(parsedCourseId)} allowUpload={true} allowDelete={isAdmin} initialModuleId={materialModuleId ?? undefined} initialContenidoId={materialContenidoId ?? undefined} hideTargetSelection={materialContenidoId !== null} showFileList={false} onClose={() => setShowMaterialsModal(false)} onUploadDone={async () => { setShowMaterialsModal(false); await loadModules(parsedCourseId); }} />
            </View>
          </View>
        </Modal>
      )}

      <ModuleFormModal visible={showFormModal} courseId={parsedCourseId ? String(parsedCourseId) : ''} moduleId={selectedModuleId ?? undefined} onClose={() => { setShowFormModal(false); setSelectedModuleId(null); }} onSuccess={onSuccess} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 16, paddingTop: Platform.OS === 'web' ? 16 : 6 },

  
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingBottom: 16,
  },
  
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  headerInfo: {
    flex: 1,
    marginRight: 12,
  },
  headerSubtitle: {
    fontSize: 14,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  headerTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  pageTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  pageSubtitle: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 2,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },

  
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FDBA74',
  },
  warningTitle: {
    fontWeight: '700',
    color: '#D97706',
    marginBottom: 4,
    fontSize: 15,
  },
  warningText: {
    color: '#92400E',
    fontSize: 14,
    lineHeight: 20,
  },

  
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 22,
  },

  
  listContainer: {
    paddingBottom: 20,
  },

  
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 12,
    minWidth: 40,
    alignItems: 'center',
  },
  orderText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
    letterSpacing: -0.3,
  },
  descriptionContainer: {
    marginBottom: 12,
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  infoTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
  },
  requiredTag: {
    backgroundColor: '#FEF3C7',
  },
  infoText: {
    fontSize: 12,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    marginBottom: 12,
    opacity: 0.3,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    height: 44, 
    justifyContent: 'center',
  },

  
  cardHeader: { flexDirection: 'row', marginBottom: 8, alignItems: 'center', justifyContent: 'space-between' },
  cardActionsHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  actionBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  actionBtnText: { fontWeight: '600' }
});

export default ModulesScreen;
