import React, { useEffect, useState } from 'react';
import {
  View, Text, Modal, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { adminCourseService } from '../../services/adminCourseService';
import { userService } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { categoryService, Categoria } from '../../services/categoryService';

interface Props {
  visible: boolean;
  courseId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const CourseFormModal: React.FC<Props> = ({ visible, courseId, onClose, onSuccess }) => {
  const { state, isInstructor } = useAuth();
  const { theme, colors } = useTheme();
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [form, setForm] = useState<any>({ titulo: '', descripcion: '', duracion_horas: 1, activo: true, id_instructor: undefined, instructor: '', categoria: '', id_categoria: undefined, fecha_inicio: '', fecha_fin: '' });
  const [instructors, setInstructors] = useState<Array<{ id: string; name: string }>>([]);
  const [showInstructorPicker, setShowInstructorPicker] = useState(false);
  const [categories, setCategories] = useState<Categoria[]>([]);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const startInputRef = React.useRef<any>(null);
  const endInputRef = React.useRef<any>(null);
  const startInputIdRef = React.useRef(`mp_fecha_inicio_${Math.random().toString(36).slice(2,9)}`);
  const endInputIdRef = React.useRef(`mp_fecha_fin_${Math.random().toString(36).slice(2,9)}`);

  

  
  
  

  
  React.useEffect(() => {
    if (Platform.OS !== 'web') return;
    if (document.getElementById('mp-date-input-style')) return;
    const style = document.createElement('style');
    style.id = 'mp-date-input-style';
    style.innerHTML = `
      /* Base input styles */
      .mp-date-input { -webkit-appearance: none; appearance: none; -moz-appearance: textfield; padding: 8px; }

      /* WebKit browsers (Chrome, Safari, Edge) - hide calendar icon */
      .mp-date-input::-webkit-calendar-picker-indicator { display: none !important; -webkit-appearance: none !important; opacity: 0; pointer-events: none; }
      .mp-date-input::-webkit-clear-button { display: none !important; }
      .mp-date-input::-webkit-inner-spin-button { display: none !important; }

      /* Internet Explorer / old Edge */
      .mp-date-input::-ms-clear { display: none !important; }
      .mp-date-input::-ms-expand { display: none !important; }

      /* Firefox attempt - hide built-in picker styling */
      .mp-date-input { -moz-appearance: textfield; }
      .mp-date-input::-moz-focus-inner { border: 0; }

      /* Wrapper and icon */
      .mp-date-wrapper { display: flex; align-items: center; border-width: 1px; border-style: solid; border-radius: 6px; padding: 6px; }
    `;
    document.head.appendChild(style);
  }, []);

  useEffect(() => {
    if (courseId) loadCourse();
    else setForm({ titulo: '', descripcion: '', duracion_horas: 1, activo: true, id_instructor: undefined, instructor: '', categoria: '', id_categoria: undefined, fecha_inicio: '', fecha_fin: '' });
    
    (async () => {
      try {
        
        const list = await userService.getInstructors(['Instructor']);
        setInstructors(list.map(i => ({ id: i.id, name: i.name })));
        
        
        const cats = await categoryService.getCategorias();
        setCategories(cats);
      } catch (err) {
        
      }
    })();
  }, [courseId]);

  const loadCourse = async () => {
    try {
      setLoading(true);
      const curso = await adminCourseService.getById(courseId as string);
      if (curso) {
        
        let instructorName = curso.instructor || '';
        if (curso.id_instructor && !instructorName) {
          const inst = instructors.find(i => i.id === String(curso.id_instructor));
          if (inst) instructorName = inst.name;
        }
        
        
        const durationHours = curso.duracion ? Math.round(curso.duracion / 60) : 1;
        
        
        let categoryName = curso.categoria || '';
        if (curso.id_categoria && categories.length > 0) {
          const cat = categories.find(c => String(c.id) === String(curso.id_categoria));
          if (cat) categoryName = cat.nombre;
        }
        
        setForm({ 
          ...curso, 
          instructor: instructorName,
          duracion_horas: durationHours,
          categoria: categoryName
        });
      }
    } catch (err: any) {
      Alert.alert('Error', 'No se pudo cargar el curso');
    } finally { setLoading(false); }
  };

  
  const instructorOwns = Boolean(courseId && state.user && form.id_instructor && Number(form.id_instructor) === Number(state.user?.id_usuario));
  const disableInstructorChange = Boolean(isInstructor && instructorOwns);

  const handleSave = async () => {
    if (!form.titulo || form.titulo.trim().length === 0) {
      Alert.alert('Error', 'El título es obligatorio');
      return;
    }
    try {
      setLoading(true);
      setFormError(null);
      
      const hours = Number(form.duracion_horas) || 0;
      
      let finalInstructorId = form.id_instructor ? Number(form.id_instructor) : null;
      if (isInstructor && courseId && Number(form.id_instructor) === Number(state.user?.id_usuario)) {
        finalInstructorId = Number(state.user?.id_usuario);
      }

      const payload = {
        titulo: form.titulo,
        descripcion: form.descripcion,
        
        duracion: Math.round(hours * 60),
        activo: !!form.activo,
        id_instructor: finalInstructorId,
        
        id_categoria: form.id_categoria ? Number(form.id_categoria) : null,
        fecha_inicio: form.fecha_inicio || null,
        fecha_fin: form.fecha_fin || null,
        
      };
      
      const attemptSave = async (pld: any) => {
        let attemptPayload = { ...pld };
        for (let i = 0; i < 5; i++) {
          try {
            if (courseId) {
              await adminCourseService.update(courseId, attemptPayload);
              return;
            } else {
              await adminCourseService.create(attemptPayload);
              return;
            }
          } catch (e: any) {
            const raw = JSON.stringify(e);
            
            const m = /Could find the '([^']+)' column of '([^']+)' in the schema cache|Could not find the '([^']+)' column of '([^']+)' in the schema cache/i.exec(e?.message || raw);
            const missing = m && (m[1] || m[3]);
            if (missing) {
              
              delete attemptPayload[missing];
              continue; 
            }
            throw e;
          }
        }
        throw new Error('Reintento fallido tras eliminar columnas desconocidas');
      };

      await attemptSave(payload);
      Alert.alert('Éxito', courseId ? 'Curso actualizado' : 'Curso creado');
      onSuccess();
      onClose();
    } catch (err: any) {
      
      const raw = JSON.stringify(err);
      const composed = err?.message || String(err);
      
      if (/permission|policy|rls/i.test(raw) || /not permitted/i.test(composed)) {
        setFormError(`No tienes permisos para crear cursos desde el cliente. Detalles: ${composed}\n\nRAW: ${raw}`);
      } else if (/constraint|violates/i.test(composed) || /constraint/i.test(raw)) {
        setFormError(`Error al crear curso: ${composed}\n\nRAW: ${raw}`);
      } else {
        setFormError(`Error guardando curso: ${composed}\n\nRAW: ${raw}`);
      }
    } finally { setLoading(false); }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }] }>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.text }]}>{courseId ? 'Editar Curso' : 'Crear Curso'}</Text>
            <TouchableOpacity onPress={onClose}><Ionicons name="close" size={20} color={theme.colors.textSecondary} /></TouchableOpacity>
          </View>
          <ScrollView style={styles.form}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Título</Text>
            <TextInput style={[styles.input, { backgroundColor: theme.colors.card, borderColor: theme.colors.border, color: theme.colors.text }]} value={form.titulo} onChangeText={t => setForm({ ...form, titulo: t })} />
            <Text style={[styles.label, { color: theme.colors.text }]}>Descripción</Text>
            <TextInput style={[styles.input, { height: 120, backgroundColor: theme.colors.card, borderColor: theme.colors.border, color: theme.colors.text }]} value={form.descripcion} multiline onChangeText={t => setForm({ ...form, descripcion: t })} />
            <Text style={[styles.label, { color: theme.colors.text }]}>Duración (horas)</Text>
            <TextInput style={[styles.input, { backgroundColor: theme.colors.card, borderColor: theme.colors.border, color: theme.colors.text }]} value={String(form.duracion_horas)} keyboardType="numeric" onChangeText={t => setForm({ ...form, duracion_horas: Number(t) || 0 })} />
            <Text style={[styles.label, { color: theme.colors.text }]}>Categoría</Text>
            <TouchableOpacity
              style={[styles.input, { justifyContent: 'center', backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
              onPress={() => setShowCategoryPicker(s => !s)}
              accessibilityLabel="Seleccionar categoría"
            >
              <Text style={{ color: form.categoria ? theme.colors.text : theme.colors.textSecondary }}>{form.categoria || 'Seleccionar categoría'}</Text>
            </TouchableOpacity>
            {showCategoryPicker && (
               <View style={{ maxHeight: 200, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 6, overflow: 'hidden', marginBottom: 8 }}>
                <ScrollView nestedScrollEnabled>
                  {categories.map(cat => (
                    <TouchableOpacity key={cat.id} style={{ padding: 8 }} onPress={() => { setForm({ ...form, categoria: cat.nombre, id_categoria: cat.id }); setShowCategoryPicker(false); }}>
                      <Text style={{ color: theme.colors.text }}>{cat.nombre}</Text>
                    </TouchableOpacity>
                  ))}
                  {categories.length === 0 && (
                     <Text style={{ padding: 8, color: theme.colors.textSecondary }}>No hay categorías disponibles</Text>
                  )}
                </ScrollView>
              </View>
            )}
            <Text style={[styles.label, { color: theme.colors.text }]}>Instructor</Text>
            <TouchableOpacity
              style={[styles.input, { justifyContent: 'center', backgroundColor: theme.colors.card, borderColor: theme.colors.border, opacity: disableInstructorChange ? 0.6 : 1 }]}
              onPress={() => {
                if (disableInstructorChange) {
                  Alert.alert('No permitido', 'No puedes cambiar el instructor de un curso que te pertenece.');
                  return;
                }
                setShowInstructorPicker(s => !s);
              }}
              accessibilityLabel={disableInstructorChange ? 'Instructor (no editable)' : 'Seleccionar instructor'}
              accessibilityHint={disableInstructorChange ? 'No puedes reasignar un curso que te pertenece' : 'Abre la lista de instructores'}
            >
              <Text style={{ color: theme.colors.text }}>{form.instructor || 'Seleccionar instructor'}</Text>
            </TouchableOpacity>
            {!disableInstructorChange && showInstructorPicker && (
              <View style={{ maxHeight: 200, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 6, overflow: 'hidden', marginBottom: 8 }}>
                <ScrollView>
                  {instructors.map(inst => (
                    <TouchableOpacity key={inst.id} style={{ padding: 8 }} onPress={() => { setForm({ ...form, id_instructor: inst.id, instructor: inst.name }); setShowInstructorPicker(false); }}>
                      <Text style={{ color: theme.colors.text }}>{inst.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
            {disableInstructorChange && (
              <Text style={{ fontSize: 12, color: theme.colors.textSecondary, marginBottom: 8 }}>Este curso está asignado a ti; no puedes reasignarlo a otro instructor.</Text>
            )}
            <Text style={[styles.label, { color: theme.colors.text }]}>Fecha inicio</Text>
            {Platform.OS === 'web' ? (
              
              <div style={{ marginBottom: 8 }} className="mp-date-wrapper">
                <input
                  id={startInputIdRef.current}
                  ref={startInputRef}
                  className="mp-date-input"
                  type="date"
                  value={form.fecha_inicio || ''}
                  onChange={(e: any) => setForm({ ...form, fecha_inicio: e.target.value })}
                  aria-label="Fecha inicio"
                  style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', color: theme.colors.text }}
                />
                <label htmlFor={startInputIdRef.current} aria-label="Abrir selector de fecha" style={{ background: 'transparent', border: 'none', marginLeft: 6, cursor: 'pointer' }} onClick={(e:any) => {  try { if (startInputRef.current?.showPicker) { startInputRef.current.showPicker();  called (start)'); } else if (startInputRef.current?.click) { startInputRef.current.click();  called on input (start)'); } else { startInputRef.current?.focus?.();  called on input (start)'); } } catch (err) { :', err); } }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 10H9V12H7V10ZM11 10H13V12H11V10ZM15 10H17V12H15V10Z" fill="currentColor"/></svg>
                </label>

 
              </div>
            ) : (
              <>
                <TouchableOpacity
                  style={[styles.input, { justifyContent: 'center', backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
                  onPress={() => setShowStartPicker(true)}
                  accessibilityLabel="Seleccionar fecha de inicio"
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="calendar" size={18} color={form.fecha_inicio ? theme.colors.text : theme.colors.textSecondary} />
                    <Text style={{ marginLeft: 8, color: form.fecha_inicio ? theme.colors.text : theme.colors.textSecondary }}>{form.fecha_inicio || 'Seleccionar fecha'}</Text>
                  </View>
                </TouchableOpacity>
                {showStartPicker && (
                  (() => {
                    try {
                      
                      
                      const DateTimePicker = require('@react-native-community/datetimepicker').default;
                      return (
                        <DateTimePicker
                          value={form.fecha_inicio ? new Date(form.fecha_inicio) : new Date()}
                          mode="date"
                          display="default"
                          onChange={(event: any, selectedDate: any) => {
                            setShowStartPicker(false);
                            if (selectedDate) {
                              setForm({ ...form, fecha_inicio: selectedDate.toISOString().split('T')[0] });
                            }
                          }}
                        />
                      );
                    } catch (err) {
                      
                      setShowStartPicker(false);
                      return null;
                    }
                  })()
                )}
              </>
            )}

            <Text style={[styles.label, { color: theme.colors.text }]}>Fecha fin</Text>
            {Platform.OS === 'web' ? (
              
              <div style={{ marginBottom: 8 }} className="mp-date-wrapper">
                <input
                  id={endInputIdRef.current}
                  ref={endInputRef}
                  className="mp-date-input"
                  type="date"
                  value={form.fecha_fin || ''}
                  onChange={(e: any) => setForm({ ...form, fecha_fin: e.target.value })}
                  aria-label="Fecha fin"
                  style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', color: theme.colors.text }}
                />
                <label htmlFor={endInputIdRef.current} aria-label="Abrir selector de fecha" style={{ background: 'transparent', border: 'none', marginLeft: 6, cursor: 'pointer' }} onClick={(e:any) => {  try { if (endInputRef.current?.showPicker) { endInputRef.current.showPicker();  called (end)'); } else if (endInputRef.current?.click) { endInputRef.current.click();  called on input (end)'); } else { endInputRef.current?.focus?.();  called on input (end)'); } } catch (err) { :', err); } }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 10H9V12H7V10ZM11 10H13V12H11V10ZM15 10H17V12H15V10Z" fill="currentColor"/></svg>
                </label>

              </div>
            ) : (
              <>
                <TouchableOpacity
                  style={[styles.input, { justifyContent: 'center', backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
                  onPress={() => setShowEndPicker(true)}
                  accessibilityLabel="Seleccionar fecha de fin"
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="calendar" size={18} color={form.fecha_fin ? theme.colors.text : theme.colors.textSecondary} />
                    <Text style={{ marginLeft: 8, color: form.fecha_fin ? theme.colors.text : theme.colors.textSecondary }}>{form.fecha_fin || 'Seleccionar fecha'}</Text>
                  </View>
                </TouchableOpacity>
                {showEndPicker && (
                  (() => {
                    try {
                      
                      const DateTimePicker = require('@react-native-community/datetimepicker').default;
                      return (
                        <DateTimePicker
                          value={form.fecha_fin ? new Date(form.fecha_fin) : new Date()}
                          mode="date"
                          display="default"
                          onChange={(event: any, selectedDate: any) => {
                            setShowEndPicker(false);
                            if (selectedDate) {
                              setForm({ ...form, fecha_fin: selectedDate.toISOString().split('T')[0] });
                            }
                          }}
                        />
                      );
                    } catch (err) {
                      
                      setShowEndPicker(false);
                      return null;
                    }
                  })()
                )}
              </>
            )}
            {}
            <View style={{ height: 12 }} />
            {formError && (
              <View style={[styles.errorBox, { backgroundColor: theme.dark ? 'rgba(255,59,48,0.08)' : 'rgba(255,59,48,0.04)', borderColor: theme.colors.error }]}>
                <Text style={[styles.errorText, { color: theme.colors.error }]}>{formError}</Text>
              </View>
            )} 
            <TouchableOpacity style={[styles.save, { backgroundColor: colors.primary }]} onPress={handleSave}>
              <Text style={{ color: '#FFF' }}>{courseId ? 'Actualizar' : 'Crear'}</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  container: { width: '95%', maxWidth: 720, borderRadius: 8, padding: 12, maxHeight: '80%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title: { fontWeight: '700', fontSize: 18 },
  form: { paddingBottom: 20 },
  label: { fontSize: 12, marginBottom: 4 },
  input: { borderWidth: 1, padding: 8, borderRadius: 6, marginBottom: 8 },
  save: { padding: 12, alignItems: 'center', borderRadius: 6 },
  errorBox: { marginHorizontal: 8, marginBottom: 8, padding: 10, borderRadius: 6, backgroundColor: 'rgba(255,59,48,0.04)', borderWidth: 1, borderColor: '#ff3b30' },
  errorText: { color: '#ff3b30' },
});

export default CourseFormModal;