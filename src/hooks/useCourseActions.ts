
import { useCallback } from 'react';
import { Alert, Platform } from 'react-native';
import { Module, Resource } from '../types/course.types';

export const useCourseActions = (navigation: any) => {
  const handleModulePress = useCallback((module: Module) => {
    if (module.status === 'locked') {
      Alert.alert(
        "Módulo Bloqueado", 
        "Completa los módulos anteriores para desbloquear este contenido.",
        [{ text: "Entendido", style: "default" }]
      );
      return;
    }
    
    
    try {
      if (Platform.OS === 'web') {
        const { goToWebRoute } = require('../utils/webNav');
        goToWebRoute('CourseDetail', { moduleId: module.id, courseId: (module as any).courseId });
      } else {
        navigation.navigate('ModuleContent', { 
          module: {
            ...module,
            content: `- Contenido demo del módulo: ${module.title}\n\nEste es un contenido de ejemplo para demostración. En una implementación real, aquí estaría el contenido educativo completo del módulo.`
          }
        });
      }
    } catch (err) {
      
    }
  }, [navigation]);

  const handleResourceDownload = useCallback((resource: Resource) => {
    Alert.alert(
      "Descargar Recurso",
      `¿Quieres descargar "${resource.title}"? (${resource.size})`,
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Descargar", 
          onPress: () => {
            Alert.alert(
              "Descarga Iniciada", 
              `- Descargando ${resource.title}...\n\n(Modo demo - la descarga se simulará)`
            );
          }
        }
      ]
    );
  }, []);

  const handleStartExam = useCallback(() => {
    Alert.alert(
      "Examen Final - Modo Demo",
      "¿Estás listo para realizar el examen final del curso? Esta es una simulación de evaluación.",
      [
        { text: "Más Tarde", style: "cancel" },
        { 
          text: "Comenzar Examen", 
          onPress: () => {
            navigation.navigate('ExamScreen', { 
              examData: {
                title: "Examen Final Demo",
                description: "Esta es una evaluación de demostración",
                duration: 30,
                questions: [
                  {
                    id: 1,
                    question: "¿Este es un sistema en modo demo?",
                    options: ["Sí", "No", "Tal vez"],
                    correctAnswer: 0
                  }
                ]
              }
            });
          }
        }
      ]
    );
  }, [navigation]);

  const handleContinueLearning = useCallback((nextModule?: Module) => {
    if (nextModule) {
      handleModulePress(nextModule);
    } else {
      Alert.alert(
        "Continuar Aprendizaje",
        "- Has completado todos los módulos disponibles en esta demostración.",
        [{ text: "Entendido", style: "default" }]
      );
    }
  }, [handleModulePress]);

  return {
    handleModulePress,
    handleResourceDownload,
    handleStartExam,
    handleContinueLearning
  };
};