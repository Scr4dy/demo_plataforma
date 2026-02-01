import { supabase } from '../config/supabase';
import { logger } from '../utils/logger';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  department?: string;
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

class SupabaseService {
  
  async signIn(email: string, password: string) {
    try {
      logger.auth.login('Iniciando sesión:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        logger.auth.error('Error en login:', error.message);
        throw error;
      }
      
      logger.success('[SUPABASE]', 'Login exitoso');
      return { data, error: null };
    } catch (error) {
      
      return { data: null, error };
    }
  }

  async signUp(email: string, password: string, userData: { name: string }) {
    try {
      logger.auth.register('Registro de usuario:', email);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: userData.name,
          },
        },
      });
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      
      return { data: null, error };
    }
  }

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      
      return { error };
    }
  }

  async getCurrentUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    } catch (error) {
      
      return null;
    }
  }

  async getSession() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    } catch (error) {
      
      return null;
    }
  }

  
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        
        return null;
      }

      return data;
    } catch (error) {
      
      return null;
    }
  }

  async updateUserProfile(userId: string, updates: Partial<UserProfile>) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      
      return { data: null, error };
    }
  }

  
  async isAuthenticated(): Promise<boolean> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return !!session;
    } catch (error) {
      
      return false;
    }
  }
}

export const supabaseService = new SupabaseService();