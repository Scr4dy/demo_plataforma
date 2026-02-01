
import { supabase } from '../config/supabase';
import type { DBProgresoContenido } from '../types/database.types';

class ProgresoContenidoService {
  
  async actualizarProgreso(data: {
    id_empleado: number;
    id_contenido: number;
    completado?: boolean;
    tiempo_dedicado?: number; 
    intentos?: number;
    ultima_posicion?: number; 
  }): Promise<DBProgresoContenido | null> {
    try {
      const updateData: any = {
        id_empleado: data.id_empleado,
        id_contenido: data.id_contenido,
      };

      
      if (data.completado !== undefined) {
        updateData.completado = data.completado;
        if (data.completado) {
          updateData.fecha_completado = new Date().toISOString();
        }
      }
      
      if (data.tiempo_dedicado !== undefined) {
        updateData.tiempo_dedicado = data.tiempo_dedicado;
      }
      
      if (data.intentos !== undefined) {
        updateData.intentos = data.intentos;
      }
      
      if (data.ultima_posicion !== undefined) {
        updateData.ultima_posicion = data.ultima_posicion;
      }

      const { data: result, error } = await supabase
        .from('progreso_contenidos')
        .upsert(updateData, {
          onConflict: 'id_empleado,id_contenido',
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

  
  async marcarCompletado(empleadoId: number, contenidoId: number): Promise<boolean> {
    try {
      const resultado = await this.actualizarProgreso({
        id_empleado: empleadoId,
        id_contenido: contenidoId,
        completado: true,
      });

      return !!resultado;
    } catch (error) {
      
      return false;
    }
  }

  
  async getProgreso(empleadoId: number, contenidoId: number): Promise<DBProgresoContenido | null> {
    try {
      const { data, error } = await supabase
        .from('progreso_contenidos')
        .select('*')
        .eq('id_empleado', empleadoId)
        .eq('id_contenido', contenidoId)
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

  
  async getProgresosByEmpleado(empleadoId: number): Promise<DBProgresoContenido[]> {
    try {
      const { data, error } = await supabase
        .from('progreso_contenidos')
        .select('*')
        .eq('id_empleado', empleadoId)
        .is('deleted_at', null)
        .order('fecha_inicio', { ascending: false });

      if (error) {
        
        return [];
      }

      return data || [];
    } catch (error) {
      
      return [];
    }
  }

  
  async getProgresosByModulo(empleadoId: number, moduloId: number): Promise<DBProgresoContenido[]> {
    try {
      
      const { data: contenidos, error: errorContenidos } = await supabase
        .from('contenidos')
        .select('id_contenido')
        .eq('id_modulo', moduloId)
        .is('deleted_at', null);

      if (errorContenidos || !contenidos) {
        
        return [];
      }

      const contenidoIds = contenidos.map(c => c.id_contenido);

      if (contenidoIds.length === 0) {
        return [];
      }

      
      const { data, error } = await supabase
        .from('progreso_contenidos')
        .select('*')
        .eq('id_empleado', empleadoId)
        .in('id_contenido', contenidoIds)
        .is('deleted_at', null);

      if (error) {
        
        return [];
      }

      return data || [];
    } catch (error) {
      
      return [];
    }
  }

  
  async getPorcentajeModulo(empleadoId: number, moduloId: number): Promise<number> {
    try {
      
      const { count: totalContenidos, error: errorTotal } = await supabase
        .from('contenidos')
        .select('*', { count: 'exact', head: true })
        .eq('id_modulo', moduloId)
        .is('deleted_at', null);

      if (errorTotal || !totalContenidos || totalContenidos === 0) {
        return 0;
      }

      
      const progresos = await this.getProgresosByModulo(empleadoId, moduloId);
      const completados = progresos.filter(p => p.completado).length;

      return Math.round((completados / totalContenidos) * 100);
    } catch (error) {
      
      return 0;
    }
  }

  
  async getEstadisticasCurso(empleadoId: number, cursoId: number): Promise<{
    totalContenidos: number;
    completados: number;
    porcentaje: number;
    tiempoTotal: number; 
    intentosTotales: number;
  }> {
    try {
      
      const { data: contenidos, error: errorContenidos } = await supabase
        .from('contenidos')
        .select('id_contenido')
        .eq('id_curso', cursoId)
        .is('deleted_at', null);

      if (errorContenidos || !contenidos) {
        return { totalContenidos: 0, completados: 0, porcentaje: 0, tiempoTotal: 0, intentosTotales: 0 };
      }

      const contenidoIds = contenidos.map(c => c.id_contenido);
      const totalContenidos = contenidoIds.length;

      if (totalContenidos === 0) {
        return { totalContenidos: 0, completados: 0, porcentaje: 0, tiempoTotal: 0, intentosTotales: 0 };
      }

      
      const { data: progresos, error } = await supabase
        .from('progreso_contenidos')
        .select('*')
        .eq('id_empleado', empleadoId)
        .in('id_contenido', contenidoIds)
        .is('deleted_at', null);

      if (error || !progresos) {
        return { totalContenidos, completados: 0, porcentaje: 0, tiempoTotal: 0, intentosTotales: 0 };
      }

      const completados = progresos.filter(p => p.completado).length;
      const tiempoTotal = progresos.reduce((sum, p) => sum + (p.tiempo_dedicado || 0), 0);
      const intentosTotales = progresos.reduce((sum, p) => sum + (p.intentos || 0), 0);
      const porcentaje = Math.round((completados / totalContenidos) * 100);

      return {
        totalContenidos,
        completados,
        porcentaje,
        tiempoTotal,
        intentosTotales,
      };
    } catch (error) {
      
      return { totalContenidos: 0, completados: 0, porcentaje: 0, tiempoTotal: 0, intentosTotales: 0 };
    }
  }

  
  async resetearProgreso(empleadoId: number, contenidoId: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('progreso_contenidos')
        .update({
          completado: false,
          fecha_completado: null,
          ultima_posicion: 0,
        })
        .eq('id_empleado', empleadoId)
        .eq('id_contenido', contenidoId);

      if (error) {
        
        return false;
      }
      return true;
    } catch (error) {
      
      return false;
    }
  }
}

export const progresoContenidoService = new ProgresoContenidoService();
export default progresoContenidoService;
