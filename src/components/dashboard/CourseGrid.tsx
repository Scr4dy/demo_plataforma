
import React from 'react';
import { 
  View, 
  StyleSheet, 
  FlatList,
  useWindowDimensions,
  Platform,
  Text
} from 'react-native';
import { CourseCard } from './CourseCard';
import type { Course, DashboardUIHelpers } from '../../types/dashboard.types';

interface CourseGridProps {
  courses: Course[];
  onCoursePress: (course: Course) => void;
  isMobile?: boolean;
  columns?: number;
  
  
  viewMode?: 'grid' | 'list';
  favorites?: string[];
  toggleFavorite?: (id: string) => void;
  isFavorite?: (id: string) => boolean;
  sortBy?: string;
  getStatusColor?: (status: string) => string;
  getCourseIcon?: (status: string) => string;
  getDaysUntilExpiry?: (expiryDate?: string) => number;
  formatDate?: (iso?: string) => string;
  getAlertIcon?: (type: string) => string;
  getActionIcon?: (actionType: string) => string;
}

export const CourseGrid: React.FC<CourseGridProps> = React.memo(({
  courses,
  onCoursePress,
  getStatusColor = (s: string) => '#2563EB',
  getCourseIcon = (s: string) => 'book',
  getDaysUntilExpiry = (d?: string) => 0,
  isMobile = false,
  columns: propColumns,
  
  
  viewMode = 'grid',
  favorites = [],
  toggleFavorite = () => {},
  isFavorite = () => false,
  sortBy = 'recent'
}) => {
  const { width: windowWidth } = useWindowDimensions();
  
  
  const safeCourses = React.useMemo(() => {
    if (!courses || !Array.isArray(courses)) {
      
      return [];
    }
    
    return courses.map(course => ({
      id: course?.id || `course-${Math.random()}-${Date.now()}`,
      title: course?.title?.toString() || 'Curso sin título',
      status: course?.status || 'unknown',
      progress: Number(course?.progress) || 0,
      expiryDate: course?.expiryDate ?? '',
      description: course?.description?.toString() || '',
      tags: Array.isArray(course?.tags) ? course.tags : [],
      updatedAt: course?.updatedAt || new Date().toISOString()
    }));
  }, [courses]);

  
  const sortedCourses = React.useMemo(() => {
    if (!safeCourses || safeCourses.length === 0) return [];
    
    const coursesCopy = [...safeCourses];
    
    switch (sortBy) {
      case 'name':
        return coursesCopy.sort((a, b) => a.title.localeCompare(b.title));
      case 'progress':
        return coursesCopy.sort((a, b) => b.progress - a.progress);
      case 'favorites':
        return coursesCopy.sort((a, b) => {
          const aIsFavorite = isFavorite(String(a.id));
          const bIsFavorite = isFavorite(String(b.id));
          return aIsFavorite === bIsFavorite ? 0 : aIsFavorite ? -1 : 1;
        });
      case 'expiry':
        return coursesCopy.sort((a, b) => {
          const aDays = getDaysUntilExpiry(a.expiryDate || '');
          const bDays = getDaysUntilExpiry(b.expiryDate || '');
          return aDays - bDays;
        });
      case 'recent':
      default:
        return coursesCopy.sort((a, b) => {
          const aDate = new Date(a.updatedAt).getTime();
          const bDate = new Date(b.updatedAt).getTime();
          return bDate - aDate;
        });
    }
  }, [safeCourses, sortBy, isFavorite, getDaysUntilExpiry]);

  const { cardWidth, numColumns, isWeb } = React.useMemo(() => {
    const isWeb = Platform.OS === 'web';
    const isSmallScreen = windowWidth < 375;
    const isTinyScreen = windowWidth < 360;

    
    if (viewMode === 'list') {
      return { 
        cardWidth: windowWidth - (isMobile ? 32 : 48), 
        numColumns: 1, 
        isWeb 
      };
    }

    
    let numColumns = propColumns || 2;
    if (isMobile) numColumns = 1;
    if (isWeb && windowWidth >= 1200) numColumns = 3;
    if (isWeb && windowWidth >= 768 && windowWidth < 1200) numColumns = 2;
    if (isSmallScreen) numColumns = 1;

    
    const horizontalPadding = isMobile ? 32 : 48;
    const gap = isMobile ? 12 : 16;
    const availableWidth = windowWidth - horizontalPadding - (gap * (numColumns - 1));
    const defaultMin = isMobile ? 200 : 280;
    const minCardWidth = isTinyScreen ? Math.max(140, Math.floor(defaultMin * 0.8)) : defaultMin;
    const cardWidth = Math.max(availableWidth / numColumns, minCardWidth);

    return { cardWidth, numColumns, isWeb };
  }, [windowWidth, isMobile, propColumns, viewMode]);

  
  const CourseListItem = React.useCallback(({ course }: { course: Course }) => (
    <View style={[
      styles.listItem,
      { width: cardWidth }
    ]}>
      <CourseCard
        course={course}
        onCoursePress={onCoursePress}
        getStatusColor={getStatusColor}
        getCourseIcon={(c) => getCourseIcon?.(c.status || 'unknown') || 'book'}
        getDaysUntilExpiry={getDaysUntilExpiry}
        cardWidth={cardWidth}
        isMobile={isMobile}
        
        viewMode={viewMode}
        isFavorite={isFavorite(String(course.id))}
        onToggleFavorite={() => toggleFavorite(String(course.id))}
      />
    </View>
  ), [cardWidth, onCoursePress, getStatusColor, getCourseIcon, getDaysUntilExpiry, isMobile, viewMode, isFavorite, toggleFavorite]);

  
  const CourseGridItem = React.useCallback(({ course }: { course: Course }) => (
    <View style={[
      styles.gridItem,
      { width: cardWidth }
    ]}>
      <CourseCard
        course={course}
        onCoursePress={onCoursePress}
        getStatusColor={getStatusColor}
        getCourseIcon={(c) => getCourseIcon?.(c.status || 'unknown') || 'book'}
        getDaysUntilExpiry={getDaysUntilExpiry}
        cardWidth={cardWidth}
        isMobile={isMobile}
        
        viewMode={viewMode}
        isFavorite={isFavorite(String(course.id))}
        onToggleFavorite={() => toggleFavorite(String(course.id))}
      />
    </View>
  ), [cardWidth, onCoursePress, getStatusColor, getCourseIcon, getDaysUntilExpiry, isMobile, viewMode, isFavorite, toggleFavorite]);

  const renderItem = React.useCallback(({ item }: { item: Course }) => {
    if (viewMode === 'list') {
      return <CourseListItem course={item} />;
    }
    return <CourseGridItem course={item} />;
  }, [viewMode, CourseListItem, CourseGridItem]);

  
  const keyExtractor = React.useCallback((item: Course) => 
    `course-${item.id}-${viewMode}-${isFavorite(String(item.id))}`, [viewMode, isFavorite]);

  
  const ListEmptyComponent = React.useCallback(() => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        No hay cursos disponibles
      </Text>
    </View>
  ), []);

  if (!safeCourses || safeCourses.length === 0) {
    return <ListEmptyComponent />;
  }

  return (
    <FlatList
      data={sortedCourses}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      numColumns={numColumns}
      contentContainerStyle={[
        styles.container,
        isMobile && styles.mobileContainer,
        viewMode === 'list' && styles.listContainer
      ]}
      columnWrapperStyle={
        numColumns > 1 && viewMode === 'grid' ? styles.columnWrapper : undefined
      }
      showsVerticalScrollIndicator={false}
      
      initialNumToRender={isMobile ? 4 : 8}
      maxToRenderPerBatch={isMobile ? 6 : 10}
      windowSize={isMobile ? 5 : 7}
      removeClippedSubviews={Platform.OS === 'android'}
      
      scrollEventThrottle={16}
      decelerationRate="normal"
      ListEmptyComponent={ListEmptyComponent}
    />
  );
});

const styles = StyleSheet.create({
  container: {
    padding: 8,
    paddingBottom: 20,
  },
  mobileContainer: {
    padding: 4,
    paddingBottom: 16,
  },
  listContainer: {
    paddingHorizontal: 0,
    paddingBottom: 20,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 16,
  },
  gridItem: {
    marginBottom: 16,
  },
  listItem: {
    marginBottom: 12,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
  },
});

export default CourseGrid;