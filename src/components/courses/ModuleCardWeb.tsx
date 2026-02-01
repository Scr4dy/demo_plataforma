import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProgressBar } from './ProgressBar';
import { useTheme } from '../../context/ThemeContext';
import type { Module, CourseUIHelpers } from '../../types/course.types';

interface ModuleCardWebProps extends CourseUIHelpers {
  module: Module;
  onModulePress?: (module?: Module) => void;
  onLessonPress?: (lesson: any, module?: Module) => void;
  isNextModule?: boolean;
} 

export const ModuleCardWeb: React.FC<ModuleCardWebProps> = ({
  module,
  onModulePress,
  onLessonPress,
  getStatusIcon,
  getStatusText,
  getStatusColor
}) => {
  const [expanded, setExpanded] = useState(false);
  const rotation = useRef(new Animated.Value(0)).current;
  const { theme, colors } = useTheme();

  useEffect(() => {
    Animated.timing(rotation, {
      toValue: expanded ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [expanded]);

  return (
    <View style={styles.moduleCardWeb}>
      <TouchableOpacity
        style={[
          styles.moduleHeaderWeb,
          module.status === 'locked' && styles.moduleLocked,
          expanded && styles.moduleHeaderActive
        ]}
        onPress={() => { if (module.status === 'locked') return; setExpanded(prev => !prev); }}
        disabled={module.status === 'locked'}
      >
        <View style={styles.moduleInfoWeb}>
          <View style={[styles.moduleIconCircle, { backgroundColor: expanded ? (getStatusColor?.(module.status ?? '') ?? colors.primary) : '#f1f5f9' }]}>
            <Ionicons 
              name={(getStatusIcon?.(module.status ?? '') ?? 'help-circle') as any}
              size={18} 
              color={expanded ? theme.colors.card : (getStatusColor?.(module.status ?? '') ?? colors.primary)}
            />
          </View>
          <View style={styles.moduleContentWeb}>
            <View style={styles.moduleTitleRow}>
              <Text style={styles.moduleTitleWeb}>{module.title}</Text>
              <Text style={styles.moduleDurationWeb}>{module.duration}</Text>
            </View>
            <Text style={styles.moduleMetaWeb}>
              {module.lessons || 0} lecciones • {module.completedLessons || 0} completadas
            </Text>
            {module.status === 'in-progress' && module.progress && (
              <View style={styles.moduleProgressWeb}>
                <ProgressBar progress={module.progress} height={4} />
                <Text style={styles.moduleProgressTextWeb}>
                  {module.progress}% completado
                </Text>
              </View>
            )}
          </View>
        </View>
        <View style={styles.moduleStatusWeb}>
          <Text style={[
            styles.moduleStatusTextWeb,
            { color: getStatusColor?.(module.status ?? '') ?? colors.primary }
          ]}>
            {getStatusText?.(module.status ?? '') ?? ''}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            {}
            <Animated.View style={{ transform: [{ rotate: rotation.interpolate({ inputRange: [0,1], outputRange: ['0deg','90deg'] }) }] }}>
              <Ionicons 
                name="chevron-forward" 
                size={16} 
                color={module.status === 'locked' ? '#a0aec0' : (getStatusColor?.(module.status ?? '') ?? colors.primary)} 
              />
            </Animated.View>
          </View>
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.lessonsContainerWeb}>
          <View style={styles.lessonTimeline} />
          <View style={styles.lessonsListInner}>
            {(module.lessonsList ?? []).map((lesson: any, index: number) => (
              <TouchableOpacity
                key={lesson.id ?? index}
                style={styles.lessonRow}
                disabled={module.status === 'locked'}
                onPress={() => { if (module.status === 'locked') return; onLessonPress?.(lesson.raw ?? lesson, module); }}
              >
                <View style={[
                  styles.lessonDot,
                  index < (module.completedLessons ?? 0) ? styles.lessonDotCompleted : (module.status === 'locked' ? styles.lessonDotLocked : {})
                ]} />
                <View style={styles.lessonContent}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <Text style={[
                      styles.lessonTextWeb,
                      module.status === 'locked' && styles.lessonLocked,
                      index < (module.completedLessons ?? 0) && styles.lessonCompleted
                    ]}>
                      {lesson.title}
                    </Text>
                    {lesson.obligatorio === true && (
                      <View style={{ backgroundColor: `${colors.warning}15`, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginLeft: 8 }}>
                        <Text style={{ fontSize: 11, color: colors.warning || '#b7791f', fontWeight: '600' }}>Oblig.</Text>
                      </View>
                    )}  
                  </View>
                  <Text style={styles.lessonDurationWeb}>{lesson.duration ? `${lesson.duration} min` : ''}</Text>
                </View>
              </TouchableOpacity>
            ))} 
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  moduleCardWeb: {
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    overflow: 'hidden',
  },
  moduleHeaderWeb: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  moduleLocked: {
    opacity: 0.6,
  },
  moduleHeaderActive: {
    backgroundColor: '#f0fff4',
  },
  moduleInfoWeb: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  moduleIconWeb: {
    marginRight: 16,
  },
  moduleContentWeb: {
    flex: 1,
  },
  moduleTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  moduleTitleWeb: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3748',
    flex: 1,
    marginRight: 12,
  },
  moduleDurationWeb: {
    fontSize: 12,
    color: '#718096',
    fontWeight: '500',
  },
  moduleMetaWeb: {
    fontSize: 12,
    color: '#718096',
    marginBottom: 8,
  },
  moduleProgressWeb: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  moduleProgressTextWeb: {
    fontSize: 11,
    color: '#d69e2e',
    fontWeight: '500',
    minWidth: 60,
  },
  moduleStatusWeb: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  moduleStatusTextWeb: {
    fontSize: 12,
    fontWeight: '500',
  },
  lessonsContainerWeb: {
    padding: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f7fafc',
    position: 'relative',
  },
  moduleIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  lessonTimeline: {
    position: 'absolute',
    left: 34,
    top: 12,
    bottom: 12,
    borderLeftWidth: 2,
    borderLeftColor: '#e2e8f0',
    borderStyle: 'dashed',
  },
  lessonsListInner: {
    marginLeft: 56,
    flex: 1,
  },
  lessonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f7fafc',
  },
  lessonDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#e2e8f0',
    marginRight: 12,
    marginLeft: 14,
    marginTop: 4,
  },
  lessonDotCompleted: {
    backgroundColor: '#38a169',
  },
  lessonDotLocked: {
    backgroundColor: '#a0aec0',
  },
  lessonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  lessonTextWeb: {
    fontSize: 13,
    color: '#4a5568',
    flex: 1,
  },
  lessonLocked: {
    color: '#a0aec0',
  },
  lessonCompleted: {
    color: '#38a169',
  },
  lessonDurationWeb: {
    fontSize: 11,
    color: '#718096',
    marginLeft: 8,
  },
});

export default ModuleCardWeb;