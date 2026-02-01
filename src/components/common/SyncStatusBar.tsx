

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNetworkSync } from '../../hooks/useNetworkSync';

interface SyncStatusBarProps {
  onPress?: () => void;
}

export function SyncStatusBar({ onPress }: SyncStatusBarProps) {
  const { syncState, syncNow, isRefreshing } = useNetworkSync();

  
  if (syncState.isOnline && !syncState.isSyncing && !syncState.hasErrors && syncState.pendingActions === 0) {
    return null;
  }

  const getMessage = () => {
    if (!syncState.isOnline) {
      return 'Trabajando sin conexión. Los cambios se sincronizarán automáticamente cuando vuelva la conexión.';
    }

    if (syncState.isSyncing) {
      return 'Sincronizando cambios...';
    }

    if (syncState.hasErrors) {
      return 'Error al sincronizar. Toca para reintentar.';
    }

    if (syncState.pendingActions > 0) {
      return `${syncState.pendingActions} cambio${syncState.pendingActions > 1 ? 's' : ''} pendiente${syncState.pendingActions > 1 ? 's' : ''} de sincronización`;
    }

    return '';
  };

  const getBackgroundColor = () => {
    if (!syncState.isOnline) return '#757575';
    if (syncState.hasErrors) return '#f44336';
    if (syncState.isSyncing) return '#2196F3';
    return '#FF9800';
  };

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (syncState.isOnline && !syncState.isSyncing && (syncState.hasErrors || syncState.pendingActions > 0)) {
      syncNow();
    }
  };

  const showSpinner = syncState.isSyncing || isRefreshing;
  const showIcon = !showSpinner;

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: getBackgroundColor() }]}
      onPress={handlePress}
      disabled={!syncState.isOnline || syncState.isSyncing}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        {showSpinner && (
          <ActivityIndicator size="small" color="#fff" />
        )}
        {showIcon && (
          <Ionicons
            name={
              !syncState.isOnline
                ? 'cloud-offline'
                : syncState.hasErrors
                ? 'alert-circle'
                : 'time'
            }
            size={20}
            color="#fff"
          />
        )}
        <Text style={styles.message} numberOfLines={2}>
          {getMessage()}
        </Text>
      </View>
      {syncState.isOnline && !syncState.isSyncing && syncState.pendingActions > 0 && (
        <Ionicons name="chevron-forward" size={20} color="#fff" />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  message: {
    color: '#fff',
    fontSize: 14,
    flex: 1,
    fontWeight: '500',
  },
});
