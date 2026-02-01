import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View, GestureResponderEvent } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

type Variant = 'primary' | 'accent' | 'danger' | 'ghost' | 'neutral';

type Props = {
  variant?: Variant;
  onPress?: (e?: GestureResponderEvent) => void;
  style?: any;
  disabled?: boolean;
  loading?: boolean;
  children?: React.ReactNode;
  accessibilityLabel?: string;
};

export default function ThemedButton({ variant = 'primary', onPress, style, disabled = false, loading = false, children, accessibilityLabel }: Props) {
  const { theme, colors } = useTheme();

  let backgroundColor = 'transparent';
  let textColor = theme.colors.text;
  let borderColor = 'transparent';

  switch (variant) {
    case 'primary':
      backgroundColor = colors.primary ?? '#3182ce';
      textColor = theme.colors.card;
      break;
    case 'accent':
      backgroundColor = colors.accent ?? '#805ad5';
      textColor = theme.colors.card;
      break;
    case 'danger':
      backgroundColor = colors.error ?? '#e53e3e';
      textColor = theme.colors.card;
      break;
    case 'ghost':
      backgroundColor = 'transparent';
      borderColor = theme.colors.border;
      textColor = theme.colors.text;
      break;
    case 'neutral':
      backgroundColor = theme.colors.card ?? '#ffffff';
      textColor = theme.colors.text;
      break;
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[styles.button, { backgroundColor, borderColor, borderWidth: borderColor === 'transparent' ? 0 : 1 }, style]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[styles.text, { color: textColor }]}>{children}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  text: { fontWeight: '700' },
});