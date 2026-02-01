
import { supabase } from '../config/supabase';
import { PreguntaQuiz, OpcionRespuesta, IntentoQuiz, RespuestaUsuario, ResultadoQuiz } from '../types/quiz.types';

class QuizService {
  
  async getPreguntasQuiz(idContenido: number): Promise<PreguntaQuiz[]> {
    try {
      
      const { data: preguntas, error: preguntasError } = await supabase
        .from('preguntas_quiz')
        .select('*')
        .eq('id_contenido', idContenido)
        .is('deleted_at', null)
        .order('orden', { ascending: true });

      if (preguntasError) throw preguntasError;
      if (!preguntas || preguntas.length === 0) {
        return [];
      }

      
      const preguntaIds = preguntas.map(p => p.id_pregunta);
      const { data: opciones, error: opcionesError } = await supabase
        .from('opciones_respuesta')
        .select('*')
        .in('id_pregunta', preguntaIds)
        .is('deleted_at', null)
        .order('orden', { ascending: true });

      if (opcionesError) throw opcionesError;

      
      const preguntasConOpciones: PreguntaQuiz[] = preguntas.map(pregunta => ({
        ...pregunta,
        opciones: opciones?.filter(op => op.id_pregunta === pregunta.id_pregunta) || []
      }));
      return preguntasConOpciones;
    } catch (error) {
      
      throw error;
    }
  }

  
  async iniciarIntento(idContenido: number, idEmpleado: number): Promise<IntentoQuiz> {
    try {
      const { data, error } = await supabase
        .from('intentos_quiz')
        .insert({
          id_contenido: idContenido,
          id_empleado: idEmpleado,
          fecha_inicio: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      
      throw error;
    }
  }

  
  async guardarRespuesta(respuesta: RespuestaUsuario): Promise<void> {
    try {
      const { error } = await supabase
        .from('respuestas_usuario')
        .insert(respuesta);

      if (error) throw error;
    } catch (error) {
      
      throw error;
    }
  }

  
  async calificarQuiz(
    idIntento: number,
    preguntas: PreguntaQuiz[],
    respuestas: Map<number, number | string>
  ): Promise<ResultadoQuiz> {
    try {
      let puntosObtenidos = 0;
      let puntosTotales = 0;
      let respuestasCorrectas = 0;
      const respuestasUsuario: RespuestaUsuario[] = [];

      
      for (const pregunta of preguntas) {
        puntosTotales += pregunta.puntos;
        const respuestaUsuario = respuestas.get(pregunta.id_pregunta);
        let esCorrecta = false;
        let puntosEstaRespuesta = 0;

        if (pregunta.tipo_pregunta === 'multiple' || pregunta.tipo_pregunta === 'verdadero_falso') {
          const opcionSeleccionada = pregunta.opciones?.find(op => op.id_opcion === respuestaUsuario);
          esCorrecta = opcionSeleccionada?.es_correcta || false;
          
          if (esCorrecta) {
            puntosEstaRespuesta = pregunta.puntos;
            puntosObtenidos += pregunta.puntos;
            respuestasCorrectas++;
          }

          respuestasUsuario.push({
            id_intento: idIntento,
            id_pregunta: pregunta.id_pregunta,
            id_opcion: respuestaUsuario as number,
            es_correcta: esCorrecta,
            puntos_obtenidos: puntosEstaRespuesta
          });
        } else if (pregunta.tipo_pregunta === 'texto') {
          
          
          respuestasUsuario.push({
            id_intento: idIntento,
            id_pregunta: pregunta.id_pregunta,
            respuesta_texto: respuestaUsuario as string,
            es_correcta: null as any, 
            puntos_obtenidos: null as any
          });
        }
      }

      
      const { error: respuestasError } = await supabase
        .from('respuestas_usuario')
        .insert(respuestasUsuario);

      if (respuestasError) throw respuestasError;

      
      const porcentaje = puntosTotales > 0 ? (puntosObtenidos / puntosTotales) * 100 : 0;
      const aprobado = porcentaje >= 80;

      
      const { data: intentoData } = await supabase
        .from('intentos_quiz')
        .select('fecha_inicio')
        .eq('id_intento', idIntento)
        .single();

      const tiempoEmpleado = intentoData 
        ? Math.floor((Date.now() - new Date(intentoData.fecha_inicio).getTime()) / 1000)
        : 0;

      
      const { error: updateError } = await supabase
        .from('intentos_quiz')
        .update({
          fecha_completado: new Date().toISOString(),
          puntos_obtenidos: puntosObtenidos,
          puntos_totales: puntosTotales,
          porcentaje: porcentaje,
          aprobado: aprobado,
          tiempo_empleado: tiempoEmpleado
        })
        .eq('id_intento', idIntento);

      if (updateError) throw updateError;

      const resultado: ResultadoQuiz = {
        aprobado,
        puntos_obtenidos: puntosObtenidos,
        puntos_totales: puntosTotales,
        porcentaje: Math.round(porcentaje * 100) / 100,
        respuestas_correctas: respuestasCorrectas,
        total_preguntas: preguntas.length,
        tiempo_empleado: tiempoEmpleado
      };
      
      
      
      return resultado;
    } catch (error) {
      
      throw error;
    }
  }

  
  async getIntentosUsuario(idContenido: number, idEmpleado: number): Promise<IntentoQuiz[]> {
    try {
      const { data, error } = await supabase
        .from('intentos_quiz')
        .select('*')
        .eq('id_contenido', idContenido)
        .eq('id_empleado', idEmpleado)
        .is('deleted_at', null)
        .order('fecha_inicio', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      
      throw error;
    }
  }

  
  async getRespuestasIntento(idIntento: number): Promise<RespuestaUsuario[]> {
    try {
      const { data, error } = await supabase
        .from('respuestas_usuario')
        .select('*')
        .eq('id_intento', idIntento)
        .is('deleted_at', null);

      if (error) throw error;
      return data || [];
    } catch (error) {
      
      throw error;
    }
  }

  

  
  async crearPregunta(
    idContenido: number,
    textoPregunta: string,
    tipoPregunta: 'multiple' | 'verdadero_falso' | 'texto',
    puntos: number = 10,
    orden?: number
  ): Promise<PreguntaQuiz> {
    try {
      
      if (!orden) {
        const { data: ultimaPregunta } = await supabase
          .from('preguntas_quiz')
          .select('orden')
          .eq('id_contenido', idContenido)
          .order('orden', { ascending: false })
          .limit(1)
          .single();
        
        orden = ultimaPregunta ? ultimaPregunta.orden + 1 : 1;
      }

      const { data, error } = await supabase
        .from('preguntas_quiz')
        .insert({
          id_contenido: idContenido,
          pregunta: textoPregunta,
          tipo_pregunta: tipoPregunta,
          puntos,
          orden
        })
        .select()
        .single();

      if (error) {
        
        
        
        try {
          const { data: found, error: findErr } = await supabase
            .from('preguntas_quiz')
            .select('*')
            .eq('id_contenido', idContenido)
            .eq('pregunta', textoPregunta)
            .eq('tipo_pregunta', tipoPregunta)
            .eq('puntos', puntos)
            .order('created_at', { ascending: false })
            .limit(1);

          if (!findErr && Array.isArray(found) && found.length > 0) {
            
            return { ...found[0], opciones: [] } as PreguntaQuiz;
          }
        } catch (e) {
          
        }

        throw error;
      }
      return { ...data, opciones: [] };
    } catch (error) {
      
      throw error;
    }
  }

  
  async actualizarPregunta(
    idPregunta: number,
    datos: Partial<Pick<PreguntaQuiz, 'pregunta' | 'tipo_pregunta' | 'puntos' | 'orden'>>
  ): Promise<PreguntaQuiz> {
    try {
      const { data, error } = await supabase
        .from('preguntas_quiz')
        .update(datos)
        .eq('id_pregunta', idPregunta)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      
      throw error;
    }
  }

  
  async eliminarPregunta(idPregunta: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('preguntas_quiz')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id_pregunta', idPregunta);

      if (error) throw error;
    } catch (error) {
      
      throw error;
    }
  }

  
  async crearOpcion(
    idPregunta: number,
    textoOpcion: string,
    esCorrecta: boolean,
    orden?: number
  ): Promise<OpcionRespuesta> {
    try {
      
      if (!orden) {
        const { data: ultimaOpcion } = await supabase
          .from('opciones_respuesta')
          .select('orden')
          .eq('id_pregunta', idPregunta)
          .order('orden', { ascending: false })
          .limit(1)
          .single();
        
        orden = ultimaOpcion ? ultimaOpcion.orden + 1 : 1;
      }

      const { data, error } = await supabase
        .from('opciones_respuesta')
        .insert({
          id_pregunta: idPregunta,
          texto_opcion: textoOpcion,
          es_correcta: esCorrecta,
          orden
        })
        .select()
        .single();

      if (error) {
        
        
        try {
          const { data: found, error: findErr } = await supabase
            .from('opciones_respuesta')
            .select('*')
            .eq('id_pregunta', idPregunta)
            .eq('texto_opcion', textoOpcion)
            .eq('es_correcta', esCorrecta)
            .eq('orden', orden)
            .order('created_at', { ascending: false })
            .limit(1);

          if (!findErr && Array.isArray(found) && found.length > 0) {
            
            return found[0] as OpcionRespuesta;
          }
        } catch (e) {
          
        }

        throw error;
      }
      return data;
    } catch (error) {
      
      throw error;
    }
  }

  
  async actualizarOpcion(
    idOpcion: number,
    datos: Partial<Pick<OpcionRespuesta, 'texto_opcion' | 'es_correcta' | 'orden'>>
  ): Promise<OpcionRespuesta> {
    try {
      const { data, error } = await supabase
        .from('opciones_respuesta')
        .update(datos)
        .eq('id_opcion', idOpcion)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      
      throw error;
    }
  }

  
  async eliminarOpcion(idOpcion: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('opciones_respuesta')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id_opcion', idOpcion);

      if (error) throw error;
    } catch (error) {
      
      throw error;
    }
  }

  
  async recalcularProgresoUsuario(idEmpleado: number, idCurso: number): Promise<void> {
    try {
      const { error } = await supabase
        .rpc('recalcular_progreso_usuario', {
          p_id_empleado: idEmpleado,
          p_id_curso: idCurso
        });

      if (error) throw error;
    } catch (error) {
      
      
      
    }
  }

}

export const quizService = new QuizService();
