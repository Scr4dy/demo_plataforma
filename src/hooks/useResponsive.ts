import { Dimensions, Platform, ScaledSize } from 'react-native';
import { useWindowDimensions } from 'react-native';

const { width, height }: ScaledSize = Dimensions.get('window');

export const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1025,
};

export const useResponsive = () => {
  const windowDimensions = useWindowDimensions();
  const currentWidth = windowDimensions.width;

  
  const isMobile = currentWidth < BREAKPOINTS.mobile;
  const isTablet = currentWidth >= BREAKPOINTS.mobile && currentWidth < BREAKPOINTS.desktop;
  const isWeb = Platform.OS === 'web';
  const isDesktop = isWeb && currentWidth >= BREAKPOINTS.desktop;
  const isMobileWeb = isWeb && currentWidth < BREAKPOINTS.mobile;
  const isSmallMobile = currentWidth < 375;
  const isVerySmallScreen = currentWidth < 320;

  
  const rv = (mobileSize: number, tabletSize?: number, desktopSize?: number, smallMobileSize?: number): number => {
    if (isSmallMobile && smallMobileSize !== undefined) return smallMobileSize;
    if (isMobile) return mobileSize;
    if (isTablet && tabletSize !== undefined) return tabletSize;
    if (isDesktop && desktopSize !== undefined) return desktopSize;
    return mobileSize;
  };

  
  const getFontSize = (baseSize: number, multiplier: number = 1): number => {
    if (isMobile) return rv(baseSize);
    if (isTablet) return rv(baseSize * 1.2 * multiplier);
    return rv(baseSize * 1.4 * multiplier);
  };

  
  const getSpacing = (baseSpacing: number): number => {
    if (isMobile) return rv(baseSpacing);
    if (isTablet) return rv(baseSpacing * 1.2);
    return rv(baseSpacing * 1.4);
  };

  
  const getHeight = (baseHeight: number): number => {
    if (isMobile) return rv(baseHeight);
    if (isTablet) return rv(baseHeight * 1.1);
    return rv(baseHeight * 1.2);
  };

  
  const getWidth = (baseWidth: number): number => {
    if (isMobile) return rv(baseWidth);
    if (isTablet) return rv(baseWidth * 1.1);
    return rv(baseWidth * 1.2);
  };

  
  const getLayoutConfig = () => {
    if (isMobile) {
      return {
        padding: rv(16),
        margin: rv(8),
        borderRadius: rv(8),
        iconSize: rv(24),
      };
    }
    
    if (isTablet) {
      return {
        padding: rv(20),
        margin: rv(12),
        borderRadius: rv(12),
        iconSize: rv(28),
      };
    }
    
    return {
      padding: rv(24),
      margin: rv(16),
      borderRadius: rv(16),
      iconSize: rv(32),
    };
  };

  return {
    
    isMobile,
    isTablet,
    isWeb,
    isDesktop,
    isMobileWeb,
    isSmallMobile,
    isVerySmallScreen,
    
    
    rv,
    getFontSize,
    getSpacing,
    getHeight,
    getWidth,
    
    
    getLayoutConfig,
    
    
    windowWidth: currentWidth,
    windowHeight: windowDimensions.height,
    
    
    breakpoints: BREAKPOINTS,
  };
};

export const useOrientation = () => {
  const { windowWidth, windowHeight } = useResponsive();
  
  const isPortrait = windowHeight >= windowWidth;
  const isLandscape = windowWidth > windowHeight;
  
  return {
    isPortrait,
    isLandscape,
  };
};

export default useResponsive;