import { Platform } from 'react-native';

export type ShadowParams = {
  boxShadow?: string; 
  elevation?: number; 
  shadowColor?: string; 
  shadowOffset?: { width: number; height: number };
  shadowOpacity?: number;
  shadowRadius?: number;
};

export function platformShadow(shadow: ShadowParams) {
  if (Platform.OS === 'web') {
    
    if (shadow.boxShadow) return { boxShadow: shadow.boxShadow };
    if (shadow.shadowColor) {
      const { shadowColor, shadowOffset, shadowRadius, shadowOpacity } = shadow;
      const offsetX = shadowOffset?.width || 0;
      const offsetY = shadowOffset?.height || 0;
      const blur = shadowRadius || 4;
      const opacity = typeof shadowOpacity === 'number' ? shadowOpacity : 0.1;
      
      return { boxShadow: `${offsetX}px ${offsetY}px ${blur}px rgba(0,0,0,${opacity})` };
    }
    return {};
  }
  if (Platform.OS === 'android') {
    return { elevation: shadow.elevation ?? 4 };
  }
  
  return {
    shadowColor: shadow.shadowColor ?? '#000',
    shadowOffset: shadow.shadowOffset ?? { width: 0, height: 2 },
    shadowOpacity: shadow.shadowOpacity ?? 0.1,
    shadowRadius: shadow.shadowRadius ?? 4,
  };
}

export default { platformShadow };
