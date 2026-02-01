import React from 'react';
import { Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AppHeader from './AppHeader';
import { useSidebar } from '../../context/SidebarContext';
import { useTheme } from '../../context/ThemeContext';

type Props = {
  title?: string;
  subtitle?: string;
  forceBackOnMobile?: boolean; 
  backTo?: string; 
  onBack?: () => void; 
  titleStyle?: object;
  containerStyle?: object;
  showOnWeb?: boolean; 
  backIconColor?: string;
  right?: React.ReactNode;
  
  suppressBack?: boolean;
  
  minimalBack?: boolean;
};

export default function InlineHeader({ title, subtitle, forceBackOnMobile = false, backTo, onBack, titleStyle, containerStyle, showOnWeb = false, backIconColor, right, suppressBack = false, minimalBack = false }: Props) {
  const navigation = useNavigation<any>();

  const isWeb = Platform.OS === 'web';
  const sidebar = useSidebar ? useSidebar() : null;
  const sidebarOpen = !!(sidebar && sidebar.isSidebarOpen);
  const { colors } = useTheme();

  
  if (!isWeb) return null;

  
  
  if (isWeb && !showOnWeb) return null;

  
  const effectiveContainerStyle = {
    ...(containerStyle || {}),
    backgroundColor: colors.primary,
    borderBottomColor: colors.primary,
  };

  
  if (sidebarOpen) {
    return (
      <AppHeader
        title={title}
        showBack={false}
        backTo={backTo}
        onBack={onBack}
        backIconColor={backIconColor}
        containerStyle={effectiveContainerStyle}
        titleStyle={titleStyle}
        showOnWeb={showOnWeb}
        right={right}
        minimal={minimalBack}
      />
    );
  }

  
  let showBack: boolean | undefined = undefined;

  if (suppressBack) {
    showBack = false;
  } else if (forceBackOnMobile && !isWeb) {
    
    showBack = true;
  } else if (backTo) {
    showBack = true;
  } else {
    
    
    const canGoBack = (navigation && typeof navigation.canGoBack === 'function') ? (() => { try { return navigation.canGoBack(); } catch (e) { return false; } })() : false;
    const webHasHistory = isWeb && typeof window !== 'undefined' && !!(window.history && window.history.length > 1);
    const navState = (navigation as any)?.getState ? (navigation as any).getState() : null;
    const hasNavIndex = (navState?.index ?? 0) > 0;
    const topLevelRoutes = new Set(['Dashboard', 'Home', 'AdminDashboard', 'AllCourses', 'Categories', 'MyCourses', 'Profile', 'Settings']);
    const route = (navigation as any).getCurrentRoute ? (navigation as any).getCurrentRoute() : null;
    const routeIsTopLevel = !!(route && topLevelRoutes.has(route.name));
    const effectiveCanGoBack = canGoBack || webHasHistory || hasNavIndex || (route && !routeIsTopLevel);
    
    if (isWeb && !sidebarOpen) {
      showBack = true;
    } else {
      showBack = effectiveCanGoBack ? true : undefined;
    }
  }

  
  return (
    <AppHeader
      title={title}
      subtitle={subtitle}
      showBack={showBack}
      backTo={backTo}
      onBack={onBack}
      backIconColor={backIconColor}
      containerStyle={effectiveContainerStyle}
      titleStyle={titleStyle}
      showOnWeb={showOnWeb}
      right={right}
      minimal={minimalBack}
    />
  );
}

