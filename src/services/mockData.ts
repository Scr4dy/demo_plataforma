

export const mockCategorias: any[] = [
  {
    id: '1',
    nombre: 'Seguridad Industrial',
    descripcion: 'Cursos sobre seguridad y prevención de riesgos',
    color: '#EF4444',
    icono: 'shield',
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    nombre: 'Operación de Maquinaria',
    descripcion: 'Capacitación en uso de maquinaria industrial',
    color: '#F59E0B',
    icono: 'settings',
    created_at: new Date().toISOString()
  },
  {
    id: '3',
    nombre: 'Calidad y Procesos',
    descripcion: 'Gestión de calidad y mejora de procesos',
    color: '#10B981',
    icono: 'checkbox',
    created_at: new Date().toISOString()
  },
  {
    id: '4',
    nombre: 'Liderazgo',
    descripcion: 'Desarrollo de habilidades de liderazgo',
    color: '#8B5CF6',
    icono: 'people',
    created_at: new Date().toISOString()
  },
  {
    id: '5',
    nombre: 'Mantenimiento',
    descripcion: 'Mantenimiento preventivo y correctivo',
    color: '#3B82F6',
    icono: 'build',
    created_at: new Date().toISOString()
  }
];

export const mockCursos: any[] = [
  {
    id: 1,
    titulo: 'Introducción a la Seguridad Industrial',
    descripcion: 'Curso básico sobre los principios fundamentales de la seguridad en el trabajo. Aprende sobre EPP, señalización y prevención de accidentes.',
    categoria_id: '1',
    instructor: 'Ing. María García',
    duracion_horas: 8,
    es_publico: true,
    contenido_multimedia: [
      { tipo: 'video', titulo: 'Módulo 1: Introducción', duracion: '15:00' },
      { tipo: 'pdf', titulo: 'Manual de Seguridad', paginas: 25 },
      { tipo: 'video', titulo: 'Módulo 2: EPP', duracion: '20:00' }
    ],
    inscrito: true,
    progreso: 65,
    created_at: new Date().toISOString(),
    categorias: mockCategorias[0]
  },
  {
    id: 2,
    titulo: 'Uso Seguro de Montacargas',
    descripcion: 'Capacitación completa para operadores de montacargas. Incluye teoría y práctica.',
    categoria_id: '2',
    instructor: 'Ing. Carlos Rodríguez',
    duracion_horas: 12,
    es_publico: true,
    contenido_multimedia: [
      { tipo: 'video', titulo: 'Fundamentos del montacargas', duracion: '25:00' },
      { tipo: 'video', titulo: 'Práctica en simulador', duracion: '30:00' }
    ],
    inscrito: true,
    progreso: 30,
    created_at: new Date().toISOString(),
    categorias: mockCategorias[1]
  },
  {
    id: 3,
    titulo: 'Gestión de Calidad ISO 9001',
    descripcion: 'Introducción a los sistemas de gestión de calidad según la norma ISO 9001.',
    categoria_id: '3',
    instructor: 'Lic. Ana Martínez',
    duracion_horas: 16,
    es_publico: true,
    contenido_multimedia: [],
    inscrito: false,
    progreso: 0,
    created_at: new Date().toISOString(),
    categorias: mockCategorias[2]
  },
  {
    id: 4,
    titulo: 'Liderazgo en Equipos de Trabajo',
    descripcion: 'Desarrolla habilidades de liderazgo efectivo para supervisores y gerentes.',
    categoria_id: '4',
    instructor: 'Lic. Roberto Sánchez',
    duracion_horas: 10,
    es_publico: true,
    contenido_multimedia: [],
    inscrito: true,
    progreso: 100,
    created_at: new Date().toISOString(),
    categorias: mockCategorias[3]
  },
  {
    id: 5,
    titulo: 'Mantenimiento Preventivo Básico',
    descripcion: 'Técnicas fundamentales de mantenimiento preventivo para equipos industriales.',
    categoria_id: '5',
    instructor: 'Ing. Luis Hernández',
    duracion_horas: 14,
    es_publico: true,
    contenido_multimedia: [],
    inscrito: false,
    progreso: 0,
    created_at: new Date().toISOString(),
    categorias: mockCategorias[4]
  },
  {
    id: 6,
    titulo: 'Primeros Auxilios en el Trabajo',
    descripcion: 'Capacitación en primeros auxilios para situaciones de emergencia en el lugar de trabajo.',
    categoria_id: '1',
    instructor: 'Dr. Patricia López',
    duracion_horas: 6,
    es_publico: true,
    contenido_multimedia: [],
    inscrito: true,
    progreso: 45,
    created_at: new Date().toISOString(),
    categorias: mockCategorias[0]
  },
  {
    id: 7,
    titulo: 'Operación de Torno CNC',
    descripcion: 'Curso avanzado de programación y operación de tornos CNC.',
    categoria_id: '2',
    instructor: 'Ing. Miguel Torres',
    duracion_horas: 20,
    es_publico: true,
    contenido_multimedia: [],
    inscrito: false,
    progreso: 0,
    created_at: new Date().toISOString(),
    categorias: mockCategorias[1]
  },
  {
    id: 8,
    titulo: 'Control Estadístico de Procesos',
    descripcion: 'Herramientas estadísticas para el control y mejora de procesos de manufactura.',
    categoria_id: '3',
    instructor: 'Ing. Diana Ramírez',
    duracion_horas: 12,
    es_publico: true,
    contenido_multimedia: [],
    inscrito: true,
    progreso: 15,
    created_at: new Date().toISOString(),
    categorias: mockCategorias[2]
  }
];

export const simulateNetworkDelay = async (ms?: number): Promise<void> => {
  
  return Promise.resolve();
};

export const MOCK_CONFIG = {
  enabled: false,
  networkDelay: 0
};
