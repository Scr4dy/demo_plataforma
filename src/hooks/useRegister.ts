
import { useState } from 'react';
import { RegisterFormData } from '../types/auth.types';
import { useAuth } from '../context/AuthContext';

export interface RegisterResponse {
  success: boolean;
  message?: string;
  userId?: number;
}

export const useRegister = () => {
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateForm = (formData: RegisterFormData): string | null => {
    if (!formData.fullName.trim()) {
      return 'El nombre completo es requerido';
    }

    if (!formData.email.trim()) {
      return 'El correo electrónico es requerido';
    }

    if (!formData.email.includes('@')) {
      return 'El correo electrónico no es válido';
    }

    if (!formData.department.trim()) {
      return 'El departamento es requerido';
    }

    if (!formData.password.trim()) {
      return 'La contraseña es requerida';
    }

    if (formData.password.length < 6) {
      return 'La contraseña debe tener al menos 6 caracteres';
    }

    if (formData.password !== formData.confirmPassword) {
      return 'Las contraseñas no coinciden';
    }

    return null;
  };

  const handleRegister = async (formData: RegisterFormData): Promise<{ success: boolean; message?: string }> => {
    setLoading(true);
    setError(null);

    try {
      
      const validationError = validateForm(formData);
      if (validationError) {
        setError(validationError);
        return { success: false, message: validationError };
      }

      
      const [nombre = '', apellidoPaterno = '', apellidoMaterno = ''] = (formData.fullName || '').split(' ').map((s) => s.trim());

      const payload: any = {
        numeroEmpleado: formData.employeeId || '',
        nombre: nombre || formData.fullName || '',
        apellidoPaterno: apellidoPaterno || '',
        apellidoMaterno: apellidoMaterno || '',
        correoElectronico: formData.email,
        telefono: formData.phone || '',
        departamento: formData.department || '',
        puesto: '',
        rol: 'empleado',
        contrasena: formData.password,
        confirmarContrasena: formData.confirmPassword,
      };

      
      
      const result = await register(payload);
      return { success: true, message: result?.mensaje };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error en el registro';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    handleRegister,
    loading,
    error,
    clearError
  };
};