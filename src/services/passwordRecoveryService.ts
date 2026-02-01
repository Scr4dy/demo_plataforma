
import { supabase } from "../config/supabase";
import { emailService } from "./emailService";

import { Platform } from "react-native";

interface PasswordRecoveryResult {
  success: boolean;
  message: string;
  error?: string;
}

class PasswordRecoveryService {
  
  async sendPasswordResetEmail(email: string): Promise<PasswordRecoveryResult> {
    try {
      

      
      

      
      const redirectUrl = this.getRedirectUrl();
      

      
      const { data, error } = await supabase.auth.resetPasswordForEmail(
        email.toLowerCase().trim(),
        {
          redirectTo: redirectUrl,
        },
      );

      if (error) {
        

        
        if (error.message.includes("Rate limit")) {
          return {
            success: false,
            message:
              "Has solicitado demasiados correos. Espera unos minutos e intenta de nuevo.",
            error: error.message,
          };
        }

        
        if (error.status === 500) {
          return {
            success: false,
            message: "Error del servidor. Por favor contacta a soporte.",
            error: "SMTP Configuration Error",
          };
        }

        return {
          success: false,
          message: "Error al procesar la solicitud. Intenta de nuevo.",
          error: error.message,
        };
      }

      

      return {
        success: true,
        message:
          "Si el correo existe, recibirás instrucciones para recuperar tu contraseña.",
      };
    } catch (error: any) {
      
      return {
        success: false,
        message: "Error inesperado. Intenta de nuevo.",
        error: error.message,
      };
    }
  }

  
  private getRedirectUrl(): string {
    
    if (Platform.OS === "web" && typeof window !== "undefined") {
      return `${window.location.origin}/reset-password`;
    }

    
    
    return "https://appdemo.vercel.app/reset-password";
  }

  
  private async generateCustomResetToken(userId: number): Promise<string> {
    const token = this.generateRandomToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); 

    try {
      
      await supabase.from("password_reset_tokens").insert({
        user_id: userId,
        token,
        expires_at: expiresAt.toISOString(),
        used: false,
      });

      return token;
    } catch (error) {
      
      
      return token;
    }
  }

  
  private generateRandomToken(): string {
    const array = new Uint8Array(32);
    if (typeof crypto !== "undefined" && crypto.getRandomValues) {
      crypto.getRandomValues(array);
    } else {
      
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
    }
    return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
      "",
    );
  }
}

export const passwordRecoveryService = new PasswordRecoveryService();
export default passwordRecoveryService;
