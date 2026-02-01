
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface EmptyStateProps {
  title: string;
  message: string;
  icon: string;
  compact?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  message,
  icon,
  compact = false
}) => {
  return (
    <View style={[styles.container, compact && styles.compactContainer]}>
      <Ionicons name={icon as any} size={compact ? 48 : 64} color="#a0aec0" />
      <Text style={[styles.title, compact && styles.compactTitle]}>{title}</Text>
      <Text style={[styles.message, compact && styles.compactMessage]}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  compactContainer: {
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4a5568',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  compactTitle: {
    fontSize: 14,
    marginTop: 12,
  },
  message: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 20,
  },
  compactMessage: {
    fontSize: 12,
  },
});