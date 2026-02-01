

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNetworkSync } from '../../hooks/useNetworkSync';

interface SyncStatusBadgeProps {
  showLabel?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export function SyncStatusBadge({ showLabel = true, size = 'medium' }: SyncStatusBadgeProps) {
  const { syncState } = useNetworkSync();

  const getStatusInfo = () => {
    if (!syncState.isOnline) {
      return {
        icon: 'cloud-offline-outline' as const,
        color: '#757575',
        label: 'Sin conexión',
        backgroundColor: '#f5f5f5',
      };
    }

    if (syncState.isSyncing) {
      return {
        icon: 'sync' as const,
        color: '#2196F3',
        label: 'Sincronizando...',
        backgroundColor: '#E3F2FD',
      };
    }

    if (syncState.hasErrors) {
      return {
        icon: 'alert-circle-outline' as const,
        color: '#f44336',
        label: 'Error de sincronización',
        backgroundColor: '#FFEBEE',
      };
    }

    if (syncState.pendingActions > 0) {
      return {
        icon: 'time-outline' as const,
        color: '#FF9800',
        label: `${syncState.pendingActions} pendiente${syncState.pendingActions > 1 ? 's' : ''}`,
        backgroundColor: '#FFF3E0',
      };
    }

    return {
      icon: 'checkmark-circle-outline' as const,
      color: '#4CAF50',
      label: 'Sincronizado',
      backgroundColor: '#E8F5E9',
    };
  };

  const status = getStatusInfo();
  const iconSize = size === 'small' ? 16 : size === 'medium' ? 20 : 24;
  const fontSize = size === 'small' ? 12 : size === 'medium' ? 14 : 16;

  return (
    <View style={[styles.container, { backgroundColor: status.backgroundColor }]}>
      <Ionicons name={status.icon} size={iconSize} color={status.color} />
      {showLabel && (
        <Text style={[styles.label, { color: status.color, fontSize }]}>
          {status.label}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  label: {
    fontWeight: '500',
  },
});
