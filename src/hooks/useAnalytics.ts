
import { useCallback } from 'react';

export const useAnalytics = () => {
  const trackEvent = useCallback((event: string, properties?: Record<string, any>) => {
  }, []);

  const trackScreenView = useCallback((screenName: string, properties?: Record<string, any>) => {
    trackEvent('screen_view', { screen_name: screenName, ...properties });
  }, [trackEvent]);

  return {
    trackEvent,
    trackScreenView
  };
};