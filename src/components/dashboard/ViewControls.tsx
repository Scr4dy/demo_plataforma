
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { IconButton, Menu, Divider } from 'react-native-paper';

interface ViewControlsProps {
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  isTablet?: boolean;
}

export const ViewControls: React.FC<ViewControlsProps> = ({
  viewMode,
  onViewModeChange,
  sortBy,
  onSortChange,
  isTablet
}) => {
  const [sortMenuVisible, setSortMenuVisible] = React.useState(false);

  const sortOptions = [
    { label: 'Más reciente', value: 'recent', icon: 'calendar' },
    { label: 'Nombre A-Z', value: 'name-asc', icon: 'sort-alphabetical-ascending' },
    { label: 'Nombre Z-A', value: 'name-desc', icon: 'sort-alphabetical-descending' },
    { label: 'Fecha vencimiento', value: 'expiry', icon: 'clock-alert' },
    { label: 'Progreso', value: 'progress', icon: 'progress-check' }
  ];

  const getSortLabel = () => {
    return sortOptions.find(opt => opt.value === sortBy)?.label || 'Ordenar';
  };

  return (
    <View style={[styles.container, isTablet && styles.tabletContainer]}>
      {}
      <View style={styles.viewToggle}>
        <IconButton
          icon="view-grid"
          size={20}
          mode={viewMode === 'grid' ? 'contained' : 'outlined'}
          onPress={() => onViewModeChange('grid')}
        />
        <IconButton
          icon="view-list"
          size={20}
          mode={viewMode === 'list' ? 'contained' : 'outlined'}
          onPress={() => onViewModeChange('list')}
        />
      </View>

      <Divider style={styles.divider} />

      {}
      <Menu
        visible={sortMenuVisible}
        onDismiss={() => setSortMenuVisible(false)}
        anchor={
          <IconButton
            icon="sort"
            size={20}
            mode="outlined"
            onPress={() => setSortMenuVisible(true)}
          />
        }
      >
        {sortOptions.map(option => (
          <Menu.Item
            key={option.value}
            leadingIcon={option.icon}
            title={option.label}
            onPress={() => {
              onSortChange(option.value);
              setSortMenuVisible(false);
            }}
          />
        ))}
      </Menu>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    marginLeft: 8
  },
  tabletContainer: {
    paddingHorizontal: 12
  },
  viewToggle: {
    flexDirection: 'row'
  },
  divider: {
    height: 24,
    marginHorizontal: 4
  }
});