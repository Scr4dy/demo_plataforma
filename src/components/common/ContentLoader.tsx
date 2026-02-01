
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export function ContentLoader({ type = 'card', count = 1 }: { type?: 'card' | 'list' | 'grid', count?: number }) {
  const { theme } = useTheme();
  
  const LoaderItem = () => (
    <View style={[
      styles.loaderItem,
      { backgroundColor: theme.colors.card },
      type === 'card' && styles.cardLoader,
      type === 'list' && styles.listLoader,
      type === 'grid' && styles.gridLoader,
    ]}>
      <View style={[styles.shimmer, { backgroundColor: theme.colors.border }]} />
    </View>
  );

  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, index) => (
        <LoaderItem key={index} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loaderItem: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  cardLoader: {
    height: 120,
  },
  listLoader: {
    height: 80,
  },
  gridLoader: {
    height: 100,
    aspectRatio: 1,
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.3,
  },
});