import { supabase } from '../config/supabase';

export const moduleContentService = {
  async listFilesByModule(moduleId: number) {
    const { data, error } = await supabase
      .from('contenidos')
      .select('*')
      .eq('id_modulo', moduleId);
    if (error) throw error;
    
    
    return data || [];
  },

  async createFileRecord(payload: {
    module_id: number;
    course_id: number;
    original_filename: string;
    stored_path: string;
    mime?: string;
    size?: number;
    uploaded_by?: number;
    meta?: any;
  }) {
    const { data, error } = await supabase
      .from('contenidos')
      .insert([{
        id_modulo: payload.module_id,
        id_curso: payload.course_id,
        titulo: payload.original_filename,
        tipo: 'documento',
        contenido_data: payload.stored_path,
        duracion_estimada: 0,
        obligatorio: true
      }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async uploadAndCreateRecord(options: {
    courseId: number;
    moduleId: number;
    file: string | File;
    fileName: string;
    contentType?: string;
    upsert?: boolean;
    uploadedBy?: number;
    meta?: any;
  }) {
    const { courseId, moduleId, file, fileName, contentType, upsert, uploadedBy, meta } = options;

    
    const { storageService } = await import('./storageService');

    const uploadResult = await storageService.uploadModuleFile(
      courseId,
      moduleId,
      file,
      fileName,
      { contentType, upsert }
    );

    try {
      const record = await moduleContentService.createFileRecord({
        module_id: moduleId,
        course_id: courseId,
        original_filename: fileName,
        stored_path: uploadResult.path,
        mime: contentType,
        size: (file as any)?.size,
        uploaded_by: uploadedBy,
        meta: { url: uploadResult.url, storedFileName: uploadResult.storedFileName, ...meta },
      });

      
      return { upload: uploadResult, record };
    } catch (err) {
      
      try {
        await supabase.storage.from('course-content').remove([uploadResult.path]);
      } catch (removeErr) {
        
      }
      throw err;
    }
  },

  async deleteFileRecord(id: number) {
    const { error } = await supabase
      .from('contenidos')
      .delete()
      .eq('id_contenido', id);
    if (error) throw error;
    return true;
  },

  async deleteFile(id: number) {
    
    const { data: record, error: fetchErr } = await supabase
      .from('contenidos')
      .select('*')
      .eq('id_contenido', id)
      .maybeSingle();

    if (fetchErr) throw fetchErr;
    if (!record) throw new Error('Registro no encontrado');

    
    try {
      await supabase.storage.from('course-content').remove([record.stored_path]);
    } catch (err) {
      
    }

    
    return await moduleContentService.deleteFileRecord(id);
  },

  
  async associateFileToContenido(contenidoId: number, storedPath: string, originalFilename?: string, mime?: string, size?: number) {
    try {
      const payload: any = { url: storedPath };
      if (originalFilename) payload.titulo = originalFilename.replace(/\.[^.]+$/, '');

      const { data, error } = await supabase
        .from('contenidos')
        .update(payload)
        .eq('id_contenido', contenidoId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      
      throw err;
    }
  },

  
  async createContenidoFromFile(options: {
    courseId: number;
    moduleId: number;
    storedPath: string;
    originalFilename: string;
    tipo?: string;
    titulo?: string;
    descripcion?: string | null;
    orden?: number | null;
    duracion_estimada?: number | null;
    obligatorio?: boolean;
  }) {
    const { courseId, moduleId, storedPath, originalFilename, tipo = 'documento', titulo, descripcion = null, orden = null, duracion_estimada = null, obligatorio = true } = options;

    try {
      
      const { data: existing, error: existErr } = await supabase
        .from('contenidos')
        .select('*')
        .eq('id_modulo', moduleId)
        .eq('url', storedPath)
        .limit(1);

      if (!existErr && Array.isArray(existing) && existing.length > 0) {
        
        return { existed: true, record: existing[0] };
      }

      
      let finalOrden = orden;
      if (finalOrden === null || finalOrden === undefined) {
        try {
          const { data: lastRows } = await supabase
            .from('contenidos')
            .select('orden')
            .eq('id_modulo', moduleId)
            .order('orden', { ascending: false })
            .limit(1);
          if (Array.isArray(lastRows) && lastRows.length > 0 && typeof (lastRows[0] as any).orden === 'number') {
            finalOrden = (lastRows[0] as any).orden + 1;
          } else {
            finalOrden = 1;
          }
        } catch (e) {
          finalOrden = 1;
        }
      }

      const payload = {
        id_curso: courseId,
        id_modulo: moduleId,
        tipo,
        titulo: titulo || String(originalFilename).replace(/\.[^.]+$/, '') || 'Contenido',
        url: storedPath,
        descripcion,
        orden: finalOrden,
        duracion_estimada,
        obligatorio
      } as any;

      const { data: inserted, error: insertErr } = await supabase
        .from('contenidos')
        .insert([payload])
        .select()
        .single();

      if (insertErr) throw insertErr;
      return { existed: false, record: inserted };
    } catch (err) {
      
      throw err;
    }
  },

  
  createContenidoFromUrl: async (options: {
    courseId: number;
    moduleId: number;
    url: string;
    tipo?: string; 
    titulo?: string;
    descripcion?: string | null;
    orden?: number | null;
    duracion_estimada?: number | null;
    obligatorio?: boolean;
    contentMetadata?: any;
  }) => {
    const { courseId, moduleId, url, tipo = 'url_video', titulo, descripcion = null, orden = null, duracion_estimada = null, obligatorio = true, contentMetadata = {} } = options;
    try {
      
      const { data: existing, error: existErr } = await supabase
        .from('contenidos')
        .select('*')
        .eq('id_modulo', moduleId)
        .eq('url', url)
        .limit(1);

      if (!existErr && Array.isArray(existing) && existing.length > 0) {
        return { existed: true, record: existing[0] };
      }

      
      let finalOrden = orden;
      if (finalOrden === null || finalOrden === undefined) {
        try {
          const { data: lastRows } = await supabase
            .from('contenidos')
            .select('orden')
            .eq('id_modulo', moduleId)
            .order('orden', { ascending: false })
            .limit(1);
          if (Array.isArray(lastRows) && lastRows.length > 0 && typeof (lastRows[0] as any).orden === 'number') {
            finalOrden = (lastRows[0] as any).orden + 1;
          } else {
            finalOrden = 1;
          }
        } catch (e) {
          finalOrden = 1;
        }
      }

      const payload: any = {
        id_curso: courseId,
        id_modulo: moduleId,
        tipo,
        titulo: titulo || 'Contenido',
        url,
        descripcion,
        orden: finalOrden,
        duracion_estimada,
        obligatorio,
        content_metadata: contentMetadata
      };

      const { data: inserted, error: insertErr } = await supabase
        .from('contenidos')
        .insert([payload])
        .select()
        .single();

      if (insertErr) throw insertErr;
      return { existed: false, record: inserted };
    } catch (err) {
      
      throw err;
    }
  },
};
