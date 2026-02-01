
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { platformShadow } from '../../utils/styleHelpers';

interface LessonCardProps {
  lesson: {
    id_contenido: number;
    titulo: string;
    tipo: string;
    duracion_estimada: number;
    obligatorio: boolean;
    descripcion?: string | null;
    orden: number;
  };
  isCompleted?: boolean;
  isLocked?: boolean;
  onPress: () => void;
  showOrder?: boolean;
}

export const LessonCard: React.FC<LessonCardProps> = ({
  lesson,
  isCompleted = false,
  isLocked = false,
  onPress,
  showOrder = true,
}) => {
  const { theme, colors } = useTheme();

  const getTypeIcon = (tipo: string): string => {
    switch (tipo) {
      case 'video':
      case 'url_video':
        return 'videocam';
      case 'audio':
        return 'volume-up';
      case 'documento':
      case 'url_documento':
        return 'description';
      case 'presentacion':
        return 'slideshow';
      case 'imagen':
        return 'image';
      case 'evaluacion':
        return 'assignment';
      case 'enlace':
      case 'url_enlace':
        return 'link';
      default:
        return 'insert-drive-file';
    }
  };

  const getTypeColor = (tipo: string): string => {
    switch (tipo) {
      case 'video':
      case 'url_video':
        return '#ef4444'; 
      case 'audio':
        return '#8b5cf6'; 
      case 'documento':
      case 'url_documento':
        return '#3b82f6'; 
      case 'presentacion':
        return '#f59e0b'; 
      case 'imagen':
        return '#10b981'; 
      case 'evaluacion':
        return '#ec4899'; 
      case 'enlace':
      case 'url_enlace':
        return '#06b6d4'; 
      default:
        return colors.primary;
    }
  };

  const typeIcon = getTypeIcon(lesson.tipo);
  const typeColor = getTypeColor(lesson.tipo);

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: theme.colors.border,
          opacity: isLocked ? 0.6 : 1,
        },
      ]}
      onPress={onPress}
      disabled={isLocked}
      activeOpacity={0.7}
    >
      {}
      {showOrder && (
        <View style={[styles.orderBadge, { backgroundColor: colors.primary }]}>
          <Text style={[styles.orderText, { color: theme.colors.card }]}>
            {lesson.orden}
          </Text>
        </View>
      )}

      {}
      <View style={styles.content}>
        {}
        <View style={[styles.iconContainer, { backgroundColor: typeColor + '15' }]}>
          <MaterialIcons name={typeIcon as any} size={24} color={typeColor} />
        </View>

        {}
        <View style={styles.info}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
            {lesson.titulo}
          </Text>

          {lesson.descripcion && (
            <Text
              style={[styles.description, { color: colors.textSecondary }]}
              numberOfLines={2}
            >
              {lesson.descripcion}
            </Text>
          )}

          <View style={styles.metadata}>
            {}
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
              <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                {lesson.duracion_estimada} min
              </Text>
            </View>

            {}
            <View style={styles.metaItem}>
              <View style={[styles.typeBadge, { backgroundColor: typeColor + '20' }]}>
                <Text style={[styles.typeText, { color: typeColor }]}>
                  {lesson.tipo.replace('url_', '').charAt(0).toUpperCase() +
                    lesson.tipo.replace('url_', '').slice(1)}
                </Text>
              </View>
            </View>

            {}
            {lesson.obligatorio && (
              <View style={styles.metaItem}>
                <MaterialIcons name="star" size={14} color={colors.warning} />
                <Text style={[styles.metaText, { color: colors.warning }]}>
                  Obligatorio
                </Text>
              </View>
            )}
          </View>
        </View>

        {}
        <View style={styles.statusContainer}>
          {isLocked ? (
            <Ionicons name="lock-closed" size={24} color={colors.textSecondary} />
          ) : isCompleted ? (
            <Ionicons name="checkmark-circle" size={24} color={colors.success} />
          ) : (
            <Ionicons name="play-circle-outline" size={24} color={colors.primary} />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    overflow: 'hidden',
    ...platformShadow({ elevation: 2, shadowOpacity: 0.05 }),
  },
  orderBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    ...platformShadow({ elevation: 2, shadowOpacity: 0.2 }),
  },
  orderText: {
    fontSize: 12,
    fontWeight: '700',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingLeft: 48,
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  typeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  statusContainer: {
    marginLeft: 8,
  },
});
