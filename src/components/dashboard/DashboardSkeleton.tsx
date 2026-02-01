
import React from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';

const { width } = Dimensions.get('window');

export const DashboardSkeleton: React.FC = () => {
  const SkeletonCourseCard = () => (
    <View style={styles.skeletonCourseCard}>
      <View style={styles.skeletonCourseHeader}>
        <View style={styles.skeletonCourseIcon} />
        <View style={styles.skeletonCourseStatus} />
      </View>
      <View style={styles.skeletonCourseTitle} />
      <View style={styles.skeletonCourseProgress}>
        <View style={styles.skeletonProgressBar} />
        <View style={styles.skeletonProgressText} />
      </View>
    </View>
  );

  const SkeletonCertificateCard = () => (
    <View style={styles.skeletonCertificateCard}>
      <View style={styles.skeletonCertificateHeader}>
        <View style={styles.skeletonCertificateIcon} />
        <View style={styles.skeletonCertificateStatus} />
      </View>
      <View style={styles.skeletonCertificateTitle} />
      <View style={styles.skeletonCertificateButton} />
    </View>
  );

  return (
    <View style={styles.container}>
      {}
      <View style={styles.skeletonWelcomeCard}>
        <View style={styles.skeletonWelcomeContent}>
          <View style={styles.skeletonWelcomeTitle} />
          <View style={styles.skeletonWelcomeSubtitle} />
          <View style={styles.skeletonWelcomeText} />
        </View>
        <View style={styles.skeletonWelcomeIcon} />
      </View>

      {}
      <View style={styles.skeletonProgressCard}>
        <View style={styles.skeletonProgressCircle} />
        <View style={styles.skeletonProgressInfo}>
          <View style={styles.skeletonProgressLabel} />
          <View style={styles.skeletonProgressBar} />
          <View style={styles.skeletonProgressSubtext} />
        </View>
      </View>

      {}
      <View style={styles.skeletonCoursesGrid}>
        <SkeletonCourseCard />
        <SkeletonCourseCard />
        <SkeletonCourseCard />
        <SkeletonCourseCard />
      </View>

      {}
      <View style={styles.skeletonCertificatesSection}>
        <View style={styles.skeletonSectionHeader}>
          <View style={styles.skeletonSectionTitle} />
          <View style={styles.skeletonSeeAll} />
        </View>
        <View style={styles.skeletonCertificatesCarousel}>
          <SkeletonCertificateCard />
          <SkeletonCertificateCard />
          <SkeletonCertificateCard />
        </View>
      </View>

      {}
      <View style={styles.skeletonTeamAlerts}>
        <View style={styles.skeletonSectionTitle} />
        <View style={styles.skeletonTeamAlertCard} />
        <View style={styles.skeletonTeamAlertCard} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7fafc',
    padding: 16,
    gap: 20,
  },
  skeletonWelcomeCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    
    ...Platform.select({
      web: {
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      },
    }),
  },
  skeletonWelcomeContent: {
    flex: 1,
    gap: 8,
  },
  skeletonWelcomeTitle: {
    width: '60%',
    height: 20,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
  },
  skeletonWelcomeSubtitle: {
    width: '40%',
    height: 18,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
  },
  skeletonWelcomeText: {
    width: '80%',
    height: 16,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
  },
  skeletonWelcomeIcon: {
    width: 50,
    height: 50,
    backgroundColor: '#e2e8f0',
    borderRadius: 25,
  },
  skeletonProgressCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    
    ...Platform.select({
      web: {
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
      },
    }),
  },
  skeletonProgressCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#e2e8f0',
    marginRight: 20,
  },
  skeletonProgressInfo: {
    flex: 1,
    gap: 8,
  },
  skeletonProgressLabel: {
    width: '40%',
    height: 16,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
  },
  skeletonProgressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
  },
  skeletonProgressSubtext: {
    width: '30%',
    height: 14,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
  },
  skeletonCoursesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  skeletonCourseCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    width: (width - 56) / 2,
    minHeight: 120,
    gap: 8,
    
    ...Platform.select({
      web: {
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
      },
    }),
  },
  skeletonCourseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skeletonCourseIcon: {
    width: 18,
    height: 18,
    backgroundColor: '#e2e8f0',
    borderRadius: 9,
  },
  skeletonCourseStatus: {
    width: '40%',
    height: 12,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
  },
  skeletonCourseTitle: {
    width: '80%',
    height: 16,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
  },
  skeletonCourseProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  skeletonProgressText: {
    width: '20%',
    height: 12,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
  },
  skeletonCertificatesSection: {
    gap: 12,
  },
  skeletonSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skeletonSectionTitle: {
    width: '30%',
    height: 18,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
  },
  skeletonSeeAll: {
    width: '15%',
    height: 14,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
  },
  skeletonCertificatesCarousel: {
    flexDirection: 'row',
    gap: 8,
  },
  skeletonCertificateCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    width: 160,
    minHeight: 140,
    gap: 8,
    
    ...Platform.select({
      web: {
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
      },
    }),
  },
  skeletonCertificateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skeletonCertificateIcon: {
    width: 18,
    height: 18,
    backgroundColor: '#e2e8f0',
    borderRadius: 9,
  },
  skeletonCertificateStatus: {
    width: '30%',
    height: 12,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
  },
  skeletonCertificateTitle: {
    width: '90%',
    height: 16,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
  },
  skeletonCertificateButton: {
    width: '100%',
    height: 24,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
  },
  skeletonTeamAlerts: {
    gap: 8,
  },
  skeletonTeamAlertCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    height: 60,
    
    ...Platform.select({
      web: {
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
      },
    }),
  },
});

export default DashboardSkeleton;