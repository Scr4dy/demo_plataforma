
import { useState, useCallback, useEffect } from 'react';
import { progresoContenidoService } from '../services/progresoContenidoService';
import type { DBProgresoContenido } from '../types/database.types';

export const useProgresoContenido = (empleadoId?: number, contenidoId?: number) => {
  const [progreso, setProgreso] = useState<DBProgresoContenido | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  
  useEffect(() => {
    if (empleadoId && contenidoId) {
      cargarProgreso();
    }
  }, [empleadoId, contenidoId]);

  
  const cargarProgreso = useCallback(async () => {
    if (!empleadoId || !contenidoId) return;

    setLoading(true);
    setError(null);
    try {
      const data = await progresoContenidoService.getProgreso(empleadoId, contenidoId);
      setProgreso(data);
    } catch (err: any) {
      setError(err.message || 'Error cargando progreso');
      
    } finally {
      setLoading(false);
    }
  }, [empleadoId, contenidoId]);

  
  const actualizarProgreso = useCallback(async (data: {
    id_empleado: number;
    id_contenido: number;
    completado?: boolean;
    tiempo_dedicado?: number;
    intentos?: number;
    ultima_posicion?: number;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const resultado = await progresoContenidoService.actualizarProgreso(data);
      if (resultado) {
        setProgreso(resultado);
      }
      return resultado;
    } catch (err: any) {
      setError(err.message || 'Error actualizando progreso');
      
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  
  const marcarCompletado = useCallback(async (empId: number, contId: number) => {
    setLoading(true);
    setError(null);
    try {
      const exito = await progresoContenidoService.marcarCompletado(empId, contId);
      if (exito && empleadoId === empId && contenidoId === contId) {
        await cargarProgreso();
      }
      return exito;
    } catch (err: any) {
      setError(err.message || 'Error marcando completado');
      
      return false;
    } finally {
      setLoading(false);
    }
  }, [empleadoId, contenidoId, cargarProgreso]);

  
  const obtenerEstadisticasCurso = useCallback(async (empId: number, cursoId: number) => {
    setLoading(true);
    setError(null);
    try {
      const stats = await progresoContenidoService.getEstadisticasCurso(empId, cursoId);
      return stats;
    } catch (err: any) {
      setError(err.message || 'Error obteniendo estadísticas');
      
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  
  const obtenerPorcentajeModulo = useCallback(async (empId: number, moduloId: number) => {
    setLoading(true);
    setError(null);
    try {
      const porcentaje = await progresoContenidoService.getPorcentajeModulo(empId, moduloId);
      return porcentaje;
    } catch (err: any) {
      setError(err.message || 'Error obteniendo porcentaje');
      
      return 0;
    } finally {
      setLoading(false);
    }
  }, []);

  
  const resetearProgreso = useCallback(async (empId: number, contId: number) => {
    setLoading(true);
    setError(null);
    try {
      const exito = await progresoContenidoService.resetearProgreso(empId, contId);
      if (exito && empleadoId === empId && contenidoId === contId) {
        await cargarProgreso();
      }
      return exito;
    } catch (err: any) {
      setError(err.message || 'Error reseteando progreso');
      
      return false;
    } finally {
      setLoading(false);
    }
  }, [empleadoId, contenidoId, cargarProgreso]);

  return {
    progreso,
    loading,
    error,
    cargarProgreso,
    actualizarProgreso,
    marcarCompletado,
    obtenerEstadisticasCurso,
    obtenerPorcentajeModulo,
    resetearProgreso,
  };
};
