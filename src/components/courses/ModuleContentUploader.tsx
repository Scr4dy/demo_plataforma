import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, Platform, StyleSheet, TextInput, Animated, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { moduleContentService } from '../../services/moduleContentService';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

interface Props {
  courseId: number;
  moduleId: number;
  moduleTitle?: string;
  moduleContents?: any[]; 
  onUploadComplete?: (record: any) => void;
  allowedTypes?: string[];
  maxSizeMB?: number;
}

export const ModuleContentUploader: React.FC<Props> = ({ courseId, moduleId, moduleTitle, moduleContents = [], onUploadComplete, allowedTypes = ['*/*'], maxSizeMB = 500 }) => {
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const { state } = useAuth();
  const { theme, colors, getFontSize } = useTheme();
  const [selectedTarget, setSelectedTarget] = useState<'new' | number | null>('new');
  const [newContentTitle, setNewContentTitle] = useState<string | null>(null);
  const [newContentDesc, setNewContentDesc] = useState<string | null>(null);
  const [newContentDuration, setNewContentDuration] = useState<string>('');
  const [newContentObligatorio, setNewContentObligatorio] = useState<boolean>(true);
  
  const [urlMode, setUrlMode] = useState<boolean>(false);
  const [newContentUrl, setNewContentUrl] = useState<string>('');
  const [youtubePreview, setYoutubePreview] = useState<any | null>(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const dragAnim = useRef(new Animated.Value(0)).current;

  

  
  const getFileIcon = (fileName: string, mimeType?: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    const type = mimeType?.toLowerCase() || '';
    
    if (ext === 'pdf' || type.includes('pdf')) return { name: 'document-text', color: '#DC2626', bg: 'rgba(220, 38, 38, 0.1)' };
    if (['mp4', 'avi', 'mov', 'mkv', 'webm'].includes(ext || '') || type.includes('video')) return { name: 'videocam', color: '#7C3AED', bg: 'rgba(124, 58, 237, 0.1)' };
    if (['ppt', 'pptx', 'key'].includes(ext || '') || type.includes('presentation')) return { name: 'easel', color: '#EA580C', bg: 'rgba(234, 88, 12, 0.1)' };
    if (['doc', 'docx', 'txt', 'rtf'].includes(ext || '')) return { name: 'document', color: '#2563EB', bg: 'rgba(37, 99, 235, 0.1)' };
    if (['xls', 'xlsx', 'csv'].includes(ext || '')) return { name: 'stats-chart', color: '#059669', bg: 'rgba(5, 150, 105, 0.1)' };
    if (['zip', 'rar', '7z', 'tar'].includes(ext || '')) return { name: 'archive', color: '#CA8A04', bg: 'rgba(202, 138, 4, 0.1)' };
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext || '') || type.includes('image')) return { name: 'image', color: '#DB2777', bg: 'rgba(219, 39, 119, 0.1)' };
    
    return { name: 'document-attach', color: colors.primary, bg: `rgba(33, 150, 243, 0.1)` };
  };

  
  const animateSelection = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.05, duration: 150, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 150, useNativeDriver: true })
    ]).start();
  };

  
  const handleDragEnter = (e: any) => {
    if (Platform.OS !== 'web') return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    Animated.timing(dragAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
  };

  const handleDragLeave = (e: any) => {
    if (Platform.OS !== 'web') return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    Animated.timing(dragAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start();
  };

  const handleDragOver = (e: any) => {
    if (Platform.OS !== 'web') return;
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: any) => {
    if (Platform.OS !== 'web') return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    Animated.timing(dragAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start();

    const files = e.dataTransfer?.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const fileSizeMB = file.size / (1024 * 1024);
    
    if (fileSizeMB > maxSizeMB) {
      Alert.alert('Archivo muy grande', `El archivo debe ser menor a ${maxSizeMB} MB. Tamaño actual: ${fileSizeMB.toFixed(2)} MB`);
      return;
    }

    const fileObj: any = {
      uri: file,
      name: file.name,
      size: file.size,
      mimeType: file.type,
      webFile: file,
    };

    setSelectedFile(fileObj);
    animateSelection();
  };

  const pickFile = async () => {
    try {
      if (Platform.OS === 'web') {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = Array.isArray(allowedTypes) ? allowedTypes.join(',') : allowedTypes || '*/*';
        input.onchange = (e: any) => {
          const f = e.target.files && e.target.files[0];
          if (!f) return;
          const fileObj: any = {
            uri: f,
            name: f.name,
            size: f.size,
            mimeType: f.type,
            webFile: f,
          };

          const fileSizeMB = fileObj.size ? fileObj.size / (1024 * 1024) : 0;
          if (fileSizeMB > maxSizeMB) {
            Alert.alert('Archivo muy grande', `El archivo debe ser menor a ${maxSizeMB} MB. Tamaño actual: ${fileSizeMB.toFixed(2)} MB`);
            return;
          }

          setSelectedFile(fileObj);
          animateSelection();
        };
        input.click();
        return;
      }

      let DocumentPickerModule: any = null;
      try {
        
        DocumentPickerModule = require('expo-document-picker');
      } catch (err) {
        DocumentPickerModule = null;
      }

      if (!DocumentPickerModule) {
        Alert.alert('Dependencia faltante', 'Para seleccionar archivos en el dispositivo instala: expo install expo-document-picker');
        return;
      }

      const result = await DocumentPickerModule.getDocumentAsync({ type: allowedTypes, copyToCacheDirectory: true });
      if (result.type === 'cancel') return;
      const file = (result.assets && result.assets[0]) || result;

      const fileSizeMB = file.size ? file.size / (1024 * 1024) : 0;
      if (fileSizeMB > maxSizeMB) {
        Alert.alert('Archivo muy grande', `El archivo debe ser menor a ${maxSizeMB} MB. Tamaño actual: ${fileSizeMB.toFixed(2)} MB`);
        return;
      }

      setSelectedFile(file);
      animateSelection();
    } catch (err) {
      
      Alert.alert('Error', 'No se pudo seleccionar el archivo');
    }
  };

  const handleUpload = async () => {
    setUploading(true);
    try {
      
      if (urlMode && newContentUrl && newContentUrl.trim() !== '') {
        
        const { getYouTubeId, buildYouTubeThumbnail, buildYouTubeEmbedUrl } = require('../../utils/mediaHelpers');
        const videoId = getYouTubeId(newContentUrl);
        const metadata: any = {};
        if (videoId) {
          metadata.provider = 'youtube';
          metadata.videoId = videoId;
          metadata.thumbnail = buildYouTubeThumbnail(videoId);
          metadata.embedUrl = buildYouTubeEmbedUrl(videoId);
        }

        if (selectedTarget === 'new') {
          const titleToUse = newContentTitle || `Video ${videoId || ''}`;
          const duracionNum = newContentDuration ? parseInt(newContentDuration, 10) : null;
          const created = await moduleContentService.createContenidoFromUrl({
            courseId,
            moduleId,
            url: newContentUrl,
            tipo: 'url_video',
            titulo: titleToUse,
            descripcion: newContentDesc,
            duracion_estimada: duracionNum,
            obligatorio: newContentObligatorio,
            contentMetadata: metadata
          });
          Alert.alert('Éxito', 'Contenido creado desde URL correctamente');
          onUploadComplete?.(created.record || null);
        } else if (typeof selectedTarget === 'number') {
          
          const updated = await moduleContentService.createContenidoFromUrl({
            courseId,
            moduleId,
            url: newContentUrl,
            tipo: 'url_video',
            titulo: newContentTitle || undefined,
            descripcion: newContentDesc,
            duracion_estimada: newContentDuration ? parseInt(newContentDuration, 10) : undefined,
            obligatorio: newContentObligatorio,
            contentMetadata: metadata
          });
          Alert.alert('Éxito', 'Contenido actualizado con URL');
          onUploadComplete?.(updated.record || null);
        }

        
        setUrlMode(false);
        setNewContentUrl('');
        setYoutubePreview(null);
        return;
      }

      
      if (!selectedFile) return;
      const res = await moduleContentService.uploadAndCreateRecord({
        courseId,
        moduleId,
        file: selectedFile.uri,
        fileName: selectedFile.name,
        contentType: selectedFile.mimeType,
        upsert: true,
        uploadedBy: (state.user as any)?.id_usuario,
      });

      
      if (selectedTarget === 'new') {
        const titleToUse = newContentTitle || selectedFile.name.replace(/\.[^.]+$/, '');
        const duracionNum = newContentDuration ? parseInt(newContentDuration, 10) : null;
        const created = await moduleContentService.createContenidoFromFile({
          courseId,
          moduleId,
          storedPath: res.upload.path,
          originalFilename: selectedFile.name,
          titulo: titleToUse,
          descripcion: newContentDesc,
          duracion_estimada: duracionNum,
          obligatorio: newContentObligatorio,
        });
        Alert.alert('Éxito', 'Archivo subido y contenido creado correctamente');
        onUploadComplete?.(created.record || res.record);
      } else if (typeof selectedTarget === 'number') {
        
        const updated = await moduleContentService.associateFileToContenido(selectedTarget, res.upload.path, selectedFile.name, selectedFile.mimeType, selectedFile.size);
        Alert.alert('Éxito', 'Archivo subido y asociado a la lección seleccionada');
        onUploadComplete?.(updated);
      } else {
        Alert.alert('Éxito', 'Archivo subido correctamente');
        onUploadComplete?.(res.record);
      }

      setSelectedFile(null);
    } catch (err: any) {
      
      Alert.alert('Error', err?.message || 'Error al subir el archivo');
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
      {}
      {moduleTitle && (
        <View style={styles.headerContainer}>
          <View style={[styles.headerIcon, { backgroundColor: `${colors.primary}15` }]}>
            <Ionicons name="folder-open" size={20} color={colors.primary} />
          </View>
          <Text style={{ fontWeight: '700', fontSize: getFontSize(16), color: theme.colors.text }}>{moduleTitle}</Text>
        </View>
      )}

      {}
      <View style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: getFontSize(12), color: theme.colors.textSecondary, marginBottom: 8, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Destino del archivo
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          <TouchableOpacity 
            onPress={() => { setSelectedTarget('new'); setNewContentTitle(selectedFile ? selectedFile.name.replace(/\.[^.]+$/, '') : null); }} 
            style={[
              styles.targetChip,
              { 
                backgroundColor: selectedTarget === 'new' ? colors.primary : 'transparent',
                borderColor: selectedTarget === 'new' ? colors.primary : theme.colors.border,
              }
            ]}
          >
            <Ionicons name="add-circle" size={16} color={selectedTarget === 'new' ? '#fff' : theme.colors.text} />
            <Text style={{ color: selectedTarget === 'new' ? '#fff' : theme.colors.text, marginLeft: 6, fontWeight: '600', fontSize: getFontSize(13) }}>
              Nueva lección
            </Text>
          </TouchableOpacity>
          {Array.isArray(moduleContents) && moduleContents.length > 0 && moduleContents.map((c: any) => (
            <TouchableOpacity 
              key={c.id_contenido || c.id} 
              onPress={() => setSelectedTarget(Number(c.id_contenido || c.id))} 
              style={[
                styles.targetChip,
                { 
                  backgroundColor: selectedTarget === Number(c.id_contenido || c.id) ? colors.primary : 'transparent',
                  borderColor: selectedTarget === Number(c.id_contenido || c.id) ? colors.primary : theme.colors.border,
                }
              ]}
            >
              <Ionicons name="document" size={14} color={selectedTarget === Number(c.id_contenido || c.id) ? '#fff' : theme.colors.text} />
              <Text style={{ color: selectedTarget === Number(c.id_contenido || c.id) ? '#fff' : theme.colors.text, marginLeft: 6, fontSize: getFontSize(12) }} numberOfLines={1}>
                {(c.orden ? `L${c.orden} - ` : '') + (c.titulo || (c.original_filename || '').replace(/\.[^.]+$/, ''))}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {}
      <Animated.View
        style={[
          styles.dropZone,
          {
            backgroundColor: isDragging 
              ? `${colors.primary}15` 
              : selectedFile 
                ? (theme.dark ? 'rgba(255,255,255,0.03)' : '#f7fbff') 
                : 'transparent',
            borderColor: isDragging ? colors.primary : theme.colors.border,
            borderStyle: isDragging ? 'solid' : 'dashed',
            transform: [{ scale: scaleAnim }],
            opacity: dragAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 0.95]
            })
          }
        ]}
        {...({ onDragEnter: handleDragEnter, onDragLeave: handleDragLeave, onDragOver: handleDragOver, onDrop: handleDrop } as any)}
      >
        <TouchableOpacity
          style={styles.dropZoneContent}
          onPress={pickFile}
          disabled={uploading}
          activeOpacity={0.7}
        >
          {selectedFile ? (
            <View style={styles.selectedFilePreview}>
              <View style={[styles.fileIconLarge, { backgroundColor: getFileIcon(selectedFile.name, selectedFile.mimeType).bg }]}>
                <Ionicons 
                  name={getFileIcon(selectedFile.name, selectedFile.mimeType).name as any} 
                  size={40} 
                  color={getFileIcon(selectedFile.name, selectedFile.mimeType).color} 
                />
              </View>
              <View style={{ flex: 1, marginLeft: 16 }}>
                <Text style={[styles.selectedFileName, { color: theme.colors.text }]} numberOfLines={2}>
                  {selectedFile.name}
                </Text>
                <Text style={[styles.selectedFileSize, { color: theme.colors.textSecondary }]}>
                  {selectedFile.size ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB` : 'Tamaño desconocido'}
                </Text>
                <TouchableOpacity 
                  onPress={() => setSelectedFile(null)} 
                  style={styles.changeFileBtn}
                >
                  <Ionicons name="refresh" size={14} color={colors.primary} />
                  <Text style={{ color: colors.primary, fontSize: getFontSize(12), marginLeft: 4, fontWeight: '600' }}>
                    Cambiar archivo
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <View style={[styles.uploadIconContainer, { backgroundColor: `${colors.primary}10` }]}>
                <Ionicons name="cloud-upload-outline" size={48} color={colors.primary} />
              </View>
              <Text style={[styles.emptyStateTitle, { color: theme.colors.text }]}>
                {isDragging ? '¡Suelta el archivo aquí!' : 'Arrastra un archivo o haz clic'}
              </Text>
              <Text style={[styles.emptyStateSubtitle, { color: theme.colors.textSecondary }]}>
                PDF, PowerPoint, Videos hasta {maxSizeMB} MB
              </Text>
              <View style={styles.supportedFormats}>
                {[
                  { icon: 'document-text', color: colors.error || '#DC2626' },
                  { icon: 'videocam', color: colors.primary || '#7C3AED' },
                  { icon: 'easel', color: colors.warning || '#EA580C' },
                  { icon: 'image', color: colors.accent || '#DB2777' }
                ].map((format, idx) => (
                  <View key={idx} style={[styles.formatIcon, { backgroundColor: `${format.color}15`, borderRadius: 10 }]}>
                    <Ionicons name={format.icon as any} size={18} color={format.color} />
                  </View>
                ))}
              </View>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>

      {selectedFile && (
        <View style={styles.formContainer}>
          {selectedTarget === 'new' && (
            <View style={styles.formCard}>
              <Text style={[styles.formSectionTitle, { color: theme.colors.text }]}>
                <Ionicons name="create-outline" size={16} color={colors.primary} />  Información de la lección
              </Text>
              
              <View style={{ gap: 16 }}>
                {}
                <View>
                  <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>
                    <Ionicons name="text" size={14} /> Título *
                  </Text>
                  <TextInput 
                    value={newContentTitle || ''} 
                    onChangeText={setNewContentTitle as any} 
                    placeholder="Ej: Introducción al módulo" 
                    style={[styles.textInput, { 
                      borderColor: theme.colors.border, 
                      color: theme.colors.text,
                      backgroundColor: theme.colors.background 
                    }]} 
                    placeholderTextColor={theme.colors.textSecondary}
                  />
                </View>

                {}
                <View>
                  <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>
                    <Ionicons name="reader" size={14} /> Descripción (opcional)
                  </Text>
                  <TextInput 
                    value={newContentDesc || ''} 
                    onChangeText={setNewContentDesc} 
                    placeholder="Describe brevemente el contenido de esta lección..." 
                    multiline
                    numberOfLines={3}
                    style={[styles.textAreaInput, { 
                      borderColor: theme.colors.border, 
                      color: theme.colors.text,
                      backgroundColor: theme.colors.background,
                    }]} 
                    placeholderTextColor={theme.colors.textSecondary}
                  />
                </View>

                {}
                <View style={styles.inlineFields}>
                  {}
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>
                      <Ionicons name="time" size={14} /> Duración (min)
                    </Text>
                    <TextInput 
                      value={newContentDuration} 
                      onChangeText={setNewContentDuration} 
                      placeholder="15" 
                      keyboardType="numeric"
                      style={[styles.textInput, { 
                        borderColor: theme.colors.border, 
                        color: theme.colors.text,
                      }]} 
                      placeholderTextColor={theme.colors.textSecondary}
                    />
                  </View>
                  {}
                </View>

                {}
                <View style={{ marginTop: 8 }}>
                  <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>
                    <Ionicons name="link" size={14} /> Agregar por URL (opcional)
                  </Text>

                  <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                    <TouchableOpacity
                      onPress={() => { setUrlMode(prev => !prev); setNewContentUrl(''); setYoutubePreview(null); }}
                      style={[styles.urlModeBtn, { borderColor: urlMode ? colors.primary : theme.colors.border, backgroundColor: urlMode ? colors.primary : 'transparent' }]}
                    >
                      <Text style={{ color: urlMode ? '#fff' : theme.colors.text }}>Pegar URL</Text>
                    </TouchableOpacity>

                    {urlMode && (
                      <View style={{ flex: 1 }}>
                        <TextInput
                          value={newContentUrl}
                          onChangeText={(t) => {
                            setNewContentUrl(t);
                            try {
                              const { getYouTubeId, buildYouTubeThumbnail } = require('../../utils/mediaHelpers');
                              const id = getYouTubeId(t);
                              if (id) setYoutubePreview({ provider: 'youtube', videoId: id, thumbnail: buildYouTubeThumbnail(id) });
                              else setYoutubePreview(null);
                            } catch (err) { setYoutubePreview(null); }
                          }}
                          placeholder="https://www.youtube.com/watch?v=VIDEO_ID"
                          style={[styles.textInput, { borderColor: theme.colors.border, color: theme.colors.text }]}
                          placeholderTextColor={theme.colors.textSecondary}
                        />

                        {youtubePreview && (
                          <View style={{ marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                            <Image source={{ uri: youtubePreview.thumbnail }} style={{ width: 120, height: 68, borderRadius: 6 }} />
                            <View style={{ flex: 1 }}>
                              <Text style={{ color: theme.colors.text, fontWeight: '700' }}>Video detectado (YouTube)</Text>
                              <Text style={{ color: theme.colors.textSecondary, marginTop: 4 }}>ID: {youtubePreview.videoId}</Text>
                            </View>
                          </View>
                        )}
                      </View>
                    )}
                  </View>

                  {}
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>
                      <Ionicons name="star" size={14} /> Obligatorio
                    </Text>
                    <View style={styles.toggleContainer}>
                      <TouchableOpacity
                        onPress={() => setNewContentObligatorio(true)}
                        style={[
                          styles.toggleButton,
                          {
                            borderColor: newContentObligatorio ? colors.primary : theme.colors.border,
                            backgroundColor: newContentObligatorio ? `${colors.primary}20` : 'transparent'
                          }
                        ]}
                      >
                        <Ionicons name="checkmark-circle" size={16} color={newContentObligatorio ? colors.primary : theme.colors.textSecondary} />
                        <Text style={{ color: newContentObligatorio ? colors.primary : theme.colors.text, marginLeft: 4, fontSize: getFontSize(13), fontWeight: newContentObligatorio ? '700' : '400' }}>Sí</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => setNewContentObligatorio(false)}
                        style={[
                          styles.toggleButton,
                          {
                            borderColor: !newContentObligatorio ? colors.primary : theme.colors.border,
                            backgroundColor: !newContentObligatorio ? `${colors.primary}20` : 'transparent'
                          }
                        ]}
                      >
                        <Ionicons name="close-circle" size={16} color={!newContentObligatorio ? colors.primary : theme.colors.textSecondary} />
                        <Text style={{ color: !newContentObligatorio ? colors.primary : theme.colors.text, marginLeft: 4, fontSize: getFontSize(13), fontWeight: !newContentObligatorio ? '700' : '400' }}>No</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          )}

          <TouchableOpacity 
            style={[styles.uploadButton, { backgroundColor: uploading ? colors.primary + '80' : colors.primary }]} 
            onPress={handleUpload} 
            disabled={uploading}
            activeOpacity={0.8}
          >
            {uploading ? (
              <View style={styles.uploadingState}>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={styles.uploadButtonText}>Subiendo archivo...</Text>
              </View>
            ) : (
              <View style={styles.uploadButtonContent}>
                <View style={[styles.uploadIconCircle, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
                  <Ionicons name="cloud-upload" size={22} color="#fff" />
                </View>
                <Text style={styles.uploadButtonText}>
                  {selectedTarget === 'new' ? 'Subir y Crear Lección' : 'Subir y Asociar'}
                </Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </View>
            )}
          </TouchableOpacity>
        </View>
      )}

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 12,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1.5,
    maxWidth: 200,
  },
  dropZone: {
    borderWidth: 2,
    borderRadius: 16,
    padding: 24,
    minHeight: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  dropZoneContent: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedFilePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  fileIconLarge: {
    width: 80,
    height: 80,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedFileName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  selectedFileSize: {
    fontSize: 13,
    marginBottom: 8,
  },
  changeFileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  uploadIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  supportedFormats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    marginTop: 8,
  },
  formatIcon: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    marginHorizontal: 6,
  },
  formContainer: {
    gap: 16,
  },
  formCard: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    gap: 12,
  },
  formSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  textInput: {
    borderWidth: 1.5,
    padding: 14,
    borderRadius: 10,
    fontSize: 15,
  },
  textAreaInput: {
    borderWidth: 1.5,
    padding: 14,
    borderRadius: 10,
    fontSize: 15,
    minHeight: 90,
    textAlignVertical: 'top',
  },
  inlineFields: {
    flexDirection: 'row',
    gap: 16,
  },
  toggleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  uploadButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  uploadButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  uploadingState: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  uploadIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  urlModeBtn: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1.2,
  },
});

export default ModuleContentUploader;
