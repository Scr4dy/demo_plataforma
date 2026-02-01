
import { useState, useCallback } from 'react';
import { evaluacionesService } from '../services/evaluacionesService';
import type { DBEvaluacionContenido, DBEvaluacionInstructor } from '../types/database.types';

export const useEvaluaciones = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  
  const evaluarContenido = useCallback(async (data: {
    id_curso: number;
    id_empleado: number;
    utilidad: number;
    comprension: number;
    comentarios?: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const resultado = await evaluacionesService.evaluarContenido(data);
      if (!resultado) {
        throw new Error('No se pudo guardar la evaluación');
      }
      return resultado;
    } catch (err: any) {
      setError(err.message || 'Error guardando evaluación');
      
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  
  const evaluarInstructor = useCallback(async (data: {
    id_curso: number;
    id_empleado: number;
    puntuacion: number;
    comentarios?: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const resultado = await evaluacionesService.evaluarInstructor(data);
      if (!resultado) {
        throw new Error('No se pudo guardar la evaluación');
      }
      return resultado;
    } catch (err: any) {
      setError(err.message || 'Error guardando evaluación');
      
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  
  const obtenerEvaluacionContenido = useCallback(async (cursoId: number, empleadoId: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await evaluacionesService.getEvaluacionContenido(cursoId, empleadoId);
      return data;
    } catch (err: any) {
      setError(err.message || 'Error obteniendo evaluación');
      
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  
  const obtenerEvaluacionInstructor = useCallback(async (cursoId: number, empleadoId: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await evaluacionesService.getEvaluacionInstructor(cursoId, empleadoId);
      return data;
    } catch (err: any) {
      setError(err.message || 'Error obteniendo evaluación');
      
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  
  const obtenerPromedios = useCallback(async (cursoId: number) => {
    setLoading(true);
    setError(null);
    try {
      const [contenido, instructor] = await Promise.all([
        evaluacionesService.getPromedioContenido(cursoId),
        evaluacionesService.getPromedioInstructor(cursoId),
      ]);

      return {
        contenido,
        instructor,
      };
    } catch (err: any) {
      setError(err.message || 'Error obteniendo promedios');
      
      return { contenido: null, instructor: null };
    } finally {
      setLoading(false);
    }
  }, []);

  
  const verificarPuedeEvaluar = useCallback(async (cursoId: number, empleadoId: number) => {
    setLoading(true);
    setError(null);
    try {
      const puede = await evaluacionesService.puedeEvaluar(cursoId, empleadoId);
      return puede;
    } catch (err: any) {
      setError(err.message || 'Error verificando permisos');
      
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    evaluarContenido,
    evaluarInstructor,
    obtenerEvaluacionContenido,
    obtenerEvaluacionInstructor,
    obtenerPromedios,
    verificarPuedeEvaluar,
  };
};
