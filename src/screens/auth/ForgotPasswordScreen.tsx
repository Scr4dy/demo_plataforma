import React, { useState, useLayoutEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  
  useWindowDimensions,
} from 'react-native';
import * as Linking from 'expo-linking';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../../config/supabase';
import { useTheme } from '../../context/ThemeContext';
import { useSidebar } from '../../context/SidebarContext';
import { passwordRecoveryService } from '../../services/passwordRecoveryService';

const BRAND_PRIMARY = '#E31B23';
const BRAND_PRIMARY_LIGHT = '#FFEBEE';
const BRAND_DARK = '#1A1A1B';
const BRAND_GRAY = '#6B7280';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';

const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation();
  const { theme, colors } = useTheme();
  const { width } = useWindowDimensions();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const isWeb = Platform.OS === 'web';
  const sidebar = useSidebar ? useSidebar() : null;
  const sidebarOpen = !!(sidebar && sidebar.isSidebarOpen);
  const isMobile = width < 768;
  const isDesktop = width >= 1024;
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [errors, setErrors] = useState({ email: '' });
  const [isFocused, setIsFocused] = useState(false);

  
  const [alertModal, setAlertModal] = useState({
    visible: false,
    title: '',
    message: '',
    singleButton: true,
    confirmText: 'Entendido',
    cancelText: 'Cancelar',
    onConfirm: () => { },
    onCancel: () => { },
  });

  const showAlert = (title: string, message: string, onConfirm?: () => void) => {
    setAlertModal({
      visible: true,
      title,
      message,
      singleButton: true,
      confirmText: 'Entendido',
      cancelText: '',
      onConfirm: () => {
        setAlertModal(prev => ({ ...prev, visible: false }));
        if (onConfirm) onConfirm();
      },
      onCancel: () => setAlertModal(prev => ({ ...prev, visible: false })),
    });
  };

  
  const getRedirectUrl = (): string => {
    
    
    
    
    
    const redirectUrl = Linking.createURL('reset-password');
    return redirectUrl;
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setErrors({ email: 'El correo electrónico es requerido' });
      return false;
    }
    if (!emailRegex.test(email)) {
      setErrors({ email: 'Ingresa un correo electrónico válido' });
      return false;
    }
    setErrors({ email: '' });
    return true;
  };

  const handleResetPassword = async () => {
    if (!validateEmail(email)) return;

    try {
      setLoading(true);
      .trim());

      
      const result = await passwordRecoveryService.sendPasswordResetEmail(email.toLowerCase().trim());

      if (!result.success) {
        
        showAlert('Error', result.message || 'Hubo un problema al enviar el correo.');
      } else {
        
        setEmailSent(true);
      }
    } catch (error: any) {
      
      showAlert('Error', 'Ocurrió un error inesperado. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Login' as never);
    }
  };

  if (emailSent) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <TouchableOpacity
          style={styles.backButtonAbsolute}
          onPress={handleBackToLogin}
        >
          <Ionicons name="chevron-back" size={28} color={BRAND_DARK} />
        </TouchableOpacity>

        <View style={[styles.mainCenterContainer]}>
          <View style={[
            styles.content,
            isWeb && styles.desktopCard,
            isWeb && { backgroundColor: theme.colors.card, shadowColor: 'rgba(0,0,0,0.12)' }
          ]}>
            <View style={[styles.successIconContainer, { backgroundColor: BRAND_PRIMARY + '15' }]}>
              <Ionicons name="mail-open-outline" size={60} color={BRAND_PRIMARY} />
            </View>

            <Text style={[styles.successTitle, { color: BRAND_DARK }]}>¡Revisa tu correo!</Text>

            <Text style={[styles.successMessage, { color: BRAND_GRAY }]}>
              Hemos enviado las instrucciones de recuperación a{"\n"}
              <Text style={{ fontWeight: '700', color: BRAND_DARK }}>{email}</Text>
            </Text>

            <View style={[styles.infoBox, { backgroundColor: BRAND_PRIMARY_LIGHT, borderColor: BRAND_PRIMARY + '30' }]}>
              <Ionicons name="information-circle-outline" size={20} color={BRAND_PRIMARY} style={{ marginRight: 8 }} />
              <Text style={[styles.checkSpamText, { color: BRAND_PRIMARY, marginBottom: 0 }]}>
                Si no lo ves, revisa tu carpeta de Spam.
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: BRAND_PRIMARY, marginTop: 20 }]}
              onPress={handleBackToLogin}
              activeOpacity={0.8}
            >
              <Text style={[styles.primaryButtonText, { textAlign: 'center', flex: 1 }]}>Volver al Login</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.textButton}
              onPress={() => {
                setEmailSent(false);
                setEmail('');
              }}
            >
              <Text style={[styles.textButtonText, { color: BRAND_PRIMARY }]}>Probar con otro correo</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          isWeb && styles.centerScroll
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity
          style={[styles.backButtonAbsolute, isWeb && { left: 40, top: 40 }]}
          onPress={handleBackToLogin}
        >
          <Ionicons name="chevron-back" size={28} color={BRAND_DARK} />
        </TouchableOpacity>

        <View style={[
          styles.formCard,
          isWeb && styles.desktopCard,
          isWeb && { backgroundColor: theme.colors.card, shadowColor: 'rgba(0,0,0,0.12)' }
        ]}>

          <View style={styles.header}>
            <View style={[styles.iconContainer, { backgroundColor: BRAND_PRIMARY + '10' }]}>
              <Ionicons name="lock-closed" size={48} color={BRAND_PRIMARY} />
            </View>
            <Text style={[styles.title, { color: BRAND_DARK }]}>Recuperar Contraseña</Text>
            <Text style={[styles.subtitle, { color: BRAND_GRAY }]}>
              Ingresa tu correo asociado y te enviaremos un enlace para restablecer tu acceso.
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: BRAND_DARK }]}>Correo Electrónico</Text>
              <View style={[
                styles.inputWrapper,
                {
                  backgroundColor: '#fff',
                  borderWidth: 1,
                  borderColor: errors.email
                    ? '#EF4444'
                    : (isFocused ? BRAND_PRIMARY : '#D1D5DB'),
                }
              ]}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={isFocused ? BRAND_PRIMARY : BRAND_GRAY}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { color: BRAND_DARK, padding: 12 }]}
                  placeholder="ejemplo@correo.com"
                  placeholderTextColor={BRAND_GRAY}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (errors.email) validateEmail(text);
                  }}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                />
              </View>
              {errors.email ? (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={14} color="#EF4444" />
                  <Text style={styles.errorText}>{errors.email}</Text>
                </View>
              ) : null}
            </View>

            <TouchableOpacity
              style={[
                styles.primaryButton,
                { backgroundColor: BRAND_PRIMARY },
                loading && styles.buttonDisabled
              ]}
              onPress={handleResetPassword}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Text style={styles.primaryButtonText}>Enviar Instrucciones</Text>
                  <Ionicons name="arrow-forward" size={18} color="#fff" style={{ marginLeft: 8 }} />
                </>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: BRAND_GRAY }]}>
              ¿Necesitas ayuda? <Text style={{ color: BRAND_PRIMARY, fontWeight: '700' }} onPress={() => Linking.openURL('mailto:soporte@demo.com')}>Contactar Soporte</Text>
            </Text>
          </View>
        </View>

      </ScrollView>
      <ConfirmationModal
        visible={alertModal.visible}
        title={alertModal.title}
        message={alertModal.message}
        onConfirm={alertModal.onConfirm}
        onCancel={alertModal.onCancel}
        confirmText={alertModal.confirmText}
        cancelText={alertModal.cancelText}
        singleButton={alertModal.singleButton}
      />
    </KeyboardAvoidingView >
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mainCenterContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    padding: 24,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  centerScroll: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  desktopCard: {
    width: '100%',
    maxWidth: 480,
    borderRadius: 24,
    padding: 40,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 8,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  formCard: {
    width: '100%',
  },
  backButtonAbsolute: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 10,
    padding: 8,
    borderRadius: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  successIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
  },
  successTitle: {
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  successMessage: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
    width: '100%',
  },
  checkSpamText: {
    fontSize: 14,
    flex: 1,
  },
  form: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    height: 56,
    paddingLeft: 12,
    backgroundColor: '#fff',
  },
  inputIcon: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginLeft: 4,
  },
  errorText: {
    fontSize: 13,
    color: '#EF4444',
    marginLeft: 6,
  },
  primaryButton: {
    height: 56,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
    width: '100%',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  textButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  textButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  footer: {
    paddingTop: 16,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
  },
});

export default ForgotPasswordScreen;
