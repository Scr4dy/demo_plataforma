
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface NetworkStatusBarProps {
  isOnline?: boolean;
  message?: string;
}

export const NetworkStatusBar: React.FC<NetworkStatusBarProps> = ({ 
  isOnline = true, 
  message 
}) => {
  
  if (isOnline) {
    return null;
  }

  
  const statusMessage = message || '- Modo Demo - Sin conexión real';
  const backgroundColor = '#10b981'; 
  const textColor = '#ffffff';

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Text style={[styles.text, { color: textColor }]}>
        {statusMessage}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  text: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default NetworkStatusBar;