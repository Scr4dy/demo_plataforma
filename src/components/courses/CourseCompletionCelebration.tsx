
import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface CourseCompletionCelebrationProps {
  courseTitle: string;
  onClose: () => void;
}

export const CourseCompletionCelebration: React.FC<CourseCompletionCelebrationProps> = ({
  courseTitle,
  onClose
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start(onClose);
  };

  return (
    <View style={styles.overlay}>
      <Animated.View 
        style={[
          styles.container,
          {
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim
          }
        ]}
      >
        <View style={styles.confettiContainer}>
          {[...Array(8)].map((_, i) => (
            <View 
              key={i}
              style={[
                styles.confetti,
                {
                  backgroundColor: ['#f56565', '#ed8936', '#ecc94b', '#48bb78', '#38b2ac', '#4299e1', '#9f7aea', '#ed64a6'][i],
                  left: `${(i + 1) * 10}%`,
                  transform: [{ rotate: `${i * 45}deg` }]
                }
              ]} 
            />
          ))}
        </View>

        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <MaterialIcons name="celebration" size={48} color="#d69e2e" />
          </View>
          
          <Text style={styles.title}>¡Felicidades!</Text>
          <Text style={styles.subtitle}>Has completado el curso</Text>
          <Text style={styles.courseName}>"{courseTitle}"</Text>
          
          <View style={styles.achievements}>
            <View style={styles.achievement}>
              <MaterialIcons name="emoji-events" size={20} color="#d69e2e" />
              <Text style={styles.achievementText}>Curso Completado</Text>
            </View>
            <View style={styles.achievement}>
              <MaterialIcons name="card-membership" size={20} color="#2b6cb0" />
              <Text style={styles.achievementText}>Certificado Disponible</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Text style={styles.closeButtonText}>Continuar</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  container: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 32,
    margin: 24,
    maxWidth: 400,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    overflow: 'hidden',
  },
  confettiContainer: {
    position: 'absolute',
    top: -30,
    left: 0,
    right: 0,
    height: 60,
  },
  confetti: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 2,
  },
  content: {
    alignItems: 'center',
  },
  iconContainer: {
    backgroundColor: '#fefcbf',
    padding: 16,
    borderRadius: 50,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#718096',
    marginBottom: 4,
    textAlign: 'center',
  },
  courseName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2b6cb0',
    marginBottom: 24,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  achievements: {
    gap: 12,
    marginBottom: 24,
    width: '100%',
  },
  achievement: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f7fafc',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  achievementText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4a5568',
  },
  closeButton: {
    backgroundColor: '#2b6cb0',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default CourseCompletionCelebration;