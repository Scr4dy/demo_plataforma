
export const LightTheme = {
  colors: {
    primary: '#1e3a8a',
    primaryLight: '#3b82f6',
    secondary: '#38a169',
    background: '#f5f5f5',
    card: '#ffffff',
    text: '#1a1a1a',
    textSecondary: '#666666',
    border: '#e0e0e0',
    error: '#e53e3e',
    success: '#38a169',
    warning: '#d69e2e',
    icon: '#666666',
    divider: '#e5e7eb',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
  }
};

export const DarkTheme = {
  colors: {
    primary: '#3b82f6',
    primaryLight: '#60a5fa',
    secondary: '#48bb78',
    background: '#1a1a1a',
    card: '#252525',
    text: '#e8e8e8',
    textSecondary: '#a0a0a0',
    border: '#3a3a3a',
    error: '#fc8181',
    success: '#48bb78',
    warning: '#f6e05e',
    icon: '#b0b0b0',
    divider: '#2f2f2f',
  },
  spacing: { ...LightTheme.spacing },
  borderRadius: { ...LightTheme.borderRadius }
};
