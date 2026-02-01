
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  useWindowDimensions,
  Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface TeamAlert {
  id: string;
  teamName: string;
  alertType: 'incident' | 'maintenance' | 'update' | 'info';
  message: string;
  timestamp: Date;
  status: 'active' | 'pending' | 'resolved';
  assignedTo?: string;
}

interface TeamAlertCardProps {
  alert: TeamAlert;
  onPress: (alert: TeamAlert) => void;
  onAssign: (alertId: string) => void;
  getAlertIcon?: (type: string) => string;
  getStatusColor?: (status: string) => string;
  formatDate?: (date: Date | string) => string;
  isMobile?: boolean;
}

export const TeamAlertCard: React.FC<TeamAlertCardProps> = ({
  alert,
  onPress,
  onAssign,
  getAlertIcon = (type) => {
    switch (type) {
      case 'incident': return 'warning';
      case 'maintenance': return 'construct';
      case 'update': return 'refresh';
      case 'info': return 'information-circle';
      default: return 'notifications';
    }
  },
  getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#e53e3e';
      case 'pending': return '#dd6b20';
      case 'resolved': return '#38a169';
      default: return '#718096';
    }
  },
  formatDate = (date) => {
    if (!date) return 'Fecha no disponible';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    
    if (isNaN(dateObj.getTime())) {
      return 'Fecha inválida';
    }
    
    return dateObj.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },
  isMobile = false
}) => {
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 375;

  
  const colors = {
    card: '#ffffff',
    text: '#333333',
    textSecondary: '#666666',
    primary: '#2196F3'
  };

  
  const getTeamInitials = (teamName: string | undefined): string => {
    if (!teamName || typeof teamName !== 'string' || teamName.trim() === '') {
      return 'TM';
    }
    
    return teamName
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handlePress = () => {
    onPress(alert);
  };

  const handleAssignPress = () => {
    onAssign(alert.id);
  };

  const statusColor = getStatusColor(alert.status);
  const alertIcon = getAlertIcon(alert.alertType);

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: colors.card },
        isMobile && styles.mobileContainer,
        isSmallScreen && styles.smallContainer
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {}
      <View style={styles.header}>
        <View style={styles.teamInfo}>
          <View 
            style={[
              styles.teamAvatar,
              { backgroundColor: `${statusColor}20` } 
            ]}
          >
            <Text style={[styles.teamInitials, { color: statusColor }]}>
              {getTeamInitials(alert.teamName)}
            </Text>
          </View>
          <View style={styles.teamText}>
            <Text 
              style={[styles.teamName, { color: colors.text }]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {alert.teamName || 'Equipo'}
            </Text>
            <Text style={[styles.alertType, { color: colors.textSecondary }]}>
              {alert.alertType === 'incident' && 'Incidente'}
              {alert.alertType === 'maintenance' && 'Mantenimiento'}
              {alert.alertType === 'update' && 'Actualización'}
              {alert.alertType === 'info' && 'Información'}
            </Text>
          </View>
        </View>
        
        <View style={styles.statusContainer}>
          <View 
            style={[
              styles.statusBadge,
              { backgroundColor: `${statusColor}20` }
            ]}
          >
            <Text style={[styles.statusText, { color: statusColor }]}>
              {alert.status === 'active' && 'Activo'}
              {alert.status === 'pending' && 'Pendiente'}
              {alert.status === 'resolved' && 'Resuelto'}
            </Text>
          </View>
        </View>
      </View>

      {}
      <Text 
        style={[
          styles.message,
          { color: colors.text },
          isMobile && styles.mobileMessage
        ]}
        numberOfLines={3}
      >
        {alert.message}
      </Text>

      {}
      <View style={styles.footer}>
        <View style={styles.timestamp}>
          <Ionicons 
            name="time" 
            size={14} 
            color={colors.textSecondary} 
          />
          <Text style={[styles.timestampText, { color: colors.textSecondary }]}>
            {formatDate(alert.timestamp)}
          </Text>
        </View>

        {alert.assignedTo && (
          <View style={styles.assignedTo}>
            <Ionicons 
              name="person" 
              size={14} 
              color={colors.textSecondary} 
            />
            <Text 
              style={[styles.assignedText, { color: colors.textSecondary }]}
              numberOfLines={1}
            >
              {alert.assignedTo}
            </Text>
          </View>
        )}

        {!alert.assignedTo && alert.status === 'active' && (
          <TouchableOpacity
            style={styles.assignButton}
            onPress={handleAssignPress}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons 
              name="person-add" 
              size={16} 
              color={colors.primary} 
            />
            <Text style={[styles.assignText, { color: colors.primary }]}>
              Asignar
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {}
      <View style={styles.alertIcon}>
        <Ionicons 
          name={alertIcon as any} 
          size={20} 
          color={statusColor} 
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    ...Platform.select({
      web: {
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  teamInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  teamAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  teamInitials: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  teamText: {
    flex: 1,
  },
  teamName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  alertType: {
    fontSize: 12,
    textTransform: 'capitalize',
  },
  statusContainer: {
    flexShrink: 0,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  mobileMessage: {
    fontSize: 13,
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  timestamp: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 1,
  },
  timestampText: {
    fontSize: 12,
  },
  assignedTo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 1,
    flex: 1,
  },
  assignedText: {
    fontSize: 12,
    flexShrink: 1,
  },
  assignButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
    flexShrink: 0,
  },
  assignText: {
    fontSize: 12,
    fontWeight: '500',
  },
  alertIcon: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
});

export default TeamAlertCard;