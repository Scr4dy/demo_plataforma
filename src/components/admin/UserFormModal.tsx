import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { userService } from '../../services/userService';
import { supabase } from '../../config/supabase';
import { useAuth } from '../../context/AuthContext';
import { v4 as uuidv4 } from 'uuid';

interface UserFormModalProps {
  visible: boolean;
  userId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const UserFormModal: React.FC<UserFormModalProps> = ({
  visible,
  userId,
  onClose,
  onSuccess,
}) => {
  const { state } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [offerCreateWithoutAuth, setOfferCreateWithoutAuth] = useState(false);
  const [allowedRoles, setAllowedRoles] = useState<string[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    apellido_paterno: '',
    apellido_materno: '',
    departamento: '',
    numero_control: '',
    puesto: '',
    telefono: '',
    password: '',
    confirmPassword: '',
    role: 'empleado',
    estado: 'activo',
  });

  useEffect(() => {
    if (userId) {
      loadUserData();
    } else {
      resetForm();
    }
  }, [userId]);

  
  useEffect(() => {
    if (visible) {
      
      setAllowedRoles(['Empleado', 'Instructor', 'Administrador']);
    }
  }, [visible]);

  
  useEffect(() => {
    if (!visible) resetForm();
  }, [visible]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id_usuario', Number(userId))
        .single();
      if (error) throw error;
      const user = data as any;
      setFormData({
        nombre: user.nombre || '',
        correo: user.correo || '',
        apellido_paterno: user.apellido_paterno || '',
        apellido_materno: user.apellido_materno || '',
        departamento: user.departamento || '',
        numero_control: user.numero_control || '',
        puesto: user.puesto || '',
        telefono: user.telefono || '',
        password: '',
        confirmPassword: '',
        role: user.rol || 'empleado',
        estado: user.activo ? 'activo' : 'inactivo',
      });
    } catch (error) {
      
      Alert.alert('Error', 'No se pudo cargar la información del usuario');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      correo: '',
      apellido_paterno: '',
      apellido_materno: '',
      departamento: '',
      numero_control: '',
      puesto: '',
      telefono: '',
      password: '',
      confirmPassword: '',
      role: 'empleado',
      estado: 'activo',
    });
  };

  const handleSubmit = async () => {
    
    if (!formData.nombre.trim()) {
      Alert.alert('Error', 'El nombre es obligatorio');
      return;
    }

    if (!formData.correo.trim()) {
      Alert.alert('Error', 'El correo es obligatorio');
      return;
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    try {
      setLoading(true);
      setFormError(null);
      setOfferCreateWithoutAuth(false);

      
      const email = (formData.correo || '').trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setFormError('Formato de correo inválido. Por favor revisa el email.');
        return;
      }

      
      const candidates = (allowedRoles && allowedRoles.length > 0) ? allowedRoles : ['Administrador', 'Instructor', 'Empleado'];
      const normalizedRole = candidates.includes(formData.role as string) ? formData.role : (candidates[0] || 'Empleado');
      const userData: any = {
        nombre: formData.nombre,
        apellido_paterno: formData.apellido_paterno || '',
        apellido_materno: formData.apellido_materno || '',
        correo: email,
        numero_control: formData.numero_control || null,
        departamento: formData.departamento || null,
        puesto: formData.puesto || null,
        rol: normalizedRole,
        telefono: formData.telefono || null,
        activo: formData.estado === 'activo',
      };
      
      async function createWithoutAuth() {
        try {
          setLoading(true);
          setFormError(null);
          const tempUser = { ...userData, auth_id: uuidv4() };
          const { data: noAuthData, error: noAuthError } = await supabase
            .from('usuarios')
            .insert([tempUser])
            .select('*');
          if (noAuthError) {
            
            const composedNoAuth = `${noAuthError.message}${(noAuthError as any).details ? ': ' + (noAuthError as any).details : ''}`;
            setFormError(`No se pudo crear usuario sin Auth: ${composedNoAuth}`);
            return;
          }
          Alert.alert('Éxito', 'Usuario creado correctamente (sin cuenta Auth)');
          try { onSuccess(); } catch (e) {  }
          onClose();
        } finally { setLoading(false); }
      }

      
      (setFormError as any).createWithoutAuth = createWithoutAuth;

      if (userId) {
        const { data, error } = await supabase
          .from('usuarios')
          .update(userData)
          .eq('id_usuario', Number(userId))
          .select('*');
        if (error) {
          
          const composed = `${error.message}${error.details ? ': ' + error.details : ''}${error.hint ? ' - ' + error.hint : ''}`;
          setFormError(composed);
          return;
        }
        Alert.alert('Éxito', 'Usuario actualizado correctamente');
      } else {
        
        let authId: string | null = null;
        if (formData.password) {
          const { data: authData, error: authError } = await supabase.auth.signUp({
            email: formData.correo,
            password: formData.password,
          });
          if (authError) {
            
            const e: any = authError as any;
            const composedAuth = `${e.message || String(e)}${e.details ? ': ' + e.details : ''}${e.hint ? ' - ' + e.hint : ''}`;
            
            if (/email address|invalid input/i.test(composedAuth.toLowerCase())) {
              
              
              try {
                await createWithoutAuth();
                Alert.alert('Usuario creado', 'El correo fue rechazado por el servicio de autenticación; se creó el registro sin cuenta Auth.');
              } catch (e) {
                
                setFormError(`No se pudo crear el usuario tras rechazo de email: ${String(e)}`);
              }
              return;
            }
            setFormError(`Error creando cuenta de autenticación: ${composedAuth}`);
            return;
          }
          authId = (authData as any)?.user?.id ?? null;
        } else {
          
          authId = uuidv4();
        }

        
        userData.auth_id = authId;

        const { data, error } = await supabase
          .from('usuarios')
          .insert([userData])
          .select('*');
        if (error) {
          
          const raw = JSON.stringify(error);
          const composed = `${error.message}${(error as any).details ? ': ' + (error as any).details : ''}${(error as any).hint ? ' - ' + (error as any).hint : ''}`;

          
          if (/invalid input syntax for type uuid/i.test(composed) || /invalid input syntax for type uuid/i.test(raw)) {
            
            userData.auth_id = uuidv4();
            const { data: retryData, error: retryError } = await supabase
              .from('usuarios')
              .insert([userData])
              .select('*');
            if (retryError) {
              
              const composedRetry = `${retryError.message}${(retryError as any).details ? ': ' + (retryError as any).details : ''}${(retryError as any).hint ? ' - ' + (retryError as any).hint : ''}`;
              setFormError(`Reintento fallido: ${composedRetry}\n\nRAW: ${JSON.stringify(retryError)}`);
              return;
            }
            Alert.alert('Éxito', 'Usuario creado correctamente (con UUID generado)');
            try { onSuccess(); } catch (e) {  }
            onClose();
            return;
          }

          
          if (/usuarios_rol_check/i.test(raw) || /usuarios_rol_check/i.test(composed)) {
            
            const roleCandidates = ['Empleado', 'Instructor', 'Administrador'];
            for (const candidate of roleCandidates) {
              try {
                userData.rol = candidate;
                const { data: rData, error: rError } = await supabase
                  .from('usuarios')
                  .insert([userData])
                  .select('*');
                if (!rError) {
                  Alert.alert('Éxito', `Usuario creado correctamente (rol usado: ${candidate})`);
                  try { onSuccess(); } catch (e) {  }
                  onClose();
                  return;
                }
                
                const rRaw = JSON.stringify(rError);
                if (!/usuarios_rol_check/i.test(rRaw)) {
                  const composedR = `${rError.message}${(rError as any).details ? ': ' + (rError as any).details : ''}`;
                  setFormError(`Fallo con rol ${candidate}: ${composedR}\n\nRAW: ${rRaw}`);
                  return;
                }
                
              } catch (e) {
                
              }
            }

            setFormError('No se pudo insertar: la constraint usuarios_rol_check impide los roles probados. Revisa la definición de roles en la DB.');
            return;
          }

          
          setFormError(`${composed}\n\nRAW: ${raw}`);
          return;
        }

        
        async function createWithoutAuth() {
          try {
            setLoading(true);
            setFormError(null);
            
            const tempUser = { ...userData, auth_id: null };
            const { data: noAuthData, error: noAuthError } = await supabase
              .from('usuarios')
              .insert([tempUser])
              .select('*');
            if (noAuthError) {
              
              const composedNoAuth = `${noAuthError.message}${(noAuthError as any).details ? ': ' + (noAuthError as any).details : ''}${(noAuthError as any).hint ? ' - ' + (noAuthError as any).hint : ''}`;
              const rawNoAuth = JSON.stringify(noAuthError);
              
              if ((noAuthError as any)?.code === '23503' || /usuarios_auth_id_fkey/i.test(rawNoAuth)) {
                const guidance = `La inserción falló por la constraint FK (usuarios_auth_id_fkey). Esto significa que el campo 'auth_id' debe referenciar una fila existente en la tabla 'auth.users'. Opciones:\n
1) Proveer un correo válido para crear la cuenta Auth primero (recomendado).\n2) Permitir valores NULL en 'auth_id' ejecutando en SQL: \n   ALTER TABLE usuarios ALTER COLUMN auth_id DROP NOT NULL;\n   -- Esto permitirá crear usuarios sin cuenta Auth (ten en cuenta implicaciones de integridad).\n3) Eliminar la constraint FK (no recomendado sin revisión):\n   ALTER TABLE usuarios DROP CONSTRAINT usuarios_auth_id_fkey;\n
Consulta con tu DBA cuál opción prefieres.`;
                setFormError(`No se pudo crear usuario sin Auth: ${composedNoAuth}\n\nRAW: ${rawNoAuth}\n\n${guidance}`);
                return;
              }
              setFormError(`No se pudo crear usuario sin Auth: ${composedNoAuth}\n\nRAW: ${rawNoAuth}`);
              return;
            }
            Alert.alert('Éxito', 'Usuario creado correctamente (sin cuenta Auth)');
            try { onSuccess(); } catch (e) {  }
            onClose();
          } finally { setLoading(false); }
        }

        
        (setFormError as any).createWithoutAuth = createWithoutAuth;
        Alert.alert('Éxito', 'Usuario creado correctamente');
      }

      try {
        onSuccess();
      } catch (e) {  }
      onClose();
    } catch (error: any) {
      
      setFormError(error.message || String(error));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    onClose();
  };

  const { theme, colors } = useTheme();
  const isWeb = Platform.OS === 'web';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[
          styles.modalContent,
          isWeb && styles.webModalContent,
          { backgroundColor: theme.colors.card, borderColor: theme.colors.border }
        ]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              {userId ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
            </Text>
            <TouchableOpacity
              onPress={handleClose}
              disabled={loading}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.formContainer}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Nombre *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.colors.card, borderColor: theme.colors.border, color: theme.colors.text }]}
                value={formData.nombre}
                onChangeText={(text) => setFormData({ ...formData, nombre: text })}
                placeholder="Ej: Juan"
                editable={!loading}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Apellido Paterno</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.colors.card, borderColor: theme.colors.border, color: theme.colors.text }]}
                value={formData.apellido_paterno}
                onChangeText={(text) => setFormData({ ...formData, apellido_paterno: text })}
                placeholder="Ej: Pérez"
                editable={!loading}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Apellido Materno</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.colors.card, borderColor: theme.colors.border, color: theme.colors.text }]}
                value={formData.apellido_materno}
                onChangeText={(text) => setFormData({ ...formData, apellido_materno: text })}
                placeholder="Ej: González"
                editable={!loading}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label]}>Correo *</Text>
              <TextInput
                style={styles.input}
                value={formData.correo}
                onChangeText={(text) => setFormData({ ...formData, correo: text })}
                placeholder="Ej: juan@empresa.com"
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading && !userId} 
              />
              {userId && (
                <Text style={[styles.helperText, { color: theme.colors.textSecondary }]}>
                  El correo no se puede modificar
                </Text>
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Departamento</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.colors.card, borderColor: theme.colors.border, color: theme.colors.text }]}
                value={formData.departamento}
                onChangeText={(text) => setFormData({ ...formData, departamento: text })}
                placeholder="Ej: Producción, Calidad"
                editable={!loading}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Número de Control</Text>
              <TextInput
                style={styles.input}
                value={formData.numero_control}
                onChangeText={(text) => setFormData({ ...formData, numero_control: text })}
                placeholder="Ej: 00123"
                editable={!loading}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Puesto</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.colors.card, borderColor: theme.colors.border, color: theme.colors.text }]}
                value={formData.puesto}
                onChangeText={(text) => setFormData({ ...formData, puesto: text })}
                placeholder="Ej: Supervisor, Técnico"
                editable={!loading}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Teléfono</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.colors.card, borderColor: theme.colors.border, color: theme.colors.text }]}
                value={formData.telefono}
                onChangeText={(text) => setFormData({ ...formData, telefono: text })}
                placeholder="Ej: 555-1234"
                keyboardType="phone-pad"
                editable={!loading}
              />
            </View>

            {!userId && (
              <>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Contraseña { }</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.password}
                    onChangeText={(text) => setFormData({ ...formData, password: text })}
                    placeholder="Mínimo 6 caracteres (opcional)"
                    secureTextEntry
                    editable={!loading}
                  />
                  <Text style={[styles.helperText, { color: '#666' }]}>
                    Si proporcionas una contraseña se intentará crear la cuenta de autenticación para el usuario. Si la dejas en blanco, no podrá iniciar sesión hasta que se le cree una cuenta.
                  </Text>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Confirmar Contraseña</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.confirmPassword}
                    onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                    placeholder="Repite la contraseña"
                    secureTextEntry
                    editable={!loading}
                  />
                </View>
              </>
            )}

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Rol *</Text>
              {loadingRoles ? (
                <Text style={[styles.helperText, { color: theme.colors.textSecondary }]}>Cargando roles...</Text>
              ) : (
                <TouchableOpacity
                  style={[styles.roleSelectButton, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
                  onPress={() => setShowRoleModal(true)}
                  disabled={loading}
                >
                  <Text style={[styles.roleSelectText, { color: theme.colors.text }]}>{
                    (() => {
                      const val = formData.role;
                      if (!val) return 'Seleccionar rol';
                      
                      const roleMap: { [key: string]: string } = {
                        'empleado': 'Empleado',
                        'Empleado': 'Empleado',
                        'instructor': 'Instructor',
                        'Instructor': 'Instructor',
                        'admin': 'Administrador',
                        'Administrador': 'Administrador'
                      };
                      return roleMap[val] || val;
                    })()
                  }</Text>
                  <Ionicons name="chevron-down" size={20} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              )}
              <Text style={[styles.helperText, { color: theme.colors.textSecondary }]}>
                Define el nivel de acceso del usuario en el sistema
              </Text>

              <Modal visible={showRoleModal} transparent animationType="fade" onRequestClose={() => setShowRoleModal(false)}>
                <TouchableOpacity style={styles.roleModalOverlay} onPress={() => setShowRoleModal(false)} activeOpacity={1}>
                  <View style={[styles.roleModal, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                    <Text style={[styles.roleModalTitle, { color: theme.colors.text, borderBottomColor: theme.colors.border }]}>
                      Seleccionar Rol
                    </Text>
                    {((allowedRoles && allowedRoles.length > 0) ? allowedRoles : ['Empleado', 'Instructor', 'Administrador']).map((val) => {
                      
                      const roleInfo: { [key: string]: { label: string, icon: string, description: string } } = {
                        'Empleado': { label: 'Empleado', icon: 'person', description: 'Usuario estándar con acceso a cursos' },
                        'empleado': { label: 'Empleado', icon: 'person', description: 'Usuario estándar con acceso a cursos' },
                        'Instructor': { label: 'Instructor', icon: 'school', description: 'Puede crear y gestionar cursos' },
                        'instructor': { label: 'Instructor', icon: 'school', description: 'Puede crear y gestionar cursos' },
                        'Administrador': { label: 'Administrador', icon: 'shield-checkmark', description: 'Acceso completo al sistema' },
                        'admin': { label: 'Administrador', icon: 'shield-checkmark', description: 'Acceso completo al sistema' }
                      };
                      const info = roleInfo[val] || { label: val, icon: 'help-circle', description: '' };
                      const isSelected = formData.role === val;

                      return (
                        <TouchableOpacity
                          key={val}
                          style={[
                            styles.roleItem,
                            isSelected && { backgroundColor: theme.dark ? 'rgba(33, 150, 243, 0.2)' : 'rgba(33, 150, 243, 0.1)' }
                          ]}
                          onPress={() => { setFormData({ ...formData, role: val }); setShowRoleModal(false); }}
                        >
                          <View style={styles.roleItemContent}>
                            <Ionicons
                              name={info.icon as any}
                              size={24}
                              color={isSelected ? '#2196F3' : theme.colors.textSecondary}
                            />
                            <View style={styles.roleItemTextContainer}>
                              <Text style={[styles.roleItemText, { color: theme.colors.text, fontWeight: isSelected ? '600' : '400' }]}>
                                {info.label}
                              </Text>
                              {info.description && (
                                <Text style={[styles.roleItemDescription, { color: theme.colors.textSecondary }]}>
                                  {info.description}
                                </Text>
                              )}
                            </View>
                            {isSelected && (
                              <Ionicons name="checkmark-circle" size={20} color="#2196F3" />
                            )}
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </TouchableOpacity>
              </Modal>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Estado</Text>
              <View style={styles.radioGroup}>
                {['activo', 'inactivo'].map((estado) => (
                  <TouchableOpacity
                    key={estado}
                    style={[
                      styles.radioButton,
                      formData.estado === estado && styles.radioButtonSelected
                    ]}
                    onPress={() => setFormData({ ...formData, estado })}
                    disabled={loading}
                  >
                    <Ionicons
                      name={formData.estado === estado ? "radio-button-on" : "radio-button-off"}
                      size={20}
                      color={formData.estado === estado ? "#4CAF50" : "#666"}
                    />
                    <Text style={[
                      styles.radioLabel,
                      formData.estado === estado && styles.radioLabelSelected
                    ]}>
                      {estado === 'activo' ? 'Activo' : 'Inactivo'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          {formError && (
            <View style={[styles.errorBox, { borderColor: '#ff3b30' }]}>
              <Text style={styles.errorText}>{formError}</Text>
              {offerCreateWithoutAuth && (
                <TouchableOpacity
                  onPress={() => {
                    const helper = (setFormError as any).createWithoutAuth;
                    if (helper) helper();
                  }}
                  style={styles.altAction}
                >
                  <Text style={styles.altActionText}>Crear usuario SIN cuenta Auth</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleClose}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.saveButton,
                loading && styles.saveButtonDisabled
              ]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <Ionicons name="hourglass" size={20} color="#fff" />
              ) : (
                <Ionicons
                  name={userId ? "save" : "person-add"}
                  size={20}
                  color="#fff"
                />
              )}
              <Text style={styles.saveButtonText}>
                {loading ? 'Guardando...' : userId ? 'Actualizar' : 'Crear Usuario'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
  },
  webModalContent: {
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  formContainer: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
  },
  radioGroup: {
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  radioButtonSelected: {
    borderColor: '#2196F3',
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
  },
  radioLabel: {
    fontSize: 14,
    color: '#666',
  },
  radioLabelSelected: {
    color: '#2196F3',
    fontWeight: '600',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  cancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#2196F3',
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  errorBox: {
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 59, 48, 0.04)'
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 13,
  },
  altAction: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    alignSelf: 'flex-start',
  },
  altActionText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  roleSelectContainer: {
    marginBottom: 16,
  },
  roleSelectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  roleSelectText: {
    fontSize: 16,
    color: '#333',
  },
  roleModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  roleModal: {
    borderRadius: 16,
    padding: 0,
    borderWidth: 1,
    width: '100%',
    maxWidth: 400,
    overflow: 'hidden',
  },
  roleModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    padding: 16,
    borderBottomWidth: 1,
    textAlign: 'center',
  },
  roleItem: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  roleItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  roleItemTextContainer: {
    flex: 1,
  },
  roleItemText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 2,
  },
  roleItemDescription: {
    fontSize: 12,
    color: '#666',
  },
});