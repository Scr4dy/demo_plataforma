
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { useStorageUpload } from '../../hooks/useStorageUpload';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../config/supabase';

interface FileUploaderProps {
  contenidoId: number;
  onUploadComplete?: (url: string, path: string) => void;
  allowedTypes?: string[];
  maxSizeMB?: number;
}

export function FileUploader({
  contenidoId,
  onUploadComplete,
  
  allowedTypes = [
    'video/*',
    'application/pdf',
    'image/*',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-powerpoint',
    '.pptx',
    '.ppt'
  ],
  maxSizeMB = 500,
}: FileUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const { uploading, progress, error, uploadCourseContent, reset } = useStorageUpload();

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
        Alert.alert(
          'Dependencia faltante',
          'Para seleccionar archivos en el dispositivo instala la dependencia: expo install expo-document-picker'
        );
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
    } catch (err) {
      
      Alert.alert('Error', 'No se pudo seleccionar el archivo');
    }
  };

  const CONVERSION_ENABLED = process.env.EXPO_PUBLIC_CONVERSION_ENABLED === 'true';
  const CONVERSION_API_URL = process.env.EXPO_PUBLIC_CONVERSION_API_URL || 'https://libreconvert.com/convert';
  const CONVERSION_API_KEY = process.env.EXPO_PUBLIC_CONVERSION_API_KEY || '';

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      
      const ext = (selectedFile.name || '').split('.').pop()?.toLowerCase() || '';
      const officeExts = ['ppt', 'pptx', 'doc', 'docx', 'xls', 'xlsx'];

      if (CONVERSION_ENABLED && officeExts.includes(ext)) {
        if (Platform.OS === 'web') {
          try {
            setSelectedFile((s: any) => ({ ...s, converting: true }));

            const form = new FormData();
            
            const fileObj = (selectedFile as any).webFile || null;
            if (!fileObj) throw new Error('Archivo no disponible para conversión');

            form.append('file', fileObj, selectedFile.name);
            form.append('outputformat', 'pdf');

            const headers: any = {};
            if (CONVERSION_API_KEY) headers['Authorization'] = `Bearer ${CONVERSION_API_KEY}`;

            const convResp = await fetch(CONVERSION_API_URL, {
              method: 'POST',
              body: form,
              headers,
            });

            if (!convResp.ok) {
              
              
            } else {
              const convBlob = await convResp.blob();
              const newName = (selectedFile.name || '').replace(/\.[^.]+$/, '') + '.pdf';
              
              const newFile: any = {
                uri: convBlob, 
                webFile: new Blob([convBlob], { type: 'application/pdf' }),
                name: newName,
                size: (convBlob && typeof (convBlob as any).size === 'number') ? (convBlob as any).size : 0,
                mimeType: 'application/pdf',
              };

              setSelectedFile(newFile as any);
            }
          } catch (convErr) {
            
            Alert.alert('Aviso', 'No se pudo convertir a PDF; el archivo se subirá sin convertir.');
          } finally {
            setSelectedFile((s: any) => ({ ...s, converting: false }));
          }
        } else {
          
        }
      }

      
      const result = await uploadCourseContent(
        contenidoId,
        (selectedFile as any).uri || (selectedFile as any).webFile || selectedFile,
        selectedFile.name,
        selectedFile.mimeType || selectedFile.type || 'application/octet-stream'
      );

      if (result) {
        const storedName = (result as any).storedFileName;
        const originalName = (result as any).originalFileName;
        if (storedName && originalName && storedName !== originalName) {
          Alert.alert('Archivo subido', `Se guardó como: ${storedName} (original: ${originalName})`);
        } else {
          Alert.alert('Éxito', 'Archivo subido correctamente');
        }

        
        const ext = (selectedFile.name || '').split('.').pop()?.toLowerCase() || '';
        if (ext === 'ppt' || ext === 'pptx') {
          try {
            setSelectedFile((s: any) => ({ ...s, converting: true }));
            
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token || null;

            const convResp = await fetch('/api/convert', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
              },
              body: JSON.stringify({ signedUrl: result.url, path: result.path })
            });

            if (!convResp.ok) {
              const errText = await convResp.text();
              
              
              Alert.alert('Aviso', 'No se pudo convertir el archivo a PDF. Se podrá visualizar el PPTX con el visor externo.');
            } else {
              const convJson = await convResp.json();
              if (convJson?.pdfSignedUrl) {
                Alert.alert('Conversión completa', 'El archivo fue convertido a PDF y está listo para previsualizar.');
              }
            }
          } catch (convErr) {
            
            Alert.alert('Aviso', 'Hubo un error durante la conversión a PDF; se subió el archivo original.');
          } finally {
            setSelectedFile((s: any) => ({ ...s, converting: false }));
          }
        }

        onUploadComplete?.(result.url, result.path);
        setSelectedFile(null);
        reset();
        return;
      }

      
      if (error && error.toLowerCase().includes('existe') || error && error.toLowerCase().includes('already exists')) {
        Alert.alert(
          'Archivo existente',
          'El archivo ya existe en este curso. ¿Deseas reemplazarlo?',
          [
            { text: 'Cancelar', style: 'cancel' },
            {
              text: 'Reemplazar',
              onPress: async () => {
                const res2 = await uploadCourseContent(
                  contenidoId,
                  (selectedFile as any).uri || (selectedFile as any).webFile || selectedFile,
                  selectedFile.name,
                  selectedFile.mimeType || selectedFile.type || 'application/octet-stream',
                  { upsert: true }
                );

                if (res2) {
                  Alert.alert('Éxito', 'Archivo reemplazado correctamente');
                  onUploadComplete?.(res2.url, res2.path);
                  setSelectedFile(null);
                  reset();
                } else {
                  Alert.alert('Error', error || 'Error al reemplazar archivo');
                }
              }
            }
          ]
        );
        return;
      }

      if (error) {
        Alert.alert('Error', error);
      }
    } catch (err:any) {
      
      Alert.alert('Error', err.message || 'Error al subir archivo');
    }
  };

  const getFileIcon = () => {
    if (!selectedFile) return 'document-outline';
    
    if (selectedFile.mimeType?.startsWith('video/')) return 'videocam';
    if (selectedFile.mimeType?.startsWith('image/')) return 'image';
    if (selectedFile.mimeType === 'application/pdf') return 'document-text';
    return 'document';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <View style={styles.container}>
      {}
      <TouchableOpacity
        style={[styles.pickButton, selectedFile && styles.pickButtonSelected]}
        onPress={pickFile}
        disabled={uploading}
      >
        <Ionicons
          name={getFileIcon()}
          size={32}
          color={selectedFile ? '#4CAF50' : '#666'}
        />
        <Text style={styles.pickButtonText}>
          {selectedFile ? 'Cambiar archivo' : 'Seleccionar archivo'}
        </Text>
      </TouchableOpacity>

      {}
      <Text style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
        Formatos aceptados: video, PDF, imágenes, PowerPoint (.ppt, .pptx)
      </Text>

      {}
      {selectedFile && (
        <>
          { (selectedFile as any).converting && (
            <View style={{ marginTop: 8, flexDirection: 'row', alignItems: 'center' }}>
              <ActivityIndicator size="small" color="#2196F3" />
              <Text style={{ marginLeft: 8, color: '#666' }}>Convirtiendo a PDF...</Text>
            </View>
          )}

          <View style={styles.fileInfo}>
            <Text style={styles.fileName} numberOfLines={2}>
              {selectedFile.name}
            </Text>
            <Text style={styles.fileSize}>
              {formatFileSize(selectedFile.size || 0)}
            </Text>
          </View>
        </>
      )}

      {}
      {uploading && progress && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[styles.progressFill, { width: `${progress.percentage}%` }]}
            />
          </View>
          <Text style={styles.progressText}>
            {progress.percentage.toFixed(0)}%
          </Text>
        </View>
      )}

      {}
      {error && !uploading && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={20} color="#F44336" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {}
      {selectedFile && !uploading && (
        <TouchableOpacity
          style={styles.uploadButton}
          onPress={handleUpload}
        >
          <Ionicons name="cloud-upload" size={20} color="#fff" />
          <Text style={styles.uploadButtonText}>Subir archivo</Text>
        </TouchableOpacity>
      )}

      {}
      {uploading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Subiendo archivo...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pickButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 12,
    borderStyle: 'dashed',
    backgroundColor: '#f9f9f9',
  },
  pickButtonSelected: {
    borderColor: '#4CAF50',
    backgroundColor: '#f1f8f4',
  },
  pickButtonText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  fileInfo: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  fileSize: {
    fontSize: 12,
    color: '#666',
  },
  progressContainer: {
    marginTop: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2196F3',
    borderRadius: 4,
  },
  progressText: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    padding: 12,
    backgroundColor: '#ffebee',
    borderRadius: 8,
  },
  errorText: {
    marginLeft: 8,
    flex: 1,
    fontSize: 14,
    color: '#c62828',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    padding: 16,
    backgroundColor: '#2196F3',
    borderRadius: 8,
  },
  uploadButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  loadingContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
});

export default FileUploader;
