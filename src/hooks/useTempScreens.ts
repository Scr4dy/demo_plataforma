import { useTheme } from '../context/ThemeContext'; 
import { useResponsive } from './useResponsive';

export const useTempScreens = () => {
  const { theme } = useTheme();
  const { rv } = useResponsive();

  const getTempScreenConfig = (title: string, description: string, iconName: string = 'construct') => {
    return {
      title,
      description,
      iconName,
      colors: {
        background: theme.colors.background,
        text: theme.colors.text,
        textSecondary: theme.colors.textSecondary,
        warning: theme.colors.warning,
      },
      styles: {
        iconSize: rv(64),
        iconMargin: rv(20),
        titleSize: rv(20),
        descriptionSize: rv(16),
      }
    };
  };

  const tempScreens = {
    changePassword: () => getTempScreenConfig(
      'Cambiar Contraseña',
      'Esta funcionalidad estará disponible pronto. Estamos trabajando para mejorar tu experiencia.'
    ),
    notifications: () => getTempScreenConfig(
      'Configuración de Notificaciones',
      'Próximamente podrás personalizar tus notificaciones según tus preferencias.',
      'notifications'
    ),
    language: () => getTempScreenConfig(
      'Configuración de Idioma',
      'Muy pronto podrás cambiar el idioma de la aplicación a tu preferencia.',
      'language'
    ),
    help: () => getTempScreenConfig(
      'Ayuda y Soporte',
      'Estamos preparando un centro de ayuda completo para resolver todas tus dudas.',
      'help-circle'
    ),
    profile: () => getTempScreenConfig(
      'Perfil de Usuario',
      'El perfil de usuario estará disponible en la próxima actualización.',
      'person'
    ),
  };

  return {
    getTempScreenConfig,
    tempScreens,
  };
};