
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import type { Module, CourseUIHelpers } from '../../types/course.types';

const hexToRgba = (hex: string, alpha = 0.06) => {
  if (!hex) return `rgba(0,0,0,${alpha})`;
  let h = hex.replace('#','');
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  const num = parseInt(h, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

interface ModuleCardMobileProps extends CourseUIHelpers {
  module: Module;
  onModulePress: (module: Module) => void;
  onLessonPress?: (lesson: any, module?: Module) => void;
} 

export const ModuleCardMobile: React.FC<ModuleCardMobileProps> = ({
  module,
  onModulePress,
  onLessonPress,
  getStatusIcon,
  getStatusText,
  getStatusColor
}) => {
  const [expanded, setExpanded] = useState(false);
  const rotation = useRef(new Animated.Value(0)).current;
  const { theme, colors, colorScheme } = useTheme();

  
  useEffect(() => {
    if (__DEV__) {
    }
  }, [colorScheme, colors]);

  
  const getLessonStyle = (lesson: any) => {
    const tipo = lesson.tipo || lesson.type || (lesson.raw && lesson.raw.tipo) || '';
    const url = lesson.url || (lesson.raw && lesson.raw.url) || '';
    
    if (tipo === 'video' || /video/i.test(tipo) || /\.(mp4|webm|mov|avi)$/i.test(url)) {
      const color = colors.primary || '#7C3AED';
      return { icon: 'videocam', color, bg: hexToRgba(color, 0.06), label: 'Video' };
    }
    if (tipo === 'documento' || tipo === 'pdf' || /pdf/i.test(tipo) || /\.pdf$/i.test(url)) {
      const color = colors.error || '#DC2626';
      return { icon: 'document-text', color, bg: hexToRgba(color, 0.06), label: 'PDF' };
    }
    if (tipo === 'presentacion' || /presentation|ppt/i.test(tipo) || /\.(ppt|pptx)$/i.test(url)) {
      const color = colors.warning || '#EA580C';
      return { icon: 'easel', color, bg: hexToRgba(color, 0.06), label: 'PPT' };
    }
    if (tipo === 'evaluacion' || tipo === 'quiz' || /quiz|exam|test/i.test(tipo)) {
      const color = colors.success || '#059669';
      return { icon: 'clipboard', color, bg: hexToRgba(color, 0.06), label: 'Evaluación' };
    }
    if (tipo === 'enlace' || tipo === 'link' || /link|url/i.test(tipo)) {
      const color = colors.accent || '#0891B2';
      return { icon: 'link', color, bg: hexToRgba(color, 0.06), label: 'Enlace' };
    }
    if (/imagen|image|img/i.test(tipo) || /\.(jpg|jpeg|png|gif|svg)$/i.test(url)) {
      const color = colors.accent || '#DB2777';
      return { icon: 'image', color, bg: hexToRgba(color, 0.06), label: 'Imagen' };
    }
    
    const defaultColor = colors.primary || '#2563EB';
    return { icon: 'book', color: defaultColor, bg: hexToRgba(defaultColor, 0.06), label: 'Lección' };
  };

  useEffect(() => {
    Animated.timing(rotation, {
      toValue: expanded ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [expanded]);

  return (
    <View style={[
      styles.moduleCard,
      module.status === 'locked' && styles.moduleLocked,
      expanded && styles.moduleCardActive,
      { backgroundColor: colors.card, shadowColor: theme.dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.08)', borderColor: theme.colors.border, borderWidth: 1 }
    ]}>
      <TouchableOpacity
        style={[styles.moduleHeader]}
        onPress={() => { if (module.status === 'locked') return; setExpanded(prev => !prev); }}
        disabled={module.status === 'locked'}
      >
        <View style={styles.moduleInfo}>
                <View style={[styles.moduleIconCircle, { backgroundColor: expanded ? (getStatusColor?.(module.status ?? '') ?? colors.primary) : hexToRgba(colors.primaryLight ?? colors.card ?? '#ffffff', 0.06) }]}>
              <Ionicons name={(getStatusIcon?.(module.status ?? '') ?? 'help-circle') as any} size={18} color={expanded ? theme.colors.card : (getStatusColor?.(module.status ?? '') ?? colors.primary)} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.moduleNumber}>Módulo {String(module.id ?? '')}</Text>
            <Text style={styles.moduleTitle}>{String(module.title ?? '')}</Text>
            <Text style={styles.moduleMeta}>
              {`${module.lessons || 0} lecciones • ${module.completedLessons || 0} completadas`}
            </Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {}
          <Animated.View style={{ transform: [{ rotate: rotation.interpolate({ inputRange: [0,1], outputRange: ['0deg','90deg'] }) }] }}>
            <Ionicons name="chevron-forward" size={20} color={module.status === 'locked' ? colors.textSecondary : (getStatusColor?.(module.status ?? '') ?? colors.primary)} />
          </Animated.View>
        </View>

      </TouchableOpacity>
      
      {}

      {expanded ? (
        <View style={styles.lessonsContainerModern}>
          {(module.lessonsList ?? []).length === 0 ? (
            <View style={styles.emptyLessons}>
              <Ionicons name="folder-open-outline" size={32} color={theme.colors.border} />
              <Text style={[styles.emptyLessonsText, { color: colors.textSecondary }]}>No hay lecciones en este módulo</Text>
            </View>
          ) : (
            <View style={styles.lessonsGrid}>
              {(module.lessonsList ?? []).map((lesson: any, index: number) => {
                const lessonStyle = getLessonStyle(lesson);
                
                const isCompleted = !!(lesson.completado || (lesson.raw && lesson.raw.completado));
                const isLocked = module.status === 'locked';

                
                if (__DEV__) {
                }

                return (
                  <TouchableOpacity
                    key={lesson.id ?? index}
                    style={[
                      styles.lessonCardModern,
                      isCompleted && styles.lessonCardCompleted,
                      isLocked && styles.lessonCardLocked,
                      { backgroundColor: colors.card, borderColor: theme.colors.border, borderWidth: 1, shadowColor: theme.dark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.06)' },
                      isCompleted && { backgroundColor: hexToRgba(colors.success || '#10B981', 0.06), borderColor: colors.success },
                      isLocked && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.02)' : theme.colors.card, opacity: 0.6 }
                    ]}
                    disabled={isLocked}
                    onPress={() => { if (isLocked) return; onLessonPress?.(lesson.raw ?? lesson, module); }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.lessonCardHeader}>
                      <View style={[styles.lessonIconContainer, { backgroundColor: isCompleted ? colors.success : hexToRgba(colors.primary, 0.06) }]}>
                        <Ionicons 
                          name={isCompleted ? 'checkmark-circle' : lessonStyle.icon as any} 
                          size={24} 
                          color={isCompleted ? theme.colors.card : colors.primary} 
                        />
                      </View>
                      
                      {lesson.obligatorio === true ? (
                        <View style={[styles.obligatorioBadge, { backgroundColor: hexToRgba(colors.warning || '#FEF3C7', 0.06) }]}>
                          <Ionicons name="star" size={10} color={colors.warning} />
                          <Text style={[styles.obligatorioText, { color: colors.warning }]}>Obligatorio</Text>
                        </View>
                      ) : null}
                    </View>

                    <View style={[styles.lessonNumberBadge, { backgroundColor: theme.dark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.03)' }]}>
                      <Text style={[styles.lessonNumberText, { color: colors.textSecondary }]}>Lección {index + 1}</Text>
                    </View>

                    <Text 
                      style={[
                        styles.lessonTitleModern,
                        isCompleted && styles.lessonTitleCompleted,
                        isLocked && styles.lessonTitleLocked,
                        { color: isCompleted ? colors.success : isLocked ? colors.textSecondary : colors.text }
                      ]} 
                      numberOfLines={2}
                    >
                      {String(lesson.title ?? '')}
                    </Text>

                    <View style={styles.lessonCardFooter}>
                      {}
                      {(typeof lesson.duration === 'number' && lesson.duration > 0) ? (
                        <View style={styles.lessonDurationBadge}>
                          <Ionicons name="time-outline" size={12} color={colors.textSecondary} />
                          <Text style={[styles.lessonDurationText, { color: colors.textSecondary }]}>
                            {String(lesson.duration)} min
                          </Text>
                        </View>
                      ) : null}
                    </View>

                    {isCompleted ? (
                      <View style={styles.completedOverlay}>
                        <View style={[styles.completedBadge, { backgroundColor: colors.success, shadowColor: colors.success }]}> 
                          <Ionicons name="checkmark-done" size={14} color={theme.colors.card} />
                          <Text style={[styles.completedBadgeText, { color: theme.colors.card }]}>Completada</Text>
                        </View>
                      </View>
                    ) : null}

                    {isLocked ? (
                      <View style={[styles.lockedOverlay, { backgroundColor: theme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.7)' }]}>
                        <Ionicons name="lock-closed" size={20} color={colors.textSecondary} />
                      </View>
                    ) : null}

                    

                  </TouchableOpacity>
                );
              })} 
            </View>
          )}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  moduleCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  moduleLocked: {
    opacity: 0.6,
  },
  moduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  moduleInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  moduleNumber: {
    fontSize: 11,
    color: '#718096',
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  moduleTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2d3748',
    marginBottom: 6,
    lineHeight: 22,
  },
  moduleMeta: {
    fontSize: 13,
    color: '#718096',
  },
  progressSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2b6cb0',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#718096',
    fontWeight: '600',
  },
  moduleCardActive: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  moduleIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 0,
  },
  
  lessonsContainerModern: {
    paddingTop: 16,
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  lessonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  lessonCardModern: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  lessonCardCompleted: {
    backgroundColor: '#F0FDF4',
    borderColor: '#86EFAC',
  },
  lessonCardLocked: {
    opacity: 0.5,
    backgroundColor: '#F7FAFC',
  },
  lessonCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  lessonIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  obligatorioBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    gap: 4,
  },
  obligatorioText: {
    fontSize: 10,
    color: '#D97706',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  lessonNumberBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.03)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginBottom: 8,
  },
  lessonNumberText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  lessonTitleModern: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
    lineHeight: 20,
  },
  lessonTitleCompleted: {
    color: '#059669',
  },
  lessonTitleLocked: {
    color: '#94A3B8',
  },
  lessonDebug: {
    position: 'absolute',
    left: 12,
    bottom: 12,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)'
  },
  lessonDebugText: {
    fontSize: 11,
    fontWeight: '700'
  },
  lessonCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },

  lessonDurationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  lessonDurationText: {
    fontSize: 12,
    color: '#718096',
    fontWeight: '500',
  },
  completedOverlay: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 4,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  completedBadgeText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  lockedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyLessons: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyLessonsText: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 8,
  },
  
  lessonsContainerMobile: {
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 16,
    position: 'relative',
  },
  lessonTimeline: {
    position: 'absolute',
    left: 38,
    top: 12,
    bottom: 12,
    borderLeftWidth: 2,
    borderLeftColor: '#e2e8f0',
    borderStyle: 'dashed',
  },
  lessonsListInner: {
    marginLeft: 56,
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
    marginLeft: 10,
    marginTop: 4,
  },
  lessonDotLocked: {
    backgroundColor: '#a0aec0',
  },
  lessonLocked: {
    color: '#a0aec0',
  },
  lessonDotCompleted: {
    backgroundColor: '#38a169',
  },
  lessonCompleted: {
    color: '#38a169',
    fontWeight: '700',
  },
  lessonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  lessonTextMobile: {
    fontSize: 14,
    color: '#4a5568',
    flex: 1,
  },
  lessonDurationMobile: {
    fontSize: 12,
    color: '#718096',
    marginLeft: 8,
  },
});