import { Platform } from 'react-native';

export function safeBack(navigation: any, fallbackRoute?: string) {
  
  try {
    const navCanGoBack = (navigation && typeof navigation.canGoBack === 'function')
      ? (() => { try { return navigation.canGoBack(); } catch (_) { return false; } })()
      : false;
    if (navCanGoBack) {
      try { navigation.goBack(); return; } catch (_) {  }
    }
  } catch (_) {}

  
  try {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.history && window.history.length > 1) {
      try { window.history.back(); return; } catch (_) {  }
    }
  } catch (_) {}

  
  if (fallbackRoute) {
    try {
      if (Platform.OS === 'web') {
        const { goToWebTab } = require('./webNav');
        goToWebTab(fallbackRoute);
        return;
      } else {
        if (navigation && typeof navigation.navigate === 'function') {
          try { navigation.navigate(fallbackRoute); return; } catch (_) {  }
        }
      }
    } catch (_) {  }
  }

  
  try {
    if (Platform.OS === 'web') {
      const { goToWebTab } = require('./webNav');
      goToWebTab('Dashboard');
    } else {
      if (navigation && typeof navigation.navigate === 'function') {
        try { navigation.navigate('Dashboard'); } catch (_) {  }
      }
    }
  } catch (_) {  }
}
