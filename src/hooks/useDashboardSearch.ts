
import { useState, useMemo, useCallback } from 'react';
import type { DashboardData, Course, Certificate, AlertItem } from '../types/dashboard.types';

export type FilterType = 'status' | 'category' | 'progress' | 'priority';
export type FilterValue = string | number;

export interface ActiveFilters {
  status?: string[];
  category?: string[];
  progress?: string;
  priority?: string[];
}

interface UseDashboardSearchProps {
  dashboardData?: DashboardData | null;
}

export const useDashboardSearch = ({ dashboardData }: UseDashboardSearchProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({});

  
  const filteredData = useMemo(() => {
    if (!dashboardData) return null;

    let filteredCourses = dashboardData.courses;
    let filteredAlerts = dashboardData.alerts || [];
    let filteredCertificates = dashboardData.certificates;

    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      
      filteredCourses = filteredCourses.filter(course =>
        (course.title || '').toLowerCase().includes(query) ||
        course.category?.toLowerCase().includes(query)
      );
      
      filteredAlerts = filteredAlerts.filter(alert =>
        (alert.message || '').toLowerCase().includes(query)
      );
      
      filteredCertificates = filteredCertificates.filter(cert =>
        cert.title.toLowerCase().includes(query)
      );
    }

    
    if (activeFilters.status?.length) {
      filteredCourses = filteredCourses.filter(course =>
        activeFilters.status!.includes(course.status ?? '')
      );
    }

    if (activeFilters.category?.length) {
      filteredCourses = filteredCourses.filter(course =>
        course.category && activeFilters.category!.includes(course.category)
      );
    }

    if (activeFilters.progress) {
      const progressFilter = activeFilters.progress;
      filteredCourses = filteredCourses.filter(course => {
        switch (progressFilter) {
          case 'completed':
            return course.progress === 100;
          case 'in-progress':
            return (course.progress || 0) > 0 && (course.progress || 0) < 100;
          case 'not-started':
            return course.progress === 0;
          default:
            return true;
        }
      });
    }

    if (activeFilters.priority?.length) {
      filteredAlerts = filteredAlerts.filter(alert =>
        activeFilters.priority!.includes(alert.type || '')
      );
    }

    return {
      ...dashboardData,
      courses: filteredCourses,
      alerts: filteredAlerts,
      certificates: filteredCertificates,
    };
  }, [dashboardData, searchQuery, activeFilters]);

  
  const getFilterOptions = useCallback(() => {
    if (!dashboardData) return {};

    const statusOptions = Array.from(new Set(dashboardData.courses.map(c => c.status)));
    const categoryOptions = Array.from(new Set(
      dashboardData.courses.map(c => c.category).filter(Boolean) as string[]
    ));
    const priorityOptions = Array.from(new Set((dashboardData.alerts || []).map(a => a.type || '')));

    return {
      status: statusOptions,
      category: categoryOptions,
      progress: ['completed', 'in-progress', 'not-started'],
      priority: priorityOptions,
    };
  }, [dashboardData]);

  
  const applyFilter = useCallback((filterType: FilterType, value: FilterValue) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterType]: Array.isArray(value) ? value : [value],
    }));
  }, []);

  
  const resetFilters = useCallback(() => {
    setActiveFilters({});
    setSearchQuery('');
  }, []);

  
  const hasActiveFilters = useMemo(() => {
    return Object.keys(activeFilters).length > 0 || searchQuery.trim() !== '';
  }, [activeFilters, searchQuery]);

  
  const searchResultsCount = useMemo(() => {
    if (!filteredData) return 0;
    
    return (
      filteredData.courses.length +
      filteredData.alerts.length +
      filteredData.certificates.length
    );
  }, [filteredData]);

  return {
    searchQuery,
    setSearchQuery,
    activeFilters,
    setActiveFilters,
    filteredData,
    resetFilters,
    applyFilter,
    getFilterOptions,
    hasActiveFilters,
    searchResultsCount,
  };
};