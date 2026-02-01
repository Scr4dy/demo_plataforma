
import { supabase } from '../config/supabase';
import type { DBReporte, MVEstadisticasCursos } from '../types/database.types';

class ReportesService {
  
  async getReporteByCurso(cursoId: number): Promise<DBReporte | null> {
    try {
      const { data, error } = await supabase
        .from('reportes')
        .select('*')
        .eq('id_curso', cursoId)
        .single();

      if (error) {

        return null;
      }

      return data;
    } catch (error) {

      return null;
    }
  }

  
  async getAllReportes(): Promise<(DBReporte & { curso_titulo?: string })[]> {
    try {
      const { data, error } = await supabase
        .from('reportes')
        .select(`
          id_reporte,
          id_curso,
          total_inscritos,
          total_completados,
          tasa_completado,
          promedio_instructor,
          promedio_contenido,
          tiempo_promedio_completado,
          fecha_ultima_actualizacion,
          cursos:id_curso(titulo)
        `)
        .order('fecha_ultima_actualizacion', { ascending: false });

      if (error) {

        return [];
      }

      
      return (data || []).map((item: any) => ({
        ...item,
        curso_titulo: item.cursos?.titulo || null,
      }));
    } catch (error) {

      return [];
    }
  }

  
  async getEstadisticasCursos(): Promise<MVEstadisticasCursos[]> {
    try {
      const { data, error } = await supabase
        .from('mv_estadisticas_cursos')
        .select('*')
        .order('progreso_promedio', { ascending: false });

      if (error) {
        
        if ((error as any)?.code === '42501') {

        }
        return [];
      }

      return data || [];
    } catch (error) {

      return [];
    }
  }

  
  async refreshEstadisticas(): Promise<boolean> {
    try {
      
      const { error } = await supabase.rpc('refresh_estadisticas_cursos');

      if (error) {

        return false;
      }
      return true;
    } catch (error) {

      return false;
    }
  }

  
  async getMetricasGenerales() {
    try {
      const reportes = await this.getAllReportes();

      if (reportes.length === 0) {
        return {
          totalCursos: 0,
          totalInscritos: 0,
          totalCompletados: 0,
          promedioCompletado: 0,
          promedioAbandonados: 0,
          tasaCompletadoGeneral: 0,
        };
      }

      const totalInscritos = reportes.reduce((sum, r) => sum + (r.total_inscritos || 0), 0);
      const totalCompletados = reportes.reduce((sum, r) => sum + (r.total_completados || 0), 0);
      const tasaCompletadoGeneral = totalInscritos > 0
        ? ((totalCompletados / totalInscritos) * 100).toFixed(2)
        : 0;

      return {
        totalCursos: reportes.length,
        totalInscritos,
        totalCompletados,
        promedioCompletado: (reportes.reduce((sum, r) => sum + (r.tasa_completado || 0), 0) / reportes.length).toFixed(2),
        promedioAbandonados: (reportes.reduce((sum, r) => sum + (r.tasa_abandono || 0), 0) / reportes.length).toFixed(2),
        tasaCompletadoGeneral,
      };
    } catch (error) {

      return null;
    }
  }

  
  async getCursosBajoRendimiento(): Promise<(DBReporte & { curso_titulo?: string })[]> {
    try {
      const { data, error } = await supabase
        .from('reportes')
        .select('*, cursos:id_curso(titulo)')
        .lt('tasa_completado', 50)
        .order('tasa_completado', { ascending: true });

      if (error) {

        return [];
      }

      
      return (data || []).map((item: any) => ({
        ...item,
        curso_titulo: item.cursos?.titulo || null,
      }));
    } catch (error) {

      return [];
    }
  }

  
  async getCursosMejorEvaluados(limit: number = 10): Promise<DBReporte[]> {
    try {
      const { data, error } = await supabase
        .from('reportes')
        .select('*')
        .order('promedio_instructor', { ascending: false, nullsFirst: false })
        .limit(limit);

      if (error) {

        return [];
      }

      return data || [];
    } catch (error) {

      return [];
    }
  }
}

export const reportesService = new ReportesService();
export default reportesService;
