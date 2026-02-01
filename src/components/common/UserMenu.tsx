import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Platform,
  useWindowDimensions,
  Image,
} from 'react-native';
import { platformShadow } from '../../utils/styleHelpers';
import { Menu } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { AlertMessage } from '../../components/common/AlertMessage';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation.types';

export const UserMenu = () => {
  const [visible, setVisible] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [message, setMessage] = useState<{ type: string; text: string; duration?: number } | undefined>(undefined);
  const { width } = useWindowDimensions();
  const { logout, state, isAdmin } = useAuth();
  const showAdmin = !!isAdmin;
  const { theme, colors, profileImage } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const isSmallScreen = width < 375;
  const isMobile = width < 768;

  
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && typeof (window as any).addEventListener === 'function') {
      const handleProfileImageUpdate = () => {
      };

      window.addEventListener('profileImageUpdated', handleProfileImageUpdate);

      return () => {
        if (typeof window !== 'undefined' && typeof (window as any).removeEventListener === 'function') {
          window.removeEventListener('profileImageUpdated', handleProfileImageUpdate);
        }
      };
    }
  }, []);

  const handleLogoutClick = () => {
    setVisible(false);
    setTimeout(() => {
      setShowLogoutModal(true);
    }, 100);
  };

  const onConfirmLogout = async () => {
    setShowLogoutModal(false);

    try {
      setMessage({ type: 'info', text: 'Cerrando sesión...', duration: 2000 });

      setTimeout(async () => {
        await logout();
        setMessage(undefined);
      }, 1500);

    } catch (error) {
      
    }
  };

  const getValidIconName = (iconName: string) => {
    const iconMap: Record<string, string> = {
      'person': 'person-outline',
      'settings': 'settings-outline',
      'log-out': 'log-out-outline',
      'notifications': 'notifications-outline',
      'person-circle': 'person-circle-outline',
      'information-circle': 'information-circle-outline',
      'business': 'business-outline',
      'id-card': 'id-card-outline',
      'people': 'people-outline',
      'shield': 'shield-outline',
      'search': 'search-outline',
    };

    if (iconName in Ionicons.glyphMap) {
      return iconName;
    }

    const mapped = iconMap[iconName];
    if (mapped && mapped in Ionicons.glyphMap) {
      return mapped;
    }

    return 'person-outline';
  };

  const userFromState = state.user;

  const displayName = userFromState?.nombre || 'Usuario';
  const displayEmail = userFromState?.email || 'usuario@empresa.com';
  const displayRole = userFromState?.role ?
    userFromState.role.charAt(0).toUpperCase() + userFromState.role.slice(1) :
    'Empleado';
  const displayDepartment = userFromState?.departamento || 'Sin departamento';
  const displayEmployeeNumber = userFromState?.numeroEmpleado || 'N/A';

  
  const rawRole = (userFromState?.role || (userFromState as any)?.rol || displayRole || '').toString().toLowerCase();
  let roleBg = colors.primary;
  if (rawRole.includes('admin')) {
    roleBg = colors.error || '#e53e3e';
  } else if (rawRole.includes('instr')) {
    roleBg = colors.warning || '#d69e2e';
  } else if (rawRole.includes('emple')) {
    roleBg = colors.primary || '#3182ce';
  } else if (rawRole.includes('superv')) {
    roleBg = colors.accent || colors.primary;
  }

  try {
    
    if (typeof window !== 'undefined') {
      
      
    }
  } catch (e) {
    
  }

  

  return (
    <View style={styles.container}>
      <ConfirmationModal
        visible={showLogoutModal}
        title="Cerrar Sesión"
        message="¿Estás seguro de que deseas cerrar sesión?"
        onConfirm={onConfirmLogout}
        onCancel={() => setShowLogoutModal(false)}
        confirmText="Cerrar Sesión"
        cancelText="Cancelar"
      />
      <AlertMessage message={message} onClose={() => setMessage(undefined)} />
      <Menu
        visible={visible}
        onDismiss={() => setVisible(false)}
        anchor={
          <TouchableOpacity
            style={styles.anchorButton}
            onPress={() => setVisible(true)}
            activeOpacity={0.85}
            hitSlop={{ top: 8, left: 8, right: 8, bottom: 8 }}
            accessibilityRole="button"
            accessibilityLabel="Abrir menú de usuario"
          >
            <View style={styles.anchorContent}>
              {}
              {profileImage ? (
                <Image
                  source={{ uri: profileImage }}
                  style={[
                    styles.userAvatarImage,
                    {
                      width: isSmallScreen ? 32 : 36,
                      height: isSmallScreen ? 32 : 36,
                      borderColor: colors.primary
                    }
                  ]}
                />
              ) : (
                <View style={[
                  styles.avatarPlaceholder,
                  {
                    width: isSmallScreen ? 32 : 36,
                    height: isSmallScreen ? 32 : 36,
                    backgroundColor: colors.primaryLight
                  }
                ]}>
                  <Ionicons
                    name={getValidIconName('person-circle') as any}
                    size={isSmallScreen ? 20 : 24}
                    color={isMobile ? theme.colors.card : theme.colors.text}
                  />
                </View>
              )}

              <View style={styles.anchorText}>
                <Text style={[styles.anchorName, { color: theme.colors.text }]} numberOfLines={1}>
                  {isMobile ? (displayName || '').split(' ')[0] : displayName}
                </Text>
                {!isMobile && (
                  

                  <View style={[styles.rolePill, { backgroundColor: roleBg }]}>
                    <Text style={[styles.rolePillText, { color: theme.colors.card }]} numberOfLines={1}>{displayRole}</Text>
                  </View>

                )}
              </View>

            </View>
          </TouchableOpacity>
        }
        contentStyle={[styles.menuContent, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
      >
        {}
        <View style={[styles.menuHeader, {
          backgroundColor: theme.dark ? '#1a2e1a' : '#f0f9f1',
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border
        }]}>
          <View style={styles.avatarContainer}>
            {profileImage ? (
              <Image
                source={{ uri: profileImage }}
                style={[styles.largeAvatarImage, { borderColor: 'rgba(0,0,0,0.05)' }]}
              />
            ) : (
              <View style={[styles.largeAvatarPlaceholder, { backgroundColor: colors.primary + '15' }]}>
                <Ionicons name="person" size={32} color={colors.primary} />
              </View>
            )}
          </View>

          <View style={styles.menuUserInfo}>
            <Text style={[styles.menuUserName, { color: colors.primary, fontWeight: '700' }]}>{displayName}</Text>
            <Text style={[styles.menuUserEmail, { color: theme.colors.textSecondary, fontSize: 13, marginBottom: 4 }]}>{displayEmail}</Text>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 12, opacity: 0.8 }}>
              {displayDepartment} • • {displayRole}
            </Text>
          </View>
        </View>

        {}
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {
            setVisible(false);
            
            setTimeout(() => {
              try {
                
                if (Platform.OS === 'web') {
                  try { const { goToWebRoute } = require('../../utils/webNav'); goToWebRoute('ProfileSettings', {}); return; } catch (e) {  }
                }

                
                if ((navigation as any)?.navigate) {
                  (navigation as any).navigate('ProfileSettings');
                } else {
                  throw new Error('no navigate on current navigation object');
                }
              } catch (e) {
                
                try {
                  
                  const { navigate: navServiceNavigate } = require('../../services/navigationService');
                  const ok = navServiceNavigate('ProfileSettings');
                  if (!ok) throw new Error('navigationService.navigate returned false');
                } catch (e2) {
                  
                  
                  try {
                    let parent = (navigation as any).getParent ? (navigation as any).getParent() : null;
                    let attempts = 0;
                    while (parent && attempts < 6) {
                      try { parent.navigate('ProfileSettings'); return; } catch (_err) { parent = parent.getParent ? parent.getParent() : null; attempts++; }
                    }
                  } catch (e3) {  }
                }
              }
            }, 120);
          }}
        >
          <Ionicons name={getValidIconName('person') as any} size={22} color={theme.colors.text} style={styles.menuItemIcon} />
          <Text style={[styles.menuItemText, { color: theme.colors.text }]}>Mi Perfil</Text>
        </TouchableOpacity>

        <View style={[styles.menuDivider, { backgroundColor: theme.colors.border }]} />

        {}
        <TouchableOpacity style={[styles.menuItem, styles.logoutButton]} onPress={handleLogoutClick}>
          <Ionicons name={getValidIconName('log-out') as any} size={22} color={theme.colors.error || colors.error} style={styles.menuItemIcon} />
          <Text style={[styles.menuItemText, styles.logoutText, { color: theme.colors.error || colors.error }]}>Cerrar Sesión</Text>
        </TouchableOpacity>

        {}
        <View style={styles.versionContainer}>
          <Text style={[styles.versionText, { color: colors.textSecondary }]}>v1.0.0</Text>
        </View>
      </Menu>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  anchorButton: {
    paddingVertical: 8,
    paddingHorizontal: 4, 
  },
  anchorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    
    paddingHorizontal: 2,
  },
  anchorText: {
    minWidth: 56,
    maxWidth: 140,
  },
  anchorName: {
    fontSize: 14,
    fontWeight: '600',
  },
  anchorRole: {
    fontSize: 12,
  },
  chevronIcon: {
    marginLeft: 4,
  },
  userAvatarImage: {
    borderRadius: 18,
    borderWidth: 2,
    resizeMode: 'cover',
  },
  avatarPlaceholder: {
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  menuContent: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingVertical: 8,
    minWidth: 280,
    elevation: 4,
    
    ...Platform.select({
      web: platformShadow({ boxShadow: '0 1px 6px rgba(0, 0, 0, 0.08)' }),
      ios: platformShadow({ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6 }),
      android: platformShadow({ elevation: 4 })
    }),
    borderWidth: 1,
    borderColor: 'transparent',
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
    marginHorizontal: -8,
    marginTop: -8,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  avatarContainer: {
    position: 'relative',
  },
  largeAvatarImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    resizeMode: 'cover',
  },
  largeAvatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuUserInfo: {
    marginLeft: 16,
    flex: 1,
  },
  menuUserName: {
    fontSize: 18,
    marginBottom: 2,
  },
  menuUserEmail: {
    fontSize: 14,
  },
  menuDivider: {
    height: 1,
    marginVertical: 4,
    marginHorizontal: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 44,
  },
  menuItemIcon: {
    marginRight: 12,
    width: 24,
  },
  menuItemText: {
    fontSize: 15,
    flex: 1,
  },
  notificationBadge: {
    backgroundColor: 'transparent',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  notificationBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  logoutButton: {},
  logoutText: {
    fontWeight: '600',
  },
  versionContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
    borderTopWidth: 1,
    borderTopColor: 'transparent',
    marginTop: 8,
  },
  versionText: {
    fontSize: 11,
    textAlign: 'center',
  },
  rolePill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
    justifyContent: 'center',
  },
  rolePillText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default UserMenu;