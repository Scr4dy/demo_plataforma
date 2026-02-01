import React, { createContext, useContext, useState, ReactNode } from 'react';
import AppHeader from '../components/common/AppHeader';
import { View, Platform } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { navigate } from '../services/navigationService';
import UserMenu from '../components/common/UserMenu';

export type HeaderProps = {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  backTo?: string;
  onBack?: () => void;
  backIconColor?: string;
  containerStyle?: object;
  titleStyle?: object;
  right?: ReactNode;
  minimal?: boolean;
  
  auto?: boolean;
  
  manual?: boolean;
  
  alignLeftOnMobile?: boolean;
  
  hidden?: boolean;
  
  owner?: string;
};

type ContextValue = {
  header: HeaderProps | null;
  setHeader: (h: HeaderProps | null) => void;
};

const HeaderContext = createContext<ContextValue>({ header: null, setHeader: () => { } });

export const HeaderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [headerState, setHeaderState] = useState<HeaderProps | null>(null);

  
  
  const lastClearRef = React.useRef<{ owner?: string | null; ts?: number | null; fingerprint?: string | null }>({ owner: null, ts: null, fingerprint: null });

  
  
  
  const setHeader = React.useCallback((h: HeaderProps | null) => {
    if (process.env.NODE_ENV !== 'production') {
      
      const stack = (new Error().stack || '').split('\n').slice(2, 6).map(s => s.trim());
    }

    
    const now = Date.now();
    const incoming = h === null ? null : ({ ...h, __ts: (h as any)?.__ts || now } as any);

    
    setHeaderState(prev => {
      const prevH = prev as any;
      const nextH = incoming as any;

      
      if (nextH === null) {
        try {
          const fingerprint = prevH ? `${prevH.owner || ''}|${prevH.title || ''}|${prevH.subtitle || ''}` : null;
          lastClearRef.current = { owner: prevH?.owner || null, ts: Date.now(), fingerprint };
        } catch (e) {  }
        return null;
      }

      
      try {
        const last = lastClearRef.current;
        const THRESHOLD_MS = 800; 
        const nextFingerprint = nextH ? `${nextH.owner || ''}|${nextH.title || ''}|${nextH.subtitle || ''}` : null;
        
        if (last && last.ts && (Date.now() - last.ts) < THRESHOLD_MS) {
          const sameOwner = last.owner && nextH?.owner && last.owner === nextH.owner;
          const sameFingerprint = last.fingerprint && nextFingerprint && last.fingerprint === nextFingerprint;
          if (sameOwner || sameFingerprint) {
            return prev; 
          }
        }
      } catch (e) {  }

      
      if (prevH?.manual === true && nextH?.manual !== true && nextH !== null) {
        return prev;
      }

      
      try {
        const { navigationRef } = require('../services/navigationService');
        const current = navigationRef.current?.getCurrentRoute ? navigationRef.current.getCurrentRoute() : null;
        const currentName = current?.name || null;
        if (currentName && (currentName === 'Login' || currentName === 'Register')) {
          if (nextH !== null && nextH?.manual !== true && nextH?.hidden !== true) {
            return prev;
          }
        }
      } catch (e) {
        
      }

      
      if (nextH?.provisional) {
        if (prevH && !prevH?.provisional) {
          return prev;
        }
      }

      
      const prevTs = prevH?.__ts || 0;
      const nextTs = nextH?.__ts || now;
      if (prevTs && nextTs < prevTs && nextH?.owner !== prevH?.owner) {
        return prev;
      }

      const same = (
        prevH?.title === nextH?.title &&
        prevH?.subtitle === nextH?.subtitle &&
        prevH?.showBack === nextH?.showBack &&
        prevH?.manual === nextH?.manual &&
        prevH?.hidden === nextH?.hidden &&
        prevH?.alignLeftOnMobile === nextH?.alignLeftOnMobile &&
        prevH?.backTo === nextH?.backTo
      );
      if (same) return prev;

      
      try { lastClearRef.current = { owner: null, ts: null }; } catch (e) {  }

      return nextH;
    });
  }, []); 

  return (
    <HeaderContext.Provider value={{ header: headerState, setHeader }}>
      {children}
    </HeaderContext.Provider>
  );
};

export const useHeader = () => useContext(HeaderContext);

export const HeaderRenderer: React.FC = () => {
  const { header, setHeader } = useHeader();
  const { state } = useAuth();
  const { colors } = useTheme();

  
  
  if (Platform.OS === 'web') {
    if (!header || header.manual !== true) {
      return null;
    }
    
  }

  const defaultRight = (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {}
      <UserMenu />
    </View>
  );

  
  
  

  if (process.env.NODE_ENV !== 'production') {
  }

  
  let routeHook: any = undefined;
  try {
    routeHook = useRoute();
  } catch (e) {
    
    routeHook = undefined;
  }

  let navigationHook: any = undefined;
  try {
    navigationHook = useNavigation();
  } catch (e) {
    navigationHook = undefined;
  }

  const [devRouteName, setDevRouteName] = React.useState<string>(routeHook?.name || 'Dashboard');

  React.useEffect(() => {
    let mounted = true;
    try {
      const { navigationRef } = require('../services/navigationService');
      const handle = () => {
        try {
          let stateObj = navigationRef.current?.getRootState ? navigationRef.current.getRootState() : null;
          if (stateObj) {
            let st: any = stateObj;
            while (st && st.routes && st.index != null) {
              const r = st.routes[st.index];
              if (!r) break;
              if (r.state) { st = r.state as any; continue; }
              const name = r.name || 'Dashboard';
              if (mounted) setDevRouteName(name);
              return;
            }
          }
          const current = navigationRef.current?.getCurrentRoute ? navigationRef.current.getCurrentRoute() : null;
          const name = current?.name || 'Dashboard';
          if (mounted) setDevRouteName(name);
        } catch (err) {
          
        }
      };

      
      handle();

      
      if (navigationRef && navigationRef.current && typeof navigationRef.current.addListener === 'function') {
        const unsubscribe = navigationRef.current.addListener('state', handle);
        return () => { mounted = false; try { unsubscribe(); } catch (_) { } };
      }

      
      const t = setTimeout(() => { if (mounted) handle(); }, 200);
      return () => { mounted = false; clearTimeout(t); };
    } catch (e) {
      
    }
  }, []);

  
  const simpleHeaderTitle = (routeName: string) => {
    switch (routeName) {
      case 'Dashboard': return 'Dashboard';
      case 'Certificates': return 'Certificados';
      case 'CourseDetail': return 'Detalle del Curso';
      case 'ProfileSettings': return 'Mi Perfil';
      case 'Modules': return 'Módulos';
      case 'Lessons': return 'Lecciones';
      case 'LessonDetail': return 'Lección';
      case 'QuizManagement': return 'Gestión de Quiz';
      case 'AdminCourses': return 'Gestión de Cursos';
      case 'AdminDashboard': return 'Administración';
      case 'AdminUsers': return 'Gestión de Usuarios';
      case 'AllCourses': return 'Todos los Cursos';
      case 'MyCourses': return 'Mis Cursos';
      case 'Categories': return 'Cursos';
      case 'Profile': return 'Perfil';
      case 'Settings': return 'Ajustes';
      case 'Home': return 'Inicio';
      case 'Team': return 'Equipo';
      case 'InstructorDashboard': return 'Instructor';
      case 'InstructorCourses': return 'Cursos del Instructor';
      case 'CoursePreview': return 'Vista previa del curso';
      default: return routeName || 'Dashboard';
    }
  };

  
  const defaultSubtitleMap: Record<string, string | undefined> = {
    CourseDetail: 'Información y contenido del curso',
    AdminCourses: 'Gestión y edición de cursos',
    AdminDashboard: 'Panel de control y gestión del sistema',
    AdminUsers: 'Gestión de usuarios y roles',
    Certificates: 'Tus certificados de capacitación',
    Categories: 'Explora por categoría',
    Dashboard: 'Tu panel de aprendizaje',
    Team: 'Gestión de tu equipo y personal a cargo',
    MyCourses: 'Tus cursos inscritos',
  };

  
  const lastRouteRef = React.useRef<string | null>(null);
  React.useEffect(() => {
    
    if (lastRouteRef.current === null) {
      lastRouteRef.current = devRouteName;
      return;
    }

    
    if (lastRouteRef.current !== devRouteName) {
      const prevRoute = lastRouteRef.current;
      lastRouteRef.current = devRouteName;

      try {
        const h: any = header;
        if (h) {
          const shouldClearOwned = !!(h.owner && h.owner !== devRouteName);
          const shouldClearOrphanManual = !!(h.manual === true && !h.owner);

          if (shouldClearOwned || shouldClearOrphanManual) {
            setHeader(null);
          }
        }
      } catch (e) {
        
      }

      
      try {
        const noHeaderRoutes = new Set(['Login', 'Register']);
        if (noHeaderRoutes.has(devRouteName)) return;
        if (header && header.owner === devRouteName) return;
        const fallbackSubtitle = defaultSubtitleMap[devRouteName] ?? undefined;
        setHeader({ title: simpleHeaderTitle(devRouteName), subtitle: fallbackSubtitle, provisional: true, owner: devRouteName } as any);
      } catch (e) {
        
      }
    }
  }, [devRouteName]);

  
  
  if (header?.hidden === true) {
    return null;
  }

  
  const effectiveHeader = (header === null || header === undefined)
    ? ({ title: simpleHeaderTitle(devRouteName) } as any)
    : header;
  const devHeaderJson = effectiveHeader ? JSON.stringify(effectiveHeader) : 'null';

  
  
  const noHeaderRoutes = new Set(['Login', 'Register', 'ForgotPassword', 'ResetPassword']);
  if (noHeaderRoutes.has(devRouteName)) {
    return null;
  }

  
  if (devRouteName === 'Dashboard' && (Platform.OS as any) === 'web') {
    return null;
  }

  
  
  
  
  
  const noBackTopLevel = new Set(['Dashboard', 'AllCourses', 'Certificates', 'AdminDashboard', 'Team', 'Categories', 'InstructorCourses', 'Profile', 'Settings', 'Home']);

  
  let navCanGoBack = false;
  try {
    const navigation = useNavigation();
    navCanGoBack = navigation?.canGoBack ? navigation.canGoBack() : false;
  } catch (e) {
    
    try {
      const { navigationRef } = require('../services/navigationService');
      navCanGoBack = navigationRef.current?.canGoBack ? navigationRef.current.canGoBack() : false;
    } catch (e2) {
      
    }
  }

  
  const isTopLevelNoBack = noBackTopLevel.has(devRouteName);

  
  
  const forceBackRoutes = new Set(['MyCourses', 'LessonDetail', 'ProfileSettings', 'InstructorMaterials']);
  const shouldForceBack = forceBackRoutes.has(devRouteName);

  const forceHideBack = Platform.OS !== 'web' && (devRouteName === 'Dashboard' || devRouteName === 'AdminDashboard');

  const finalShowBack = forceHideBack
    ? false
    : (typeof effectiveHeader?.showBack !== 'undefined')
      ? effectiveHeader!.showBack
      : (shouldForceBack ? true : (isTopLevelNoBack ? false : (navCanGoBack ? true : undefined)));

  
  const finalSubtitle = (typeof effectiveHeader?.subtitle !== 'undefined' && effectiveHeader?.subtitle !== null)
    ? effectiveHeader!.subtitle
    : (defaultSubtitleMap[devRouteName] || undefined);

  
  const topLevelRoutes = new Set(['Dashboard', 'Home', 'AdminDashboard', 'AllCourses', 'AdminCourses', 'AdminUsers', 'Categories', 'Certificates', 'Team', 'Instructor', 'InstructorCourses', 'Profile', 'ProfileSettings', 'Settings']);
  const alignLeftComputed = Platform.OS !== 'web' || topLevelRoutes.has(devRouteName);
  
  const alignLeftOnMobile = (typeof header?.alignLeftOnMobile !== 'undefined') ? header.alignLeftOnMobile : alignLeftComputed;

  if (process.env.NODE_ENV !== 'production') {
  }

  const mergedRight = (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      {effectiveHeader?.right}
      {defaultRight}
    </View>
  );

  return (
    <>
      <AppHeader
        title={effectiveHeader?.title || simpleHeaderTitle(devRouteName)}
        subtitle={finalSubtitle}
        showBack={finalShowBack}
        right={effectiveHeader?.right ? mergedRight : defaultRight}
        showOnWeb={true}
        alignLeftOnMobile={alignLeftOnMobile}
      />

    </>
  );
};
