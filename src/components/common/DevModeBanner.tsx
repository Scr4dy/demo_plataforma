import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppConfig } from '../../config/appConfig';

export const DevModeBanner: React.FC = () => {
  const [visible, setVisible] = React.useState(true);

  if (!AppConfig.useMockData || !visible) {
    return null;
  }

  return (
    <View style={styles.banner}>
      <View style={styles.content}>
        <Ionicons name="code-slash" size={16} color="#FBBF24" />
        <Text style={styles.text}>
          Modo de prueba
        </Text>
      </View>
      <TouchableOpacity onPress={() => setVisible(false)} style={styles.closeButton}>
        <Ionicons name="close" size={16} color="#FBBF24" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#451A03',
    borderBottomWidth: 1,
    borderBottomColor: '#78350F',
    paddingVertical: 6,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  text: {
    color: '#FBBF24',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'System'
  },
  closeButton: {
    padding: 4
  }
});
