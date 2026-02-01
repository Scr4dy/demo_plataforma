
import React from 'react';
import { 
  View, 
  ScrollView,
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  useWindowDimensions,
  Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { QuickAction } from '../../types/dashboard.types';

interface QuickActionsBarProps {
  actions: QuickAction[];
  onActionPress: (action: QuickAction) => void;
  getActionIcon: (iconName: string) => string;
  isMobile?: boolean;
}

export const QuickActionsBar: React.FC<QuickActionsBarProps> = ({
  actions,
  onActionPress,
  getActionIcon,
  isMobile = false
}) => {
  const { width } = useWindowDimensions();
  const isIOS = Platform.OS === 'ios';
  const isSmallScreen = width < 375;

  
  return (
    <View style={[
      styles.container,
      isMobile && styles.mobileContainer,
    ]}>
      <Text style={[
        styles.title, 
        { color: '#333333' },
        isMobile && styles.mobileTitle
      ]}>
        Acciones Rápidas
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.actionsScrollContainer, isMobile && styles.mobileActionsContainer]}
      >
        {actions.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={[
              styles.actionButton, 
              { backgroundColor: '#ffffff' },
              isMobile && styles.mobileActionButton,
              isSmallScreen && styles.smallActionButton
            ]}
            onPress={() => onActionPress(action)}
            activeOpacity={0.7}
            
            hitSlop={{
              top: 8,
              bottom: 8,
              left: 8,
              right: 8,
            }}
          >
            <Ionicons 
              name={getActionIcon(action.icon ?? '') as any} 
              size={isSmallScreen ? 20 : (isMobile ? 22 : 24)} 
              color="#2196F3" 
            />
            <Text style={[
              styles.actionText, 
              { color: '#333333' },
              isMobile && styles.mobileActionText,
              isSmallScreen && styles.smallActionText
            ]}>
              {action.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  mobileContainer: {
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  mobileTitle: {
    fontSize: 15,
    marginBottom: 10,
  },
  actionsScrollContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    gap: 8,
  },
  mobileActionsContainer: {
    paddingHorizontal: 2,
  },
  actionButton: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    minHeight: 64,
    justifyContent: 'center',
    margin: 6,
    minWidth: 96,
    flexBasis: 'auto',
    flexGrow: 0,
    flexShrink: 1,
    alignSelf: 'flex-start',
    overflow: 'visible',
    
    ...Platform.select({
      web: {
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
      }
    })
  },
  mobileActionButton: {
    padding: 12,
    minHeight: 66,
    minWidth: '45%',
    flexBasis: '45%'
  },
  smallActionButton: {
    padding: 10,
    minHeight: 60,
    minWidth: '46%',
    flexBasis: '46%'
  },
  actionText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  mobileActionText: {
    fontSize: 11,
    marginTop: 6,
  },
  smallActionText: {
    fontSize: 10,
  },
});