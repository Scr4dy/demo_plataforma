import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Image,
  
  Platform,
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useHeader } from '../context/HeaderContext';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useTheme, ColorScheme, FontSize, fontSizeMultipliers } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { profileStorageService } from '../services/profileStorageService';
import { supabase } from '../config/supabase';
import { ConfirmationModal } from '../components/common/ConfirmationModal';

const themeOptions: { value: ColorScheme; label: string }[] = [
  { value: 'usa', label: 'Predeterminado' },
  { value: 'ocean', label: 'Azul' },
  { value: 'forest', label: 'Verde' },
  { value: 'sunset', label: 'Naranja' },
];

export default function ProfileSettingsScreen() {
  const navigation = useNavigation<NavigationProp<any>>();
  const { width } = useWindowDimensions();

  const {
    theme,
    colors,
    colorScheme,
    setColorScheme,
    fontSize,
    setFontSize,
    avatar,
    setAvatar,
    profileImage,
    setProfileImage,
    themeType,
    setThemeType,
    getFontSize,
  } = useTheme();
  const { user, logout } = useAuth();
  const { header, setHeader } = useHeader();

  const isWeb = Platform.OS === 'web';
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const isDesktop = width >= 1024;

  
  const roleMap = (r?: string) => {
    if (!r) return '';
    const rr = r.toString().toLowerCase();
    if (rr === 'admin' || rr === 'administrador') return 'Administrador';
    if (rr === 'instructor') return 'Instructor';
    return 'Empleado';
  };

  
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [showImageOptions, setShowImageOptions] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false); 
  const [showLogoutModal, setShowLogoutModal] = useState(false); 

  
  const [alertModal, setAlertModal] = useState({
    visible: false,
    title: '',
    message: '',
    singleButton: true,
    confirmText: 'Entendido',
    onConfirm: () => { },
  });

  const showAlert = (title: string, message: string, onConfirm?: () => void) => {
    setAlertModal({
      visible: true,
      title,
      message,
      singleButton: true,
      confirmText: 'Entendido',
      onConfirm: () => {
        setAlertModal(prev => ({ ...prev, visible: false }));
        if (onConfirm) onConfirm();
      },
    });
  };

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  
  const loadProfileImage = async () => {
    if (user?.id_usuario && user?.avatar_path) {
      try {
        const avatarUri = await profileStorageService.getAvatarUri(
          user.id_usuario,
          user.avatar_path
        );

        if (avatarUri) {
          await setProfileImage(avatarUri);
        }
      } catch (error: any) {
        
        
        if (error.message?.includes('Object not found')) {
          try {
            await supabase
              .from('usuarios')
              .update({ avatar_path: null })
              .eq('id_usuario', user.id_usuario);
          } catch (dbError) {
            
          }
        }
      }
    }
  };

  
  useEffect(() => {
    loadProfileImage();
  }, [user?.id_usuario, user?.avatar_path]);

  
  useEffect(() => {
    const subtitleText = 'Configuración de perfil y preferencias';

    const headerObj = {
      title: 'Mi Perfil',
      subtitle: subtitleText,
      showBack: true,
      alignLeftOnMobile: true,
      onBack: () => {
        const navCanGoBackPS = (navigation && typeof navigation.canGoBack === 'function') ? (() => { try { return navigation.canGoBack(); } catch (e) { return false; } })() : false;
        if (navCanGoBackPS) {
          try { navigation.goBack(); } catch (e) {  }
        } else if (navigation && typeof navigation.navigate === 'function') {
          try { navigation.navigate('Dashboard' as never); } catch (e) {  }
        }
      },
      manual: true,
      
      containerStyle: { backgroundColor: theme.colors.background, borderBottomColor: colors.primary, borderTopLeftRadius: 8, borderTopRightRadius: 8 },
      titleStyle: { fontSize: getFontSize(20), color: theme.colors.card },
      backIconColor: theme.colors.text,
    } as any;

    
    try {
      const shouldSet = !(header?.title === headerObj.title && header?.owner === 'ProfileSettings' && header?.manual === true && header?.showBack === true);
      if (shouldSet) setHeader(headerObj);
    } catch (e) {
      
    }

    const timer = setTimeout(() => {
      try {
        const shouldSet2 = !(header?.title === headerObj.title && header?.owner === 'ProfileSettings' && header?.manual === true && header?.showBack === true);
        if (shouldSet2) setHeader(headerObj);
      } catch (e) {  }
    }, 60);

    return () => {
      clearTimeout(timer);
      
      try {
        if (header && (header.owner === 'ProfileSettings' || (header.manual && header.title === 'Mi Perfil'))) {
          setHeader(null);
        }
      } catch (e) {
        
      }
    };
  }, [setHeader, theme.colors.background, theme, getFontSize]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showAlert('Permiso denegado', 'Necesitamos acceso a tus fotos para cambiar tu imagen de perfil');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets[0]) {
      if (!user?.id_usuario) {
        showAlert('Error', 'Usuario no autenticado');
        return;
      }

      try {
        setIsUploading(true);
        setUploadProgress(0);
        const uploadResult = await profileStorageService.uploadAvatar(
          user.id_usuario,
          result.assets[0].uri,
          (progress) => setUploadProgress(progress)
        );

        if (uploadResult.path) {
          
          const avatarUri = await profileStorageService.getAvatarUri(
            user.id_usuario,
            uploadResult.path
          );

          if (avatarUri) {
            await setProfileImage(avatarUri);
          }

          setShowImageOptions(false);

          
          setTimeout(() => {
            loadProfileImage();
          }, 500);

          if (Platform.OS === 'web') {
            window.alert('¡Imagen de perfil actualizada correctamente!');
          } else {
            showAlert('¡Éxito!', 'Imagen de perfil actualizada correctamente');
          }
        }
      } catch (error: any) {
        
        showAlert('Error', error.message || 'No se pudo subir la imagen');
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    }
  };

  const takePhoto = async () => {
    if (Platform.OS === 'web') {
      setShowCamera(true);
      setShowImageOptions(false);
      return;
    }

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      showAlert('Permiso denegado', 'Necesitamos acceso a tu cámara para tomar una foto');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets[0]) {
      if (!user?.id_usuario) {
        showAlert('Error', 'Usuario no autenticado');
        return;
      }

      try {
        setIsUploading(true);
        setUploadProgress(0);
        const uploadResult = await profileStorageService.uploadAvatar(
          user.id_usuario,
          result.assets[0].uri,
          (progress) => setUploadProgress(progress)
        );

        if (uploadResult.path) {
          
          const avatarUri = await profileStorageService.getAvatarUri(
            user.id_usuario,
            uploadResult.path
          );

          if (avatarUri) {
            await setProfileImage(avatarUri);
          }

          setShowImageOptions(false);
          showAlert('¡Éxito!', 'Foto de perfil guardada correctamente');
        }
      } catch (error: any) {
        
        showAlert('Error', error.message || 'No se pudo subir la foto');
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    }
  };

  const initializeCamera = async () => {
    if (Platform.OS !== 'web' || !videoRef.current) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 640 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (error) {
      
      showAlert('Error', 'No se pudo acceder a la cámara. Asegúrate de haber otorgado los permisos necesarios.');
      setShowCamera(false);
    }
  };

  const capturePhoto = () => {
    if (Platform.OS !== 'web' || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = 640;
    canvas.height = 640;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const photoDataUrl = canvas.toDataURL('image/jpeg', 0.8);

    if (video.srcObject) {
      const stream = video.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }

    if (!user?.id_usuario) {
      window.alert('Error: Usuario no autenticado');
      setShowCamera(false);
      return;
    }

    (async () => {
      try {
        setIsUploading(true);
        setUploadProgress(0);
        const uploadResult = await profileStorageService.uploadAvatar(
          Number(user.id_usuario),
          photoDataUrl,
          (progress) => setUploadProgress(progress)
        );

        if (uploadResult.path) {
          
          const avatarUri = await profileStorageService.getAvatarUri(
            Number(user.id_usuario),
            uploadResult.path
          );

          if (avatarUri) {
            setProfileImage(avatarUri);
          }

          setShowCamera(false);
          window.alert('¡Foto de perfil capturada y guardada correctamente!');
        }
      } catch (error: any) {
        
        window.alert('Error: ' + (error.message || 'No se pudo subir la foto'));
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    })();
  };

  const closeCamera = () => {
    if (Platform.OS === 'web' && videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setShowCamera(false);
  };

  const removeProfileImage = async () => {
    if (!user?.id_usuario) {
      showAlert('Error', 'Usuario no autenticado');
      return;
    }

    try {
      
      const { supabase } = await import('../config/supabase');
      const { data } = await supabase
        .from('usuarios')
        .select('avatar_path')
        .eq('id_usuario', user.id_usuario)
        .single();

      if (data?.avatar_path) {
        await profileStorageService.deleteAvatar(user.id_usuario, data.avatar_path);
      }

      await setProfileImage(null);
      setShowImageOptions(false);

      if (Platform.OS === 'web') {
        window.alert('Imagen de perfil eliminada correctamente');
      } else {
        showAlert('Imagen eliminada', 'La imagen de perfil ha sido eliminada');
      }
    } catch (error: any) {
      
      showAlert('Error', error.message || 'No se pudo eliminar la imagen');
    }
  };

  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Dashboard' as never);
    }
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const onConfirmLogout = async () => {
    setShowLogoutModal(false);
    try {
      await logout();
    } catch (error) {
      
      if (Platform.OS === 'web') {
        window.alert('Error: No se pudo cerrar la sesión. Intenta de nuevo.');
      } else {
        showAlert('Error', 'No se pudo cerrar la sesión. Intenta de nuevo.');
      }
    }
  };

  return (
    <SafeAreaView edges={header?.hidden ? ['top', 'left', 'right', 'bottom'] : ['left', 'right', 'bottom']} style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ConfirmationModal
        visible={showLogoutModal}
        title="Cerrar Sesión"
        message="¿Estás seguro de que deseas cerrar sesión?"
        onConfirm={onConfirmLogout}
        onCancel={() => setShowLogoutModal(false)}
        confirmText="Cerrar Sesión"
        cancelText="Cancelar"
      />

      {}
      <ConfirmationModal
        visible={alertModal.visible}
        title={alertModal.title}
        message={alertModal.message}
        onConfirm={alertModal.onConfirm}
        onCancel={() => setAlertModal(prev => ({ ...prev, visible: false }))}
        confirmText={alertModal.confirmText}
        singleButton={alertModal.singleButton}
      />

      <ScrollView
        style={[styles.content, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={[
          { padding: isMobile ? 16 : isTablet ? 20 : 24 },
          isWeb && isDesktop && { maxWidth: 800, alignSelf: 'center', width: '100%' }
        ]}
      >
        {}
        <View style={styles.section}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Ionicons name="camera" size={20} color={colors.primary} style={{ marginRight: 8 }} />
            <Text style={[styles.sectionTitle, { fontSize: getFontSize(16), color: colors.primary }]}>
              Foto de Perfil
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.card, styles.profileImageCard, { backgroundColor: theme.colors.card }]}
            onPress={() => setShowImageOptions(true)}
          >
            <View style={styles.profileImageContainer}>
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.profileImage} />
              ) : (
                <View style={[styles.profileImagePlaceholder, { backgroundColor: colors.primaryLight }]}>
                  <Ionicons name="camera" size={40} color={colors.primary} />
                </View>
              )}
            </View>
            <View style={styles.avatarInfo}>
              <Text style={[styles.avatarLabel, { fontSize: getFontSize(14), color: theme.colors.text }]}>
                {profileImage ? 'Cambiar foto de perfil' : 'Agregar foto de perfil'}
              </Text>
              <Text style={[styles.avatarHint, { fontSize: getFontSize(12), color: theme.colors.textSecondary }]}>
                Toca para {profileImage ? 'cambiar o eliminar' : 'agregar una foto'}
              </Text>

              {}
              {profileImage && (
                <TouchableOpacity
                  style={[styles.viewPhotoButton, { backgroundColor: colors.primary }]}
                  onPress={() => setShowFullImage(true)}
                >
                  <Ionicons name="eye" size={16} color="#fff" style={{ marginRight: 4 }} />
                  <Text style={styles.viewPhotoText}>Ver foto</Text>
                </TouchableOpacity>
              )}
            </View>
            <Ionicons name="chevron-forward" size={24} color={theme.colors.icon} />
          </TouchableOpacity>
        </View>

        {}
        <View style={styles.section}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Ionicons name="color-palette" size={20} color={colors.primary} style={{ marginRight: 8 }} />
            <Text style={[styles.sectionTitle, { fontSize: getFontSize(16), color: colors.primary }]}>
              Tema de Colores
            </Text>
          </View>
          {themeOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.card,
                styles.themeOption,
                { backgroundColor: theme.colors.card },
                colorScheme === option.value && {
                  borderColor: colors.primary,
                  borderWidth: 2,
                  backgroundColor: colors.primaryLight,
                }
              ]}
              onPress={() => setColorScheme(option.value)}
            >
              <Text style={[
                styles.themeLabel,
                {
                  fontSize: getFontSize(14),
                  color: colorScheme === option.value ? colors.primary : theme.colors.text
                }
              ]}>
                {option.label}
              </Text>
              {colorScheme === option.value && (
                <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {}
        <View style={styles.section}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Ionicons name="contrast" size={20} color={colors.primary} style={{ marginRight: 8 }} />
            <Text style={[styles.sectionTitle, { fontSize: getFontSize(16), color: colors.primary }]}>
              Modo de Tema
            </Text>
          </View>
          <Text style={[styles.settingHint, { fontSize: getFontSize(12), color: theme.colors.textSecondary, marginBottom: 12, opacity: 0.7 }]}>
            Cambia entre modo claro y oscuro según tu preferencia
          </Text>

          <View style={styles.themeOptionsContainer}>
            <TouchableOpacity
              style={[
                styles.themeOption,
                { backgroundColor: theme.colors.card, borderColor: themeType === 'light' ? colors.primary : theme.colors.border },
                themeType === 'light' && { borderWidth: 2 }
              ]}
              onPress={() => setThemeType('light')}
            >
              <Ionicons name="sunny" size={24} color={themeType === 'light' ? colors.primary : theme.colors.text} />
              <Text style={[styles.themeLabel, { fontSize: getFontSize(14), color: themeType === 'light' ? colors.primary : theme.colors.text }]}>Claro</Text>
              {themeType === 'light' && (
                <Ionicons name="checkmark-circle" size={20} color={colors.primary} style={styles.themeCheck} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.themeOption,
                { backgroundColor: theme.colors.card, borderColor: themeType === 'dark' ? colors.primary : theme.colors.border },
                themeType === 'dark' && { borderWidth: 2 }
              ]}
              onPress={() => setThemeType('dark')}
            >
              <Ionicons name="moon" size={24} color={themeType === 'dark' ? colors.primary : theme.colors.text} />
              <Text style={[styles.themeLabel, { fontSize: getFontSize(14), color: themeType === 'dark' ? colors.primary : theme.colors.text }]}>Oscuro</Text>
              {themeType === 'dark' && (
                <Ionicons name="checkmark-circle" size={20} color={colors.primary} style={styles.themeCheck} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.logoutButton, { backgroundColor: colors.error }]}
            onPress={handleLogoutClick}
          >
            <Ionicons name="log-out-outline" size={24} color={theme.colors.card} />
            <Text style={[styles.logoutText, { fontSize: getFontSize(16), color: theme.colors.card }]}>
              Cerrar Sesión
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.infoCard, { backgroundColor: themeType === 'dark' ? colors.primaryDark || theme.colors.primary : (colors.primaryLight || colors.card) }]}>
          {}
          <Text style={[styles.infoText, { fontSize: getFontSize(12), color: themeType === 'dark' ? theme.colors.card : (colors.primary || theme.colors.primary) }]}>
            Tus preferencias se guardan automáticamente y se aplican en toda la aplicación
          </Text>
        </View>
      </ScrollView>

      {}
      <Modal
        visible={showAvatarPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAvatarPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.modalTitle, { fontSize: getFontSize(18), color: theme.colors.text }]}>
              Elige tu avatar
            </Text>
            <TouchableOpacity
              style={[styles.modalCloseButton, { backgroundColor: colors.primary }]}
              onPress={() => setShowAvatarPicker(false)}
            >
              <Text style={[styles.modalCloseText, { fontSize: getFontSize(14) }]}>
                Cerrar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {}
      <Modal
        visible={showImageOptions}
        transparent
        animationType="slide"
        onRequestClose={() => setShowImageOptions(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.modalTitle, { fontSize: getFontSize(18), color: theme.colors.text }]}>
              Foto de Perfil
            </Text>

            <TouchableOpacity
              style={[styles.imageOptionButton, { backgroundColor: colors.primary }]}
              onPress={takePhoto}
            >
              <Ionicons name="camera" size={24} color="#fff" />
              <Text style={[styles.imageOptionText, { fontSize: getFontSize(16) }]}>
                Tomar Foto
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.imageOptionButton, { backgroundColor: colors.accent }]}
              onPress={pickImage}
            >
              <Ionicons name="images" size={24} color={theme.colors.card} />
              <Text style={[styles.imageOptionText, { fontSize: getFontSize(16) }]}>
                Elegir de Galería
              </Text>
            </TouchableOpacity>

            {profileImage && (
              <TouchableOpacity
                style={[styles.imageOptionButton, { backgroundColor: colors.error }]}
                onPress={removeProfileImage}
              >
                <Ionicons name="trash" size={24} color="#fff" />
                <Text style={[styles.imageOptionText, { fontSize: getFontSize(16) }]}>
                  Eliminar Foto
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.modalCloseButton, { backgroundColor: '#999' }]}
              onPress={() => setShowImageOptions(false)}
            >
              <Text style={[styles.modalCloseText, { fontSize: getFontSize(14) }]}>
                Cancelar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {}
      <Modal
        visible={showCamera}
        transparent
        animationType="slide"
        onShow={Platform.OS === 'web' ? initializeCamera : undefined}
        onRequestClose={closeCamera}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.cameraModal, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.modalTitle, { fontSize: getFontSize(18), color: theme.colors.text }]}>
              Tomar Foto
            </Text>

            {Platform.OS === 'web' && (
              <View style={styles.cameraContainer}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  style={styles.cameraPreview}
                />
                <canvas
                  ref={canvasRef}
                  style={{ display: 'none' }}
                />
              </View>
            )}

            <View style={styles.cameraButtons}>
              <TouchableOpacity
                style={[styles.cameraButton, { backgroundColor: colors.primary }]}
                onPress={capturePhoto}
              >
                <Ionicons name="camera" size={24} color="#fff" />
                <Text style={[styles.cameraButtonText, { fontSize: getFontSize(14), color: theme.colors.card }]}>
                  Capturar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.cameraButton, { backgroundColor: colors.textSecondary }]}
                onPress={closeCamera}
              >
                <Ionicons name="close" size={24} color="#fff" />
                <Text style={[styles.cameraButtonText, { fontSize: getFontSize(14), color: theme.colors.card }]}>
                  Cancelar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {}
      <Modal
        visible={showFullImage}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFullImage(false)}
      >
        <View style={styles.fullImageOverlay}>
          <TouchableOpacity
            style={styles.fullImageCloseArea}
            onPress={() => setShowFullImage(false)}
          >
            <View style={styles.fullImageContainer}>
              {profileImage && (
                <Image
                  source={{ uri: profileImage }}
                  style={styles.fullImage}
                  resizeMode="contain"
                />
              )}

              <TouchableOpacity
                style={[styles.fullImageCloseButton, { backgroundColor: colors.primary }]}
                onPress={() => setShowFullImage(false)}
              >
                <Ionicons name="close" size={24} color="#fff" />
                <Text style={styles.fullImageCloseText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>
      </Modal>

      {}
      {isUploading && (
        <View style={styles.uploadOverlay}>
          <View style={[styles.uploadModal, { backgroundColor: theme.colors.card }]}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.uploadText, { color: theme.colors.text, fontSize: getFontSize(16) }]}>
              Subiendo imagen...
            </Text>
            <Text style={[styles.uploadProgress, { color: colors.primary, fontSize: getFontSize(20) }]}>
              {Math.round(uploadProgress)}%
            </Text>
            <View style={styles.progressBarContainer}>
              <View
                style={[
                  styles.progressBar,
                  {
                    width: `${uploadProgress}%`,
                    backgroundColor: colors.primary
                  }
                ]}
              />
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontWeight: '700',
    marginBottom: 12,
    marginTop: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImageCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImageContainer: {
    marginRight: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  profileImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLarge: {
    fontSize: 48,
    marginRight: 16,
  },
  avatarInfo: {
    flex: 1,
  },
  avatarLabel: {
    fontWeight: '600',
    marginBottom: 4,
  },
  avatarHint: {
    opacity: 0.7,
    marginBottom: 8,
  },
  
  viewPhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  viewPhotoText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontWeight: '600',
    marginBottom: 4,
  },
  settingHint: {
  },
  fontOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fontPreview: {
    fontWeight: 'bold',
    marginRight: 12,
    width: 40,
    textAlign: 'center',
  },
  fontLabel: {
    flex: 1,
    fontWeight: '500',
  },
  settingDescription: {
    marginTop: 4,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    color: '#0277BD',
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  
  fullImageOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImageCloseArea: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImageContainer: {
    width: '90%',
    maxWidth: 500,
    alignItems: 'center',
  },
  fullImage: {
    width: '100%',
    height: 400,
    borderRadius: 12,
    marginBottom: 20,
  },
  fullImageCloseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    
  },
  fullImageCloseText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '70%',
  },
  cameraModal: {
    maxHeight: '90%',
  },
  modalTitle: {
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  avatarOption: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 8,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
  },
  avatarEmoji: {
    fontSize: 32,
  },
  modalCloseButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalCloseText: {
    color: '#fff',
    fontWeight: '600',
  },
  imageOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    
  },
  imageOptionText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 12,
  },
  themeOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  themeOption: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    position: 'relative',
  },
  themeIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  themeLabel: {
    fontWeight: '600',
  },
  themeCheck: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    
  },
  logoutText: {
    fontWeight: '600',
    marginLeft: 8,
  },
  cameraContainer: {
    width: '100%',
    height: 400,
    backgroundColor: '#000',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  cameraPreview: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  cameraButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  cameraButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    flex: 1,
  },
  cameraButtonText: {
    fontWeight: '600',
    marginLeft: 8,
  },
  uploadOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  uploadModal: {
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    minWidth: 250,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  uploadText: {
    marginTop: 16,
    fontWeight: '600',
  },
  uploadProgress: {
    marginTop: 8,
    fontWeight: 'bold',
  },
  progressBarContainer: {
    width: 200,
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginTop: 16,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
});