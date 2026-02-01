
import React from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVORITES_KEY = 'dashboard_favorites';

export const useFavorites = () => {
  const [favorites, setFavorites] = React.useState<string[]>([]);

  
  React.useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const storedFavorites = await AsyncStorage.getItem(FAVORITES_KEY);
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
    } catch (error) {
      
    }
  };

  const saveFavorites = async (newFavorites: string[]) => {
    try {
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
    } catch (error) {
      
    }
  };

  const toggleFavorite = async (id: string) => {
    const newFavorites = favorites.includes(id) 
      ? favorites.filter(fav => fav !== id)
      : [...favorites, id];
    
    setFavorites(newFavorites);
    await saveFavorites(newFavorites);

    
    
  };

  const isFavorite = (id: string) => favorites.includes(id);

  const clearFavorites = async () => {
    setFavorites([]);
    await AsyncStorage.removeItem(FAVORITES_KEY);
  };

  return { 
    favorites, 
    toggleFavorite, 
    isFavorite,
    clearFavorites
  };
};