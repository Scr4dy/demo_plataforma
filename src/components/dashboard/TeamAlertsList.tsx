
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { TeamAlertCard, TeamAlert } from './TeamAlertCard';
import type { DashboardUIHelpers } from '../../types/dashboard.types';

interface TeamAlertsListProps {
  alerts: TeamAlert[];
  onTeamAlertPress: (alert: TeamAlert) => void;
  isMobile?: boolean;
  getStatusColor?: (status: string) => string;
  getCourseIcon?: (status: string) => string;
  getDaysUntilExpiry?: (expiryDate?: string) => number;
  formatDate?: (iso?: string) => string;
  getAlertIcon?: (type: string) => string;
  getActionIcon?: (actionType: string) => string;
}

export const TeamAlertsList: React.FC<TeamAlertsListProps> = ({
  alerts,
  onTeamAlertPress,
  getAlertIcon,
  getStatusColor,
  formatDate,
  isMobile = false
}) => {
  const handleAlertAssign = (alertId: string) => {
  };

  const activeAlerts = alerts.filter(alert => alert.status === 'active');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: '#333333' }]}>
          Alertas de Equipos
        </Text>
        <Text style={[styles.subtitle, { color: '#666666' }]}>
          {activeAlerts.length} activas
        </Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
        nestedScrollEnabled={false}
      >
        {alerts.map((alert) => (
          <TeamAlertCard
            key={alert.id}
            alert={alert}
            onPress={onTeamAlertPress}
            onAssign={handleAlertAssign}
            getAlertIcon={getAlertIcon}
            getStatusColor={getStatusColor}
            formatDate={formatDate as any}
            isMobile={isMobile}
          />
        ))}
        
        {alerts.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: '#666666' }]}>
              No hay alertas de equipos
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});