import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@login_attempts';
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; 
const WARNING_THRESHOLD = 3;

export interface LoginAttemptData {
  attempts: number;
  lastAttempt: number;
  lockoutUntil?: number;
  identifier: string; 
}

class LoginSecurityService {
  
  async recordFailedAttempt(identifier: string): Promise<LoginAttemptData> {
    const data = await this.getAttemptData(identifier);
    
    const now = Date.now();
    const newAttempts = data.attempts + 1;
    
    const attemptData: LoginAttemptData = {
      identifier,
      attempts: newAttempts,
      lastAttempt: now,
    };

    
    if (newAttempts >= MAX_ATTEMPTS) {
      attemptData.lockoutUntil = now + LOCKOUT_DURATION;
    }

    await this.saveAttemptData(identifier, attemptData);
    return attemptData;
  }

  
  async clearAttempts(identifier: string): Promise<void> {
    await AsyncStorage.removeItem(`${STORAGE_KEY}_${identifier}`);
  }

  
  async isLocked(identifier: string): Promise<{ locked: boolean; remainingTime?: number }> {
    const data = await this.getAttemptData(identifier);
    
    if (!data.lockoutUntil) {
      return { locked: false };
    }

    const now = Date.now();
    
    if (now < data.lockoutUntil) {
      return {
        locked: true,
        remainingTime: data.lockoutUntil - now,
      };
    }

    
    await this.clearAttempts(identifier);
    return { locked: false };
  }

  
  async getAttemptData(identifier: string): Promise<LoginAttemptData> {
    try {
      const stored = await AsyncStorage.getItem(`${STORAGE_KEY}_${identifier}`);
      
      if (stored) {
        const data: LoginAttemptData = JSON.parse(stored);
        
        
        if (data.lockoutUntil && Date.now() >= data.lockoutUntil) {
          await this.clearAttempts(identifier);
          return {
            identifier,
            attempts: 0,
            lastAttempt: Date.now(),
          };
        }
        
        return data;
      }
    } catch (error) {
      
    }

    return {
      identifier,
      attempts: 0,
      lastAttempt: Date.now(),
    };
  }

  
  private async saveAttemptData(identifier: string, data: LoginAttemptData): Promise<void> {
    try {
      await AsyncStorage.setItem(`${STORAGE_KEY}_${identifier}`, JSON.stringify(data));
    } catch (error) {
      
    }
  }

  
  shouldShowWarning(attempts: number): boolean {
    return attempts >= WARNING_THRESHOLD && attempts < MAX_ATTEMPTS;
  }

  
  getAttemptMessage(attempts: number): string {
    const remaining = MAX_ATTEMPTS - attempts;
    
    if (attempts === 0) {
      return '';
    }
    
    if (attempts >= MAX_ATTEMPTS) {
      return `Cuenta bloqueada temporalmente por seguridad. Intenta en ${this.formatDuration(LOCKOUT_DURATION)}.`;
    }
    
    if (attempts >= WARNING_THRESHOLD) {
      return `⚠️ Credenciales incorrectas. Te quedan ${remaining} ${remaining === 1 ? 'intento' : 'intentos'} antes del bloqueo.`;
    }
    
    return `Credenciales incorrectas. Intento ${attempts} de ${MAX_ATTEMPTS}.`;
  }

  
  formatDuration(ms: number): string {
    const minutes = Math.ceil(ms / 60000);
    return `${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`;
  }

  
  formatRemainingTime(ms: number): string {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    
    if (minutes > 0) {
      return `${minutes} min ${seconds} seg`;
    }
    return `${seconds} seg`;
  }

  
  getConfig() {
    return {
      maxAttempts: MAX_ATTEMPTS,
      lockoutDuration: LOCKOUT_DURATION,
      warningThreshold: WARNING_THRESHOLD,
    };
  }
}

export const loginSecurityService = new LoginSecurityService();
