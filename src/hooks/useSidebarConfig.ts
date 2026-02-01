import { useTheme } from '../context/ThemeContext';
import { useState } from 'react';
import { useResponsive } from './useResponsive';

export const useSidebarConfig = () => {
  const { theme } = useTheme();
  const { isDesktop, isMobile, rv } = useResponsive(); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile); 

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const menuItems = [
    { id: 'Dashboard', label: 'Dashboard', icon: 'grid' },
    { id: 'Evaluation', label: 'Evaluación', icon: 'clipboard' },
    { id: 'Certificates', label: 'Certificados', icon: 'document-text' },
    { id: 'Team', label: 'Equipo', icon: 'people' },
    { id: 'Profile', label: 'Perfil', icon: 'person' },
  ];

  const getSidebarStyles = () => {
    const baseWidth = isMobile ? rv(280) : rv(240);
    const collapsedWidth = isMobile ? 0 : rv(80); 
    
    return {
      sidebar: {
        width: isSidebarOpen ? baseWidth : collapsedWidth,
      },
      header: {
        paddingHorizontal: rv(16),
        paddingVertical: rv(12),
        minHeight: rv(60),
      },
      menu: {
        paddingHorizontal: rv(12),
      },
      item: {
        paddingVertical: rv(12),
        paddingHorizontal: rv(12),
        borderRadius: rv(8),
        marginBottom: rv(4),
      },
      typography: {
        titleSize: rv(18),
        labelSize: rv(14),
        iconSize: rv(24),
      },
      topHeader: {
        height: rv(60),
        paddingHorizontal: rv(20),
      },
    };
  };

  return {
    menuItems,
    isSidebarOpen,
    toggleSidebar,
    getSidebarStyles,
    colors: theme.colors,
  };
};

export default useSidebarConfig;