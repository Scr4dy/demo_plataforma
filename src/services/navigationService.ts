import React from 'react';

export const navigationRef = React.createRef<any>();

export function navigate(name: string, params?: any) {
  try {
    if (navigationRef.current && (navigationRef.current.isReady ? navigationRef.current.isReady() : true)) {
      navigationRef.current.navigate(name, params);
      return true;
    } else {
    }
  } catch (e) {
    
  }
  return false;
}

export default {
  navigationRef,
  navigate,
};