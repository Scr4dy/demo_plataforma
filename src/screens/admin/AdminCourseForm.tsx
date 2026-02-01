import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView, useWindowDimensions, Platform } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { userService } from '../../services/userService';
import { categoryService } from '../../services/categoryService';

interface Props {
  initialData?: any;
  onSave?: (data: any) => Promise<void>;
}

const AdminCourseForm: React.FC<Props> = ({ initialData = null, onSave }) => {
  const { theme, colors } = useTheme();
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const [titulo, setTitulo] = useState(initialData?.titulo || '');
  const [descripcion, setDescripcion] = useState(initialData?.descripcion || '');
  const [idInstructor, setIdInstructor] = useState<string | undefined>(initialData?.id_instructor ? String(initialData.id_instructor) : undefined);
  const [instructors, setInstructors] = useState<Array<{ id: string; name: string }>>([]);
  const [showInstructorPicker, setShowInstructorPicker] = useState(false);
  const [duracion, setDuracion] = useState(String(initialData?.duracion || initialData?.duracion_horas || ''));
  
  const [activo, setActivo] = useState(initialData?.activo !== false);
  const [fechaInicio, setFechaInicio] = useState(initialData?.fecha_inicio || '');
  const [fechaFin, setFechaFin] = useState(initialData?.fecha_fin || '');
  const [loading, setLoading] = useState(false);

  
  const [idCategoria, setIdCategoria] = useState<string | undefined>(initialData?.id_categoria ? String(initialData.id_categoria) : undefined);
  const [categories, setCategories] = useState<any[]>([]);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  useEffect(() => {
    
    (async () => {
      try {
        const [instructorsList, categoriesList] = await Promise.all([
          userService.getInstructors(['Instructor']),
          categoryService.getCategorias()
        ]);
        setInstructors(instructorsList.map(i => ({ id: i.id, name: i.name })));
        setCategories(categoriesList);
      } catch (err) {
        
      }
    })();
  }, []);

  const isValid = useMemo(() => titulo.trim().length > 0, [titulo]);

  

  const handleSubmit = async () => {
    if (!isValid) return Alert.alert('Validación', 'El título es requerido');
    
    const payload: any = {
      titulo: titulo.trim(),
      descripcion: descripcion.trim(),
      id_instructor: idInstructor ? parseInt(idInstructor) : undefined,
      duracion: duracion ? parseInt(duracion) : 0, 
      id_categoria: idCategoria ? parseInt(idCategoria) : null,
      activo: activo, 
      fecha_inicio: fechaInicio || null,
      fecha_fin: fechaFin || null,
      metadata: {},
    };

    setLoading(true);
    try {
      if (onSave) {
        await onSave(payload);
      }
      Alert.alert('Éxito', 'Curso guardado');
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'No se pudo guardar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={[
      styles.container, 
      { backgroundColor: theme.colors.background },
      isDesktop && { maxWidth: 800, alignSelf: 'center', width: '100%' }
    ]}>
      <View style={styles.field}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Título</Text>
        <TextInput
          value={titulo}
          onChangeText={setTitulo}
          style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.text }]}
          placeholder="Nombre del curso"
          placeholderTextColor={theme.dark ? '#777' : '#999'}
        />
      </View>

      <View style={styles.field}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Descripción</Text>
        <TextInput
          value={descripcion}
          onChangeText={setDescripcion}
          style={[styles.input, { height: 120, textAlignVertical: 'top', backgroundColor: theme.colors.card, color: theme.colors.text }]}
          placeholder="Descripción breve"
          placeholderTextColor={theme.dark ? '#777' : '#999'}
          multiline
        />
      </View>

      <View style={styles.field}>
        <Text style={[styles.label, { color: theme.colors.text }]}>ID Instructor</Text>
        <TouchableOpacity style={[styles.input, { backgroundColor: theme.colors.card }]} onPress={() => setShowInstructorPicker(s => !s)}>
          <Text style={{ color: theme.colors.text }}>{idInstructor || 'Seleccionar instructor'}</Text>
        </TouchableOpacity>
        {showInstructorPicker && (
          <View style={{ borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 6, overflow: 'hidden', marginTop: 6 }}>
            <ScrollView>
              {instructors.map(i => (
                <TouchableOpacity key={i.id} style={{ padding: 8 }} onPress={() => { setIdInstructor(i.id); setShowInstructorPicker(false); }}>
                  <Text style={{ color: theme.colors.text }}>{i.name} (ID: {i.id})</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      <View style={styles.field}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Duración (horas)</Text>
        <TextInput
          value={duracion}
          onChangeText={setDuracion}
          keyboardType="numeric"
          style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.text }]}
          placeholder="Ej: 40"
          placeholderTextColor={theme.dark ? '#777' : '#999'}
        />
      </View>

  

      <View style={styles.field}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Categoría</Text>
        <TouchableOpacity style={[styles.input, { backgroundColor: theme.colors.card }]} onPress={() => setShowCategoryPicker(s => !s)}>
          <Text style={{ color: theme.colors.text }}>
            {categories.find(c => String(c.id) === idCategoria)?.nombre || 'Seleccionar categoría'}
          </Text>
        </TouchableOpacity>
        {showCategoryPicker && (
          <View style={{ borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 6, overflow: 'hidden', marginTop: 6, maxHeight: 200 }}>
            <ScrollView nestedScrollEnabled>
              {categories.map(c => (
                <TouchableOpacity key={c.id} style={{ padding: 12, borderBottomWidth: 1, borderBottomColor: theme.dark ? '#333' : '#f0f0f0' }} onPress={() => { setIdCategoria(String(c.id)); setShowCategoryPicker(false); }}>
                  <Text style={{ color: theme.colors.text }}>{c.nombre}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      <View style={styles.field}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Fecha Inicio</Text>
        <TextInput
          value={fechaInicio}
          onChangeText={setFechaInicio}
          style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.text }]}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={theme.dark ? '#777' : '#999'}
        />
      </View>

      <View style={styles.field}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Fecha Fin</Text>
        <TextInput
          value={fechaFin}
          onChangeText={setFechaFin}
          style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.text }]}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={theme.dark ? '#777' : '#999'}
        />
      </View>

      <View style={styles.field}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Activo</Text>
        <TouchableOpacity onPress={() => setActivo(a => !a)} style={[styles.checkbox, { backgroundColor: activo ? colors.primary : theme.colors.card }]}> 
          <Text style={{ color: '#fff' }}>{activo ? 'Sí' : 'No'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={[styles.saveButton, { opacity: !isValid || loading ? 0.6 : 1, backgroundColor: colors.primary }]} onPress={handleSubmit} disabled={!isValid || loading}>
          <Text style={[styles.saveText]}>Guardar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16 },
  field: { marginBottom: 12 },
  label: { fontWeight: '600', marginBottom: 6 },
  input: { padding: 10, borderRadius: 8 },
  checkbox: { padding: 8, borderRadius: 6, width: 64, alignItems: 'center' },
  actions: { marginTop: 16 },
  saveButton: { padding: 12, borderRadius: 8, alignItems: 'center' },
  saveText: { color: '#fff', fontWeight: '600' }
});

export default AdminCourseForm;