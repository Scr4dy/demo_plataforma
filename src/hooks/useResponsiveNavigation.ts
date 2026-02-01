import { useResponsive } from './useResponsive';

export const useResponsiveNavigation = () => {
  const { isWeb, isTablet, getFontSize, getSpacing, rv } = useResponsive();

  const getTabBarConfig = () => ({
    height: isTablet ? getSpacing(18) : getSpacing(15),
    paddingBottom: isTablet ? getSpacing(3) : getSpacing(2),
    paddingTop: getSpacing(2),
    labelSize: isTablet ? getFontSize(12) : getFontSize(10),
  });

  const getSidebarConfig = () => ({
    width: rv(280, 300, 320, 260),
    collapsedWidth: rv(70, 80, 90, 60),
    headerHeight: getSpacing(18),
  });

  const getPlatformHeaderConfig = () => ({
    showHeader: !isWeb,
    animation: isWeb ? 'none' : 'slide_from_right',
  });

  return {
    isWeb,
    isTablet,
    getTabBarConfig,
    getSidebarConfig,
    getPlatformHeaderConfig,
  };
};