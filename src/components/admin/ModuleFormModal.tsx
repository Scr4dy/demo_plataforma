import React, { useEffect, useState } from 'react';
import {
  View, Text, Modal, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Switch
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../config/supabase';
import { useTheme } from '../../context/ThemeContext';

interface Props {
  visible: boolean;
  courseId: string;
  moduleId?: number; 
  onClose: () => void;
  onSuccess: () => void;
}

export const ModuleFormModal: React.FC<Props> = ({ visible, courseId, moduleId, onClose, onSuccess }) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  
  
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [orden, setOrden] = useState('0');
  const [duracionEstimada, setDuracionEstimada] = useState('0');
  const [obligatorio, setObligatorio] = useState(true);

  useEffect(() => {
    if (visible) {
      if (moduleId) {
        loadModule();
      } else {
        resetForm();
        loadNextOrder();
      }
    }
  }, [visible, moduleId]);

  const resetForm = () => {
    setTitulo('');
    setDescripcion('');
    setOrden('0');
    setDuracionEstimada('0');
    setObligatorio(true);
  };

  const loadNextOrder = async () => {
    try {
      const { data, error } = await supabase
        .from('modulos')
        .select('orden')
        .eq('id_curso', courseId)
        .is('deleted_at', null)
        .order('orden', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        const maxOrden = data[0].orden || 0;
        setOrden(String(maxOrden + 1));
      } else {
        setOrden('1');
      }
    } catch (err) {
      
      setOrden('1');
    }
  };

  const loadModule = async () => {
    if (!moduleId) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('modulos')
        .select('*')
        .eq('id_modulo', moduleId)
        .single();

      if (error) throw error;

      if (data) {
        setTitulo(data.titulo || '');
        setDescripcion(data.descripcion || '');
        setOrden(String(data.orden || 0));
        setDuracionEstimada(String(data.duracion_estimada || 0));
        setObligatorio(data.obligatorio !== false);
      }
    } catch (err: any) {
      
      Alert.alert('Error', 'No se pudo cargar el módulo');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    
    if (!titulo || titulo.trim().length === 0) {
      Alert.alert('Error', 'El título es obligatorio');
      return;
    }

    if (titulo.trim().length > 150) {
      Alert.alert('Error', 'El título no puede exceder 150 caracteres');
      return;
    }

    const ordenNum = parseInt(orden) || 0;
    if (ordenNum < 0) {
      Alert.alert('Error', 'El orden debe ser mayor o igual a 0');
      return;
    }

    const duracionNum = parseInt(duracionEstimada) || 0;
    if (duracionNum < 0) {
      Alert.alert('Error', 'La duración debe ser mayor o igual a 0');
      return;
    }

    try {
      setLoading(true);

      const payload = {
        id_curso: parseInt(courseId),
        titulo: titulo.trim(),
        descripcion: descripcion.trim() || null,
        orden: ordenNum,
        duracion_estimada: duracionNum,
        obligatorio: obligatorio,
      };

      if (moduleId) {
        
        const { error } = await supabase
          .from('modulos')
          .update(payload)
          .eq('id_modulo', moduleId);

        if (error) throw error;
      } else {
        
        const { error } = await supabase
          .from('modulos')
          .insert([payload]);

        if (error) throw error;
      }

      
      setLoading(false);
      onClose();
      
      
      setTimeout(() => {
        onSuccess();
      }, 50);
      
    } catch (err: any) {
      
      Alert.alert('Error', err.message || 'No se pudo guardar el módulo');
    } finally {
      setLoading(false);
    }
  };

  const isDark = theme.dark;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
<View style={[styles.container, { backgroundColor: theme.colors.card }]}> 
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              {moduleId ? 'Editar Módulo' : 'Crear Módulo'}
            </Text>
            <TouchableOpacity onPress={onClose} disabled={loading}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.form}
            contentContainerStyle={styles.formContent}
            showsVerticalScrollIndicator={true}
          >
            {}
            <Text style={[styles.label, { color: theme.colors.text }]}>Título *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text, borderColor: theme.colors.border }]}
              value={titulo}
              onChangeText={setTitulo}
              placeholder="Ej: Introducción al curso"
              placeholderTextColor={isDark ? '#777' : '#999'}
              maxLength={150}
              editable={!loading}
            />

            {}
            {!moduleId && (
              <Text style={[styles.hint, { color: theme.colors.textSecondary, marginTop: 8 }]}>Se creará un nuevo módulo asociado a este curso.</Text>
            )}

            {}

            {}
            <Text style={[styles.label, { color: theme.colors.text }]}>Descripción</Text>
            <TextInput
              style={[styles.input, styles.textArea, { backgroundColor: theme.colors.background, color: theme.colors.text, borderColor: theme.colors.border }]}
              value={descripcion}
              onChangeText={setDescripcion}
              placeholder="Descripción detallada del módulo..."
              placeholderTextColor={isDark ? '#777' : '#999'}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              editable={!loading}
            />

            {}
            <Text style={[styles.label, { color: theme.colors.text }]}>Orden</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text, borderColor: theme.colors.border }]}
              value={orden}
              onChangeText={setOrden}
              placeholder="0"
              placeholderTextColor={isDark ? '#777' : '#999'}
              keyboardType="numeric"
              editable={!loading}
            />
<Text style={[styles.hint, { color: theme.colors.textSecondary }]}> 
              Orden de aparición del módulo en el curso
            </Text>

            {}
            <Text style={[styles.label, { color: theme.colors.text }]}>Duración Estimada (minutos)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text, borderColor: theme.colors.border }]}
              value={duracionEstimada}
              onChangeText={setDuracionEstimada}
              placeholder="0"
              placeholderTextColor={isDark ? '#777' : '#999'}
              keyboardType="numeric"
              editable={!loading}
            />
            <Text style={[styles.hint, { color: theme.colors.textSecondary }]}> 
              Tiempo estimado para completar el módulo
            </Text>

            {}
            <View style={styles.switchContainer}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.label, { color: theme.colors.text }]}>Obligatorio</Text>
                <Text style={[styles.hint, { color: theme.colors.textSecondary, marginTop: 4 }]}> 
                  ¿El empleado debe completar este módulo?
                </Text>
              </View>
              <Switch
                value={obligatorio}
                onValueChange={setObligatorio}
                disabled={loading}
                trackColor={{ false: '#767577', true: '#81b0ff' }}
                thumbColor={obligatorio ? '#2196F3' : '#f4f3f4'}
              />
            </View>

            <View style={{ height: 20 }} />

            {}
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton, { backgroundColor: theme.colors.border }]} 
                onPress={onClose}
                disabled={loading}
              >
                <Text style={[styles.buttonText, { color: theme.colors.text }]}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.button, styles.saveButton, { backgroundColor: theme.colors.primary, opacity: loading ? 0.6 : 1 }]} 
                onPress={handleSave}
                disabled={loading}
              >
                <Text style={[styles.buttonText, { color: theme.colors.card }]}>
                  {loading ? 'Guardando...' : (moduleId ? 'Actualizar' : 'Crear')}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 600,
    borderRadius: 12,
    padding: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  form: {
    maxHeight: 500,
  },
  formContent: {
    paddingBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    fontSize: 15,
    minHeight: 48,
  },
  textArea: {
    height: 100,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  hint: {
    fontSize: 13,
    marginTop: 6,
    marginBottom: 4,
    fontStyle: 'italic',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 24,
    marginBottom: 8,
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  cancelButton: {
    backgroundColor: '#E5E7EB',
  },
  saveButton: {
    
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ModuleFormModal;