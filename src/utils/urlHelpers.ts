import { Alert, Linking, Platform } from 'react-native';

export const DOWNLOADABLE_EXTS = new Set(['ppt','pptx','doc','docx','xls','xlsx','zip','rar']);

export function getExtensionFromUrl(url?: string | null) {
  if (!url) return '';
  try {
    const path = url.split('?')[0].split('#')[0];
    const parts = path.split('/');
    const last = parts[parts.length - 1] || '';
    const ext = last.split('.').pop() || '';
    return ext.toLowerCase();
  } catch (e) {
    return '';
  }
}

export function isDownloadableUrl(url?: string | null) {
  const ext = getExtensionFromUrl(url);
  return DOWNLOADABLE_EXTS.has(ext);
}

export async function safeOpenUrl(url?: string | null) {
  if (!url) return;

  if (isDownloadableUrl(url)) {
    const msg = 'Este archivo no se puede abrir directamente desde el navegador. Usa la opción "Ver" para previsualizarlo o solicita conversión a PDF.';
    if (Platform.OS === 'web') {
      try { window.alert(msg); } catch (e) {  }
      return;
    }

    Alert.alert('Archivo no descargable', msg);
    return;
  }

  
  if (Platform.OS === 'web') {
    try { window.open(url, '_blank'); return; } catch (e) {  }
  }

  try {
    await Linking.openURL(url);
  } catch (e) {
    
  }
}
