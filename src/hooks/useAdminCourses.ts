import { useCallback, useEffect, useState } from 'react';
import { courseService } from '../services/courseService';

export const useAdminCourses = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCourses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await courseService.getAllCourses();
      setCourses(data || []);
    } catch (err: any) {
      setError(err.message || 'Error cargando cursos');
    } finally {
      setLoading(false);
    }
  }, []);

  const createCourse = useCallback(async (payload: any) => {
    setLoading(true);
    setError(null);
    try {
      const created = await courseService.createCourseAdmin(payload);
      setCourses(prev => [created, ...prev]);
      return created;
    } catch (err: any) {
      setError(err.message || 'Error creando curso');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCourse = useCallback(async (id: number, payload: any) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await courseService.updateCourseAdmin(id, payload);
      setCourses(prev => prev.map(c => (c.id === updated.id ? updated : c)));
      return updated;
    } catch (err: any) {
      setError(err.message || 'Error actualizando curso');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteCourse = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await courseService.deleteCourseAdmin(id);
      setCourses(prev => prev.filter(c => c.id !== id));
      return true;
    } catch (err: any) {
      setError(err.message || 'Error eliminando curso');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  return { courses, loading, error, loadCourses, createCourse, updateCourse, deleteCourse };
};

export default useAdminCourses;
