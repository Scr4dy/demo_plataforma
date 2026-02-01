
import React from "react";
import { View, ActivityIndicator, Text, StyleSheet, Image } from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";

interface LoadingSpinnerProps {
  message?: string;
  size?: "small" | "large";
  color?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = "Cargando...",
  size = "large",
  color,
}) => {
  const { theme, colors } = useTheme();
  const spinnerColor = color || colors.primary;

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.spinnerWrapper}>
        <ActivityIndicator size={size} color={spinnerColor} />
      </View>
      <Text style={[styles.message, { color: theme.colors.textSecondary }]}>
        {message}
      </Text>
    </View>
  );
};

export const LoadingScreen: React.FC<{ message?: string }> = ({
  message = "Cargando aplicación...",
}) => {
  const { theme, colors } = useTheme();

  return (
    <View style={[styles.fullScreenContainer, { backgroundColor: "#FFFFFF" }]}>
      <View style={styles.brandIconContainer}>
        <Image
          source={require("../../assets/icono.png")}
          style={{ width: 160, height: 75, resizeMode: "contain" }}
        />
      </View>

      <ActivityIndicator size="large" color="#CC3333" />

      <Text
        style={[
          styles.message,
          { color: "#333333", marginTop: 24, fontWeight: "500" },
        ]}
      >
        {message}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 120,
  },
  fullScreenContainer: {
    flex: 1,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  spinnerWrapper: {
    padding: 20,
    borderRadius: 16,
  },
  brandIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
  },
  message: {
    marginTop: 12,
    fontSize: 15,
    textAlign: "center",
    opacity: 0.8,
  },
});

export default LoadingSpinner;
