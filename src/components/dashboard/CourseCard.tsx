
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import type { Course } from '../../types/dashboard.types';
import { CourseRatings } from '../courses/CourseRatings';
import { useTheme } from '../../context/ThemeContext';

interface CourseCardProps {
  course: Course;
  onCoursePress: (course: Course) => void;
  getStatusColor: (status: string) => string;
  getCourseIcon: (course: Course) => string;
  getDaysUntilExpiry: (expiryDate: string) => number;
  cardWidth: number;
  isMobile?: boolean;
  viewMode?: 'grid' | 'list';
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

export const CourseCard: React.FC<CourseCardProps> = React.memo(({
  course,
  onCoursePress,
  getStatusColor,
  getCourseIcon,
  getDaysUntilExpiry,
  cardWidth,
  isMobile = false,
  viewMode = 'grid',
  isFavorite = false,
  onToggleFavorite = () => {}
}) => {
  
  const { theme, colors } = useTheme();

  
  

  
  const safeCourse = React.useMemo(() => ({
    id: course?.id || 'unknown',
    title: course?.title?.toString() || 'Curso sin título',
    status: course?.status || 'unknown',
    progress: Number(course?.progress) || 0,
    expiryDate: course?.expiryDate ?? undefined,
    description: course?.description?.toString() || '',
    tags: Array.isArray(course?.tags) ? course.tags : [],
    dueDate: course?.dueDate ?? undefined
  }), [course]);

  
  const { statusColor, courseIcon, daysUntilExpiry } = React.useMemo(() => ({
    statusColor: getStatusColor(safeCourse.status),
    courseIcon: getCourseIcon(safeCourse),
    daysUntilExpiry: safeCourse.expiryDate ? getDaysUntilExpiry(safeCourse.expiryDate) : null
  }), [safeCourse, getStatusColor, getCourseIcon, getDaysUntilExpiry]);

  
  const handlePress = React.useCallback(() => {
    onCoursePress(safeCourse);
  }, [onCoursePress, safeCourse]);

  const handleFavoritePress = React.useCallback((e: any) => {
    e?.stopPropagation?.();
    onToggleFavorite();
  }, [onToggleFavorite]);

  
  const cardStyle = React.useMemo(() => [
    viewMode === 'list' ? styles.listItem : styles.gridItem,
    { 
      width: cardWidth,
      backgroundColor: colors.card,
      
      shadowColor: theme.dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.08)',
      borderColor: theme.colors.border,
      borderWidth: 1,
    },
    isMobile && styles.mobileContainer
  ] as any, [cardWidth, isMobile, viewMode, theme.dark]);

  const progressFillStyle = React.useMemo(() => [
    styles.courseProgressFill,
    { 
      width: `${safeCourse.progress}%`, 
      backgroundColor: statusColor 
    }
  ] as any, [safeCourse.progress, statusColor]);

  
  if (viewMode === 'list') {
    return (
      <TouchableOpacity 
        style={cardStyle}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <View style={styles.listHeader}>
          <View style={styles.iconTitleContainer}>
            <MaterialIcons 
              name={courseIcon as any} 
              size={20} 
              color={statusColor} 
              style={styles.listIcon}
            />
            <View style={styles.listTitleContainer}>
              <Text style={[styles.listTitle, { color: colors.text }]} numberOfLines={2}>
                {safeCourse.title}
              </Text>
              {safeCourse.description && (
                <Text style={[styles.listDescription, { color: colors.textSecondary }]} numberOfLines={1}>
                  {safeCourse.description}
                </Text>
              )}
              {}
              {typeof safeCourse.id === 'number' && (
                <View style={{ marginTop: 6 }}>
                  <CourseRatings cursoId={safeCourse.id} compact={true} showLabels={false} />
                </View>
              )}
            </View>
          </View>
          
          <TouchableOpacity 
            onPress={handleFavoritePress}
            style={styles.favoriteButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialIcons 
              name={isFavorite ? "star" : "star-outline"} 
              size={20} 
              color={isFavorite ? (colors.warning || '#f6ad55') : colors.textSecondary} 
            />
          </TouchableOpacity>
        </View>

        <View style={styles.listInfoContainer}>
          <View style={styles.metaInfo}>
            <Text style={[styles.courseStatus, { color: statusColor }]}>
              {safeCourse.status === 'completed' ? 'Completado' : 
               safeCourse.status === 'in-progress' ? 'En Progreso' : 'Pendiente'}
            </Text>
            
            {daysUntilExpiry !== null && daysUntilExpiry > 0 && (
              <Text style={[styles.courseExpiry, { color: colors.error }]}>
                Vence en {daysUntilExpiry} día{daysUntilExpiry !== 1 ? 's' : ''}
              </Text>
            )}
          </View>

          {safeCourse.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {safeCourse.tags.slice(0, 3).map((tag, index) => (
                <View key={index} style={[styles.tag, { backgroundColor: (colors.primaryLight || colors.card) }]}>
                  <Text style={[styles.tagText, { color: colors.textSecondary }]}>{tag}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  
  return (
    <TouchableOpacity 
      style={cardStyle}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.courseHeader}>
        <MaterialIcons 
          name={courseIcon as any} 
          size={18} 
          color={statusColor} 
        />
        
        <View style={styles.headerRight}>
          <Text 
            style={[styles.courseStatus, { color: statusColor }]} 
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {safeCourse.status === 'completed' ? 'Completado' : 
             safeCourse.status === 'in-progress' ? 'En Progreso' : 'Pendiente'}
          </Text>
          
          <TouchableOpacity 
            onPress={handleFavoritePress}
            style={styles.favoriteButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <MaterialIcons 
              name={isFavorite ? "star" : "star-outline"} 
              size={16} 
              color={isFavorite ? (colors.warning || '#f6ad55') : colors.textSecondary} 
            />
          </TouchableOpacity>
        </View>
      </View>
      
      <Text style={[styles.courseTitle, { color: colors.text }]} numberOfLines={2}>
        {safeCourse.title}
      </Text>
      
      {}
      {typeof safeCourse.id === 'number' && (
        <View style={{ marginTop: 8, marginBottom: 4 }}>
          <CourseRatings cursoId={safeCourse.id} compact={true} showLabels={false} />
        </View>
      )}
      
      {daysUntilExpiry !== null && daysUntilExpiry > 0 && (
        <Text style={[styles.courseExpiry, { color: colors.error }]}>
          Vence en {daysUntilExpiry} día{daysUntilExpiry !== 1 ? 's' : ''}
        </Text>
      )}
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  gridItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    minHeight: 160,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  listItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    minHeight: 140,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  mobileContainer: {
    padding: 14,
  },
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerRight: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: 8,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  iconTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  listIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  listTitleContainer: {
    flex: 1,
  },
  courseTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
    lineHeight: 20,
  },
  listTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 6,
    lineHeight: 22,
  },
  listDescription: {
    fontSize: 14,
    lineHeight: 18,
  },
  listInfoContainer: {
    gap: 12,
  },
  progressContainer: {
    gap: 6,
  },
  metaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  courseStatus: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  courseExpiry: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 13,
    fontWeight: '500',
  },
  courseProgress: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  courseProgressBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
    overflow: 'hidden',
  },
  courseProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  courseProgressText: {
    fontSize: 11,
    fontWeight: '500',
    minWidth: 28,
    textAlign: 'right',
  },
  favoriteButton: {
    padding: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '500',
  },
});

export default CourseCard;