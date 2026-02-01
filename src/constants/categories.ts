import { Ionicons } from '@expo/vector-icons';

export interface CourseCategory {
  id: string;
  name: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  isActive: boolean;
}

export const COURSE_CATEGORIES: CourseCategory[] = [
  {
    id: 'recursos-humanos',
    name: 'Recursos Humanos',
    description: 'Gestión de personal, reclutamiento, desarrollo organizacional y administración de talento humano',
    icon: 'people',
    color: '#3b82f6',
    isActive: true
  },
  {
    id: 'seguridad-higiene',
    name: 'Seguridad e Higiene',
    description: 'Normas de seguridad industrial, protocolos de prevención y gestión de riesgos laborales',
    icon: 'shield-checkmark',
    color: '#10b981',
    isActive: true
  },
  {
    id: 'desarrollo-personal',
    name: 'Desarrollo Personal',
    description: 'Habilidades blandas, liderazgo, comunicación efectiva y crecimiento profesional',
    icon: 'person',
    color: '#8b5cf6',
    isActive: true
  },
  {
    id: 'tecnologia',
    name: 'Tecnología',
    description: 'Herramientas digitales, software empresarial, programación y competencias tecnológicas',
    icon: 'laptop',
    color: '#ef4444',
    isActive: true
  },
  {
    id: 'marketing',
    name: 'Marketing',
    description: 'Estrategias comerciales, marketing digital, ventas y desarrollo de marca',
    icon: 'megaphone',
    color: '#f59e0b',
    isActive: true
  },
  {
    id: 'gestion',
    name: 'Gestión',
    description: 'Administración empresarial, proyectos, operaciones y mejora de procesos',
    icon: 'business',
    color: '#06b6d4',
    isActive: true
  },
  {
    id: 'finanzas',
    name: 'Finanzas',
    description: 'Contabilidad, presupuestos, análisis financiero y gestión económica',
    icon: 'cash',
    color: '#84cc16',
    isActive: true
  },
  {
    id: 'operaciones',
    name: 'Operaciones',
    description: 'Logística, cadena de suministro, producción y eficiencia operativa',
    icon: 'settings',
    color: '#f97316',
    isActive: true
  },
  {
    id: 'calidad',
    name: 'Calidad',
    description: 'Sistemas de gestión de calidad, normas ISO y mejora continua',
    icon: 'ribbon',
    color: '#ec4899',
    isActive: true
  },
  {
    id: 'salud',
    name: 'Salud Laboral',
    description: 'Bienestar organizacional, ergonomía y salud en el trabajo',
    icon: 'medkit',
    color: '#14b8a6',
    isActive: true
  }
];

export const getCategoryById = (id: string): CourseCategory | undefined => {
  return COURSE_CATEGORIES.find(category => category.id === id);
};

export const getCategoryIcon = (categoryId: string): keyof typeof Ionicons.glyphMap => {
  const category = getCategoryById(categoryId);
  return category?.icon || 'book';
};

export const getCategoryColor = (categoryId: string): string => {
  const category = getCategoryById(categoryId);
  return category?.color || '#6b7280';
};