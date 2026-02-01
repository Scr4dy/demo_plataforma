
import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions, Platform } from 'react-native';

interface ProgressCardProps {
  progress: number;
  isMobile?: boolean;
}

export const ProgressCard: React.FC<ProgressCardProps> = ({ progress, isMobile = false }) => {
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 375;

  const formatProgressText = (progress: number) => {
    if (progress === 0) return "Comienza tu primer curso";
    if (progress < 30) return "¡Sigue así!";
    if (progress < 70) return "¡Vas por buen camino!";
    if (progress < 100) return "¡Casi lo logras!";
    return "¡Completado!";
  };

  const ProgressCircle = () => (
    <View style={[
      styles.progressCircle,
      { backgroundColor: '#2196F320' }, 
      isMobile && styles.mobileProgressCircle,
      isSmallScreen && styles.smallProgressCircle
    ]}>
      <Text style={[
        styles.progressPercentage,
        { color: '#2196F3' }, 
        isMobile && styles.mobileProgressPercentage,
        isSmallScreen && styles.smallProgressPercentage
      ]}>
        {progress}%
      </Text>
    </View>
  );

  const ProgressBar = () => (
    <View style={[
      styles.progressBar,
      { backgroundColor: '#e0e0e0' }, 
      isMobile && styles.mobileProgressBar
    ]}>
      <View style={[
        styles.progressFill, 
        { 
          width: `${progress}%`,
          backgroundColor: '#2196F3' 
        }
      ]} />
    </View>
  );

  return (
    <View style={[
      styles.progressCard,
      { backgroundColor: '#ffffff' }, 
      isMobile && styles.mobileProgressCard,
      isSmallScreen && styles.smallProgressCard
    ]}>
      <ProgressCircle />
      <View style={styles.progressInfo}>
        <Text style={[
          styles.progressLabel,
          { color: '#666666' }, 
          isMobile && styles.mobileProgressLabel,
          isSmallScreen && styles.smallProgressLabel
        ]}>
          Completado
        </Text>
        <ProgressBar />
        <Text style={[
          styles.progressSubtext,
          { color: '#999999' }, 
          isMobile && styles.mobileProgressSubtext,
          isSmallScreen && styles.smallProgressSubtext
        ]}>
          {formatProgressText(progress)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  progressCard: {
    padding: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      }
    })
  },
  mobileProgressCard: {
    padding: 16,
  },
  smallProgressCard: {
    padding: 12,
  },
  progressCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  mobileProgressCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  smallProgressCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  progressPercentage: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  mobileProgressPercentage: {
    fontSize: 20,
  },
  smallProgressPercentage: {
    fontSize: 18,
  },
  progressInfo: {
    flex: 1,
  },
  progressLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  mobileProgressLabel: {
    fontSize: 15,
    marginBottom: 6,
  },
  smallProgressLabel: {
    fontSize: 14,
  },
  progressBar: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  mobileProgressBar: {
    height: 6,
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressSubtext: {
    fontSize: 14,
  },
  mobileProgressSubtext: {
    fontSize: 13,
  },
  smallProgressSubtext: {
    fontSize: 12,
  },
});

export default ProgressCard;