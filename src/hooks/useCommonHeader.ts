
import { useLayoutEffect } from 'react';
import { Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSidebar } from '../context/SidebarContext';

export const useCommonHeader = (title?: string) => {
  const navigation = useNavigation();
  const sidebar = useSidebar();
  const sidebarOpen = !!(sidebar && sidebar.isSidebarOpen);

  useLayoutEffect(() => {
    
    if (Platform.OS === 'web') return;
    
    if (navigation && typeof navigation.setOptions === 'function') {
      if ((Platform as any).OS !== 'web' && title != null) {

      }
      navigation.setOptions({
        headerStyle: {
          backgroundColor: '#2196F3',
        },
        headerTintColor: '#ffffff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        
        ...(sidebarOpen ? { headerLeft: () => null } : {}),
        ...(title != null ? { title: String(title) } : {}),
      });
    }
  }, [navigation, title, sidebarOpen]);
};