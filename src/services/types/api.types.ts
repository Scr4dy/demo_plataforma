
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  status: number;
  timestamp: string;
  path?: string;
}

export interface Pageable {
  page?: number;
  size?: number;
  sort?: string[];
}

export interface PageableResponse<T = any> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
  sort?: {
    sorted: boolean;
    unsorted: boolean;
    empty: boolean;
  };
  pageable?: {
    sort: {
      sorted: boolean;
      unsorted: boolean;
      empty: boolean;
    };
    pageNumber: number;
    pageSize: number;
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  rejectedValue?: any;
}

export interface ValidationErrorResponse {
  message: string;
  errors: ValidationError[];
  status: number;
  timestamp: string;
}

export interface SearchCriteria {
  field: string;
  operation: string;
  value: any;
}

export interface FilterRequest {
  criteria: SearchCriteria[];
  pageable?: Pageable;
}

export interface Auditable {
  fechaCreacion: string;
  fechaActualizacion: string;
  creadoPor?: string;
  actualizadoPor?: string;
}

export enum Estado {
  ACTIVO = 'ACTIVO',
  INACTIVO = 'INACTIVO',
  PENDIENTE = 'PENDIENTE',
  ELIMINADO = 'ELIMINADO'
}

export enum EstadoCurso {
  PENDIENTE = 'PENDIENTE',
  EN_PROGRESO = 'EN_PROGRESO',
  COMPLETADO = 'COMPLETADO',
  VENCIDO = 'VENCIDO',
  CANCELADO = 'CANCELADO'
}

export enum EstadoCertificado {
  VIGENTE = 'VIGENTE',
  EXPIRADO = 'EXPIRADO',
  PENDIENTE = 'PENDIENTE',
  RECHAZADO = 'RECHAZADO'
}

export interface FileResponse {
  id: number;
  nombre: string;
  tipoContenido: string;
  tamano: number;
  urlDescarga: string;
  fechaSubida: string;
}

