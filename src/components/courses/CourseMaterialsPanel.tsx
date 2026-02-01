import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Platform, Modal } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import ModuleFileViewer from './ModuleFileViewer';
import { storageService } from '../../services/storageService';
import { FileUploader } from '../common/FileUploader';
import { Ionicons } from '@expo/vector-icons';
import { categoryService } from '../../services/categoryService';
import { moduleContentService } from '../../services/moduleContentService';
import { TextInput } from 'react-native';

interface Props {
  courseId: number;
  allowUpload?: boolean;
  allowDelete?: boolean;
  onClose?: () => void;
  isEnrolled?: boolean; 
  
  initialModuleId?: number | null;
  initialContenidoId?: number | 'new' | null;
  
  hideTargetSelection?: boolean;
  showFileList?: boolean;
  onUploadDone?: () => void;
}

export const CourseMaterialsPanel: React.FC<Props> = ({ courseId, allowUpload = true, allowDelete = false, onClose, isEnrolled = false, initialModuleId, initialContenidoId, hideTargetSelection = false, showFileList = true, onUploadDone }) => {
  const { theme, colors, getFontSize } = useTheme();
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  
  const [modules, setModules] = useState<any[]>([]);
  const [contentMap, setContentMap] = useState<Record<string, any>>({}); 
  const [uploading, setUploading] = useState(false);
  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null);
  const [selectedContenidoId, setSelectedContenidoId] = useState<number | 'new' | null>(null);
  const [newContenidoTitle, setNewContenidoTitle] = useState<string>('');

  
  useEffect(() => {
    if (initialModuleId !== undefined) setSelectedModuleId(initialModuleId ?? null);
    if (initialContenidoId !== undefined) setSelectedContenidoId(initialContenidoId ?? null);
    if (initialContenidoId === 'new' && newContenidoTitle === '') setNewContenidoTitle('');

    
    if ((hideTargetSelection) && initialModuleId != null && initialContenidoId === undefined) {
      setSelectedModuleId(initialModuleId);
      setSelectedContenidoId('new');
    }
  }, [initialModuleId, initialContenidoId, hideTargetSelection]);

  useEffect(() => {
    
    loadFilesAndModules();
  }, [courseId]);

  const loadFilesAndModules = async () => {
    setLoading(true);
    try {
      
      const list = await storageService.listCourseContent(courseId);
      
      let mods: any[] = [];
      try {
        const m = await categoryService.getModulosByCurso(String(courseId));
        mods = m || [];
      } catch (modErr) {
        
        mods = [];
      }

      
      const map: Record<string, any> = {};
      for (const mod of mods) {
        if (Array.isArray(mod.contenidos)) {
          for (const c of mod.contenidos) {
            const url = c.url || c.contenido_data || c.stored_path || '';
            const filename = url.split('/').pop();
            if (url) map[url] = { moduleId: mod.id_modulo || mod.id, moduleTitle: mod.titulo, contenidoId: c.id_contenido || c.id, contenidoTitle: c.titulo };
            if (filename) map[filename] = { moduleId: mod.id_modulo || mod.id, moduleTitle: mod.titulo, contenidoId: c.id_contenido || c.id, contenidoTitle: c.titulo };
          }
        }
      }

      setFiles(list || []);
      setModules(mods || []);
      setContentMap(map);
    } catch (err) {
      
      Alert.alert('Error', 'No se pudieron cargar los materiales');
      setFiles([]);
      setModules([]);
      setContentMap({});
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (fileName: string) => {
    Alert.alert('Eliminar material', `¿Eliminar "${fileName}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive', onPress: async () => {
          try {
            const path = `${courseId}/${fileName}`;
            await storageService.deleteCourseContent(path);
            await loadFilesAndModules();
            Alert.alert('Eliminado', 'Material eliminado correctamente');
          } catch (err) {
            
            Alert.alert('Error', 'No se pudo eliminar el archivo');
          }
        }
      }
    ]);
  };

  const handlePreview = async (fileName: string) => {
    try {
      setPreviewLoading(true);
      const path = `${courseId}/${fileName}`;
      const url = await storageService.getCourseContentUrl(path, 3600);
      setPreviewUrl(url);
      setPreviewTitle(fileName);
      setPreviewVisible(true);
    } catch (err) {
      
      Alert.alert('Error', 'No se pudo obtener la vista previa');
    } finally {
      setPreviewLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
      {}
      {onClose && (
        <TouchableOpacity
          onPress={onClose}
          style={[styles.floatingCloseBtn, { backgroundColor: theme.colors.background }]}
          accessibilityLabel="Cerrar materiales"
        >
          <Ionicons name="close" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      )}

      {}
      {!isEnrolled && (
        <Text style={{ color: theme.colors.textSecondary, marginBottom: 8 }}>Estás viendo una vista previa. Inscríbete para descargar o acceder al contenido completo.</Text>
      )}

      {hideTargetSelection && (
        <View style={{ padding: 10, backgroundColor: theme.colors.background, borderRadius: 8, borderWidth: 1, borderColor: theme.colors.border, marginBottom: 12 }}>
          <Text style={{ color: theme.colors.text, fontWeight: '700' }}>Destino</Text>
          <Text style={{ color: theme.colors.textSecondary, marginTop: 6 }}>
            {selectedModuleId ? `Módulo: ${modules.find(m => Number(m.id_modulo || m.id) === Number(selectedModuleId))?.titulo || selectedModuleId}` : 'Raíz del curso'}{selectedContenidoId === 'new' ? ' • Se creará una nueva lección para este archivo' : selectedContenidoId ? ` • Lección: ${selectedContenidoId}` : ''}
          </Text>
        </View>
      )}

      {previewVisible && (
        <ModuleFileViewer visible={previewVisible} onClose={() => { setPreviewVisible(false); setPreviewUrl(null); }} url={previewUrl || ''} mime={undefined} filename={previewTitle || undefined} />
      )}

      {allowUpload && (
        <View style={{ marginVertical: 12 }}>
          {}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 16,
            paddingBottom: 12,
            borderBottomWidth: 2,
            borderBottomColor: colors.primary + '20'
          }}>
            <View style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: colors.primary + '15',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12
            }}>
              <Ionicons name="cloud-upload-outline" size={22} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{
                color: theme.colors.text,
                fontWeight: '700',
                fontSize: getFontSize(18),
                marginBottom: 2
              }}>
                Subir Material del Curso
              </Text>
              <Text style={{
                color: theme.colors.textSecondary,
                fontSize: getFontSize(13)
              }}>
                Agrega recursos para tus estudiantes
              </Text>
            </View>
          </View>

          {}
          {(selectedModuleId || selectedContenidoId) && (
            <View style={{
              padding: 14,
              backgroundColor: colors.primary + '08',
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.primary + '30',
              marginBottom: 16,
              flexDirection: 'row',
              alignItems: 'flex-start'
            }}>
              <Ionicons name="information-circle" size={20} color={colors.primary} style={{ marginRight: 10, marginTop: 2 }} />
              <View style={{ flex: 1 }}>
                <Text style={{
                  color: theme.colors.text,
                  fontWeight: '600',
                  fontSize: getFontSize(13),
                  marginBottom: 4
                }}>
                  Destino
                </Text>
                <Text style={{
                  color: theme.colors.textSecondary,
                  fontSize: getFontSize(12),
                  lineHeight: 18
                }}>
                  {selectedModuleId
                    ? `Módulo: ${modules.find(m => Number(m.id_modulo || m.id) === Number(selectedModuleId))?.titulo || selectedModuleId}`
                    : 'Raíz del curso'}
                  {selectedContenidoId === 'new'
                    ? ' • Se creará una nueva lección'
                    : selectedContenidoId
                      ? ` • Lección: ${selectedContenidoId}`
                      : ''}
                </Text>
              </View>
            </View>
          )}

          {}
          <View style={{
            padding: 24,
            backgroundColor: theme.colors.background,
            borderRadius: 16,
            borderWidth: 2,
            borderColor: colors.primary,
            borderStyle: 'dashed',
            alignItems: 'center'
          }}>
            {}
            <View style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: colors.primary + '10',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16
            }}>
              <Ionicons name="document-attach" size={32} color={colors.primary} />
            </View>

            {}
            <Text style={{
              color: theme.colors.text,
              fontWeight: '700',
              fontSize: getFontSize(16),
              marginBottom: 6,
              textAlign: 'center'
            }}>
              Selecciona el archivo
            </Text>

            {}
            <Text style={{
              color: theme.colors.textSecondary,
              fontSize: getFontSize(13),
              marginBottom: 20,
              textAlign: 'center',
              lineHeight: 20
            }}>
              Formatos aceptados: video, PDF, imágenes, PowerPoint (.ppt, .pptx)
            </Text>

            {}
            <View style={{ width: '100%' }}>
              <FileUploader
                contenidoId={Number(courseId)}
                onUploadComplete={async (url, path) => {
                  
                  try {
                    if (selectedModuleId !== null) {
                      const filename = path?.split('/').pop();
                      if (selectedContenidoId && selectedContenidoId !== 'new') {
                        await moduleContentService.associateFileToContenido(Number(selectedContenidoId), path || `${courseId}/${filename}`, filename);
                      } else {
                        await moduleContentService.createContenidoFromFile({
                          courseId: Number(courseId),
                          moduleId: Number(selectedModuleId),
                          storedPath: path || `${courseId}/${filename}`,
                          originalFilename: filename || '',
                          titulo: newContenidoTitle || filename || ''
                        });
                      }
                    }
                  } catch (err) {
                    
                  } finally {
                    await loadFilesAndModules();
                    if (onUploadDone) {
                      try { await onUploadDone(); } catch (e) {  }
                    }
                  }
                }}
              />
            </View>
          </View>

        </View>
      )}

      {showFileList === false ? null : (loading ? (
        <View style={{ paddingVertical: 24 }}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      ) : (
        <View>
          {(files || []).map((item, idx) => {
            const possibleKey = item.name || '';
            const association = contentMap[item.name] || contentMap[possibleKey];
            return (
              <View key={item.name ?? `file-${idx}`} style={[styles.fileRow, { borderBottomColor: theme.colors.border }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.fileName, { color: theme.colors.text, fontSize: getFontSize(14) }]} numberOfLines={1}>{item.name ?? `Archivo ${idx + 1}`}</Text>
                  <Text style={[styles.fileMeta, { color: theme.colors.textSecondary, fontSize: getFontSize(12) }]}>
                    {item.size ? `${(item.size / (1024 * 1024)).toFixed(2)} MB` : ''} {item.lastModified ? ` • ${new Date(item.lastModified).toLocaleString()}` : ''}
                    {association ? ` • ${association.moduleTitle}${association.contenidoTitle ? ` / ${association.contenidoTitle}` : ''}` : ''}
                  </Text>
                </View>
                <View style={styles.fileActions}>
                  {}
                  <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.primary }]} onPress={() => handlePreview(item.name || '')} accessibilityLabel="Ver material">
                    <Ionicons name="eye" size={16} color="#fff" />
                  </TouchableOpacity>
                  {allowDelete && (
                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.error }]} onPress={() => handleDelete(item.name || '')}>
                      <Ionicons name="trash" size={16} color="#fff" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 12, borderRadius: 10, borderWidth: 1 },
  floatingCloseBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  header: { fontWeight: '700' },
  closeBtn: { padding: 6 },
  fileRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1 },
  fileName: { fontWeight: '600' },
  fileMeta: { marginTop: 2 },
  fileActions: { flexDirection: 'row', gap: 8 },
  actionBtn: { width: 36, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginLeft: 8 }
});

export default CourseMaterialsPanel;
