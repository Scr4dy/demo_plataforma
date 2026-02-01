import React, { useState, useEffect, useMemo } from "react";
import {
  NavigationContainer,
  DefaultTheme,
  Theme,
  useNavigation,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  StyleSheet,
  Platform,
  View,
  Text,
  TouchableOpacity,
  Pressable,
  LogBox,
  Alert,
  Linking,
  Image,
  ActivityIndicator,
  useWindowDimensions,
  AppState,
  Animated,
} from "react-native";

import { BottomTabParamList } from "./src/types/auth.types";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { platformShadow } from "./src/utils/styleHelpers";
import { Ionicons } from "@expo/vector-icons";
import { Provider as PaperProvider } from "react-native-paper";

import LoginScreen from "./src/screens/auth/LoginScreen";
import ForgotPasswordScreen from "./src/screens/auth/ForgotPasswordScreen";
import ResetPasswordScreen from "./src/screens/auth/ResetPasswordScreen";
import DashboardScreen from "./src/screens/main/DashboardScreen";
import CourseDetailScreen from "./src/screens/main/CourseDetailScreen";
import MyCoursesScreen from "./src/screens/main/MyCoursesScreen";
import CertificatesScreen from "./src/screens/main/CertificatesScreen";
import CategoriesScreen from "./src/screens/main/CategoriesScreen";
import AllCoursesScreen from "./src/screens/main/AllCoursesScreen";
import GlobalSearchScreen from "./src/screens/main/GlobalSearchScreen";

import LessonDetailScreen from "./src/screens/main/LessonDetailScreen";
import AdminUsersList from "./src/screens/admin/AdminUsersList";
import AdminDashboardScreen from "./src/screens/admin/AdminDashboardScreen";

import EvaluationScreen from "./src/screens/main/EvaluationScreen";
let ModulesScreen: any;
try {
  ModulesScreen =
    require("./src/screens/admin/ModulesScreen").default ||
    require("./src/screens/admin/ModulesScreen");
} catch (e) {}
let LessonsScreen: any;
try {
  LessonsScreen =
    require("./src/screens/admin/LessonsScreen").default ||
    require("./src/screens/admin/LessonsScreen");
} catch (e) {}

let QuizManagementScreen: any;
try {
  QuizManagementScreen =
    require("./src/screens/admin/QuizManagementScreen").QuizManagementScreen;
} catch (e) {}
import AdminCoursesScreen from "./src/screens/admin/AdminCoursesScreen";
import AdminCategoriesScreen from "./src/screens/admin/AdminCategoriesScreen";
import AdminReportsScreen from "./src/screens/admin/AdminReportsScreen";
import InstructorDashboard from "./src/screens/instructor/InstructorDashboard";
import InstructorMaterialsScreen from "./src/screens/instructor/InstructorMaterialsScreen";

let TeamScreen: any;
try {
  TeamScreen =
    require("./src/screens/main/TeamScreen").default ||
    require("./src/screens/main/TeamScreen");
} catch (e) {
  TeamScreen = require("./src/screens/main/TeamScreen");
}

import { AuthProvider, useAuth } from "./src/context/AuthContext";
import { ThemeProvider, useTheme } from "./src/context/ThemeContext";
import { supabase } from "./src/config/supabase";
import { NetworkStatusBar } from "./src/components/common/NetworkStatusBar";

import { StatusBar } from "expo-status-bar";
import SidebarContext from "./src/context/SidebarContext";
import { ErrorBoundary } from "./src/components/ErrorBoundary";
import ProfileSettingsScreen from "./src/screens/ProfileSettingsScreen";
import { ConfirmationModal } from "./src/components/common/ConfirmationModal";

import { configureForProduction } from "./src/utils/logger";

import { networkSyncService } from "./src/services/networkSyncService";

type RootStackParamList = {
  Login: undefined;
  ForgotPassword: undefined;
  ResetPassword: undefined;
  MainTabs: undefined;
  MobileTabs: undefined;
  MyCourses: undefined;
  CourseDetail: { courseId: string; preview?: boolean };
  Evaluation?: { courseId?: string; certificateId?: string };
  Categories: { initialCategory?: string };
  GlobalSearch: undefined;
  ProfileSettings: undefined;
  Team?: undefined;
  AllCourses?: undefined;
  Instructor?: undefined;

  InstructorMaterials?: { courseId?: number };
  AdminDashboard?: undefined;
  AdminReports?: undefined;
  AdminUsers?: { adminMode?: boolean };
  AdminCategories?: { adminMode?: boolean };
  AdminCourses?: { adminMode?: boolean };
  Modules?: { courseId?: number };
  Lessons?: { courseId?: number };
  QuizManagement?: { contentId: string; contentTitle?: string };

  LessonDetail?: {
    courseId?: string;
    moduleId?: string;
    content: any;
    moduleTitle?: string;
    contentTitle?: string;
  };
};

LogBox.ignoreLogs([
  "Non-serializable values were found in the navigation state",
  'Key "cancelled" in the image picker result',
  "VirtualizedLists should never be nested inside plain ScrollViews",
]);

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<BottomTabParamList>();

function StatusBarWrapper() {
  const { theme, colors } = useTheme();
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        forceUpdate((prev) => prev + 1);
      }
    });

    return () => {
      subscription?.remove();
    };
  }, []);

  return <StatusBar style="light" backgroundColor={colors.primary} />;
}

function extractLabel(value: any): string {
  if (value === null || typeof value === "undefined") return "";
  if (typeof value === "string") {
    try {
      return decodeURIComponent(value);
    } catch (e) {
      return value;
    }
  }
  if (typeof value === "object") {
    if (value.titulo) return String(value.titulo);
    if (value.title) return String(value.title);
    if (value.nombre) return String(value.nombre);
    if (value.name) return String(value.name);
    if (value.label) return String(value.label);

    try {
      return JSON.stringify(value).slice(0, 80);
    } catch (e) {
      return String(value);
    }
  }
  return String(value);
}

function getHeaderTitle(
  routeName: string,
  webRoute?: { name: string; params?: any } | null,
): string {
  if (webRoute) {
    if (
      process.env.NODE_ENV !== "production" &&
      webRoute.name === "LessonDetail"
    ) {
    }
    switch (webRoute.name) {
      case "GlobalSearch":
        return "Buscar";
      case "CourseDetail":
        return "Detalle del Curso";
      case "ProfileSettings":
        return "Mi Perfil";
      case "Modules":
        return "Módulos";
      case "Lessons":
        return "Lecciones";
      case "LessonDetail":
        return "Detalle de la Lección";
      case "QuizManagement":
        return extractLabel(webRoute.params?.contentTitle) || "Gestión de Quiz";
      case "AdminCategories":
        return "Gestión de Categorías";
      default:
        return webRoute.name;
    }
  }

  switch (routeName) {
    case "Dashboard":
      return "Dashboard";
    case "AdminDashboard":
      return "Administración";
    case "AdminHome":
      return "Administración";
    case "AdminCourses":
      return "Gestión de Cursos";
    case "AdminUsers":
      return "Gestión de Usuarios";
    case "AdminReports":
      return "Reportes";
    case "AdminCategories":
      return "Gestión de Categorías";
    case "Categories":
      return "Cursos";
    case "Certificates":
      return "Certificados";
    case "Modules":
      return "Módulos";
    case "QuizManagement":
      return "Gestión de Quiz";
    case "InstructorCourses":
      return "Mis Cursos";
    case "MyCourses":
      return "Mis Cursos";
    case "Team":
      return "Mi Equipo";
    case "AllCourses":
      return "Todos los cursos";
    case "GlobalSearch":
      return "Búsqueda Global";
    default:
      return "Dashboard";
  }
}

function getHeaderSubtitle(
  routeName: string,
  webRoute?: { name: string; params?: any } | null,
  role?: string,
) {
  if (webRoute) {
    switch (webRoute.name) {
      case "GlobalSearch":
        return "Busca cursos, categorías y contenido";
      case "CourseDetail":
        return "Información y contenido del curso";
      case "Modules":
        return "Gestiona los módulos del sistema";
      case "Lessons":
        return "Gestiona las lecciones del sistema";
      case "LessonDetail":
        return "Información y contenido de la lección";
      case "QuizManagement":
        return (
          extractLabel(webRoute.params?.moduleTitle) ||
          extractLabel(webRoute.params?.contentTitle) ||
          "Configura y administra cuestionarios"
        );
      case "ProfileSettings":
        return "Configuración de perfil y preferencias";
      case "AdminCategories":
        return "Gestionar categorías del sistema";
      default:
        return "";
    }
  }

  switch (routeName) {
    case "Dashboard":
      return role === "admin" || role === "administrador"
        ? "Panel de control administrativo"
        : "Panel principal de aprendizaje";
    case "AdminDashboard":
      return "Panel de control administrativo";
    case "AdminHome":
      return "Panel de control administrativo";
    case "AdminCategories":
      return "Gestionar categorías del sistema";
    case "AdminCourses":
      return "Gestión y edición de cursos del sistema";
    case "AdminUsers":
      return "Gestión de usuarios y roles";
    case "AdminReports":
      return "Reportes y Estadísticas";
    case "Categories":
      return "Explora cursos por categoría";
    case "InstructorCourses":
      return "Gestiona tus cursos como instructor";
    case "MyCourses":
      return "Tus cursos inscritos";

    case "Modules":
      return "Gestiona los módulos del sistema";
    case "QuizManagement":
      return "Configura y administra cuestionarios";
    case "Team":
      return "Gestión de miembros y certificaciones";
    case "AllCourses":
      return "Explora todos los cursos disponibles";
    case "AllCourses":
      return "Explora todos los cursos disponibles";
    case "Certificates":
      return "Tus certificados de capacitación";
    case "GlobalSearch":
      return "Encuentra cursos, categorías y más";
    default:
      return "";
  }
}

function UserMenu() {
  const { logout, state, isAdmin, isInstructor } = useAuth();
  const showAdmin = isAdmin || isInstructor;
  const { theme, colors, profileImage } = useTheme();
  const navigation = useNavigation<any>();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = async () => {
    setIsMenuOpen(false);
    setShowLogoutModal(true);
  };

  const onConfirmLogout = async () => {
    setShowLogoutModal(false);
    try {
      await logout();
    } catch (error) {
      if (Platform.OS === "web") {
        window.alert("Error al cerrar sesión. Por favor, intenta de nuevo.");
      } else {
        Alert.alert("Error", "No se pudo cerrar sesión. Intenta de nuevo.");
      }
    }
  };

  const menuItems = [
    {
      label: "Mi Perfil",
      icon: "person-outline",
      onPress: () => {
        setIsMenuOpen(false);
        if (Platform.OS === "web") {
          const { goToWebRoute } = require("./src/utils/webNav");
          goToWebRoute("ProfileSettings", {});
        } else {
          navigation.navigate("ProfileSettings");
        }
      },
    },
    {
      label: "Cerrar Sesión",
      icon: "log-out-outline",
      onPress: handleLogout,
      destructive: true,
    },
  ];

  return (
    <View style={styles.userMenuContainer}>
      <ConfirmationModal
        visible={showLogoutModal}
        title="Cerrar Sesión"
        message="¿Estás seguro de que deseas cerrar sesión?"
        onConfirm={onConfirmLogout}
        onCancel={() => setShowLogoutModal(false)}
        confirmText="Cerrar Sesión"
        cancelText="Cancelar"
      />
      {}
      <TouchableOpacity
        style={[
          styles.userMenuButton,
          { backgroundColor: "rgba(255, 255, 255, 0.15)" },
        ]}
        onPress={() => setIsMenuOpen(!isMenuOpen)}
        accessibilityLabel="Menú de usuario"
      >
        {profileImage ? (
          <Image
            source={{ uri: profileImage }}
            style={[styles.userAvatarImage as any, { borderColor: "#fff" }]}
          />
        ) : (
          <View
            style={[
              styles.userAvatar,
              { backgroundColor: "rgba(255, 255, 255, 0.2)" },
            ]}
          >
            <Ionicons name="person" size={18} color="#fff" />
          </View>
        )}
        <Text style={styles.userNameText} numberOfLines={1}>
          {state.user?.nombre?.split(" ")[0] || "Usuario"}
        </Text>
        <Ionicons
          name={isMenuOpen ? "chevron-up" : "chevron-down"}
          size={16}
          color="#fff"
          style={styles.chevronIcon}
        />
      </TouchableOpacity>

      {isMenuOpen && (
        <>
          {Platform.OS === "web" && (
            <TouchableOpacity
              style={styles.menuOverlay}
              onPress={() => setIsMenuOpen(false)}
            />
          )}

          <View
            style={[
              styles.dropdownMenu,
              { backgroundColor: theme.colors.card },
            ]}
          >
            <View style={styles.menuHeader}>
              {}
              <View style={styles.menuHeaderAvatarContainer}>
                {profileImage ? (
                  <Image
                    source={{ uri: profileImage }}
                    style={[
                      styles.menuHeaderAvatarImage as any,
                      { borderColor: colors.primary },
                    ]}
                  />
                ) : (
                  <View
                    style={[
                      styles.menuHeaderAvatar,
                      { backgroundColor: colors.primaryLight },
                    ]}
                  >
                    <Ionicons name="person" size={24} color={colors.primary} />
                  </View>
                )}
              </View>

              <View style={styles.menuHeaderInfo}>
                <Text
                  style={[styles.menuHeaderName, { color: theme.colors.text }]}
                  numberOfLines={1}
                >
                  {state.user?.nombre || "Usuario"}
                </Text>
                <Text
                  style={[
                    styles.menuHeaderEmail,
                    { color: theme.dark ? "#999" : "#666" },
                  ]}
                  numberOfLines={1}
                >
                  {state.user?.email || "usuario@ejemplo.com"}
                </Text>
                {}
                <Text
                  style={[
                    styles.menuHeaderRole,
                    { color: theme.dark ? "#999" : "#666" },
                  ]}
                  numberOfLines={1}
                >
                  {state.user?.departamento
                    ? `${state.user.departamento} • `
                    : ""}
                  {state.user?.numeroEmpleado || ""}
                  {state.user?.role
                    ? ` • ${state.user.role === "instructor" ? "Instructor" : state.user.role === "admin" ? "Administrador" : state.user.role}`
                    : ""}
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.menuDivider,
                { backgroundColor: theme.dark ? "#444" : "#e5e7eb" },
              ]}
            />

            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.menuItem,
                  item.destructive && styles.menuItemDestructive,
                ]}
                onPress={item.onPress}
              >
                <Ionicons
                  name={item.icon as any}
                  size={18}
                  color={
                    item.destructive
                      ? "#dc3545"
                      : theme.dark
                        ? "#999"
                        : "#666666"
                  }
                  style={styles.menuItemIcon}
                />
                <Text
                  style={[
                    styles.menuItemText,
                    { color: theme.colors.text },
                    item.destructive && styles.menuItemTextDestructive,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}
    </View>
  );
}

function MobileTabNavigator({ navigation }: any) {
  const { logout, state, isAdmin } = useAuth();
  const { theme, colors, profileImage } = useTheme();
  const showAdmin = isAdmin;

  const handleLogout = async () => {
    Alert.alert("Cerrar Sesión", "¿Estás seguro de que deseas cerrar sesión?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Cerrar Sesión",
        style: "destructive",
        onPress: async () => {
          try {
            await logout();
          } catch (error) {
            Alert.alert("Error", "No se pudo cerrar sesión. Intenta de nuevo.");
          }
        },
      },
    ]);
  };

  return (
    <>
      <Tab.Navigator
        id={undefined}
        screenOptions={({ route }) => ({
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: theme.dark ? "#999" : "#666",
          tabBarStyle: {
            backgroundColor: theme.colors.card,
            borderTopWidth: 1,
            borderTopColor: theme.dark ? "#333" : "#e0e0e0",
            height: 60,
            paddingBottom: 8,
            paddingTop: 8,
          },

          headerShown: false,
          headerStyle: {
            backgroundColor: colors.primary,
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
          },

          headerRight: () => (
            <View style={styles.headerRightContainer}>
              {}
              <TouchableOpacity
                onPress={() => navigation.navigate("ProfileSettings")}
                style={{ paddingHorizontal: 8, justifyContent: "center" }}
              >
                <Text
                  style={[styles.headerMiddleText]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {state.user?.nombre ? state.user.nombre.split(" ")[0] : ""}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigation.navigate("ProfileSettings")}
                style={styles.headerButton}
                accessibilityLabel="Open Profile Settings"
              >
                {}
                <View style={{ position: "relative" }}>
                  {profileImage ? (
                    <Image
                      source={{ uri: profileImage }}
                      style={styles.headerAvatarImage as any}
                    />
                  ) : (
                    <Ionicons
                      name="person-circle-outline"
                      size={28}
                      color="#ffffff"
                    />
                  )}

                  {(state.user?.role || "").toLowerCase() === "instructor" && (
                    <View
                      style={[
                        styles.headerBadge,
                        { backgroundColor: colors.primary },
                      ]}
                    >
                      <Text style={styles.headerBadgeText}>Instructor</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            </View>
          ),
          headerTitle: getHeaderTitle(route.name),
        })}
      >
        <Tab.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons
                name={focused ? "grid" : "grid-outline"}
                size={size}
                color={color}
              />
            ),
          }}
        />
        <Tab.Screen
          name="Categories"
          component={CategoriesScreen}
          options={{
            title: "Cursos",
            tabBarLabel: "Cursos",
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons
                name={focused ? "layers" : "layers-outline"}
                size={size}
                color={color}
              />
            ),
          }}
        />
        <Tab.Screen
          name="Certificates"
          component={CertificatesScreen}
          options={{
            title: "Certificados",
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons
                name={focused ? "document-text" : "document-text-outline"}
                size={size}
                color={color}
              />
            ),
          }}
        />
        {}
        {showAdmin && (
          <Tab.Screen
            name="AdminDashboard"
            component={AdminDashboardScreen}
            options={{
              tabBarIcon: ({ focused, color, size }) => (
                <Ionicons
                  name={focused ? "settings" : "settings-outline"}
                  size={size}
                  color={color}
                />
              ),
              title: "Admin",
            }}
          />
        )}
        {}
        {(state.user?.role || "").toLowerCase() === "instructor" && (
          <Tab.Screen
            name="Instructor"
            component={InstructorDashboard}
            options={{
              tabBarIcon: ({ focused, color, size }) => (
                <Ionicons
                  name={focused ? "school" : "school-outline"}
                  size={size}
                  color={color}
                />
              ),
              title: "Instructor",
            }}
          />
        )}
        {}
        {showAdmin && (
          <Tab.Screen
            name="Team"
            component={TeamScreen}
            options={{
              tabBarIcon: ({ focused, color, size }) => (
                <Ionicons
                  name={focused ? "people" : "people-outline"}
                  size={size}
                  color={color}
                />
              ),
              title: "Equipo",
              tabBarLabel: "Equipo",
            }}
          />
        )}
      </Tab.Navigator>
    </>
  );
}

function WebSidebarNavigator() {
  const [activeTab, setActiveTab] = useState("Dashboard");

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const { state, isAdmin } = useAuth();
  const roleLower = (state.user?.role || "").toLowerCase();
  const isInstructor = roleLower === "instructor";
  const isEmployee = roleLower === "empleado" || roleLower === "employee";
  const { theme, colors, profileImage } = useTheme();
  const { width } = useWindowDimensions();
  const isMobileWeb = width < 768;
  const navigation = useNavigation<any>();

  let headerObj: any = { header: null };
  try {
    const hc = require("./src/context/HeaderContext");
    headerObj = hc.useHeader ? hc.useHeader() : { header: null };
  } catch (e) {
    headerObj = { header: null };
  }
  const { header } = headerObj;

  const [webRoute, setWebRoute] = useState<{
    name: string;
    params?: any;
  } | null>(null);

  const alwaysShowBackTabs = useMemo(() => new Set<string>([]), []);
  const neverShowBackTabs = useMemo(() => new Set(["Dashboard"]), []);
  const shouldShowBack = useMemo(() => {
    try {
      const mainScreens = [
        "Dashboard",
        "Categories",
        "Certificates",
        "InstructorCourses",
        "Team",
        "AdminCourses",
        "AdminUsers",
      ];
      const isMainScreen = mainScreens.includes(activeTab);

      if (webRoute) {
        return true;
      }

      if (!isSidebarOpen) return !neverShowBackTabs.has(activeTab);

      if (alwaysShowBackTabs.has(activeTab)) return true;

      if (isMainScreen) return false;

      const hasHistoryNav = (() => {
        try {
          return navigation.canGoBack();
        } catch (e) {
          return false;
        }
      })();
      const webHasHistory =
        Platform.OS === "web" &&
        typeof window !== "undefined" &&
        !!(window.history && window.history.length > 1);
      const navState = (navigation as any)?.getState
        ? (navigation as any).getState()
        : null;
      const navIndex = navState?.index ?? 0;
      const hasNavIndex = navIndex > 0;
      const routeObj = (navigation as any)?.getCurrentRoute
        ? (navigation as any).getCurrentRoute()
        : null;
      const topLevelRoutes = new Set([
        "Dashboard",
        "Home",
        "AdminDashboard",
        "AllCourses",
        "Categories",
        "MyCourses",
        "Profile",
        "Settings",
      ]);
      const routeIsTopLevel = !!(routeObj && topLevelRoutes.has(routeObj.name));

      const effectiveHasHistory = Boolean(
        hasHistoryNav ||
        webHasHistory ||
        hasNavIndex ||
        (routeObj && !routeIsTopLevel),
      );

      if (process.env.NODE_ENV !== "production") {
        try {
        } catch (e) {}
      }

      return effectiveHasHistory;
    } catch (e) {
      return !isSidebarOpen;
    }
  }, [isSidebarOpen, width, activeTab, navigation, webRoute]);

  React.useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      try {
      } catch (e) {}
    }
  }, [shouldShowBack, isSidebarOpen]);

  React.useEffect(() => {
    try {
      const title = getHeaderTitle(activeTab, webRoute);
      const subtitle = getHeaderSubtitle(activeTab, webRoute, state.user?.role);
    } catch (e) {}
  }, [
    activeTab,
    webRoute,
    shouldShowBack,
    isSidebarOpen,
    state.user?.role,
    width,
  ]);

  React.useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
    }
  }, [header, webRoute]);

  React.useEffect(() => {
    if (Platform.OS === "web") {
      try {
        const el = document.getElementById("main-content");
        if (el && typeof el.scrollIntoView === "function") {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        } else if (typeof window !== "undefined") {
          window.scrollTo({ top: 0, behavior: "smooth" } as any);
        }
      } catch (e) {}
    }
  }, [activeTab]);

  React.useEffect(() => {
    const SHOULD_OPEN = width >= 900;
    if (SHOULD_OPEN && !isSidebarOpen) setIsSidebarOpen(true);
    if (!SHOULD_OPEN && isSidebarOpen) setIsSidebarOpen(false);
  }, [width]);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const showAdmin = isAdmin;

  const lastActiveTabRef = React.useRef<string | undefined>(undefined);
  React.useEffect(() => {
    if (Platform.OS === "web") {
      try {
        const isAdminTab =
          activeTab &&
          typeof activeTab === "string" &&
          activeTab.startsWith("Admin");
        const becameAdminTab =
          isAdminTab && lastActiveTabRef.current !== activeTab;

        if (becameAdminTab && width < 900 && isSidebarOpen) {
          setIsSidebarOpen(false);
        }
      } catch (e) {}
    }
    lastActiveTabRef.current = activeTab as string | undefined;
  }, [activeTab, width, isSidebarOpen]);

  const sidebarItems = useMemo(() => {
    const main = [
      { key: "Dashboard", label: "Dashboard", icon: "grid" },
      { key: "Categories", label: "Cursos", icon: "layers" },
      { key: "Certificates", label: "Certificados", icon: "document-text" },
    ];
    const instructorGroup = isInstructor
      ? [{ key: "InstructorCourses", label: "Mis cursos", icon: "school" }]
      : [];
    const admin = showAdmin
      ? [
          {
            key: "AdminHome",
            label: "Administración",
            icon: "shield-checkmark",
          },
          { key: "Team", label: "Mi Equipo", icon: "people" },

          ...(Platform.OS === "web"
            ? []
            : [{ key: "AdminUsers", label: "Usuarios", icon: "person" }]),
        ]
      : [];
    return { main, instructor: instructorGroup, admin };
  }, [isAdmin, showAdmin, isInstructor]);

  React.useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      try {
      } catch (e) {}
    }
  }, [isAdmin, showAdmin, sidebarItems.admin.length, webRoute]);

  const lastActiveTabForClearRef = React.useRef<string | undefined>(undefined);
  React.useEffect(() => {
    try {
      const isAdminTab = (activeTab || "").toString().startsWith("Admin");
      const becameAdmin =
        isAdminTab && lastActiveTabForClearRef.current !== activeTab;
      if (becameAdmin && webRoute) {
        try {
          const { clearWebRoute } = require("./src/utils/webNav");
          clearWebRoute();
        } catch (_) {}
        setWebRoute(null);
      }
    } catch (e) {}
    lastActiveTabForClearRef.current = activeTab as string | undefined;
  }, [activeTab, webRoute]);

  React.useEffect(() => {
    if (Platform.OS !== "web") return;
    try {
      if (header && header.manual) {
        if (webRoute && webRoute.name === "LessonDetail") {
          const newParams = {
            ...(webRoute.params || {}),
            contentTitle: header.title,
            moduleTitle: header.subtitle,
          };
          if (JSON.stringify(webRoute.params) !== JSON.stringify(newParams)) {
            setWebRoute(
              (prev) => ({ ...(prev as any), params: newParams }) as any,
            );
          }
        } else {
        }
      }
    } catch (e) {}
  }, [header, webRoute]);

  const renderContent = useMemo(() => {
    const contentMap: Record<string, React.ComponentType<any>> = {
      Dashboard: DashboardScreen,
      Categories: CategoriesScreen,
      Certificates: CertificatesScreen,
      AllCourses: AllCoursesScreen,
      MyCourses: MyCoursesScreen,
      InstructorCourses: InstructorDashboard,
      InstructorMaterials: InstructorMaterialsScreen,

      Team: TeamScreen,
      AdminCourses: AdminCoursesScreen,
      AdminUsers: AdminUsersList,
      AdminCategories:
        require("./src/screens/admin/AdminCategoriesScreen").default ||
        require("./src/screens/admin/AdminCategoriesScreen"),
      AdminHome:
        require("./src/screens/admin/AdminHome").default ||
        require("./src/screens/admin/AdminHome"),
      AdminReports:
        require("./src/screens/admin/AdminReportsScreen").default ||
        require("./src/screens/admin/AdminReportsScreen"),
    };

    if (webRoute) {
      if (webRoute.name === "CourseDetail") {
        const CourseComp = CourseDetailScreen as any;
        return (
          <CourseComp
            courseId={String(webRoute.params?.courseId)}
            initialModuleId={webRoute.params?.moduleId}
          />
        );
      }
      if (webRoute.name === "InstructorMaterials") {
        const Comp = InstructorMaterialsScreen as any;
        return <Comp initialCourseId={webRoute.params?.courseId} />;
      }
      if (webRoute.name === "GlobalSearch") {
        return <GlobalSearchScreen />;
      }
      if (webRoute.name === "ProfileSettings") {
        return <ProfileSettingsScreen />;
      }

      if (webRoute.name === "LessonDetail") {
        const Comp = LessonDetailScreen as any;
        return (
          <Comp
            courseId={String(webRoute.params?.courseId)}
            moduleId={String(webRoute.params?.moduleId)}
            content={webRoute.params?.content}
            moduleTitle={webRoute.params?.moduleTitle}
            contentTitle={webRoute.params?.contentTitle}
          />
        );
      }

      if (webRoute.name === "Modules") {
        const Comp =
          ModulesScreen ||
          require("./src/screens/admin/ModulesScreen").default ||
          require("./src/screens/admin/ModulesScreen");
        if (!Comp) {
          return null;
        }
        return <Comp courseId={webRoute.params?.courseId} />;
      }

      if (webRoute.name === "QuizManagement") {
        const Comp =
          QuizManagementScreen ||
          require("./src/screens/admin/QuizManagementScreen")
            .QuizManagementScreen ||
          require("./src/screens/admin/QuizManagementScreen");
        if (!Comp) {
          return null;
        }
        return (
          <Comp
            contentId={webRoute.params?.contentId}
            contentTitle={webRoute.params?.contentTitle}
          />
        );
      }

      if (webRoute.name === "Lessons") {
        const Comp =
          LessonsScreen ||
          require("./src/screens/admin/LessonsScreen").default ||
          require("./src/screens/admin/LessonsScreen");
        if (!Comp) {
          return null;
        }
        return (
          <Comp
            courseId={webRoute.params?.courseId}
            moduleId={webRoute.params?.moduleId}
          />
        );
      }

      if (contentMap[webRoute.name]) {
        const Comp = contentMap[webRoute.name];
        return <Comp {...(webRoute.params || {})} />;
      }
    }

    const Component = contentMap[activeTab] || DashboardScreen;
    return <Component adminMode={activeTab.startsWith("Admin")} />;
  }, [activeTab, webRoute]);

  React.useEffect(() => {
    const webNav = require("./src/utils/webNav");
    const unsubTab = webNav.onWebTabChange((tab: string, params?: any) => {
      if (params && params.initialCategory && tab === "Categories") {
      }
      setActiveTab(tab);
    });
    const unsubRoute = webNav.onWebRouteChange((route: any | null) => {
      try {
      } catch (e) {}
      try {
        setWebRoute((prev) => {
          const prevJson = prev ? JSON.stringify(prev) : null;
          const newJson = route ? JSON.stringify(route) : null;
          if (prevJson === newJson) {
            return prev;
          }

          return route;
        });
      } catch (e) {
        setWebRoute(route);
      }
    });

    try {
      if (Platform.OS === "web" && typeof window !== "undefined") {
        const url = new URL(window.location.href);
        const pathname = url.pathname || "";
        const params = Object.fromEntries(url.searchParams.entries());

        const p = pathname.replace(/\/+$/, "").toLowerCase();

        if (p.endsWith("/lessondetail") || p.includes("/lessondetail")) {
          setWebRoute({
            name: "LessonDetail",
            params: {
              courseId: params.courseId,
              moduleId: params.moduleId,
              content: params.content,
              moduleTitle: params.moduleTitle,
              contentTitle: params.contentTitle,
              moduleLessons: (() => {
                try {
                  return JSON.parse(params.moduleLessons || "null");
                } catch (_) {
                  return params.moduleLessons;
                }
              })(),
            },
          });
        } else if (p.endsWith("/coursedetail") || p.includes("/coursedetail")) {
          setWebRoute({
            name: "CourseDetail",
            params: { courseId: params.courseId, moduleId: params.moduleId },
          });
        } else if (p.endsWith("/modules") || p.includes("/modules")) {
          setWebRoute({
            name: "Modules",
            params: { courseId: params.courseId },
          });
        }
      }
    } catch (e) {}

    return () => {
      unsubTab();
      unsubRoute();
    };
  }, []);

  return (
    <SidebarContext.Provider value={{ isSidebarOpen, setIsSidebarOpen }}>
      <SafeAreaView
        style={[
          styles.webContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        {}
        {isMobileWeb && isSidebarOpen && (
          <TouchableOpacity
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              zIndex: 999,
            }}
            activeOpacity={1}
            onPress={() => setIsSidebarOpen(false)}
          />
        )}
        {}
        <View
          style={[
            styles.sidebar,
            {
              width: isSidebarOpen ? 250 : isMobileWeb ? 0 : 80,
              backgroundColor: theme.colors.card,
              borderRightColor: theme.dark ? "#444" : "#e0e0e0",
              overflow: "hidden",
            },
          ]}
        >
          <View
            style={[
              styles.sidebarHeader,
              { borderBottomColor: theme.dark ? "#444" : "#e0e0e0" },
            ]}
          >
            {isSidebarOpen ? (
              <TouchableOpacity
                style={styles.sidebarTitleContainer}
                onPress={() => setIsSidebarOpen(!isSidebarOpen)}
                accessibilityLabel={"Alternar sidebar"}
                hitSlop={{ top: 12, left: 12, right: 12, bottom: 12 }}
              >
                <Image
                  source={require("./assets/icon.png")}
                  style={[
                    styles.sidebarLogoImage as any,
                    { tintColor: colors.primary },
                  ]}
                />
                <View
                  style={{
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={[
                      styles.sidebarTitle,
                      { color: theme.colors.text, textAlign: "center" },
                    ]}
                    numberOfLines={1}
                  >
                    Demo
                  </Text>
                </View>
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
                >
                  {isAdmin && (
                    <View
                      style={[
                        styles.adminBadge,
                        { backgroundColor: colors.primary },
                      ]}
                    >
                      <Ionicons
                        name="shield-checkmark"
                        size={12}
                        color="#fff"
                      />
                      <Text style={styles.adminBadgeText}>Admin</Text>
                    </View>
                  )}

                  {isInstructor && (
                    <View
                      style={[
                        styles.adminBadge,
                        { backgroundColor: "#10B981" },
                      ]}
                    >
                      <Ionicons name="school" size={12} color="#fff" />
                      <Text style={styles.adminBadgeText}>Instructor</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[
                  styles.sidebarTitleContainer,
                  styles.sidebarCollapsedTitle,
                ]}
                onPress={() => setIsSidebarOpen(!isSidebarOpen)}
                accessibilityLabel={"Alternar sidebar"}
                hitSlop={{ top: 12, left: 12, right: 12, bottom: 12 }}
              >
                <View style={{ position: "relative" }}>
                  <Image
                    source={require("./assets/icon.png")}
                    style={[
                      styles.sidebarLogoImageCollapsed as any,
                      { tintColor: colors.primary },
                    ]}
                  />

                  {Platform.OS !== "web" &&
                    (state.user?.role || "").toLowerCase() === "empleado" && (
                      <View
                        style={[
                          styles.sidebarCollapsedBadgeEmployee,
                          { backgroundColor: "#6b7280" },
                        ]}
                      >
                        <Text style={styles.collapsedBadgeText}>Emp</Text>
                      </View>
                    )}
                </View>
              </TouchableOpacity>
            )}
            {}
          </View>

          <View style={styles.sidebarMenu}>
            {sidebarItems.main.map((item) => (
              <View key={item.key} style={styles.sidebarItemWrapper}>
                <Pressable
                  style={[
                    styles.sidebarItem,
                    activeTab === item.key && [
                      styles.sidebarItemActive,
                      { backgroundColor: colors.primaryLight },
                    ],
                  ]}
                  onPress={() => {
                    try {
                      const { clearWebRoute } = require("./src/utils/webNav");
                      clearWebRoute();
                    } catch (e) {}
                    setWebRoute(null);
                    setActiveTab(item.key);
                  }}
                  onHoverIn={() => !isSidebarOpen && setHoveredItem(item.key)}
                  onHoverOut={() => setHoveredItem(null)}
                  accessibilityLabel={`Navegar a ${item.label}`}
                >
                  <Ionicons
                    name={
                      activeTab === item.key
                        ? (item.icon as any)
                        : `${item.icon}-outline`
                    }
                    size={20}
                    color={
                      activeTab === item.key
                        ? colors.primary
                        : theme.dark
                          ? "#999"
                          : "#666666"
                    }
                  />
                  {isSidebarOpen && (
                    <Text
                      style={[
                        styles.sidebarText,
                        { color: theme.colors.text },
                        activeTab === item.key && [
                          styles.sidebarTextActive,
                          { color: colors.primary },
                        ],
                      ]}
                    >
                      {item.label}
                    </Text>
                  )}
                </Pressable>
                {}
                {!isSidebarOpen &&
                  Platform.OS === "web" &&
                  hoveredItem === item.key && (
                    <View
                      style={[
                        styles.sidebarTooltip,
                        {
                          backgroundColor: theme.colors.card,
                          borderColor: theme.dark ? "#444" : "#e0e0e0",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.sidebarTooltipText,
                          { color: theme.colors.text },
                        ]}
                      >
                        {item.label}
                      </Text>
                    </View>
                  )}
              </View>
            ))}

            {}
            {sidebarItems.instructor.length > 0 && (
              <View style={styles.adminGroup}>
                {isSidebarOpen && (
                  <Text
                    style={[
                      styles.adminGroupTitle,
                      { color: theme.colors.text },
                    ]}
                  >
                    Instructor
                  </Text>
                )}
                {sidebarItems.instructor.map((item) => (
                  <View key={item.key} style={styles.sidebarItemWrapper}>
                    <Pressable
                      style={[
                        styles.sidebarItem,
                        activeTab === item.key && [
                          styles.sidebarItemActive,
                          { backgroundColor: colors.primaryLight },
                        ],
                      ]}
                      onPress={() => {
                        try {
                          const {
                            clearWebRoute,
                          } = require("./src/utils/webNav");
                          clearWebRoute();
                        } catch (e) {}
                        setWebRoute(null);
                        setActiveTab(item.key);
                      }}
                      onHoverIn={() =>
                        !isSidebarOpen && setHoveredItem(item.key)
                      }
                      onHoverOut={() => setHoveredItem(null)}
                      accessibilityLabel={`Navegar a ${item.label}`}
                    >
                      <Ionicons
                        name={
                          activeTab === item.key
                            ? (item.icon as any)
                            : `${item.icon}-outline`
                        }
                        size={20}
                        color={
                          activeTab === item.key
                            ? colors.primary
                            : theme.dark
                              ? "#999"
                              : "#666666"
                        }
                      />
                      {isSidebarOpen && (
                        <Text
                          style={[
                            styles.sidebarText,
                            { color: theme.colors.text },
                            activeTab === item.key && [
                              styles.sidebarTextActive,
                              { color: colors.primary },
                            ],
                          ]}
                        >
                          {item.label}
                        </Text>
                      )}
                    </Pressable>
                    {}
                    {!isSidebarOpen &&
                      Platform.OS === "web" &&
                      hoveredItem === item.key && (
                        <View
                          style={[
                            styles.sidebarTooltip,
                            {
                              backgroundColor: theme.colors.card,
                              borderColor: theme.dark ? "#444" : "#e0e0e0",
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.sidebarTooltipText,
                              { color: theme.colors.text },
                            ]}
                          >
                            {item.label}
                          </Text>
                        </View>
                      )}
                  </View>
                ))}
              </View>
            )}

            {}
            {sidebarItems.admin.length > 0 && (
              <View style={styles.adminGroup}>
                {isSidebarOpen && (
                  <Text
                    style={[
                      styles.adminGroupTitle,
                      { color: theme.colors.text },
                    ]}
                  >
                    Admin
                  </Text>
                )}
                {sidebarItems.admin.map((item) => (
                  <View key={item.key} style={styles.sidebarItemWrapper}>
                    <Pressable
                      style={[
                        styles.sidebarItem,
                        activeTab === item.key && [
                          styles.sidebarItemActive,
                          { backgroundColor: colors.primaryLight },
                        ],
                      ]}
                      onPress={() => {
                        try {
                          const {
                            clearWebRoute,
                          } = require("./src/utils/webNav");
                          clearWebRoute();
                        } catch (e) {}
                        setWebRoute(null);
                        setActiveTab(item.key);
                      }}
                      onHoverIn={() =>
                        !isSidebarOpen && setHoveredItem(item.key)
                      }
                      onHoverOut={() => setHoveredItem(null)}
                      accessibilityLabel={`Navegar a ${item.label}`}
                    >
                      <Ionicons
                        name={
                          activeTab === item.key
                            ? (item.icon as any)
                            : `${item.icon}-outline`
                        }
                        size={20}
                        color={
                          activeTab === item.key
                            ? colors.primary
                            : theme.dark
                              ? "#999"
                              : "#666666"
                        }
                      />
                      {isSidebarOpen && (
                        <Text
                          style={[
                            styles.sidebarText,
                            { color: theme.colors.text },
                            activeTab === item.key && [
                              styles.sidebarTextActive,
                              { color: colors.primary },
                            ],
                          ]}
                        >
                          {item.label}
                        </Text>
                      )}
                    </Pressable>
                    {}
                    {!isSidebarOpen &&
                      Platform.OS === "web" &&
                      hoveredItem === item.key && (
                        <View
                          style={[
                            styles.sidebarTooltip,
                            {
                              backgroundColor: theme.colors.card,
                              borderColor: theme.dark ? "#444" : "#e0e0e0",
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.sidebarTooltipText,
                              { color: theme.colors.text },
                            ]}
                          >
                            {item.label}
                          </Text>
                        </View>
                      )}
                  </View>
                ))}
              </View>
            )}
          </View>

          {}
        </View>

        {}
        <View
          style={[
            styles.webContent,
            {
              marginLeft: isMobileWeb ? 0 : isSidebarOpen ? 250 : 80,
              backgroundColor: theme.colors.background,
            },
          ]}
        >
          {}
          {process.env.NODE_ENV !== "production" &&
            (() => {
              return null;
            })()}
          <View
            style={[
              styles.webHeader,
              {
                backgroundColor: colors.primary,
                borderBottomColor: theme.dark ? "#444" : "#e0e0e0",
              },
            ]}
          >
            <View style={styles.webHeaderLeft}>
              {}
              {isMobileWeb && !isSidebarOpen && (
                <TouchableOpacity
                  onPress={() => setIsSidebarOpen(true)}
                  style={{ marginRight: 12, padding: 4 }}
                >
                  <Ionicons name="menu" size={24} color="#fff" />
                </TouchableOpacity>
              )}
              {}
              {(shouldShowBack || webRoute) && (
                <TouchableOpacity
                  onPress={() => {
                    try {
                      if (webRoute) {
                        const {
                          goBackWebRoute,
                        } = require("./src/utils/webNav");
                        const didGoBack = goBackWebRoute();

                        return;
                      }

                      const navCanGoBack =
                        navigation && typeof navigation.canGoBack === "function"
                          ? (() => {
                              try {
                                return navigation.canGoBack();
                              } catch (e) {
                                return false;
                              }
                            })()
                          : false;
                      if (navCanGoBack) {
                        try {
                          navigation.goBack();
                        } catch (e) {}
                      } else if (Platform.OS === "web") {
                        const { goToWebTab } = require("./src/utils/webNav");
                        goToWebTab("Dashboard");
                      } else {
                        if (
                          navigation &&
                          typeof navigation.navigate === "function"
                        ) {
                          try {
                            navigation.navigate("Dashboard");
                          } catch (e) {}
                        }
                      }
                    } catch (err) {
                      try {
                        if (Platform.OS === "web") {
                          const { goToWebTab } = require("./src/utils/webNav");
                          goToWebTab("Dashboard");
                        } else {
                          navigation.navigate("Dashboard");
                        }
                      } catch (_) {}
                    }
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Volver"
                  hitSlop={{ top: 10, left: 10, right: 10, bottom: 10 }}
                  style={{
                    backgroundColor: "transparent",
                    padding: 8,
                    borderRadius: 8,
                    marginRight: 8,
                    opacity: 0.7,
                  }}
                >
                  <Ionicons name="arrow-back" size={20} color="#fff" />
                </TouchableOpacity>
              )}

              <View style={styles.webHeaderMiddle}>
                <Text style={[styles.webHeaderTitle, { color: "#fff" }]}>
                  {getHeaderTitle(activeTab, webRoute)}
                </Text>
                <Text
                  style={[
                    styles.webHeaderSubtitle,
                    { color: "rgba(255, 255, 255, 0.8)" },
                  ]}
                >
                  {getHeaderSubtitle(activeTab, webRoute, state.user?.role)}
                </Text>
              </View>
            </View>
            <View style={styles.webHeaderRight}>
              <View style={{ marginLeft: 16 }}>
                <UserMenu />
              </View>
            </View>
          </View>

          <SafeAreaView
            nativeID="main-content"
            style={[
              styles.contentWrapper,
              { backgroundColor: theme.colors.background },
            ]}
          >
            {renderContent}
          </SafeAreaView>
        </View>
      </SafeAreaView>
    </SidebarContext.Provider>
  );
}

function MainNavigator() {
  const isWeb = Platform.OS === "web";

  if (isWeb) {
    return <WebSidebarNavigator />;
  }

  return (
    <Stack.Navigator id={undefined} screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MobileTabs" component={MobileTabNavigator} />
      <Stack.Screen
        name="MyCourses"
        component={MyCoursesScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AllCourses"
        component={AllCoursesScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="GlobalSearch"
        component={GlobalSearchScreen}
        options={{
          headerShown: false,
          presentation: "modal",
        }}
      />

      <Stack.Screen
        name="ProfileSettings"
        component={ProfileSettingsScreen}
        options={{
          headerShown: false,
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="Team"
        component={TeamScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="AdminReports"
        component={AdminReportsScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

function SplashScreen() {
  const { theme, colors } = useTheme();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.95)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <SafeAreaView
      style={[styles.splashContainer, { backgroundColor: "#FFFFFF" }]}
    >
      <Animated.View
        style={{
          alignItems: "center",
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        }}
      >
        <View style={styles.splashLogoContainer}>
          <Image
            source={require("./assets/icono.png")}
            style={{ width: 300, height: 140, resizeMode: "contain" }}
          />
        </View>
        <ActivityIndicator
          size="small"
          color="#CC3333"
          style={{ marginTop: 20 }}
        />
      </Animated.View>
    </SafeAreaView>
  );
}

function AppContent() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [processingRecovery, setProcessingRecovery] = useState(false);

  const [isRecoverySession, setIsRecoverySession] = useState(() => {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      const hash = window.location.hash;
      const pathname = window.location.pathname;

      const hasTokens = hash.includes("access_token");
      const isResetPath = pathname.includes("reset-password");

      const storedFlag =
        window.localStorage.getItem("recovery_session") === "1";
      return hasTokens || isResetPath || storedFlag;
    }
    return false;
  });
  const { state, isAdmin, isInstructor } = useAuth();
  const showAdmin = isAdmin || isInstructor;
  const { theme, colors, fontSize, getFontSize } = useTheme();
  const isWeb = Platform.OS === "web";

  React.useEffect(() => {
    try {
      const defaultProps = (Text as any).defaultProps || {};
      defaultProps.style = {
        ...(defaultProps.style || {}),
        fontSize: getFontSize(14),
      };
      (Text as any).defaultProps = defaultProps;
    } catch (err) {}
  }, [fontSize, getFontSize]);

  React.useEffect(() => {
    try {
      (Ionicons as any).loadFont && (Ionicons as any).loadFont();
    } catch (err) {}
  }, []);

  const { navigationRef } = require("./src/services/navigationService");

  const {
    HeaderProvider,
    HeaderRenderer,
    useHeader,
  } = require("./src/context/HeaderContext");

  const navigationTheme = {
    ...DefaultTheme,
    dark: theme.dark,
    colors: {
      ...DefaultTheme.colors,
      primary: colors.primary,
      background: theme.colors.background,

      card: colors.card || theme.colors.card || "#ffffff",
      text: theme.colors.text,
      border: theme.dark ? "#444" : "#e0e0e0",
      notification: colors.accent,
    },
  };

  function HeaderStateListener() {
    const { header, setHeader } = useHeader();

    const headerRef = React.useRef(header);
    React.useEffect(() => {
      headerRef.current = header;
    }, [header]);

    React.useEffect(() => {
      let cleanupUnsub: any = null;
      const handler = () => {
        try {
          let routeName = "Dashboard";
          try {
            let stateObj = navigationRef.current?.getRootState
              ? navigationRef.current.getRootState()
              : null;
            if (stateObj) {
              let st: any = stateObj;
              while (st && st.routes && st.index != null) {
                const r = st.routes[st.index];
                if (!r) break;

                if (r.state) {
                  st = r.state as any;
                  continue;
                }
                routeName = r.name;
                break;
              }
            } else {
              const current = navigationRef.current?.getCurrentRoute
                ? navigationRef.current.getCurrentRoute()
                : null;
              routeName = current?.name || "Dashboard";
            }
          } catch (err) {
            const current = navigationRef.current?.getCurrentRoute
              ? navigationRef.current.getCurrentRoute()
              : null;
            routeName = current?.name || "Dashboard";
          }

          const title = getHeaderTitle(routeName, null);

          const subtitle =
            routeName === "MyCourses"
              ? "Tus cursos inscritos"
              : getHeaderSubtitle(routeName, null, state.user?.role);

          const primaryScreens = new Set([
            "Dashboard",
            "AdminDashboard",
            "Categories",
            "Certificates",
            "Team",
            "AdminCourses",
            "AdminUsers",
            "AllCourses",
            "Instructor",
            "InstructorCourses",
            "Profile",
            "Settings",
          ]);

          const canGoBack =
            navigationRef.current &&
            typeof navigationRef.current.canGoBack === "function"
              ? Boolean(navigationRef.current.canGoBack())
              : false;
          let computedShowBack =
            Platform.OS !== "web"
              ? canGoBack || !primaryScreens.has(routeName)
              : undefined;

          if (Platform.OS !== "web" && routeName === "MyCourses") {
            computedShowBack = true;
          }

          if (
            Platform.OS !== "web" &&
            (routeName === "Categories" ||
              routeName === "Certificates" ||
              routeName === "AdminDashboard")
          ) {
            computedShowBack = false;
          }

          const authRoutes = new Set([
            "Login",
            "Register",
            "ForgotPassword",
            "ResetPassword",
          ]);
          if (authRoutes.has(routeName)) {
            setHeader({ hidden: true, manual: true });
            return;
          }

          if (routeName === "CourseDetail") {
            setHeader({
              title: "Detalle del Curso",
              subtitle: "Información y contenido del curso",
              showBack: true,
              alignLeftOnMobile: true,
              manual: true,
            });
            return;
          }

          if (
            [
              "LessonDetail",
              "ProfileSettings",
              "InstructorDashboard",
              "InstructorMaterials",
              "MyCourses",
            ].includes(routeName)
          ) {
            const initialTitles: Record<string, string> = {
              LessonDetail: "Detalle de la Lección",
              ProfileSettings: "Mi Perfil",
              InstructorDashboard: "Instructor",
              InstructorMaterials: "Materiales",
              MyCourses: "Mis Cursos",
            };
            const defaultSubtitles: Record<string, string> = {
              LessonDetail: "Información y contenido de la lección",
              ProfileSettings: "Configuración de perfil y preferencias",
              InstructorDashboard: "Panel de instructor",
              InstructorMaterials: "Gestión de materiales",
              MyCourses: "Tus cursos inscritos",
            };

            setHeader({
              title: initialTitles[routeName] || title,
              subtitle: defaultSubtitles[routeName] || subtitle || "",
              showBack: true,
              alignLeftOnMobile: true,
              manual: true,
            });
            return;
          }

          const isPrimaryTopLevelOnMobile =
            Platform.OS !== "web" &&
            [
              "Dashboard",
              "AdminDashboard",
              "Categories",
              "Certificates",
              "Team",
              "AdminCourses",
              "AdminUsers",
              "AllCourses",
              "Instructor",
              "InstructorCourses",
              "Profile",
              "Settings",
              "MyCourses",
            ].includes(routeName);

          if (
            headerRef.current &&
            headerRef.current.manual &&
            !isPrimaryTopLevelOnMobile
          ) {
            if (process.env.NODE_ENV !== "production") {
            }
            return;
          }

          const curH = headerRef.current;
          if (
            curH &&
            curH.title === title &&
            (curH.subtitle ||
              typeof curH.showBack !== "undefined" ||
              curH.onBack)
          ) {
            if (process.env.NODE_ENV !== "production") {
            }
            return;
          }

          let finalShowBack = computedShowBack;
          let finalOnBack: any = undefined;
          if (
            header &&
            (typeof header.showBack !== "undefined" ||
              typeof header.onBack !== "undefined")
          ) {
            if (typeof header.showBack !== "undefined")
              finalShowBack = header.showBack;
            if (typeof header.onBack !== "undefined")
              finalOnBack = header.onBack;
            if (process.env.NODE_ENV !== "production") {
            }
          }

          if (
            Platform.OS !== "web" &&
            (routeName === "Categories" || routeName === "Certificates")
          ) {
            finalShowBack = false;
          }

          if (process.env.NODE_ENV !== "production") {
          }

          if (Platform.OS === "web" && routeName === "Dashboard") {
            setHeader({ hidden: true, manual: true });
            return;
          }

          const shouldAlignLeft = Platform.OS !== "web";

          setHeader({
            title,
            subtitle,
            showBack: finalShowBack,
            onBack: finalOnBack,
            auto: true,
            alignLeftOnMobile: shouldAlignLeft,
          } as any);
        } catch (e) {}
      };

      try {
        const unsub = navigationRef.current?.addListener
          ? navigationRef.current.addListener("state", handler)
          : null;

        handler();
        return () => {
          if (unsub) unsub();
        };
      } catch (e) {
        const iv = setInterval(() => {
          try {
            if (navigationRef.current) {
              handler();

              if (navigationRef.current.addListener) {
                try {
                  const unsubLater = navigationRef.current.addListener(
                    "state",
                    handler,
                  );
                  clearInterval(iv);

                  (cleanupUnsub as any) = unsubLater;
                } catch (inner) {}
              }
            }
          } catch (_) {}
        }, 400);
        handler();
        return () => {
          clearInterval(iv);
          if (cleanupUnsub) cleanupUnsub();
        };
      }
    }, [setHeader]);

    return null;
  }

  useEffect(() => {
    if (Platform.OS === "web") {
      const processRecoveryTokens = async () => {
        try {
          let styleEl = document.getElementById(
            "theme-selection-style",
          ) as HTMLStyleElement | null;
          const css = theme.dark
            ? `::selection { background: rgba(255,255,255,0.12); color: #fff; }`
            : `::selection { background: ${colors.primary}; color: #fff; }`;
          if (!styleEl) {
            styleEl = document.createElement("style");
            styleEl.id = "theme-selection-style";
            document.head.appendChild(styleEl);
          }
          styleEl.innerHTML = css;
        } catch (e) {}
        const hash = window.location.hash;
        const pathname = window.location.pathname;

        if (hash.includes("access_token") && hash.includes("refresh_token")) {
          setProcessingRecovery(true);

          try {
            const hashParams = new URLSearchParams(hash.substring(1));
            const accessToken = hashParams.get("access_token") || "";
            const refreshToken = hashParams.get("refresh_token") || "";

            if (accessToken && refreshToken) {
              setIsRecoverySession(true);
              const { data, error } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              });

              if (error) {
                setIsRecoverySession(false);
                try {
                  if (typeof window !== "undefined")
                    window.localStorage.removeItem("recovery_session");
                } catch (_) {}
                Alert.alert(
                  "Error",
                  "No se pudo validar el enlace de recuperación.",
                );
              } else {
              }
            }
          } catch (error) {
          } finally {
            setProcessingRecovery(false);
          }
        } else {
        }
      };

      processRecoveryTokens();
    }
  }, []);

  useEffect(() => {
    const handleDeepLink = async (event: { url: string }) => {
      const url = event.url;

      if (url.includes("reset-password") || url.includes("type=recovery")) {
        try {
          let error = "";
          let errorCode = "";
          let errorDescription = "";

          if (url.includes("error=")) {
            const urlObj = new URL(url.replace("exp://", "https://"));
            error = urlObj.searchParams.get("error") || "";
            errorCode = urlObj.searchParams.get("error_code") || "";
            errorDescription =
              urlObj.searchParams.get("error_description") || "";

            if (errorCode === "otp_expired" || error === "access_denied") {
              Alert.alert(
                "Enlace Expirado",
                'El enlace de recuperación ha expirado o es inválido. Por favor, solicita un nuevo enlace desde "¿Olvidaste tu contraseña?"',
                [
                  {
                    text: "Solicitar Nuevo Enlace",
                    onPress: () =>
                      navigationRef.current?.navigate("ForgotPassword"),
                  },
                ],
              );
              return;
            }
          }

          let accessToken = "";
          let refreshToken = "";
          let type = "";

          if (url.includes("#")) {
            const hashPart = url.split("#")[1] || "";
            const hashParams = new URLSearchParams(hashPart);
            accessToken = hashParams.get("access_token") || "";
            refreshToken = hashParams.get("refresh_token") || "";
            type = hashParams.get("type") || "";
          }

          let code = "";

          if (url.includes("?")) {
            const queryPart = url.split("?")[1] || "";
            const queryParams = new URLSearchParams(queryPart.split("#")[0]);

            code = queryParams.get("code") || "";

            if (!code) {
              accessToken = queryParams.get("access_token") || "";
              refreshToken = queryParams.get("refresh_token") || "";
            }

            type = queryParams.get("type") || "";
          }

          if (code) {
            setIsRecoverySession(true);
            const { data, error } =
              await supabase.auth.exchangeCodeForSession(code);

            if (error) {
              setIsRecoverySession(false);
              try {
                if (typeof window !== "undefined")
                  window.localStorage.removeItem("recovery_session");
              } catch (_) {}
              Alert.alert(
                "Error",
                "No se pudo validar el enlace de recuperación.",
              );
            } else {
              setTimeout(() => {
                navigationRef.current?.navigate("ResetPassword");
              }, 200);
            }
          } else if (accessToken && refreshToken) {
            setIsRecoverySession(true);

            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (error) {
              setIsRecoverySession(false);
              try {
                if (typeof window !== "undefined")
                  window.localStorage.removeItem("recovery_session");
              } catch (_) {}
              Alert.alert(
                "Error",
                "No se pudo validar el enlace de recuperación.",
              );
            } else {
              setTimeout(() => {
                navigationRef.current?.navigate("ResetPassword");
              }, 200);
            }
          } else {
          }
        } catch (error) {
          Alert.alert(
            "Error",
            "Hubo un problema al abrir el enlace de recuperación.",
          );
        }
      }
    };

    if (Platform.OS !== "web") {
      const subscription = Linking.addEventListener("url", handleDeepLink);

      Linking.getInitialURL().then((url) => {
        if (url) {
          handleDeepLink({ url });
        }
      });

      return () => {
        subscription.remove();
      };
    }
  }, []);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await networkSyncService.initialize();
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setAppIsReady(true);
      } catch (error) {
        setAppIsReady(true);
      }
    };

    initializeApp();

    return () => {
      networkSyncService.destroy();
    };
  }, []);

  useEffect(() => {
    if (
      appIsReady &&
      !state.loading &&
      !state.isAuthenticated &&
      navigationRef.current
    ) {
      const currentRoute = navigationRef.current.getCurrentRoute();
      if (
        currentRoute?.name === "ResetPassword" ||
        currentRoute?.name === "ForgotPassword"
      ) {
        return;
      }

      try {
        if (typeof window !== "undefined")
          window.localStorage.removeItem("recovery_session");
      } catch (_) {}

      if (isRecoverySession) {
        setIsRecoverySession(false);
      }

      try {
        if (
          navigationRef.current &&
          (navigationRef.current.isReady
            ? navigationRef.current.isReady()
            : true)
        ) {
          navigationRef.current.reset({
            index: 0,
            routes: [{ name: "Login" }],
          });
        } else {
        }
      } catch (error) {}
    }

    const recoveryFlag =
      Platform.OS === "web" && typeof window !== "undefined"
        ? window.localStorage.getItem("recovery_session") === "1"
        : false;
    if (
      appIsReady &&
      !state.loading &&
      state.isAuthenticated &&
      navigationRef.current &&
      !isRecoverySession &&
      !recoveryFlag
    ) {
      if (Platform.OS === "web") {
        try {
          const pathname =
            typeof window !== "undefined" ? window.location.pathname : "";

          if (
            pathname &&
            (pathname.includes("/courses") ||
              pathname.includes("/course/") ||
              pathname.includes("/search") ||
              pathname.includes("/settings"))
          ) {
          } else {
            try {
              navigationRef.current.reset({
                index: 0,
                routes: [{ name: "MainTabs" }],
              });
            } catch (error) {}
          }
        } catch (err) {
          try {
            navigationRef.current.reset({
              index: 0,
              routes: [{ name: "MainTabs" }],
            });
          } catch (error) {
            // Error handling ignored
          }
        }
      } else {
        try {
          navigationRef.current.reset({
            index: 0,
            routes: [{ name: "MainTabs" }],
          });
        } catch (error) {}
      }
    } else if (
      appIsReady &&
      !state.loading &&
      state.isAuthenticated &&
      (isRecoverySession || recoveryFlag)
    ) {
      try {
        if (navigationRef.current) {
          setTimeout(() => {
            navigationRef.current?.navigate("ResetPassword");
          }, 100);
        }
      } catch (e) {}
    }
  }, [state.isAuthenticated, state.loading, appIsReady, isRecoverySession]);
  if (!appIsReady) {
    return <SplashScreen />;
  }

  if (processingRecovery) {
    return <SplashScreen />;
  }

  if (state.loading) {
    return <SplashScreen />;
  }

  const linking = {
    prefixes: [
      "https://appdemo.vercel.app",
      "http://localhost:8081",
      "http://127.0.0.1:8081",
      "http://localhost:19006",
      "empresaapp://",
      "exp://",
    ],
    config: {
      screens: {
        Login: "",
        ResetPassword: "reset-password",
        ForgotPassword: "forgot-password",
        MainTabs: "main",
        CourseDetail: "course/:courseId",
        GlobalSearch: "search",
        ProfileSettings: "settings",
        Team: "team",
        AllCourses: "courses",
      },
    },
  };

  return (
    <PaperProvider>
      <HeaderProvider>
        <NavigationContainer
          ref={navigationRef}
          linking={linking}
          theme={navigationTheme}
        >
          {}
          <HeaderStateListener />

          <SafeAreaView
            edges={["left", "right", "bottom"]}
            style={[
              styles.container,
              { backgroundColor: theme.colors.background },
            ]}
          >
            {}

            <NetworkStatusBar />

            <ErrorBoundary>
              {}
              {Platform.OS !== "web" && <HeaderRenderer />}

              <Stack.Navigator
                id={undefined}
                initialRouteName={state.isAuthenticated ? "MainTabs" : "Login"}
                screenOptions={{
                  headerStyle: {
                    backgroundColor: colors.primary,
                  },
                  headerTintColor: "#fff",
                  headerTitleStyle: {
                    fontWeight: "bold",
                  },
                  animation:
                    Platform.OS === "ios" ? "default" : "slide_from_right",
                }}
              >
                {state.isAuthenticated && state.user ? (
                  <>
                    <Stack.Screen
                      name="MainTabs"
                      component={MainNavigator}
                      options={{ headerShown: false }}
                    />

                    {!isWeb && (
                      <>
                        <Stack.Screen
                          name="CourseDetail"
                          component={CourseDetailScreen}
                          options={({ route }: any) => ({
                            title: route.params?.preview
                              ? "Vista Previa del Curso"
                              : "Detalle del Curso",
                            headerShown: false,
                          })}
                        />

                        <Stack.Screen
                          name="Categories"
                          component={CategoriesScreen}
                          options={{
                            title: "Cursos",
                            headerShown: false,
                          }}
                        />
                      </>
                    )}

                    <Stack.Screen
                      name="LessonDetail"
                      component={LessonDetailScreen}
                      options={({ route }: any) => ({
                        title: route?.params?.contentTitle || "Lección",
                        headerShown: false,
                      })}
                    />

                    <Stack.Screen
                      name="GlobalSearch"
                      component={GlobalSearchScreen}
                      options={{
                        title: "Buscar",
                        headerShown: false,
                        presentation: "modal",
                      }}
                    />

                    {}

                    {}
                    {(state.user?.role || "").toLowerCase() ===
                      "instructor" && (
                      <>
                        <Stack.Screen
                          name="Instructor"
                          component={InstructorDashboard}
                          options={({ navigation }: any) => ({
                            title: "Instructor",
                            headerShown: false,
                          })}
                        />
                        <Stack.Screen
                          name="InstructorMaterials"
                          component={InstructorMaterialsScreen}
                          options={({ route }: any) => ({
                            title: "Materiales",
                            headerShown: false,
                          })}
                        />
                      </>
                    )}

                    {showAdmin && (
                      <Stack.Screen
                        name="Team"
                        component={TeamScreen}
                        options={({ navigation }: any) => ({
                          title: "Gestión de Equipo",
                          headerShown: false,
                        })}
                      />
                    )}

                    {showAdmin && (
                      <Stack.Screen
                        name="Evaluation"
                        component={EvaluationScreen}
                        options={{ headerShown: false }}
                      />
                    )}
                    {showAdmin && (
                      <Stack.Screen
                        name="AdminUsers"
                        component={AdminUsersList}
                        initialParams={{ adminMode: true }}
                        options={{ title: "Usuarios", headerShown: false }}
                      />
                    )}

                    {showAdmin && (
                      <Stack.Screen
                        name="AdminCategories"
                        component={AdminCategoriesScreen}
                        initialParams={{ adminMode: true }}
                        options={{ title: "Categorías", headerShown: false }}
                      />
                    )}

                    {}

                    {}

                    {}
                    {showAdmin && (
                      <Stack.Screen
                        name="AdminCourses"
                        component={AllCoursesScreen}
                        initialParams={{ adminMode: true }}
                        options={{
                          title: "Gestionar Cursos",
                          headerShown: false,
                        }}
                      />
                    )}

                    {showAdmin && (
                      <Stack.Screen
                        name="Modules"
                        component={ModulesScreen}
                        options={{ title: "Módulos", headerShown: false }}
                      />
                    )}

                    {showAdmin && (
                      <Stack.Screen
                        name="Lessons"
                        component={LessonsScreen}
                        options={{ title: "Lecciones", headerShown: false }}
                      />
                    )}

                    {showAdmin && (
                      <Stack.Screen
                        name="QuizManagement"
                        component={QuizManagementScreen}
                        options={{
                          title: "Gestión de Quiz",
                          headerShown: false,
                        }}
                      />
                    )}

                    {}
                    <Stack.Screen
                      name="ResetPassword"
                      component={ResetPasswordScreen}
                      options={{
                        title: "Nueva Contraseña",
                        headerShown: false,
                        headerBackTitle: "",
                      }}
                    />
                  </>
                ) : (
                  <>
                    <Stack.Screen
                      name="Login"
                      component={LoginScreen}
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen
                      name="ForgotPassword"
                      component={ForgotPasswordScreen}
                      options={{
                        title: "Recuperar Contraseña",
                        headerShown: false,
                        headerBackTitle: "",
                      }}
                    />
                    {}
                    <Stack.Screen
                      name="ResetPassword"
                      component={ResetPasswordScreen}
                      options={{
                        title: "Nueva Contraseña",
                        headerShown: false,
                        headerBackTitle: "",
                      }}
                    />
                  </>
                )}
              </Stack.Navigator>
            </ErrorBoundary>
          </SafeAreaView>
        </NavigationContainer>
      </HeaderProvider>
    </PaperProvider>
  );
}

export default function App() {
  if (!__DEV__) {
    try {
      configureForProduction();
    } catch (e) {}
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        {}
        <StatusBarWrapper />
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webContainer: {
    flex: 1,
    flexDirection: "row",
  },
  sidebar: {
    borderRightWidth: 1,
    height: "100%",
    left: 0,
    top: 0,
    zIndex: 1000,
    ...(Platform.select({
      web: {
        position: "absolute" as "absolute",
        ...platformShadow({ boxShadow: "2px 0 4px rgba(0, 0, 0, 0.1)" }),
      },
      default: {
        position: "relative",
      },
      android: {
        elevation: 5,
      },
      ios: platformShadow({
        shadowColor: "#000",
        shadowOffset: { width: 2, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      }),
    } as any) as any),
  },
  sidebarHeader: {
    borderBottomWidth: 1,
    padding: 16,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: 80,
  },
  sidebarTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
    ...Platform.select({ web: { cursor: "pointer" } }),
  },
  sidebarTitle: {
    fontWeight: "bold",
    fontSize: 16,
    flex: 1,
  },
  adminBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 3,
    flexShrink: 0,
  },
  adminBadgeText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.2,
  },

  sidebarLogoImage: {
    width: 24,
    height: 24,
    borderRadius: 6,
    marginRight: 8,
    resizeMode: "contain",
  },
  sidebarLogoImageCollapsed: {
    width: 20,
    height: 20,
    borderRadius: 6,
    resizeMode: "contain",
  },
  sidebarCollapsedTitle: {
    justifyContent: "center",
    paddingLeft: 8,
  },
  sidebarCollapsedBadge: {
    position: "absolute",
    right: -6,
    top: -6,
    width: 18,
    height: 18,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  sidebarCollapsedBadgeEmployee: {
    position: "absolute",
    right: -10,
    top: -6,
    minWidth: 22,
    height: 18,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  collapsedBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
  adminGroup: {
    marginTop: 10,
  },
  adminGroupTitle: {
    fontSize: 12,
    fontWeight: "700",
    paddingHorizontal: 16,
    paddingVertical: 8,
    opacity: 0.9,
  },
  sidebarMenu: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    flex: 1,
  },
  sidebarItemWrapper: {
    position: "relative",
  },
  sidebarItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  sidebarTooltip: {
    position: "absolute",
    left: "100%",
    top: "50%",
    transform: [{ translateY: -14 }],
    marginLeft: 0,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    pointerEvents: "none",
    whiteSpace: "nowrap",
    zIndex: 9999,
  } as any,
  sidebarTooltipText: {
    fontSize: 11,
    fontWeight: "400",
  },
  sidebarItemActive: {
    borderLeftWidth: 3,
    borderLeftColor: "transparent",
  },
  sidebarText: {
    fontWeight: "500",
    fontSize: 14,
    marginLeft: 12,

    ...Platform.select({
      web: {
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis" as any,
        writingMode: "horizontal-tb",
        wordBreak: "normal",
      } as any,
    }),
  },
  sidebarTextActive: {
    fontWeight: "600",
  },
  sidebarFooter: {
    borderTopWidth: 1,
    padding: 12,
  },
  sidebarFooterProfile: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sidebarFooterAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    resizeMode: "cover",
  },
  sidebarFooterAvatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  sidebarFooterText: {
    fontSize: 12,
    flex: 1,
  },

  devBanner: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    margin: 12,
  },
  webContent: {
    flex: 1,
    position: "relative",
  },
  webHeader: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    minHeight: 70,

    ...(Platform.OS === "web"
      ? ({ position: "sticky" as "sticky", top: 0, zIndex: 10002 } as any)
      : { position: "relative", zIndex: 1001 }),
  },
  webHeaderLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  webHeaderMiddle: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
  },
  webHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  webHeaderTitle: {
    fontSize: 20,
    fontWeight: "bold",
    ...Platform.select({
      web: {
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis" as any,
      },
    }),
  },
  webHeaderSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  contentWrapper: {
    flex: 1,
    position: "relative",
    zIndex: 1,
  },
  splashContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  splashText: {
    fontWeight: "bold",
    marginTop: 20,
    fontSize: 28,
  },
  splashSubtext: {
    marginTop: 8,
    fontSize: 16,
  },
  splashLoadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: "500",
    opacity: 0.8,
  },
  splashLogoContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
  },
  splashDivider: {
    height: 4,
    width: 40,
    borderRadius: 2,
    marginVertical: 16,
    backgroundColor: "#CC3333",
  },
  splashLoadingWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 40,
    gap: 10,
  },
  splashFooter: {
    position: "absolute",
    bottom: 30,
    alignItems: "center",
    width: "100%",
  },
  splashFooterIcon: {
    width: 100,
    height: 40,
    resizeMode: "contain",
    opacity: 0.9,
  },
  headerRightContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: Platform.OS === "web" ? 0 : 16,
  },
  headerButton: {
    marginRight: Platform.OS === "web" ? 15 : 8,
    padding: 5,
    flexDirection: "row",
    alignItems: "center",
  },
  headerLeftContainer: {
    minWidth: 90,
    paddingLeft: 8,
    paddingRight: 8,
    justifyContent: "center",
  },

  headerAvatarImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#fff",
    resizeMode: "cover",
  },
  headerBadge: {
    position: "absolute",
    right: -8,
    top: -8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ffffff",
    minWidth: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  headerBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
  userMenuContainer: {
    position: "relative",
    zIndex: 1002,
  },
  userMenuButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    zIndex: 1003,
    gap: 8,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  userAvatarImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    resizeMode: "cover",
  },
  userNameText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#fff",
  },
  headerMiddleText: {
    color: "#fff",
    fontSize: 12,
    maxWidth: 120,
  },
  chevronIcon: {
    marginLeft: 4,
    color: "#fff",
  },
  dropdownMenu: {
    position: "absolute",
    top: "100%",
    right: 0,
    borderRadius: 8,
    padding: 0,
    marginTop: 8,
    minWidth: 280,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 1004,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  menuHeader: {
    padding: 16,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  menuHeaderAvatarContainer: {
    flexShrink: 0,
  },
  menuHeaderAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  menuHeaderAvatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    resizeMode: "cover",
  },
  menuHeaderInfo: {
    flex: 1,
  },
  menuHeaderName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  menuHeaderEmail: {
    fontSize: 12,
    marginBottom: 2,
  },
  menuHeaderRole: {
    fontSize: 11,
  },
  menuDivider: {
    height: 1,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "transparent",
  },
  menuItemDestructive: {
    backgroundColor: "#fff5f5",
  },
  menuItemIcon: {
    width: 20,
    marginRight: 12,
  },
  menuItemText: {
    fontSize: 14,
    flex: 1,
  },
  menuItemTextDestructive: {
    color: "#dc3545",
    fontWeight: "600",
  },
  menuOverlay: {
    position: "absolute" as "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    ...(Platform.OS === "web" ? { position: "fixed" as "absolute" } : {}),
    zIndex: 1000,
    backgroundColor: "transparent",
  },
});
