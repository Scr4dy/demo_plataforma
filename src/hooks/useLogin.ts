
import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

export interface LoginResponse {
  success: boolean;
  message?: string;
}

export const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();

  const handleLogin = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      
      if (!email.trim() || !password.trim()) {
        setError('Email y contraseña son requeridos');
        return false;
      }
      await login(email, password);
      return true;
    } catch (err) {
      let errorMessage = err instanceof Error ? err.message : 'Error de conexión';
      
      
      if (errorMessage.includes('Invalid login credentials')) {
        errorMessage = 'Credenciales incorrectas';
      }
      
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    handleLogin,
    loading,
    error,
    clearError
  };
};

export default useLogin;