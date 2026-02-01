import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  Platform,
  Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSidebar } from '../../context/SidebarContext';

const { width, height } = Dimensions.get('window');
const STORAGE_KEY = '@onboarding_completed';

export interface TourStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  position?: 'top' | 'center' | 'bottom';
  highlightArea?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

interface OnboardingTourProps {
  steps: TourStep[];
  onComplete: () => void;
  onSkip?: () => void;
  visible: boolean;
}

export const OnboardingTour: React.FC<OnboardingTourProps> = ({
  steps,
  onComplete,
  onSkip,
  visible
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.9));

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [visible, currentStep]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start(() => {
        setCurrentStep(currentStep + 1);
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 8,
            tension: 40,
            useNativeDriver: true,
          })
        ]).start();
      });
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const sidebar = useSidebar ? useSidebar() : null;
  const isWebLocal = Platform.OS === 'web';
  const sidebarOpen = !!(sidebar && sidebar.isSidebarOpen);

  const handleSkip = () => {
    onSkip?.();
    onComplete();
  };

  const handleComplete = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start(() => {
      onComplete();
    });
  };

  if (!visible || steps.length === 0) return null;

  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Animated.View 
          style={[
            styles.container,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          {}
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkip}
            activeOpacity={0.7}
          >
            <Text style={styles.skipText}>Saltar</Text>
          </TouchableOpacity>

          {}
          <View style={styles.content}>
            {}
            <View style={styles.iconContainer}>
              <View style={styles.iconCircle}>
                <Ionicons name={step.icon as any} size={60} color="#2196F3" />
              </View>
            </View>

            {}
            <Text style={styles.title}>{step.title}</Text>

            {}
            <Text style={styles.description}>{step.description}</Text>
          </View>

          {}
          <View style={styles.progressContainer}>
            <View style={styles.dotsContainer}>
              {steps.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    index === currentStep && styles.dotActive,
                    index < currentStep && styles.dotCompleted
                  ]}
                />
              ))}
            </View>

            {}
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${progress}%` }]} />
            </View>

            {}
            <Text style={styles.stepCounter}>
              {currentStep + 1} de {steps.length}
            </Text>
          </View>

          {}
          <View style={styles.buttonsContainer}>
            {currentStep > 0 && ! (isWebLocal && sidebarOpen) && (
              <TouchableOpacity
                style={[styles.button, styles.buttonSecondary]}
                onPress={handleBack}
                activeOpacity={0.7}
              >
                <Ionicons name="arrow-back" size={20} color="#666" />
                <Text style={styles.buttonSecondaryText}>Atrás</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                styles.button,
                styles.buttonPrimary,
                currentStep === 0 && styles.buttonFullWidth
              ]}
              onPress={handleNext}
              activeOpacity={0.7}
            >
              <Text style={styles.buttonPrimaryText}>
                {currentStep === steps.length - 1 ? '¡Comenzar!' : 'Siguiente'}
              </Text>
              <Ionicons 
                name={currentStep === steps.length - 1 ? "checkmark" : "arrow-forward"} 
                size={20} 
                color="#fff" 
              />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

export const useOnboarding = (userId?: string) => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkOnboardingStatus();
  }, [userId]);

  const checkOnboardingStatus = async () => {
    try {
      const key = userId ? `${STORAGE_KEY}_${userId}` : STORAGE_KEY;
      const completed = await AsyncStorage.getItem(key);
      
      if (!completed) {
        
        setShowOnboarding(true);
      }
    } catch (error) {
      
    } finally {
      setLoading(false);
    }
  };

  const completeOnboarding = async () => {
    try {
      const key = userId ? `${STORAGE_KEY}_${userId}` : STORAGE_KEY;
      await AsyncStorage.setItem(key, 'true');
      setShowOnboarding(false);
    } catch (error) {
      
    }
  };

  const resetOnboarding = async () => {
    try {
      const key = userId ? `${STORAGE_KEY}_${userId}` : STORAGE_KEY;
      await AsyncStorage.removeItem(key);
      setShowOnboarding(true);
    } catch (error) {
      
    }
  };

  return {
    showOnboarding,
    loading,
    completeOnboarding,
    resetOnboarding,
    setShowOnboarding,
  };
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 30,
    width: '100%',
    maxWidth: 450,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
      web: {
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
      }
    })
  },
  skipButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  skipText: {
    color: '#999',
    fontSize: 15,
    fontWeight: '500',
  },
  content: {
    alignItems: 'center',
    paddingTop: 20,
  },
  iconContainer: {
    marginBottom: 30,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 30,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: '#2196F3',
    width: 24,
  },
  dotCompleted: {
    backgroundColor: '#10B981',
  },
  progressBarContainer: {
    width: '100%',
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#2196F3',
    borderRadius: 2,
  },
  stepCounter: {
    fontSize: 13,
    color: '#999',
    fontWeight: '500',
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  buttonFullWidth: {
    flex: 1,
  },
  buttonPrimary: {
    backgroundColor: '#2196F3',
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonPrimaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonSecondary: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  buttonSecondaryText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
});
