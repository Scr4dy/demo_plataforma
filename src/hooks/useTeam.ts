
import { useState, useMemo, useCallback } from 'react';

export const useTeam = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  
  const teamData = useMemo(() => ({
    department: "Línea de Ensamblaje 3",
    totalMembers: 8,
    members: [
      {
        id: 1,
        name: "María Lopez",
        position: "Operadora Senior",
        activo: true,
        department: "Producción",
        certifications: [
          { name: "Montacargas", status: "active", expires: "2025-12-31" },
          { name: "Seguridad Industrial", status: "active", expires: "2025-06-30" }
        ],
        evaluations: [
          { type: "Práctica Montacargas", status: "pending", date: "2024-11-15" }
        ],
        lastTraining: "Hace 2 semanas",
        efficiency: 92,
        avatar: "https://via.placeholder.com/150/2196F3/ffffff?text=ML"
      },
      {
        id: 2,
        name: "Carlos Rodríguez",
        position: "Operador",
        activo: true,
        department: "Producción",
        certifications: [
          { name: "Montacargas", status: "expired", expires: "2023-12-31" },
          { name: "Seguridad Básica", status: "active", expires: "2025-03-31" }
        ],
        evaluations: [
          { type: "Examen Teórico", status: "completed", date: "2024-01-10" },
          { type: "Práctica Montacargas", status: "pending", date: "2024-11-20" }
        ],
        lastTraining: "Hace 1 mes",
        efficiency: 85,
        avatar: "https://via.placeholder.com/150/4CAF50/ffffff?text=CR"
      },
      {
        id: 3,
        name: "Ana Martínez",
        position: "Supervisora de Calidad",
        activo: true,
        department: "Calidad",
        certifications: [
          { name: "Control de Calidad", status: "active", expires: "2026-01-15" },
          { name: "ISO 9001", status: "active", expires: "2025-08-20" }
        ],
        evaluations: [],
        lastTraining: "Hace 3 días",
        efficiency: 95,
        avatar: "https://via.placeholder.com/150/FF9800/ffffff?text=AM"
      },
      {
        id: 4,
        name: "Pedro González",
        position: "Técnico Mantenimiento",
        activo: false,
        department: "Mantenimiento",
        certifications: [
          { name: "Soldadura", status: "expired", expires: "2024-01-10" }
        ],
        evaluations: [
          { type: "Certificación Soldadura", status: "pending", date: "2024-02-01" }
        ],
        lastTraining: "Hace 3 meses",
        efficiency: 78,
        avatar: "https://via.placeholder.com/150/9C27B0/ffffff?text=PG"
      }
    ],
    pendingActions: [
      { 
        id: 1, 
        type: "evaluation", 
        count: 3, 
        description: "Pruebas prácticas pendientes", 
        priority: "high" as const 
      },
      { 
        id: 2, 
        type: "certification", 
        count: 2, 
        description: "Certificaciones por vencer", 
        priority: "medium" as const 
      },
      { 
        id: 3, 
        type: "training", 
        count: 5, 
        description: "Capacitaciones pendientes", 
        priority: "low" as const 
      }
    ],
    alerts: [
      { 
        id: 1, 
        type: "warning" as const, 
        message: "Certificación de Soldadura - Pedro G. vence en 10 días", 
        member: "Pedro González" 
      },
      { 
        id: 2, 
        type: "info" as const, 
        message: "Nueva evaluación disponible para el equipo", 
        member: "Todo el equipo" 
      },
      { 
        id: 3, 
        type: "urgent" as const, 
        message: "3 miembros requieren certificación de seguridad urgente", 
        member: "Equipo de Producción" 
      }
    ]
  }), []);

  const filteredMembers = useMemo(() => {
    return teamData.members.filter(member => {
      const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           member.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           member.department.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesFilter = activeFilter === 'all' || 
                           (activeFilter === 'active' && member.activo === true) ||
                           (activeFilter === 'inactive' && member.activo === false) ||
                           (activeFilter === 'needs-attention' && (
                             member.certifications?.some(cert => cert.status === 'expired') ||
                             member.evaluations?.some(evaluationItem => evaluationItem.status === 'pending')
                           ));
      
      return matchesSearch && matchesFilter;
    });
  }, [searchQuery, activeFilter, teamData.members]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  }, []);

  return {
    teamData,
    searchQuery,
    setSearchQuery,
    activeFilter,
    setActiveFilter,
    filteredMembers,
    refreshing,
    onRefresh,
    loading
  };
};