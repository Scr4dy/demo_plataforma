
import { CacheOptions } from '../types/cache.types';
import { supabase } from '../config/supabase';
import { insertWithUsuarioAndCursoFallback } from '../utils/supabaseHelper';
import { getCourseDurationHours } from '../utils/courseHelpers';

import { Categoria } from './categoryService';

export interface Course {
  id: number; 
  id_curso?: number;
  titulo: string;
  descripcion: string;
  imagenUrl?: string;
  duracionHoras: number;
  duracion_horas?: number;
  duracion: number; 
  nivel?: 'PRINCIPIANTE' | 'INTERMEDIO' | 'AVANZADO';
  estado?: 'DISPONIBLE' | 'EN_CURSO' | 'COMPLETADO' | 'BLOQUEADO';
  progreso?: number;
  fecha_inicio?: string;
  fecha_fin?: string;
  fechaInicio?: string;
  fechaFin?: string;
  id_instructor: number; 
  instructor?: string;
  categoria: string | null;
  categorias?: Categoria; 
  activo: boolean; 
  activo_boolean?: boolean;
  metadata?: any;
  fecha_creacion?: string;
  deleted_at?: string | null;
  modulos?: Module[];
}

export interface Module {
  id: number;
  titulo: string;
  descripcion: string;
  duracion: number;
  orden: number;
  estado: 'COMPLETADO' | 'EN_CURSO' | 'BLOQUEADO' | 'DISPONIBLE';
  tipo: 'LECCION' | 'EVALUACION' | 'RECURSO';
  recursos?: Resource[];
}

export interface Resource {
  id: number;
  titulo: string;
  tipo: 'PDF' | 'VIDEO' | 'IMAGEN' | 'ENLACE';
  url: string;
  tamaño: string;
  duracion?: string;
}

export interface CourseProgress {
  cursoId: number;
  progreso: number;
  leccionesCompletadas: number;
  totalLecciones: number;
  ultimaAccion: string;
}

export interface CourseStats {
  totalCursos: number;
  cursosCompletados: number;
  cursosEnProgreso: number;
  cursosPendientes: number;
  certificaciones: number;
  evaluacionesCompletadas: number;
  totalHoras: number;
  proximosVencimientos: Course[];
}

class CourseService {
  
  async getMyCourses(options?: CacheOptions): Promise<Course[]> {
    try {
      const { data, error } = await supabase
        .from('cursos')
        .select(`*, usuarios:id_instructor (id_usuario, nombre, apellido_paterno, apellido_materno), categorias (nombre, color, icono)`)
        .eq('activo', 'true')
        .is('deleted_at', null)
        .order('titulo');
      if (error) throw error;
      
      return (data || []).map((c: any) => {
        let instructorName = '';
        if (c.usuarios) {
          const u = c.usuarios;
          instructorName = `${u.nombre || ''} ${u.apellido_paterno || ''} ${u.apellido_materno || ''}`.trim();
        }
        return {
          id: c.id || c.id_curso,
          titulo: c.titulo,
          descripcion: c.descripcion || '',
          imagenUrl: c.imagen || undefined,
          duracionHoras: Math.round((c.duracion || c.duracion_horas || 0) / 60),
          duracion_horas: getCourseDurationHours(c),
          nivel: 'PRINCIPIANTE',
          estado: 'DISPONIBLE',
          progreso: 0,
          instructor: instructorName || c.instructor || c.instructor_nombre || '',
          categoria: c.categorias?.nombre || c.categoria || 'Sin categoría',
          categorias: c.categorias 
        } as Course;
      });
    } catch (error) {
      
      
      return [];
    }
  }

  
  async getCourseStats(): Promise<CourseStats> {
    try {
      const [totalResp, completedResp, inProgressResp, certResp, evalResp, hoursResp] = await Promise.all([
        supabase.from('cursos').select('*', { head: true, count: 'exact' }).eq('activo', true),
        
        supabase.from('inscripciones').select('id', { head: true, count: 'exact' }).gte('progreso', 100),
        supabase.from('inscripciones').select('id', { head: true, count: 'exact' }).gte('progreso', 1).lt('progreso', 100),
        supabase.from('certificaciones').select('id_certificado', { head: true, count: 'exact' }),
        supabase.from('resultados_evaluacion').select('id', { head: true, count: 'exact' }),
        supabase.from('cursos').select('duracion')
      ]);
      const totalCursos = Number(totalResp.count || 0);
      const cursosCompletados = Number(completedResp.count || 0);
      const cursosEnProgreso = Number(inProgressResp.count || 0);
      const cursosPendientes = Math.max(0, totalCursos - cursosCompletados - cursosEnProgreso);
      const certificaciones = Number(certResp.count || 0);
      const evaluacionesCompletadas = Number(evalResp.count || 0);
      const durations = (hoursResp.data || []).map((r: any) => Number(r.duracion || 0));
      const totalHoras = durations.length ? durations.reduce((a: number, b: number) => a + b, 0) : 0;
      return {
        totalCursos,
        cursosCompletados,
        cursosEnProgreso,
        cursosPendientes,
        certificaciones,
        evaluacionesCompletadas,
        totalHoras,
        proximosVencimientos: []
      };
    } catch (err) {
      
      throw err;
    }
  }

  
  async getCourseDetail(courseId: number | string, options?: CacheOptions): Promise<Course> {
    try {
      const { data, error } = await supabase
        .from('cursos')
        .select(`*, usuarios:id_instructor (id_usuario, nombre, apellido_paterno, apellido_materno), categorias (nombre, color, icono)`)
        .eq('id_curso', Number(courseId))
        .is('deleted_at', null)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Curso no encontrado');

      const c: any = data;
      
      let instructorName = '';
      if (c.usuarios) {
        const u = c.usuarios;
        instructorName = `${u.nombre || ''} ${u.apellido_paterno || ''} ${u.apellido_materno || ''}`.trim();
      }
      const mapped: Course = {
        id: c.id_curso,
        id_curso: c.id_curso,
        titulo: c.titulo,
        descripcion: c.descripcion || '',
        imagenUrl: c.imagen || undefined,
        duracion: c.duracion,
        duracionHoras: c.duracion || 0,
        duracion_horas: c.duracion || 0,
        nivel: 'PRINCIPIANTE',
        estado: 'DISPONIBLE',
        progreso: 0,
        id_instructor: c.id_instructor,
        instructor: instructorName || (c.instructor && c.instructor !== 'Instructor' ? c.instructor : ''),
        categoria: c.categorias?.nombre || c.categoria || 'Sin categoría',
        categorias: c.categorias, 
        activo: c.activo,
        activo_boolean: c.activo,
        fecha_inicio: c.fecha_inicio,
        fecha_fin: c.fecha_fin,
        fechaInicio: c.fecha_inicio,
        fechaFin: c.fecha_fin,
        metadata: c.metadata,
        fecha_creacion: c.fecha_creacion,
        deleted_at: c.deleted_at
      };
      return mapped;
    } catch (err) {
      
      throw err;
    }
  }

  
  async getCourseById(courseId: number | string): Promise<Course> {
    return this.getCourseDetail(courseId);
  }

  
  async getAllCourses({ limit = 100, offset = 0 } = {}): Promise<Course[]> {
    try {
      const { data, error } = await supabase
        .from('cursos')
        .select(`*, usuarios:id_instructor (id_usuario, nombre, apellido_paterno, apellido_materno), categorias (nombre, color, icono)`)
        .is('deleted_at', null)
        .order('fecha_creacion', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      const rows = Array.isArray(data) ? data : [];
      return rows.map((c: any) => {
        let instructorName = '';
        if (c.usuarios) {
          const u = c.usuarios;
          instructorName = `${u.nombre || ''} ${u.apellido_paterno || ''} ${u.apellido_materno || ''}`.trim();
        }
        return {
          id: c.id_curso,
          id_curso: c.id_curso,
          titulo: c.titulo,
          descripcion: c.descripcion || '',
          imagenUrl: c.imagen || undefined,
          duracion: c.duracion,
          duracionHoras: c.duracion || 0,
          duracion_horas: c.duracion || 0,
          nivel: 'PRINCIPIANTE',
          estado: 'DISPONIBLE',
          progreso: 0,
          id_instructor: c.id_instructor,
          instructor: instructorName || (c.instructor && c.instructor !== 'Instructor' ? c.instructor : ''),
          categoria: c.categorias?.nombre || c.categoria || 'Sin categoría',
          categorias: c.categorias, 
          activo: c.activo,
          activo_boolean: c.activo,
          fecha_inicio: c.fecha_inicio,
          fecha_fin: c.fecha_fin,
          fechaInicio: c.fecha_inicio,
          fechaFin: c.fecha_fin,
          metadata: c.metadata,
          fecha_creacion: c.fecha_creacion,
          deleted_at: c.deleted_at
        } as Course;
      });
    } catch (err) {
      
      throw err;
    }
  }

  
  async updateCourseProgress(courseId: number, progress: number, usuarioId?: string): Promise<CourseProgress> {
    try {
      if (!usuarioId) {
        throw new Error('usuarioId required to update progress');
      }
      
      const userKeys = ['id_empleado', 'usuario_id', 'id_usuario', 'user_id'];
      const courseKeys = ['id_curso', 'curso_id', 'cursoId', 'id'];
      let finalError: any = null;
      for (const cKey of courseKeys) {
        for (const uKey of userKeys) {
          try {
            const { error } = await supabase
              .from('inscripciones')
              .update({ progreso: progress })
              .eq(cKey, courseId)
              .eq(uKey, usuarioId);
            if (error) {
              
              if (error.code === '42703' || error.message?.toLowerCase()?.includes('column')) {
                finalError = error;
                continue;
              }
              finalError = error;
              continue;
            }
            
            
            return { cursoId: courseId, progreso: progress, leccionesCompletadas: Math.floor(progress / 10), totalLecciones: 10, ultimaAccion: new Date().toISOString() };
          } catch (e: any) {
            finalError = e;
            if (e && (e.code === '42703' || e.message?.toLowerCase()?.includes('column'))) {
              
              continue;
            }
            
            throw e;
          }
        }
      }
      if (finalError) throw finalError;
      return { cursoId: courseId, progreso: progress, leccionesCompletadas: Math.floor(progress / 10), totalLecciones: 10, ultimaAccion: new Date().toISOString() };
    } catch (err) {
      
      throw err;
    }
  }

  
  async getCourseProgress(courseId: number, usuarioId?: string): Promise<{ id_inscripcion?: number; progreso?: number; estado?: string; fecha_ultima_actividad?: string; fecha_completado?: string; nota_final?: number } | null> {
    try {
      if (!usuarioId) return null;
      const userKeys = ['id_empleado', 'usuario_id', 'id_usuario', 'user_id'];
      const courseKeys = ['id_curso', 'curso_id', 'cursoId', 'id'];
      let lastError: any = null;
      for (const cKey of courseKeys) {
        for (const uKey of userKeys) {
          try {
            const { data, error } = await supabase
              .from('inscripciones')
              .select('id_inscripcion, progreso, estado, fecha_ultima_actividad, fecha_completado, nota_final')
              .eq(cKey, courseId)
              .eq(uKey, usuarioId)
              .single();
            if (error) {
              lastError = error;
              if (error.code === '42703' || error.code === 'PGRST205' || error.message?.toLowerCase()?.includes('column')) continue;
              continue;
            }
            
            return data || null;
          } catch (e: any) {
            lastError = e;
            if (e && (e.code === '42703' || e.message?.toLowerCase()?.includes('column'))) continue;
            throw e;
          }
        }
      }
      if (lastError && lastError.code !== '42703' && lastError.code !== 'PGRST205') throw lastError;
      return null;
    } catch (err) {
      
      throw err;
    }
  }

  
  async inscribirEnCurso(usuarioId: string, cursoId: number) {
    try {
      
      let empleadoId: any = usuarioId;
      try {
        let usuarioRecord: any = null;
        const { data: byAuth, error: errorByAuth } = await supabase.from('usuarios').select('id_usuario, id, auth_id, numero_empleado').eq('auth_id', usuarioId).maybeSingle();
        if (!errorByAuth && byAuth) usuarioRecord = byAuth;
        if (!usuarioRecord) {
          const { data: byId, error: errorById } = await supabase.from('usuarios').select('id_usuario, id, auth_id, numero_empleado').eq('id', usuarioId).maybeSingle();
          if (!errorById && byId) usuarioRecord = byId;
        }
        if (!usuarioRecord) {
          const { data: byNumber, error: errorByNumber } = await supabase.from('usuarios').select('id_usuario, id, auth_id, numero_empleado').eq('numero_empleado', usuarioId).maybeSingle();
          if (!errorByNumber && byNumber) usuarioRecord = byNumber;
        }
        if (!usuarioRecord) {
          
          const { data: byControl, error: errorByControl } = await supabase.from('usuarios').select('id_usuario, id, auth_id, numero_control').eq('numero_control', usuarioId).maybeSingle();
          if (!errorByControl && byControl) usuarioRecord = byControl;
        }
        if (usuarioRecord) {
          empleadoId = usuarioRecord.id_usuario || usuarioRecord.id || usuarioId;
        }
      } catch (e) {
        
      }

      const payload: any = {
        usuario_id: empleadoId,
        id_empleado: empleadoId,
        curso_id: cursoId,
        id_curso: cursoId,
        fecha_inscripcion: new Date().toISOString(),
        progreso: 0,
        estado: 'EN_CURSO'
      };
      const { data, error } = await insertWithUsuarioAndCursoFallback('inscripciones', payload);
      if (error) throw error;
      return data;
    } catch (error: any) {
      
      throw error;
    }
  }

  
  async createCourseAdmin(payload: any) {
    try {
      const { data, error } = await supabase.from('cursos').insert([payload]).select().single();
      if (error) throw error;
      return data;
    } catch (err) {
      :', err);
      throw err;
    }
  }

  
  async updateCourseAdmin(courseId: number, payload: any) {
    try {
      const { data, error } = await supabase.from('cursos').update(payload).eq('id', courseId).select().single();
      if (error) throw error;
      return data;
    } catch (err) {
      :', err);
      throw err;
    }
  }

  
  async deleteCourseAdmin(courseId: number) {
    try {
      const { data, error } = await supabase.from('cursos').delete().eq('id', courseId);
      if (error) throw error;
      return data;
    } catch (err) {
      :', err);
      throw err;
    }
  }

  
}

export const courseService = new CourseService();
export default courseService;