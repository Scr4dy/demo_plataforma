
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../config/supabase';

export async function clearAuthStorage(): Promise<void> {
  try {
    
    await supabase.auth.signOut();

    
    const keysToRemove = [
      'auth_token',
      'supabase.auth.token',
      '@user_preferences', 
    ];

    for (const key of keysToRemove) {
      try {
        await AsyncStorage.removeItem(key);
      } catch (error) {
        
      }
    }
  } catch (error) {
    
    throw error;
  }
}

export async function hasValidSession(): Promise<boolean> {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session) {
      return false;
    }

    
    const now = Math.floor(Date.now() / 1000);
    const expiresAt = session.expires_at || 0;

    if (expiresAt < now) {
      
      return false;
    }

    return true;
  } catch (error) {
    
    return false;
  }
}

export async function refreshSession(): Promise<boolean> {
  try {
    const { data, error } = await supabase.auth.refreshSession();

    if (error) {
      const isRefreshError = error.message?.includes('refresh_token_not_found') ||
        error.message?.includes('Invalid Refresh Token');

      if (!isRefreshError) {
        
      }

      
      if (error.message?.includes('refresh_token_not_found') ||
        error.message?.includes('Invalid Refresh Token')) {
        await clearAuthStorage();
      }

      return false;
    }

    if (data.session?.access_token) {
      await AsyncStorage.setItem('auth_token', data.session.access_token);
      return true;
    }

    return false;
  } catch (error) {
    
    return false;
  }
}

export async function getSessionDebugInfo(): Promise<any> {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      return {
        error: error.message,
        hasSession: false,
      };
    }

    if (!session) {
      return {
        hasSession: false,
        message: 'No hay sesión activa',
      };
    }

    const now = Math.floor(Date.now() / 1000);
    const expiresAt = session.expires_at || 0;
    const timeUntilExpiry = expiresAt - now;

    return {
      hasSession: true,
      userId: session.user.id,
      email: session.user.email,
      expiresAt: new Date(expiresAt * 1000).toISOString(),
      timeUntilExpirySeconds: timeUntilExpiry,
      isExpired: timeUntilExpiry < 0,
      hasRefreshToken: !!session.refresh_token,
    };
  } catch (error: any) {
    return {
      error: error.message,
      hasSession: false,
    };
  }
}

export default {
  clearAuthStorage,
  hasValidSession,
  refreshSession,
  getSessionDebugInfo,
};
