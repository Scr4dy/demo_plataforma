
import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ViewMode = 'grid' | 'list';
export type SortBy = 'progress' | 'title' | 'dueDate' | 'status';
export type DashboardTab = 'courses' | 'certificates' | 'alerts';

const STORAGE_KEYS = {
  VIEW_MODE: 'dashboard_view_mode',
  SORT_BY: 'dashboard_sort_by',
  FAVORITES: 'dashboard_favorites',
  COMPLETED_TOUR: 'dashboard_completed_tour',
  SELECTED_TAB: 'dashboard_selected_tab',
};

export const useDashboardState = () => {
  const [selectedTab, setSelectedTab] = useState<DashboardTab>('courses');
  const [sortBy, setSortBy] = useState<SortBy>('progress');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [tourStep, setTourStep] = useState(0);
  const [isTourActive, setIsTourActive] = useState(false);
  const [hasCompletedTour, setHasCompletedTour] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  
  useEffect(() => {
    const loadPersistedState = async () => {
      try {
        const [
          savedViewMode,
          savedSortBy,
          savedFavorites,
          savedCompletedTour,
          savedSelectedTab,
        ] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.VIEW_MODE),
          AsyncStorage.getItem(STORAGE_KEYS.SORT_BY),
          AsyncStorage.getItem(STORAGE_KEYS.FAVORITES),
          AsyncStorage.getItem(STORAGE_KEYS.COMPLETED_TOUR),
          AsyncStorage.getItem(STORAGE_KEYS.SELECTED_TAB),
        ]);

        if (savedViewMode) setViewMode(savedViewMode as ViewMode);
        if (savedSortBy) setSortBy(savedSortBy as SortBy);
        if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
        if (savedCompletedTour) setHasCompletedTour(JSON.parse(savedCompletedTour));
        if (savedSelectedTab) setSelectedTab(savedSelectedTab as DashboardTab);
        
        setIsInitialized(true);
      } catch (error) {
        
        setIsInitialized(true);
      }
    };

    loadPersistedState();
  }, []);

  
  useEffect(() => {
    if (!isInitialized) return;

    const persistState = async () => {
      try {
        await Promise.all([
          AsyncStorage.setItem(STORAGE_KEYS.VIEW_MODE, viewMode),
          AsyncStorage.setItem(STORAGE_KEYS.SORT_BY, sortBy),
          AsyncStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites)),
          AsyncStorage.setItem(STORAGE_KEYS.SELECTED_TAB, selectedTab),
        ]);
      } catch (error) {
        
      }
    };

    persistState();
  }, [viewMode, sortBy, favorites, selectedTab, isInitialized]);

  
  useEffect(() => {
    if (!isInitialized) return;

    AsyncStorage.setItem(STORAGE_KEYS.COMPLETED_TOUR, JSON.stringify(hasCompletedTour));
  }, [hasCompletedTour, isInitialized]);

  const toggleFavorite = useCallback((courseId: string) => {
    setFavorites(prev => 
      prev.includes(courseId) 
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  }, []);

  const isFavorite = useCallback((courseId: string) => {
    return favorites.includes(courseId);
  }, [favorites]);

  const startTour = useCallback(() => {
    setIsTourActive(true);
    setTourStep(0);
  }, []);

  const nextStep = useCallback(() => {
    setTourStep(prev => prev + 1);
  }, []);

  const prevStep = useCallback(() => {
    setTourStep(prev => Math.max(0, prev - 1));
  }, []);

  const endTour = useCallback(() => {
    setIsTourActive(false);
    setHasCompletedTour(true);
    setTourStep(0);
  }, []);

  
  const resetState = useCallback(async () => {
    setSelectedTab('courses');
    setSortBy('progress');
    setViewMode('grid');
    setFavorites([]);
    setHasCompletedTour(false);
    
    try {
      await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
    } catch (error) {
      
    }
  }, []);

  return {
    
    selectedTab,
    setSelectedTab,
    sortBy,
    setSortBy,
    viewMode,
    setViewMode,
    
    
    favorites,
    toggleFavorite,
    isFavorite,
    
    
    tourStep,
    isTourActive,
    hasCompletedTour,
    startTour,
    nextStep,
    prevStep,
    endTour,
    
    
    isInitialized,
    resetState,
    
    
    recentActivity: [], 
  };
};