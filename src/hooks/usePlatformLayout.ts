
import { Platform } from 'react-native';

export const usePlatformLayout = () => {
  const isWeb = Platform.OS === 'web';
  
  const getLayoutComponent = (WebComponent: any, MobileComponent: any) => {
    return isWeb ? WebComponent : MobileComponent;
  };

  return {
    isWeb,
    getLayoutComponent,
  };
};