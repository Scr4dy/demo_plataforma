import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { Alert, Platform } from 'react-native';

export function useAdminGuard(): void {
  const { isAdmin } = useAuth();
  const navigation = useNavigation<any>();

  useEffect(() => {
    if (!isAdmin) {
      
      if (Platform.OS === 'web') {
        try { window.alert('Acceso denegado: necesitas permisos de administrador'); } catch (e) {}
        navigation.navigate('Dashboard');
      } else {
        Alert.alert('Acceso denegado', 'Necesitas permisos de administrador', [
          { text: 'Aceptar', onPress: () => navigation.navigate('Dashboard') }
        ]);
      }
    }
  }, [isAdmin]);
}

export default useAdminGuard;
