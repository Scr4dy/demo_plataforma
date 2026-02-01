import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { Alert, Platform } from 'react-native';

export function useInstructorGuard(): void {
  const { isAdmin, isInstructor } = useAuth();
  const navigation = useNavigation<any>();

  useEffect(() => {
    if (!isAdmin && !isInstructor) {
      
      if (Platform.OS === 'web') {
        try { window.alert('Acceso denegado: necesitas permisos de instructor o administrador'); } catch (e) {}
        navigation.navigate('Dashboard');
      } else {
        Alert.alert('Acceso denegado', 'Necesitas permisos de instructor o administrador', [
          { text: 'Aceptar', onPress: () => navigation.navigate('Dashboard') }
        ]);
      }
    }
  }, [isAdmin, isInstructor]);
}

export default useInstructorGuard;
