
import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions, Platform } from 'react-native';
import { DashboardStats as DashboardStatsType } from '../../types/dashboard.types';

interface DashboardStatsProps {
  stats: DashboardStatsType;
  isMobile?: boolean;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ stats, isMobile = false }) => {
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 375;

  
  const colors = {
    primary: '#2196F3',    
    success: '#10B981',    
    warning: '#F59E0B',    
    textSecondary: '#666666' 
  };

  const StatItem = ({ value, label, color }: { value: number; label: string; color: string }) => (
    <View style={[
      styles.statItem,
      isMobile && styles.mobileStatItem,
      isSmallScreen && styles.smallStatItem
    ]}>
      <Text style={[
        styles.statValue, 
        { color },
        isMobile && styles.mobileStatValue,
        isSmallScreen && styles.smallStatValue
      ]}>
        {value}
      </Text>
      <Text style={[
        styles.statLabel, 
        { color: colors.textSecondary },
        isMobile && styles.mobileStatLabel,
        isSmallScreen && styles.smallStatLabel
      ]}>
        {label}
      </Text>
    </View>
  );

  return (
    <View style={[
      styles.container, 
      { backgroundColor: '#ffffff' },
      isMobile && styles.mobileContainer,
      isSmallScreen && styles.smallContainer
    ]}>
      <Text style={[
        styles.title, 
        { color: '#333333' },
        isMobile && styles.mobileTitle,
        isSmallScreen && styles.smallTitle
      ]}>
        Estadísticas
      </Text>
      
      <View style={[
        styles.statsGrid,
        isMobile && styles.mobileStatsGrid
      ]}>
        <StatItem value={stats.totalCourses ?? 0} label="Total Cursos" color={colors.primary} />
        <StatItem value={stats.completedCourses ?? 0} label="Completados" color={colors.success} />
        <StatItem value={stats.inProgressCourses ?? 0} label="En Progreso" color={colors.warning} />
        <StatItem value={stats.pendingCourses ?? 0} label="Pendientes" color={colors.textSecondary} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    ...Platform.select({
      web: {
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      }
    })
  },
  mobileContainer: {
    padding: 12,
  },
  smallContainer: {
    padding: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  mobileTitle: {
    fontSize: 15,
    marginBottom: 12,
  },
  smallTitle: {
    fontSize: 14,
    marginBottom: 10,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  mobileStatsGrid: {
    gap: 8,
  },
  statItem: {
    flex: 1,
    minWidth: 80,
    alignItems: 'center',
    padding: 8,
  },
  mobileStatItem: {
    minWidth: 70,
    padding: 6,
  },
  smallStatItem: {
    minWidth: 60,
    padding: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  mobileStatValue: {
    fontSize: 18,
  },
  smallStatValue: {
    fontSize: 16,
  },
  statLabel: {
    fontSize: 10,
    textAlign: 'center',
    fontWeight: '500',
  },
  mobileStatLabel: {
    fontSize: 9,
  },
  smallStatLabel: {
    fontSize: 8,
  },
});

export default DashboardStats;