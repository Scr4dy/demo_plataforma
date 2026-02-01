
import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { UserAvatar } from './UserAvatar';
import { useUserAvatar } from '../../hooks/useUserAvatar';

interface AvatarUploadButtonProps {
  userId: number | null;
  userName?: string;
  size?: number;
  showAdminBadge?: boolean;
  onUploadComplete?: () => void;
}

export function AvatarUploadButton({
  userId,
  userName = 'Usuario',
  size = 100,
  showAdminBadge = false,
  onUploadComplete,
}: AvatarUploadButtonProps) {
  const {
    avatarUri,
    loading,
    uploading,
    uploadProgress,
    uploadAvatar,
  } = useUserAvatar(userId);

  const [showOptions, setShowOptions] = useState(false);

  
  const pickImage = async () => {
    try {
      
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permiso denegado',
          'Necesitamos acceso a tus fotos para cambiar tu imagen de perfil'
        );
        return;
      }

      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled && result.assets[0]) {
        const success = await uploadAvatar(result.assets[0].uri);
        
        if (success) {
          if (Platform.OS === 'web') {
            window.alert('¡Imagen de perfil actualizada!');
          } else {
            Alert.alert('¡Éxito!', 'Imagen de perfil actualizada correctamente');
          }
          onUploadComplete?.();
        }
      }
    } catch (error) {
      
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };

  
  const takePhoto = async () => {
    try {
      
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permiso denegado',
          'Necesitamos acceso a tu cámara para tomar una foto'
        );
        return;
      }

      
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled && result.assets[0]) {
        const success = await uploadAvatar(result.assets[0].uri);
        
        if (success) {
          if (Platform.OS === 'web') {
            window.alert('¡Foto de perfil actualizada!');
          } else {
            Alert.alert('¡Éxito!', 'Foto de perfil actualizada correctamente');
          }
          onUploadComplete?.();
        }
      }
    } catch (error) {
      
      Alert.alert('Error', 'No se pudo tomar la foto');
    }
  };

  
  const handlePress = () => {
    if (Platform.OS === 'web') {
      
      pickImage();
    } else {
      
      Alert.alert(
        'Cambiar foto de perfil',
        'Elige una opción',
        [
          {
            text: 'Tomar foto',
            onPress: takePhoto,
          },
          {
            text: 'Elegir de galería',
            onPress: pickImage,
          },
          {
            text: 'Cancelar',
            style: 'cancel',
          },
        ]
      );
    }
  };

  return (
    <View style={styles.container}>
      <UserAvatar
        uri={avatarUri}
        size={size}
        userName={userName}
        loading={loading}
        showAdminBadge={showAdminBadge}
        onPress={handlePress}
        borderColor="#2196F3"
        borderWidth={3}
      />

      {}
      <TouchableOpacity
        style={[
          styles.editButton,
          {
            width: size * 0.35,
            height: size * 0.35,
            borderRadius: size * 0.175,
            bottom: size * 0.05,
            right: size * 0.05,
          },
        ]}
        onPress={handlePress}
        disabled={uploading}
      >
        {uploading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Ionicons name="camera" size={size * 0.2} color="#fff" />
        )}
      </TouchableOpacity>

      {}
      {uploading && (
        <View style={[styles.progressOverlay, { width: size, height: size, borderRadius: size / 2 }]}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  editButton: {
    position: 'absolute',
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  progressOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AvatarUploadButton;
