import { TourStep } from '../components/common/OnboardingTour';

export const employeeTourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: '¡Bienvenido a ManufacturaPro! 👋',
    description: 'Esta es tu plataforma de capacitación. Aquí podrás acceder a cursos, realizar evaluaciones y obtener certificados.',
    icon: 'rocket-outline',
    position: 'center'
  },
  {
    id: 'dashboard',
    title: 'Tu Dashboard Personal',
    description: 'Aquí verás tus cursos activos, tu progreso general y accesos rápidos a tus capacitaciones.',
    icon: 'grid-outline',
    position: 'center'
  },
  {
    id: 'courses',
    title: 'Explora Cursos',
    description: 'Navega por categorías y descubre todos los cursos disponibles para tu departamento.',
    icon: 'library-outline',
    position: 'center'
  },
  {
    id: 'progress',
    title: 'Sigue tu Progreso',
    description: 'Completa módulos, realiza evaluaciones y ve tu avance en tiempo real.',
    icon: 'stats-chart-outline',
    position: 'center'
  },
  {
    id: 'certificates',
    title: 'Obtén Certificados',
    description: 'Al completar un curso, recibirás un certificado digital que podrás descargar y compartir.',
    icon: 'ribbon-outline',
    position: 'center'
  },
  {
    id: 'ready',
    title: '¡Todo Listo! 🎉',
    description: 'Ya puedes comenzar tu capacitación. ¡Mucho éxito en tu aprendizaje!',
    icon: 'checkmark-circle-outline',
    position: 'center'
  }
];

export const adminTourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: '¡Bienvenido Admin! 🛡️',
    description: 'Este es el panel de administración de ManufacturaPro. Desde aquí gestionarás todo el sistema de capacitación.',
    icon: 'shield-checkmark-outline',
    position: 'center'
  },
  {
    id: 'dashboard',
    title: 'Panel de Control',
    description: 'Visualiza estadísticas generales: usuarios activos, cursos en progreso, y métricas de rendimiento.',
    icon: 'speedometer-outline',
    position: 'center'
  },
  {
    id: 'users',
    title: 'Gestión de Usuarios',
    description: 'Crea, edita y administra las cuentas de todos los empleados del sistema.',
    icon: 'people-outline',
    position: 'center'
  },
  {
    id: 'courses',
    title: 'Gestión de Cursos',
    description: 'Crea y administra cursos, asigna contenidos, y define evaluaciones para cada capacitación.',
    icon: 'library-outline',
    position: 'center'
  },
  {
    id: 'reports',
    title: 'Reportes y Analytics',
    description: 'Genera reportes detallados del progreso de los usuarios y el desempeño general del sistema.',
    icon: 'bar-chart-outline',
    position: 'center'
  },
  {
    id: 'activity',
    title: 'Registro de Actividad',
    description: 'Monitorea todas las acciones realizadas en el sistema para auditoría y seguridad.',
    icon: 'list-outline',
    position: 'center'
  },
  {
    id: 'ready',
    title: '¡Listo para Administrar! 🚀',
    description: 'Ahora puedes gestionar todo el sistema. ¡Éxito en tu labor administrativa!',
    icon: 'checkmark-circle-outline',
    position: 'center'
  }
];

export const supervisorTourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: '¡Bienvenido Supervisor! 👨‍💼',
    description: 'Como supervisor, tienes acceso tanto a tus cursos como a funciones de gestión de tu equipo.',
    icon: 'briefcase-outline',
    position: 'center'
  },
  {
    id: 'dual-role',
    title: 'Doble Función',
    description: 'Puedes tomar cursos como empleado y también supervisar el progreso de tu equipo.',
    icon: 'swap-horizontal-outline',
    position: 'center'
  },
  {
    id: 'team',
    title: 'Tu Equipo',
    description: 'Revisa el progreso de las personas a tu cargo, asigna cursos y genera reportes.',
    icon: 'people-circle-outline',
    position: 'center'
  },
  {
    id: 'reports',
    title: 'Reportes de Equipo',
    description: 'Genera reportes específicos del desempeño y avance de tu departamento.',
    icon: 'document-text-outline',
    position: 'center'
  },
  {
    id: 'ready',
    title: '¡Listo para Liderar! 💪',
    description: '¡Comienza a gestionar y capacitar a tu equipo de manera efectiva!',
    icon: 'checkmark-circle-outline',
    position: 'center'
  }
];

export const getTourStepsForRole = (role?: string): TourStep[] => {
  switch (role?.toLowerCase()) {
    case 'admin':
      return adminTourSteps;
    case 'supervisor':
      return supervisorTourSteps;
    case 'empleado':
    default:
      return employeeTourSteps;
  }
};
