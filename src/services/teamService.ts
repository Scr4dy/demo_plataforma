

import { AppConfig } from '../config/appConfig';
import { SUPABASE_CONFIG } from '../config/supabase';

const supabaseConfigured = !!((AppConfig.supabase?.url && AppConfig.supabase?.anonKey) || (SUPABASE_CONFIG?.URL && SUPABASE_CONFIG?.ANON_KEY));
if (!supabaseConfigured) 

export interface TeamMemberResponse {
  id: number;
  nombreCompleto: string;
  usuario: string;
  correoElectronico: string;
  puesto: string;
  departamento: string;
  idEmpleado?: string;
  telefono?: string;
  avatar?: string;
  estado: 'ACTIVO' | 'INACTIVO' | 'AUSENTE';
  habilidades: string[];
  proyectosActivos: number;
  eficiencia: number;
  fechaIngreso: string;
}

export interface TeamResponse {
  id: number;
  nombre: string;
  descripcion: string;
  departamento: string;
  lider: TeamMemberResponse;
  miembros: TeamMemberResponse[];
  proyectosActivos: number;
  metricas: TeamMetrics;
}

export interface TeamMetrics {
  totalMiembros: number;
  miembrosActivos: number;
  eficienciaPromedio: number;
  proyectosCompletados: number;
  capacitacionesCompletadas: number;
}

export interface TeamAlertResponse {
  id: number;
  tipo: 'URGENTE' | 'ADVERTENCIA' | 'INFORMACION';
  titulo: string;
  mensaje: string;
  prioridad: 'ALTA' | 'MEDIA' | 'BAJA';
  fechaCreacion: string;
  fechaExpiracion?: string;
  miembroId?: number;
  equipoId?: number;
  leida: boolean;
}

class TeamService {
  
  private demoTeamMembers: TeamMemberResponse[] = [];

  
  private demoAlerts: TeamAlertResponse[] = [];

  
  async getUserTeams(): Promise<TeamResponse[]> {
    if (!supabaseConfigured) {
      
      return [];
    }
    try {
      
      return [];
    } catch (err) {
      
      return [];
    }
  }

  
  async getTeamMembers(teamId: number): Promise<TeamMemberResponse[]> {
    if (!supabaseConfigured) {
      
      return [];
    }
    try {
      
      return [];
    } catch (err) {
      
      return [];
    }
  }

  
  async getTeamAlerts(teamId?: number): Promise<TeamAlertResponse[]> {
    if (!supabaseConfigured) {
      
      return [];
    }
    try {
      
      return [];
    } catch (err) {
      
      return [];
    }
  }

  
  async getTeamProgress(teamId: number): Promise<any> {
    if (!supabaseConfigured) {
      
      return { equipoId: teamId, nombreEquipo: '', progresoPromedio: 0, cursosCompletados: 0, cursosEnProgreso: 0, certificaciones: 0, ultimaActividad: null };
    }
    try {
      
      return { equipoId: teamId, nombreEquipo: '', progresoPromedio: 0, cursosCompletados: 0, cursosEnProgreso: 0, certificaciones: 0, ultimaActividad: null };
    } catch (err) {
      
      return { equipoId: teamId, nombreEquipo: '', progresoPromedio: 0, cursosCompletados: 0, cursosEnProgreso: 0, certificaciones: 0, ultimaActividad: null };
    }
  }

  
  async searchTeamMembers(teamId: number, query: string): Promise<TeamMemberResponse[]> {
    if (!supabaseConfigured) {
      
      return [];
    }
    try {
      
      return [];
    } catch (err) {
      
      return [];
    }
  }

  
  async getTeamMetrics(teamId: number): Promise<any> {
    if (!supabaseConfigured) {
      
      return { totalMiembros: 0, miembrosActivos: 0, eficienciaPromedio: 0, proyectosCompletados: 0, capacitacionesCompletadas: 0 };
    }
    try {
      
      return { totalMiembros: 0, miembrosActivos: 0, eficienciaPromedio: 0, proyectosCompletados: 0, capacitacionesCompletadas: 0 };
    } catch (err) {
      
      return { totalMiembros: 0, miembrosActivos: 0, eficienciaPromedio: 0, proyectosCompletados: 0, capacitacionesCompletadas: 0 };
    }
  }

  
  async markAlertAsRead(alertId: number): Promise<void> {
    if (!supabaseConfigured) {
      
      return;
    }
    try {
      
    } catch (err) {
      
    }
  }
}

export const teamService = new TeamService();
export default teamService;