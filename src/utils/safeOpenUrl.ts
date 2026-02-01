import { Linking, Platform } from 'react-native';

export function safeOpenUrl(url: string) {
  if (!url) return;
  try {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      
      window.open(url, '_blank', 'noopener,noreferrer');
      return;
    }

    (async () => {
      const can = await Linking.canOpenURL(url).catch(() => false);
      if (can) await Linking.openURL(url);
      else 
    })();
  } catch (err) {
    
  }
}
