
import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface WelcomeCardProps {
  name: string;
  progress: number;
  onShareProgress?: () => void;
  isMobile?: boolean;
}

export const WelcomeCard: React.FC<WelcomeCardProps> = ({ 
  name, 
  progress, 
  onShareProgress,
  isMobile = false 
}) => {
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 375;

  return (
    <View style={[
      styles.welcomeCard,
      isMobile && styles.mobileWelcomeCard,
      isSmallScreen && styles.smallWelcomeCard
    ]}>
      <View style={styles.welcomeContent}>
        <Text style={[
          styles.welcomeTitle,
          isMobile && styles.mobileWelcomeTitle,
          isSmallScreen && styles.smallWelcomeTitle
        ]}>
          ¡Bienvenido de vuelta!
        </Text>
        <Text style={[
          styles.welcomeSubtitle,
          isMobile && styles.mobileWelcomeSubtitle,
          isSmallScreen && styles.smallWelcomeSubtitle
        ]}>
          {name}
        </Text>
        <Text style={[
          styles.welcomeText,
          isMobile && styles.mobileWelcomeText,
          isSmallScreen && styles.smallWelcomeText
        ]}>
          Tu progreso de capacitación está al {progress}%
        </Text>
      </View>
      <View style={styles.welcomeIcon}>
        <Ionicons 
          name="person-circle" 
          size={isSmallScreen ? 40 : (isMobile ? 45 : 50)} 
          color="#1e3a8a" 
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  welcomeCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Platform.select({
      web: {
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      }
    })
  },
  mobileWelcomeCard: {
    padding: 16,
  },
  smallWelcomeCard: {
    padding: 12,
  },
  welcomeContent: {
    flex: 1,
    marginRight: 12,
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a365d',
    marginBottom: 4,
  },
  mobileWelcomeTitle: {
    fontSize: 16,
  },
  smallWelcomeTitle: {
    fontSize: 15,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#2b6cb0',
    fontWeight: '600',
    marginBottom: 4,
  },
  mobileWelcomeSubtitle: {
    fontSize: 15,
  },
  smallWelcomeSubtitle: {
    fontSize: 14,
  },
  welcomeText: {
    fontSize: 14,
    color: '#718096',
  },
  mobileWelcomeText: {
    fontSize: 13,
  },
  smallWelcomeText: {
    fontSize: 12,
  },
  welcomeIcon: {
    minWidth: 50,
    alignItems: 'flex-end',
  },
});

export default WelcomeCard;