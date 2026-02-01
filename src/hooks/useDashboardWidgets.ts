
import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type WidgetType = 
  | 'welcome' 
  | 'progress' 
  | 'quickActions' 
  | 'courses' 
  | 'certificates' 
  | 'alerts' 
  | 'teamAlerts' 
  | 'stats' 
  | 'progressSummary';

export interface WidgetConfig {
  id: WidgetType;
  visible: boolean;
  position: number;
  size?: 'small' | 'medium' | 'large';
}

export interface WidgetsLayout {
  widgets: WidgetConfig[];
  isEditing: boolean;
}

const DEFAULT_WIDGETS: WidgetConfig[] = [
  { id: 'welcome', visible: true, position: 0, size: 'medium' },
  { id: 'quickActions', visible: true, position: 1, size: 'small' },
  { id: 'progress', visible: true, position: 2, size: 'small' },
  { id: 'stats', visible: true, position: 3, size: 'small' },
  { id: 'courses', visible: true, position: 4, size: 'large' },
  { id: 'certificates', visible: true, position: 5, size: 'medium' },
  { id: 'alerts', visible: true, position: 6, size: 'medium' },
  { id: 'teamAlerts', visible: true, position: 7, size: 'medium' },
  { id: 'progressSummary', visible: true, position: 8, size: 'large' },
];

const STORAGE_KEY = 'dashboard-widgets-layout';

export const useDashboardWidgets = () => {
  const [widgetsLayout, setWidgetsLayout] = useState<WidgetsLayout>({
    widgets: DEFAULT_WIDGETS,
    isEditing: false
  });
  const [isLoading, setIsLoading] = useState(true);

  
  useEffect(() => {
    loadSavedLayout();
  }, []);

  const loadSavedLayout = async () => {
    try {
      const savedLayout = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedLayout) {
        const parsedLayout = JSON.parse(savedLayout);
        setWidgetsLayout(parsedLayout);
      }
    } catch (error) {
      
    } finally {
      setIsLoading(false);
    }
  };

  
  const saveLayout = useCallback(async (newLayout: WidgetsLayout) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newLayout));
      setWidgetsLayout(newLayout);
    } catch (error) {
      
    }
  }, []);

  
  const toggleWidget = useCallback((widgetId: WidgetType) => {
    setWidgetsLayout(prev => {
      const updatedWidgets = prev.widgets.map(widget =>
        widget.id === widgetId 
          ? { ...widget, visible: !widget.visible }
          : widget
      );
      
      const newLayout = { ...prev, widgets: updatedWidgets };
      saveLayout(newLayout);
      return newLayout;
    });
  }, [saveLayout]);

  
  const reorderWidgets = useCallback((fromIndex: number, toIndex: number) => {
    setWidgetsLayout(prev => {
      const updatedWidgets = [...prev.widgets];
      const [movedWidget] = updatedWidgets.splice(fromIndex, 1);
      updatedWidgets.splice(toIndex, 0, movedWidget);
      
      
      const widgetsWithNewPositions = updatedWidgets.map((widget, index) => ({
        ...widget,
        position: index
      }));

      const newLayout = { ...prev, widgets: widgetsWithNewPositions };
      saveLayout(newLayout);
      return newLayout;
    });
  }, [saveLayout]);

  
  const changeWidgetSize = useCallback((widgetId: WidgetType, size: 'small' | 'medium' | 'large') => {
    setWidgetsLayout(prev => {
      const updatedWidgets = prev.widgets.map(widget =>
        widget.id === widgetId ? { ...widget, size } : widget
      );
      
      const newLayout = { ...prev, widgets: updatedWidgets };
      saveLayout(newLayout);
      return newLayout;
    });
  }, [saveLayout]);

  
  const toggleEditMode = useCallback(() => {
    setWidgetsLayout(prev => ({ ...prev, isEditing: !prev.isEditing }));
  }, []);

  
  const resetToDefault = useCallback(() => {
    const defaultLayout: WidgetsLayout = {
      widgets: DEFAULT_WIDGETS,
      isEditing: false
    };
    saveLayout(defaultLayout);
  }, [saveLayout]);

  
  const visibleWidgets = useCallback(() => {
    return widgetsLayout.widgets
      .filter(widget => widget.visible)
      .sort((a, b) => a.position - b.position);
  }, [widgetsLayout.widgets]);

  
  const getWidgetConfig = useCallback((widgetId: WidgetType) => {
    return widgetsLayout.widgets.find(widget => widget.id === widgetId);
  }, [widgetsLayout.widgets]);

  
  const isWidgetVisible = useCallback((widgetId: WidgetType) => {
    const widget = getWidgetConfig(widgetId);
    return widget ? widget.visible : false;
  }, [getWidgetConfig]);

  
  const visibleWidgetsCount = useCallback(() => {
    return widgetsLayout.widgets.filter(widget => widget.visible).length;
  }, [widgetsLayout.widgets]);

  return {
    widgetsLayout,
    isLoading,
    toggleWidget,
    reorderWidgets,
    changeWidgetSize,
    toggleEditMode,
    resetToDefault,
    visibleWidgets,
    getWidgetConfig,
    isWidgetVisible,
    visibleWidgetsCount,
    saveLayout
  };
};