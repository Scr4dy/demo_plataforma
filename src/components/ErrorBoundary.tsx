
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    
    this.setState({ errorInfo });
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error!} resetError={this.resetError} />;
      }

      return (
        <View style={styles.container}>
          <View style={styles.errorContent}>
            <Ionicons name="warning" size={64} color="#e53e3e" />
            <Text style={styles.title}>¡Ups! Algo salió mal</Text>
            <Text style={styles.subtitle}>
              Ha ocurrido un error inesperado en la aplicación
            </Text>
            
            <View style={styles.errorDetails}>
              <Text style={styles.errorMessage}>
                {this.state.error?.message || 'Error desconocido'}
              </Text>
              
              {this.state.errorInfo && (
                <Text style={styles.errorStack}>
                  Componente: {this.state.errorInfo?.componentStack?.split('\n')[1]?.trim() || 'No disponible'}
                </Text>
              )}
            </View>

            <TouchableOpacity
              style={styles.retryButton}
              onPress={this.resetError}
              activeOpacity={0.7}
            >
              <Ionicons name="refresh" size={20} color="white" />
              <Text style={styles.retryButtonText}>Reintentar</Text>
            </TouchableOpacity>

            <Text style={styles.helpText}>
              - Modo Demo - Si el problema persiste, reinicia la aplicación
            </Text>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f7fafc',
  },
  errorContent: {
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 12,
    ...Platform.select({
      web: {
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      }
    }),
    maxWidth: 400,
    width: '100%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2d3748',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  errorDetails: {
    backgroundColor: '#fed7d7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    width: '100%',
  },
  errorMessage: {
    fontSize: 14,
    color: '#c53030',
    fontWeight: '500',
    marginBottom: 8,
  },
  errorStack: {
    fontSize: 12,
    color: '#742a2a',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4299e1',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
    marginBottom: 16,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  helpText: {
    fontSize: 12,
    color: '#a0aec0',
    textAlign: 'center',
  },
});

export const CustomFallback: React.FC<{ error: Error; resetError: () => void }> = ({ 
  error, 
  resetError 
}) => (
  <View style={styles.container}>
    <View style={styles.errorContent}>
      <Ionicons name="sad" size={64} color="#dd6b20" />
      <Text style={styles.title}>¡Vaya! Algo no funciona</Text>
      <Text style={styles.subtitle}>
        - Estamos en modo demo. Por favor, intenta nuevamente.
      </Text>
      
      <TouchableOpacity
        style={[styles.retryButton, { backgroundColor: '#dd6b20' }]}
        onPress={resetError}
        activeOpacity={0.7}
      >
        <Ionicons name="refresh" size={20} color="white" />
        <Text style={styles.retryButtonText}>Intentar de nuevo</Text>
      </TouchableOpacity>
    </View>
  </View>
);

export default ErrorBoundary;