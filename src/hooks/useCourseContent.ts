import { useState } from 'react';
import { supabase } from '../config/supabase';
import * as FileSystem from 'expo-file-system/legacy';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';

export interface CourseContent {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  content_type: 'video' | 'pdf' | 'image' | 'quiz' | 'text' | 'audio';
  file_url?: string;
  file_size?: number;
  duration?: number;
  order_index: number;
  is_free_preview: boolean;
  created_at: string;
  updated_at: string;
}

export const useCourseContent = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadMedia = async (
    fileUri: string, 
    fileName: string, 
    courseId: string, 
    contentData: Partial<CourseContent>
  ) => {
    setUploading(true);
    setProgress(0);

    try {
      
      const fileExt = fileName.split('.').pop()?.toLowerCase();
      const fileType = getFileType(fileExt);
      
      const finalFileName = `${courseId}/${Date.now()}-${fileName}`;

      
      const { data: fileData, error: uploadError } = await supabase.storage
        .from('course-content')
        .upload(finalFileName, {
          uri: fileUri,
          type: getMimeType(fileExt),
          name: fileName
        } as any);

      if (uploadError) throw uploadError;

      
      const { data: urlData } = supabase.storage
        .from('course-content')
        .getPublicUrl(finalFileName);

      
      const { data: insertedContent, error: dbError } = await supabase
        .from('course_content')
        .insert({
          course_id: courseId,
          title: contentData.title,
          description: contentData.description,
          content_type: fileType,
          file_url: urlData.publicUrl,
          file_size: contentData.file_size,
          duration: contentData.duration,
          order_index: contentData.order_index || 0,
          is_free_preview: contentData.is_free_preview || false
        })
        .select()
        .single();

      if (dbError) throw dbError;

      return insertedContent;
    } catch (error: any) {
      
      throw new Error(error.message || 'Error subiendo archivo');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*', 'video/*', 'audio/*'],
        copyToCacheDirectory: true
      });

      if (result.canceled) return null;

      const asset = result.assets[0];
      return {
        uri: asset.uri,
        name: asset.name || 'document',
        size: asset.size || 0,
        mimeType: asset.mimeType
      };
    } catch (error) {
      
      throw error;
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (result.canceled) return null;

      const asset = result.assets[0];
      return {
        uri: asset.uri,
        name: `image-${Date.now()}.jpg`,
        size: 0, 
        mimeType: 'image/jpeg'
      };
    } catch (error) {
      
      throw error;
    }
  };

  const getCourseContent = async (courseId: string) => {
    try {
      const { data, error } = await supabase
        .from('course_content')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index', { ascending: true });

      if (error) throw error;
      return data as CourseContent[];
    } catch (error) {
      
      throw error;
    }
  };

  const deleteContent = async (contentId: string) => {
    try {
      const { error } = await supabase
        .from('course_content')
        .delete()
        .eq('id', contentId);

      if (error) throw error;
      return true;
    } catch (error) {
      
      throw error;
    }
  };

  return {
    uploading,
    progress,
    uploadMedia,
    pickDocument,
    pickImage,
    getCourseContent,
    deleteContent
  };
};

const getFileType = (fileExt?: string): CourseContent['content_type'] => {
  const videoExt = ['mp4', 'mov', 'avi', 'mkv', 'webm'];
  const audioExt = ['mp3', 'wav', 'm4a', 'aac'];
  const imageExt = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

  if (videoExt.includes(fileExt || '')) return 'video';
  if (audioExt.includes(fileExt || '')) return 'audio';
  if (imageExt.includes(fileExt || '')) return 'image';
  if (fileExt === 'pdf') return 'pdf';
  
  return 'text';
};

const getMimeType = (fileExt?: string): string => {
  const mimeTypes: { [key: string]: string } = {
    'pdf': 'application/pdf',
    'mp4': 'video/mp4',
    'mov': 'video/quicktime',
    'mp3': 'audio/mpeg',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png'
  };

  return mimeTypes[fileExt || ''] || 'application/octet-stream';
};