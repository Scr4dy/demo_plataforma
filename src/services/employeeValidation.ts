import { useState } from 'react';
import { supabase } from '../config/supabase';

export interface EmployeeData {
  numero_empleado: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  departamento: string;
  puesto: string;
  fecha_ingreso: string;
  correo_corporativo: string;
  estatus: 'activo' | 'inactivo';
}

export class EmployeeValidationService {
  static async validateEmployee(employeeId: string): Promise<{
    isValid: boolean;
    employeeData?: EmployeeData;
    message: string;
  }> {
    try {
      
      const { data, error } = await supabase
        .from('empleados')
        .select('*')
        .eq('numero_empleado', employeeId)
        .eq('estatus', 'activo')
        .single();

      if (error) {
        if (error.code === 'PGRST116' || error.code === 'PGRST205') {
          return {
            isValid: false,
            message: 'Número de empleado no encontrado o inactivo'
          };
        }
        throw error;
      }

      if (!data) {
        return {
          isValid: false,
          message: 'Empleado no encontrado'
        };
      }

      return {
        isValid: true,
        employeeData: data as EmployeeData,
        message: 'Empleado validado correctamente'
      };
    } catch (error: any) {
      
      return {
        isValid: false,
        message: error.message || 'Error validando número de empleado'
      };
    }
  }

  static async syncEmployeeData(employeeId: string): Promise<EmployeeData | null> {
    try {
      
      
      const { data, error } = await supabase
        .from('empleados')
        .select('*')
        .eq('numero_empleado', employeeId)
        .single();

      if (error) throw error;
      return data as EmployeeData;
    } catch (error) {
      
      return null;
    }
  }

  static async checkEmployeeExists(employeeId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('empleados')
        .select('numero_empleado')
        .eq('numero_empleado', employeeId)
        .single();

      return !!data;
    } catch (error) {
      return false;
    }
  }
}

export const useEmployeeValidation = () => {
  const [validating, setValidating] = useState(false);

  const validateEmployee = async (employeeId: string) => {
    setValidating(true);
    try {
      const result = await EmployeeValidationService.validateEmployee(employeeId);
      return result;
    } catch (error) {
      return {
        isValid: false,
        message: 'Error validando empleado'
      };
    } finally {
      setValidating(false);
    }
  };

  return {
    validating,
    validateEmployee
  };
};