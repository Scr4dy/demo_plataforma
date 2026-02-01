import { useState, useEffect } from 'react';
import { useResponsive } from './useResponsive';

export const useAppInitialization = () => {
  const [appIsReady, setAppIsReady] = useState(false);
  const { rv } = useResponsive();

  useEffect(() => {
    async function prepare() {
      try {
        
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (e) {
        
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const getSplashConfig = () => ({
    iconSize: rv(80),
    titleSize: rv(24),
    subtitleSize: rv(16),
  });

  return {
    appIsReady,
    getSplashConfig,
  };
};