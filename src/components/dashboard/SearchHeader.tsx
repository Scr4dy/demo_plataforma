
import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

interface SearchHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  placeholder?: string;
}

export const SearchHeader: React.FC<SearchHeaderProps> = React.memo(({
  searchQuery,
  onSearchChange,
  placeholder = "Buscar..."
}) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.searchContainer, { 
        backgroundColor: theme.colors.card,
        borderColor: theme.colors.border
      }]}>
        <MaterialIcons name="search" size={20} color={theme.colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: theme.colors.text }]}
          placeholder={placeholder}
          value={searchQuery}
          onChangeText={onSearchChange}
          placeholderTextColor={theme.colors.textSecondary}
        />
        {searchQuery.length > 0 && (
          <MaterialIcons 
            name="clear" 
            size={20} 
            color={theme.colors.textSecondary}
            onPress={() => onSearchChange('')}
          />
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
  },
});

export default SearchHeader;