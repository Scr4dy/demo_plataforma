
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Chip } from 'react-native-paper';

interface AdvancedFiltersProps {
  activeFilters: any;
  onFilterChange: (filters: any) => void;
  availableFilters: any;
  isTablet?: boolean;
}

export const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  activeFilters,
  onFilterChange,
  availableFilters,
  isTablet
}) => {
  const filterCategories = [
    {
      key: 'status',
      label: 'Estado',
      options: availableFilters.status || []
    },
    {
      key: 'category',
      label: 'Categoría',
      options: availableFilters.categories || []
    },
    {
      key: 'duration',
      label: 'Duración',
      options: [
        { label: 'Corto (<1h)', value: 'short' },
        { label: 'Medio (1-3h)', value: 'medium' },
        { label: 'Largo (>3h)', value: 'long' }
      ]
    },
    {
      key: 'priority',
      label: 'Prioridad',
      options: [
        { label: 'Alta', value: 'high' },
        { label: 'Media', value: 'medium' },
        { label: 'Baja', value: 'low' }
      ]
    }
  ];

  const toggleFilter = (category: string, value: string) => {
    const currentFilters = activeFilters[category] || [];
    const updatedFilters = currentFilters.includes(value)
      ? currentFilters.filter((item: string) => item !== value)
      : [...currentFilters, value];
    
    onFilterChange({
      ...activeFilters,
      [category]: updatedFilters
    });
  };

  return (
    <View style={[styles.container, isTablet && styles.tabletContainer]}>
      {filterCategories.map(category => (
        <View key={category.key} style={styles.category}>
          <Text style={styles.categoryLabel}>{category.label}</Text>
          <View style={styles.chipsContainer}>
            {category.options.map((option: any) => (
              <Chip
                key={option.value}
                selected={activeFilters[category.key]?.includes(option.value)}
                onPress={() => toggleFilter(category.key, option.value)}
                style={styles.chip}
                mode="outlined"
              >
                {option.label}
              </Chip>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0'
  },
  tabletContainer: {
    padding: 20
  },
  category: {
    marginBottom: 16
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4a5568',
    marginBottom: 8
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  chip: {
    marginRight: 8,
    marginBottom: 8
  }
});