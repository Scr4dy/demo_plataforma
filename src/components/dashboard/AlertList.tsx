
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  useWindowDimensions,
  Platform 
} from 'react-native';
import { AlertCard, Alert } from './AlertCard';
import type { DashboardUIHelpers } from '../../types/dashboard.types';

interface AlertListProps {
  alerts: Alert[];
  onAlertPress: (alert: Alert) => void;
  isMobile?: boolean;
  getStatusColor?: (status: string) => string;
  getCourseIcon?: (status: string) => string;
  getDaysUntilExpiry?: (expiryDate?: string) => number;
  formatDate?: (iso?: string) => string;
  getAlertIcon?: (type: string) => string;
  getActionIcon?: (actionType: string) => string;
}

export const AlertList: React.FC<AlertListProps> = ({ 
  alerts,
  onAlertPress,
  getAlertIcon,
  formatDate,
  isMobile = false 
}) => {
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 375;

  const handleAlertDismiss = (alertId: string) => {
  };

  return (
    <View style={styles.container}>
      <View style={[
        styles.header, 
        { borderBottomColor: '#e0e0e0' }, 
        isMobile && styles.mobileHeader
      ]}>
        <Text style={[
          styles.title, 
          { color: '#333333' }, 
          isMobile && styles.mobileTitle
        ]}>
          Alertas del Sistema
        </Text>
        <Text style={[
          styles.subtitle, 
          { color: '#666666' }, 
          isMobile && styles.mobileSubtitle
        ]}>
          {alerts.filter(alert => !alert.read).length} sin leer
        </Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        decelerationRate="normal"
        keyboardShouldPersistTaps="handled"
        
        scrollEnabled={false}
        nestedScrollEnabled={false}
      >
        {alerts.map((alert) => (
          <View 
            key={alert.id} 
            style={[
              styles.alertItem,
              isMobile && styles.mobileAlertItem
            ]}
          >
            <AlertCard
              alert={alert}
              onPress={onAlertPress}
              onDismiss={handleAlertDismiss}
            />
          </View>
        ))}
        
        {alerts.length === 0 && (
          <View style={[
            styles.emptyState,
            isMobile && styles.mobileEmptyState
          ]}>
            <Text style={[
              styles.emptyText, 
              { color: '#666666' }, 
              isMobile && styles.mobileEmptyText
            ]}>
              No hay alertas en este momento
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
  },
  mobileHeader: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  mobileTitle: {
    fontSize: 16,
  },
  subtitle: {
    fontSize: 14,
  },
  mobileSubtitle: {
    fontSize: 13,
  },
  scrollView: {
    flex: 1,
  },
  alertItem: {
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  mobileAlertItem: {
    marginBottom: 6,
    paddingHorizontal: 12,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  mobileEmptyState: {
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  mobileEmptyText: {
    fontSize: 14,
  },
});