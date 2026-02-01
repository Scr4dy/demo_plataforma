
import React, { useState } from 'react';
import { 
  View, 
  TouchableOpacity, 
  StyleSheet, 
  Modal,
  Text
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

export const ThemeToggleFloating = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { theme, themeType, setThemeType, toggleTheme } = useTheme();
  const isDark = themeType === 'dark';

  return (
    <>
      {}
      <TouchableOpacity
        style={[
          styles.floatingButton,
          { 
            backgroundColor: theme.colors.primary,
          }
        ]}
        onPress={() => setIsModalVisible(true)}
      >
        <Ionicons 
          name={isDark ? "moon" : "sunny"} 
          size={24} 
          color="#ffffff" 
        />
      </TouchableOpacity>

      {}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[
            styles.modalContainer,
            { 
              backgroundColor: theme.colors.card,
            }
          ]}>
            <Text style={[
              styles.modalTitle,
              { color: theme.colors.text }
            ]}>
              Modo de Tema
            </Text>

            {}
            <TouchableOpacity
              style={[
                styles.option,
                themeType === 'light' && styles.optionActive
              ]}
              onPress={() => {
                setThemeType('light');
                setIsModalVisible(false);
              }}
            >
              <Ionicons 
                name="sunny" 
                size={24} 
                color={themeType === 'light' ? '#FFA000' : theme.colors.textSecondary} 
              />
              <Text style={[
                styles.optionText,
                { color: theme.colors.text }
              ]}>
                Modo Claro
              </Text>
              {themeType === 'light' && (
                <Ionicons name="checkmark" size={20} color={theme.colors.primary} />
              )}
            </TouchableOpacity>

            {}
            <TouchableOpacity
              style={[
                styles.option,
                themeType === 'dark' && styles.optionActive
              ]}
              onPress={() => {
                setThemeType('dark');
                setIsModalVisible(false);
              }}
            >
              <Ionicons 
                name="moon" 
                size={24} 
                color={themeType === 'dark' ? '#64B5F6' : theme.colors.textSecondary} 
              />
              <Text style={[
                styles.optionText,
                { color: theme.colors.text }
              ]}>
                Modo Oscuro
              </Text>
              {themeType === 'dark' && (
                <Ionicons name="checkmark" size={20} color={theme.colors.primary} />
              )}
            </TouchableOpacity>

            {}
            <TouchableOpacity
              style={[
                styles.option,
                themeType === 'auto' && styles.optionActive
              ]}
              onPress={() => {
                setThemeType('auto');
                setIsModalVisible(false);
              }}
            >
              <Ionicons 
                name="phone-portrait" 
                size={24} 
                color={themeType === 'auto' ? theme.colors.primary : theme.colors.textSecondary} 
              />
              <Text style={[
                styles.optionText,
                { color: theme.colors.text }
              ]}>
                Automático
                <Text style={styles.optionSubtext}>
                  {' '}({isDark ? 'Oscuro' : 'Claro'})
                </Text>
              </Text>
              {themeType === 'auto' && (
                <Ionicons name="checkmark" size={20} color={theme.colors.primary} />
              )}
            </TouchableOpacity>

            {}
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => setIsModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 9999,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalContainer: {
    width: 280,
    borderRadius: 16,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  optionActive: {
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
    borderColor: '#2196F3',
  },
  optionText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '500',
  },
  optionSubtext: {
    fontSize: 14,
    opacity: 0.7,
  },
  closeButton: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

