import React, { useState, useEffect } from 'react';
import useAdminGuard from '../../hooks/useAdminGuard';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Platform
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useHeader } from '../../context/HeaderContext';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { supabase } from '../../config/supabase';
import { Ionicons } from '@expo/vector-icons';
import InlineHeader from '../../components/common/InlineHeader';
import { UserFormModal } from '../../components/admin/UserFormModal';
import { userService } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';

interface User {
  id_usuario: number;
  numero_control?: string;
  nombre?: string;
  apellido_paterno?: string;
  apellido_materno?: string;
  correo?: string;
  telefono?: string;
  departamento?: string;
  puesto?: string;
  fecha_ingreso?: string;
  rol?: string;
  activo: boolean;
  ultimo_acceso?: string;
  fecha_registro?: string;
  auth_id?: string;
  deleted_at?: string;
  metadata?: any;
  
  displayName?: string;
}

const AdminUsersList: React.FC = () => {
  useAdminGuard();
  const { theme, getFontSize } = useTheme();
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [formVisible, setFormVisible] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | undefined>(undefined);
  const [lastError, setLastError] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const { isAdmin, user: currentUser } = useAuth();

  
  const { colors: schemeColors } = useTheme();
  const colors = {
    background: theme.colors.background,
    card: schemeColors?.card || theme.colors.card,
    text: schemeColors?.text || theme.colors.text,
    textSecondary: schemeColors?.textSecondary || theme.colors.textSecondary,
    border: schemeColors?.border || theme.colors.border,
    primary: schemeColors?.primary || theme.colors.primary,
    success: schemeColors?.success || theme.colors.success,
    warning: schemeColors?.warning || theme.colors.warning,
    danger: schemeColors?.error || theme.colors.error,
  };

  const { header, setHeader } = useHeader();

  
  const [alertModal, setAlertModal] = useState({
    visible: false,
    title: '',
    message: '',
    singleButton: true,
    confirmText: 'Entendido',
    cancelText: 'Cancelar',
    onConfirm: () => { },
    onCancel: () => { },
  });

  const showAlert = (title: string, message: string, onConfirm?: () => void) => {
    setAlertModal({
      visible: true,
      title,
      message,
      singleButton: true,
      confirmText: 'Entendido',
      cancelText: '',
      onConfirm: () => {
        setAlertModal(prev => ({ ...prev, visible: false }));
        if (onConfirm) onConfirm();
      },
      onCancel: () => setAlertModal(prev => ({ ...prev, visible: false })),
    });
  };

  const showConfirm = (title: string, message: string, onConfirm: () => void, confirmText = 'Aceptar', cancelText = 'Cancelar') => {
    setAlertModal({
      visible: true,
      title,
      message,
      singleButton: false,
      confirmText,
      cancelText,
      onConfirm: () => {
        setAlertModal(prev => ({ ...prev, visible: false }));
        onConfirm();
      },
      onCancel: () => setAlertModal(prev => ({ ...prev, visible: false })),
    });
  };

  useEffect(() => {
    if (isFocused) {
      loadUsers();
    }
  }, [isFocused]);

  React.useLayoutEffect(() => {
    if (Platform.OS !== 'web') {
      setHeader({ title: 'Gestión de Usuarios', subtitle: 'Gestión de usuarios y roles', showBack: true, manual: true, owner: 'AdminUsers', onBack: () => navigation.goBack() });
      return () => {
        try {
          if (header && (header.owner === 'AdminUsers' || (header.manual && header.title === 'Gestión de Usuarios'))) {
            setHeader(null);
          }
        } catch (e) {  }
      };
    }
    
  }, [setHeader]); 

  useEffect(() => {
    
    if (!formVisible) loadUsers();
  }, [formVisible]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('usuarios')
        .select(`
          id_usuario,
          numero_control,
          nombre,
          apellido_paterno,
          apellido_materno,
          correo,
          telefono,
          departamento,
          puesto,
          rol,
          activo,
          fecha_ingreso,
          fecha_registro,
          auth_id
        `)
        .order('nombre', { ascending: true });

      if (error) throw error;
      const mapped = (data || []).map((u: any) => ({
        ...u,
        displayName: `${u.nombre || ''} ${u.apellido_paterno || ''} ${u.apellido_materno || ''}`.trim(),
      }));
      setUsers(mapped as User[]);
      
      try {
        const distinctRoles = Array.from(new Set((mapped as User[]).map(u => u.rol).filter(Boolean)));
      } catch (e) {  }
    } catch (error) {
      
      
      setLastError('No se pudieron cargar los usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = () => {
    setEditingUserId(undefined);
    setFormVisible(true);
  };

  const handleEditUser = (userId: string) => {
    setEditingUserId(userId);
    setFormVisible(true);
  };

  const performDelete = async (userIdNumber: number) => {
    try {
      setLoading(true);
      setLastError(null);
      const { data, error } = await supabase.from('usuarios').delete().eq('id_usuario', userIdNumber).select('*');
      if (error) {
        
        setLastError(error.message || JSON.stringify(error));
        setPendingDeleteId(userIdNumber);
        return false;
      }
      await loadUsers();
      setPendingDeleteId(null);

      return true;
    } catch (err: any) {
      
      setLastError(err.message || String(err));
      setPendingDeleteId(userIdNumber);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = (userId: string) => {
    const idNum = Number(userId);

    
    if (currentUser && currentUser.id_usuario === idNum) {
      showAlert('Aviso', 'No puedes eliminarte a ti mismo');
      return;
    }

    showConfirm(
      'Confirmar eliminación',
      '¿Eliminar este usuario?',
      async () => {
        const ok = await performDelete(idNum);
        if (ok) {
          showAlert('Éxito', 'Usuario eliminado');
        } else {
          showAlert('Error', 'No se pudo eliminar el usuario');
        }
      },
      'Eliminar',
      'Cancelar'
    );
  };

  const toggleUserStatus = (userId: number, currentStatus: boolean) => {
    showConfirm(
      currentStatus ? 'Desactivar Usuario' : 'Activar Usuario',
      `¿Estás seguro de que quieres ${currentStatus ? 'desactivar' : 'activar'} este usuario?`,
      async () => {
        try {
          const { error } = await supabase
            .from('usuarios')
            .update({ activo: !currentStatus })
            .eq('id_usuario', userId);

          if (error) throw error;
          loadUsers();

          showAlert('Éxito', `Usuario ${currentStatus ? 'desactivado' : 'activado'} correctamente`);
        } catch (error) {
          
          showAlert('Error', 'No se pudo actualizar el usuario');
        }
      },
      'Confirmar',
      'Cancelar'
    );
  };

  const filteredUsers = users.filter(user => {
    const q = searchQuery.toLowerCase();
    return (
      (user.displayName || '').toLowerCase().includes(q) ||
      (user.correo || '').toLowerCase().includes(q) ||
      (user.departamento || '').toLowerCase().includes(q) ||
      (user.puesto || '').toLowerCase().includes(q) ||
      (user.numero_control || '').toLowerCase().includes(q)
    );
  });

  const getRoleBadgeColor = (role: string) => {
    const normalized = (role || '').toString().toLowerCase();
    switch (normalized) {
      case 'admin':
        return colors.danger;
      case 'instructor':
        return colors.warning;
      default:
        return colors.primary;
    }
  };

  

  const renderUserItem = ({ item }: { item: User }) => {
    const isSelf = !!currentUser && ((currentUser as any).id_usuario === item.id_usuario || (currentUser as any).id === item.auth_id);
    return (
      <View style={[styles.userCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.userHeader}>
          <View style={styles.userInfo}>
            <View style={styles.userNameRow}>
              <Text style={[styles.userName, { color: colors.text }]}>{item.displayName || item.nombre}</Text>
              <View style={[styles.roleBadge, { backgroundColor: getRoleBadgeColor(item.rol || '') }]}>
                <Text style={styles.roleText}>{item.rol || 'usuario'}</Text>
              </View>
              {isSelf && (
                <View style={[styles.selfBadge, { backgroundColor: theme.colors.primary }]}>
                  <Text style={styles.selfBadgeText}>Tú</Text>
                </View>
              )}
            </View>
            <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{item.correo}</Text>
            <Text style={[styles.userDetails, { color: colors.textSecondary }]}>
              {item.puesto || 'N/A'} • {item.departamento || 'N/A'}
            </Text>
            {item.numero_control && (
              <Text style={[styles.userDetails, { color: colors.textSecondary }]}>
                N° Control: {item.numero_control}
              </Text>
            )}
            {item.telefono && (
              <Text style={[styles.userDetails, { color: colors.textSecondary }]}>
                Tel: {item.telefono}
              </Text>
            )}
          </View>

          <View style={styles.userActions}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }} accessibilityLabel={`Estado: ${item.activo ? 'Activo' : 'Inactivo'}`}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: item.activo ? colors.success : colors.textSecondary, marginRight: 8 }} />
              <Text style={{ color: theme.colors.textSecondary, fontSize: getFontSize(12) }}>{item.activo ? 'Activo' : 'Inactivo'}</Text>
            </View>

            {}
            {isAdmin && Platform.OS === 'web' && (
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {isSelf ? (
                  <TouchableOpacity
                    style={[styles.statusButton, { marginTop: 8, backgroundColor: colors.primary, minWidth: 80 }]}
                    onPress={() => {
                      if (Platform.OS === 'web') {
                        try { const { goToWebRoute } = require('../../utils/webNav'); goToWebRoute('ProfileSettings', {}); return; } catch (e) {  }
                      }
                      (navigation as any).navigate('ProfileSettings');
                    }}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="person" size={14} color={theme.colors.card} />
                    <Text style={[styles.statusButtonText, { fontSize: getFontSize(12), color: theme.colors.card }]}>Perfil</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={[styles.statusButton, { marginTop: 8, backgroundColor: colors.primary, minWidth: 60 }]}
                    onPress={() => handleEditUser(String(item.id_usuario))}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="pencil" size={14} color={theme.colors.card} />
                    <Text style={[styles.statusButtonText, { fontSize: getFontSize(12), color: theme.colors.card }]}>Editar</Text>
                  </TouchableOpacity>
                )}

                {!isSelf && (
                  <TouchableOpacity
                    style={[styles.statusButton, { marginTop: 8, backgroundColor: colors.danger, minWidth: 80 }]}
                    onPress={() => handleDeleteUser(String(item.id_usuario))}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    accessibilityRole="button"
                    accessibilityLabel={`Eliminar ${item.displayName || item.nombre}`}
                  >
                    <Ionicons name="trash" size={14} color={theme.colors.card} />
                    <Text style={[styles.statusButtonText, { fontSize: getFontSize(12), color: theme.colors.card }]}>Eliminar</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {}
            {isAdmin && Platform.OS !== 'web' && (
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                {isSelf ? (
                  <TouchableOpacity
                    style={[styles.iconAction, { backgroundColor: colors.primary }]}
                    onPress={() => {
                      if (Platform.OS === 'web') {
                        try { const { goToWebRoute } = require('../../utils/webNav'); goToWebRoute('ProfileSettings', {}); return; } catch (e) {  }
                      }
                      (navigation as any).navigate('ProfileSettings');
                    }}
                    hitSlop={{ top: 8, left: 8, right: 8, bottom: 8 }}
                    accessibilityRole="button"
                    accessibilityLabel={`Ver perfil ${item.displayName || item.nombre}`}
                  >
                    <Ionicons name="person" size={16} color={theme.colors.card} />
                  </TouchableOpacity>
                ) : (
                  <>
                    <TouchableOpacity
                      style={[styles.iconAction, { backgroundColor: colors.primary }]}
                      onPress={() => handleEditUser(String(item.id_usuario))}
                      hitSlop={{ top: 8, left: 8, right: 8, bottom: 8 }}
                      accessibilityRole="button"
                      accessibilityLabel={`Editar ${item.displayName || item.nombre}`}
                    >
                      <Ionicons name="pencil" size={16} color={theme.colors.card} />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.iconAction, { backgroundColor: item.activo ? colors.danger : colors.primary }]}
                      onPress={() => handleDeleteUser(String(item.id_usuario))}
                      hitSlop={{ top: 8, left: 8, right: 8, bottom: 8 }}
                      accessibilityRole="button"
                      accessibilityLabel={`Borrar ${item.displayName || item.nombre}`}
                    >
                      <Ionicons name="trash" size={16} color={theme.colors.card} />
                    </TouchableOpacity>
                  </>
                )}
              </View>
            )}

          </View>
        </View>
      </View>

    );
  };

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>Cargando usuarios...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {lastError && (
        <View style={[styles.errorBanner, { backgroundColor: colors.danger, borderColor: colors.danger }]}>
          <Text style={[styles.errorText, { color: theme.colors.card }]}>Error: {lastError}</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity style={[styles.smallAction, { backgroundColor: colors.danger }]} onPress={() => {
              
              setLastError(null);
            }}>
              <Text style={[styles.smallActionText, { fontSize: getFontSize(12), color: theme.colors.card }]}>Reintentar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.smallAction, { backgroundColor: colors.primary }]} onPress={() => setLastError(null)}>
              <Text style={[styles.smallActionText, { fontSize: getFontSize(12), color: theme.colors.card }]}>Ocultar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      {}
      <InlineHeader
        title="Gestión de Usuarios"
        titleStyle={{ fontSize: getFontSize(18), color: theme.colors.card }}
        forceBackOnMobile={true}
        containerStyle={{ backgroundColor: colors.primary, borderBottomColor: colors.primary, borderTopLeftRadius: 8, borderTopRightRadius: 8 }}
        right={(
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={[styles.userCount, { color: theme.colors.card, fontSize: getFontSize(14) }]}>{filteredUsers.length} usuarios</Text>
          </View>
        )}
      />

      {}
      <View style={{ flexDirection: 'row', alignItems: 'center', margin: 16, gap: 10 }}>
        {}
        <View style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: theme.dark ? '#333' : '#fff',
          borderWidth: 1,
          borderColor: theme.dark ? '#444' : '#e0e0e0',
          borderRadius: 30,
          paddingHorizontal: 16,
          height: 50,
        }}>
          <Ionicons name="search" size={20} color="#999" style={{ marginRight: 8 }} />
          <TextInput
            style={{ flex: 1, fontSize: 16, color: colors.text }}
            placeholder="Buscar usuario..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color="#ccc" />
            </TouchableOpacity>
          )}
        </View>

        {}
        {isAdmin && (
          <TouchableOpacity
            onPress={handleCreateUser}
            style={{
              backgroundColor: colors.primary,
              height: 40,
              paddingHorizontal: 16,
              borderRadius: 20,
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <Ionicons name="person-add" size={20} color="#fff" />
            <Text style={{ color: '#fff', fontWeight: 'bold', marginLeft: 6, fontSize: 13 }}>Crear Usuario</Text>
          </TouchableOpacity>
        )}
      </View>

      {}
      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => String(item.id_usuario)}
        renderItem={renderUserItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.text }]}>
              {searchQuery ? 'No se encontraron usuarios' : 'No hay usuarios registrados'}
            </Text>
            {searchQuery && (
              <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
                Intenta con otros términos de búsqueda
              </Text>
            )}
          </View>
        }
      />
      {}
      <UserFormModal
        visible={formVisible}
        userId={editingUserId}
        onClose={() => setFormVisible(false)}
        onSuccess={() => {
          setFormVisible(false);
          loadUsers();
        }}
      />

      <ConfirmationModal
        visible={alertModal.visible}
        title={alertModal.title}
        message={alertModal.message}
        onConfirm={alertModal.onConfirm}
        onCancel={alertModal.onCancel}
        confirmText={alertModal.confirmText}
        cancelText={alertModal.cancelText}
        singleButton={alertModal.singleButton}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  header: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  userCount: {
    fontSize: 14,
    fontWeight: '500',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'web' ? 12 : 8,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },
  listContent: {
    padding: 16,
    paddingTop: 4,
  },
  userCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    ...Platform.select({
      web: {
        shadowColor: 'rgba(0,0,0,0.08)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      default: {
        elevation: 2,
      },
    }),
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  userName: {
    flex: 1,
    flexShrink: 1,
    fontSize: 18,
    fontWeight: '700',
    marginRight: 8,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  selfBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selfBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  userEmail: {
    fontSize: 14,
    marginBottom: 4,
  },
  userDetails: {
    fontSize: 13,
    marginBottom: 2,
  },
  userActions: {
    marginLeft: 12,
    alignSelf: 'center',
  },
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 6,
    justifyContent: 'center',
  },
  iconAction: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  statusBadgeText: {
    fontWeight: '600'
  },
  createButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorBanner: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    margin: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    flex: 1,
    marginRight: 12,
  },
  smallAction: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
  },
  smallActionText: {
    fontWeight: '600',
    fontSize: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
});

export default AdminUsersList;