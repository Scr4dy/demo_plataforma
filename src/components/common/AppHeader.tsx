import React, { ReactNode } from 'react';
import { View, Text, TouchableOpacity, Platform, StyleSheet, useWindowDimensions, StatusBar } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { useSidebar } from '../../context/SidebarContext';

type Props = {
  title?: string;
  subtitle?: string;
  showBack?: boolean; 
  backTo?: string; 
  onBack?: () => void; 
  right?: ReactNode; 
  containerStyle?: object;
  titleStyle?: object;
  showOnWeb?: boolean; 
  showBackText?: boolean; 
  backIconColor?: string; 
  
  minimal?: boolean;
  
  alignLeftOnMobile?: boolean;
};

export default function AppHeader({
  title,
  subtitle,
  showBack,
  backTo,
  onBack: customOnBack,
  right,
  containerStyle,
  titleStyle,
  showOnWeb = true,
  showBackText = false,
  backIconColor,
  minimal = false,
  alignLeftOnMobile,
}: Props) {
  const isWeb = Platform.OS === 'web';
  const navigation = useNavigation<any>();
  const { theme, colors } = useTheme();
  const { width } = useWindowDimensions();

  
  
  
  
  const sidebar = useSidebar();
  const sidebarOpen = !!(sidebar && (sidebar.isSidebarOpen));
  if (isWeb && !showOnWeb && sidebarOpen) return null;

  const canGoBack = (navigation && typeof navigation.canGoBack === 'function') ? (() => { try { return navigation.canGoBack(); } catch (e) { return false; } })() : false;
  
  
  
  const webHasHistory = isWeb && typeof window !== 'undefined' && !!(window.history && window.history.length > 1);
  
  const navState = (navigation as any)?.getState ? (navigation as any).getState() : null;
  const navIndex = navState?.index ?? 0;
  const hasNavIndex = navIndex > 0;
  
  
  
  const topLevelRoutes = new Set([
    'Dashboard',      
    'AllCourses',     
    'Categories',     
    'Certificates',   
    'Team',           
    'Instructor',     
    'AdminDashboard'  
  ]);

  
  
  let route: any = null;
  try {
    
    route = useRoute();
  } catch (e) {
    
    try {
      route = (navigation as any)?.getCurrentRoute ? (navigation as any).getCurrentRoute() : null;
    } catch (e2) {
      route = null;
    }
  }

  const routeIsTopLevel = !!(route && topLevelRoutes.has(route.name));

  if (process.env.NODE_ENV !== 'production') {
    
    const alignLeftPreview = Platform.OS !== 'web' && (typeof alignLeftOnMobile !== 'undefined' ? alignLeftOnMobile : routeIsTopLevel);
    
  }
  const effectiveCanGoBack = Boolean(canGoBack || webHasHistory || hasNavIndex || (route && !routeIsTopLevel));

  
  let renderBack: boolean;
  if (showBack === false) {
    
    renderBack = false;
  } else if (showBack === true) {
    
    renderBack = true;
  } else {
    
    
    renderBack = Boolean(effectiveCanGoBack);
  }

  
  
  if (sidebarOpen && showBack !== true) renderBack = false;

  
  
  const isKnownTopLevelTitle = Platform.OS !== 'web' && (title === 'Mi Equipo' || title === 'Administración' || title === 'Gestión de Cursos');
  if (Platform.OS !== 'web' && (routeIsTopLevel || isKnownTopLevelTitle) && showBack !== true) {
    renderBack = false;
  }

  
  const showBackLabel = Boolean(width >= 900 || effectiveCanGoBack || showBack);

  
  const defaultBackground = colors.primary; 
  const isPrimaryBg = true; 
  
  const iconSize = minimal ? 18 : 24;

  
  const alignLeft = (typeof alignLeftOnMobile !== 'undefined') ? alignLeftOnMobile : (Platform.OS !== 'web');
  const onBack = () => {
    try {
      
      if (customOnBack) {
        customOnBack();
        return;
      }

      
      if (backTo) {
        if (Platform.OS === 'web') {
          const { goToWebTab } = require('../../utils/webNav');
          goToWebTab(backTo);
        } else {
          navigation.navigate(backTo, route?.params);
        }
        return;
      }

      
      const navCanGoBackLocal = (navigation && typeof navigation.canGoBack === 'function') ? (() => { try { return navigation.canGoBack(); } catch (_) { return false; } })() : false;
      if (navCanGoBackLocal) {
        try { navigation.goBack(); return; } catch (_) {  }
      }

      
      if (isWeb && typeof window !== 'undefined') {
        if (webHasHistory) {
          try { window.history.back(); return; } catch (_) {  }
        }
        try {
          const { goToWebTab } = require('../../utils/webNav');
          goToWebTab('Dashboard');
          return;
        } catch (_) {
          try { window.location.hash = '#Dashboard'; return; } catch (_) {  }
        }
      }

      
      try {
        if (navigation && typeof navigation.canGoBack === 'function' && navigation.canGoBack()) {
          try { navigation.goBack(); return; } catch (_) {  }
        }
      } catch (_) {  }
    } catch (err) {
      
      try {
        if (navigation && typeof navigation.canGoBack === 'function' && navigation.canGoBack()) {
          try { navigation.goBack(); } catch (_) {  }
        }
      } catch (_) {  }
    }
  };

  
  const hexToRgb = (hex: string) => {
    const h = hex.replace('#', '');
    const clean = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
    const bigint = parseInt(clean, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return { r, g, b };
  };

  const luminance = (r: number, g: number, b: number) => {
    
    const a = [r, g, b].map(v => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
  };

  
  const headerBg = (containerStyle && (containerStyle as any).backgroundColor) ? (containerStyle as any).backgroundColor : defaultBackground;
  let titleColor = theme.colors.card || '#fff';
  let subtitleColor = theme.colors.card || 'rgba(255,255,255,0.9)';
  let computedIconColor = backIconColor || theme.colors.card || '#fff';

  
  if (headerBg === defaultBackground) {
    
    titleColor = '#ffffff';
    subtitleColor = 'rgba(255,255,255,0.92)'; 
    computedIconColor = backIconColor || '#ffffff';
  }
  
  else if (typeof headerBg === 'string' && headerBg.startsWith('#')) {
    try {
      const { r, g, b } = hexToRgb(headerBg);
      const L = luminance(r, g, b);
      const isBgLight = L > 0.5;
      
      if (isBgLight) {
        titleColor = theme.colors.text;
        subtitleColor = theme.colors.textSecondary;
        computedIconColor = backIconColor || theme.colors.icon || theme.colors.text;
      } else {
        titleColor = theme.colors.card;
        
        const card = theme.colors.card || '#ffffff';
        subtitleColor = card === '#ffffff' ? 'rgba(255,255,255,0.9)' : card;
        computedIconColor = backIconColor || theme.colors.card || '#fff';
      }
    } catch (e) {
      
    }
  } else {
    
    titleColor = theme.colors.card || '#fff';
    subtitleColor = theme.colors.card || 'rgba(255,255,255,0.9)';
    computedIconColor = backIconColor || theme.colors.card || '#fff';
  }

  
  const smallScreen = width < 420;
  const dynamicTitleFontSize = smallScreen ? 16 : 18;

  
  const headerPaddingHorizontal = alignLeft ? 8 : 16;
  const leftSpacerWidth = (!renderBack && alignLeft) ? 12 : 28;
  const rightMinWidth = alignLeft ? 80 : 56;

  
  const webStickyStyle = isWeb ? ({ position: 'sticky', top: 0, zIndex: 9999 } as any) : { zIndex: 9999 };

  
  const insets = useSafeAreaInsets();
  
  const topPadding = insets.top || 0;

  
  
  const rightPadding = Platform.OS !== 'web' ? Math.max(4, (insets.right || 0) + 4) : (alignLeft ? 6 : 8);

  
  const safeAreaBackground = (containerStyle && (containerStyle as any).backgroundColor) ? (containerStyle as any).backgroundColor : defaultBackground;

  return (
    <SafeAreaView edges={[]} style={[styles.safeAreaContainer, { backgroundColor: safeAreaBackground }, containerStyle]}>
      <View style={[styles.headerInner, { backgroundColor: defaultBackground, borderBottomColor: theme.colors.border, paddingHorizontal: headerPaddingHorizontal, paddingTop: topPadding, ...webStickyStyle }, containerStyle]}>
        <View style={[styles.left, { minWidth: renderBack ? undefined : leftSpacerWidth }]}>
          {renderBack ? (
            <TouchableOpacity
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Volver"
              accessibilityHint="Vuelve a la pantalla anterior"
              style={[
                styles.backButton,
                minimal ? {
                  padding: 6,
                  borderRadius: 6,
                  marginRight: 8,
                  backgroundColor: 'transparent',
                  borderWidth: 0,
                  minWidth: 28,
                  minHeight: 28,
                } : {
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: 'transparent',
                  borderWidth: 0,
                  paddingVertical: 8,
                  paddingHorizontal: 8,
                  borderRadius: 8,
                  minWidth: 40,
                  minHeight: 40,
                  marginRight: 8,
                }
              ]}
              onPress={onBack}
            >
              <Ionicons name="arrow-back" size={iconSize} color={computedIconColor} />
              {showBackText && showBackLabel && !minimal && (
                <Text style={[styles.backLabel, { color: computedIconColor, marginLeft: 8 }]}>Volver</Text>
              )}
            </TouchableOpacity>
          ) : (
            <View style={[styles.spacer, { width: leftSpacerWidth }]} />
          )}
        </View>

        {}
        <View style={[styles.center, alignLeft ? { alignItems: 'flex-start', paddingLeft: 6 } : (smallScreen ? { paddingHorizontal: 8 } : {})]}>
          {}
          <Text numberOfLines={Platform.OS === 'web' ? (alignLeft ? 2 : 1) : 2} ellipsizeMode="tail" style={[styles.title, { color: titleColor, fontSize: dynamicTitleFontSize, textAlign: alignLeft ? 'left' : 'center', flexShrink: 1 }, titleStyle]}>{String(title || '')}</Text>
          <Text
            numberOfLines={Platform.OS === 'web' ? (alignLeft ? 2 : 1) : 2}
            ellipsizeMode="tail"
            style={[
              styles.subtitle,
              {
                color: subtitleColor, textAlign: alignLeft ? 'left' : 'center', flexShrink: 1,
                
                opacity: (typeof subtitle !== 'undefined' && subtitle !== null) ? 1 : 0
              }
            ]}
          >{String((typeof subtitle !== 'undefined' && subtitle !== null) ? subtitle : ' ')}</Text>
        </View>

        <View style={[styles.right, { minWidth: rightMinWidth, paddingRight: rightPadding, justifyContent: 'flex-end' }]}>
          {right ? right : <View style={[styles.spacer, { width: leftSpacerWidth }]} />}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Platform.OS === 'web' ? 6 : 2,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent', 
    
    ...Platform.select({ android: { elevation: 6 }, ios: { zIndex: 9999 } }),
  },
  
  safeAreaContainer: {
    width: '100%',
    backgroundColor: 'transparent',
  },
  
  headerInner: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Platform.OS === 'web' ? 8 : 6,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
    ...Platform.select({ android: { elevation: 6 }, ios: { zIndex: 9999 } }),
  },
  left: { minWidth: 56, alignItems: 'flex-start' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 },
  right: { minWidth: 56, alignItems: 'flex-end', paddingRight: 8 },
  title: { fontSize: 18, fontWeight: '700', textAlign: 'center' },
  subtitle: { fontSize: 13, marginTop: 2 },
  backButton: { padding: 6, borderRadius: 8 },
  backLabel: { fontSize: 14, fontWeight: '600' },
  spacer: { width: 28 },
});
