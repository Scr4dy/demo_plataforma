import { useState, useCallback } from 'react';
import { supabase } from '../config/supabase';

export interface SurveyQuestion {
  id: string;
  survey_id: string;
  question_text: string;
  question_type: 'multiple_choice' | 'text' | 'rating' | 'boolean';
  options?: string[];
  required: boolean;
  order_index: number;
}

export interface Survey {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  is_required: boolean;
  due_date?: string;
  questions: SurveyQuestion[];
}

export interface SurveyResponse {
  survey_id: string;
  responses: {
    question_id: string;
    answer: string | number | boolean;
  }[];
}

export const useSurveys = (courseId?: string) => {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchCourseSurveys = useCallback(async (targetCourseId?: string) => {
    const courseToUse = targetCourseId || courseId;
    if (!courseToUse) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('course_surveys')
        .select(`
          *,
          questions:survey_questions (
            *
          )
        `)
        .eq('course_id', courseToUse)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSurveys(data as Survey[] || []);
    } catch (error: any) {
      
      throw new Error(error.message || 'Error cargando encuestas');
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  const submitSurveyResponse = useCallback(async (
    surveyId: string, 
    responses: SurveyResponse['responses'],
    userId: string
  ) => {
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('survey_responses')
        .insert({
          survey_id: surveyId,
          user_id: userId,
          responses,
          submitted_at: new Date().toISOString()
        });

      if (error) throw error;

      
      await supabase
        .from('user_course_progress')
        .upsert({
          user_id: userId,
          course_id: surveys.find(s => s.id === surveyId)?.course_id,
          survey_completed: true,
          updated_at: new Date().toISOString()
        });

      return true;
    } catch (error: any) {
      
      throw new Error(error.message || 'Error enviando respuestas');
    } finally {
      setSubmitting(false);
    }
  }, [surveys]);

  const createSurvey = useCallback(async (surveyData: Partial<Survey>) => {
    try {
      const { data, error } = await supabase
        .from('course_surveys')
        .insert({
          course_id: surveyData.course_id,
          title: surveyData.title,
          description: surveyData.description,
          is_required: surveyData.is_required || false,
          due_date: surveyData.due_date
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error: any) {
      
      throw error;
    }
  }, []);

  const addQuestionToSurvey = useCallback(async (
    surveyId: string, 
    questionData: Partial<SurveyQuestion>
  ) => {
    try {
      const { data, error } = await supabase
        .from('survey_questions')
        .insert({
          survey_id: surveyId,
          question_text: questionData.question_text,
          question_type: questionData.question_type,
          options: questionData.options,
          required: questionData.required || false,
          order_index: questionData.order_index || 0
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error: any) {
      
      throw error;
    }
  }, []);

  const getSurveyResponses = useCallback(async (surveyId: string) => {
    try {
      const { data, error } = await supabase
        .from('survey_responses')
        .select('*')
        .eq('survey_id', surveyId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      
      return [];
    }
  }, []);

  return {
    surveys,
    loading,
    submitting,
    fetchCourseSurveys,
    submitSurveyResponse,
    createSurvey,
    addQuestionToSurvey,
    getSurveyResponses
  };
};
