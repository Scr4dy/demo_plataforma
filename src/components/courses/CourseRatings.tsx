
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { reportesService } from '../../services/reportesService';
import { useTheme } from '../../context/ThemeContext';

interface CourseRatingsProps {
  cursoId: number;
  compact?: boolean;
  showLabels?: boolean;
}

export const CourseRatings: React.FC<CourseRatingsProps> = ({ 
  cursoId, 
  compact = false,
  showLabels = true 
}) => {
  const { theme } = useTheme();
  const [ratings, setRatings] = useState<{
    instructor: number | null;
    contenido: number | null;
  }>({ instructor: null, contenido: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarEvaluaciones();
  }, [cursoId]);

  const cargarEvaluaciones = async () => {
    try {
      setLoading(true);
      const reporte = await reportesService.getReporteByCurso(cursoId);
      
      if (reporte) {
        setRatings({
          instructor: reporte.promedio_instructor || null,
          contenido: reporte.promedio_contenido || null,
        });
      }
    } catch (error) {
      
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number | null) => {
    if (rating === null || rating === 0) return null;

    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Ionicons key={i} name="star" size={compact ? 12 : 14} color="#FFC107" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<Ionicons key={i} name="star-half" size={compact ? 12 : 14} color="#FFC107" />);
      } else {
        stars.push(<Ionicons key={i} name="star-outline" size={compact ? 12 : 14} color="#DDD" />);
      }
    }

    return stars;
  };

  if (loading) return null;

  
  if (!ratings.instructor && !ratings.contenido) return null;

  if (compact) {
    
    const promedioGeneral = ratings.instructor && ratings.contenido 
      ? (ratings.instructor + ratings.contenido) / 2 
      : ratings.instructor || ratings.contenido || 0;

    return (
      <View style={styles.compactContainer}>
        <View style={styles.starsRow}>
          {renderStars(promedioGeneral)}
        </View>
        <Text style={[styles.ratingValue, { color: theme.colors.text }]}>{promedioGeneral.toFixed(1)}</Text>
      </View>
    );
  }

  
  return (
    <View style={styles.container}>
      {ratings.instructor !== null && (
        <View style={styles.ratingRow}>
          {showLabels && (
            <View style={styles.labelContainer}>
              <Ionicons name="person" size={14} color={theme.colors.textSecondary} />
              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Instructor:</Text>
            </View>
          )}
          <View style={styles.starsRow}>
            {renderStars(ratings.instructor)}
          </View>
          <Text style={[styles.ratingValue, { color: theme.colors.text }]}>{ratings.instructor.toFixed(1)}</Text>
        </View>
      )}

      {ratings.contenido !== null && (
        <View style={styles.ratingRow}>
          {showLabels && (
            <View style={styles.labelContainer}>
              <Ionicons name="book" size={14} color={theme.colors.textSecondary} />
              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Contenido:</Text>
            </View>
          )}
          <View style={styles.starsRow}>
            {renderStars(ratings.contenido)}
          </View>
          <Text style={[styles.ratingValue, { color: theme.colors.text }]}>{ratings.contenido.toFixed(1)}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minWidth: 100,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingValue: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 4,
  },
});

export default CourseRatings;
