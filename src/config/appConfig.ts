import Constants from "expo-constants";

export const AppConfig = {
  
  
  useMockData: true,

  
  mockNetworkDelay: 500, 

  
  enableDebugLogs: true,

  
  features: {
    enableNotifications: false, 
    enableCertificates: true,
    enableTeams: true,
    enableAnalytics: false,
  },

  
  supabase: {
    url:
      Constants.expoConfig?.extra?.SUPABASE_URL ||
      process.env.SUPABASE_URL ||
      "",
    anonKey:
      Constants.expoConfig?.extra?.SUPABASE_ANON_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      "",
  },

  
  RESEND_API_KEY:
    Constants.expoConfig?.extra?.RESEND_RESET_PASS ||
    process.env.RESEND_RESET_PASS ||
    "",

  
  ADMIN_EMAIL:
    Constants.expoConfig?.extra?.ADMIN_EMAIL ||
    process.env.ADMIN_EMAIL ||
    "admin@demo.com",
};

export const debugLog = (message: string, ...args: any[]) => {
  if (AppConfig.enableDebugLogs) {
  }
};

export const debugWarn = (message: string, ...args: any[]) => {
  if (AppConfig.enableDebugLogs) {
    
  }
};

export const debugError = (message: string, ...args: any[]) => {
  
};
