
export const getGreetingMessage = (userName: string, role: string): string => {
  const hour = new Date().getHours();
  
  const greetings = [
    `¡Buenos días, ${userName}!`,
    `¡Hola, ${userName}!`,
    `¡Buenas tardes, ${userName}!`,
    `¡Buenas noches, ${userName}!`,
  ];

  if (hour < 12) return greetings[0];
  if (hour < 18) return greetings[2];
  return greetings[3];
};

export const getMotivationalMessage = (cursosCompletados: number, cursosInscritos: number): string => {
  const porcentaje = cursosInscritos > 0 ? (cursosCompletados / cursosInscritos) * 100 : 0;

  if (porcentaje === 0) {
    return '¡Es momento de comenzar tu primera lección!';
  } else if (porcentaje < 25) {
    return '¡Gran comienzo! Cada curso cuenta';
  } else if (porcentaje < 50) {
    return '¡Avanzas muy bien! Sigue adelante';
  } else if (porcentaje < 75) {
    return '¡Excelente progreso! Ya casi llegas';
  } else if (porcentaje < 100) {
    return '¡Casi lo logras! Estás cerca de la meta';
  } else {
    return '¡Increíble! Has completado todos tus cursos';
  }
};

export const getShiftMessage = (): string => {
  const hour = new Date().getHours();

  if (hour >= 6 && hour < 14) {
    return 'Turno Matutino';
  }
  if (hour >= 14 && hour < 22) {
    return ' Turno Vespertino';
  }
  return ' Turno Nocturno';
};

export const getCourseCompletionMessage = (): string => {
  const messages = [
    '¡Excelente trabajo! Curso dominado',
    '¡Felicitaciones! Has completado el curso',
    '¡Increíble! Curso terminado con éxito',
    '¡Bravo! Has finalizado el curso',
    '¡Genial! Curso completado',
  ];

  return messages[Math.floor(Math.random() * messages.length)];
};

export const getLoadingMessage = (context: 'course' | 'dashboard' | 'certificates' | 'general'): string => {
  const messages = {
    course: 'Preparando tu material de aprendizaje',
    dashboard: 'Cargando tu progreso',
    certificates: 'Buscando tus logros',
    general: 'Un momento, por favor',
  };

  return messages[context];
};

export const getErrorMessage = (context?: string): string => {
  const messages = [
    'Oops, algo salió mal. Revisemos la conexión',
    'Parece que hay un problema. Intenta de nuevo',
    'No pudimos completar la acción. Verifica tu conexión',
    'Error temporal. Por favor, inténtalo nuevamente',
  ];

  return messages[Math.floor(Math.random() * messages.length)];
};

export const getEmptyStateMessage = (context: 'courses' | 'certificates' | 'search'): string => {
  const messages = {
    courses: 'Aún no tienes cursos. ¡Explora y comienza a aprender!',
    certificates: 'Completa cursos para obtener certificados',
    search: 'No encontramos resultados. Intenta con otros términos',
  };

  return messages[context];
};

export const getStreakMessage = (days: number): string => {
  if (days === 0) return 'Comienza tu racha hoy';
  if (days === 1) return '¡Primera vez! Sigue así';
  if (days < 7) return `¡${days} días seguidos!`;
  if (days < 30) return `¡Increíble! ${days} días de racha`;
  return `¡Leyenda! ${days} días consecutivos`;
};
