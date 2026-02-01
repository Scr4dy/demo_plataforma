import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface SimpleHeaderProps {
  title: string;
  subtitle?: string;
  stats?: any;
}

export const SimpleHeader: React.FC<SimpleHeaderProps> = ({
  title,
  subtitle,
  stats
}) => {
  return (
    <View style={styles.header}>
      <View style={styles.titleSection}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>

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
                 key === 'passed' ? 'Aprobados' : key}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#2196F3',
    paddingTop: 60,
    paddingBottom: 20,
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
});