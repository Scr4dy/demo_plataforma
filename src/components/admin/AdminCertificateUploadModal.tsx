import React, { useEffect, useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Platform, TextInput, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useStorageUpload } from '../../hooks/useStorageUpload';
import { certificateService } from '../../services/certificateService';
import { categoryService } from '../../services/categoryService';
import { supabase } from '../../config/supabase';

interface Props {
  visible: boolean;
  courseId: number | string;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AdminCertificateUploadModal({ visible, courseId, onClose, onSuccess }: Props) {
  const { theme, colors } = useTheme();
  const { uploadCertificate, uploading, progress, error, reset } = useStorageUpload();
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [completions, setCompletions] = useState<any[]>([]);
  const [loadingCompletions, setLoadingCompletions] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [manualUserId, setManualUserId] = useState<string>('');
  const [localUploading, setLocalUploading] = useState(false);

  useEffect(() => {
    if (!visible) return;
    fetchCompletions();
    setSelectedFile(null);
    setSelectedUserId(null);
    setManualUserId('');
    reset();
  }, [visible]);

  const fetchCompletions = async () => {
    setLoadingCompletions(true);
    try {
      const list = await categoryService.getCompletionsForCourse(String(courseId));
      setCompletions(list || []);
    } catch (err) {
      
      setCompletions([]);
    } finally {
      setLoadingCompletions(false);
    }
  };

  const pickFile = async () => {
    try {
      if (Platform.OS === 'web') {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.pdf,application/pdf';
        input.onchange = (e: any) => {
          const f = e.target.files && e.target.files[0];
          if (!f) return;
          setSelectedFile({ webFile: f, name: f.name, size: f.size, mimeType: f.type, uri: f });
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
        Alert.alert('Dependencia faltante', 'Para seleccionar archivos instala: expo install expo-document-picker');
        return;
      }

      const result = await DocumentPickerModule.getDocumentAsync({ type: 'application/pdf', copyToCacheDirectory: true });
      if (result.type === 'cancel') return;
      const file = (result.assets && result.assets[0]) || result;
      setSelectedFile(file);
    } catch (err) {
      
      Alert.alert('Error', 'No se pudo seleccionar el archivo');
    }
  };

  const handleUpload = async () => {
    try {
      
      let userId: number | null = selectedUserId || null;
      if (!userId && manualUserId) {
        
        const manualNumeric = Number(manualUserId);
        if (Number.isInteger(manualNumeric) && manualNumeric > 0) {
          const { data: byId } = await supabase.from('usuarios').select('id_usuario').eq('id_usuario', manualNumeric).maybeSingle();
          if (byId) userId = byId.id_usuario;
        }

        
        if (!userId) {
          const { data: byEmpleado } = await supabase.from('usuarios').select('id_usuario').eq('numero_empleado', manualUserId).maybeSingle();
          if (byEmpleado) userId = byEmpleado.id_usuario;
        }

        
        if (!userId) {
          const { data: byControl } = await supabase.from('usuarios').select('id_usuario').eq('numero_control', manualUserId).maybeSingle();
          if (byControl) userId = byControl.id_usuario;
        }
      }

      if (!userId) {
        Alert.alert('Usuario requerido', 'Selecciona un usuario completado o ingresa su ID / número de empleado / número de control');
        return;
      }
      if (!selectedFile) {
        Alert.alert('Archivo requerido', 'Selecciona el PDF del certificado a subir');
        return;
      }

      setLocalUploading(true);

      
      let arrayBuffer: ArrayBuffer | null = null;

      if (Platform.OS === 'web') {
        const fileObj = selectedFile.webFile || (selectedFile.uri instanceof File ? selectedFile.uri : null);
        if (fileObj) {
          arrayBuffer = await fileObj.arrayBuffer();
        } else {
          
          const resp = await fetch(selectedFile.uri);
          arrayBuffer = await resp.arrayBuffer();
        }
      } else {
        
        try {
          const resp = await fetch(selectedFile.uri);
          arrayBuffer = await resp.arrayBuffer();
        } catch (err) {
          
          
          throw err;
        }
      }

      if (!arrayBuffer) throw new Error('No se pudo leer el archivo');

      const res = await uploadCertificate(userId, Number(courseId), arrayBuffer);
      if (!res) throw new Error('Upload failed');

      
      const createResult = await certificateService.createCertificate({
        userId,
        courseId: Number(courseId),
        path: res.path,
        url: res.url,
        titulo: `Certificado - Curso ${courseId}`,
        fechaEmision: new Date().toISOString()
      });

      if (createResult) {
        Alert.alert('Éxito', 'Certificado subido y registrado correctamente');
        onSuccess && onSuccess();
        onClose();
      } else {
        Alert.alert('Advertencia', 'Certificado subido pero no se pudo registrar en el sistema (modo demo o API no disponible)');
        onSuccess && onSuccess();
        onClose();
      }

    } catch (err: any) {
      
      Alert.alert('Error', err?.message || 'No se pudo subir el certificado');
    } finally {
      setLocalUploading(false);
      reset();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} transparent>
      <View style={styles.backdrop}>
        <View style={[styles.modal, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Subir Certificado</Text>
          <Text style={{ color: theme.colors.textSecondary, marginBottom: 8 }}>Curso: {courseId}</Text>

          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Seleccionar usuario (completaciones)</Text>
          {loadingCompletions ? (
            <ActivityIndicator />
          ) : (
            <ScrollView style={{ maxHeight: 140, marginBottom: 8 }}>
              {completions.length === 0 && <Text style={{ color: theme.colors.textSecondary }}>No se encontraron completaciones para este curso</Text>}
              {completions.map((c) => {
                const u = c.usuario || {};
                const fullName = `${u.nombre || ''} ${u.apellido_paterno || ''} ${u.apellido_materno || ''}`.trim() || u.email || `Usuario ${c.usuario_id}`;
                return (
                  <TouchableOpacity
                    key={`${c.usuario_id}-${c.fecha_completacion}`}
                    style={[
                      styles.userRow,
                      selectedUserId === Number(c.usuario_id) && {
                        backgroundColor: `${colors.primary}15`,
                        borderColor: colors.primary
                      }
                    ]}
                    onPress={() => {
                      setSelectedUserId(Number(c.usuario_id));
                      setManualUserId(''); 
                    }}
                  >
                    <View>
                      <Text style={{ color: theme.colors.text, fontWeight: '600' }}>{fullName}</Text>
                      {u.numero_empleado && <Text style={{ color: theme.colors.textSecondary, fontSize: 11 }}>Empleado: {u.numero_empleado}</Text>}
                    </View>
                    <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>{new Date(c.fecha_completacion).toLocaleDateString()}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}

          <Text style={[styles.label, { color: theme.colors.textSecondary, marginTop: 12 }]}>Archivo (PDF)</Text>
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 8 }}>
            <TouchableOpacity style={[styles.pickBtn, { backgroundColor: colors.primary }]} onPress={pickFile} accessibilityLabel="Seleccionar PDF de certificado">
              <Ionicons name="document-text" size={18} color="#fff" />
              <Text style={{ color: '#fff', marginLeft: 8 }}>Seleccionar PDF</Text>
            </TouchableOpacity>
            {selectedFile && <Text style={{ color: theme.colors.textSecondary, maxWidth: 200 }}>{selectedFile.name || selectedFile.uri?.split('/')?.pop()}</Text>}
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8 }}>
            <TouchableOpacity style={[styles.btn, { backgroundColor: theme.colors.border }]} onPress={onClose} accessibilityRole="button"><Text style={{ color: theme.colors.text }}>Cancelar</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={handleUpload} accessibilityRole="button">
              {localUploading || uploading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={{ color: '#fff' }}>Subir y registrar</Text>
              )}
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modal: { width: '100%', maxWidth: 720, borderRadius: 12, padding: 16, borderWidth: 1 },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 6 },
  label: { fontSize: 13, marginBottom: 6 },
  userRow: { padding: 10, borderRadius: 8, marginBottom: 6, borderWidth: 1, borderColor: 'transparent', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pickBtn: { padding: 10, borderRadius: 8, flexDirection: 'row', alignItems: 'center' },
  btn: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8 },
  input: { borderWidth: 1, borderRadius: 8, padding: 8 }
});
