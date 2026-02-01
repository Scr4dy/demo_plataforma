import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LightTheme, DarkTheme } from '../constants/Theme';
import { Platform, Appearance } from 'react-native'; 

type ThemeType = 'light' | 'dark' | 'auto';
export type ColorScheme = 'usa' | 'ocean' | 'forest' | 'sunset';
export type FontSize = 'small' | 'medium' | 'large';

interface ThemeColors {
  primary: string;
  primaryDark: string;
  primaryLight: string;
  accent: string;
  
  text?: string;
  textSecondary?: string;
  card?: string;
  border?: string;
  icon?: string;
  divider?: string;
  
  error?: string;
  success?: string;
  warning?: string;
  
  background?: string;
}

export const colorSchemes: Record<ColorScheme, ThemeColors> = {
  usa: { primary: '#DC143C', primaryDark: '#B71C1C', primaryLight: '#FFE5E5', accent: '#2C2C2C', text: '#1a1a1a', textSecondary: '#6B7280', card: '#ffffff', background: '#f5f7f9', border: '#e5e7eb', icon: '#666666', divider: '#e5e7eb', error: '#e53e3e', success: '#38a169', warning: '#d69e2e' },
  ocean: { primary: '#0277BD', primaryDark: '#01579B', primaryLight: '#E1F5FE', accent: '#00ACC1', text: '#0f172a', textSecondary: '#475569', card: '#ffffff', background: '#f3fbff', border: '#e6f2fb', icon: '#2b6cb0', divider: '#e1f5fe', error: '#e53e3e', success: '#38a169', warning: '#d69e2e' },
  forest: { primary: '#2E7D32', primaryDark: '#1B5E20', primaryLight: '#E8F5E9', accent: '#558B2F', text: '#042f1f', textSecondary: '#2f855a', card: '#f0f9f4', background: '#f7fffb', border: '#e6f4ea', icon: '#2f855a', divider: '#e8f5e9', error: '#e53e3e', success: '#38a169', warning: '#d69e2e' },
  sunset: { primary: '#E65100', primaryDark: '#BF360C', primaryLight: '#FFF3E0', accent: '#F57C00', text: '#2a1a12', textSecondary: '#7a4b2b', card: '#fff7ef', background: '#fffaf5', border: '#ffedd5', icon: '#d97706', divider: '#fff3e0', error: '#e53e3e', success: '#38a169', warning: '#d69e2e' },
};

export const fontSizeMultipliers: Record<FontSize, number> = {
  small: 0.875,
  medium: 1,
  large: 1.125,
};

interface ThemeContextType {
  theme: typeof LightTheme & { dark: boolean };
  themeType: ThemeType;
  colorScheme: ColorScheme;
  fontSize: FontSize;
  avatar: string;
  profileImage: string | null;
  setThemeType: (type: ThemeType) => Promise<void>;
  toggleTheme: () => Promise<void>;
  setColorScheme: (scheme: ColorScheme) => Promise<void>;
  setFontSize: (size: FontSize) => Promise<void>;
  setAvatar: (avatar: string) => Promise<void>;
  setProfileImage: (imageUri: string | null) => Promise<void>;
  getFontSize: (baseSize: number) => number;
  colors: ThemeColors;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
const STORAGE_KEY = '@user_preferences';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeType, setThemeTypeState] = useState<ThemeType>('light');
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>('usa');
  const [fontSize, setFontSizeState] = useState<FontSize>('medium');
  const [avatar, setAvatarState] = useState<string>('person');
  const [profileImage, setProfileImageState] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  
  useEffect(() => {
    loadPreferences();

    
    const cleanupInterval = setInterval(() => {
      import('../services/profileStorageService').then(({ profileStorageService }) => {
        profileStorageService.cleanOldCache();
      });
    }, 24 * 60 * 60 * 1000);

    return () => clearInterval(cleanupInterval);
  }, []);

  const loadPreferences = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const prefs = JSON.parse(stored);
        setColorSchemeState(prefs.colorScheme || 'usa');
        setFontSizeState(prefs.fontSize || 'medium');
        setAvatarState(prefs.avatar || 'person');
        setThemeTypeState(prefs.themeType || 'light');

        
        await loadProfileImage();

      } else {

      }
    } catch (error) {
      
    } finally {
      setIsReady(true);
    }
  };

  const loadProfileImage = async () => {
    try {
      
      const { supabase } = await import('../config/supabase');
      const { profileStorageService } = await import('../services/profileStorageService');

      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {

        return;
      }

      
      const { data: userData } = await supabase
        .from('usuarios')
        .select('id_usuario, avatar_path')
        .eq('auth_id', session.user.id)
        .single();

      if (userData?.avatar_path) {
        
        const uri = await profileStorageService.getAvatarUri(
          userData.id_usuario,
          userData.avatar_path
        );

        if (uri) {
          setProfileImageState(uri);

        } else {

          
          await supabase
            .from('usuarios')
            .update({ avatar_path: null })
            .eq('id_usuario', userData.id_usuario);
        }
      }
    } catch (error: any) {
      
      if (error.message && !error.message.includes('Object not found')) {
        
      }
    }
  };

  const savePreference = async (key: string, value: any) => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      const prefs = stored ? JSON.parse(stored) : {};
      prefs[key] = value;
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));

    } catch (error) {
      
    }
  };

  const setColorScheme = async (scheme: ColorScheme) => {
    setColorSchemeState(scheme);
    await savePreference('colorScheme', scheme);
  };

  const setFontSize = async (size: FontSize) => {
    setFontSizeState(size);
    await savePreference('fontSize', size);
  };

  const setAvatar = async (newAvatar: string) => {
    setAvatarState(newAvatar);
    await savePreference('avatar', newAvatar);
  };

  const setProfileImage = async (imageUri: string | null) => {

    setProfileImageState(imageUri);
    await savePreference('profileImage', imageUri);

    
    if (Platform.OS === 'web') {
      
      const event = new CustomEvent('profileImageUpdated', {
        detail: { imageUri }
      });
      window.dispatchEvent(event);

    }
  };

  const getFontSize = (baseSize: number) => {
    return baseSize * fontSizeMultipliers[fontSize];
  };

  
  const [systemPrefersDark, setSystemPrefersDark] = useState<boolean>(Appearance.getColorScheme() === 'dark');

  React.useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }: any) => {
      setSystemPrefersDark(colorScheme === 'dark');
    });
    return () => sub.remove();
  }, []);

  const isDarkMode = useMemo(() => {
    if (themeType === 'dark') return true;
    if (themeType === 'light') return false;
    
    return systemPrefersDark;
  }, [themeType, systemPrefersDark]);

  
  const hexDarken = (hex: string, factor: number) => {
    try {
      const h = hex.replace('#', '');
      const bigint = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16);
      let r = (bigint >> 16) & 255;
      let g = (bigint >> 8) & 255;
      let b = bigint & 255;
      r = Math.max(0, Math.min(255, Math.round(r * (1 - factor))));
      g = Math.max(0, Math.min(255, Math.round(g * (1 - factor))));
      b = Math.max(0, Math.min(255, Math.round(b * (1 - factor))));
      const rr = r.toString(16).padStart(2, '0');
      const gg = g.toString(16).padStart(2, '0');
      const bb = b.toString(16).padStart(2, '0');
      return `#${rr}${gg}${bb}`;
    } catch (e) {
      return hex;
    }
  };

  
  const colors = useMemo(() => {
    const base = colorSchemes[colorScheme];
    if (!isDarkMode) return base;

    
    return {
      ...base,
      card: hexDarken(base.card || '#ffffff', 0.78),
      background: hexDarken(base.background || '#000000', 0.88),
      text: '#E6F0F0',
      textSecondary: '#9CA3AF',
      border: hexDarken(base.border || '#111111', 0.7),
      divider: hexDarken(base.divider || '#111111', 0.7),
    } as ThemeColors;
  }, [colorScheme, isDarkMode]);

  
  const theme = useMemo(() => {
    const baseTheme = isDarkMode ? DarkTheme : LightTheme;
    return { ...baseTheme, dark: isDarkMode, colors: { ...baseTheme.colors, ...colors } };
  }, [isDarkMode, colors]);

  
  useEffect(() => {
    if (isReady) {
    }
  }, [isDarkMode, themeType, colorScheme, isReady, profileImage]);

  const setThemeType = async (type: ThemeType) => {

    setThemeTypeState(type);
    await savePreference('themeType', type);

  };

  const toggleTheme = async () => {
    const newType = themeType === 'light' ? 'dark' : 'light';
    await setThemeType(newType);
  };

  
  useEffect(() => {
    let authListener: any = null;

    const setupAuthListener = async () => {
      try {
        const { supabase } = await import('../config/supabase');

        
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await loadProfileImage();
        }

        
        const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (event === 'SIGNED_IN' && session?.user) {
            
            await loadProfileImage();
          } else if (event === 'SIGNED_OUT') {
            
            setProfileImageState(null);
          }
        });

        authListener = data.subscription;
      } catch (error) {
        
      }
    };

    setupAuthListener();

    return () => {
      if (authListener) {
        authListener.unsubscribe();
      }
    };
  }, []);

  
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && typeof (window as any).addEventListener === 'function') {
      const handleProfileImageUpdate = (event: CustomEvent) => {

        
        setProfileImageState(event.detail?.imageUri || null);
      };

      window.addEventListener('profileImageUpdated', handleProfileImageUpdate as EventListener);

      return () => {
        if (typeof window !== 'undefined' && typeof (window as any).removeEventListener === 'function') {
          window.removeEventListener('profileImageUpdated', handleProfileImageUpdate as EventListener);
        }
      };
    }
  }, []);

  return (
    <ThemeContext.Provider value={{
      theme,
      themeType,
      setThemeType,
      toggleTheme,
      colorScheme,
      fontSize,
      avatar,
      profileImage,
      setColorScheme,
      setFontSize,
      setAvatar,
      setProfileImage,
      getFontSize,
      colors: colors,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};