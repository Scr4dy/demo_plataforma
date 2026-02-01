
import { supabase } from '../config/supabase';
import * as FileSystem from 'expo-file-system/legacy';

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  
  let binaryString: string;
  if (typeof atob === 'function') {
    binaryString = atob(base64);
  } else if (typeof Buffer !== 'undefined') {
    binaryString = Buffer.from(base64, 'base64').toString('binary');
  } else {
    
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let str = base64.replace(/=+$/, '');
    let output = '';
    for (let bc = 0, bs: number = 0, buffer: any, idx = 0; buffer = str.charAt(idx++); ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer, bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0) {
      buffer = chars.indexOf(buffer as any);
    }
    binaryString = output;
  }

  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

export interface UploadOptions {
  contentType?: string;
  cacheControl?: string;
  upsert?: boolean;
}

export interface FileMetadata {
  name: string;
  size: number;
  mimeType: string;
  lastModified: number;
}

class StorageService {
  
  
  

  
  async uploadCourseContent(
    contenidoId: number,
    file: string | File,
    fileName: string,
    options?: UploadOptions
  ): Promise<{ url: string; path: string; storedFileName?: string; originalFileName?: string }> {
    try {
      
      function sanitizeFileName(name: string): string {
        if (!name) return 'file';
        
        let sanitized = name.normalize('NFKD').replace(/\p{Diacritic}/gu, '');
        
        sanitized = sanitized.replace(/[/\\]+/g, '_');
        
        sanitized = sanitized.replace(/[^a-zA-Z0-9._\-]/g, '_');
        
        sanitized = sanitized.replace(/_+/g, '_');
        
        sanitized = sanitized.substring(0, 200).trim();
        if (sanitized.length === 0) sanitized = 'file';
        return sanitized;
      }

      const safeFileName = sanitizeFileName(fileName);
      const path = `${contenidoId}/${safeFileName}`;
      let fileData: ArrayBuffer | Blob;

      
      if (typeof file === 'string') {
        const base64 = await FileSystem.readAsStringAsync(file, {
          encoding: FileSystem.EncodingType.Base64,
        });
        fileData = base64ToArrayBuffer(base64);
      } else {
        
        fileData = file;
      }

      const { data, error } = await supabase.storage
        .from('course-content')
        .upload(path, fileData, {
          contentType: options?.contentType,
          cacheControl: options?.cacheControl || '3600',
          upsert: options?.upsert || false,
        });

      if (error) throw error;

      
      const { data: urlData } = await supabase.storage
        .from('course-content')
        .createSignedUrl(path, 31536000); 

      return {
        url: urlData?.signedUrl || '',
        path: data.path,
        storedFileName: safeFileName,
        originalFileName: fileName,
      };
    } catch (error: any) {
      
      
      if (String(error?.message || '').toLowerCase().includes('invalid key')) {
        throw new Error(`Nombre de archivo inválido para storage: "${fileName}". Se recomienda usar solo letras, números, guiones, guión bajo y punto.`);
      }
      throw error;
    }
  }

  
  async uploadModuleFile(
    courseId: number,
    moduleId: number,
    file: string | File,
    fileName: string,
    options?: UploadOptions
  ): Promise<{ url: string; path: string; storedFileName?: string; originalFileName?: string; }> {
    try {
      function sanitizeFileName(name: string): string {
        if (!name) return 'file';
        let sanitized = name.normalize('NFKD').replace(/\p{Diacritic}/gu, '');
        sanitized = sanitized.replace(/[/\\]+/g, '_');
        sanitized = sanitized.replace(/[^a-zA-Z0-9._\-]/g, '_');
        sanitized = sanitized.replace(/_+/g, '_');
        sanitized = sanitized.substring(0, 200).trim();
        if (sanitized.length === 0) sanitized = 'file';
        return sanitized;
      }

      const safeFileName = sanitizeFileName(fileName);
      const storedFileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}_${safeFileName}`;
      const path = `${courseId}/modules/${moduleId}/${storedFileName}`;

      let fileData: ArrayBuffer | Blob;
      if (typeof file === 'string') {
        const base64 = await FileSystem.readAsStringAsync(file, {
          encoding: FileSystem.EncodingType.Base64,
        });
        fileData = base64ToArrayBuffer(base64);
      } else {
        fileData = file;
      }

      const { data, error } = await supabase.storage
        .from('course-content')
        .upload(path, fileData, {
          contentType: options?.contentType,
          cacheControl: options?.cacheControl || '3600',
          upsert: options?.upsert || false,
        });

      if (error) throw error;

      const { data: urlData } = await supabase.storage
        .from('course-content')
        .createSignedUrl(path, 31536000);

      return {
        url: urlData?.signedUrl || '',
        path: data.path,
        storedFileName: storedFileName,
        originalFileName: fileName,
      };
    } catch (err: any) {
      
      throw err;
    }
  }

  
  async getCourseContentUrl(path: string, expiresIn: number = 3600): Promise<string> {
    try {
      const { data, error } = await supabase.storage
        .from('course-content')
        .createSignedUrl(path, expiresIn);

      if (error) throw error;
      return data.signedUrl;
    } catch (error) {
      
      throw error;
    }
  }

  
  async downloadCourseContent(path: string, localFileName: string): Promise<string> {
    try {
      const url = await this.getCourseContentUrl(path, 3600);
      const localUri = `${FileSystem.documentDirectory}${localFileName}`;

      const downloadResult = await FileSystem.downloadAsync(url, localUri);
      return downloadResult.uri;
    } catch (error) {
      
      throw error;
    }
  }

  
  async deleteCourseContent(path: string): Promise<void> {
    try {
      const { error } = await supabase.storage
        .from('course-content')
        .remove([path]);

      if (error) throw error;
    } catch (error) {
      
      throw error;
    }
  }

  
  async listCourseContent(contenidoId: number): Promise<FileMetadata[]> {
    try {
      const { data, error } = await supabase.storage
        .from('course-content')
        .list(`${contenidoId}/`, {
          limit: 100,
          sortBy: { column: 'name', order: 'asc' },
        });

      if (error) throw error;

      return (data || []).map((file: any) => ({
        name: file.name,
        size: file.metadata?.size || 0,
        mimeType: file.metadata?.mimetype || '',
        lastModified: new Date(file.updated_at).getTime(),
      }));
    } catch (error) {
      
      throw error;
    }
  }

  
  
  

  
  async uploadCertificate(
    userIdentifier: number | string,
    courseId: number,
    pdfData: string | ArrayBuffer
  ): Promise<{ url: string; path: string }> {
    try {
      
      let folderId = String(userIdentifier);
      try {
        if (typeof userIdentifier === 'number' || (/^\d+$/.test(String(userIdentifier)))) {
          const idNum = Number(userIdentifier);
          const { data: u } = await supabase.from('usuarios').select('numero_control').eq('id_usuario', idNum).maybeSingle();
          if (u && u.numero_control) {
            folderId = String(u.numero_control);
          }
        }
        if (folderId === String(userIdentifier) && typeof userIdentifier === 'string') {
          
          const { data: uByEmpleado } = await supabase.from('usuarios').select('numero_control').eq('numero_empleado', userIdentifier).maybeSingle();
          if (uByEmpleado && uByEmpleado.numero_control) {
            folderId = String(uByEmpleado.numero_control);
          } else {
            
            const { data: uByControl } = await supabase.from('usuarios').select('numero_control').eq('numero_control', userIdentifier).maybeSingle();
            if (uByControl && uByControl.numero_control) {
              folderId = String(uByControl.numero_control);
            }
          }
        }
      } catch (e) {
        
        
      }

      const fileName = `certificate_${courseId}_${Date.now()}.pdf`;
      const path = `${folderId}/${fileName}`;

      let fileData: ArrayBuffer;
      if (typeof pdfData === 'string') {
        fileData = base64ToArrayBuffer(pdfData);
      } else {
        fileData = pdfData;
      }

      const { data, error } = await supabase.storage
        .from('certificates')
        .upload(path, fileData, {
          contentType: 'application/pdf',
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      const { data: urlData } = await supabase.storage
        .from('certificates')
        .createSignedUrl(path, 31536000); 

      return {
        url: urlData?.signedUrl || '',
        path: data.path,
      };
    } catch (error) {
      
      throw error;
    }
  }

  
  async getCertificateUrl(path: string, expiresIn: number = 3600): Promise<string> {
    try {
      const { data, error } = await supabase.storage
        .from('certificates')
        .createSignedUrl(path, expiresIn);

      if (error) throw error;
      return data.signedUrl;
    } catch (error) {
      
      throw error;
    }
  }

  
  async downloadCertificate(path: string, fileName: string): Promise<string> {
    try {
      const url = await this.getCertificateUrl(path, 3600);
      const localUri = `${FileSystem.documentDirectory}${fileName}`;

      const downloadResult = await FileSystem.downloadAsync(url, localUri);
      return downloadResult.uri;
    } catch (error) {
      
      throw error;
    }
  }

  
  async listUserCertificates(userId: number): Promise<FileMetadata[]> {
    try {
      const { data, error } = await supabase.storage
        .from('certificates')
        .list(`${userId}/`, {
          limit: 100,
          sortBy: { column: 'created_at', order: 'desc' },
        });

      if (error) throw error;

      return (data || []).map((file: any) => ({
        name: file.name,
        size: file.metadata?.size || 0,
        mimeType: file.metadata?.mimetype || 'application/pdf',
        lastModified: new Date(file.created_at).getTime(),
      }));
    } catch (error) {
      
      throw error;
    }
  }

  
  
  

  
  async uploadUserAvatar(
    userId: number,
    imageUri: string,
    options?: UploadOptions
  ): Promise<{ url: string; path: string }> {
    try {
      const fileName = `avatar_${Date.now()}.jpg`;
      const path = `${userId}/${fileName}`;

      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const fileData = base64ToArrayBuffer(base64);

      const { data, error } = await supabase.storage
        .from('user-config')
        .upload(path, fileData, {
          contentType: options?.contentType || 'image/jpeg',
          cacheControl: options?.cacheControl || '3600',
          upsert: options?.upsert || true,
        });

      if (error) throw error;

      const { data: urlData } = await supabase.storage
        .from('user-config')
        .createSignedUrl(path, 31536000);

      return {
        url: urlData?.signedUrl || '',
        path: data.path,
      };
    } catch (error) {
      
      throw error;
    }
  }

  
  async getUserAvatarUrl(userId: number): Promise<string | null> {
    try {
      const { data: files } = await supabase.storage
        .from('user-config')
        .list(`${userId}/`, {
          limit: 1,
          sortBy: { column: 'created_at', order: 'desc' },
        });

      if (!files || files.length === 0) return null;

      const path = `${userId}/${files[0].name}`;
      const { data, error } = await supabase.storage
        .from('user-config')
        .createSignedUrl(path, 3600);

      if (error) throw error;
      return data.signedUrl;
    } catch (error) {
      
      return null;
    }
  }

  
  async deleteUserConfigFile(userId: number, fileName: string): Promise<void> {
    try {
      const path = `${userId}/${fileName}`;
      const { error } = await supabase.storage
        .from('user-config')
        .remove([path]);

      if (error) throw error;
    } catch (error) {
      
      throw error;
    }
  }
}

export const storageService = new StorageService();
export default storageService;
