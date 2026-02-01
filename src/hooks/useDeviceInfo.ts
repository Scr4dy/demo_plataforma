
import { Platform, Dimensions, useWindowDimensions, ScaledSize } from 'react-native';

export interface DeviceInfo {
  isIOS: boolean;
  isAndroid: boolean;
  isWeb: boolean;
  isTablet: boolean;
  isSmallMobile: boolean;
  isLargeTablet: boolean;
  isMobileWeb: boolean;
  screenWidth: number;
  screenHeight: number;
  safeAreaTop: number;
  safeAreaBottom: number;
  platform: string;
  isLandscape: boolean;
}

export const useDeviceInfo = (): DeviceInfo => {
  const { width, height } = useWindowDimensions();
  
  const isIOS = Platform.OS === 'ios';
  const isAndroid = Platform.OS === 'android';
  const isWeb = Platform.OS === 'web';
  
  
  const isTablet = width >= 768;
  const isSmallMobile = width < 375;
  const isLargeTablet = width >= 1024;
  
  
  const isMobileWeb = isWeb && width < 768;
  
  
  const safeAreaTop = isIOS ? 44 : 0;
  const safeAreaBottom = isIOS ? 34 : 0;

  
  const isLandscape = width > height;

  return {
    isIOS,
    isAndroid,
    isWeb,
    isTablet,
    isSmallMobile,
    isLargeTablet,
    isMobileWeb,
    screenWidth: width,
    screenHeight: height,
    safeAreaTop,
    safeAreaBottom,
    platform: Platform.OS,
    isLandscape,
  };
};

export const getDeviceInfo = (): Omit<DeviceInfo, 'screenWidth' | 'screenHeight' | 'isLandscape'> => {
  const { width, height } = Dimensions.get('window');
  
  const isIOS = Platform.OS === 'ios';
  const isAndroid = Platform.OS === 'android';
  const isWeb = Platform.OS === 'web';
  
  const isTablet = width >= 768;
  const isSmallMobile = width < 375;
  const isLargeTablet = width >= 1024;
  const isMobileWeb = isWeb && width < 768;
  
  const safeAreaTop = isIOS ? 44 : 0;
  const safeAreaBottom = isIOS ? 34 : 0;

  return {
    isIOS,
    isAndroid,
    isWeb,
    isTablet,
    isSmallMobile,
    isLargeTablet,
    isMobileWeb,
    safeAreaTop,
    safeAreaBottom,
    platform: Platform.OS,
  };
};

export default useDeviceInfo;