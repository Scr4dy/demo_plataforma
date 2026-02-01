
import { supabase } from '../config/supabase';
import type { DBEvaluacionContenido, DBEvaluacionInstructor } from '../types/database.types';

class EvaluacionesService {
  

  
  async evaluarContenido(data: {
    id_curso: number;
    id_empleado: number;
    utilidad: number; 
    comprension: number; 
    comentarios?: string;
  }): Promise<DBEvaluacionContenido | null> {
    try {
      
      if (data.utilidad < 1 || data.utilidad > 5 || data.comprension < 1 || data.comprension > 5) {
        ');
        return null;
      }

      const { data: result, error } = await supabase
        .from('evaluaciones_contenido')
        .upsert({
          id_curso: data.id_curso,
          id_empleado: data.id_empleado,
          utilidad: data.utilidad,
          comprension: data.comprension,
          comentarios: data.comentarios || null,
          fecha_evaluacion: new Date().toISOString(),
        }, {
          onConflict: 'id_curso,id_empleado',
        })
        .select()
        .single();

      if (error) {
        
        return null;
      }
      return result;
    } catch (error) {
      
      return null;
    }
  }

  
  async getEvaluacionContenido(cursoId: number, empleadoId: number): Promise<DBEvaluacionContenido | null> {
    try {
      const { data, error } = await supabase
        .from('evaluaciones_contenido')
        .select('*')
        .eq('id_curso', cursoId)
        .eq('id_empleado', empleadoId)
        .is('deleted_at', null)
        .maybeSingle();

      if (error) {
        
        return null;
      }

      return data;
    } catch (error) {
      
      return null;
    }
  }

  
  async getEvaluacionesContenidoByCurso(cursoId: number): Promise<DBEvaluacionContenido[]> {
    try {
      const { data, error } = await supabase
        .from('evaluaciones_contenido')
        .select('*')
        .eq('id_curso', cursoId)
        .is('deleted_at', null)
        .order('fecha_evaluacion', { ascending: false });

      if (error) {
        
        return [];
      }

      return data || [];
    } catch (error) {
      
      return [];
    }
  }

  

  
  async evaluarInstructor(data: {
    id_curso: number;
    id_empleado: number;
    puntuacion: number; 
    comentarios?: string;
  }): Promise<DBEvaluacionInstructor | null> {
    try {
      
      if (data.puntuacion < 1 || data.puntuacion > 5) {
        ');
        return null;
      }

      const { data: result, error } = await supabase
        .from('evaluaciones_instructor')
        .upsert({
          id_curso: data.id_curso,
          id_empleado: data.id_empleado,
          puntuacion: data.puntuacion,
          comentarios: data.comentarios || null,
          fecha_evaluacion: new Date().toISOString(),
        }, {
          onConflict: 'id_curso,id_empleado',
        })
        .select()
        .single();

      if (error) {
        
        return null;
      }
      return result;
    } catch (error) {
      
      return null;
    }
  }

  
  async getEvaluacionInstructor(cursoId: number, empleadoId: number): Promise<DBEvaluacionInstructor | null> {
    try {
      const { data, error } = await supabase
        .from('evaluaciones_instructor')
        .select('*')
        .eq('id_curso', cursoId)
        .eq('id_empleado', empleadoId)
        .is('deleted_at', null)
        .maybeSingle();

      if (error) {
        
        return null;
      }

      return data;
    } catch (error) {
      
      return null;
    }
  }

  
  async getEvaluacionesInstructorByCurso(cursoId: number): Promise<DBEvaluacionInstructor[]> {
    try {
      const { data, error } = await supabase
        .from('evaluaciones_instructor')
        .select('*')
        .eq('id_curso', cursoId)
        .is('deleted_at', null)
        .order('fecha_evaluacion', { ascending: false });

      if (error) {
        
        return [];
      }

      return data || [];
    } catch (error) {
      
      return [];
    }
  }

  

  
  async getPromedioContenido(cursoId: number): Promise<{ utilidad: number; comprension: number; promedio: number } | null> {
    try {
      const evaluaciones = await this.getEvaluacionesContenidoByCurso(cursoId);
      
      if (evaluaciones.length === 0) {
        return null;
      }

      const utilidadPromedio = evaluaciones.reduce((sum, e) => sum + e.utilidad, 0) / evaluaciones.length;
      const comprensionPromedio = evaluaciones.reduce((sum, e) => sum + e.comprension, 0) / evaluaciones.length;
      const promedioGeneral = (utilidadPromedio + comprensionPromedio) / 2;

      return {
        utilidad: parseFloat(utilidadPromedio.toFixed(2)),
        comprension: parseFloat(comprensionPromedio.toFixed(2)),
        promedio: parseFloat(promedioGeneral.toFixed(2)),
      };
    } catch (error) {
      
      return null;
    }
  }

  
  async getPromedioInstructor(cursoId: number): Promise<number | null> {
    try {
      const evaluaciones = await this.getEvaluacionesInstructorByCurso(cursoId);
      
      if (evaluaciones.length === 0) {
        return null;
      }

      const promedio = evaluaciones.reduce((sum, e) => sum + e.puntuacion, 0) / evaluaciones.length;
      return parseFloat(promedio.toFixed(2));
    } catch (error) {
      
      return null;
    }
  }

  
  async puedeEvaluar(cursoId: number, empleadoId: number): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('inscripciones')
        .select('estado')
        .eq('id_curso', cursoId)
        .eq('id_empleado', empleadoId)
        .eq('estado', 'completado')
        .is('deleted_at', null)
        .maybeSingle();

      if (error) {
        
        return false;
      }

      return !!data;
    } catch (error) {
      
      return false;
    }
  }
}

export const evaluacionesService = new EvaluacionesService();
export default evaluacionesService;
