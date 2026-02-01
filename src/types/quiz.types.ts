
export interface PreguntaQuiz {
  id_pregunta: number;
  id_contenido: number;
  pregunta: string;
  tipo_pregunta: 'multiple' | 'verdadero_falso' | 'texto';
  puntos: number;
  orden: number;
  explicacion?: string;
  opciones?: OpcionRespuesta[];
}

export interface OpcionRespuesta {
  id_opcion: number;
  id_pregunta: number;
  texto_opcion: string;
  es_correcta: boolean;
  orden: number;
}

export interface IntentoQuiz {
  id_intento: number;
  id_contenido: number;
  id_empleado: number;
  fecha_inicio: string;
  fecha_completado?: string;
  puntos_obtenidos?: number;
  puntos_totales?: number;
  porcentaje?: number;
  aprobado: boolean;
  tiempo_empleado?: number; 
}

export interface RespuestaUsuario {
  id_respuesta?: number;
  id_intento: number;
  id_pregunta: number;
  id_opcion?: number;
  respuesta_texto?: string;
  es_correcta?: boolean;
  puntos_obtenidos?: number;
}

export interface QuizState {
  preguntas: PreguntaQuiz[];
  respuestas: Map<number, number | string>; 
  preguntaActual: number;
  tiempo_inicio: number;
  intento?: IntentoQuiz;
}

export interface ResultadoQuiz {
  aprobado: boolean;
  puntos_obtenidos: number;
  puntos_totales: number;
  porcentaje: number;
  respuestas_correctas: number;
  total_preguntas: number;
  tiempo_empleado: number;
}
