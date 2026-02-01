import { useState, useEffect, useCallback } from 'react';
import { Profile } from '../types/dashboard.types';
import { userService } from '../services/userService';
import { courseService } from '../services/courseService';
import { ApiError } from '../services/apiClient';

const transformProfileData = (userProfile: any, courseStats: any): Profile => {
  return {
    id: userProfile.id.toString(),
    name: userProfile.nombreCompleto,
    email: userProfile.correoElectronico,
    position: userProfile.puesto,
    department: userProfile.departamento,
    avatar: userProfile.avatar,
    phone: userProfile.telefono || 'No especificado',
    joinDate: new Date(userProfile.fechaIngreso).toLocaleDateString('es-ES'),
    status: userProfile.estado === 'ACTIVO' ? 'active' : 'inactive',
    stats: {
      completedTasks: courseStats?.cursosCompletados || 0,
      pendingTasks: courseStats?.cursosPendientes || 0,
      certifications: courseStats?.certificaciones || 0,
      evaluations: courseStats?.evaluacionesCompletadas || 0
    },
    certifications: [
      {
        id: '1',
        name: 'Certificado en Control de Calidad',
        status: 'active' as const,
        issueDate: '15/01/2024',
        expiryDate: '15/01/2026'
      },
      {
        id: '2',
        name: 'Seguridad Industrial Básica',
        status: 'active' as const,
        issueDate: '20/02/2024',
        expiryDate: '20/02/2025'
      }
    ],
    skills: ['Control de Calidad', 'Seguridad Industrial', 'Trabajo en Equipo', 'Análisis de Datos'],
    recentActivity: [
      {
        id: '1',
        type: 'evaluation',
        description: 'Evaluación de competencias completada',
        date: '15/11/2024',
        status: 'completed' as const
      },
      {
        id: '2',
        type: 'training',
        description: 'Capacitación en nuevos protocolos',
        date: '10/11/2024',
        status: 'completed' as const
      }
    ]
  };
};

const demoProfile: Profile = {
  id: '1',
  name: 'Ana García López',
  email: 'ana.garcia@empresa.com',
  position: 'Supervisora de Calidad',
  department: 'Control de Calidad',
  phone: '+52 55 1234 5678',
  joinDate: '15/03/2023',
  status: 'active',
  avatar: 'https://via.placeholder.com/150/2196F3/ffffff?text=AG',
  stats: {
    completedTasks: 45,
    pendingTasks: 8,
    certifications: 5,
    evaluations: 12
  },
  certifications: [
    {
      id: '1',
      name: 'Certificado en Control de Calidad',
      status: 'active',
      issueDate: '15/01/2024',
      expiryDate: '15/01/2026'
    },
    {
      id: '2',
      name: 'Seguridad Industrial Avanzada',
      status: 'active',
      issueDate: '20/02/2024',
      expiryDate: '20/02/2025'
    },
    {
      id: '3',
      name: 'Manejo de Maquinaria Pesada',
      status: 'active',
      issueDate: '10/03/2024',
      expiryDate: '10/03/2025'
    }
  ],
  skills: ['Control de Calidad', 'Seguridad Industrial', 'Trabajo en Equipo', 'Análisis de Datos', 'Liderazgo'],
  recentActivity: [
    {
      id: '1',
      type: 'training',
      description: 'Curso de Seguridad Industrial completado',
      date: '20/01/2024',
      status: 'completed'
    },
    {
      id: '2',
      type: 'evaluation',
      description: 'Evaluación de competencias técnicas',
      date: '15/01/2024',
      status: 'completed'
    },
    {
      id: '3',
      type: 'certification',
      description: 'Certificación renovada - Control de Calidad',
      date: '10/01/2024',
      status: 'completed'
    }
  ]
};

export const useProfile = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  
  const loadProfile = useCallback(async () => {
    try {
      setError(null);
      
      const [userProfile, courseStats] = await Promise.all([
        userService.getCurrentUserProfile(),
        courseService.getCourseStats().catch(err => {
          return { cursosCompletados: 0, cursosPendientes: 0 };
        })
      ]);
      
      const transformedProfile = transformProfileData(userProfile, courseStats);
      
      setProfile(transformedProfile);
    } catch (err) {
      setProfile(demoProfile);
      
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Error al cargar el perfil');
      }
    }
  }, []);

  
  useEffect(() => {
    const initializeProfile = async () => {
      await loadProfile();
      setIsLoading(false);
    };

    initializeProfile();
  }, [loadProfile]);

  
  const refetch = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadProfile();
    } finally {
      setRefreshing(false);
    }
  }, [loadProfile]);

  
  const updateProfile = useCallback(async (updateData: any) => {
    try {
      const updatedProfile = await userService.updateUserProfile(updateData);
      const transformedProfile = transformProfileData(updatedProfile, {});
      
      setProfile(transformedProfile);
      return transformedProfile;
    } catch (err) {
      
      throw err;
    }
  }, []);

  return {
    profile,
    isLoading,
    error,
    refreshing,
    refetch,
    updateProfile
  };
};