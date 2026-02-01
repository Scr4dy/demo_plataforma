import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { platformShadow } from "../../utils/styleHelpers";

export interface AlertMessageProps {
  message?:
    | { type: string; text: string; duration?: number }
    | null
    | undefined;
  onClose: () => void;
}

export const AlertMessage: React.FC<AlertMessageProps> = ({
  message,
  onClose,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { theme, colors } = useTheme();

  useEffect(() => {
    if (message) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [message, fadeAnim]);

  if (!message) return null;

  const getAlertColor = () => {
    switch (message.type) {
      case "success":
        return colors.success || "#10b981"; 
      case "brand":
        return "#E31B23"; 
      case "error":
        return colors.error || "#ef4444"; 
      case "warning":
        return colors.warning || "#f59e0b"; 
      case "info":
        return colors.primary; 
      default:
        return colors.primary;
    }
  };

  const getAlertIcon = () => {
    switch (message.type) {
      case "success":
        return "check-circle";
      case "brand":
        return "check-circle";
      case "error":
        return "error";
      case "warning":
        return "warning";
      case "info":
        return "info";
      default:
        return "info";
    }
  };

  const bgColor = getAlertColor();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          backgroundColor: bgColor,
          transform: [
            {
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-20, 0],
              }),
            },
          ],
        },
      ]}
    >
      <MaterialIcons name={getAlertIcon()} size={24} color="white" />
      <Text style={styles.text}>{message.text}</Text>
      <TouchableOpacity onPress={onClose} style={styles.closeButton}>
        <MaterialIcons name="close" size={20} color="white" />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    marginHorizontal: 16,
    
    position: (Platform.OS === "web" ? "fixed" : "absolute") as any,
    top: Platform.OS === "web" ? 20 : 60, 
    left: Platform.OS === "web" ? 20 : 16,
    right: Platform.OS === "web" ? 20 : 16,
    zIndex: 999999, 
    elevation: 100, 
    ...platformShadow({
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 100,
    }),
  },
  text: {
    color: "white",
    fontSize: 15,
    flex: 1,
    marginHorizontal: 12,
    fontWeight: "600",
    lineHeight: 20,
  },
  closeButton: {
    padding: 6,
  },
});
