
import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOUR_COMPLETED_KEY = 'dashboard_tour_completed';

export const useDashboardTour = () => {
  const [tourStep, setTourStep] = React.useState(0);
  const [isTourActive, setIsTourActive] = React.useState(false);
  const [hasCompletedTour, setHasCompletedTour] = React.useState(false);

  
  React.useEffect(() => {
    checkTourCompletion();
  }, []);

  const checkTourCompletion = async () => {
    try {
      const completed = await AsyncStorage.getItem(TOUR_COMPLETED_KEY);
      setHasCompletedTour(completed === 'true');
    } catch (error) {
      
    }
  };

  const markTourCompleted = async () => {
    try {
      await AsyncStorage.setItem(TOUR_COMPLETED_KEY, 'true');
      setHasCompletedTour(true);
    } catch (error) {
      
    }
  };

  const startTour = () => {
    setIsTourActive(true);
    setTourStep(0);
  };

  const nextStep = () => {
    if (tourStep < 3) { 
      setTourStep(prev => prev + 1);
    } else {
      endTour();
    }
  };

  const prevStep = () => {
    if (tourStep > 0) {
      setTourStep(prev => prev - 1);
    }
  };

  const endTour = () => {
    setIsTourActive(false);
    setTourStep(0);
    markTourCompleted();
  };

  const resetTour = async () => {
    try {
      await AsyncStorage.removeItem(TOUR_COMPLETED_KEY);
      setHasCompletedTour(false);
      setTourStep(0);
      setIsTourActive(false);
    } catch (error) {
      
    }
  };

  return { 
    tourStep, 
    startTour, 
    nextStep, 
    prevStep, 
    endTour, 
    isTourActive,
    hasCompletedTour,
    resetTour
  };
};