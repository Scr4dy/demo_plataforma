import "dotenv/config";

export default {
  expo: {
    name: "Demo",
    slug: "empresa-app",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: false,
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.democapacitacion.app",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        NSCameraUsageDescription:
          "Esta aplicación necesita acceso a la cámara para tomar fotos de perfil.",
        NSPhotoLibraryUsageDescription:
          "Esta aplicación necesita acceso a tu galería para seleccionar fotos de perfil.",
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      edgeToEdgeEnabled: true,
      usesCleartextTraffic: true,
      package: "com.democapacitacion.app",
      permissions: [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
        "READ_MEDIA_IMAGES",
      ],
    },
    web: {
      favicon: "./assets/favicon.png",
      bundler: "metro",
    },
    plugins: [
      "expo-font",
      [
        "expo-build-properties",
        {
          android: {
            usesCleartextTraffic: true,
          },
          ios: {
            usesNonExemptEncryption: false,
          },
        },
      ],
    ],
    extra: {
      apiUrl: "http://localhost:8080/api",
      environment: "development",
      eas: {
        projectId: "fa9afc6c-1a16-4259-b622-07d7a9c89930",
      },
      
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
      RESEND_RESET_PASS: process.env.RESEND_RESET_PASS,
      ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    },
    scheme: "empresaapp",
  },
};
