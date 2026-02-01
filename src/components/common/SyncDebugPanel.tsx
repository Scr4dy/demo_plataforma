

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNetworkSync } from '../../hooks/useNetworkSync';
import { offlineCacheService } from '../../services/offlineCacheService';
import { syncQueueService } from '../../services/syncQueueService';

export function SyncDebugPanel() {
  const { syncState, syncNow, retryFailed, clearCompleted, getStats } = useNetworkSync();
  const [cacheStats, setCacheStats] = useState<any>(null);
  const [syncStats, setSyncStats] = useState<any>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (isExpanded) {
      loadStats();
    }
  }, [isExpanded, syncState]);

  const loadStats = async () => {
    const cache = await offlineCacheService.getStats();
    const sync = getStats();
    setCacheStats(cache);
    setSyncStats(sync);
  };

  const handleClearCache = () => {
    Alert.alert(
      'Limpiar Caché',
      '¿Estás seguro de que deseas eliminar todos los datos en caché?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpiar',
          style: 'destructive',
          onPress: async () => {
            await offlineCacheService.clear();
            loadStats();
            Alert.alert('Éxito', 'Caché limpiado correctamente');
          },
        },
      ]
    );
  };

  const handleClearQueue = () => {
    Alert.alert(
      'Limpiar Cola',
      '¿Estás seguro de que deseas eliminar todas las acciones de la cola?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpiar',
          style: 'destructive',
          onPress: async () => {
            await syncQueueService.clearAll();
            loadStats();
            Alert.alert('Éxito', 'Cola limpiada correctamente');
          },
        },
      ]
    );
  };

  const handleCleanup = async () => {
    const removed = await offlineCacheService.cleanup();
    Alert.alert('Limpieza Completada', `Se eliminaron ${removed} entradas obsoletas`);
    loadStats();
  };

  if (!isExpanded) {
    return (
      <TouchableOpacity
        style={styles.collapsedButton}
        onPress={() => setIsExpanded(true)}
      >
        <Ionicons name="bug" size={20} color="#fff" />
        <Text style={styles.collapsedText}>Debug Sync</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="bug" size={24} color="#fff" />
          <Text style={styles.title}>Sync Debug Panel</Text>
        </View>
        <TouchableOpacity onPress={() => setIsExpanded(false)}>
          <Ionicons name="close" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🌐 Estado de Red</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Conexión:</Text>
            <Text style={[styles.value, { color: syncState.isOnline ? '#4CAF50' : '#f44336' }]}>
              {syncState.isOnline ? 'Online' : 'Offline'}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Sincronizando:</Text>
            <Text style={styles.value}>{syncState.isSyncing ? 'Sí' : 'No'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Última sincronización:</Text>
            <Text style={styles.value}>
              {syncState.lastSyncTime
                ? new Date(syncState.lastSyncTime).toLocaleTimeString()
                : 'Nunca'}
            </Text>
          </View>
        </View>

        {}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Cola de Sincronización</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Acciones pendientes:</Text>
            <Text style={styles.value}>{syncState.pendingActions}</Text>
          </View>
          {syncStats && (
            <>
              <View style={styles.row}>
                <Text style={styles.label}>Total acciones:</Text>
                <Text style={styles.value}>{syncStats.totalActions}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Completadas:</Text>
                <Text style={styles.value}>{syncStats.completedActions}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Fallidas:</Text>
                <Text style={[styles.value, { color: syncStats.failedActions > 0 ? '#f44336' : '#666' }]}>
                  {syncStats.failedActions}
                </Text>
              </View>
            </>
          )}
        </View>

        {}
        {cacheStats && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💾 Estadísticas de Caché</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Entradas:</Text>
              <Text style={styles.value}>{cacheStats.entries}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Hits:</Text>
              <Text style={styles.value}>{cacheStats.hits}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Misses:</Text>
              <Text style={styles.value}>{cacheStats.misses}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Hit Rate:</Text>
              <Text style={styles.value}>{(cacheStats.hitRate * 100).toFixed(1)}%</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Última limpieza:</Text>
              <Text style={styles.value}>
                {cacheStats.lastCleanup
                  ? new Date(cacheStats.lastCleanup).toLocaleTimeString()
                  : 'Nunca'}
              </Text>
            </View>
          </View>
        )}

        {}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚙️ Acciones</Text>
          
          <TouchableOpacity style={styles.button} onPress={syncNow}>
            <Ionicons name="sync" size={20} color="#fff" />
            <Text style={styles.buttonText}>Sincronizar Ahora</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={retryFailed}>
            <Ionicons name="refresh" size={20} color="#fff" />
            <Text style={styles.buttonText}>Reintentar Fallidas</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={clearCompleted}>
            <Ionicons name="checkmark-done" size={20} color="#fff" />
            <Text style={styles.buttonText}>Limpiar Completadas</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={handleCleanup}>
            <Ionicons name="trash" size={20} color="#fff" />
            <Text style={styles.buttonText}>Limpiar Obsoletas</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.dangerButton]} onPress={handleClearCache}>
            <Ionicons name="trash-bin" size={20} color="#fff" />
            <Text style={styles.buttonText}>Limpiar Todo Caché</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.dangerButton]} onPress={handleClearQueue}>
            <Ionicons name="close-circle" size={20} color="#fff" />
            <Text style={styles.buttonText}>Limpiar Toda Cola</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  collapsedButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#9C27B0',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    zIndex: 1000,
  },
  collapsedText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  container: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 350,
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 1000,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#9C27B0',
    padding: 16,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    maxHeight: 500,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: '#666',
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    gap: 8,
  },
  dangerButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
