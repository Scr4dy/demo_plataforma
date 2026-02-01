import React, { useEffect, useState } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Switch, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../config/supabase';
import { useTheme } from '../../context/ThemeContext';

interface Props {
  visible: boolean;
  courseId: string;
  lessonId?: number; 
  initialModuleId?: number | null; 
  onClose: () => void;
  onSuccess: () => void;
}

const tipos = ['video','documento','evaluacion','enlace','presentacion','otro'];

const LessonFormModal: React.FC<Props> = ({ visible, courseId, lessonId, initialModuleId, onClose, onSuccess }) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);

  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [url, setUrl] = useState('');
  const [orden, setOrden] = useState('0');
  const [duracion, setDuracion] = useState('0');
  const [obligatorio, setObligatorio] = useState(true);
  const [tipo, setTipo] = useState<string>('documento');
  const [moduleId, setModuleId] = useState<number | undefined>(undefined);
  const [modules, setModules] = useState<any[]>([]);

  useEffect(() => {
    if (visible) {
      loadModules();
      if (lessonId) loadLesson();
      else { resetForm(); loadNextOrder(); if (typeof (initialModuleId) !== 'undefined') setModuleId(initialModuleId ?? undefined); }
    }
  }, [visible, lessonId, initialModuleId]);

  const resetForm = () => {
    setTitulo(''); setDescripcion(''); setUrl(''); setOrden('0'); setDuracion('0'); setObligatorio(true); setTipo('documento'); setModuleId(undefined);
  };

  const loadModules = async () => {
    try {
      const { data, error } = await supabase
        .from('modulos')
        .select('*')
        .eq('id_curso', courseId)
        .is('deleted_at', null)
        .order('orden', { ascending: true });
      if (error) throw error;
      setModules(data || []);
    } catch (err) {
      
    }
  };

  const loadNextOrder = async () => {
    try {
      const { data, error } = await supabase
        .from('contenidos')
        .select('orden')
        .eq('id_curso', courseId)
        .is('deleted_at', null)
        .order('orden', { ascending: false })
        .limit(1);
      if (error) throw error;
      if (data && data.length > 0) setOrden(String((data[0].orden||0) + 1));
      else setOrden('1');
    } catch (err) { setOrden('1'); }
  };

  const loadLesson = async () => {
    if (!lessonId) return;
    try {
      setLoading(true);
      const { data, error } = await supabase.from('contenidos').select('*').eq('id_contenido', lessonId).single();
      if (error) throw error;
      if (data) {
        setTitulo(data.titulo || '');
        setDescripcion(data.descripcion || '');
        setUrl(data.url || '');
        setOrden(String(data.orden || 0));
        setDuracion(String(data.duracion_estimada || 0));
        setObligatorio(data.obligatorio !== false);
        setTipo(data.tipo || 'documento');
        setModuleId(data.id_modulo || undefined);
      }
    } catch (err:any) {
      
      Alert.alert('Error', 'No se pudo cargar la lección');
    } finally { setLoading(false); }
  };

  const handleSave = async () => {
    if (!titulo || titulo.trim().length === 0) { Alert.alert('Error', 'El título es obligatorio'); return; }
    if ((titulo || '').trim().length > 250) { Alert.alert('Error', 'El título no puede exceder 250 caracteres'); return; }
    const ordenNum = parseInt(orden) || 0;
    const durNum = parseInt(duracion) || 0;

    try {
      setLoading(true);
      const payload: any = {
        id_curso: parseInt(courseId),
        id_modulo: moduleId || null,
        titulo: (titulo||'').trim(),
        descripcion: (descripcion||'').trim() || null,
        url: (url||'').trim() || null,
        orden: ordenNum,
        duracion_estimada: durNum,
        obligatorio: obligatorio,
        tipo: tipo,
      };

      if (lessonId) {
        const { error } = await supabase.from('contenidos').update(payload).eq('id_contenido', lessonId);
        if (error) throw error;
        Alert.alert('Éxito', 'Lección actualizada correctamente');
      } else {
        const { error } = await supabase.from('contenidos').insert([payload]);
        if (error) throw error;
        Alert.alert('Éxito', 'Lección creada correctamente');
      }

      onSuccess(); onClose();
    } catch (err:any) {
      
      Alert.alert('Error', err.message || 'No se pudo guardar la lección');
    } finally { setLoading(false); }
  };

  const isDark = theme.dark;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: theme.colors.card }]}> 
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.text }]}>{lessonId ? 'Editar Lección' : 'Crear Lección'}</Text>
            <TouchableOpacity onPress={onClose} disabled={loading}><Ionicons name="close" size={24} color={theme.colors.text} /></TouchableOpacity>
          </View>

          <ScrollView style={styles.form}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Título *</Text>
            <TextInput style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text, borderColor: theme.colors.border }]} value={titulo} onChangeText={setTitulo} placeholder="Ej: Introducción" placeholderTextColor={isDark ? '#777' : '#999'} maxLength={250} editable={!loading} />

            <Text style={[styles.label, { color: theme.colors.text }]}>Descripción</Text>
            <TextInput style={[styles.input, styles.textArea, { backgroundColor: theme.colors.background, color: theme.colors.text, borderColor: theme.colors.border }]} value={descripcion} onChangeText={setDescripcion} placeholder="Descripción..." placeholderTextColor={isDark ? '#777' : '#999'} multiline numberOfLines={4} textAlignVertical="top" editable={!loading} />

            <Text style={[styles.label, { color: theme.colors.text }]}>URL</Text>
            <TextInput style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text, borderColor: theme.colors.border }]} value={url} onChangeText={setUrl} placeholder="https://..." placeholderTextColor={isDark ? '#777' : '#999'} editable={!loading} />

            <Text style={[styles.label, { color: theme.colors.text }]}>Módulo</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
              {modules.map(m => (
                <TouchableOpacity key={m.id_modulo} onPress={() => setModuleId(m.id_modulo)} style={[styles.moduleChip, { borderColor: moduleId === m.id_modulo ? theme.colors.primary : theme.colors.border, backgroundColor: moduleId === m.id_modulo ? (Platform.OS === 'web' ? '#eef' : theme.colors.background) : 'transparent' }]}>
                  <Text style={{ color: theme.colors.text }}>{m.titulo}</Text>
                </TouchableOpacity>
              ))}
              {modules.length === 0 && <Text style={{ color: theme.colors.textSecondary }}>No hay módulos para este curso</Text>}
            </View>

            <Text style={[styles.label, { color: theme.colors.text }]}>Tipo</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
              {tipos.map(t => (
                <TouchableOpacity key={t} onPress={() => setTipo(t)} style={[styles.tipoChip, { borderColor: tipo === t ? theme.colors.primary : theme.colors.border }]}>
                  <Text style={{ color: theme.colors.text }}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.label, { color: theme.colors.text }]}>Orden</Text>
            <TextInput style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text, borderColor: theme.colors.border }]} value={orden} onChangeText={setOrden} placeholder="0" keyboardType="numeric" editable={!loading} />

            <Text style={[styles.label, { color: theme.colors.text }]}>Duración Estimada (min)</Text>
            <TextInput style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text, borderColor: theme.colors.border }]} value={duracion} onChangeText={setDuracion} placeholder="0" keyboardType="numeric" editable={!loading} />

            <View style={styles.switchContainer}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.label, { color: theme.colors.text }]}>Obligatorio</Text>
                <Text style={[styles.hint, { color: theme.colors.textSecondary }]}>Indica si la lección es obligatoria</Text>
              </View>
              <Switch value={obligatorio} onValueChange={setObligatorio} disabled={loading} />
            </View>

            <View style={{ height: 12 }} />

            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity style={[styles.saveBtn, { backgroundColor: theme.colors.primary }]} onPress={handleSave} disabled={loading}>
                <Text style={{ color: theme.colors.card, fontWeight: '700' }}>{lessonId ? 'Guardar' : 'Crear'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.cancelBtn]} onPress={onClose} disabled={loading}><Text style={{ fontWeight: '700' }}>Cancelar</Text></TouchableOpacity>
            </View>

          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center' },
  container: { width: '90%', maxWidth: 800, borderRadius: 12, overflow: 'hidden' },
  header: { padding: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1 },
  title: { fontSize: 18, fontWeight: '700' },
  form: { padding: 12, maxHeight: 640 },
  label: { fontSize: 13, fontWeight: '700', marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 8, padding: 10, marginBottom: 8 },
  textArea: { minHeight: 100 },
  switchContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  hint: { fontSize: 12, marginTop: 2 },
  saveBtn: { padding: 12, borderRadius: 8 },
  cancelBtn: { padding: 12, borderRadius: 8, borderWidth: 1 },
  moduleChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
  tipoChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
});

export default LessonFormModal;
