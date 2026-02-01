import React, { useEffect, useState } from 'react';
import { TextInput, View as RNView } from 'react-native';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { moduleContentService } from '../../services/moduleContentService';
import { storageService } from '../../services/storageService';
import { supabase } from '../../config/supabase';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

interface Props {
  courseId: number;
  moduleId: number;
  isEnrolled?: boolean;
  moduleIsPreview?: boolean;
  allowDelete?: boolean; 
  allowManage?: boolean; 
  allowDownload?: boolean; 
  onContenidoCreated?: () => void; 
}

const ModuleFilesList: React.FC<Props> = ({ courseId, moduleId, isEnrolled = false, moduleIsPreview = false, allowDelete, allowManage, allowDownload = true, onContenidoCreated }) => {
  const { theme, colors, getFontSize, colorScheme } = useTheme();
  const { state } = useAuth();
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  
  useEffect(() => {
    if (__DEV__) {
    }
  }, [colorScheme, colors]);

  const userRoleRaw = (state.user?.role || '')?.toString() || '';
  const normalizedUserRole = userRoleRaw.toLowerCase();
  const isInstructorOrAdmin = (
    normalizedUserRole.includes('instr') ||
    normalizedUserRole.includes('admin') ||
    normalizedUserRole.includes('administrador')
  );

  
  const canManage = (typeof allowManage === 'boolean') ? allowManage : isInstructorOrAdmin;

  const canDownload = (record: any) => {
    
    if (typeof allowDownload === 'boolean' && !allowDownload) return false;
    
    if (isInstructorOrAdmin) return true;
    if (isEnrolled) return true;
    return false;
  };

  const canDelete = (record: any) => {
    if (allowDelete === true) return true;
    if (allowDelete === false) return false;
    return isInstructorOrAdmin;
  };

  const [creatingContenidoFor, setCreatingContenidoFor] = useState<any>(null);
  const [contenidoTitle, setContenidoTitle] = useState('');
  const [contenidoTipo, setContenidoTipo] = useState('documento');
  const [contenidoDesc, setContenidoDesc] = useState<string | null>(null);
  const [contenidoOrden, setContenidoOrden] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);

  
  const hexToRgba = (hex: string, alpha = 0.06) => {
    if (!hex) return `rgba(0,0,0,${alpha})`;
    let h = hex.replace('#','');
    if (h.length === 3) h = h.split('').map(c => c + c).join('');
    const num = parseInt(h, 16);
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  
  
  const getFileStyle = (fileName: string, mimeType?: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    const type = mimeType?.toLowerCase() || '';
    const paletteColor = colors.primary || '#2563EB';

    
    if (ext === 'pdf' || type.includes('pdf')) return { icon: 'document-text', color: paletteColor, bg: hexToRgba(paletteColor, 0.08), gradient: [paletteColor, paletteColor] };
    if (['mp4', 'avi', 'mov', 'mkv', 'webm', 'flv'].includes(ext || '') || type.includes('video')) return { icon: 'videocam', color: paletteColor, bg: hexToRgba(paletteColor, 0.06), gradient: [paletteColor, paletteColor] };
    if (['ppt', 'pptx', 'key', 'odp'].includes(ext || '') || type.includes('presentation')) return { icon: 'easel', color: paletteColor, bg: hexToRgba(paletteColor, 0.06), gradient: [paletteColor, paletteColor] };
    if (['doc', 'docx', 'txt', 'rtf', 'odt'].includes(ext || '')) return { icon: 'document', color: paletteColor, bg: hexToRgba(paletteColor, 0.06), gradient: [paletteColor, paletteColor] };
    if (['xls', 'xlsx', 'csv', 'ods'].includes(ext || '')) return { icon: 'stats-chart', color: paletteColor, bg: hexToRgba(paletteColor, 0.06), gradient: [paletteColor, paletteColor] };
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext || '')) return { icon: 'archive', color: paletteColor, bg: hexToRgba(paletteColor, 0.06), gradient: [paletteColor, paletteColor] };
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp'].includes(ext || '') || type.includes('image')) return { icon: 'image', color: paletteColor, bg: hexToRgba(paletteColor, 0.06), gradient: [paletteColor, paletteColor] };
    if (['mp3', 'wav', 'ogg', 'aac', 'm4a'].includes(ext || '') || type.includes('audio')) return { icon: 'musical-notes', color: paletteColor, bg: hexToRgba(paletteColor, 0.06), gradient: [paletteColor, paletteColor] };

    return { icon: 'document-attach', color: paletteColor, bg: hexToRgba(paletteColor, 0.06), gradient: [paletteColor, paletteColor] };
  };

  
  const formatFileSize = (bytes: number) => {
    if (!bytes) return 'Tamaño desconocido';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const loadFiles = async () => {
    setLoading(true);
    try {
      const list = await moduleContentService.listFilesByModule(moduleId);
      setFiles(list || []);
    } catch (err) {
      
      Alert.alert('Error', 'No se pudieron cargar los materiales del módulo');
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const openCreateContenido = (file: any) => {
    setCreatingContenidoFor(file);
    
    const name = (file.original_filename || (file.stored_path || '').split('/').pop() || 'Contenido').replace(/\.[^.]+$/, '');
    setContenidoTitle(name);
    setContenidoTipo('documento');
    setContenidoDesc(null);
    setContenidoOrden(null);
  };

  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerFile, setViewerFile] = useState<any>(null);
  const [converting, setConverting] = useState(false);

  const openViewer = async (record: any) => {
    try {
      const path = record.stored_path || `${courseId}/${record.original_filename}`;
      const ext = (record.original_filename || '').split('.').pop()?.toLowerCase();

      
      if (ext === 'ppt' || ext === 'pptx') {
        const pdfPath = path.replace(/\.[^/.]+$/, '.pdf');
        try {
          const pdfUrl = await storageService.getCourseContentUrl(pdfPath, 3600);
          setViewerFile({ url: pdfUrl, mime: 'application/pdf', filename: pdfPath.split('/').pop() });
          setViewerVisible(true);
          return;
        } catch (e) {
          
          setConverting(true);
          let conversionSucceeded = false;
          try {
            const signedUrl = await storageService.getCourseContentUrl(path, 3600);
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token || null;

            const convResp = await fetch('/api/convert', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
              },
              body: JSON.stringify({ signedUrl, path })
            });

            if (convResp.ok) {
              const convJson = await convResp.json();
              if (convJson?.pdfSignedUrl) {
                setViewerFile({ url: convJson.pdfSignedUrl, mime: 'application/pdf', filename: convJson.pdfPath?.split('/').pop() });
                setViewerVisible(true);
                conversionSucceeded = true;
                return;
              }
            } else {
              );
            }
          } catch (convErr) {
            
          } finally {
            setConverting(false);
          }

          if (!conversionSucceeded) {
            
            setViewerFile({ url: null, mime: record.content_type, filename: record.original_filename, originalPath: path });
            setViewerVisible(true);
            return;
          }
        }
      }

      
      const url = await storageService.getCourseContentUrl(path, 3600);
      setViewerFile({ url, mime: record.content_type, filename: record.original_filename });
      setViewerVisible(true);
    } catch (err) {
      
      Alert.alert('Error', 'No se pudo abrir la vista previa');
    }
  };

  const handlePreview = (record: any) => {
    
    openViewer(record);
  };

  const handleCreateContenido = async () => {
    if (!creatingContenidoFor) return;

    
    const moduleIdNum = Number(moduleId);
    if (moduleId === null || moduleId === undefined || Number.isNaN(moduleIdNum)) {
      Alert.alert('Error', 'Selecciona un módulo válido antes de crear una lección.');
      return;
    }

    setCreating(true);
    try {
      const res = await moduleContentService.createContenidoFromFile({
        courseId: Number(courseId),
        moduleId: moduleIdNum,
        storedPath: creatingContenidoFor.stored_path,
        originalFilename: creatingContenidoFor.original_filename,
        tipo: contenidoTipo,
        titulo: contenidoTitle,
        descripcion: contenidoDesc,
        orden: contenidoOrden
      });

      if (res && res.existed) {
        Alert.alert('Aviso', 'Ya existe un contenido con esta URL. No se creó uno nuevo.');
      } else {
        Alert.alert('Éxito', 'Contenido creado correctamente');
        
        onContenidoCreated?.();
        await loadFiles();
      }
    } catch (err: any) {
      
      
      Alert.alert('Error', err?.message || String(err) || 'No se pudo crear el contenido');
    } finally {
      setCreating(false);
      setCreatingContenidoFor(null);
    }
  };

  useEffect(() => {
    loadFiles();
  }, [moduleId]);

  const handleDelete = (record: any) => {
    if (!canDelete(record)) {
      Alert.alert('Acceso denegado', 'No tienes permisos para eliminar este archivo');
      return;
    }

    Alert.alert('Eliminar material', `¿Eliminar "${record.original_filename}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: async () => {
        try {
          await moduleContentService.deleteFile(record.id);
          await loadFiles();
          Alert.alert('Eliminado', 'El archivo fue eliminado correctamente');
        } catch (err) {
          
          Alert.alert('Error', 'No se pudo eliminar el archivo');
        }
      } }
    ]);
  };

  if (loading) return (
    <View style={{ paddingVertical: 12 }}>
      <ActivityIndicator size="small" color={colors.primary} />
    </View>
  );

  
  const ModuleFileViewer = require('./ModuleFileViewer').default;

  return (
    <>
      <ModuleFileViewer visible={viewerVisible} onClose={() => setViewerVisible(false)} url={viewerFile?.url} mime={viewerFile?.mime} filename={viewerFile?.filename} originalPath={viewerFile?.originalPath} />
      {converting && (
        <View style={styles.convertingOverlay} pointerEvents="none">
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ color: colors.text, marginTop: 8 }}>Convirtiendo a PDF...</Text>
        </View>
      )}
      <View style={[styles.container, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}> 
        {files.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={[styles.emptyIconContainer, { backgroundColor: `${colors.primary}10` }]}>
            <Ionicons name="folder-open-outline" size={48} color={colors.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No hay materiales</Text>
          <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
            Sube archivos para este módulo
          </Text>
        </View>
      ) : (
        <View style={styles.filesGrid}>
          {(files || []).map((item, idx) => {
            const fileStyle = getFileStyle(item.original_filename || '', item.content_type);
            const fileExt = (item.original_filename || '').split('.').pop()?.toUpperCase() || '';
            
            return (
              <View 
                key={`file-${item.id ?? item.original_filename ?? item.stored_path ?? idx}`} 
                style={[styles.fileCard, { 
                  backgroundColor: theme.colors.background,
                  borderColor: theme.colors.border,
                }]}
              >
                {}
                <View style={styles.fileCardHeader}>
                  <View style={[styles.fileIconContainer, { backgroundColor: fileStyle.bg }]}>
                    <Ionicons name={fileStyle.icon as any} size={32} color={fileStyle.color} />
                  </View>

                </View> 

                {}
                <View style={styles.fileCardBody}>
                  <Text 
                    style={[styles.fileCardTitle, { color: theme.colors.text }]} 
                    numberOfLines={2}
                  >
                    {item.original_filename || ((item.stored_path || '').split('/').pop())}
                  </Text>
                  
                  {}
                  <View style={styles.fileMetadata}>
                    <View style={styles.metadataRow}>
                      <Ionicons name="resize" size={12} color={theme.colors.textSecondary} />
                      <Text style={[styles.metadataText, { color: theme.colors.textSecondary }]}>
                        {formatFileSize(item.size)}
                      </Text>
                    </View>
                    {item.created_at && (
                      <View style={styles.metadataRow}>
                        <Ionicons name="calendar" size={12} color={theme.colors.textSecondary} />
                        <Text style={[styles.metadataText, { color: theme.colors.textSecondary }]}>
                          {new Date(item.created_at).toLocaleDateString('es-ES', { 
                            day: 'numeric', 
                            month: 'short' 
                          })}
                        </Text>
                      </View>
                    )}
                  </View>

                  {item.uploader_name && (
                    <View style={[styles.uploaderTag, { backgroundColor: `${colors.primary}15` }]}>
                      <Ionicons name="person-circle" size={14} color={colors.primary} />
                      <Text style={[styles.uploaderText, { color: colors.primary }]} numberOfLines={1}>
                        {item.uploader_name}
                      </Text>
                    </View>
                  )}
                </View>

                {}
                <View style={styles.fileCardActions}>
                  {canManage ? (
                    <>
                      {}
                      <TouchableOpacity 
                        style={[styles.actionButton, styles.primaryAction, { backgroundColor: colors.primary }]} 
                        onPress={() => handlePreview(item)}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="eye" size={18} color="#fff" />
                        {Platform.OS === 'web' && <Text style={[styles.actionButtonText, { marginLeft: 6 }]}>Ver</Text>}
                      </TouchableOpacity>

                      <TouchableOpacity 
                        style={[styles.actionButtonSecondary, { borderColor: theme.colors.border }]} 
                        onPress={() => openCreateContenido(item)}
                        activeOpacity={0.8}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Ionicons name="add-circle-outline" size={18} color={theme.colors.text} />
                          {Platform.OS === 'web' && <Text style={[styles.iconBtnLabel, { color: theme.colors.text }]}>Crear</Text>}
                        </View>
                      </TouchableOpacity>

                      {(allowDelete === true ? allowDelete : canManage) && (
                        <TouchableOpacity 
                          style={[styles.actionButtonSecondary, { borderColor: theme.colors.border }]} 
                          onPress={() => handleDelete(item)}
                          activeOpacity={0.8}
                        >
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Ionicons name="trash-outline" size={18} color={theme.colors.error} />
                            {Platform.OS === 'web' && <Text style={[styles.iconBtnLabel, { color: theme.colors.error }]}>Eliminar</Text>}
                          </View>
                        </TouchableOpacity>
                      )}
                    </>
                  ) : (
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.primaryAction, { backgroundColor: colors.primary }]} 
                      onPress={() => handlePreview(item)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="eye" size={18} color="#fff" />
                      <Text style={styles.actionButtonText}>Vista previa</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      )}
      {}
      {creatingContenidoFor && (
        <View style={{ position: 'absolute', left: 16, right: 16, top: '30%', backgroundColor: theme.colors.card, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: theme.colors.border }}>
          <Text style={{ fontWeight: '700', marginBottom: 8 }}>Crear contenido desde archivo</Text>
          <Text style={{ color: theme.colors.textSecondary, marginBottom: 8 }}>{creatingContenidoFor.original_filename}</Text>

          <View style={{ marginBottom: 8 }}>
            <Text style={{ color: theme.colors.textSecondary }}>Título</Text>
            <TextInput
              value={contenidoTitle}
              onChangeText={setContenidoTitle}
              placeholder="Título del contenido"
              style={{ borderWidth: 1, borderColor: theme.colors.border, padding: 8, borderRadius: 6, marginTop: 6, color: theme.colors.text }}
            />
          </View>

          <View style={{ marginBottom: 8 }}>
            <Text style={{ color: theme.colors.textSecondary, marginBottom: 6 }}>Tipo</Text>
            <RNView style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {[
                { label: 'Documento', value: 'documento' },
                { label: 'Video', value: 'video' },
                { label: 'Enlace', value: 'enlace' },
                { label: 'Evaluación', value: 'evaluacion' },
                { label: 'Presentación', value: 'presentacion' },
                { label: 'Otro', value: 'otro' },
              ].map(opt => (
                <TouchableOpacity
                  key={opt.value}
                  onPress={() => setContenidoTipo(opt.value)}
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    borderRadius: 8,
                    backgroundColor: contenidoTipo === opt.value ? (theme.dark ? '#374151' : '#e6f0ff') : 'transparent',
                    borderWidth: contenidoTipo === opt.value ? 0 : 1,
                    borderColor: theme.colors.border,
                    marginRight: 8,
                    marginBottom: 8,
                  }}
                >
                  <Text style={{ color: contenidoTipo === opt.value ? colors.primary : theme.colors.text }}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </RNView>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8 }}>
            <TouchableOpacity onPress={() => setCreatingContenidoFor(null)} style={{ padding: 8 }}>
              <Text style={{ color: theme.colors.textSecondary }}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleCreateContenido} style={{ padding: 8, backgroundColor: '#4CAF50', borderRadius: 6 }} disabled={creating}>
              <Text style={{ color: '#fff' }}>{creating ? 'Creando...' : 'Crear'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: { 
    padding: 12, 
    borderRadius: 12, 
    borderWidth: 1, 
    marginTop: 12 
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  filesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  fileCard: {
    width: Platform.OS === 'web' ? '32%' : '48%',
    minWidth: 280,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconBtnLabel: { marginLeft: 8, fontSize: 13, fontWeight: '600' },
  fileCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  colorDebug: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginLeft: 8,
  },
  colorDebugText: {
    fontSize: 12,
    fontWeight: '700',
  },
  fileIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  fileCardBody: {
    marginBottom: 12,
  },
  fileCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
    lineHeight: 20,
  },
  fileMetadata: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metadataText: {
    fontSize: 12,
  },
  uploaderTag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 4,
    maxWidth: '100%',
  },
  uploaderText: {
    fontSize: 11,
    fontWeight: '600',
    flexShrink: 1,
  },
  fileCardActions: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 6,
  },
  primaryAction: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  actionButtonSecondary: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    borderWidth: 1.5,
  },
  fileRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 8, 
    borderBottomWidth: 1 
  },
  fileName: { 
    fontWeight: '600' 
  },
  fileMeta: { 
    marginTop: 2 
  },
  fileActions: { 
    flexDirection: 'row', 
    gap: 8 
  },
  actionBtn: { 
    width: 36, 
    height: 36, 
    borderRadius: 8, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginLeft: 8 
  },
  convertingOverlay: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    zIndex: 1000,
  }
});

export default ModuleFilesList;
