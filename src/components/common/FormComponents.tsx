

import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ViewStyle,
  TextStyle,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

interface FormInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  editable?: boolean;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  multiline?: boolean;
  numberOfLines?: number;
  icon?: string;
  containerStyle?: ViewStyle;
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  required = false,
  editable = true,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  multiline = false,
  numberOfLines = 1,
  icon,
  containerStyle,
}) => {
  const { theme, colors } = useTheme();

  return (
    <View style={[styles.inputContainer, containerStyle]}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      </View>
      
      <View style={styles.inputWrapper}>
        {icon && (
          <Ionicons
            name={icon as any}
            size={20}
            color={error ? '#e53e3e' : '#666'}
            style={styles.inputIcon}
          />
        )}
        <TextInput
          style={[
            styles.input,
            icon && styles.inputWithIcon,
            error && styles.inputError,
            !editable && styles.inputDisabled,
            multiline && styles.inputMultiline,
            { backgroundColor: theme.colors.card, color: theme.colors.text, borderColor: theme.colors.border }
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
            placeholderTextColor={theme.colors.textSecondary}
          editable={editable}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          multiline={multiline}
          numberOfLines={numberOfLines}
        />
      </View>
      
      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={14} color="#e53e3e" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
};

interface FormSelectProps {
  label: string;
  value: string;
  onPress: () => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  editable?: boolean;
  icon?: string;
  containerStyle?: ViewStyle;
}

export const FormSelect: React.FC<FormSelectProps> = ({
  label,
  value,
  onPress,
  placeholder,
  error,
  required = false,
  editable = true,
  icon,
  containerStyle,
}) => {
  const { theme, colors } = useTheme();

  return (
    <View style={[styles.inputContainer, containerStyle]}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      </View>
      
      <TouchableOpacity
        style={[
          styles.selectButton,
          error && styles.inputError,
          !editable && styles.inputDisabled,
          { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
        ]}
        onPress={onPress}
        disabled={!editable}
      >
        {icon && (
          <Ionicons
              name={icon as any}
              size={20}
              color={error ? colors.error : theme.colors.textSecondary}
              style={styles.inputIcon}
            />
        )}
        <Text
          style={[
            styles.selectText,
            !value && styles.placeholderText,
            icon && styles.selectTextWithIcon,
          ]}
        >
          {value || placeholder}
        </Text>
        <Ionicons name="chevron-down" size={20} color={theme.colors.textSecondary} />
      </TouchableOpacity>
      
      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={14} color="#e53e3e" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
};

interface FormSwitchProps {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  description?: string;
  disabled?: boolean;
  containerStyle?: ViewStyle;
}

export const FormSwitch: React.FC<FormSwitchProps> = ({
  label,
  value,
  onValueChange,
  description,
  disabled = false,
  containerStyle,
}) => {
  const { theme, colors } = useTheme();

  return (
    <View style={[styles.switchContainer, containerStyle]}>
      <View style={styles.switchTextContainer}>
        <Text style={styles.switchLabel}>{label}</Text>
        {description && (
          <Text style={styles.switchDescription}>{description}</Text>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: theme.colors.border, true: colors.primary }}
        thumbColor={value ? colors.primary : theme.colors.card}
      />
    </View>
  );
};

interface FormSectionProps {
  title: string;
  children: React.ReactNode;
  icon?: string;
  containerStyle?: ViewStyle;
}

export const FormSection: React.FC<FormSectionProps> = ({
  title,
  children,
  icon,
  containerStyle,
}) => {
  return (
    <View style={[styles.sectionContainer, containerStyle]}>
      <View style={styles.sectionHeader}>
        {icon && (
          <Ionicons name={icon as any} size={20} color="#2196F3" />
        )}
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  required: {
    color: '#e53e3e',
  },
  inputWrapper: {
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    left: 12,
    top: 14,
    zIndex: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: '#333',
    backgroundColor: '#fff',
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      },
    }),
  },
  inputWithIcon: {
    paddingLeft: 44,
  },
  inputError: {
    borderColor: '#e53e3e',
  },
  inputDisabled: {
    backgroundColor: '#f5f5f5',
    color: '#999',
  },
  inputMultiline: {
    height: 100,
    textAlignVertical: 'top',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#e53e3e',
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  selectText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  selectTextWithIcon: {
    marginLeft: 32,
  },
  placeholderText: {
    color: '#999',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  switchTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  switchDescription: {
    fontSize: 12,
    color: '#666',
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#2196F3',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
});
