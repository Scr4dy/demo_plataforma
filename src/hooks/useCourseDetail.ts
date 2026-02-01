
import { useMemo } from 'react';
import { CourseDetail } from '../types/course.types';

export const useCourseDetail = (courseId?: string) => { 
  const courseData: CourseDetail = useMemo(() => ({
    id: courseId || '1', 
    title: "Manejo Seguro de Montacargas",
    instructor: "Ing. Carlos Rodríguez",
    category: "seguridad-higiene",
    progress: 75,
    duration: 215, 
    level: "intermediate",
    lastAccessed: "Hace 2 días",
    expiryDate: "15 de Diciembre, 2024",
    description: `Curso completo de manejo seguro de montacargas que cubre normativas, 
    operación segura, inspecciones pre-operativas y técnicas avanzadas 
    para espacios reducidos. Certificación válida por 2 años.`,
    objectives: [
      "Comprender las normativas de seguridad aplicables",
      "Realizar inspecciones pre-operativas completas",
      "Operar montacargas de manera segura y eficiente",
      "Manejar cargas en espacios reducidos",
      "Aplicar procedimientos de emergencia"
    ],
    modules: [
      {
        id: '1',
        title: "Introducción y Normativa",
        status: "completed",
        duration: 30,
        lessons: [],
        completedLessons: 4,
        lessonsList: ["Normas de seguridad", "Legislación aplicable", "Responsabilidades", "Introducción al equipo"],
        type: 'video',
        url: '',
        isFree: true,
      },
      {
        id: '2',
        title: "Componentes y Operación Segura",
        status: "completed",
        duration: 45,
        lessons: [],
        completedLessons: 5,
        lessonsList: ["Partes del montacargas", "Controles básicos", "Inspección visual", "Señales de advertencia", "Pruebas básicas"],
        type: 'video',
        url: '',
        isFree: true,
      },
      {
        id: '3',
        title: "Inspección Pre-Operativa",
        status: "in-progress",
        duration: 60,
        lessons: [],
        completedLessons: 4,
        progress: 67,
        lessonsList: ["Checklist diario", "Identificación de fallas", "Niveles de fluidos", "Estado de llantas", "Sistema de frenos", "Documentación"],
        type: 'video',
        url: '',
        isFree: false,
      },
      {
        id: '4',
        title: "Maniobras en Espacios Reducidos",
        status: "locked",
        duration: 50,
        lessons: [],
        completedLessons: 0,
        lessonsList: ["Curvas cerradas", "Estacionamiento", "Carga/descarga", "Zonas delimitadas", "Práctica guiada"],
        type: 'video',
        url: '',
        isFree: false,
      },
      {
        id: '5',
        title: "Examen Final de Certificación",
        status: "locked",
        duration: 30,
        lessons: [],
        completedLessons: 0,
        lessonsList: ["Evaluación teórica", "Evaluación práctica"],
        type: 'quiz',
        url: '',
        isFree: false,
      }
    ],
    resources: [
      { id: '1', title: "Manual del Operador", type: "pdf", size: 2.4 },
      { id: '2', title: "Checklist Diario", type: "pdf", size: 1.1 },
      { id: '3', title: "Video Demostración", type: "video", size: 15.2 },
      { id: '4', title: "Normativa Oficial", type: "pdf", size: 3.7 },
      { id: '5', title: "Guía de Seguridad OSHA", type: "pdf", size: 1.8 },
      { id: '6', title: "Procedimientos de Emergencia", type: "pdf", size: 2.1 }
    ]
    ,
    thumbnail: 'https://via.placeholder.com/300',
    price: 0,
    isFree: true,
    rating: 4.5,
    studentsCount: 100,
    contents: [],
    requirements: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }), [courseId]); 

  const loading = false;
  const error = null;

  return {
    courseData,
    loading,
    error,
  };
};