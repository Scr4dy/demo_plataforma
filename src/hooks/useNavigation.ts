
import { useContext } from 'react';
import { NavigationContext, NavigationProp } from '@react-navigation/native';

export function useNavigation() {
  const navigation = useContext(NavigationContext) as NavigationProp<any>;
  
  if (!navigation) {
    
    return {
      navigate: (screen: string, params?: any) => {
        return Promise.resolve();
      },
      goBack: () => {
        return Promise.resolve();
      },
      reset: () => {
        return Promise.resolve();
      },
      dispatch: () => {
        return Promise.resolve();
      },
      canGoBack: () => {
        return false;
      },
      getId: () => {
        return 'dummy-navigation-id';
      },
      getState: () => {
        return { index: 0, routes: [] };
      },
      getParent: () => undefined,
      isFocused: () => true,
      setOptions: () => {},
      setParams: () => {},
      addListener: () => () => {},
      removeListener: () => {},
    };
  }
  
  return navigation;
}