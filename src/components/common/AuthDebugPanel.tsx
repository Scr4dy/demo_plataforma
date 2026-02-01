
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { getSessionDebugInfo, clearAuthStorage } from '../../utils/authUtils';
import { Ionicons } from '@expo/vector-icons';

export function AuthDebugPanel() {
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const loadSessionInfo = async () => {
    setLoading(true);
    try {
      const info = await getSessionDebugInfo();
      setSessionInfo(info);
    } catch (error) {
      
    } finally {
      setLoading(false);
    }
  };

  const handleClearStorage = () => {
    Alert.alert(
      '🧹 Limpiar Almacenamiento',
      '¿Estás seguro? Esto cerrará tu sesión y eliminará todos los tokens.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpiar',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAuthStorage();
              Alert.alert('✅ Éxito', 'Almacenamiento limpiado. Vuelve a iniciar sesión.');
            } catch (error: any) {
              Alert.alert('❌ Error', error.message || 'No se pudo limpiar');
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    if (expanded) {
      loadSessionInfo();
    }
  }, [expanded]);

  if (!expanded) {
    return (
      <TouchableOpacity
        style={styles.collapsedButton}
        onPress={() => setExpanded(true)}
      >
        <Ionicons name="bug" size={20} color="#fff" />
        <Text style={styles.collapsedText}>Debug Auth</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="bug" size={20} color="#fff" />
          <Text style={styles.headerTitle}>Auth Debug Panel</Text>
        </View>
        <TouchableOpacity onPress={() => setExpanded(false)}>
          <Ionicons name="close" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {loading ? (
          <Text style={styles.loadingText}>Cargando...</Text>
        ) : sessionInfo ? (
          <View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Estado:</Text>
              <Text
                style={[
                  styles.value,
                  sessionInfo.hasSession ? styles.successText : styles.errorText,
                ]}
              >
                {sessionInfo.hasSession ? '✅ Conectado' : '❌ Desconectado'}
              </Text>
            </View>

            {sessionInfo.hasSession && (
              <>
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Email:</Text>
                  <Text style={styles.value}>{sessionInfo.email}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.label}>User ID:</Text>
                  <Text style={styles.valueSmall}>{sessionInfo.userId}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.label}>Expira en:</Text>
                  <Text style={styles.value}>
                    {Math.floor(sessionInfo.timeUntilExpirySeconds / 60)} min
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.label}>¿Expirado?:</Text>
                  <Text
                    style={[
                      styles.value,
                      sessionInfo.isExpired ? styles.errorText : styles.successText,
                    ]}
                  >
                    {sessionInfo.isExpired ? '❌ Sí' : '✅ No'}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.label}>Refresh Token:</Text>
                  <Text
                    style={[
                      styles.value,
                      sessionInfo.hasRefreshToken
                        ? styles.successText
                        : styles.errorText,
                    ]}
                  >
                    {sessionInfo.hasRefreshToken ? '✅ Presente' : '❌ Ausente'}
                  </Text>
                </View>
              </>
            )}

            {sessionInfo.error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorTitle}>Error:</Text>
                <Text style={styles.errorMessage}>{sessionInfo.error}</Text>
              </View>
            )}
          </View>
        ) : (
          <Text style={styles.noDataText}>No hay información disponible</Text>
        )}
      </ScrollView>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={loadSessionInfo}
          disabled={loading}
        >
          <Ionicons name="refresh" size={18} color="#fff" />
          <Text style={styles.buttonText}>Recargar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.clearButton}
          onPress={handleClearStorage}
        >
          <Ionicons name="trash" size={18} color="#fff" />
          <Text style={styles.buttonText}>Limpiar Storage</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  collapsedButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#ff6b6b',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    gap: 8,
    zIndex: 9999,
  },
  collapsedText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  container: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 320,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    zIndex: 9999,
    maxHeight: 500,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  content: {
    padding: 16,
    maxHeight: 350,
  },
  loadingText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
  },
  noDataText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
    fontStyle: 'italic',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  value: {
    fontSize: 14,
    color: '#666',
    maxWidth: 180,
  },
  valueSmall: {
    fontSize: 10,
    color: '#666',
    maxWidth: 180,
  },
  successText: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  errorText: {
    color: '#f44336',
    fontWeight: 'bold',
  },
  errorBox: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#ffebee',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#f44336',
    marginBottom: 4,
  },
  errorMessage: {
    fontSize: 12,
    color: '#c62828',
  },
  actions: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  refreshButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196F3',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  clearButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f44336',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
});

export default AuthDebugPanel;
