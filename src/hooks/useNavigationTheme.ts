import { useTheme } from '../context/ThemeContext';
import { DefaultTheme } from '@react-navigation/native';
import { useResponsive } from './useResponsive';

export const useNavigationTheme = () => {
  const { theme } = useTheme();
  const { isWeb } = useResponsive();

  const navigationTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: theme.colors.primary,
      background: theme.colors.background,
      card: theme.colors.card,
      text: theme.colors.text,
      border: theme.colors.border,
      notification: theme.colors.primary,
    },
  };

  const getHeaderStyles = () => ({
    headerStyle: {
      backgroundColor: isWeb ? theme.colors.background : theme.colors.primary,
      elevation: 0,
      shadowOpacity: 0,
    },
    headerTintColor: isWeb ? theme.colors.text : '#ffffff',
    headerTitleStyle: {
      fontWeight: '600' as const,
      color: isWeb ? theme.colors.text : '#ffffff',
    },
    headerBackTitle: '',
    headerBackTitleVisible: false,
  });

  return {
    navigationTheme,
    getHeaderStyles,
  };
};

export default useNavigationTheme;