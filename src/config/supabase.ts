
import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { AppConfig } from "./appConfig";

const SUPABASE_URL = AppConfig.useMockData
  ? "https://demo.supabase.co"
  : AppConfig.supabase.url;

const SUPABASE_ANON_KEY = AppConfig.useMockData
  ? "demo-anon-key-not-used-in-demo-mode"
  : AppConfig.supabase.anonKey;

if (!AppConfig.useMockData && (!SUPABASE_URL || !SUPABASE_ANON_KEY)) {
  throw new Error(
    "❌ Error de configuración: Faltan variables de entorno de Supabase.\n\n" +
      "Variables requeridas:\n" +
      "- SUPABASE_URL\n" +
      "- SUPABASE_ANON_KEY\n\n" +
      "Para usar el modo demo, configura useMockData: true en src/config/appConfig.ts",
  );
}

const AsyncStorageAdapter = {
  getItem: async (key: string) => {
    try {
      const value = await AsyncStorage.getItem(key);
      return value;
    } catch (error) {
      
      return null;
    }
  },
  setItem: async (key: string, value: string) => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      
    }
  },
  removeItem: async (key: string) => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      
    }
  },
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: Platform.OS === "web" ? undefined : AsyncStorageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === "web", 
    flowType: "implicit", 
    storageKey: "flut-app-supabase-auth",
  },
});

export const SUPABASE_CONFIG = {
  URL: SUPABASE_URL,
  ANON_KEY: SUPABASE_ANON_KEY,
};
