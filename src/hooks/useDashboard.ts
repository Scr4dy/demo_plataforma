
import { useState, useCallback, useEffect } from 'react';
import { DashboardData } from '../types/dashboard.types';
import { dashboardService } from '../services/dashboardService';

export const useDashboard = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  
  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    
    try {
      const data = await dashboardService.getDashboardData();
      setDashboardData(data);
      setError(null);
    } catch (err: any) {
      
      setError(err.message || 'Error al cargar datos del dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const refetch = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadDashboardData();
    } catch (error) {
      
    } finally {
      setRefreshing(false);
    }
  }, [loadDashboardData]);

  
  const getCoursesByStatus = useCallback((status: string) => {
    if (!dashboardData) return [];
    return dashboardData.courses.filter(course => course.status === status);
  }, [dashboardData]);

  const getExpiringCertificates = useCallback(() => {
    if (!dashboardData) return [];
    return dashboardData.certificates.filter(cert => {
      if (!cert.validUntil) return false;
      try {
        const validUntil = new Date(cert.validUntil);
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        return validUntil <= thirtyDaysFromNow;
      } catch {
        return false;
      }
    });
  }, [dashboardData]);

  return {
    dashboardData,
    loading,
    refreshing,
    error,
    refetch,
    getCoursesByStatus,
    getExpiringCertificates
  };
};