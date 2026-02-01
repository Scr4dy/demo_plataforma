

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TypeIconBadgeProps {
  iconName: string;
  color: string;
  size?: number;
  backgroundColor?: string;
  style?: ViewStyle;
}

export const TypeIconBadge: React.FC<TypeIconBadgeProps> = ({
  iconName,
  color,
  size = 24,
  backgroundColor,
  style,
}) => {
  const bgColor = backgroundColor || `${color}15`;

  return (
    <View style={[styles.container, { backgroundColor: bgColor }, style]}>
      <Ionicons name={iconName as any} size={size} color={color} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
