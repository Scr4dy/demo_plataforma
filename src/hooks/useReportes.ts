
import { useState, useEffect, useCallback } from 'react';
import { reportesService } from '../services/reportesService';
import type { DBReporte, MVEstadisticasCursos } from '../types/database.types';

export const useReportes = () => {
  const [reportes, setReportes] = useState<DBReporte[]>([]);
  const [estadisticas, setEstadisticas] = useState<MVEstadisticasCursos[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  
  const cargarReportes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await reportesService.getAllReportes();
      setReportes(data);
    } catch (err: any) {
      setError(err.message || 'Error cargando reportes');
      
    } finally {
      setLoading(false);
    }
  }, []);

  
  const cargarEstadisticas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await reportesService.getEstadisticasCursos();
      setEstadisticas(data);
    } catch (err: any) {
      setError(err.message || 'Error cargando estadísticas');
      
    } finally {
      setLoading(false);
    }
  }, []);

  
  const obtenerReporteCurso = useCallback(async (cursoId: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await reportesService.getReporteByCurso(cursoId);
      return data;
    } catch (err: any) {
      setError(err.message || 'Error obteniendo reporte');
      
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  
  const obtenerMetricas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await reportesService.getMetricasGenerales();
      return data;
    } catch (err: any) {
      setError(err.message || 'Error obteniendo métricas');
      
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  
  const obtenerCursosBajoRendimiento = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await reportesService.getCursosBajoRendimiento();
      return data;
    } catch (err: any) {
      setError(err.message || 'Error obteniendo cursos');
      
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    reportes,
    estadisticas,
    loading,
    error,
    cargarReportes,
    cargarEstadisticas,
    obtenerReporteCurso,
    obtenerMetricas,
    obtenerCursosBajoRendimiento,
  };
};
