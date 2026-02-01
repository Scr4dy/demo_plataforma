import React from 'react';
import { View, StyleSheet, useWindowDimensions, Platform } from 'react-native';

interface SkeletonProps {
  variant?: 'web' | 'mobile';
}

export const CertificateSkeleton: React.FC<SkeletonProps> = ({ 
  variant = Platform.OS === 'web' ? 'web' : 'mobile' 
}) => {
  const { width } = useWindowDimensions();
  
  const SkeletonCard = () => {
    const isWeb = variant === 'web';
    const cardWidth = isWeb ? 
      Math.min(350, (width - 72) / 2) : 
      width - 32; 

    return (
      <View style={[styles.skeletonCard, { width: cardWidth }]}>
        <View style={styles.skeletonHeader}>
          <View style={styles.skeletonBadge} />
          <View style={styles.skeletonCategory} />
        </View>
        <View style={[styles.skeletonTitle, { width: isWeb ? '80%' : '90%' }]} />
        <View style={[styles.skeletonInstructor, { width: isWeb ? '60%' : '70%' }]} />
        <View style={styles.skeletonDetails}>
          <View style={styles.skeletonDetail} />
          <View style={[styles.skeletonDetail, { width: '80%' }]} />
          <View style={[styles.skeletonDetail, { width: '60%' }]} />
        </View>
        <View style={styles.skeletonButton} />
      </View>
    );
  };

  const SkeletonList = () => (
    <View style={styles.container}>
      {}
      <View style={styles.skeletonHeader}>
        <View style={[
          styles.skeletonPageTitle, 
          { width: variant === 'web' ? 200 : 160 }
        ]} />
      </View>
      
      {}
      {variant === 'web' && (
        <View style={styles.skeletonTabs}>
          <View style={styles.skeletonTab} />
          <View style={styles.skeletonTab} />
          <View style={styles.skeletonTab} />
        </View>
      )}

      {}
      <View style={[
        styles.skeletonGrid,
        variant === 'mobile' && styles.skeletonList
      ]}>
        <SkeletonCard />
        <SkeletonCard />
        {variant === 'web' && <SkeletonCard />}
      </View>
    </View>
  );

  return <SkeletonList />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 16,
  },
  skeletonHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  skeletonPageTitle: {
    height: 24,
    backgroundColor: '#e2e8f0',
    borderRadius: 6,
  },
  skeletonTabs: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
    gap: 16,
  },
  skeletonTab: {
    width: 100,
    height: 40,
    backgroundColor: '#e2e8f0',
    borderRadius: 8,
  },
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'center',
  },
  skeletonList: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  skeletonCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  skeletonBadge: {
    width: 80,
    height: 20,
    backgroundColor: '#e2e8f0',
    borderRadius: 10,
  },
  skeletonCategory: {
    width: 60,
    height: 20,
    backgroundColor: '#e2e8f0',
    borderRadius: 10,
  },
  skeletonTitle: {
    height: 20,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonInstructor: {
    height: 16,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    marginBottom: 16,
  },
  skeletonDetails: {
    gap: 12,
    marginBottom: 16,
  },
  skeletonDetail: {
    height: 14,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
  },
  skeletonButton: {
    height: 44,
    backgroundColor: '#e2e8f0',
    borderRadius: 8,
  },
});