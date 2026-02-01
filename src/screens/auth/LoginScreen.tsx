
import React, {
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
} from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  StatusBar,
  TextInput,
  Dimensions,
  Animated,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { platformShadow } from "../../utils/styleHelpers";
import { useTheme } from "../../context/ThemeContext";
import { loginSecurityService } from "../../services/loginSecurityService";
import { authService } from "../../services/authService"; 
import {
  getLoadingMessage,
  getErrorMessage,
} from "../../utils/personalizedMessages";
import { useHeader } from "../../context/HeaderContext";
import { AlertMessage } from "../../components/common/AlertMessage";
import { SuccessModal } from "../../components/common/SuccessModal";

const BRAND_PRIMARY = "#E31B23";
const BRAND_PRIMARY_LIGHT = "#FFEBEE";
const BRAND_DARK = "#1A1A1B";
const BRAND_GRAY = "#6B7280";

import { supabase } from "../../config/supabase";

const inputStyles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontWeight: "600",
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    paddingLeft: 12, 
    paddingRight: 12, 
  },
  inputIcon: {
    paddingVertical: 12,
    paddingHorizontal: 8, 
  },
  input: {
    flex: 1,
    fontWeight: "500",
  },
  eyeButton: {
    padding: 10,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 4,
  },
  errorText: {
    fontSize: 12,
    fontWeight: "500",
  },
});

const departmentStyles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  label: {
    fontWeight: "600",
    fontSize: 14,
  },
  scrollView: {
    marginHorizontal: -4,
  },
  contentContainer: {
    paddingHorizontal: 4,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  departmentButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: "transparent",
    marginHorizontal: 4,
    marginBottom: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: "transparent",
  },
  departmentButtonActive: {
    borderColor: "transparent",
  },
  departmentButtonDisabled: {
    opacity: 0.6,
  },
  departmentIcon: {
    marginRight: 2,
  },
  departmentText: {
    fontSize: 12,
    fontWeight: "500",
  },
  departmentTextActive: {
    fontWeight: "600",
  },
});

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  appContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center", 
    paddingVertical: 40,
  },
  card: {
    ...platformShadow({
      shadowColor: "rgba(0,0,0,0.12)",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 8,
      boxShadow: "0 8px 16px rgba(0,0,0,0.12)",
    }),
    padding: 32, 
  },
  header: {
    alignItems: "center",
    marginBottom: 32, 
  },
  logoWrapper: {
    marginBottom: 24, 
    alignItems: "center",
    justifyContent: "center",
  },
  logoImage: {
    width: 200, 
    height: 100,
  },
  headerTitle: {
    fontWeight: "800",
    textAlign: "center",
    fontSize: 20, 
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  headerSubtitle: {
    marginBottom: 24,
    textAlign: "center",
    opacity: 0.8,
  },
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "transparent",
    borderRadius: 12,
    padding: 4,
    width: "100%",
    marginBottom: 16,
  },
  toggleButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  toggleButtonActive: {},
  toggleButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  toggleButtonTextActive: {},
  loginTypeContainer: {
    flexDirection: "row",
    backgroundColor: "transparent",
    borderRadius: 8,
    padding: 4,
    width: "100%",
  },
  loginTypeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 6,
    gap: 6,
  },
  loginTypeButtonActive: {
    
  },
  loginTypeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  loginTypeTextActive: {
    
  },
  identifierHint: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    paddingVertical: 4,
    paddingHorizontal: 12,
    backgroundColor: "transparent",
    borderRadius: 12,
    gap: 6,
  },
  identifierHintText: {
    fontSize: 11,

    fontWeight: "500",
  },
  form: {
    marginBottom: 20,
  },
  forgotPasswordButton: {
    alignSelf: "flex-end",
    marginTop: 8,
    marginBottom: 16,
  },
  forgotPasswordText: {
    fontSize: 14,
    textDecorationLine: "underline",
  },
  mainButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    gap: 8,
    marginTop: 8, 
    ...platformShadow({
      shadowColor: "rgba(0,0,0,0.12)",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 6,
      boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
    }),
  },
  mainButtonDisabled: {
    backgroundColor: "transparent",
    shadowOpacity: 0,
    elevation: 0,
  },
  mainButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
  toggleModeLinkContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24, 
  },
  toggleModeLinkText: {},
  toggleModeLinkButtonText: {
    fontWeight: "700",
    marginLeft: 4,
    textDecorationLine: "underline",
  },
});

interface LoginFormData {
  email: string;
  password: string;
}

interface EmployeeLoginData {
  numeroEmpleado: string;
  password: string;
}

interface RegisterFormData {
  numeroEmpleado: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  email: string;
  phone: string;
  department: string;
  puesto: string;
  rol: string;
  password: string;
  confirmPassword: string;
}

const useResponsive = () => {
  const { width } = Dimensions.get("window");

  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const isDesktop = width >= 1024;
  const isWeb = Platform.OS === "web";
  const isIOS = Platform.OS === "ios";
  const isAndroid = Platform.OS === "android";

  const responsiveValue = <T,>(
    mobile: T,
    tablet: T = mobile,
    desktop: T = tablet,
  ): T => {
    if (isMobile) return mobile;
    if (isTablet) return tablet;
    return desktop;
  };

  const spacing = (multiplier: number = 1) => {
    const base = responsiveValue(8, 12, 16);
    return base * multiplier;
  };

  const fontSize = (size: number) => {
    return responsiveValue(size, size + 1, size + 2);
  };

  return {
    isMobile,
    isTablet,
    isDesktop,
    isWeb,
    isIOS,
    isAndroid,
    rv: responsiveValue,
    spacing,
    fontSize,
    windowWidth: width,
  };
};

const IconWrapper: React.FC<{ style?: any; children: React.ReactNode }> = ({
  children,
  style,
}) => {
  if (Platform.OS === "web")
    return <Text style={style as any}>{children}</Text>;
  return <React.Fragment>{children}</React.Fragment>;
};

const CustomInput = React.forwardRef<
  any,
  {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder: string;
    secureTextEntry?: boolean;
    isPassword?: boolean;
    toggleVisibility?: () => void;
    isVisible?: boolean;
    editable?: boolean;
    autoCapitalize?: "none" | "sentences" | "words" | "characters";
    keyboardType?: "default" | "email-address" | "phone-pad";
    containerStyle?: any;
    icon?: string;
    error?: string;
    touched?: boolean;
    onFocus?: () => void;
    onSubmitEditing?: () => void;
    returnKeyType?: "done" | "go" | "next" | "search" | "send";
  }
>(
  (
    {
      label,
      value,
      onChangeText,
      placeholder,
      secureTextEntry = false,
      isPassword = false,
      toggleVisibility,
      isVisible = false,
      editable = true,
      autoCapitalize = "none",
      keyboardType = "default",
      containerStyle,
      icon,
      error,
      touched = false,
      onFocus,
      onSubmitEditing,
      returnKeyType = "done",
    },
    ref,
  ) => {
    const { isWeb, spacing, fontSize } = useResponsive();
    const { theme, colors } = useTheme();
    const [isFocused, setIsFocused] = useState(false);

    const internalInputRef = React.useRef<TextInput | null>(null);
    const shakeAnim = React.useRef(new Animated.Value(0)).current;

    React.useImperativeHandle(
      ref as any,
      () => ({
        focus: () =>
          internalInputRef.current?.focus && internalInputRef.current.focus(),
        blur: () =>
          internalInputRef.current?.blur && internalInputRef.current.blur(),
        shake: () => {
          Animated.sequence([
            Animated.timing(shakeAnim, {
              toValue: 8,
              duration: 50,
              useNativeDriver: true,
            }),
            Animated.timing(shakeAnim, {
              toValue: -8,
              duration: 50,
              useNativeDriver: true,
            }),
            Animated.timing(shakeAnim, {
              toValue: 6,
              duration: 40,
              useNativeDriver: true,
            }),
            Animated.timing(shakeAnim, {
              toValue: -6,
              duration: 40,
              useNativeDriver: true,
            }),
            Animated.timing(shakeAnim, {
              toValue: 0,
              duration: 30,
              useNativeDriver: true,
            }),
          ]).start();
        },
      }),
      [shakeAnim],
    );

    const getIconName = (): any => {
      if (icon) return icon;
      if (keyboardType === "email-address") return "email";
      if (isPassword) return "lock";
      if (
        label.toLowerCase().includes("teléfono") ||
        label.toLowerCase().includes("phone")
      )
        return "phone";
      if (label.toLowerCase().includes("nombre")) return "person";
      if (label.toLowerCase().includes("empleado")) return "badge";
      return "edit";
    };

    const getBorderColor = () => {
      if (error && touched) return colors.error || theme.colors.error;
      
      if (!error && touched && value && value.length > 0) return BRAND_PRIMARY;
      if (isFocused) return BRAND_PRIMARY;
      return theme.colors.border;
    };

    const handleFocus = () => {
      setIsFocused(true);
      onFocus?.();
    };

    const handleBlur = () => {
      setIsFocused(false);
    };

    return (
      <Animated.View
        style={[
          inputStyles.container,
          containerStyle,
          { transform: [{ translateX: shakeAnim }] },
        ]}
      >
        <Text
          style={[
            inputStyles.label,
            { fontSize: fontSize(14), color: theme.colors.text },
          ]}
        >
          {label}
        </Text>
        <View
          style={[
            inputStyles.inputWrapper,
            {
              borderColor: getBorderColor(),
              backgroundColor: editable ? colors.card : theme.colors.background,
            },
          ]}
        >
          <IconWrapper style={inputStyles.inputIcon}>
            <MaterialIcons
              name={getIconName()}
              size={20}
              color={isFocused ? BRAND_PRIMARY : BRAND_GRAY}
            />
          </IconWrapper>
          <TextInput
            ref={internalInputRef as any}
            style={[
              inputStyles.input,
              {
                fontSize: isWeb ? 16 : fontSize(14),
                padding: spacing(1.5),
                color: editable ? theme.colors.text : BRAND_GRAY,
              },
            ]}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor="#9CA3AF"
            secureTextEntry={secureTextEntry && !isVisible}
            editable={editable}
            autoCapitalize={autoCapitalize}
            keyboardType={keyboardType}
            onFocus={handleFocus}
            onBlur={handleBlur}
            selectionColor={BRAND_PRIMARY}
            onSubmitEditing={onSubmitEditing}
            returnKeyType={returnKeyType}
          />
          {!!isPassword && !!toggleVisibility && (
            <TouchableOpacity
              onPress={toggleVisibility}
              style={inputStyles.eyeButton}
            >
              <IconWrapper style={{ color: BRAND_GRAY }}>
                <Ionicons
                  name={isVisible ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color={BRAND_GRAY}
                />
              </IconWrapper>
            </TouchableOpacity>
          )}
        </View>
        {!!error && touched && (
          <View style={inputStyles.errorContainer}>
            <IconWrapper style={{ color: colors.error }}>
              <MaterialIcons
                name="error-outline"
                size={14}
                color={colors.error}
              />
            </IconWrapper>
            <Text style={inputStyles.errorText}>{error}</Text>
          </View>
        )}
      </Animated.View>
    );
  },
);

const DepartmentSelector: React.FC<{
  department: string;
  onSelect: (dept: string) => void;
  disabled?: boolean;
  containerStyle?: any;
  error?: string;
  touched?: boolean;
}> = ({
  department,
  onSelect,
  disabled = false,
  containerStyle,
  error,
  touched = false,
}) => {
  const { isMobile, spacing, fontSize } = useResponsive();
  const { theme, colors } = useTheme();

  const departments = [
    "Producción",
    "Calidad",
    "Logística",
    "Recursos Humanos",
    "Administración",
    "Ventas",
    "Marketing",
    "TI",
  ];

  return (
    <View style={[departmentStyles.container, containerStyle]}>
      <View style={departmentStyles.labelContainer}>
        <IconWrapper
          style={{ color: error && touched ? colors.error : theme.colors.text }}
        >
          <MaterialIcons
            name="apartment"
            size={18}
            color={error && touched ? colors.error : theme.colors.text}
          />
        </IconWrapper>
        <Text
          style={[
            departmentStyles.label,
            { color: theme.colors.text },
            !!error && touched && { color: colors.error },
          ]}
        >
          Departamento
        </Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={departmentStyles.scrollView}
        contentContainerStyle={departmentStyles.contentContainer}
      >
        {departments.map((dept) => (
          <TouchableOpacity
            key={dept}
            style={[
              departmentStyles.departmentButton,
              department === dept && [
                departmentStyles.departmentButtonActive,
                { backgroundColor: BRAND_PRIMARY },
              ],
              disabled && departmentStyles.departmentButtonDisabled,
            ]}
            onPress={() => onSelect(dept)}
            disabled={disabled}
          >
            <Text
              style={[
                departmentStyles.departmentText,
                { color: BRAND_GRAY },
                department === dept && [
                  departmentStyles.departmentTextActive,
                  { color: theme.colors.card },
                ],
              ]}
            >
              {dept}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {!!error && touched && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginTop: spacing(0.5),
            gap: 4,
          }}
        >
          {Platform.OS === "web" ? (
            <Text style={{ color: colors.error }}>
              <MaterialIcons
                name="error-outline"
                size={14}
                color={colors.error}
              />
            </Text>
          ) : (
            <IconWrapper style={{ color: colors.error }}>
              <MaterialIcons
                name="error-outline"
                size={14}
                color={colors.error}
              />
            </IconWrapper>
          )}
          <Text style={{ color: colors.error, fontSize: fontSize(12) }}>
            {error}
          </Text>
        </View>
      )}
    </View>
  );
};

const useFormValidation = () => {
  const validateEmail = useCallback((email: string): string => {
    if (!email) return "El correo electrónico es requerido";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Ingresa un correo electrónico válido";
    return "";
  }, []);

  const validatePassword = useCallback((password: string): string => {
    if (!password) return "La contraseña es requerida";
    if (password.length < 6) return "Mínimo 6 caracteres requeridos";
    return "";
  }, []);

  const validateConfirmPassword = useCallback(
    (password: string, confirmPassword: string): string => {
      if (!confirmPassword) return "Confirma tu contraseña";
      if (password !== confirmPassword) return "Las contraseñas no coinciden";
      return "";
    },
    [],
  );

  const validateNumeroEmpleado = useCallback(
    (numeroEmpleado: string): string => {
      if (!numeroEmpleado || !numeroEmpleado.trim())
        return "El número de empleado es requerido";
      if (numeroEmpleado.trim().length < 3)
        return "Debe tener al menos 3 caracteres";
      if (!/^[A-Za-z0-9]+$/.test(numeroEmpleado.trim()))
        return "Solo letras y números sin espacios";
      return "";
    },
    [],
  );

  const validateNombre = useCallback((nombre: string): string => {
    if (!nombre || !nombre.trim()) return "El nombre es requerido";
    if (nombre.trim().length < 2) return "Debe tener al menos 2 caracteres";
    return "";
  }, []);

  const validateApellido = useCallback(
    (apellido: string, tipo: "paterno" | "materno"): string => {
      if (!apellido || !apellido.trim()) {
        if (tipo === "paterno") return "El apellido paterno es requerido";
        return "El apellido materno es requerido";
      }
      if (apellido.trim().length < 2) return "Debe tener al menos 2 caracteres";
      return "";
    },
    [],
  );

  const validatePhone = useCallback((phone: string): string => {
    if (!phone || !phone.trim()) return "";
    const cleanPhone = phone.replace(/[\s\-()]/g, "");
    if (!/^\+?[0-9]{10,15}$/.test(cleanPhone)) {
      return "Formato inválido. Ingresa 10-15 dígitos";
    }
    return "";
  }, []);

  const validateDepartamento = useCallback((departamento: string): string => {
    if (!departamento || !departamento.trim()) return "Ingresa el departamento";
    return "";
  }, []);

  const validatePuesto = useCallback((puesto: string): string => {
    if (!puesto || !puesto.trim()) return "El puesto es requerido";
    if (puesto.trim().length < 2) return "Debe tener al menos 2 caracteres";
    return "";
  }, []);

  return {
    validateEmail,
    validatePassword,
    validateConfirmPassword,
    validateNumeroEmpleado,
    validateNombre,
    validateApellido,
    validatePhone,
    validateDepartamento,
    validatePuesto,
  };
};

const useAuthForm = () => {
  const [message, setMessage] = useState<
    { type: string; text: string; duration?: number } | undefined
  >();

  const showMessage = useCallback(
    (type: string, text: string, duration: number = 5000) => {
      setMessage({ type, text, duration });
    },
    [],
  );

  const clearMessage = useCallback(() => {
    setMessage(undefined);
  }, []);

  return {
    message,
    showMessage,
    clearMessage,
  };
};

const useLogin = () => {
  const { login, loginWithEmployeeNumber } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState<number>(0);

  const handleLogin = async (
    email: string,
    password: string,
  ): Promise<{ success: boolean; message?: string; locked?: boolean }> => {
    
    const lockStatus = await loginSecurityService.isLocked(email);
    if (lockStatus.locked && lockStatus.remainingTime) {
      setIsLocked(true);
      setLockoutTime(lockStatus.remainingTime);
      const timeStr = loginSecurityService.formatRemainingTime(
        lockStatus.remainingTime,
      );
      setError(`Cuenta bloqueada. Intenta de nuevo en ${timeStr}`);
      return {
        success: false,
        locked: true,
        message: `Cuenta bloqueada temporalmente. Espera ${timeStr}`,
      };
    }

    setLoading(true);
    setError(null);
    setIsLocked(false);

    try {
      await login(email, password);
      
      await loginSecurityService.clearAttempts(email);

      
      if (Platform.OS === "web") {
        window.history.replaceState({}, "", "/");
      }

      return { success: true };
    } catch (err: any) {
      
      const attemptData = await loginSecurityService.recordFailedAttempt(email);

      
      let errorMessage = err.message || "Error de conexión";

      
      if (errorMessage.includes("❌")) {
        errorMessage = errorMessage.replace("❌", "").trim();
      }

      
      const attemptsMessage = loginSecurityService.getAttemptMessage(
        attemptData.attempts,
      );
      const finalMessage = attemptsMessage || errorMessage;
      setError(finalMessage);

      if (attemptData.lockoutUntil) {
        setIsLocked(true);
        setLockoutTime(attemptData.lockoutUntil - Date.now());
      }

      return { success: false, message: finalMessage };
    } finally {
      setLoading(false);
    }
  };

  const handleLoginWithEmployeeNumber = async (
    numeroEmpleado: string,
    password: string,
  ): Promise<{ success: boolean; message?: string; locked?: boolean }> => {
    
    const lockStatus = await loginSecurityService.isLocked(numeroEmpleado);
    if (lockStatus.locked && lockStatus.remainingTime) {
      setIsLocked(true);
      setLockoutTime(lockStatus.remainingTime);
      const timeStr = loginSecurityService.formatRemainingTime(
        lockStatus.remainingTime,
      );
      setError(`Cuenta bloqueada. Intenta de nuevo en ${timeStr}`);
      return {
        success: false,
        locked: true,
        message: `Cuenta bloqueada temporalmente. Espera ${timeStr}`,
      };
    }

    setLoading(true);
    setError(null);
    setIsLocked(false);

    try {
      await loginWithEmployeeNumber(numeroEmpleado, password);
      
      await loginSecurityService.clearAttempts(numeroEmpleado);

      
      if (Platform.OS === "web") {
        window.history.replaceState({}, "", "/");
      }

      return { success: true };
    } catch (err: any) {
      
      const attemptData =
        await loginSecurityService.recordFailedAttempt(numeroEmpleado);

      
      let errorMessage =
        err.message || "Número de empleado o contraseña incorrectos";

      
      if (errorMessage.includes("❌")) {
        errorMessage = errorMessage.replace("❌", "").trim();
      }

      
      const attemptsMessage = loginSecurityService.getAttemptMessage(
        attemptData.attempts,
      );
      const finalMessage = attemptsMessage || errorMessage;
      setError(finalMessage);

      if (attemptData.lockoutUntil) {
        setIsLocked(true);
        setLockoutTime(attemptData.lockoutUntil - Date.now());
      }

      return { success: false, message: finalMessage };
    } finally {
      setLoading(false);
    }
  };

  return {
    handleLogin,
    handleLoginWithEmployeeNumber,
    loading,
    error,
    isLocked,
    lockoutTime,
  };
};

const useRegister = () => {
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (
    registerData: RegisterFormData,
  ): Promise<{ success: boolean; message?: string }> => {
    setLoading(true);
    setError(null);

    try {
      
      const payload: any = {
        numeroEmpleado: registerData.numeroEmpleado,
        nombre: registerData.nombre,
        apellidoPaterno: registerData.apellido_paterno,
        apellidoMaterno: registerData.apellido_materno,
        correoElectronico: registerData.email,
        telefono: registerData.phone,
        departamento: registerData.department,
        puesto: registerData.puesto,
        rol: registerData.rol || "empleado",
        contrasena: registerData.password,
        confirmarContrasena: registerData.confirmPassword,
      };

      await register(payload);
      return {
        success: true,
        message:
          "¡Registro exitoso! Hemos enviado un correo de verificación a tu bandeja de entrada.",
      };
    } catch (err: any) {
      let errorMessage = err?.message || "Error en el registro";
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return {
    handleRegister,
    loading,
    error,
  };
};

const LoginScreen: React.FC = () => {
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [loginAttempts, setLoginAttempts] = useState<number>(0);

  
  const [identifier, setIdentifier] = useState<string>(""); 
  const [password, setPassword] = useState<string>("");

  const [registerData, setRegisterData] = useState<RegisterFormData>({
    numeroEmpleado: "",
    nombre: "",
    apellido_paterno: "",
    apellido_materno: "",
    email: "",
    phone: "",
    department: "",
    puesto: "",
    rol: "empleado",
    password: "",
    confirmPassword: "",
  });

  
  const [isVerifying, setIsVerifying] = useState(false);

  
  const identifierInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);

  
  
  const navigation = useNavigation();
  const { theme, colors } = useTheme();
  
  const { header, setHeader } = useHeader();

  
  const headerRef = useRef(header);
  useEffect(() => {
    headerRef.current = header;
  }, [header]);

  
  const [message, setMessage] = useState<
    { type: string; text: string; duration?: number } | undefined
  >(undefined);

  const clearMessage = useCallback(() => setMessage(undefined), []);

  const showMessage = useCallback(
    (
      type: "success" | "error" | "warning" | "info" | "brand",
      text: string,
      duration: number = 5000,
    ) => {
       
      setMessage({ type, text, duration });
      if (duration > 0) {
        setTimeout(() => setMessage(undefined), duration);
      }
    },
    [],
  );

  
  useEffect(() => {
    
    setHeader({ hidden: true, manual: true, owner: "Login" });
    return () => {
      
      try {
        const currentHeader = headerRef.current;
        if (
          currentHeader &&
          (currentHeader.owner === "Login" ||
            (currentHeader.manual && currentHeader.hidden === true))
        ) {
          setHeader(null);
        }
      } catch (e) {
        
      }
    };
  }, [setHeader]);
  const {
    validateEmail,
    validatePassword,
    validateConfirmPassword,
    validateNumeroEmpleado,
    validateNombre,
    validateApellido,
    validatePhone,
    validateDepartamento,
    validatePuesto,
  } = useFormValidation();
  const {
    handleLogin,
    handleLoginWithEmployeeNumber,
    loading: loginLoading,
    error: loginError,
  } = useLogin();
  const {
    handleRegister,
    loading: registerLoading,
    error: registerError,
  } = useRegister();
  const { isMobile, isTablet, isDesktop, isWeb, isIOS, rv, spacing, fontSize } =
    useResponsive();

  const loading = loginLoading || registerLoading || isVerifying;

  
  const isEmail = useMemo(() => {
    return identifier.includes("@");
  }, [identifier]);

  
  const identifierError = useMemo(() => {
    if (!identifier) return "";
    return isEmail
      ? validateEmail(identifier)
      : validateNumeroEmpleado(identifier);
  }, [identifier, isEmail, validateEmail, validateNumeroEmpleado]);

  const passwordError = useMemo(() => {
    return validatePassword(password);
  }, [password, validatePassword]);

  const registerErrors = useMemo(
    () => ({
      numeroEmpleado: validateNumeroEmpleado(registerData.numeroEmpleado),
      nombre: validateNombre(registerData.nombre),
      apellido_paterno: validateApellido(
        registerData.apellido_paterno,
        "paterno",
      ),
      apellido_materno: validateApellido(
        registerData.apellido_materno,
        "materno",
      ),
      email: validateEmail(registerData.email),
      phone: validatePhone(registerData.phone),
      password: validatePassword(registerData.password),
      confirmPassword: validateConfirmPassword(
        registerData.password,
        registerData.confirmPassword,
      ),
      department: validateDepartamento(registerData.department),
      puesto: validatePuesto(registerData.puesto),
    }),
    [
      registerData,
      validateNumeroEmpleado,
      validateNombre,
      validateApellido,
      validateEmail,
      validatePhone,
      validatePassword,
      validateConfirmPassword,
      validateDepartamento,
      validatePuesto,
    ],
  );

  const isLoginValid = useMemo(
    () => !identifierError && !passwordError && identifier && password,
    [identifierError, passwordError, identifier, password],
  );

  const isRegisterValid = useMemo(
    () =>
      !registerErrors.numeroEmpleado &&
      !registerErrors.nombre &&
      !registerErrors.apellido_paterno &&
      !registerErrors.apellido_materno &&
      !registerErrors.email &&
      !registerErrors.phone &&
      !registerErrors.password &&
      !registerErrors.confirmPassword &&
      !registerErrors.department &&
      !registerErrors.puesto &&
      registerData.numeroEmpleado &&
      registerData.nombre &&
      registerData.apellido_paterno &&
      registerData.apellido_materno &&
      registerData.email &&
      registerData.password &&
      registerData.confirmPassword &&
      registerData.department &&
      registerData.puesto,
    [registerErrors, registerData],
  );

  
  useEffect(() => {
    if (loginError) {
      setLoginAttempts((prev) => prev + 1);
      let messageType: "error" | "warning" = "error";
      let messageDuration = 5000;
      let messageText = loginError;

      
      if (loginError.includes("Credenciales incorrectas")) {
        messageText = `Credenciales incorrectas. ${loginAttempts >= 3 ? "¿Olvidaste tu contraseña?" : "Verifica tus datos."}`;
        if (loginAttempts >= 3) messageType = "warning";
      }

      showMessage(messageType, messageText, messageDuration);

      
      try {
        (identifierInputRef.current as any)?.shake?.();
        (passwordInputRef.current as any)?.shake?.();
        (identifierInputRef.current as any)?.focus?.();
      } catch (e) {
        
      }
    }
  }, [loginError, showMessage]);

  useEffect(() => {
    if (registerError) {
      showMessage("error", registerError, 6000);
    }
  }, [registerError, showMessage]);

  
  const handleFieldTouch = useCallback((fieldName: string) => {
    setTouchedFields((prev) => new Set(prev).add(fieldName));
  }, []);

  const handleToggleMode = useCallback(() => {
    if (loading) return;
    setIsLogin((prev) => !prev);
    setIdentifier("");
    setPassword("");
    setRegisterData({
      numeroEmpleado: "",
      nombre: "",
      apellido_paterno: "",
      apellido_materno: "",
      email: "",
      phone: "",
      department: "",
      puesto: "",
      rol: "empleado",
      password: "",
      confirmPassword: "",
    });
    setTouchedFields(new Set());
    setLoginAttempts(0);
    setLoginAttempts(0);
    clearMessage();
  }, [loading, clearMessage]);

  
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successModalMessage, setSuccessModalMessage] = useState("");

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    
    setIsLogin(true);
    setRegisterData({
      numeroEmpleado: "",
      nombre: "",
      apellido_paterno: "",
      apellido_materno: "",
      email: "",
      phone: "",
      department: "",
      puesto: "",
      rol: "empleado",
      password: "",
      confirmPassword: "",
    });
    setTouchedFields(new Set());
    clearMessage();
  };

  const handleLoginSubmit = useCallback(async () => {
    if (!isLoginValid) {
      setTouchedFields(new Set(["identifier", "password"]));
      showMessage(
        "error",
        "Por favor completa todos los campos correctamente",
        4000,
      );
      
      try {
        if (identifierError) {
          (identifierInputRef.current as any)?.shake?.();
          (identifierInputRef.current as any)?.focus?.();
        } else {
          (passwordInputRef.current as any)?.shake?.();
          (passwordInputRef.current as any)?.focus?.();
        }
      } catch (e) {
        
      }
      return;
    }
    
    
    
    
    
    
    
    try {
      setIsVerifying(true);

      
      if (isEmail) {
        await handleLogin(identifier, password);
      } else {
        await handleLoginWithEmployeeNumber(identifier, password);
      }
    } catch (e: any) {
      
      
      const errorMsg = e.message?.includes("Invalid")
        ? "Credenciales incorrectas"
        : e.message || "Error al iniciar sesión";
      showMessage("error", errorMsg, 3000);
      try {
        (identifierInputRef.current as any)?.shake?.();
        (passwordInputRef.current as any)?.shake?.();
      } catch (_) {}
    } finally {
      setIsVerifying(false);
    }
  }, [
    handleLogin,
    handleLoginWithEmployeeNumber,
    identifier,
    password,
    isEmail,
    isLoginValid,
    showMessage,
    identifierError,
  ]);

  const handleRegisterSubmit = useCallback(async () => {
    if (!isRegisterValid) {
      setTouchedFields(
        new Set([
          "numeroEmpleado",
          "nombre",
          "apellido_paterno",
          "apellido_materno",
          "email",
          "phone",
          "puesto",
          "department",
          "password",
          "confirmPassword",
        ]),
      );
      showMessage(
        "error",
        "Por favor completa todos los campos requeridos",
        5000,
      );
      return;
    }

    

    const result = await handleRegister(registerData);

    

    if (result.success) {
      
      
      showMessage("success", result.message || "¡Registro exitoso!", 4000);

      
      setSuccessModalMessage(
        "Tu cuenta ha sido creada. Hemos enviado un correo de verificación a tu bandeja de entrada.\n\nPor favor, revisa tu correo y haz clic en el enlace de verificación antes de iniciar sesión.",
      );
      setShowSuccessModal(true);
    } else {
      
      
      if (result.message) {
        showMessage("error", result.message, 6000);
      }
    }
  }, [
    handleRegister,
    registerData,
    isRegisterValid,
    showMessage,
    clearMessage,
  ]);

  const handleForgotPassword = useCallback(() => {
    navigation.navigate("ForgotPassword" as never);
  }, [navigation]);

  
  const dynamicColors = useMemo(
    () => ({
      background: theme.colors.background,
      card: theme.colors.card,
      text: BRAND_DARK,
      textSecondary: BRAND_GRAY,
      border: theme.colors.border,
      inputBg: colors.card,
      accent: BRAND_PRIMARY,
      white: theme.colors.card,
    }),
    [theme, colors],
  );

  
  const responsiveStyles = useMemo(
    () => ({
      container: {
        flex: 1,
        backgroundColor: dynamicColors.background,
      },
      card: {
        padding: spacing(3),
        marginBottom: spacing(2),
        borderRadius: rv(12, 16, 20),
        maxWidth: (isDesktop ? 500 : undefined) as any,
        alignSelf: (isDesktop ? "center" : "stretch") as "center" | "stretch",
        width: (isDesktop ? (isWeb ? "50%" : "80%") : "100%") as any,
        backgroundColor: dynamicColors.card,
      },
      headerTitle: {
        fontSize: fontSize(rv(15, 18, 20)),
        marginBottom: spacing(0.5),
        color: dynamicColors.text,
      },
    }),
    [rv, isDesktop, isWeb, spacing, fontSize, dynamicColors],
  );

  
  const renderLoginForm = useMemo(
    () => (
      <>
        <CustomInput
          ref={identifierInputRef}
          label="Correo o Número de Empleado"
          value={identifier}
          onChangeText={(text) => setIdentifier(text.trim())}
          onFocus={() => handleFieldTouch("identifier")}
          placeholder="correo@ejemplo.com o EMP001"
          editable={!loading}
          autoCapitalize="none"
          keyboardType="default"
          icon={isEmail ? "email" : "badge"}
          error={identifierError}
          touched={touchedFields.has("identifier")}
          returnKeyType="next"
          onSubmitEditing={() => passwordInputRef.current?.focus()}
        />

        <CustomInput
          ref={passwordInputRef}
          label="Contraseña"
          value={password}
          onChangeText={(text) => setPassword(text)}
          onFocus={() => handleFieldTouch("password")}
          placeholder="Ingresa tu contraseña"
          secureTextEntry={!showPassword}
          isPassword={true}
          toggleVisibility={() => setShowPassword(!showPassword)}
          isVisible={showPassword}
          editable={!loading}
          autoCapitalize="none"
          icon="lock"
          error={passwordError}
          touched={touchedFields.has("password")}
          onSubmitEditing={handleLoginSubmit}
          returnKeyType="go"
        />
      </>
    ),
    [
      identifier,
      password,
      isEmail,
      showPassword,
      loading,
      identifierError,
      passwordError,
      touchedFields,
      handleFieldTouch,
      handleLoginSubmit,
    ],
  );

  const renderRegisterForm = useMemo(
    () => (
      <>
        <CustomInput
          label="Número de Empleado"
          value={registerData.numeroEmpleado}
          onChangeText={(text) =>
            setRegisterData((prev) => ({
              ...prev,
              numeroEmpleado: text.trim(),
            }))
          }
          onFocus={() => handleFieldTouch("numeroEmpleado")}
          placeholder="Ej: EMP001"
          editable={!loading}
          autoCapitalize="characters"
          icon="badge"
          error={registerErrors.numeroEmpleado}
          touched={touchedFields.has("numeroEmpleado")}
          returnKeyType="next"
        />

        <CustomInput
          label="Nombre"
          value={registerData.nombre}
          onChangeText={(text) =>
            setRegisterData((prev) => ({ ...prev, nombre: text }))
          }
          onFocus={() => handleFieldTouch("nombre")}
          placeholder="Ej: Juan"
          editable={!loading}
          autoCapitalize="words"
          icon="person"
          error={registerErrors.nombre}
          touched={touchedFields.has("nombre")}
          returnKeyType="next"
        />

        <CustomInput
          label="Apellido Paterno"
          value={registerData.apellido_paterno}
          onChangeText={(text) =>
            setRegisterData((prev) => ({ ...prev, apellido_paterno: text }))
          }
          onFocus={() => handleFieldTouch("apellido_paterno")}
          placeholder="Ej: Pérez"
          editable={!loading}
          autoCapitalize="words"
          icon="person"
          error={registerErrors.apellido_paterno}
          touched={touchedFields.has("apellido_paterno")}
          returnKeyType="next"
        />

        <CustomInput
          label="Apellido Materno"
          value={registerData.apellido_materno}
          onChangeText={(text) =>
            setRegisterData((prev) => ({ ...prev, apellido_materno: text }))
          }
          onFocus={() => handleFieldTouch("apellido_materno")}
          placeholder="Ej: García"
          editable={!loading}
          autoCapitalize="words"
          icon="person-outline"
          error={registerErrors.apellido_materno}
          touched={touchedFields.has("apellido_materno")}
          returnKeyType="next"
        />

        <CustomInput
          label="Correo Electrónico"
          value={registerData.email}
          onChangeText={(text) =>
            setRegisterData((prev) => ({ ...prev, email: text.trim() }))
          }
          onFocus={() => handleFieldTouch("email")}
          placeholder="ejemplo@empresa.com"
          editable={!loading}
          keyboardType="email-address"
          autoCapitalize="none"
          icon="email"
          error={registerErrors.email}
          touched={touchedFields.has("email")}
          returnKeyType="next"
        />

        <CustomInput
          label="Teléfono (opcional)"
          value={registerData.phone}
          onChangeText={(text) =>
            setRegisterData((prev) => ({ ...prev, phone: text.trim() }))
          }
          onFocus={() => handleFieldTouch("phone")}
          placeholder="5551234567"
          editable={!loading}
          keyboardType="phone-pad"
          icon="phone"
          error={registerErrors.phone}
          touched={touchedFields.has("phone")}
          returnKeyType="next"
        />

        <CustomInput
          label="Puesto"
          value={registerData.puesto}
          onChangeText={(text) =>
            setRegisterData((prev) => ({ ...prev, puesto: text }))
          }
          onFocus={() => handleFieldTouch("puesto")}
          placeholder="Ej: Operador, Supervisor"
          editable={!loading}
          autoCapitalize="words"
          icon="work"
          error={registerErrors.puesto}
          touched={touchedFields.has("puesto")}
          returnKeyType="next"
        />

        <CustomInput
          label="Departamento"
          value={registerData.department}
          onChangeText={(text) =>
            setRegisterData((prev) => ({ ...prev, department: text }))
          }
          onFocus={() => handleFieldTouch("department")}
          placeholder="Ej: Recursos Humanos"
          editable={!loading}
          autoCapitalize="words"
          icon="apartment"
          error={registerErrors.department}
          touched={touchedFields.has("department")}
          returnKeyType="next"
        />

        <CustomInput
          label="Contraseña"
          value={registerData.password}
          onChangeText={(text) =>
            setRegisterData((prev) => ({ ...prev, password: text }))
          }
          onFocus={() => handleFieldTouch("password")}
          placeholder="Mínimo 6 caracteres"
          secureTextEntry={!showPassword}
          isPassword={true}
          toggleVisibility={() => setShowPassword(!showPassword)}
          isVisible={showPassword}
          editable={!loading}
          autoCapitalize="none"
          icon="lock"
          error={registerErrors.password}
          touched={touchedFields.has("password")}
          returnKeyType="next"
        />

        <CustomInput
          label="Confirmar Contraseña"
          value={registerData.confirmPassword}
          onChangeText={(text) =>
            setRegisterData((prev) => ({ ...prev, confirmPassword: text }))
          }
          onFocus={() => handleFieldTouch("confirmPassword")}
          placeholder="Repite tu contraseña"
          secureTextEntry={!showConfirmPassword}
          isPassword={true}
          toggleVisibility={() => setShowConfirmPassword(!showConfirmPassword)}
          isVisible={showConfirmPassword}
          editable={!loading}
          autoCapitalize="none"
          icon="lock-outline"
          error={registerErrors.confirmPassword}
          touched={touchedFields.has("confirmPassword")}
          onSubmitEditing={handleRegisterSubmit}
          returnKeyType="go"
        />
      </>
    ),
    [
      registerData,
      showPassword,
      showConfirmPassword,
      loading,
      registerErrors,
      touchedFields,
      handleFieldTouch,
      handleRegisterSubmit,
    ],
  );

  const getKeyboardOffset = () => {
    if (isWeb) return 0;
    if (isIOS) return rv(60, 80, 100);
    return 0;
  };

  return (
    <SafeAreaView
      edges={["top", "left", "right", "bottom"]}
      style={[styles.safeArea, { backgroundColor: theme.colors.background }]}
    >
      <StatusBar
        backgroundColor={theme.colors.background}
        barStyle={theme.dark ? "light-content" : "dark-content"}
      />

      {}
      <AlertMessage message={message} onClose={() => clearMessage()} />
      <SuccessModal
        visible={showSuccessModal}
        title="¡Registro Exitoso!"
        message={successModalMessage}
        onClose={handleSuccessModalClose}
        buttonText="Iniciar Sesión"
      />

      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={getKeyboardOffset()}
      >
        <View
          style={[
            styles.appContainer,
            responsiveStyles.container,
            { backgroundColor: theme.colors.background },
          ]}
        >
          {}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingVertical: spacing(2), paddingHorizontal: spacing(2) },
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View
              style={[
                styles.card,
                responsiveStyles.card,
                { backgroundColor: theme.colors.card },
              ]}
            >
              <View style={styles.header}>
                <View style={styles.logoWrapper}>
                  <Image
                    source={require("../../../assets/icono.png")}
                    style={styles.logoImage}
                    resizeMode="contain"
                  />
                </View>
                <Text
                  style={[
                    styles.headerTitle,
                    responsiveStyles.headerTitle,
                    { color: theme.colors.text },
                  ]}
                >
                  SISTEMA DE CAPACITACIÓN
                </Text>
                <Text
                  style={[
                    styles.headerSubtitle,
                    { fontSize: fontSize(14), color: BRAND_GRAY },
                  ]}
                >
                  {isLogin ? "INICIO DE SESIÓN" : "REGISTRO DE EMPLEADO"}
                </Text>
                <View style={styles.toggleContainer}>
                  <TouchableOpacity
                    style={[
                      styles.toggleButton,
                      isLogin && [
                        styles.toggleButtonActive,
                        { backgroundColor: BRAND_PRIMARY },
                      ],
                    ]}
                    onPress={handleToggleMode}
                    disabled={loading}
                  >
                    <IconWrapper
                      style={{
                        color: isLogin ? theme.colors.card : BRAND_GRAY,
                      }}
                    >
                      <MaterialIcons
                        name="login"
                        size={16}
                        color={isLogin ? theme.colors.card : BRAND_GRAY}
                      />
                    </IconWrapper>
                    <Text
                      style={[
                        styles.toggleButtonText,
                        { color: BRAND_GRAY },
                        isLogin && [
                          styles.toggleButtonTextActive,
                          { color: theme.colors.card },
                        ],
                      ]}
                    >
                      Iniciar Sesión
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.toggleButton,
                      !isLogin && [
                        styles.toggleButtonActive,
                        { backgroundColor: BRAND_PRIMARY },
                      ],
                    ]}
                    onPress={handleToggleMode}
                    disabled={loading}
                  >
                    <IconWrapper
                      style={{
                        color: !isLogin ? theme.colors.card : BRAND_GRAY,
                      }}
                    >
                      <MaterialIcons
                        name="app-registration"
                        size={16}
                        color={!isLogin ? theme.colors.card : BRAND_GRAY}
                      />
                    </IconWrapper>
                    <Text
                      style={[
                        styles.toggleButtonText,
                        { color: BRAND_GRAY },
                        !isLogin && [
                          styles.toggleButtonTextActive,
                          { color: theme.colors.card },
                        ],
                      ]}
                    >
                      Registrarse
                    </Text>
                  </TouchableOpacity>
                </View>

                {isLogin && !!identifier && (
                  <View style={styles.identifierHint}>
                    <IconWrapper style={{ color: BRAND_GRAY }}>
                      <MaterialIcons
                        name={isEmail ? "email" : "badge"}
                        size={12}
                        color={BRAND_GRAY}
                      />
                    </IconWrapper>
                    <Text
                      style={[styles.identifierHintText, { color: BRAND_GRAY }]}
                    >
                      {isEmail
                        ? "Usando correo electrónico"
                        : "Usando número de empleado"}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.form}>
                {isLogin ? renderLoginForm : renderRegisterForm}

                {}
                {isLogin && (
                  <View
                    style={{
                      backgroundColor: BRAND_PRIMARY_LIGHT,
                      borderLeftWidth: 4,
                      borderLeftColor: BRAND_PRIMARY,
                      borderRadius: 8,
                      padding: 12,
                      marginTop: 16,
                      marginBottom: 8,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginBottom: 8,
                      }}
                    >
                      <IconWrapper style={{ marginRight: 6 }}>
                        <MaterialIcons
                          name="info"
                          size={18}
                          color={BRAND_PRIMARY}
                        />
                      </IconWrapper>
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: "700",
                          color: BRAND_PRIMARY,
                        }}
                      >
                        🎭 MODO DEMO - Credenciales de Prueba
                      </Text>
                    </View>
                    <Text
                      style={{
                        fontSize: 11,
                        color: BRAND_DARK,
                        marginBottom: 8,
                        fontStyle: "italic",
                      }}
                    >
                      Esta es una versión de demostración. Usa cualquiera de
                      estas cuentas:
                    </Text>
                    <View style={{ gap: 6 }}>
                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <Text
                          style={{
                            fontSize: 11,
                            fontWeight: "600",
                            color: BRAND_DARK,
                            width: 80,
                          }}
                        >
                          👨‍💼 Admin:
                        </Text>
                        <Text style={{ fontSize: 11, color: BRAND_DARK }}>
                          admin@demo.com / demo123
                        </Text>
                      </View>
                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <Text
                          style={{
                            fontSize: 11,
                            fontWeight: "600",
                            color: BRAND_DARK,
                            width: 80,
                          }}
                        >
                          👨‍🏫 Instructor:
                        </Text>
                        <Text style={{ fontSize: 11, color: BRAND_DARK }}>
                          instructor@demo.com / demo123
                        </Text>
                      </View>
                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <Text
                          style={{
                            fontSize: 11,
                            fontWeight: "600",
                            color: BRAND_DARK,
                            width: 80,
                          }}
                        >
                          👤 Empleado:
                        </Text>
                        <Text style={{ fontSize: 11, color: BRAND_DARK }}>
                          empleado@demo.com / demo123
                        </Text>
                      </View>
                    </View>
                  </View>
                )}

                {isLogin && (
                  <TouchableOpacity
                    style={styles.forgotPasswordButton}
                    onPress={handleForgotPassword}
                    disabled={loading}
                  >
                    <Text
                      style={[
                        styles.forgotPasswordText,
                        { color: BRAND_PRIMARY },
                      ]}
                    >
                      ¿Olvidaste tu contraseña?
                    </Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[
                    styles.mainButton,
                    { backgroundColor: BRAND_PRIMARY },
                    loading && { opacity: 0.7 },
                  ]}
                  onPress={isLogin ? handleLoginSubmit : handleRegisterSubmit}
                  disabled={loading}
                  activeOpacity={0.7}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color={theme.colors.card} />
                  ) : (
                    <>
                      <IconWrapper style={{ color: theme.colors.card }}>
                        <MaterialIcons
                          name={isLogin ? "login" : "how-to-reg"}
                          size={20}
                          color={theme.colors.card}
                        />
                      </IconWrapper>
                      <Text style={styles.mainButtonText}>
                        {isLogin ? "INICIAR SESIÓN" : "COMPLETAR REGISTRO"}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>

              <View style={styles.toggleModeLinkContainer}>
                <Text
                  style={[
                    styles.toggleModeLinkText,
                    { fontSize: fontSize(14), color: theme.colors.text },
                  ]}
                >
                  {isLogin
                    ? "¿No tienes una cuenta? "
                    : "¿Ya tienes una cuenta? "}
                </Text>
                <TouchableOpacity onPress={handleToggleMode} disabled={loading}>
                  <Text
                    style={[
                      styles.toggleModeLinkButtonText,
                      { color: BRAND_PRIMARY },
                    ]}
                  >
                    {isLogin ? "Regístrate aquí" : "Inicia sesión aquí"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;
