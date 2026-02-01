import { useState, useCallback } from 'react';
import { supabase } from '../config/supabase';
import { useUserRole } from './useUserRole';

export interface CompletionReport {
  id: string;
  user_id: string;
  course_id: string;
  completed_at: string;
  score?: number;
  time_spent: number;
  user: {
    nombre: string;
    apellido_paterno: string;
    apellido_materno: string;
    departamento: string;
    email: string;
  };
  course: {
    title: string;
    category: string;
    duration: number;
    instructor: string;
  };
}

export interface ReportFilters {
  dateRange: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
  startDate?: string;
  endDate?: string;
  department?: string;
  course?: string;
  instructor?: string;
}

export const useAdminReports = () => {
  const [completions, setCompletions] = useState<CompletionReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const { isAdmin } = useUserRole();

  const fetchCourseCompletions = useCallback(async (filters: ReportFilters = { dateRange: 'month' }) => {
    if (!isAdmin) {
      
      return;
    }

    setLoading(true);
    try {
      let query = supabase
        .from('course_completions')
        .select(`
          *,
          user:user_id (
            nombre,
            apellido_paterno,
            apellido_materno,
            departamento,
            email
          ),
          course:course_id (
            title,
            category,
            duration,
            instructor
          )
        `)
        .eq('status', 'completed');

      
      if (filters.dateRange !== 'custom') {
        const dateRange = getDateRange(filters.dateRange);
        query = query.gte('completed_at', dateRange.start);
        query = query.lte('completed_at', dateRange.end);
      } else if (filters.startDate && filters.endDate) {
        query = query.gte('completed_at', filters.startDate);
        query = query.lte('completed_at', filters.endDate);
      }

      
      if (filters.department && filters.department !== 'all') {
        query = query.eq('user.departamento', filters.department);
      }

      
      if (filters.course && filters.course !== 'all') {
        query = query.eq('course_id', filters.course);
      }

      const { data, error } = await query.order('completed_at', { ascending: false });

      if (error) throw error;
      setCompletions(data as CompletionReport[] || []);
      
      
      calculateStats(data || []);
    } catch (error: any) {
      
      throw new Error(error.message || 'Error cargando reportes');
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  const calculateStats = (data: CompletionReport[]) => {
    const totalCompletions = data.length;
    const totalHours = data.reduce((sum, item) => sum + (item.time_spent || 0), 0) / 3600;
    const averageTime = totalCompletions > 0 ? totalHours / totalCompletions : 0;
    
    
    const courseCounts = data.reduce((acc, item) => {
      acc[item.course.title] = (acc[item.course.title] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    const mostCompletedCourse = Object.entries(courseCounts)
      .sort(([,a], [,b]) => b - a)[0] || ['N/A', 0];

    
    const deptCounts = data.reduce((acc, item) => {
      acc[item.user.departamento] = (acc[item.user.departamento] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    const topDepartment = Object.entries(deptCounts)
      .sort(([,a], [,b]) => b - a)[0] || ['N/A', 0];

    setStats({
      totalCompletions,
      totalHours: Math.round(totalHours * 100) / 100,
      averageTime: Math.round(averageTime * 100) / 100,
      mostCompletedCourse: {
        name: mostCompletedCourse[0],
        count: mostCompletedCourse[1]
      },
      topDepartment: {
        name: topDepartment[0],
        count: topDepartment[1]
      },
      completionRate: calculateCompletionRate(data)
    });
  };

  const calculateCompletionRate = (data: CompletionReport[]): number => {
    
    
    return data.length > 0 ? Math.min(100, Math.round((data.length / 100) * 100)) : 0;
  };

  const exportToCSV = async (filters: ReportFilters) => {
    try {
      await fetchCourseCompletions(filters);
      
      const headers = ['Nombre', 'Departamento', 'Curso', 'Fecha Completado', 'Tiempo (horas)', 'Calificación'];
      const csvData = completions.map(completion => [
        `${completion.user.nombre} ${completion.user.apellido_paterno} ${completion.user.apellido_materno}`,
        completion.user.departamento,
        completion.course.title,
        new Date(completion.completed_at).toLocaleDateString('es-ES'),
        (completion.time_spent / 3600).toFixed(2),
        completion.score || 'N/A'
      ]);

      const csvContent = [headers, ...csvData]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');

      return csvContent;
    } catch (error) {
      
      throw error;
    }
  };

  return {
    completions,
    stats,
    loading,
    fetchCourseCompletions,
    exportToCSV
  };
};

const getDateRange = (range: string) => {
  const now = new Date();
  const start = new Date();

  switch (range) {
    case 'today':
      start.setHours(0, 0, 0, 0);
      break;
    case 'week':
      start.setDate(now.getDate() - 7);
      break;
    case 'month':
      start.setMonth(now.getMonth() - 1);
      break;
    case 'quarter':
      start.setMonth(now.getMonth() - 3);
      break;
    case 'year':
      start.setFullYear(now.getFullYear() - 1);
      break;
    default:
      start.setMonth(now.getMonth() - 1);
  }

  return {
    start: start.toISOString(),
    end: now.toISOString()
  };
};