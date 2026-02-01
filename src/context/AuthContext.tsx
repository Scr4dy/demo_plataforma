
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../config/supabase";
import { notificationService } from "../services/notificationService";
import { authService } from "../services/authService";
import { Platform } from "react-native";
import { AppConfig } from "../config/appConfig";
import { mockDataService } from "../services/mockDataService";

export interface User {
  id: string; 
  id_usuario?: number; 
  email: string;
  nombre?: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  role?: string;
  departamento?: string;
  telefono?: string;
  numeroEmpleado?: string;
  puesto?: string;
  avatar_path?: string | null; 
}

export interface AuthContextType {
  state: {
    isAuthenticated: boolean;
    user: User | null;
    loading: boolean;
    error: string | null;
    
    isRecoverySession?: boolean;
  };
  user?: User | null;
  isAdmin?: boolean;
  isInstructor?: boolean;
  isAuthenticated?: boolean;
  loading?: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithEmployeeNumber: (
    numeroEmpleado: string,
    password: string,
  ) => Promise<void>;
  register: (data: any) => Promise<any>;
  logout: () => Promise<void>;
  clearError: () => void;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export { AuthContext };

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState({
    isAuthenticated: false,
    user: null as User | null,
    loading: true,
    error: null as string | null,
    isRecoverySession: false as boolean,
  });

  useEffect(() => {
    const checkSession = async () => {
      
      if (AppConfig.useMockData) {
        try {
          const mockUserId = await AsyncStorage.getItem("mock_user_id");

          if (mockUserId) {
            const mockUser = await mockDataService.getCurrentUser(
              parseInt(mockUserId),
            );

            if (mockUser) {
              setState((prev) => ({
                ...prev,
                isAuthenticated: true,
                user: {
                  id: String(mockUser.id),
                  id_usuario: mockUser.id,
                  email: mockUser.email,
                  nombre: mockUser.full_name.split(" ")[0],
                  apellidoPaterno: mockUser.full_name.split(" ")[1] || "",
                  apellidoMaterno: mockUser.full_name.split(" ")[2] || "",
                  role: mockUser.role,
                  departamento: mockUser.department,
                  telefono: mockUser.telefono,
                  numeroEmpleado: mockUser.numeroEmpleado,
                  puesto: mockUser.puesto,
                  avatar_path: mockUser.avatar_url,
                },
                loading: false,
              }));
              return;
            }
          }

          setState((prev) => ({ ...prev, loading: false }));
        } catch (error) {
          
          setState((prev) => ({ ...prev, loading: false }));
        }
        return;
      }

      
      
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Session check timeout")), 8000),
      );

      try {
        await Promise.race([
          (async () => {
            try {
              const {
                data: { session },
                error,
              } = await supabase.auth.getSession();

              
              if (error) {
                const isTokenError =
                  error.message?.includes("refresh_token_not_found") ||
                  error.message?.includes("Invalid Refresh Token") ||
                  error.message?.includes("Not logged in");

                if (isTokenError) {
                  
                  await AsyncStorage.removeItem("auth_token");
                  await AsyncStorage.removeItem("flut-app-supabase-auth");
                  await AsyncStorage.removeItem("supabase.auth.token");

                  
                  try {
                    const keys = await AsyncStorage.getAllKeys();
                    const sbKeys = keys.filter((k) => k.startsWith("sb-"));
                    if (sbKeys.length > 0)
                      await AsyncStorage.multiRemove(sbKeys);
                  } catch (_) {}

                  setState((prev) => ({
                    ...prev,
                    loading: false,
                    isAuthenticated: false,
                    user: null,
                  }));
                  return;
                }
                throw error;
              }

              if (session?.user) {
                const { data: userData, error: userError } = await supabase
                  .from("usuarios")
                  .select("*")
                  .eq("auth_id", session.user.id)
                  .single();

                if (
                  userError &&
                  userError.code !== "PGRST116" &&
                  userError.code !== "PGRST205"
                )
                  throw userError;

                
                let recoveryFlag = false;
                try {
                  if (typeof window !== "undefined")
                    recoveryFlag =
                      window.localStorage.getItem("recovery_session") === "1";
                } catch (_) {
                  recoveryFlag = false;
                }

                setState((prev) => ({
                  ...prev,
                  isAuthenticated: true,
                  user: {
                    id: session.user.id,
                    id_usuario: userData?.id_usuario,
                    email: session.user.email || "",
                    nombre: userData?.nombre,
                    apellidoPaterno: userData?.apellido_paterno,
                    apellidoMaterno: userData?.apellido_materno,
                    role: userData?.rol,
                    departamento: userData?.departamento,
                    telefono: userData?.telefono,
                    numeroEmpleado: userData?.numero_empleado,
                    puesto: userData?.puesto,
                    avatar_path: userData?.avatar_path,
                  },
                  loading: false,
                  isRecoverySession: recoveryFlag,
                }));
              } else {
                setState((prev) => ({ ...prev, loading: false }));
              }
            } catch (innerError) {
              throw innerError;
            }
          })(),
          timeoutPromise,
        ]);
      } catch (error: any) {
        
        await AsyncStorage.removeItem("auth_token");
        await AsyncStorage.removeItem("flut-app-supabase-auth");
        await AsyncStorage.removeItem("supabase.auth.token");
        try {
          const keys = await AsyncStorage.getAllKeys();
          const sbKeys = keys.filter(
            (k) => k.startsWith("sb-") && k.endsWith("-auth-token"),
          );
          if (sbKeys.length > 0) await AsyncStorage.multiRemove(sbKeys);
        } catch (_) {}

        setState((prev) => ({
          ...prev,
          loading: false,
          isAuthenticated: false,
          user: null,
        }));
      }
    };

    checkSession();

    
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT" || event === "TOKEN_REFRESHED") {
        if (event === "SIGNED_OUT") {
          
          try {
            if (typeof window !== "undefined")
              window.localStorage.removeItem("recovery_session");
          } catch (_) {}
          setState({
            isAuthenticated: false,
            user: null,
            loading: false,
            error: null,
            isRecoverySession: false,
          });
        }
      }

      if (event === "TOKEN_REFRESHED" && session) {
      }

      
      if (event === "SIGNED_OUT" && !session) {
        await AsyncStorage.removeItem("auth_token");
        await AsyncStorage.removeItem("flut-app-supabase-auth");
        await AsyncStorage.removeItem("supabase.auth.token");
        try {
          const keys = await AsyncStorage.getAllKeys();
          const sbKeys = keys.filter(
            (k) => k.startsWith("sb-") && k.endsWith("-auth-token"),
          );
          if (sbKeys.length > 0) await AsyncStorage.multiRemove(sbKeys);
        } catch (_) {}
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loginWithEmployeeNumber = useCallback(
    async (numeroEmpleado: string, password: string) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const rawId = String(numeroEmpleado || "").trim();
        if (!rawId) throw new Error("Número de empleado vacío");

        let userData: any = null;
        let userError: any = null;

        
        const tryQuery = async (field: string, value: string) => {
          try {
            const res = await supabase
              .from("usuarios")
              .select("correo, auth_id")
              .eq(field, value)
              .maybeSingle();
            if (res && res.error) return { error: res.error } as any;
            return { data: res.data } as any;
          } catch (e) {
            return { error: e } as any;
          }
        };

        
        const variants = Array.from(
          new Set([
            rawId,
            rawId.trim(),
            rawId.replace(/\s+/g, ""),
            rawId.replace(/\D+/g, ""),
          ]),
        ).filter((v) => v);

        for (const v of variants) {
          try {
            
            const res = await supabase
              .from("usuarios")
              .select("correo, auth_id, numero_control, numero_empleado")
              .or(`numero_empleado.eq.${v},numero_control.eq.${v}`)
              .maybeSingle();
            if (res && !res.error && res.data) {
              userData = res.data;
              break;
            }
          } catch (e) {
            
          }
        }

        
        if (!userData) {
          for (const v of variants) {
            const patternExact = v;
            const patternPartial = `%${v}%`;
            try {
              
              let res = await supabase
                .from("usuarios")
                .select("correo, auth_id, numero_control, numero_empleado")
                .ilike("numero_control", patternExact)
                .maybeSingle();
              if (res && !res.error && res.data) {
                userData = res.data;
                break;
              }

              res = await supabase
                .from("usuarios")
                .select("correo, auth_id, numero_control, numero_empleado")
                .ilike("numero_empleado", patternExact)
                .maybeSingle();
              if (res && !res.error && res.data) {
                userData = res.data;
                break;
              }

              
              res = await supabase
                .from("usuarios")
                .select("correo, auth_id, numero_control, numero_empleado")
                .ilike("numero_control", patternPartial)
                .maybeSingle();
              if (res && !res.error && res.data) {
                userData = res.data;
                break;
              }

              res = await supabase
                .from("usuarios")
                .select("correo, auth_id, numero_control, numero_empleado")
                .ilike("numero_empleado", patternPartial)
                .maybeSingle();
              if (res && !res.error && res.data) {
                userData = res.data;
                break;
              }
            } catch (e) {
              
            }
          }
        }

        if (!userData) {
          
          throw new Error(
            "Número de empleado o control no encontrado. Si crees que es un error, contacta al administrador.",
          );
        }

        if (!userData.correo) {
          
          throw new Error(
            "Usuario encontrado pero sin correo asociado. Contacta al administrador.",
          );
        }
        const { data, error } = await supabase.auth.signInWithPassword({
          email: userData.correo,
          password,
        });

        if (error) {
          
          if (
            error.message.includes("Invalid login credentials") ||
            error.message.includes("Invalid") ||
            error.message.includes("credentials")
          ) {
            throw new Error("Contraseña incorrecta");
          }
          throw error;
        }

        if (data.session?.user) {
          const { data: completeUserData, error: completeError } =
            await supabase
              .from("usuarios")
              .select("*")
              .eq("auth_id", data.session.user.id)
              .single();

          if (completeError && completeError.code !== "PGRST205")
            throw completeError;

          setState((prev) => ({
            ...prev,
            isAuthenticated: true,
            user: {
              id: data.session.user.id,
              id_usuario: completeUserData?.id_usuario,
              email: data.session.user.email || "",
              nombre: completeUserData?.nombre,
              apellidoPaterno: completeUserData?.apellido_paterno,
              apellidoMaterno: completeUserData?.apellido_materno,
              role: completeUserData?.rol,
              departamento: completeUserData?.departamento,
              telefono: completeUserData?.telefono,
              numeroEmpleado: completeUserData?.numero_empleado,
              puesto: completeUserData?.puesto,
              avatar_path: completeUserData?.avatar_path,
            },
            loading: false,
          }));

          await AsyncStorage.setItem("auth_token", data.session.access_token);

          
          if (completeUserData?.id_usuario) {
            try {
              await supabase
                .from("usuarios")
                .update({ ultimo_acceso: new Date().toISOString() })
                .eq("id_usuario", completeUserData.id_usuario);
            } catch (err) {
              
            }
          }
        }
      } catch (error: any) {
        setState((prev) => ({
          ...prev,
          error: error.message || "Error al iniciar sesión",
          loading: false,
        }));
        throw error;
      }
    },
    [],
  );

  const login = useCallback(async (email: string, password: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      
      if (AppConfig.useMockData) {
        

        const { user: mockUser, error: mockError } =
          await mockDataService.login(email, password);

        if (mockError || !mockUser) {
          throw new Error(mockError || "Credenciales inválidas");
        }

        
        setState((prev) => ({
          ...prev,
          isAuthenticated: true,
          user: {
            id: String(mockUser.id),
            id_usuario: mockUser.id,
            email: mockUser.email,
            nombre: mockUser.full_name.split(" ")[0],
            apellidoPaterno: mockUser.full_name.split(" ")[1] || "",
            apellidoMaterno: mockUser.full_name.split(" ")[2] || "",
            role: mockUser.role,
            departamento: mockUser.department,
            telefono: mockUser.telefono,
            numeroEmpleado: mockUser.numeroEmpleado,
            puesto: mockUser.puesto,
            avatar_path: mockUser.avatar_url,
          },
          loading: false,
        }));

        
        await AsyncStorage.setItem("mock_user_id", String(mockUser.id));
        await AsyncStorage.setItem("auth_token", "mock_token_" + mockUser.id);

        
        return;
      }

      
      
      let authEmail = email;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        let userData: any = null;
        let userError: any = null;
        try {
          const res1 = await supabase
            .from("usuarios")
            .select("correo, auth_id")
            .eq("numero_control", email)
            .maybeSingle();
          userData = res1.data;
          userError = res1.error;

          if (!userData) {
            const res2 = await supabase
              .from("usuarios")
              .select("correo, auth_id")
              .eq("numero_empleado", email)
              .maybeSingle();
            userData = res2.data;
            userError = res2.error;
          }
        } catch (e) {
          userError = e;
        }

        if (userError || !userData) {
          
          throw new Error("Usuario no encontrado con ese identificador");
        }

        authEmail = userData.correo;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password,
      });

      if (error) {
        
        if (
          error.message.includes("Invalid login credentials") ||
          error.message.includes("Invalid") ||
          error.message.includes("credentials")
        ) {
          throw new Error("Correo o contraseña incorrectos");
        }
        throw error;
      }

      if (data.session?.user) {
        const { data: userData, error: userError } = await supabase
          .from("usuarios")
          .select("*")
          .eq("auth_id", data.session.user.id)
          .single();

        if (
          userError &&
          userError.code !== "PGRST116" &&
          userError.code !== "PGRST205"
        ) {
          
          throw userError;
        }

        setState((prev) => ({
          ...prev,
          isAuthenticated: true,
          user: {
            id: data.session.user.id,
            id_usuario: userData?.id_usuario,
            email: data.session.user.email || "",
            nombre: userData?.nombre,
            apellidoPaterno: userData?.apellido_paterno,
            apellidoMaterno: userData?.apellido_materno,
            role: userData?.rol,
            departamento: userData?.departamento,
            telefono: userData?.telefono,
            numeroEmpleado: userData?.numero_control,
            puesto: userData?.puesto,
            avatar_path: userData?.avatar_path,
          },
          loading: false,
        }));

        await AsyncStorage.setItem("auth_token", data.session.access_token);

        
        if (userData?.id_usuario) {
          try {
            await supabase
              .from("usuarios")
              .update({ ultimo_acceso: new Date().toISOString() })
              .eq("id_usuario", userData.id_usuario);
          } catch (err) {
            
          }
        }
      } else {
        
      }
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        error: error.message || "Error al iniciar sesión",
        loading: false,
      }));
      throw error;
    }
  }, []);

  const register = useCallback(async (data: any) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      
      const payload = {
        numeroControl: data.numeroEmpleado,
        nombre: data.nombre,
        apellidoPaterno: data.apellidoPaterno,
        apellidoMaterno: data.apellidoMaterno,
        correoElectronico: data.correoElectronico,
        telefono: data.telefono,
        departamento: data.departamento,
        puesto: data.puesto,
        rol: data.rol,
        contrasena: data.contrasena,
        confirmarContrasena: data.confirmarContrasena,
      };

      
      const result = await authService.register(payload);

      
      try {
        await notificationService.notifyUserRegistration({
          nombre: data.nombre,
          apellido_paterno: data.apellidoPaterno,
          apellido_materno: data.apellidoMaterno,
          correo: data.correoElectronico,
          numero_empleado: data.numeroEmpleado,
          departamento: data.departamento,
          puesto: data.puesto,
        });
      } catch (notifyError) {
        
      }

      
      
      

      return result;
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error.message || "Error en el registro",
      }));
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true }));

      
      if (AppConfig.useMockData) {
        await AsyncStorage.removeItem("mock_user_id");
        await AsyncStorage.removeItem("auth_token");

        setState({
          isAuthenticated: false,
          user: null,
          loading: false,
          error: null,
          isRecoverySession: false,
        });

        
        return;
      }

      
      
      const { error } = await supabase.auth.signOut();

      
      const isSessionError =
        error &&
        (error.message?.includes("session missing") ||
          error.message?.includes("Session not found") ||
          error.message?.includes("Invalid Refresh Token") ||
          error.message?.includes("refresh_token_not_found"));

      if (error && !isSessionError) {
        :",
          error.message,
        );
      }

      
      await AsyncStorage.removeItem("auth_token");
      await AsyncStorage.removeItem("flut-app-supabase-auth");
      await AsyncStorage.removeItem("supabase.auth.token");
      try {
        const keys = await AsyncStorage.getAllKeys();
        const sbKeys = keys.filter(
          (k) => k.startsWith("sb-") && k.endsWith("-auth-token"),
        );
        if (sbKeys.length > 0) await AsyncStorage.multiRemove(sbKeys);
      } catch (_) {}

      setState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null,
        isRecoverySession: false,
      });
    } catch (error: any) {
      

      
      await AsyncStorage.removeItem("auth_token");
      await AsyncStorage.removeItem("flut-app-supabase-auth");
      await AsyncStorage.removeItem("supabase.auth.token");
      try {
        const keys = await AsyncStorage.getAllKeys();
        const sbKeys = keys.filter(
          (k) => k.startsWith("sb-") && k.endsWith("-auth-token"),
        );
        if (sbKeys.length > 0) await AsyncStorage.multiRemove(sbKeys);
      } catch (_) {}

      setState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null,
        isRecoverySession: false,
      });
    }
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const refreshToken = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        
        if (
          error.message?.includes("refresh_token_not_found") ||
          error.message?.includes("Invalid Refresh Token")
        ) {
          
          try {
            await logout();
          } catch (e) {
            
          }
          return;
        }
        throw error;
      }

      if (data.session?.access_token) {
        await AsyncStorage.setItem("auth_token", data.session.access_token);
      }
    } catch (error: any) {
      
      throw error;
    }
  }, [logout]);

  const value: AuthContextType = React.useMemo(
    () => ({
      state,
      user: state.user,
      isAdmin: !!(
        state.user && (state.user.role || "").toLowerCase().includes("admin")
      ),
      isInstructor: !!(
        state.user && (state.user.role || "").toLowerCase().includes("instr")
      ),
      isAuthenticated: state.isAuthenticated,
      loading: state.loading,
      login,
      loginWithEmployeeNumber,
      register,
      logout,
      clearError,
      refreshToken,
    }),
    [
      state,
      login,
      loginWithEmployeeNumber,
      register,
      logout,
      clearError,
      refreshToken,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de AuthProvider");
  }
  return context;
};
