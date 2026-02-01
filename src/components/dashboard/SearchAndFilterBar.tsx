
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Searchbar, IconButton, Chip, Text } from 'react-native-paper';

interface SearchAndFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeFilters: any;
  onFilterChange: (filters: any) => void;
  onResetFilters: () => void;
  filterOptions: any;
  searchResultsCount: number;
  hasActiveFilters: boolean;
  isTablet?: boolean;
  
  onToggleAdvancedFilters?: () => void;
  showAdvancedFilters?: boolean;
}

export const SearchAndFilterBar: React.FC<SearchAndFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  activeFilters,
  onFilterChange,
  onResetFilters,
  filterOptions,
  searchResultsCount,
  hasActiveFilters,
  isTablet,
  onToggleAdvancedFilters,
  showAdvancedFilters
}) => {
  return (
    <View style={[styles.container, isTablet && styles.tabletContainer]}>
      {}
      <View style={styles.searchRow}>
        <Searchbar
          placeholder="Buscar cursos, certificados..."
          onChangeText={onSearchChange}
          value={searchQuery}
          style={[styles.searchbar, isTablet && styles.tabletSearchbar]}
          icon={hasActiveFilters ? "filter" : "magnify"}
          onIconPress={onToggleAdvancedFilters}
        />
        
        {}
        <IconButton
          icon={showAdvancedFilters ? "filter-remove" : "filter"}
          size={24}
          mode={hasActiveFilters ? "contained" : "outlined"}
          onPress={onToggleAdvancedFilters}
          style={styles.filterButton}
        />
      </View>

      {}
      {(searchQuery || hasActiveFilters) && (
        <View style={styles.resultsInfo}>
          <Text variant="bodySmall" style={styles.resultsText}>
            {searchResultsCount} resultado{searchResultsCount !== 1 ? 's' : ''} encontrado{searchResultsCount !== 1 ? 's' : ''}
          </Text>
          
          {hasActiveFilters && (
            <Chip
              mode="outlined"
              onClose={onResetFilters}
              style={styles.clearFilterChip}
            >
              Limpiar filtros
            </Chip>
          )}
        </View>
      )}
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
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  searchbar: {
    flex: 1,
    elevation: 0,
    backgroundColor: '#f8fafc'
  },
  tabletSearchbar: {
    height: 50
  },
  filterButton: {
    margin: 0
  },
  resultsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8
  },
  resultsText: {
    color: '#64748b'
  },
  clearFilterChip: {
    height: 32
  }
});