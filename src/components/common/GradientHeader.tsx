import React from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface GradientHeaderProps {
  title: string;
  subtitle?: string;
  stats?: any;
  showSearch?: boolean;
  onSearchChange?: (query: string) => void;
  searchPlaceholder?: string;
  actions?: React.ReactNode;
}

const GradientHeader: React.FC<GradientHeaderProps> = ({
  title,
  subtitle,
  stats,
  showSearch = false,
  onSearchChange,
  searchPlaceholder = "Buscar...",
  actions
}) => {
  return (
    <LinearGradient
      colors={['#2196F3', '#1976D2']}
      style={styles.gradient}
    >
      <View style={styles.container}>
        {}
        <View style={styles.titleSection}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>

        {}
        {stats && (
          <View style={styles.statsContainer}>
            {Object.entries(stats).map(([key, value]) => (
              <View key={key} style={styles.statItem}>
                <Text style={styles.statValue}>{String(value)}</Text>
                <Text style={styles.statLabel}>
                  {key === 'total' ? 'Total' :
                   key === 'active' ? 'Activos' :
                   key === 'expired' ? 'Expirados' :
                   key === 'pending' ? 'Pendientes' :
                   key === 'completed' ? 'Completados' :
                   key === 'needsAttention' ? 'Atención' :
                   key === 'certified' ? 'Certificados' :
                   key === 'passed' ? 'Aprobados' :
                   key}
                </Text>
              </View>
            ))}
          </View>
        )}

        {}
        {showSearch && (
          <View style={styles.searchContainer}>
            <View style={styles.searchInput}>
              <Ionicons name="search" size={20} color="#666" />
              <TextInput
                style={styles.input}
                placeholder={searchPlaceholder}
                placeholderTextColor="#999"
                onChangeText={onSearchChange}
              />
            </View>
          </View>
        )}

        {}
        {actions && (
          <View style={styles.actionsContainer}>
            {actions}
          </View>
        )}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    paddingTop: 60,
    paddingBottom: 20,
  },
  container: {
    paddingHorizontal: 20,
  },
  titleSection: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textTransform: 'uppercase',
  },
  searchContainer: {
    marginBottom: 8,
  },
  searchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  input: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
});

export { GradientHeader };