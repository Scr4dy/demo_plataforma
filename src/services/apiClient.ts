
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  status: number;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiClient {
  private authToken: string | null = null;
  private readonly TOKEN_KEY = 'auth_token';

  constructor() {
    this.initializeToken();
  }

  private async initializeToken(): Promise<void> {
    try {
      const savedToken = await AsyncStorage.getItem(this.TOKEN_KEY);
      if (savedToken) {
        this.authToken = savedToken;
      }
    } catch (error) {
      
    }
  }

  
  private async simulateNetworkDelay(delay: number = 600): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  
  async get<T = any>(url: string): Promise<T> {
    await this.simulateNetworkDelay();
    
    
    return {} as T;
  }

  async post<T = any>(url: string, data?: any): Promise<T> {
    await this.simulateNetworkDelay(800);
    return {} as T;
  }

  async put<T = any>(url: string, data?: any): Promise<T> {
    await this.simulateNetworkDelay(700);
    return {} as T;
  }

  async patch<T = any>(url: string, data?: any): Promise<T> {
    await this.simulateNetworkDelay(500);
    return {} as T;
  }

  async delete<T = any>(url: string): Promise<T> {
    await this.simulateNetworkDelay(400);
    return {} as T;
  }

  
  async setAuthToken(token: string): Promise<void> {
    try {
      this.authToken = token;
      await AsyncStorage.setItem(this.TOKEN_KEY, token);
    } catch (error) {
      
    }
  }

  async clearAuthToken(): Promise<void> {
    try {
      this.authToken = null;
      await AsyncStorage.removeItem(this.TOKEN_KEY);
    } catch (error) {
      
    }
  }

  getAuthToken(): string | null {
    return this.authToken;
  }
}

export const apiClient = new ApiClient();
export default apiClient;