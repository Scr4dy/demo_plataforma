import { supabase } from '../config/supabase';
import { logger } from '../utils/logger';

export interface AdminCoursePayload {
  id_curso?: number;
  titulo?: string;
  descripcion?: string;
  duracion?: number; 
  activo?: boolean; 
  metadata?: any;
  id_categoria?: number | null;
  id_instructor?: number; 
  fecha_inicio?: string;
  fecha_fin?: string;
  fecha_creacion?: string;
}

export const adminCourseService = {
  async listAll(): Promise<any[]> {
    try {
      
      const { data, error } = await supabase
        .from('cursos')
        .select(`
          id_curso,
          titulo,
          descripcion,
          duracion,
          activo,
          fecha_creacion,
          id_instructor,
          id_categoria,
          metadata,
          usuarios:id_instructor (
            id_usuario,
            nombre,
            apellido_paterno,
            apellido_materno
          ),
          categorias (nombre)
        `)
        .is('deleted_at', null) 
        .order('fecha_creacion', { ascending: false });

      if (error) {
        logger.data.error('[adminCourseService] Error listing courses:', error);
        throw error;
      }

      
      return (data || []).map(curso => {
        let instructorName = '';
        if (curso.usuarios) {
          const u = curso.usuarios;
          instructorName = `${u.nombre || ''} ${u.apellido_paterno || ''} ${u.apellido_materno || ''}`.trim();
        }

        return {
          ...curso,
          id: curso.id_curso,
          duracion_horas: curso.duracion || 0,
          activo_boolean: curso.activo,
          instructor: instructorName,
          categoria: curso.categorias?.nombre || curso.categoria || 'Sin categoría',
          usuarios: undefined, 
        };
      });
    } catch (err: any) {
      logger.data.error('Error listing all courses (admin):', err);
      throw err;
    }
  },

  async getById(cursoId: string): Promise<any | null> {
    try {
      
      const { data, error } = await supabase
        .from('cursos')
        .select(`
          *,
          usuarios:id_instructor (
            id_usuario,
            nombre,
            apellido_paterno,
            apellido_materno
          )
        `)
        .eq('id_curso', cursoId)
        .is('deleted_at', null) 
        .single();

      if (error) throw error;

      if (!data) return null;

      
      let instructorName = '';
      if (data.usuarios) {
        const u = data.usuarios;
        instructorName = `${u.nombre || ''} ${u.apellido_paterno || ''} ${u.apellido_materno || ''}`.trim();
      }

      
      return {
        ...data,
        id: data.id_curso,
        duracion_horas: data.duracion || 0,
        activo_boolean: data.activo,
        instructor: instructorName,
        usuarios: undefined, 
      };
    } catch (err: any) {
      logger.data.error('Error fetching course by id (admin):', err);
      throw err;
    }
  },

  async create(payload: AdminCoursePayload): Promise<any> {
    try {
      
      const courseData: any = {
        titulo: payload.titulo,
        descripcion: payload.descripcion || null,
        duracion: payload.duracion || 0, 
        id_instructor: payload.id_instructor,
        fecha_inicio: payload.fecha_inicio,
        fecha_fin: payload.fecha_fin,
        activo: payload.activo !== undefined ? payload.activo : true, 
        metadata: payload.metadata || {},
        id_categoria: payload.id_categoria || null
      };

      

      const { data, error } = await supabase
        .from('cursos')
        .insert([courseData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err: any) {
      logger.data.error('Error creating course (admin):', err);
      throw err;
    }
  },

  async update(cursoId: string, payload: AdminCoursePayload): Promise<any> {
    try {
      
      const updateData: any = {};

      if (payload.titulo !== undefined) updateData.titulo = payload.titulo;
      if (payload.descripcion !== undefined) updateData.descripcion = payload.descripcion;
      if (payload.duracion !== undefined) updateData.duracion = payload.duracion;
      if (payload.id_instructor !== undefined) updateData.id_instructor = payload.id_instructor;
      if (payload.fecha_inicio !== undefined) updateData.fecha_inicio = payload.fecha_inicio;
      if (payload.fecha_fin !== undefined) updateData.fecha_fin = payload.fecha_fin;
      if (payload.activo !== undefined) updateData.activo = payload.activo;
      if (payload.id_categoria !== undefined) updateData.id_categoria = payload.id_categoria;
      if (payload.metadata !== undefined) updateData.metadata = payload.metadata;

      const { error } = await supabase
        .from('cursos')
        .update(updateData)
        .eq('id_curso', cursoId);

      if (error) throw error;
      return true;
    } catch (err: any) {
      logger.data.error('Error updating course (admin):', err);
      throw err;
    }
  },

  async delete(cursoId: string): Promise<void> {
    try {
      
      const { data: { session } } = await supabase.auth.getSession();
      logger.info('[adminCourseService.delete] Session check:', {
        hasSession: !!session,
        userId: session?.user?.id,
        userEmail: session?.user?.email,
      });

      
      const { error } = await supabase
        .from('cursos')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id_curso', cursoId);

      if (error) {
        logger.data.error('[adminCourseService.delete] RLS Error Details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
          cursoId,
          sessionUserId: session?.user?.id,
        });
        throw error;
      }

      logger.data.delete('[adminCourseService.delete] Soft delete successful:', { cursoId });
    } catch (err: any) {
      logger.data.error('Error deleting course (admin):', err);
      throw err;
    }
  },
};

export default adminCourseService;
