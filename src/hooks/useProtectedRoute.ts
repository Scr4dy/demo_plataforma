import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';

export const useProtectedRoute = () => {
  const { state: { isAuthenticated, loading } } = useAuth();
  const navigation = useNavigation();
  const [isProtectedRouteReady, setIsProtectedRouteReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsProtectedRouteReady(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const withAuthCheck = (children: React.ReactNode) => {
    useEffect(() => {
      if (!loading && !isAuthenticated && isProtectedRouteReady) {
        (navigation as any).navigate('Login');
      }
    }, [isAuthenticated, loading, navigation, isProtectedRouteReady]);

    if (loading || !isProtectedRouteReady) {
      return null;
    }

    return isAuthenticated ? children : null;
  };

  return {
    isProtectedRouteReady,
    withAuthCheck,
  };
};

export default useProtectedRoute;