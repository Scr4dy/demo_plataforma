import { supabase } from "../config/supabase";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  numeroControl: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  correoElectronico: string;
  telefono: string;
  departamento: string;
  puesto: string;
  rol: string;
  contrasena: string;
  confirmarContrasena: string;
}

export interface AuthResponse {
  token: string;
  tipoToken: string;
  fechaExpiracion: string;
  usuario: UserResponse;
}

export interface UserResponse {
  id: number;
  nombreCompleto: string;
  usuario: string;
  correoElectronico: string;
  rol: string;
  departamento: string;
  idEmpleado?: string;
  telefono?: string;
  fechaCreacion: string;
  fechaActualizacion: string;
  activo: boolean;
}

class AuthService {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      let authEmail = credentials.email;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(String(authEmail))) {
        let userData: any = null;
        try {
          const res1 = await supabase
            .from("usuarios")
            .select("correo")
            .eq("numero_control", authEmail)
            .maybeSingle();
          userData = res1.data;

          if (!userData) {
            const res2 = await supabase
              .from("usuarios")
              .select("correo")
              .eq("numero_empleado", authEmail)
              .maybeSingle();
            userData = res2.data;
          }
        } catch (e) {
          throw new Error("Usuario no encontrado con ese identificador");
        }

        if (!userData) {
          throw new Error("Usuario no encontrado con ese identificador");
        }

        authEmail = userData.correo;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password: credentials.password,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.user || !data.session) {
        throw new Error("No se pudo obtener la sesión del usuario");
      }

      const { data: profile } = await supabase
        .from("usuarios")
        .select("*")
        .eq("auth_id", data.user.id)
        .maybeSingle();

      const authResponse: AuthResponse = {
        token: data.session.access_token,
        tipoToken: "Bearer",
        fechaExpiracion: data.session.expires_at
          ? new Date(data.session.expires_at * 1000).toISOString()
          : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        usuario: {
          id: profile?.id_usuario || Number(data.user.id.substring(0, 8)),
          nombreCompleto: profile
            ? `${profile.nombre} ${profile.apellido_paterno} ${profile.apellido_materno || ""}`.trim()
            : data.user.email?.split("@")[0] || "Usuario",
          usuario:
            profile?.numero_control ||
            data.user.email?.split("@")[0] ||
            "usuario",
          correoElectronico:
            profile?.correo || data.user.email || credentials.email,
          rol: profile?.rol || "Empleado",
          departamento: profile?.departamento || "General",
          idEmpleado: profile?.numero_control,
          telefono: profile?.telefono || data.user.phone,
          fechaCreacion: profile?.fecha_registro || data.user.created_at,
          fechaActualizacion:
            profile?.ultimo_acceso ||
            data.user.updated_at ||
            data.user.created_at,
          activo: profile?.activo !== false,
        },
      };

      return authResponse;
    } catch (error: any) {
      throw new Error(error.message || "Error al iniciar sesión");
    }
  }

  async register(
    userData: RegisterRequest,
  ): Promise<{ mensaje: string; usuarioId: number }> {
    if (userData.contrasena !== userData.confirmarContrasena) {
      throw new Error("Las contraseñas no coinciden.");
    }

    if (userData.contrasena.length < 6) {
      throw new Error("La contraseña debe tener al menos 6 caracteres.");
    }

    let telefonoSanitizado: string | null = null;
    if (userData.telefono && userData.telefono.trim()) {
      telefonoSanitizado = userData.telefono.replace(/[\s\-()]/g, "");

      if (!/^\+?[0-9]{10,15}$/.test(telefonoSanitizado)) {
        throw new Error(
          "El teléfono debe contener entre 10 y 15 dígitos numéricos (ejemplo: 5551234567 o +525551234567)",
        );
      }
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: userData.correoElectronico,
        password: userData.contrasena,
        options: {
          data: {
            numero_control: userData.numeroControl,
            nombre: userData.nombre,
            apellido_paterno: userData.apellidoPaterno,
            apellido_materno: userData.apellidoMaterno,
            telefono: telefonoSanitizado,
            departamento: userData.departamento,
            puesto: userData.puesto,
            rol: userData.rol,
          },
        },
      });

      if (data.session) {
        await supabase.auth.signOut();
      }

      if (error) {
        if (error.message.includes("User already registered")) {
          throw new Error(
            "Este correo electrónico ya está registrado. Intenta iniciar sesión.",
          );
        }
        if (error.message.includes("Email not confirmed")) {
          throw new Error(
            "Correo no confirmado. Revisa tu bandeja de entrada.",
          );
        }

        throw new Error(error.message);
      }

      if (!data.user) {
        throw new Error(
          "No se pudo crear el usuario en el sistema de autenticación.",
        );
      }

      let userId: number | null = null;

      const roleMap: Record<string, string> = {
        administrador: "Administrador",
        instructor: "Instructor",
        empleado: "Empleado",
        admin: "Administrador",
      };

      const rolLowercase = (userData.rol || "").toLowerCase().trim();
      const rolNormalizado = roleMap[rolLowercase] || "Empleado";
      const { data: functionResult, error: insertError } = await supabase.rpc(
        "crear_usuario_registro",
        {
          p_auth_id: data.user.id,
          p_numero_control: userData.numeroControl,
          p_nombre: userData.nombre,
          p_apellido_paterno: userData.apellidoPaterno,
          p_apellido_materno: userData.apellidoMaterno,
          p_correo: userData.correoElectronico,
          p_telefono: telefonoSanitizado,
          p_departamento: userData.departamento,
          p_puesto: userData.puesto,
          p_rol: rolNormalizado,
        },
      );
      if (insertError) {
        if (
          insertError.code === "23505" &&
          insertError.message?.includes("auth_id")
        ) {
          return {
            mensaje:
              "Usuario registrado exitosamente. Revisa tu email para confirmar tu cuenta.",
            usuarioId: 0,
          };
        }

        // Log removed

        if (
          insertError.message.includes("Ya existe un usuario") ||
          insertError.message.includes("numero_control") ||
          insertError.message.includes("correo") ||
          insertError.message.includes("duplicate key") ||
          insertError.message.includes("unique constraint")
        ) {
          throw new Error(
            "Ya existe un usuario registrado con este correo o número de control. Por favor intenta iniciar sesión.",
          );
        }

        throw new Error(
          "Error al crear el registro del usuario: " + insertError.message,
        );
      }

      if (!functionResult || functionResult.length === 0) {
        throw new Error("No se pudo obtener el ID del usuario creado");
      }

      userId = functionResult[0].id_usuario;
      return {
        mensaje:
          "Usuario registrado exitosamente. Revisa tu email para confirmar tu cuenta.",
        usuarioId: userId!,
      };
    } catch (error: any) {
      throw new Error(error.message || "Error al registrar usuario");
    }
  }

  async getCurrentSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error || !data.session) {
      return null;
    }
    return data.session;
  }

  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
  }

  async refreshToken(): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.refreshSession();

    if (error || !data.session) {
      const errorMsg = error?.message || "No session";

      const isRefreshError =
        errorMsg.includes("refresh_token_not_found") ||
        errorMsg.includes("Invalid Refresh Token");

      if (!isRefreshError) {
      }
      throw new Error("No se pudo refrescar la sesión");
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.user!.id)
      .single();

    return {
      token: data.session.access_token,
      tipoToken: "Bearer",
      fechaExpiracion: data.session.expires_at
        ? new Date(data.session.expires_at * 1000).toISOString()
        : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      usuario: {
        id: Number(data.user!.id.substring(0, 8)),
        nombreCompleto:
          profile?.nombre_completo ||
          data.user!.email?.split("@")[0] ||
          "Usuario",
        usuario:
          profile?.usuario || data.user!.email?.split("@")[0] || "usuario",
        correoElectronico: data.user!.email || "",
        rol: profile?.rol || "Empleado",
        departamento: profile?.departamento || "General",
        idEmpleado: profile?.id_empleado,
        telefono: profile?.telefono || data.user!.phone,
        fechaCreacion: data.user!.created_at,
        fechaActualizacion: data.user!.updated_at || data.user!.created_at,
        activo: true,
      },
    };
  }

  async requestPasswordReset(email: string): Promise<{ mensaje: string }> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      throw new Error(error.message);
    }

    return {
      mensaje:
        "Se ha enviado un enlace de recuperación a tu correo electrónico",
    };
  }

  async changePassword(newPassword: string): Promise<{ mensaje: string }> {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      throw new Error(error.message);
    }

    return {
      mensaje: "Contraseña cambiada exitosamente",
    };
  }

  async getCurrentUser(): Promise<UserResponse | null> {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    return {
      id: Number(user.id.substring(0, 8)),
      nombreCompleto:
        profile?.nombre_completo || user.email?.split("@")[0] || "Usuario",
      usuario: profile?.usuario || user.email?.split("@")[0] || "usuario",
      correoElectronico: user.email || "",
      rol: profile?.rol || "Empleado",
      departamento: profile?.departamento || "General",
      idEmpleado: profile?.id_empleado,
      telefono: profile?.telefono || user.phone,
      fechaCreacion: user.created_at,
      fechaActualizacion: user.updated_at || user.created_at,
      activo: true,
    };
  }

  async isAuthenticated(): Promise<boolean> {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return !!session;
  }

  async getAuthToken(): Promise<string | null> {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.access_token || null;
  }
}

export const authService = new AuthService();
export default authService;
