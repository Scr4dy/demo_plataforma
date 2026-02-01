
import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RECENT_ACTIVITY_KEY = 'dashboard_recent_activity';

export interface RecentActivity {
  id: string;
  type: 'course_viewed' | 'certificate_viewed' | 'search_performed' | 'filter_applied';
  title: string;
  description?: string;
  timestamp: Date;
  metadata?: any;
}

export const useRecentActivity = () => {
  const [recentActivity, setRecentActivity] = React.useState<RecentActivity[]>([]);

  
  React.useEffect(() => {
    loadRecentActivity();
  }, []);

  const loadRecentActivity = async () => {
    try {
      const storedActivity = await AsyncStorage.getItem(RECENT_ACTIVITY_KEY);
      if (storedActivity) {
        const activities = JSON.parse(storedActivity).map((activity: any) => ({
          ...activity,
          timestamp: new Date(activity.timestamp)
        }));
        setRecentActivity(activities);
      }
    } catch (error) {
      
    }
  };

  const saveRecentActivity = async (activities: RecentActivity[]) => {
    try {
      await AsyncStorage.setItem(RECENT_ACTIVITY_KEY, JSON.stringify(activities));
    } catch (error) {
      
    }
  };

  const addActivity = (activity: Omit<RecentActivity, 'id' | 'timestamp'>) => {
    const newActivity: RecentActivity = {
      ...activity,
      id: Date.now().toString(),
      timestamp: new Date()
    };

    const updatedActivities = [newActivity, ...recentActivity.slice(0, 49)]; 
    setRecentActivity(updatedActivities);
    saveRecentActivity(updatedActivities);
  };

  const clearActivity = async () => {
    setRecentActivity([]);
    await AsyncStorage.removeItem(RECENT_ACTIVITY_KEY);
  };

  const getRecentSearches = () => {
    return recentActivity.filter(activity => activity.type === 'search_performed');
  };

  const getRecentCourses = () => {
    return recentActivity.filter(activity => activity.type === 'course_viewed');
  };

  return {
    recentActivity,
    addActivity,
    clearActivity,
    getRecentSearches,
    getRecentCourses
  };
};