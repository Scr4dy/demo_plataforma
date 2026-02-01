import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  useWindowDimensions,
  Platform,
} from "react-native";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import InlineHeader from "../../components/common/InlineHeader";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { supabase } from "../../config/supabase";
import { useHeader } from "../../context/HeaderContext";

import { getCourseDurationText } from "../../utils/courseHelpers";
import { categoryService } from "../../services/categoryService";
import { ConfirmationModal } from "../../components/common/ConfirmationModal";

const isExpired = (fechaFin?: string): boolean => {
  if (!fechaFin) return false;
  const now = new Date();
  const expDate = new Date(fechaFin);
  return expDate < now;
};

const formatExpirationDate = (fechaFin?: string): string => {
  if (!fechaFin) return "";
  const expDate = new Date(fechaFin);
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };
  return expDate.toLocaleDateString("es-ES", options);
};

export default function MyCoursesScreen() {
  const navigation = useNavigation<any>();
  const { state } = useAuth();
  const { theme, colors } = useTheme();
  const { header, setHeader } = useHeader();
  const { width } = useWindowDimensions();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showExpirationModal, setShowExpirationModal] = useState(false);
  const [expirationMessage, setExpirationMessage] = useState("");

  const isWeb = Platform.OS === "web";
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const isDesktop = width >= 1024;
  const numColumns = isWeb && width >= 768 ? (width >= 1024 ? 3 : 2) : 1;

  const loadMyCourses = useCallback(async () => {
    try {
      setLoading(true);
      const authId = state.user?.id;
      if (!authId) {
        setCourses([]);
        return;
      }

      let targetUserId = state.user?.id_usuario;

      if (!targetUserId) {
        const { data: uData } = await supabase
          .from("usuarios")
          .select("id_usuario")
          .eq("auth_id", authId)
          .maybeSingle();

        if (uData) {
          targetUserId = uData.id_usuario;
        }
      }

      if (!targetUserId) {
        setCourses([]);
        return;
      }

      const { data: inscripciones, error: inscError } = await supabase
        .from("inscripciones")
        .select("id_curso, progreso, estado")
        .eq("id_empleado", targetUserId)
        .is("deleted_at", null);

      if (inscError) throw inscError;

      if (!inscripciones || inscripciones.length === 0) {
        setCourses([]);
        return;
      }

      const cursoIds = inscripciones.map((i) => i.id_curso);
      const { data: cursosData } = await supabase
        .from("cursos")
        .select("id_curso, titulo, fecha_fin, duracion, categorias (nombre)")
        .in("id_curso", cursoIds)
        .is("deleted_at", null);

      const initialCourses = (cursosData || []).map((curso) => {
        const inscripcion = inscripciones.find(
          (i) => String(i.id_curso) === String(curso.id_curso),
        );

        return {
          ...curso,
          progreso: inscripcion?.progreso || 0,
          estado: inscripcion?.estado || "inscrito",
          fecha_fin: curso.fecha_fin || null,
        };
      });

      setCourses(initialCourses);
      setLoading(false);

      if (cursosData && targetUserId) {
        Promise.all(
          cursosData.map((curso) =>
            categoryService
              .syncCourseProgress(String(targetUserId), String(curso.id_curso))
              .catch((err) => {}),
          ),
        ).then(() => {});
      }
    } catch (error) {
      setLoading(false);
    } finally {
    }
  }, [state.user?.id, state.user?.id_usuario]);

  useEffect(() => {
    loadMyCourses();
  }, []);

  const isFocused = useIsFocused();

  useEffect(() => {
    const applyHeader = () => {
      setHeader({
        title: "Mis Cursos",
        subtitle: "Tus cursos inscritos",
        showBack: true,
        onBack: () => {
          try {
            const { safeBack } = require("../../utils/navigationHelpers");
            safeBack(navigation);
          } catch (e) {}
        },
        manual: true,
      });
    };

    if (Platform.OS === "web") {
      applyHeader();
      const t = setTimeout(() => applyHeader(), 120);
      return () => {
        clearTimeout(t);
        if (header && header.manual && header.title === "Mis Cursos")
          setHeader(null);
      };
    }
  }, []);

  const renderCourseCard = ({ item }: any) => {
    const expired = isExpired(item.fecha_fin);
    const isCompleted = item.progreso >= 100;
    const isBlocked = expired && !isCompleted;

    return (
      <TouchableOpacity
        style={[
          styles.courseCard,
          { backgroundColor: theme.colors.card },
          isBlocked && { opacity: 0.6, borderColor: "#FF5252", borderWidth: 1 },
        ]}
        onPress={() => {
          if (isBlocked) {
            if (Platform.OS === "web")
              setExpirationMessage(
                `Este curso venció el ${formatExpirationDate(item.fecha_fin)}. Ya no está disponible para realizar.`,
              );
            setShowExpirationModal(true);
            return;
          }

          if (Platform.OS === "web") {
            const { goToWebRoute } = require("../../utils/webNav");
            goToWebRoute("CourseDetail", { courseId: String(item.id_curso) });
          } else {
            navigation.navigate("CourseDetail", {
              courseId: String(item.id_curso),
              courseTitle: item.titulo || "Curso",
              courseCategory: item.categorias?.nombre || "Sin categoría",
            });
          }
        }}
      >
        <View
          style={[
            styles.progressBadge,
            {
              backgroundColor:
                (item.progreso || 0) >= 100 ? "#E8F5E9" : colors.primaryLight,
            },
          ]}
        >
          <Text
            style={[
              styles.progressText,
              {
                color: (item.progreso || 0) >= 100 ? "#4CAF50" : colors.primary,
              },
            ]}
          >
            {item.progreso || 0}%
          </Text>
        </View>

        <Text
          style={[styles.courseTitle, { color: theme.colors.text }]}
          numberOfLines={2}
        >
          {item.titulo || "Sin título"}
        </Text>

        <Text
          style={[
            styles.courseCategory,
            { color: theme.dark ? "#999" : "#666" },
          ]}
          numberOfLines={1}
        >
          {item.categorias?.nombre || "Sin categoría"}
        </Text>

        <View style={styles.footer}>
          <View style={styles.footerItem}>
            <Ionicons
              name="time-outline"
              size={14}
              color={theme.dark ? "#999" : "#666"}
            />
            <Text
              style={[
                styles.footerText,
                { color: theme.dark ? "#999" : "#666" },
              ]}
            >
              Duración: {getCourseDurationText(item) || "0 min"}
            </Text>
          </View>

          {}
          {item.fecha_fin && (
            <View
              style={[
                styles.footerItem,
                {
                  backgroundColor:
                    isExpired(item.fecha_fin) && (item.progreso || 0) < 100
                      ? theme.dark
                        ? "#3a1515"
                        : "#ffebee"
                      : theme.dark
                        ? "rgba(59, 130, 246, 0.2)"
                        : "#e0f2fe",
                  borderColor:
                    isExpired(item.fecha_fin) && (item.progreso || 0) < 100
                      ? "#FF5252"
                      : theme.dark
                        ? "#1e40af"
                        : "#7dd3fc",
                  borderWidth: 1,
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  borderRadius: 6,
                  gap: 4,
                },
              ]}
            >
              <Ionicons
                name={
                  isExpired(item.fecha_fin) && (item.progreso || 0) < 100
                    ? "alert-circle"
                    : "calendar-outline"
                }
                size={12}
                color={
                  isExpired(item.fecha_fin) && (item.progreso || 0) < 100
                    ? "#FF5252"
                    : theme.dark
                      ? "#60a5fa"
                      : "#0284c7"
                }
              />
              <Text
                style={[
                  styles.footerText,
                  {
                    color:
                      isExpired(item.fecha_fin) && (item.progreso || 0) < 100
                        ? "#FF5252"
                        : theme.dark
                          ? "#60a5fa"
                          : "#0284c7",
                    fontWeight: "700",
                    fontSize: 11,
                  },
                ]}
              >
                {isExpired(item.fecha_fin) ? "Venció" : "Vence"}:{" "}
                {formatExpirationDate(item.fecha_fin)}
              </Text>
            </View>
          )}

          {item.estado === "completado" && (
            <View
              style={[styles.completedBadge, { backgroundColor: "#4CAF50" }]}
            >
              <Ionicons name="checkmark-circle" size={14} color="#fff" />
              <Text
                style={[styles.completedText, { color: theme.colors.card }]}
              >
                Completado
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.colors.background,
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>
          Cargando tus cursos...
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ConfirmationModal
        visible={showExpirationModal}
        title="Curso no disponible"
        message={expirationMessage}
        onConfirm={() => setShowExpirationModal(false)}
        onCancel={() => setShowExpirationModal(false)}
        confirmText="Entendido"
        singleButton={true}
      />
      {!isMobile && (
        <InlineHeader
          title="Mis Cursos"
          subtitle="Tus cursos inscritos"
          forceBackOnMobile={true}
          showOnWeb={false}
          containerStyle={{
            backgroundColor: theme.colors.card,
            borderBottomColor: theme.dark ? "#333" : "#e0e0e0",
          }}
        />
      )}
      <FlatList
        data={courses}
        key={numColumns}
        numColumns={numColumns}
        keyExtractor={(item) => String(item.id_curso || Math.random())}
        renderItem={renderCourseCard}
        contentContainerStyle={[
          { padding: isMobile ? 16 : isTablet ? 20 : 24 },
          isWeb &&
            isDesktop && { maxWidth: 1400, alignSelf: "center", width: "100%" },
        ]}
        columnWrapperStyle={
          numColumns > 1
            ? { gap: isMobile ? 14 : isTablet ? 18 : 20 }
            : undefined
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Ionicons
              name="book-outline"
              size={64}
              color={theme.dark ? "#555" : "#ccc"}
            />
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
              No hay cursos inscritos
            </Text>
            <Text
              style={[
                styles.emptyText,
                { color: theme.dark ? "#999" : "#666" },
              ]}
            >
              Explora el catálogo y comienza tu aprendizaje
            </Text>
            <TouchableOpacity
              style={[
                styles.exploreButton,
                { backgroundColor: colors.primary },
              ]}
              onPress={() => {
                if (Platform.OS === "web") {
                  const { goToWebTab } = require("../../utils/webNav");
                  goToWebTab("Categories");
                } else {
                  navigation.navigate("Categories");
                }
              }}
            >
              <Text
                style={[styles.exploreButtonText, { color: theme.colors.card }]}
              >
                Explorar Cursos
              </Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  courseCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    minHeight: 180,
    ...Platform.select({
      web: {
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.08)",
      },
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  progressBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 12,
  },
  progressText: {
    fontSize: 12,
    fontWeight: "700",
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
    lineHeight: 22,
    minHeight: 44,
  },
  courseCategory: {
    fontSize: 13,
    marginBottom: 12,
  },
  progressBarContainer: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 12,
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "auto",
  },
  footerItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  footerText: {
    fontSize: 12,
  },
  completedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  completedText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#fff",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
  },
  exploreButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  exploreButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
});
