
import { AppConfig } from "../config/appConfig";

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

interface SendPasswordResetParams {
  email: string;
  resetUrl: string;
  userName?: string;
}

class EmailService {
  private apiKey: string;
  private fromEmail: string;
  private fromName: string;

  constructor() {
    this.apiKey = AppConfig.RESEND_API_KEY || "";
    this.fromEmail = "onboarding@resend.dev"; 
    this.fromName = "Demo Capacitación";
  }

  
  async sendEmail({
    to,
    subject,
    html,
    from,
  }: SendEmailParams): Promise<{
    success: boolean;
    messageId?: string;
    error?: string;
  }> {
    try {
      if (!this.apiKey) {
        
        return { success: false, error: "API key no configurada" };
      }

      

      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: from || `${this.fromName} <${this.fromEmail}>`,
          to: [to],
          subject,
          html,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        
        return {
          success: false,
          error: data.message || "Error al enviar email",
        };
      }

      
      return {
        success: true,
        messageId: data.id,
      };
    } catch (error: any) {
      
      return {
        success: false,
        error: error.message || "Error desconocido",
      };
    }
  }

  
  async sendPasswordResetEmail({
    email,
    resetUrl,
    userName,
  }: SendPasswordResetParams): Promise<{ success: boolean; error?: string }> {
    const subject = "Recupera tu contraseña - Demo Capacitación";

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Recuperar Contraseña</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #E31B23 0%, #B71C1C 100%); padding: 40px 30px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                        🔐 Recuperar Contraseña
                      </h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <p style="margin: 0 0 20px; color: #1f2937; font-size: 16px; line-height: 1.6;">
                        Hola${userName ? ` <strong>${userName}</strong>` : ""},
                      </p>
                      
                      <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                        Recibimos una solicitud para restablecer la contraseña de tu cuenta en <strong>Demo Capacitación</strong>.
                      </p>
                      
                      <p style="margin: 0 0 30px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                        Haz clic en el siguiente botón para crear una nueva contraseña:
                      </p>
                      
                      <!-- CTA Button -->
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="padding: 20px 0;">
                            <a href="${resetUrl}" 
                               style="display: inline-block; padding: 16px 40px; background-color: #E31B23; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(227, 27, 35, 0.3);">
                              Restablecer Contraseña
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="margin: 30px 0 20px; color: #6b7280; font-size: 14px; line-height: 1.6;">
                        O copia y pega este enlace en tu navegador:
                      </p>
                      
                      <p style="margin: 0 0 30px; padding: 12px; background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; color: #4b5563; font-size: 13px; word-break: break-all;">
                        ${resetUrl}
                      </p>
                      
                      <!-- Security Notice -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 6px; padding: 16px; margin: 30px 0;">
                        <tr>
                          <td>
                            <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
                              <strong>⚠️ Importante:</strong> Este enlace expirará en <strong>1 hora</strong>. Si no solicitaste este cambio, ignora este correo y tu contraseña permanecerá sin cambios.
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                      <p style="margin: 0 0 10px; color: #6b7280; font-size: 13px;">
                        © ${new Date().getFullYear()} Demo Capacitación. Todos los derechos reservados.
                      </p>
                      <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                        Si tienes problemas, contacta a soporte: 
                        <a href="mailto:${AppConfig.ADMIN_EMAIL}" style="color: #E31B23; text-decoration: none;">
                          ${AppConfig.ADMIN_EMAIL}
                        </a>
                      </p>
                    </td>
                  </tr>
                  
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    const result = await this.sendEmail({
      to: email,
      subject,
      html,
    });

    return result;
  }
}

export const emailService = new EmailService();
export default emailService;
