
import { useState, useCallback } from 'react';
import { storageService } from '../services/storageService';

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UseStorageUploadResult {
  uploading: boolean;
  progress: UploadProgress | null;
  error: string | null;
  uploadCourseContent: (
    contenidoId: number,
    file: string,
    fileName: string,
    contentType?: string,
    options?: { upsert?: boolean }
  ) => Promise<{ url: string; path: string } | null>;
  uploadCertificate: (
    userId: number | string,
    courseId: number,
    pdfData: string | ArrayBuffer
  ) => Promise<{ url: string; path: string } | null>;
  uploadAvatar: (
    userId: number,
    imageUri: string
  ) => Promise<{ url: string; path: string } | null>;
  reset: () => void;
}

export function useStorageUpload(): UseStorageUploadResult {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setUploading(false);
    setProgress(null);
    setError(null);
  }, []);

  
  const uploadCourseContent = useCallback(
    async (
      contenidoId: number,
      file: string,
      fileName: string,
      contentType?: string,
      options?: { upsert?: boolean }
    ) => {
      try {
        setUploading(true);
        setError(null);
        setProgress({ loaded: 0, total: 100, percentage: 0 });

        const result = await storageService.uploadCourseContent(
          contenidoId,
          file,
          fileName,
          { contentType, upsert: options?.upsert }
        );

        setProgress({ loaded: 100, total: 100, percentage: 100 });
        setUploading(false);
        
        if (result && result.storedFileName && result.originalFileName && result.storedFileName !== result.originalFileName) {
          
        }
        return result;
      } catch (err: any) {
        
        const msg = err?.message || '';
        if (msg.toLowerCase().includes('already exists') || msg.toLowerCase().includes('resource already exists') || msg.toLowerCase().includes('file already exists')) {
          setError('El archivo ya existe. Puedes renombrarlo o reemplazarlo.');
        } else {
          setError(msg || 'Error al subir archivo');
        }
        setUploading(false);
        
        return null;
      }
    },
    []
  );

  
  const uploadCertificate = useCallback(
    async (userId: number | string, courseId: number, pdfData: string | ArrayBuffer) => {
      try {
        setUploading(true);
        setError(null);
        setProgress({ loaded: 0, total: 100, percentage: 0 });

        const result = await storageService.uploadCertificate(
          userId,
          courseId,
          pdfData
        );

        setProgress({ loaded: 100, total: 100, percentage: 100 });
        setUploading(false);

        return result;
      } catch (err: any) {
        setError(err.message || 'Error al subir certificado');
        setUploading(false);
        
        return null;
      }
    },
    []
  );

  
  const uploadAvatar = useCallback(async (userId: number, imageUri: string) => {
    try {
      setUploading(true);
      setError(null);
      setProgress({ loaded: 0, total: 100, percentage: 0 });

      const result = await storageService.uploadUserAvatar(userId, imageUri, {
        contentType: 'image/jpeg',
        upsert: true,
      });

      setProgress({ loaded: 100, total: 100, percentage: 100 });
      setUploading(false);

      return result;
    } catch (err: any) {
      setError(err.message || 'Error al subir avatar');
      setUploading(false);
      
      return null;
    }
  }, []);

  return {
    uploading,
    progress,
    error,
    uploadCourseContent,
    uploadCertificate,
    uploadAvatar,
    reset,
  };
}

export interface UseStorageDownloadResult {
  downloading: boolean;
  progress: UploadProgress | null;
  error: string | null;
  localUri: string | null;
  downloadCourseContent: (path: string, fileName: string) => Promise<string | null>;
  downloadCertificate: (path: string, fileName: string) => Promise<string | null>;
  reset: () => void;
}

export function useStorageDownload(): UseStorageDownloadResult {
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [localUri, setLocalUri] = useState<string | null>(null);

  const reset = useCallback(() => {
    setDownloading(false);
    setProgress(null);
    setError(null);
    setLocalUri(null);
  }, []);

  
  const downloadCourseContent = useCallback(
    async (path: string, fileName: string) => {
      try {
        setDownloading(true);
        setError(null);
        setProgress({ loaded: 0, total: 100, percentage: 0 });

        const uri = await storageService.downloadCourseContent(path, fileName);

        setProgress({ loaded: 100, total: 100, percentage: 100 });
        setLocalUri(uri);
        setDownloading(false);

        return uri;
      } catch (err: any) {
        setError(err.message || 'Error al descargar archivo');
        setDownloading(false);
        
        return null;
      }
    },
    []
  );

  
  const downloadCertificate = useCallback(
    async (path: string, fileName: string) => {
      try {
        setDownloading(true);
        setError(null);
        setProgress({ loaded: 0, total: 100, percentage: 0 });

        const uri = await storageService.downloadCertificate(path, fileName);

        setProgress({ loaded: 100, total: 100, percentage: 100 });
        setLocalUri(uri);
        setDownloading(false);

        return uri;
      } catch (err: any) {
        setError(err.message || 'Error al descargar certificado');
        setDownloading(false);
        
        return null;
      }
    },
    []
  );

  return {
    downloading,
    progress,
    error,
    localUri,
    downloadCourseContent,
    downloadCertificate,
    reset,
  };
}
