import { useState, useCallback } from 'react';
import { supabase } from '../config/supabase';

export interface PreviewContent {
  id: string;
  title: string;
  description?: string;
  content_type: 'video' | 'pdf' | 'text' | 'quiz';
  file_url?: string;
  duration?: number;
  is_free_preview: boolean;
  order_index: number;
}

export interface CoursePreview {
  id: string;
  title: string;
  description: string;
  instructor: string;
  category: string;
  thumbnail_url?: string;
  duration: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  rating: number;
  student_count: number;
  objectives: string[];
  requirements: string[];
  preview_content: PreviewContent[];
}

export const useCoursePreview = () => {
  const [previewData, setPreviewData] = useState<CoursePreview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCoursePreview = useCallback(async (courseId: string) => {
    setLoading(true);
    setError(null);

    try {
      
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select(`
          *,
          instructor:instructor_id (
            nombre,
            apellido_paterno,
            apellido_materno
          )
        `)
        .eq('id', courseId)
        .single();

      if (courseError) throw courseError;

      
      const { data: contentData, error: contentError } = await supabase
        .from('course_content')
        .select('*')
        .eq('course_id', courseId)
        .eq('is_free_preview', true)
        .order('order_index', { ascending: true });

      if (contentError) throw contentError;

      
      const { data: objectivesData } = await supabase
        .from('course_objectives')
        .select('description')
        .eq('course_id', courseId);

      const { data: requirementsData } = await supabase
        .from('course_requirements')
        .select('description')
        .eq('course_id', courseId);

      const preview: CoursePreview = {
        id: courseData.id,
        title: courseData.title,
        description: courseData.description,
        instructor: `${courseData.instructor.nombre} ${courseData.instructor.apellido_paterno}`,
        category: courseData.category,
        thumbnail_url: courseData.thumbnail_url,
        duration: courseData.duration,
        level: courseData.level,
        rating: courseData.rating || 0,
        student_count: courseData.student_count || 0,
        objectives: objectivesData?.map(obj => obj.description) || [],
        requirements: requirementsData?.map(req => req.description) || [],
        preview_content: contentData || []
      };

      setPreviewData(preview);
      return preview;
    } catch (error: any) {
      
      setError(error.message || 'Error cargando vista previa');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearPreview = useCallback(() => {
    setPreviewData(null);
    setError(null);
  }, []);

  return {
    previewData,
    loading,
    error,
    fetchCoursePreview,
    clearPreview
  };
};