
import { useEffect, useCallback, useRef } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDashboard } from './useDashboard';
import type { StackNavigationProps } from '../types/navigation.types';

export const useDashboardAnalytics = () => {
  const { dashboardData } = useDashboard();
  const navigation = useNavigation<StackNavigationProps<'Dashboard'>['navigation']>();
  const route = useRoute<StackNavigationProps<'Dashboard'>['route']>();
  const lastTrackedRef = useRef<string>('');

  const trackEvent = useCallback((eventName: string, properties?: any) => {
    const timestamp = new Date().toISOString();
    
    
  }, []);

  
  useEffect(() => {
    const screenName = route.name;
    if (screenName !== lastTrackedRef.current) {
      trackEvent('screen_view', {
        screen_name: screenName,
        screen_class: screenName,
      });
      lastTrackedRef.current = screenName;
    }
  }, [route.name, trackEvent]);

  
  useEffect(() => {
    if (dashboardData) {
      trackEvent('dashboard_data_loaded', {
        total_courses: dashboardData.courses.length,
        completed_courses: dashboardData.courses.filter(c => c.status === 'Completado').length,
        in_progress_courses: dashboardData.courses.filter(c => c.status === 'En Progreso').length,
        pending_courses: dashboardData.courses.filter(c => c.status === 'Pendiente').length,
        total_alerts: (dashboardData.alerts?.length ?? 0),
        average_progress: dashboardData.stats?.averageProgress,
        user_name: dashboardData.name,
      });
    }
  }, [dashboardData, trackEvent]);

  
  useEffect(() => {
    const unsubscribe = navigation.addListener('state', (e) => {
      
    });

    return unsubscribe;
  }, [navigation, trackEvent]);

  const trackCoursePress = useCallback((course: any) => {
    trackEvent('course_selected', {
      course_id: course.id,
      course_title: course.title,
      course_progress: course.progress,
      course_status: course.status,
      course_category: course.category,
      from_screen: 'Dashboard',
    });
  }, [trackEvent]);

  const trackCertificatePress = useCallback((certificate: any) => {
    trackEvent('certificate_selected', {
      certificate_id: certificate.id,
      certificate_title: certificate.title,
      certificate_status: certificate.status,
      from_screen: 'Dashboard',
    });
  }, [trackEvent]);

  const trackAlertPress = useCallback((alert: any) => {
    trackEvent('alert_interacted', {
      alert_id: alert.id,
      alert_type: alert.type,
      alert_message: alert.message,
      from_screen: 'Dashboard',
    });
  }, [trackEvent]);

  const trackQuickAction = useCallback((action: string) => {
    trackEvent('quick_action_used', {
      action_type: action,
      from_screen: 'Dashboard',
    });
  }, [trackEvent]);

  const trackSearch = useCallback((query: string, resultsCount: number) => {
    trackEvent('search_performed', {
      search_query: query,
      results_count: resultsCount,
      from_screen: 'Dashboard',
    });
  }, [trackEvent]);

  const trackFilterApplied = useCallback((filterType: string, filterValue: any) => {
    trackEvent('filter_applied', {
      filter_type: filterType,
      filter_value: filterValue,
      from_screen: 'Dashboard',
    });
  }, [trackEvent]);

  return {
    trackCoursePress,
    trackCertificatePress,
    trackAlertPress,
    trackQuickAction,
    trackSearch,
    trackFilterApplied,
    trackEvent,
  };
};