import React, { useState, useEffect, useLayoutEffect } from "react";
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { supabase } from "../../config/supabase";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";

const BRAND_PRIMARY = "#E31B23";
const BRAND_LIGHT = "#FFEBEE";
const BRAND_DARK = "#1A1A1B";
const BRAND_GRAY = "#6B7280";
import { ConfirmationModal } from "../../components/common/ConfirmationModal";

const ResetPasswordScreen: React.FC = () => {
  const navigation = useNavigation();
  const { theme, colors } = useTheme();
  const { width } = useWindowDimensions();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const isWeb = Platform.OS === "web";
  const isDesktop = width >= 1024;

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [errors, setErrors] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [isValidToken, setIsValidToken] = useState(false);
  const [checkingToken, setCheckingToken] = useState(true);
  const [success, setSuccess] = useState(false);
  const [isFocusedNew, setIsFocusedNew] = useState(false);
  const [isFocusedConfirm, setIsFocusedConfirm] = useState(false);

  
  const [alertModal, setAlertModal] = useState({
    visible: false,
    title: "",
    message: "",
    singleButton: true,
    confirmText: "Entendido",
    cancelText: "Cancelar",
    onConfirm: () => {},
    onCancel: () => {},
  });

  const showAlert = (
    title: string,
    message: string,
    onConfirm?: () => void,
  ) => {
    setAlertModal({
      visible: true,
      title,
      message,
      singleButton: true,
      confirmText: "Entendido",
      cancelText: "",
      onConfirm: () => {
        setAlertModal((prev) => ({ ...prev, visible: false }));
        if (onConfirm) onConfirm();
      },
      onCancel: () => setAlertModal((prev) => ({ ...prev, visible: false })),
    });
  };

  const { state } = useAuth();

  

  const handleBackToLogin = async () => {
    try {
      await supabase.auth.signOut();
      if (Platform.OS === "web") {
        window.history.replaceState({}, "", "/");
        window.location.href = "/";
      } else {
        navigation.reset({
          index: 0,
          routes: [{ name: "Login" as never }],
        });
      }
    } catch (error) {
      
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeRecovery = async () => {
      
      if (state.isAuthenticated && state.user) {
        if (mounted) {
          setIsValidToken(true);
          setCheckingToken(false);
        }
        return;
      }

      setCheckingToken(true);

      
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        
        if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
          if (mounted) {
            setIsValidToken(true);
            setCheckingToken(false);
          }
        }
      });

      
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        if (mounted) {
          setIsValidToken(true);
          setCheckingToken(false);
        }
      } else {
        
        if (Platform.OS === "web") {
          const hasTokens =
            window.location.hash.includes("access_token") ||
            window.location.search.includes("code=");

          if (hasTokens) {
            
            
            setTimeout(async () => {
              if (!mounted) return;
              const {
                data: { session: finalSession },
              } = await supabase.auth.getSession();
              if (finalSession) {
                setIsValidToken(true);
              } else {
                setIsValidToken(false);
              }
              setCheckingToken(false);
            }, 10000);
            return; 
          }
        }

        
        if (mounted) {
          
          setTimeout(async () => {
            if (!mounted) return;
            const {
              data: { session: retryS },
            } = await supabase.auth.getSession();
            if (retryS) {
              setIsValidToken(true);
            } else {
              setIsValidToken(false);
            }
            setCheckingToken(false);
          }, 2000);
        }
      }

      return () => {
        subscription.unsubscribe();
      };
    };

    initializeRecovery();

    return () => {
      mounted = false;
    };
  }, [state.isAuthenticated]);

  const calculatePasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 12.5;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 12.5;
    return Math.min(strength, 100);
  };

  const getStrengthColor = (strength: number): string => {
    if (strength < 25) return "#EF4444";
    if (strength < 50) return "#F59E0B";
    if (strength < 75) return "#EAB308";
    return "#10B981";
  };

  const getStrengthLabel = (strength: number): string => {
    if (strength < 25) return "Muy débil";
    if (strength < 50) return "Débil";
    if (strength < 75) return "Buena";
    return "Fuerte";
  };

  const validatePassword = (password: string): boolean => {
    if (!password) {
      setErrors((prev) => ({
        ...prev,
        newPassword: "La contraseña es requerida",
      }));
      return false;
    }
    if (password.length < 8) {
      setErrors((prev) => ({ ...prev, newPassword: "Mínimo 8 caracteres" }));
      return false;
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])/.test(password)) {
      setErrors((prev) => ({
        ...prev,
        newPassword: "Mayúsculas y minúsculas requeridas",
      }));
      return false;
    }
    if (!/(?=.*[0-9])/.test(password)) {
      setErrors((prev) => ({ ...prev, newPassword: "Número requerido" }));
      return false;
    }
    setErrors((prev) => ({ ...prev, newPassword: "" }));
    return true;
  };

  const validateConfirmPassword = (confirm: string): boolean => {
    if (!confirm) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: "Confirma tu contraseña",
      }));
      return false;
    }
    if (confirm !== newPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: "Las contraseñas no coinciden",
      }));
      return false;
    }
    setErrors((prev) => ({ ...prev, confirmPassword: "" }));
    return true;
  };

  const handlePasswordChange = (password: string) => {
    setNewPassword(password);
    setPasswordStrength(calculatePasswordStrength(password));
    if (errors.newPassword) validatePassword(password);
    if (confirmPassword && errors.confirmPassword)
      validateConfirmPassword(confirmPassword);
  };

  const handleResetPassword = async () => {
    const isPasswordValid = validatePassword(newPassword);
    const isConfirmValid = validateConfirmPassword(confirmPassword);

    if (!isPasswordValid || !isConfirmValid) return;

    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        showAlert(
          "Error",
          error.message || "No se pudo actualizar la contraseña.",
        );
      } else {
        setSuccess(true);
      }
    } catch (error) {
      showAlert("Error", "Ocurrió un error inesperado.");
    } finally {
      setLoading(false);
    }
  };

  
  const BackgroundPattern = () =>
    isWeb && (
      <View style={styles.webBackgroundContainer}>
        <View style={styles.webBackgroundTop} />
        <View style={styles.webBackgroundBottom} />
      </View>
    );

  if (checkingToken) {
    return (
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <BackgroundPattern />
        <View
          style={[
            styles.loadingContainer,
            isWeb && {
              zIndex: 2,
              backgroundColor: "rgba(255,255,255,0.9)",
              borderRadius: 20,
              padding: 40,
            },
          ]}
        >
          <ActivityIndicator size="large" color={BRAND_PRIMARY} />
          <Text style={[styles.loadingText, { color: BRAND_DARK }]}>
            Verificando enlace...
          </Text>
        </View>
      </View>
    );
  }

  if (!isValidToken) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: isWeb ? "transparent" : theme.colors.background,
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
      >
        <BackgroundPattern />
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            isWeb && styles.webContentContainer,
          ]}
          style={{ width: "100%" }}
        >
          <TouchableOpacity
            style={[
              styles.backButtonAbsolute,
              isWeb && {
                top: 40,
                left: 40,
                backgroundColor: "white",
                borderRadius: 20,
                zIndex: 20,
              },
            ]}
            onPress={handleBackToLogin}
          >
            <Ionicons name="chevron-back" size={28} color={BRAND_DARK} />
          </TouchableOpacity>
          <View
            style={[
              styles.cardBase,
              isWeb && styles.desktopCard,
              { alignItems: "center", alignSelf: "center" },
            ]}
          >
            <Ionicons name="alert-circle-outline" size={60} color={BRAND_PRIMARY} />
            <Text style={[styles.title, { color: BRAND_DARK, marginTop: 16 }]}>
              Token Inválido o Expirado
            </Text>
            <Text
              style={[styles.subtitle, { color: BRAND_GRAY, marginBottom: 24 }]}
            >
              El enlace de recuperación ya no es válido.
            </Text>
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: BRAND_PRIMARY }]}
              onPress={handleBackToLogin}
            >
              <Text style={styles.primaryButtonText}>Volver al Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  if (success) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: isWeb ? "transparent" : theme.colors.background },
        ]}
      >
        <BackgroundPattern />
        <View
          style={[
            styles.content,
            styles.centerScroll,
            isWeb && styles.webContentContainer,
          ]}
        >
          <View
            style={[
              styles.cardBase,
              isWeb && styles.desktopCard,
              {
                alignItems: "center",
                backgroundColor: "#fff",
                shadowColor: "#000",
                shadowOpacity: 0.1,
                elevation: 8,
              },
            ]}
          >
            <View
              style={[
                styles.successIconContainer,
                { backgroundColor: BRAND_PRIMARY + "15" },
              ]}
            >
              <Ionicons name="checkmark-circle" size={80} color={BRAND_PRIMARY} />
            </View>
            <Text style={[styles.successTitle, { color: BRAND_DARK }]}>
              ¡Contraseña Actualizada!
            </Text>
            <Text
              style={[styles.subtitle, { color: BRAND_GRAY, marginBottom: 30 }]}
            >
              Tu contraseña ha sido cambiada exitosamente.
            </Text>

            <TouchableOpacity
              style={[
                styles.primaryButton,
                { backgroundColor: BRAND_PRIMARY, width: "100%" },
              ]}
              onPress={async () => {
                try {
                  await supabase.auth.signOut();
                } catch (e) {}
                if (Platform.OS === "web") {
                  window.location.href = "/";
                } else {
                  navigation.reset({
                    index: 0,
                    routes: [{ name: "Login" as never }],
                  });
                }
              }}
            >
              <Text style={styles.primaryButtonText}>Ir al Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[
        styles.container,
        { backgroundColor: isWeb ? "transparent" : theme.colors.background },
      ]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <BackgroundPattern />
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          isWeb && styles.webContentContainer,
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity
          style={[
            styles.backButtonAbsolute,
            isWeb && {
              top: 40,
              left: 40,
              backgroundColor: "white",
              borderRadius: 20,
            },
          ]}
          onPress={handleBackToLogin}
        >
          <Ionicons name="chevron-back" size={28} color={BRAND_DARK} />
        </TouchableOpacity>

        <View
          style={[
            styles.cardBase,
            isWeb && styles.desktopCard,
            { backgroundColor: theme.colors.card },
          ]}
        >
          <View style={styles.header}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: BRAND_PRIMARY + "15" },
              ]}
            >
              <Ionicons name="key-outline" size={48} color={BRAND_PRIMARY} />
            </View>
            <Text style={[styles.title, { color: BRAND_DARK }]}>
              Nueva Contraseña
            </Text>
            <Text style={[styles.subtitle, { color: BRAND_GRAY }]}>
              Crea una contraseña segura para tu cuenta
            </Text>
          </View>

          <View style={styles.form}>
            {}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: BRAND_DARK }]}>
                Nueva Contraseña
              </Text>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    borderColor: errors.newPassword
                      ? "#EF4444"
                      : isFocusedNew
                        ? BRAND_PRIMARY
                        : BRAND_GRAY + "40",
                    backgroundColor: theme.dark
                      ? "rgba(255,255,255,0.05)"
                      : "#fff",
                  },
                ]}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={isFocusedNew ? BRAND_PRIMARY : BRAND_GRAY}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { color: BRAND_DARK }]}
                  placeholder="Ingresa tu nueva contraseña"
                  placeholderTextColor={BRAND_GRAY}
                  value={newPassword}
                  onChangeText={handlePasswordChange}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  editable={!loading}
                  onFocus={() => setIsFocusedNew(true)}
                  onBlur={() => setIsFocusedNew(false)}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                    size={22}
                    color={BRAND_GRAY}
                  />
                </TouchableOpacity>
              </View>
              {errors.newPassword ? (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={14} color="#EF4444" />
                  <Text style={styles.errorText}>{errors.newPassword}</Text>
                </View>
              ) : null}

              {}
              {newPassword.length > 0 && (
                <View style={styles.strengthContainer}>
                  <View style={styles.strengthBar}>
                    <View
                      style={[
                        styles.strengthFill,
                        {
                          width: `${passwordStrength}%`,
                          backgroundColor: getStrengthColor(passwordStrength),
                        },
                      ]}
                    />
                  </View>
                  <Text
                    style={[
                      styles.strengthLabel,
                      { color: getStrengthColor(passwordStrength) },
                    ]}
                  >
                    {getStrengthLabel(passwordStrength)}
                  </Text>
                </View>
              )}
            </View>

            {}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: BRAND_DARK }]}>
                Confirmar Contraseña
              </Text>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    borderColor: errors.confirmPassword
                      ? "#EF4444"
                      : isFocusedConfirm
                        ? BRAND_PRIMARY
                        : BRAND_GRAY + "40",
                    backgroundColor: theme.dark
                      ? "rgba(255,255,255,0.05)"
                      : "#fff",
                  },
                ]}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={isFocusedConfirm ? BRAND_PRIMARY : BRAND_GRAY}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { color: BRAND_DARK }]}
                  placeholder="Confirma tu nueva contraseña"
                  placeholderTextColor={BRAND_GRAY}
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    if (errors.confirmPassword) validateConfirmPassword(text);
                  }}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  editable={!loading}
                  onFocus={() => setIsFocusedConfirm(true)}
                  onBlur={() => setIsFocusedConfirm(false)}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons
                    name={
                      showConfirmPassword ? "eye-outline" : "eye-off-outline"
                    }
                    size={22}
                    color={BRAND_GRAY}
                  />
                </TouchableOpacity>
              </View>
              {errors.confirmPassword ? (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={14} color="#EF4444" />
                  <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                </View>
              ) : null}
            </View>

            {}
            <View
              style={[
                styles.requirementsCard,
                { backgroundColor: theme.dark ? "#1e1e1e" : "#F9FAFB" },
              ]}
            >
              <Text style={[styles.requirementsTitle, { color: BRAND_DARK }]}>
                La contraseña debe incluir:
              </Text>
              {[
                {
                  valid: newPassword.length >= 8,
                  text: "Al menos 8 caracteres",
                },
                {
                  valid: /(?=.*[a-z])(?=.*[A-Z])/.test(newPassword),
                  text: "Mayúsculas y minúsculas",
                },
                {
                  valid: /(?=.*[0-9])/.test(newPassword),
                  text: "Al menos un número",
                },
              ].map((req, i) => (
                <View key={i} style={styles.requirement}>
                  <Ionicons
                    name={req.valid ? "checkmark-circle" : "ellipse-outline"}
                    size={16}
                    color={req.valid ? BRAND_PRIMARY : BRAND_GRAY}
                  />
                  <Text
                    style={[
                      styles.requirementText,
                      { color: req.valid ? BRAND_DARK : BRAND_GRAY },
                    ]}
                  >
                    {req.text}
                  </Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={[
                styles.primaryButton,
                { backgroundColor: BRAND_PRIMARY },
                loading && styles.submitButtonDisabled,
              ]}
              onPress={handleResetPassword}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Text style={styles.primaryButtonText}>
                    Cambiar Contraseña
                  </Text>
                  <Ionicons
                    name="arrow-forward"
                    size={18}
                    color="#fff"
                    style={{ marginLeft: 8 }}
                  />
                </>
              )}
            </TouchableOpacity>
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
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: "500",
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: "center",
  },
  centerScroll: {
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  cardBase: {
    width: "100%",
  },
  desktopCard: {
    maxWidth: 500,
    borderRadius: 24,
    padding: 40,
    backgroundColor: "white", 
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 30,
    elevation: 8,
  },
  backButtonAbsolute: {
    position: "absolute",
    top: 60,
    left: 20,
    zIndex: 10,
    padding: 8,
    borderRadius: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  form: {
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 56,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: 16,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    paddingLeft: 4,
  },
  errorText: {
    fontSize: 13,
    color: "#EF4444",
    marginLeft: 4,
  },
  requirementsCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 12,
  },
  requirement: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  requirementText: {
    fontSize: 13,
    marginLeft: 8,
    fontWeight: "500",
  },
  strengthContainer: {
    marginTop: 12,
    paddingHorizontal: 4,
  },
  strengthBar: {
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: 6,
  },
  strengthFill: {
    height: "100%",
    borderRadius: 2,
  },
  strengthLabel: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "right",
  },
  primaryButton: {
    height: 56,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
    width: "100%",
  },
  submitButtonDisabled: {
    backgroundColor: "#BDBDBD",
    shadowOpacity: 0,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  successIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 26,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 12,
  },
  
  webBackgroundContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    zIndex: 0,
  },
  webBackgroundTop: {
    flex: 1,
    backgroundColor: BRAND_PRIMARY, 
    height: "50%",
  },
  webBackgroundBottom: {
    flex: 1,
    backgroundColor: "#F3F4F6", 
    height: "50%",
  },
  webContentContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
    padding: 24,
  },
});

export default ResetPasswordScreen;
