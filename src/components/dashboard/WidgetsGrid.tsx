
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WidgetType, WidgetConfig, useDashboardWidgets } from '../../hooks/useDashboardWidgets';

interface WidgetsGridProps {
  children: (widgets: WidgetConfig[]) => React.ReactNode;
  showEditButton?: boolean;
  onEditWidgets?: () => void;
  isMobile?: boolean;
}

export const WidgetsGrid: React.FC<WidgetsGridProps> = ({
  children,
  showEditButton = true,
  onEditWidgets
}) => {
  
  const colors = {
    primary: '#2196F3',
    primaryLight: '#E3F2FD',
    card: '#ffffff',
    text: '#333333',
    textSecondary: '#666666'
  };

  const {
    widgetsLayout,
    toggleEditMode,
    isWidgetVisible,
    visibleWidgetsCount
  } = useDashboardWidgets();

  const handleEditPress = () => {
    if (visibleWidgetsCount() === 0) {
      Alert.alert(
        'Sin Widgets Visibles',
        'No hay widgets visibles. ¿Quieres abrir el editor para activar algunos?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Abrir Editor', 
            onPress: () => {
              toggleEditMode();
              onEditWidgets?.();
            }
          }
        ]
      );
    } else {
      toggleEditMode();
      onEditWidgets?.();
    }
  };

  const visibleWidgets = widgetsLayout.widgets
    .filter(widget => widget.visible)
    .sort((a, b) => a.position - b.position);

  return (
    <View style={styles.container}>
      {}
      {showEditButton && (
        <View style={styles.gridHeader}>
          <View style={styles.spacer} />
          <TouchableOpacity
            style={[styles.editButton, { 
              backgroundColor: colors.card,
              
              ...Platform.select({
                web: {
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                },
                default: {
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.1,
                  shadowRadius: 2,
                  elevation: 2,
                }
              })
            }]}
            onPress={handleEditPress}
          >
            <Ionicons 
              name="options" 
              size={20} 
              color={colors.primary} 
            />
            <Text style={[styles.editButtonText, { color: colors.primary }]}>
              Personalizar
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {}
      {widgetsLayout.isEditing && (
        <View style={[styles.editModeBanner, { backgroundColor: colors.primaryLight }]}>
          <Ionicons name="construct" size={16} color={colors.primary} />
          <Text style={[styles.editModeText, { color: colors.primary }]}>
            Modo edición activado - Ve al editor para personalizar
          </Text>
        </View>
      )}

      {}
      <View style={styles.grid}>
        {children(visibleWidgets)}
      </View>

      {}
      {visibleWidgets.length === 0 && (
        <View style={styles.emptyState}>
          <Ionicons name="grid" size={64} color={colors.textSecondary} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            No hay widgets visibles
          </Text>
          <Text style={[styles.emptyMessage, { color: colors.textSecondary }]}>
            Personaliza tu dashboard activando algunos widgets
          </Text>
          <TouchableOpacity
            style={[styles.emptyButton, { backgroundColor: colors.primary }]}
            onPress={() => {
              toggleEditMode();
              onEditWidgets?.();
            }}
          >
            <Text style={styles.emptyButtonText}>
              Abrir Editor de Widgets
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gridHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  spacer: {
    
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  editModeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 16,
    
  },
  editModeText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    marginLeft: 8,
  },
  grid: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  emptyButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default WidgetsGrid;