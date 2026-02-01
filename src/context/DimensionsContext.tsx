import React, { createContext, useContext, useState, useEffect } from 'react';
import { Dimensions, ScaledSize, Platform } from 'react-native';

interface DimensionsContextType {
  window: ScaledSize;
  screen: ScaledSize;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isWeb: boolean;
  isIOS: boolean;
  isAndroid: boolean;
}

const DimensionsContext = createContext<DimensionsContextType | undefined>(undefined);

export const DimensionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dimensions, setDimensions] = useState({
    window: Dimensions.get('window'),
    screen: Dimensions.get('screen'),
  });

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window, screen }) => {
      setDimensions({ window, screen });
    });

    return () => subscription?.remove();
  }, []);

  const isWeb = Platform.OS === 'web';
  const isIOS = Platform.OS === 'ios';
  const isAndroid = Platform.OS === 'android';
  
  
  const isMobile = dimensions.window.width < 768;
  const isTablet = dimensions.window.width >= 768 && dimensions.window.width < 1024;
  const isDesktop = dimensions.window.width >= 1024;

  const value = {
    ...dimensions,
    isMobile,
    isTablet,
    isDesktop,
    isWeb,
    isIOS,
    isAndroid,
  };

  return (
    <DimensionsContext.Provider value={value}>
      {children}
    </DimensionsContext.Provider>
  );
};

export const useDimensions = () => {
  const context = useContext(DimensionsContext);
  if (context === undefined) {
    throw new Error('useDimensions must be used within a DimensionsProvider');
  }
  return context;
};