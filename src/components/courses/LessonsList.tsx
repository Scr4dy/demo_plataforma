
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { supabase } from '../../config/supabase';
import { LessonCard } from './LessonCard';
import { useAuth } from '../../context/AuthContext';

interface LessonsListProps {
  moduleId: number;
  courseId: number;
  onLessonPress: (lesson: any) => void;
}

interface Lesson {
  id_contenido: number;
  id_curso: number;
  id_modulo: number;
  tipo: string;
  titulo: string;
  descripcion: string | null;
  url: string | null;
  orden: number;
  duracion_estimada: number;
  obligatorio: boolean;
  storage_type: string;
  storage_path: string | null;
  content_metadata: any;
}

interface LessonProgress {
  [key: number]: {
    completado: boolean;
    tiempo_empleado: number;
  };
}

export const LessonsList: React.FC<LessonsListProps> = ({
  moduleId,
  courseId,
  onLessonPress,
}) => {
  const { theme, colors } = useTheme();
  const { state } = useAuth();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState<LessonProgress>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadLessons();
  }, [moduleId]);

  const loadLessons = async () => {
    try {
      setLoading(true);

      
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('contenidos')
        .select('*')
        .eq('id_modulo', moduleId)
        .is('deleted_at', null)
        .order('orden', { ascending: true });

      if (lessonsError) throw lessonsError;

      setLessons(lessonsData || []);

      
      if (state.user?.id && lessonsData && lessonsData.length > 0) {
        await loadProgress(lessonsData.map(l => l.id_contenido));
      }
    } catch (error) {
      
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadProgress = async (contentIds: number[]) => {
    try {
      
      const { data: userData } = await supabase
        .from('usuarios')
        .select('id_usuario')
        .eq('auth_id', state.user?.id)
        .single();

      if (!userData) return;

      
      const { data: progressData } = await supabase
        .from('progreso_contenidos')
        .select('id_contenido, completado, tiempo_empleado')
        .in('id_contenido', contentIds)
        .eq('id_empleado', userData.id_usuario)
        .is('deleted_at', null);

      if (progressData) {
        const progressMap: LessonProgress = {};
        progressData.forEach(p => {
          progressMap[p.id_contenido] = {
            completado: p.completado,
            tiempo_empleado: p.tiempo_empleado,
          };
        });
        setProgress(progressMap);
      }
    } catch (error) {
      
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadLessons();
  };

  const isLessonLocked = (lesson: Lesson): boolean => {
    
    
    const currentIndex = lessons.findIndex(l => l.id_contenido === lesson.id_contenido);
    
    if (currentIndex === 0) return false; 
    
    const previousLesson = lessons[currentIndex - 1];
    if (!previousLesson.obligatorio) return false; 
    
    return !progress[previousLesson.id_contenido]?.completado; 
  };

  const renderLesson = ({ item }: { item: Lesson }) => {
    const isCompleted = progress[item.id_contenido]?.completado || false;
    const isLocked = isLessonLocked(item);

    return (
      <LessonCard
        lesson={item}
        isCompleted={isCompleted}
        isLocked={isLocked}
        onPress={() => onLessonPress(item)}
        showOrder
      />
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
        No hay lecciones en este módulo
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <FlatList
      data={lessons}
      renderItem={renderLesson}
      keyExtractor={item => item.id_contenido.toString()}
      contentContainerStyle={styles.listContent}
      ListEmptyComponent={renderEmpty}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={colors.primary}
        />
      }
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyContainer: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});
