
import { useState, useEffect, useCallback } from 'react';
import { profileStorageService } from '../services/profileStorageService';
import { supabase } from '../config/supabase';
import { Alert, Platform } from 'react-native';

export interface UseUserAvatarResult {
  avatarUri: string | null;
  loading: boolean;
  error: string | null;
  uploadProgress: number;
  uploading: boolean;
  uploadAvatar: (imageUri: string) => Promise<boolean>;
  deleteAvatar: () => Promise<boolean>;
  refreshAvatar: () => Promise<void>;
}

export function useUserAvatar(userId: number | null): UseUserAvatarResult {
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  
  const loadAvatar = useCallback(async () => {
    if (!userId) {
      setAvatarUri(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      
      const { data, error: dbError } = await supabase
        .from('usuarios')
        .select('avatar_path')
        .eq('id_usuario', userId)
        .single();

      if (dbError) throw dbError;

      if (data?.avatar_path) {
        
        const uri = await profileStorageService.getAvatarUri(userId, data.avatar_path);
        setAvatarUri(uri);
      } else {
        setAvatarUri(null);
      }
    } catch (err: any) {
      
      setError(err.message || 'Error al cargar avatar');
      setAvatarUri(null);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  
  const uploadAvatar = useCallback(
    async (imageUri: string): Promise<boolean> => {
      if (!userId) {
        Alert.alert('Error', 'Usuario no identificado');
        return false;
      }

      try {
        setUploading(true);
        setUploadProgress(0);
        setError(null);

        const result = await profileStorageService.uploadAvatar(
          userId,
          imageUri,
          (progress) => setUploadProgress(progress)
        );

        if (result.path) {
          
          
          await loadAvatar();
          return true;
        }

        return false;
      } catch (err: any) {
        
        setError(err.message || 'Error al subir avatar');
        
        if (Platform.OS === 'web') {
          window.alert(`Error: ${err.message || 'No se pudo subir el avatar'}`);
        } else {
          Alert.alert('Error', err.message || 'No se pudo subir el avatar');
        }
        
        return false;
      } finally {
        setUploading(false);
        setUploadProgress(0);
      }
    },
    [userId, loadAvatar]
  );

  
  const deleteAvatar = useCallback(async (): Promise<boolean> => {
    if (!userId) {
      Alert.alert('Error', 'Usuario no identificado');
      return false;
    }

    try {
      setLoading(true);
      setError(null);

      
      const { data } = await supabase
        .from('usuarios')
        .select('avatar_path')
        .eq('id_usuario', userId)
        .single();

      if (data?.avatar_path) {
        await profileStorageService.deleteAvatar(userId, data.avatar_path);
        setAvatarUri(null);
        return true;
      }

      return false;
    } catch (err: any) {
      
      setError(err.message || 'Error al eliminar avatar');
      
      if (Platform.OS === 'web') {
        window.alert(`Error: ${err.message || 'No se pudo eliminar el avatar'}`);
      } else {
        Alert.alert('Error', err.message || 'No se pudo eliminar el avatar');
      }
      
      return false;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  
  const refreshAvatar = useCallback(async () => {
    await loadAvatar();
  }, [loadAvatar]);

  
  useEffect(() => {
    loadAvatar();
  }, [loadAvatar]);

  return {
    avatarUri,
    loading,
    error,
    uploadProgress,
    uploading,
    uploadAvatar,
    deleteAvatar,
    refreshAvatar,
  };
}

export default useUserAvatar;
