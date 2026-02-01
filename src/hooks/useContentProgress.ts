
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../config/supabase';

export interface ContentProgressDetail {
  id_contenido: number;
  titulo: string;
  tipo: 'leccion' | 'evaluacion' | 'video' | 'recurso';
  obligatorio: boolean;
  completado: boolean;
  
  
  es_evaluacion: boolean;
  mejor_intento_porcentaje?: number | null;
  total_intentos?: number;
  aprobado?: boolean;
  cuenta_para_progreso: boolean;
  
  
  estado_texto?: string;
}

export interface CourseProgressSummary {
  progreso_porcentaje: number;
  total_contenidos_obligatorios: number;
  contenidos_completados: number;
  evaluaciones_pendientes: number;
  evaluaciones_reprobadas: number;
}

interface UseContentProgressReturn {
  detalleContenidos: ContentProgressDetail[];
  resumenProgreso: CourseProgressSummary | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useContentProgress = (
  idEmpleado: number | null,
  idCurso: number | null
): UseContentProgressReturn => {
  const [detalleContenidos, setDetalleContenidos] = useState<ContentProgressDetail[]>([]);
  const [resumenProgreso, setResumenProgreso] = useState<CourseProgressSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProgress = useCallback(async () => {
    if (!idEmpleado || !idCurso) {
      setDetalleContenidos([]);
      setResumenProgreso(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      
      
      
      try {
        await supabase.rpc('sync_quiz_progress', {
          p_id_empleado: idEmpleado,
          p_id_curso: idCurso
        });
      } catch (syncError: any) {
        
        
        
        
        const { data: quizzesAprobados } = await supabase
          .from('intentos_quiz')
          .select(`
            id_contenido,
            id_empleado,
            fecha_completado,
            contenidos!inner(id_curso)
          `)
          .eq('id_empleado', idEmpleado)
          .eq('contenidos.id_curso', idCurso)
          .gte('porcentaje', 80)
          .not('fecha_completado', 'is', null)
          .is('deleted_at', null);

        if (quizzesAprobados && quizzesAprobados.length > 0) {
          
          for (const quiz of quizzesAprobados) {
            await supabase
              .from('progreso_contenidos')
              .upsert({
                id_empleado: quiz.id_empleado,
                id_contenido: quiz.id_contenido,
                completado: true,
                fecha_completado: quiz.fecha_completado
              }, {
                onConflict: 'id_empleado,id_contenido'
              });
          }
        }
      }

      
      const { data: detalle, error: detalleError } = await supabase
        .rpc('detalle_progreso_usuario', {
          p_id_empleado: idEmpleado,
          p_id_curso: idCurso
        });

      if (detalleError) throw detalleError;

      
      const contenidosMapeados: ContentProgressDetail[] = (detalle || []).map((item: any) => {
        const esEvaluacion = item.es_evaluacion || false;
        const aprobado = item.aprobado || false;
        const mejorPorcentaje = item.mejor_intento_porcentaje;
        const totalIntentos = item.total_intentos || 0;

        
        let estadoTexto = 'Pendiente';
        if (esEvaluacion) {
          if (aprobado) {
            estadoTexto = `Aprobado (${mejorPorcentaje}%) ✅`;
          } else if (totalIntentos > 0) {
            estadoTexto = `Reprobado (${mejorPorcentaje}%) - Reintentar ♻️`;
          } else {
            estadoTexto = 'No iniciado';
          }
        } else {
          estadoTexto = item.completado ? 'Completado ✅' : 'Pendiente';
        }

        return {
          id_contenido: item.id_contenido,
          titulo: item.titulo,
          tipo: item.tipo,
          obligatorio: item.obligatorio,
          completado: item.completado,
          es_evaluacion: esEvaluacion,
          mejor_intento_porcentaje: mejorPorcentaje,
          total_intentos: totalIntentos,
          aprobado,
          cuenta_para_progreso: item.cuenta_para_progreso || false,
          estado_texto: estadoTexto
        };
      });

      setDetalleContenidos(contenidosMapeados);

      
      const { data: inscripcion, error: inscripcionError } = await supabase
        .from('inscripciones')
        .select('progreso')
        .eq('id_empleado', idEmpleado)
        .eq('id_curso', idCurso)
        .is('deleted_at', null)
        .single();

      if (inscripcionError && inscripcionError.code !== 'PGRST116') {
        throw inscripcionError;
      }

      
      const obligatorios = contenidosMapeados.filter(c => c.obligatorio);
      const completadosQueCompletan = obligatorios.filter(c => c.cuenta_para_progreso);
      const evaluacionesPendientes = obligatorios.filter(
        c => c.es_evaluacion && !c.aprobado && c.total_intentos === 0
      ).length;
      const evaluacionesReprobadas = obligatorios.filter(
        c => c.es_evaluacion && !c.aprobado && (c.total_intentos || 0) > 0
      ).length;

      setResumenProgreso({
        progreso_porcentaje: inscripcion?.progreso || 0,
        total_contenidos_obligatorios: obligatorios.length,
        contenidos_completados: completadosQueCompletan.length,
        evaluaciones_pendientes: evaluacionesPendientes,
        evaluaciones_reprobadas: evaluacionesReprobadas
      });

    } catch (err: any) {
      
      setError(err.message || 'Error al cargar el progreso');
    } finally {
      setLoading(false);
    }
  }, [idEmpleado, idCurso]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  return {
    detalleContenidos,
    resumenProgreso,
    loading,
    error,
    refetch: fetchProgress
  };
};

export default useContentProgress;
