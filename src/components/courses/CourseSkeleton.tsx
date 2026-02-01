
import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const CourseSkeleton: React.FC = () => {
  const SkeletonModuleCard = () => (
    <View style={styles.skeletonModuleCard}>
      <View style={styles.skeletonModuleHeader}>
        <View style={styles.skeletonModuleIcon} />
        <View style={styles.skeletonModuleContent}>
          <View style={styles.skeletonModuleTitle} />
          <View style={styles.skeletonModuleMeta} />
          <View style={styles.skeletonModuleProgress} />
        </View>
        <View style={styles.skeletonModuleStatus} />
      </View>
    </View>
  );

  const SkeletonResourceCard = () => (
    <View style={styles.skeletonResourceCard}>
      <View style={styles.skeletonResourceIcon} />
      <View style={styles.skeletonResourceContent}>
        <View style={styles.skeletonResourceTitle} />
        <View style={styles.skeletonResourceMeta} />
      </View>
      <View style={styles.skeletonDownloadButton} />
    </View>
  );

  return (
    <View style={styles.container}>
      {}
      <View style={styles.skeletonHeader}>
        <View style={styles.skeletonPageTitle} />
      </View>

      {}
      <View style={styles.skeletonHeroSection}>
        <View style={styles.skeletonHeroContent}>
          <View style={styles.skeletonBadge} />
          <View style={styles.skeletonCourseTitle} />
          <View style={styles.skeletonCourseDescription} />
          <View style={styles.skeletonCourseMeta}>
            <View style={styles.skeletonMetaItem} />
            <View style={styles.skeletonMetaItem} />
            <View style={styles.skeletonMetaItem} />
          </View>
          <View style={styles.skeletonProgressCard}>
            <View style={styles.skeletonProgressHeader}>
              <View style={styles.skeletonProgressLabel} />
              <View style={styles.skeletonProgressPercentage} />
            </View>
            <View style={styles.skeletonProgressBar} />
            <View style={styles.skeletonProgressFooter}>
              <View style={styles.skeletonProgressSubtext} />
              <View style={styles.skeletonProgressSubtext} />
            </View>
          </View>
        </View>

        <View style={styles.skeletonSidebar}>
          <View style={styles.skeletonActionCard}>
            <View style={styles.skeletonStatusBadge} />
            <View style={styles.skeletonPrimaryAction} />
            <View style={styles.skeletonSecondaryAction} />
            <View style={styles.skeletonSidebarDivider} />
            <View style={styles.skeletonSidebarStats}>
              <View style={styles.skeletonStat} />
              <View style={styles.skeletonStat} />
              <View style={styles.skeletonStat} />
            </View>
          </View>
        </View>
      </View>

      {}
      <View style={styles.skeletonTabs}>
        <View style={styles.skeletonTab} />
        <View style={styles.skeletonTab} />
        <View style={styles.skeletonTab} />
      </View>

      {}
      <View style={styles.skeletonContent}>
        <View style={styles.skeletonSectionTitle} />
        <View style={styles.skeletonSectionSubtitle} />
        
        {}
        <View style={styles.skeletonModules}>
          <SkeletonModuleCard />
          <SkeletonModuleCard />
          <SkeletonModuleCard />
        </View>

        {}
        <View style={styles.skeletonResourcesGrid}>
          <SkeletonResourceCard />
          <SkeletonResourceCard />
          <SkeletonResourceCard />
          <SkeletonResourceCard />
        </View>
      </View>
    </View>
  );
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
    width: 200,
    height: 24,
    backgroundColor: '#e2e8f0',
    borderRadius: 6,
  },
  skeletonHeroSection: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 24,
  },
  skeletonHeroContent: {
    flex: 2,
    gap: 16,
  },
  skeletonSidebar: {
    flex: 1,
    minWidth: 280,
  },
  skeletonBadge: {
    width: 100,
    height: 24,
    backgroundColor: '#e2e8f0',
    borderRadius: 12,
  },
  skeletonCourseTitle: {
    width: '80%',
    height: 32,
    backgroundColor: '#e2e8f0',
    borderRadius: 6,
  },
  skeletonCourseDescription: {
    width: '100%',
    height: 60,
    backgroundColor: '#e2e8f0',
    borderRadius: 6,
  },
  skeletonCourseMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  skeletonMetaItem: {
    width: 80,
    height: 20,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
  },
  skeletonProgressCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    gap: 12,
  },
  skeletonProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  skeletonProgressLabel: {
    width: 120,
    height: 20,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
  },
  skeletonProgressPercentage: {
    width: 40,
    height: 20,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
  },
  skeletonProgressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
  },
  skeletonProgressFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  skeletonProgressSubtext: {
    width: 100,
    height: 14,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
  },
  skeletonActionCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    gap: 16,
  },
  skeletonStatusBadge: {
    width: 100,
    height: 32,
    backgroundColor: '#e2e8f0',
    borderRadius: 6,
  },
  skeletonPrimaryAction: {
    width: '100%',
    height: 44,
    backgroundColor: '#e2e8f0',
    borderRadius: 8,
  },
  skeletonSecondaryAction: {
    width: '100%',
    height: 44,
    backgroundColor: '#e2e8f0',
    borderRadius: 8,
  },
  skeletonSidebarDivider: {
    height: 1,
    backgroundColor: '#e2e8f0',
  },
  skeletonSidebarStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  skeletonStat: {
    alignItems: 'center',
    gap: 4,
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
  skeletonContent: {
    gap: 16,
  },
  skeletonSectionTitle: {
    width: 200,
    height: 24,
    backgroundColor: '#e2e8f0',
    borderRadius: 6,
  },
  skeletonSectionSubtitle: {
    width: 300,
    height: 16,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
  },
  skeletonModules: {
    gap: 16,
  },
  skeletonModuleCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
  },
  skeletonModuleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  skeletonModuleIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#e2e8f0',
    borderRadius: 20,
  },
  skeletonModuleContent: {
    flex: 1,
    gap: 8,
  },
  skeletonModuleTitle: {
    width: '70%',
    height: 20,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
  },
  skeletonModuleMeta: {
    width: '50%',
    height: 16,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
  },
  skeletonModuleProgress: {
    width: '100%',
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
  },
  skeletonModuleStatus: {
    width: 80,
    height: 20,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
  },
  skeletonResourcesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  skeletonResourceCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    width: (width - 80) / 2,
    minWidth: 300,
    gap: 16,
  },
  skeletonResourceIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#e2e8f0',
    borderRadius: 8,
  },
  skeletonResourceContent: {
    flex: 1,
    gap: 8,
  },
  skeletonResourceTitle: {
    width: '80%',
    height: 16,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
  },
  skeletonResourceMeta: {
    width: '60%',
    height: 14,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
  },
  skeletonDownloadButton: {
    width: 36,
    height: 36,
    backgroundColor: '#e2e8f0',
    borderRadius: 6,
  },
});