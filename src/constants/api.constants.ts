

export const API_CONFIG = {
  
  USE_MOCK: false,
  
  
  BASE_URL: 'http://localhost:8080',
  BASE_API_URL: 'http://localhost:8080/api',
  
  
  TIMEOUT: 30000,
  UPLOAD_TIMEOUT: 60000,
  
  
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/registro',
      REFRESH: '/auth/refresh',
      LOGOUT: '/auth/logout',
    },
    USERS: {
      PROFILE: '/usuarios/perfil',
      UPDATE: '/usuarios/perfil',
      STATS: '/usuarios/estadisticas',
    },
    COURSES: {
      LIST: '/cursos',
      DETAIL: '/cursos/:id',
      USER_COURSES: '/cursos/mis-cursos',
      MODULES: '/cursos/:id/modulos',
      PROGRESS: '/cursos/:id/progreso',
    },
    CERTIFICATES: {
      LIST: '/certificados',
      USER_CERTIFICATES: '/certificados/mis-certificados',
      DOWNLOAD: '/certificados/:id/descargar',
      RENEW: '/certificados/:id/renovar',
    },
    EVALUATIONS: {
      LIST: '/evaluaciones',
      DETAIL: '/evaluaciones/:id',
      SUBMIT: '/evaluaciones/:id/enviar',
      RESULTS: '/evaluaciones/:id/resultados',
    },
    INSTRUCTORS: {
      LIST: '/instructores',
      DETAIL: '/instructores/:id',
    },
    REPORTES: {
      GENERATE: '/reportes/generar',
      LIST: '/reportes',
    },
    ADMIN: {
      USERS: '/admin/usuarios',
      STATS: '/admin/estadisticas',
    },
    PUBLIC: {
      HEALTH: '/actuator/health',
      INFO: '/public/info',
    }
  },
  
  
  HEADERS: {
    CONTENT_TYPE_JSON: 'application/json',
  },
  
  
  ERROR_CODES: {
    NETWORK_ERROR: 'NETWORK_ERROR',
    DEMO_MODE: 'DEMO_MODE'
  }
} as const;

export const APP_CONFIG = {
  ENVIRONMENT: 'production',
  VERSION: '1.0.0',
  BUILD_DATE: '2024-01-01',
  FEATURES: {
    OFFLINE_MODE: true,
    MOCK_DATA: true,
    PERSISTENT_STORAGE: true
  }
} as const;