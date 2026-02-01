
import { supabase } from '../config/supabase';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImageManipulator from 'expo-image-manipulator';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BUCKET_NAME = 'user-config';
const MAX_FILE_SIZE = 10 * 1024 * 1024; 
const COMPRESSED_SIZE = 800; 
const getCacheDir = () => `${FileSystem.documentDirectory}profile-cache/`;
const CACHE_KEY_PREFIX = 'profile_cache_';

interface UploadResult {
  path: string;
  publicUrl: string | null;
}

interface CacheMetadata {
  path: string;
  localUri: string;
  timestamp: number;
  userId: number;
}

class ProfileStorageService {
  
  private async initializeCacheDir(): Promise<void> {
    if (Platform.OS === 'web') return;

    try {
      const cacheDir = getCacheDir();
      const dirInfo = await FileSystem.getInfoAsync(cacheDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(cacheDir, { intermediates: true });
      }
    } catch (error) {
      
    }
  }

  
  private async saveCacheMetadata(userId: number, path: string, localUri: string): Promise<void> {
    try {
      const metadata: CacheMetadata = {
        path,
        localUri,
        timestamp: Date.now(),
        userId,
      };
      
      await AsyncStorage.setItem(
        `${CACHE_KEY_PREFIX}${userId}`,
        JSON.stringify(metadata)
      );
    } catch (error) {
      
    }
  }

  
  private async getCacheMetadata(userId: number): Promise<CacheMetadata | null> {
    try {
      const data = await AsyncStorage.getItem(`${CACHE_KEY_PREFIX}${userId}`);
      if (data) {
        return JSON.parse(data) as CacheMetadata;
      }
      return null;
    } catch (error) {
      
      return null;
    }
  }

  
  private async clearCacheMetadata(userId: number): Promise<void> {
    try {
      await AsyncStorage.removeItem(`${CACHE_KEY_PREFIX}${userId}`);
    } catch (error) {
      
    }
  }

  
  private async compressImage(uri: string): Promise<string> {
    try {
      const manipResult = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: COMPRESSED_SIZE, height: COMPRESSED_SIZE } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );
      return manipResult.uri;
    } catch (error) {
      
      throw error;
    }
  }

  
  async uploadAvatar(
    userId: number,
    imageUri: string,
    onProgress?: (progress: number) => void
  ): Promise<UploadResult> {
    try {
      
      onProgress?.(10);
      const compressedUri = await this.compressImage(imageUri);

      
      onProgress?.(20);
      let fileInfo: any;
      if (Platform.OS === 'web') {
        const response = await fetch(compressedUri);
        const blob = await response.blob();
        if (blob.size > MAX_FILE_SIZE) {
          throw new Error(`El archivo excede el límite de ${MAX_FILE_SIZE / 1024 / 1024} MB`);
        }
        fileInfo = { size: blob.size };
      } else {
        fileInfo = await FileSystem.getInfoAsync(compressedUri);
        if (fileInfo.exists && fileInfo.size > MAX_FILE_SIZE) {
          throw new Error(`El archivo excede el límite de ${MAX_FILE_SIZE / 1024 / 1024} MB`);
        }
      }

      
      onProgress?.(30);
      const timestamp = Date.now();
      const filePathWithVersion = `${userId}/avatar_${timestamp}.jpg`;

      let fileData: Blob | ArrayBuffer;
      if (Platform.OS === 'web') {
        const response = await fetch(compressedUri);
        fileData = await response.blob();
      } else {
        const base64 = await FileSystem.readAsStringAsync(compressedUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        fileData = byteArray.buffer;
      }

      
      onProgress?.(40);
      try {
        const { data: oldFiles } = await supabase.storage
          .from(BUCKET_NAME)
          .list(`${userId}/`, { limit: 100 });
        
        if (oldFiles && oldFiles.length > 0) {
          const filesToDelete = oldFiles.map(f => `${userId}/${f.name}`);
          await supabase.storage.from(BUCKET_NAME).remove(filesToDelete);
        }
      } catch (cleanupError) {
        
      }

      
      onProgress?.(60);
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePathWithVersion, fileData, {
          cacheControl: '3600',
          upsert: true,
          contentType: 'image/jpeg',
        });

      if (error) {
        
        throw error;
      }

      
      onProgress?.(80);
      const { error: dbError } = await supabase
        .from('usuarios')
        .update({ avatar_path: filePathWithVersion })
        .eq('id_usuario', userId);

      if (dbError) {
        
        throw dbError;
      }

      
      onProgress?.(90);
      if (Platform.OS !== 'web') {
        await this.cacheAvatar(userId, filePathWithVersion, compressedUri);
      }

      onProgress?.(100);
      return {
        path: filePathWithVersion,
        publicUrl: null,
      };
    } catch (error) {
      
      throw error;
    }
  }

  
  private async cacheAvatar(userId: number, path: string, sourceUri: string): Promise<void> {
    if (Platform.OS === 'web') return;

    try {
      await this.initializeCacheDir();
      
      const cacheFileName = `avatar_${userId}.jpg`;
      const cacheUri = `${getCacheDir()}${cacheFileName}`;
      
      
      await FileSystem.copyAsync({
        from: sourceUri,
        to: cacheUri,
      });

      
      await this.saveCacheMetadata(userId, path, cacheUri);
    } catch (error) {
      
    }
  }

  
  private async fileExistsInStorage(path: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .list(path.split('/')[0], { limit: 100 });

      if (error) return false;
      
      const fileName = path.split('/').pop();
      return data?.some(file => file.name === fileName) ?? false;
    } catch (error) {
      
      return false;
    }
  }

  
  async getAvatarUri(userId: number, path: string): Promise<string | null> {
    try {
      
      const exists = await this.fileExistsInStorage(path);
      if (!exists) {
        
        return null;
      }

      
      if (Platform.OS !== 'web') {
        const cacheMetadata = await this.getCacheMetadata(userId);
        
        if (cacheMetadata && cacheMetadata.path === path) {
          const fileInfo = await FileSystem.getInfoAsync(cacheMetadata.localUri);
          
          if (fileInfo.exists) {
            return cacheMetadata.localUri;
          } else {
            
            await this.clearCacheMetadata(userId);
          }
        }
      }

      
      const downloadedUri = await this.downloadAvatar(path);
      
      if (downloadedUri && Platform.OS !== 'web') {
        
        await this.cacheAvatar(userId, path, downloadedUri);
      }
      
      return downloadedUri;
    } catch (error) {
      
      return null;
    }
  }

  
  async getAvatarUrl(path: string, expiresIn: number = 3600): Promise<string> {
    try {
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .createSignedUrl(path, expiresIn);

      if (error) throw error;
      if (!data?.signedUrl) throw new Error('No se pudo generar URL firmada');

      return data.signedUrl;
    } catch (error) {
      
      throw error;
    }
  }

  
  async deleteAvatar(userId: number, path: string): Promise<void> {
    try {
      
      const { error: storageError } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([path]);

      if (storageError) throw storageError;

      
      const { error: dbError } = await supabase
        .from('usuarios')
        .update({ avatar_path: null })
        .eq('id_usuario', userId);

      if (dbError) throw dbError;

      
      if (Platform.OS !== 'web') {
        const cacheMetadata = await this.getCacheMetadata(userId);
        
        if (cacheMetadata) {
          try {
            await FileSystem.deleteAsync(cacheMetadata.localUri, { idempotent: true });
          } catch (e) {
            
          }
          
          await this.clearCacheMetadata(userId);
        }
      }
    } catch (error) {
      
      throw error;
    }
  }

  
  async downloadAvatar(path: string): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        
        return await this.getAvatarUrl(path);
      }

      const signedUrl = await this.getAvatarUrl(path);
      await this.initializeCacheDir();
      
      const fileName = path.split('/').pop() || 'avatar.jpg';
      const fileUri = `${getCacheDir()}${fileName}`;

      const { uri } = await FileSystem.downloadAsync(signedUrl, fileUri);
      return uri;
    } catch (error: any) {
      
      if (error.message?.includes('Object not found')) {
      } else {
        
      }
      return null;
    }
  }

  
  async cleanOldCache(): Promise<void> {
    if (Platform.OS === 'web') return;

    try {
      const cacheDir = getCacheDir();
      const dirInfo = await FileSystem.getInfoAsync(cacheDir);
      if (!dirInfo.exists) return;

      const files = await FileSystem.readDirectoryAsync(cacheDir);
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

      let cleaned = 0;
      for (const file of files) {
        const fileUri = `${cacheDir}${file}`;
        const fileInfo = await FileSystem.getInfoAsync(fileUri);

        if (fileInfo.exists && fileInfo.modificationTime && fileInfo.modificationTime < sevenDaysAgo) {
          await FileSystem.deleteAsync(fileUri, { idempotent: true });
          cleaned++;
        }
      }

      if (cleaned > 0) {
      }
    } catch (error) {
      
    }
  }
}

export const profileStorageService = new ProfileStorageService();
export default profileStorageService;
