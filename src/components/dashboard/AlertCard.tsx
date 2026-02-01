
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface Alert {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  timestamp: string | Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
}

interface AlertCardProps {
  alert: Alert;
  onPress?: (alert: Alert) => void;
  onDismiss?: (alertId: string) => void;
}

export const AlertCard: React.FC<AlertCardProps> = ({ 
  alert, 
  onPress, 
  onDismiss 
}) => {
  
  const colors = {
    error: '#e53e3e',
    warning: '#dd6b20',
    success: '#38a169',
    info: '#3182ce',
    primary: '#2196F3',
    text: '#333333',
    textSecondary: '#666666',
    textTertiary: '#999999'
  };

  const getTypeStyles = () => {
    switch (alert.type) {
      case 'error':
        return {
          backgroundColor: colors.error + '20',
          borderColor: colors.error,
          icon: 'warning' as const,
          iconColor: colors.error
        };
      case 'warning':
        return {
          backgroundColor: colors.warning + '20',
          borderColor: colors.warning,
          icon: 'warning' as const,
          iconColor: colors.warning
        };
      case 'success':
        return {
          backgroundColor: colors.success + '20',
          borderColor: colors.success,
          icon: 'checkmark-circle' as const,
          iconColor: colors.success
        };
      case 'info':
      default:
        return {
          backgroundColor: colors.info + '20',
          borderColor: colors.info,
          icon: 'information-circle' as const,
          iconColor: colors.info
        };
    }
  };

  const getPriorityStyles = () => {
    switch (alert.priority) {
      case 'high':
        return {
          color: colors.error,
          label: 'ALTA'
        };
      case 'medium':
        return {
          color: colors.warning,
          label: 'MEDIA'
        };
      case 'low':
      default:
        return {
          color: colors.info,
          label: 'BAJA'
        };
    }
  };

  const typeStyles = getTypeStyles();
  const priorityStyles = getPriorityStyles();

  const formatTime = (timestamp: string | Date) => {
    try {
      const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
      if (isNaN(date.getTime())) {
        return '--:--';
      }
      return date.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch (error) {
      return '--:--';
    }
  };

  const handlePress = () => {
    onPress?.(alert);
  };

  const handleDismiss = () => {
    onDismiss?.(alert.id);
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: typeStyles.backgroundColor,
          borderLeftColor: typeStyles.borderColor,
        },
        !alert.read && styles.unread
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Ionicons 
            name={typeStyles.icon} 
            size={20} 
            color={typeStyles.iconColor} 
          />
          <Text style={[styles.title, { color: colors.text }]}>
            {alert.title}
          </Text>
        </View>
        
        <View style={styles.metaContainer}>
          <View style={[
            styles.priorityBadge, 
            { backgroundColor: priorityStyles.color + '20' }
          ]}>
            <Text style={[styles.priorityText, { color: priorityStyles.color }]}>
              {priorityStyles.label}
            </Text>
          </View>
          {onDismiss && (
            <TouchableOpacity 
              onPress={handleDismiss}
              style={styles.dismissButton}
            >
              <Ionicons 
                name="close" 
                size={16} 
                color={colors.textSecondary} 
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <Text style={[styles.message, { color: colors.textSecondary }]}>
        {alert.message}
      </Text>

      <View style={styles.footer}>
        <Text style={[styles.timestamp, { color: colors.textTertiary }]}>
          {formatTime(alert.timestamp)}
        </Text>
        {!alert.read && (
          <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    marginVertical: 4,
    marginHorizontal: 16,
  },
  unread: {
    opacity: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '700',
  },
  dismissButton: {
    padding: 2,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timestamp: {
    fontSize: 12,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

export default AlertCard;