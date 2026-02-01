import { useWindowDimensions, Platform } from 'react-native';

const useDeviceType = () => {
  const { width, height } = useWindowDimensions();
  
  
  if (Platform.OS === 'web') {
    const isMobile = width < 768; 
    const isTablet = width >= 768 && width < 1024;
    const isDesktop = width >= 1024;
    
    return {
      isMobile,
      isTablet, 
      isDesktop,
      isLandscape: width > height,
      screenWidth: width,
      screenHeight: height,
      
      isWeb: true,
    };
  }
  
  
  const isMobile = true;
  const isTablet = width >= 768;
  const isDesktop = false;
  
  return {
    isMobile,
    isTablet,
    isDesktop,
    isLandscape: width > height,
    screenWidth: width,
    screenHeight: height,
    isWeb: false,
  };
};