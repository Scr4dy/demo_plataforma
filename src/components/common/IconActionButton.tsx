import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

type Variant = 'primary' | 'outline' | 'ghost' | 'danger';

interface Props {
  icon: string;
  label?: string;
  onPress?: () => void;
  variant?: Variant;
  
  keepPrimaryMobile?: boolean;
  showLabel?: boolean;
  compact?: boolean;
  iconOnly?: boolean;
  accessibilityLabel?: string;
  style?: any;
}

const IconActionButton: React.FC<Props> = ({ icon, label, onPress, variant = 'primary', keepPrimaryMobile = false, showLabel = true, compact = false, iconOnly = false, accessibilityLabel, style }) => {
  const { theme, colors } = useTheme();
  const isDark = theme.dark;

  
  const effectiveVariant: Variant = (Platform.OS !== 'web' && variant === 'primary' && !keepPrimaryMobile) ? 'outline' : variant;

  const bg = (() => {
    switch (effectiveVariant) {
      case 'primary': return colors.primary;
      case 'outline': return 'transparent';
      case 'danger': return 'transparent';
      case 'ghost': return 'transparent';
    }
  })();

  const border = (() => {
    switch (effectiveVariant) {
      case 'primary': return 'transparent';
      case 'outline': return colors.primary;
      case 'danger': return theme.colors.error;
      case 'ghost': return 'transparent';
    }
  })();

  const iconColor = (() => {
    switch (effectiveVariant) {
      case 'primary': return theme.colors.card;
      case 'outline': return colors.primary;
      case 'danger': return theme.colors.error;
      case 'ghost': return colors.textSecondary;
    }
  })();

  const textColor = (() => {
    switch (effectiveVariant) {
      case 'primary': return theme.colors.card;
      case 'outline': return colors.primary;
      case 'danger': return theme.colors.error;
      case 'ghost': return colors.textSecondary;
    }
  })();

  const iconSize = compact ? 16 : 18;
  const showLabelEffective = !iconOnly && showLabel && !!label;

  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      {...(Platform.OS === 'web' && iconOnly && label ? { title: label } : {})}
      style={[styles.container, compact && styles.containerCompact, iconOnly && styles.containerIconOnly, { backgroundColor: bg, borderColor: border }, style]}
    >
      <View style={styles.inner}>
        <Ionicons name={icon as any} size={iconSize} color={iconColor} />
        {showLabelEffective ? (
          <Text style={[styles.label, compact && styles.labelCompact, { color: textColor }]} numberOfLines={1}>{label}</Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 36,
    minWidth: 36,
    justifyContent: 'center',
  },
  containerCompact: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    minHeight: 32,
    minWidth: 48,
  },
  containerIconOnly: {
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderRadius: 8,
    minHeight: 36,
    minWidth: 40,
    justifyContent: 'center'
  },
  inner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  label: { marginLeft: 8, fontWeight: '700', fontSize: 13 },
  labelCompact: { marginLeft: 6, fontSize: 12 },
});

export default IconActionButton;
