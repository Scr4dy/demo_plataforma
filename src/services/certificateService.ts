
import { CacheOptions } from '../types/cache.types';
import { supabase } from '../config/supabase';
import { AppConfig } from '../config/appConfig';

export interface Certificate {
  id: number; 
  titulo: string; 
  cursoId: number; 
  cursoNombre: string; 
  fechaEmision: string; 
  fechaExpiracion?: string; 
  codigoVerificacion: string; 
  estado: 'VIGENTE' | 'EXPIRADO' | 'PENDIENTE' | 'REVOCADO'; 
  urlDescarga?: string; 
  instructor: string; 
  duracionHoras?: number; 
  calificacion?: number; 
  fisicoEnviado?: boolean; 
}

class CertificateService {
  
  async getMyCertificates(options?: CacheOptions, userId?: string | number): Promise<Certificate[]> {
    try {
      let finalUserId = userId;

      if (!finalUserId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        
        const { data: uData } = await supabase
          .from('usuarios')
          .select('id_usuario')
          .eq('auth_id', user.id)
          .maybeSingle();

        if (!uData || !uData.id_usuario) {
          
          return [];
        }
        finalUserId = uData.id_usuario;
      }

      const { data, error } = await supabase
        .from('certificaciones')
        .select('*')
        .eq('id_usuario', finalUserId)
        .is('deleted_at', null)
        .order('fecha_emision', { ascending: false });

      if (error) {
        
        return [];
      }

      
      return (data || []).map((c: any) => ({
        id: c.id_certificado,
        titulo: `Certificado - ${c.curso_nombre}`,
        cursoId: c.id_curso,
        cursoNombre: c.curso_nombre,
        fechaEmision: c.fecha_emision,
        fechaExpiracion: undefined, 
        codigoVerificacion: c.codigo_certificado,
        estado: (c.estado === 'activo' ? 'VIGENTE' : (c.estado === 'revocado' ? 'REVOCADO' : 'PENDIENTE')) as any,
        urlDescarga: c.url_certificado,
        instructor: c.instructor_nombre || 'Instructor',
        duracionHoras: Number(c.tiempo_total_horas || 0),
        calificacion: Number(c.calificacion_final || 0),
        fisicoEnviado: Boolean(c.certificado_fisico_enviado)
      }));

    } catch (err) {
      
      return [];
    }
  }

  
  async getCertificateByCourse(courseId: number | string, userId: number | string): Promise<Certificate | null> {
    try {
      if (!userId || !courseId) return null;

      const { data, error } = await supabase
        .from('certificaciones')
        .select('*')
        .eq('id_usuario', userId)
        .eq('id_curso', courseId)
        .is('deleted_at', null)
        .maybeSingle();

      if (error) {
        
        return null;
      }

      if (!data) return null;

      const c = data;
      return {
        id: c.id_certificado,
        titulo: `Certificado - ${c.curso_nombre}`,
        cursoId: c.id_curso,
        cursoNombre: c.curso_nombre,
        fechaEmision: c.fecha_emision,
        fechaExpiracion: undefined,
        codigoVerificacion: c.codigo_certificado,
        estado: (c.estado === 'activo' ? 'VIGENTE' : (c.estado === 'revocado' ? 'REVOCADO' : 'PENDIENTE')) as any,
        urlDescarga: c.url_certificado,
        instructor: c.instructor_nombre || 'Instructor',
        duracionHoras: Number(c.tiempo_total_horas || 0),
        calificacion: Number(c.calificacion_final || 0),
        fisicoEnviado: Boolean(c.certificado_fisico_enviado)
      };
    } catch (err) {
      
      return null;
    }
  }

  
  async downloadCertificate(certificateId: number): Promise<{ url: string }> {
    try {
      const { data, error } = await supabase
        .from('certificaciones')
        .select('url_certificado')
        .eq('id_certificado', certificateId)
        .single();

      if (error) throw error;
      if (!data?.url_certificado) throw new Error('URL no encontrada');

      return { url: data.url_certificado };
    } catch (err) {
      
      
      return { url: '' };
    }
  }

  
  async requestCertificatesForCompleted(courseIds: number[], userId?: number, userEmail?: string, userName?: string): Promise<{ success: boolean; message: string; cursosNotificados?: number }> {
    try {
      
      const { notificationService } = await import('./notificationService');

      
      let finalUserId = userId;
      let finalUserEmail = userEmail;
      let finalUserName = userName;

      if (!finalUserId) {
        
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          
          return { success: false, message: 'Usuario no autenticado' };
        }

        
        const { data: userData, error: userError } = await supabase
          .from('usuarios')
          .select('id_usuario, nombre, apellido_paterno, apellido_materno, email, correo')
          .eq('auth_id', user.id)
          .maybeSingle();

        if (userError || !userData) {
          
          
          return { success: false, message: 'Error al obtener datos del usuario' };
        }

        finalUserId = userData.id_usuario;
        finalUserEmail = userData.correo || userData.email || user.email;
        finalUserName = `${userData.nombre || ''} ${userData.apellido_paterno || ''} ${userData.apellido_materno || ''}`.trim() || finalUserEmail || 'Usuario';
      }

      

      
      const { data: limiteData, error: limiteError } = await supabase
        .rpc('verificar_limite_solicitudes_diarias', {
          p_id_usuario: finalUserId,
          p_limite: 2
        });

      if (limiteError) {
        
        
      } else if (limiteData && limiteData.length > 0) {
        const limite = limiteData[0];
        

        if (!limite.puede_solicitar) {
          
          return {
            success: false,
            message: limite.mensaje || 'Has alcanzado el límite de 2 solicitudes por día. Intenta mañana.',
            cursosNotificados: 0
          };
        }
      }

      
      const { data: cursosElegibles, error: elegiblesError } = await supabase
        .rpc('obtener_cursos_elegibles_notificacion', {
          p_id_usuario: finalUserId
        });

      if (elegiblesError) {
        
        
      } else if (cursosElegibles) {
        

        
        const cursosPermitidos = cursosElegibles
          .filter((c: any) => {
            const matchId = courseIds.some(id => String(id) === String(c.id_curso));
            return c.puede_notificar && matchId;
          })
          .map((c: any) => c.id_curso);

        if (cursosPermitidos.length === 0) {
          const mensaje = courseIds.length === 1
            ? 'Este curso ya tiene certificado físico enviado y no requiere más notificaciones.'
            : 'Todos los cursos seleccionados ya tienen certificado físico enviado.';
          return {
            success: false,
            message: mensaje,
            cursosNotificados: 0
          };
        }

        
        courseIds = cursosPermitidos;
      }

      
      const { data: registroData, error: registroError } = await supabase
        .rpc('registrar_solicitud_certificado', {
          p_id_usuario: finalUserId,
          p_cursos_solicitados: courseIds
        });

      if (registroError) {
        
      } else if (registroData && registroData.length > 0) {
        const registro = registroData[0];
        

        if (!registro.exito) {
          return {
            success: false,
            message: registro.mensaje || 'No se pudo procesar la solicitud',
            cursosNotificados: 0
          };
        }
      }

      
      let cursosNotificados = 0;
      for (const courseId of courseIds) {
        try {
          
          const { data: cursoData } = await supabase
            .from('cursos')
            .select('titulo')
            .eq('id_curso', courseId)
            .maybeSingle();

          if (!cursoData) {
            
            continue;
          }

          

          
          await notificationService.notifyCourseCompletion({
            userId: String(finalUserId),
            courseId: Number(courseId),
            courseTitle: String(cursoData.titulo || 'Curso sin título'),
            userName: String(finalUserName || 'Usuario')
          });

          cursosNotificados++;
          

        } catch (notificationError) {
          
          
        }
      }

      return {
        success: true,
        message: `Notificaciones enviadas para ${cursosNotificados} curso${cursosNotificados !== 1 ? 's' : ''}`,
        cursosNotificados
      };
    } catch (err) {
      
      return { success: false, message: 'Error al procesar la solicitud' };
    }
  }

  
  async createCertificate(payload: { userId: number; courseId: number; path?: string; url?: string; titulo?: string; fechaEmision?: string }): Promise<boolean> {
    if (!payload.userId || !payload.courseId) return false;

    try {
      
      const { data: curso } = await supabase
        .from('cursos')
        .select(`
          titulo, 
          duracion, 
          id_instructor, 
          categoria,
          usuarios:id_instructor (nombre, apellido_paterno, apellido_materno)
        `)
        .eq('id_curso', payload.courseId)
        .single();

      const cursoNombre = curso?.titulo || `Curso ${payload.courseId}`;
      const duracion = curso?.duracion ? (curso.duracion / 60) : 0;

      
      let instructorNombre = 'Instructor del Curso';
      if (curso?.usuarios) {
        const u: any = curso.usuarios;
        
        const instr = Array.isArray(u) ? u[0] : u;
        if (instr) {
          instructorNombre = `${instr.nombre || ''} ${instr.apellido_paterno || ''} ${instr.apellido_materno || ''}`.trim();
        }
      } else if (curso?.id_instructor) {
        
        const { data: instr } = await supabase.from('usuarios').select('nombre, apellido_paterno').eq('id_usuario', curso.id_instructor).maybeSingle();
        if (instr) instructorNombre = `${instr.nombre || ''} ${instr.apellido_paterno || ''}`.trim();
      }

      if (!instructorNombre) instructorNombre = 'Instructor del Curso';

      
      const uniqueCode = `CERT-${payload.courseId}-${payload.userId}-${Date.now().toString().slice(-6)}`;

      
      const { error } = await supabase
        .from('certificaciones')
        .insert({
          id_usuario: payload.userId,
          id_curso: payload.courseId,
          codigo_certificado: uniqueCode,
          fecha_emision: payload.fechaEmision || new Date().toISOString(),
          fecha_completado: new Date().toISOString(),
          porcentaje_completado: 100,
          calificacion_final: 100, 
          tiempo_total_horas: duracion,
          url_certificado: payload.url,
          estado: 'activo',
          instructor_nombre: instructorNombre,
          instructor_firma_url: null,
          curso_nombre: cursoNombre,
          curso_descripcion: `Certificado del curso ${cursoNombre}`,
          curso_categoria: curso?.categoria || 'General',
          curso_duracion_horas: duracion
        });

      if (error) {
        
        return false;
      }

      return true;
    } catch (err) {
      
      return false;
    }
  }

  
  async verifyCertificate(code: string): Promise<{ valido: boolean; certificado: Certificate }> {
    try {
      const { data, error } = await supabase
        .from('certificaciones')
        .select('*')
        .eq('codigo_certificado', code)
        .maybeSingle();

      if (error || !data) return { valido: false, certificado: null as any };

      const cert: Certificate = {
        id: data.id_certificado,
        titulo: `Certificado - ${data.curso_nombre}`,
        cursoId: data.id_curso,
        cursoNombre: data.curso_nombre,
        fechaEmision: data.fecha_emision,
        codigoVerificacion: data.codigo_certificado,
        estado: (data.estado === 'activo' ? 'VIGENTE' : 'REVOCADO') as any,
        urlDescarga: data.url_certificado,
        instructor: data.instructor_nombre || '',
        duracionHoras: Number(data.tiempo_total_horas || 0),
        calificacion: Number(data.calificacion_final || 0)
      };

      return { valido: true, certificado: cert };
    } catch (err) {
      return { valido: false, certificado: null as any };
    }
  }
}

export const certificateService = new CertificateService();
export default certificateService;