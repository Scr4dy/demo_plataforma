import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
  RefreshControl,
  Dimensions,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RootStackParamList } from "../../types/navigation.types";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../../context/AuthContext";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { platformShadow } from "../../utils/styleHelpers";
import {
  getCourseDurationHours,
  getCourseDurationText,
} from "../../utils/courseHelpers";
import { useTheme } from "../../context/ThemeContext";
import { useHeader } from "../../context/HeaderContext";
import { categoryService } from "../../services/categoryService";
import { certificateService } from "../../services/certificateService";
import { useUserRole } from "../../hooks/useUserRole";

import { AppConfig } from "../../config/appConfig";
import { supabase } from "../../config/supabase";
import { on as onEvent, off as offEvent } from "../../utils/eventBus";
import {
  getGreetingMessage,
  getLoadingMessage,
} from "../../utils/personalizedMessages";
import { ConfirmationModal } from "../../components/common/ConfirmationModal";

const { width } = Dimensions.get("window");
const isWeb = Platform.OS === "web";

interface DashboardStats {
  cursosInscritos: number;
  cursosCompletados: number;
  horasAprendizaje: number;
  certificadosObtenidos: number;
  cursosActivos: number;
}

interface Course {
  id: string;
  titulo: string;
  categoria_nombre?: string;
  progreso?: number;
  duracion_horas: number;
  instructor_nombre?: string;
  instructor?: string;
  fecha_vencimiento?: string;
  categorias?: {
    nombre: string;
  };
}

export default function ModernDashboard() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { state } = useAuth();
  const { colors, theme, profileImage } = useTheme();
  const { setHeader } = useHeader();

  useEffect(() => {
    if (Platform.OS === "web") {
      setHeader({
        hidden: true,
        manual: true,
        owner: "Dashboard",
      });
    } else {
      setHeader({
        title: "Dashboard",
        subtitle: "Tu panel de aprendizaje",
        owner: "Dashboard",
        manual: true,
        showBack: false,
      });
    }

    return () => {
      try {
        setHeader(null);
      } catch (_) {}
    };
  }, [setHeader]);
  const MAX_CONTINUE = 3;
  const MAX_DASHBOARD_RECOMMENDED = 12;
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    cursosInscritos: 0,
    cursosCompletados: 0,
    horasAprendizaje: 0,
    certificadosObtenidos: 0,
    cursosActivos: 0,
  });

  const [showExpirationModal, setShowExpirationModal] = useState(false);
  const [expirationMessage, setExpirationMessage] = useState("");
  const [cursosContinuar, setCursosContinuar] = useState<Course[]>([]);
  const [cursosRecomendados, setCursosRecomendados] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState({
    inscripcionesCount: 0,
    cursosPublicosCount: 0,
    idEmpleado: "",
    continuarAllCount: 0,
    recomendadosAllCount: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const userId = state.user?.id || "";

      if (!userId) {
        setCursosContinuar([]);
        setCursosRecomendados([]);
        setStats((prev) => ({
          ...prev,
          cursosInscritos: 0,
          cursosCompletados: 0,
          horasAprendizaje: 0,
          certificadosObtenidos: 0,
          cursosActivos: prev.cursosActivos || 0,
        }));
        return;
      }

      const [usuarioData, inscripciones, certificadosReales, cursosPublicos] =
        await Promise.all([
          supabase
            .from("usuarios")
            .select("id_usuario")
            .eq("auth_id", userId)
            .maybeSingle()
            .then(({ data }) => data),
          supabase
            .from("inscripciones")
            .select(
              "id_inscripcion, id_curso, estado, progreso, fecha_completado, fecha_ultima_actividad, nota_final",
            )
            .eq("id_empleado", state.user?.id_usuario || "")
            .is("deleted_at", null)
            .then(({ data, error }) => {
              if (error) {
              }
              return data || [];
            }),

          supabase
            .from("certificaciones")
            .select("id_certificado, id_curso")
            .eq("id_usuario", state.user?.id_usuario || "")
            .not("url_certificado", "is", null)
            .neq("url_certificado", "")
            .is("deleted_at", null)
            .then(({ data, error }) => {
              if (error) return data || [];
            }),
          supabase
            .from("cursos")
            .select(
              "*, usuarios:id_instructor (nombre, apellido_paterno), categorias (nombre)",
            )
            .order("titulo")
            .then(({ data, error }) => {
              if (error) {
              }
              return data || [];
            }),
        ]);

      const enrolledCursoIds = Array.from(
        new Set(
          (inscripciones || [])
            .map((i: any) => (i.id_curso || "").toString())
            .filter(Boolean),
        ),
      );

      let cursosInscritosData: any[] = [];
      if (enrolledCursoIds.length > 0) {
        try {
          const { data: cursosEnrolled, error: cursosEnrolledError } =
            await supabase
              .from("cursos")
              .select(
                "*, usuarios:id_instructor (nombre, apellido_paterno), categorias (nombre)",
              )
              .in("id_curso", enrolledCursoIds)
              .is("deleted_at", null);

          if (cursosEnrolledError) {
            if (
              cursosEnrolledError?.code === "42703" ||
              (cursosEnrolledError?.message &&
                cursosEnrolledError.message
                  .toLowerCase()
                  .includes("column id_curso"))
            ) {
              const { data: cursosEnrolledId, error: cursosEnrolledIdError } =
                await supabase
                  .from("cursos")
                  .select(
                    "*, usuarios:id_instructor (nombre, apellido_paterno), categorias (nombre)",
                  )
                  .in("id", enrolledCursoIds)
                  .is("deleted_at", null);

              if (cursosEnrolledIdError) {
              } else {
                cursosInscritosData = cursosEnrolledId || [];
              }
            } else {
            }
          } else {
            cursosInscritosData = cursosEnrolled || [];
          }
        } catch (err) {}
      }
      const inscritosData = (inscripciones || [])
        .map((ins: any) => {
          const curso = cursosInscritosData.find(
            (c) =>
              ((c.id_curso || c.id) && (c.id_curso || c.id).toString()) ===
              ins.id_curso.toString(),
          );
          if (!curso) {
            return null;
          }

          const duracionHoras = getCourseDurationHours(curso);
          let instructorName = "";
          if (curso?.usuarios) {
            const u = curso.usuarios;
            instructorName =
              `${u.nombre || ""} ${u.apellido_paterno || ""}`.trim();
          }

          return {
            id: (curso?.id_curso || curso?.id || ins.id_curso || "").toString(),
            titulo: curso?.titulo || "Sin título",
            categoria_nombre:
              (curso?.categorias && curso.categorias.nombre) ||
              curso?.categoria ||
              "Sin categoría",
            progreso: ins.progreso ?? 0,
            duracion_horas: duracionHoras,
            instructor_nombre:
              instructorName ||
              curso?.instructor ||
              curso?.instructor_nombre ||
              "",
            id_instructor:
              curso?.id_instructor ??
              curso?.idInstructor ??
              curso?.instructor_id ??
              null,
            fecha_vencimiento: curso?.fecha_fin || null,
          } as Course & { id_instructor?: any };
        })
        .filter(
          (item): item is Course & { id_instructor?: any } => item !== null,
        );

      const completados = inscritosData.filter(
        (c: any) => c.progreso === 100,
      ).length;

      const horasTotales = inscritosData.reduce(
        (acc: number, curso: Course) => {
          const horas = curso.duracion_horas || 0;
          return acc + horas;
        },
        0,
      );

      const certificadosDescargables = (certificadosReales || []).length;

      setStats((prev) => ({
        ...prev,
        cursosInscritos: inscritosData.length,
        cursosCompletados: completados,
        horasAprendizaje: Math.round(horasTotales),
        certificadosObtenidos: certificadosDescargables,
        cursosActivos: prev.cursosActivos || 0,
      }));

      let cursosPublicosFinal: any[] | null = cursosPublicos || [];

      const isCoursePublic = (curso: any) => {
        if (!curso) return false;

        if (curso.activo !== undefined && curso.activo !== null)
          return !!curso.activo;
        if (curso.es_publico !== undefined && curso.es_publico !== null)
          return !!curso.es_publico;

        return true;
      };

      if (!cursosPublicosFinal || cursosPublicosFinal.length === 0) {
        try {
          const { data: allCursos, error: allCursosError } = await supabase
            .from("cursos")
            .select(
              `
              id_curso,
              titulo,
              duracion,
              activo,
              categorias (nombre)
            `,
            )
            .order("titulo");

          if (allCursosError) {
            // Error ignored
          } else {
            cursosPublicosFinal = allCursos;
          }
        } catch (err) {}

        if (!cursosPublicosFinal || cursosPublicosFinal.length === 0) {
          try {
            const { data: anyCursos, error: anyCursosError } = await supabase
              .from("cursos")
              .select("*")
              .order("titulo");
            if (anyCursosError) {
              // Error ignored
            } else {
              cursosPublicosFinal = anyCursos;
            }
          } catch (err) {}
        }
      }
      const inscritosIds = new Set(
        (inscripciones || [])
          .map(
            (i: any) =>
              i.id_curso ||
              i.cursos?.[0]?.id_curso ||
              i.curso_id ||
              i.cursos?.[0]?.id ||
              i.id ||
              "",
          )
          .filter(Boolean),
      );

      const publicCursos = (cursosPublicosFinal || []).filter((c: any) =>
        isCoursePublic(c),
      );

      const instructorIdsSet = new Set<string>();
      (cursosInscritosData || []).forEach((c) => {
        const iid =
          c.id_instructor ??
          c.instructor_id ??
          c.instructorId ??
          c.idInstructor;
        if (iid) instructorIdsSet.add(String(iid));
      });

      let instructorMap: Record<string, string> = {};
      if (instructorIdsSet.size > 0) {
        try {
          const ids = Array.from(instructorIdsSet);

          const { data: usersByIdUsuario } = await supabase
            .from("usuarios")
            .select("id_usuario,nombre,apellido_paterno")
            .in("id_usuario", ids as any);
          usersByIdUsuario?.forEach((u: any) => {
            if (u?.id_usuario) {
              instructorMap[String(u.id_usuario)] =
                `${u.nombre || ""} ${u.apellido_paterno || ""}`.trim() ||
                u.nombre_completo ||
                "";
            }
          });
          const missing = ids.filter((id) => !instructorMap[id]);
          if (missing.length > 0) {
            const { data: usersById } = await supabase
              .from("usuarios")
              .select("id_usuario,nombre,apellido_paterno")
              .in("id_usuario", missing as any);
            usersById?.forEach((u: any) => {
              if (u?.id_usuario) {
                instructorMap[String(u.id_usuario)] =
                  `${u.nombre || ""} ${u.apellido_paterno || ""}`.trim() ||
                  u.nombre_completo ||
                  "";
              }
            });
          }
        } catch (err) {}
      }

      const inscritosUpdated = inscritosData.map((c: any) => ({
        ...c,
        instructor_nombre:
          c.instructor_nombre ||
          (c.id_instructor ? instructorMap[String(c.id_instructor)] : "") ||
          "",
      }));

      const continuarAll = inscritosUpdated
        .filter((c) => c.progreso > 0 && c.progreso < 100)
        .sort((a, b) => (b.progreso || 0) - (a.progreso || 0));
      const continuar = continuarAll.slice(0, MAX_CONTINUE);
      setCursosContinuar(continuar);

      const todosInscritos = inscritosUpdated.sort(
        (a, b) => (b.progreso || 0) - (a.progreso || 0),
      );
      setCursosRecomendados(todosInscritos);

      setStats((prev) => {
        const next = { ...prev, cursosActivos: (publicCursos || []).length };
        return next;
      });

      setDebugInfo({
        inscripcionesCount: (inscripciones || []).length,
        cursosPublicosCount: (cursosPublicosFinal || []).length,
        idEmpleado: usuarioData?.id_usuario || "",
        continuarAllCount: continuarAll.length,
        recomendadosAllCount: todosInscritos.length,
      });
    } catch (error) {
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const hexToRgba = (hex: string, alpha: number) => {
    const hexClean = hex.replace("#", "");
    const bigint = parseInt(
      hexClean.length === 3
        ? hexClean
            .split("")
            .map((c) => c + c)
            .join("")
        : hexClean,
      16,
    );
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const isExpired = (fechaVencimiento?: string): boolean => {
    if (!fechaVencimiento) return false;
    const now = new Date();
    const expDate = new Date(fechaVencimiento);
    return expDate < now;
  };

  const isExpiringSoon = (fechaVencimiento?: string): boolean => {
    if (!fechaVencimiento) return false;
    const now = new Date();
    const expDate = new Date(fechaVencimiento);
    const diffDays = Math.ceil(
      (expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );
    return diffDays > 0 && diffDays <= 7;
  };

  const formatExpirationDate = (fechaVencimiento?: string): string => {
    if (!fechaVencimiento) return "";
    const expDate = new Date(fechaVencimiento);
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    return expDate.toLocaleDateString("es-ES", options);
  };

  const lightenColor = (hex: string, percent: number) => {
    const hexClean = hex.replace("#", "");
    const bigint = parseInt(
      hexClean.length === 3
        ? hexClean
            .split("")
            .map((c) => c + c)
            .join("")
        : hexClean,
      16,
    );
    let r = (bigint >> 16) & 255;
    let g = (bigint >> 8) & 255;
    let b = bigint & 255;

    r = Math.min(255, Math.floor(r + (255 - r) * percent));
    g = Math.min(255, Math.floor(g + (255 - g) * percent));
    b = Math.min(255, Math.floor(b + (255 - b) * percent));

    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  };

  const renderStatCard = (
    icon: string,
    value: number,
    label: string,
    color: string,
    gradientColors: [string, string],
  ) => (
    <View style={styles.statCard}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.statGradient}
      >
        <View
          style={[
            styles.statIconContainer,
            {
              backgroundColor: theme.dark
                ? hexToRgba("#ffffff", 0.06)
                : hexToRgba(color, 0.12),
            },
          ]}
        >
          <Ionicons name={icon as any} size={28} color={color} />
        </View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </LinearGradient>
    </View>
  );

  const renderCourseCard = (
    course: Course,
    tipo: "continuar" | "recomendado",
  ) => {
    const expired = isExpired(course.fecha_vencimiento);
    const expiringSoon = isExpiringSoon(course.fecha_vencimiento);
    const isCompleted = course.progreso === 100;

    const isBlocked = expired && !isCompleted;

    return (
      <TouchableOpacity
        key={course.id}
        style={[
          styles.courseCard,
          { backgroundColor: theme.colors.card },
          tipo === "continuar"
            ? [styles.continueCard, { borderLeftColor: colors.primary }]
            : styles.recommendCard,

          isBlocked && { opacity: 0.6, borderWidth: 1, borderColor: "#FF5252" },
        ]}
        onPress={() => {
          if (isBlocked) {
            if (isBlocked) {
              setExpirationMessage(
                `Este curso venció el ${formatExpirationDate(course.fecha_vencimiento)}. Ya no está disponible para realizar.`,
              );
              setShowExpirationModal(true);
              return;
            }
            return;
          }

          if (Platform.OS === "web") {
            const { goToWebRoute } = require("../../utils/webNav");
            goToWebRoute("CourseDetail", { courseId: course.id });
          } else {
            navigation.navigate("CourseDetail", {
              courseId: course.id,
              courseTitle: course.titulo,
              courseCategory: course.categoria_nombre,
            });
          }
        }}
      >
        <View style={styles.courseCardHeader}>
          <View
            style={[
              styles.categoryBadge,
              { backgroundColor: colors.primaryLight },
            ]}
          >
            <Text style={[styles.categoryBadgeText, { color: colors.primary }]}>
              {course.categoria_nombre}
            </Text>
          </View>
          {}
          {isCompleted && (
            <View
              style={[
                styles.progressBadge,
                { backgroundColor: theme.dark ? "#1a3a2a" : "#e8f5e9" },
              ]}
            >
              <Ionicons name="checkmark-circle" size={12} color="#4CAF50" />
              <Text
                style={[
                  styles.progressBadgeText,
                  { color: "#4CAF50", fontWeight: "600" },
                ]}
              >
                Completado
              </Text>
            </View>
          )}
          {}
          {tipo === "continuar" &&
            !isCompleted &&
            !isBlocked &&
            !expiringSoon && (
              <View
                style={[
                  styles.progressBadge,
                  { backgroundColor: theme.dark ? "#2a2a2a" : "#F5F5F5" },
                ]}
              >
                <Ionicons name="time-outline" size={12} color="#FF9800" />
                <Text
                  style={[
                    styles.progressBadgeText,
                    { color: theme.colors.text },
                  ]}
                >
                  {course.progreso}%
                </Text>
              </View>
            )}
          {}
          {isBlocked && (
            <View
              style={[
                styles.progressBadge,
                { backgroundColor: theme.dark ? "#3a1515" : "#ffebee" },
              ]}
            >
              <Ionicons name="alert-circle" size={12} color="#FF5252" />
              <Text
                style={[
                  styles.progressBadgeText,
                  { color: "#FF5252", fontWeight: "600" },
                ]}
              >
                Vencido
              </Text>
            </View>
          )}
          {expiringSoon && !expired && !isCompleted && (
            <View
              style={[
                styles.progressBadge,
                { backgroundColor: theme.dark ? "#3a2f15" : "#fff8e1" },
              ]}
            >
              <Ionicons name="warning" size={12} color="#FFA000" />
              <Text
                style={[
                  styles.progressBadgeText,
                  { color: "#FFA000", fontWeight: "600" },
                ]}
              >
                Por vencer
              </Text>
            </View>
          )}
        </View>

        <Text
          style={[
            styles.courseTitle,
            {
              color: isBlocked ? theme.colors.textSecondary : theme.colors.text,
            },
          ]}
          numberOfLines={2}
        >
          {course.titulo}
        </Text>

        {}
        {course.progreso !== undefined && course.progreso > 0 && (
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBarBackground,
                { backgroundColor: theme.dark ? "#2a2a2a" : "#E0E0E0" },
              ]}
            >
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${course.progreso}%`,
                    backgroundColor: expired
                      ? "#FF5252"
                      : course.progreso === 100
                        ? "#4CAF50"
                        : course.progreso >= 75
                          ? "#2196F3"
                          : course.progreso >= 50
                            ? "#FF9800"
                            : "#FFA726",
                  },
                ]}
              />
            </View>
            <Text
              style={[
                styles.progressPercentText,
                { color: theme.colors.textSecondary },
              ]}
            >
              {course.progreso}%
            </Text>
          </View>
        )}

        <View style={styles.courseFooter}>
          {course.instructor_nombre || course.instructor ? (
            <View style={styles.courseInfoRow}>
              <View style={styles.courseLabelContainer}>
                <Ionicons
                  name="person-circle-outline"
                  size={16}
                  color={colors.primary}
                />
                <Text
                  style={[styles.courseLabel, { color: colors.textSecondary }]}
                >
                  Instructor:
                </Text>
              </View>
              <Text
                style={[styles.courseValue, { color: theme.colors.text }]}
                numberOfLines={1}
              >
                {course.instructor_nombre || course.instructor}
              </Text>
            </View>
          ) : (
            <View style={styles.courseInfoRow}>
              <View style={styles.courseLabelContainer}>
                <Ionicons
                  name="person-circle-outline"
                  size={16}
                  color={colors.primary}
                />
                <Text
                  style={[styles.courseLabel, { color: colors.textSecondary }]}
                >
                  Instructor:
                </Text>
              </View>
              <Text
                style={[styles.courseValue, { color: theme.colors.text }]}
                numberOfLines={1}
              >
                No asignado
              </Text>
            </View>
          )}

          <View style={styles.courseInfoRow}>
            <View style={styles.courseLabelContainer}>
              <Ionicons name="time-outline" size={16} color={colors.primary} />
              <Text
                style={[styles.courseLabel, { color: colors.textSecondary }]}
              >
                Duración:
              </Text>
            </View>
            <Text style={[styles.courseValue, { color: theme.colors.text }]}>
              {getCourseDurationText(course) || "0 min"}
            </Text>
          </View>

          {}
          {course.fecha_vencimiento && (
            <View
              style={{
                marginTop: 4,
                backgroundColor: isBlocked
                  ? theme.dark
                    ? "#3a1515"
                    : "#ffebee"
                  : expiringSoon
                    ? theme.dark
                      ? "#3a2f15"
                      : "#fff8e1"
                    : theme.dark
                      ? "rgba(59, 130, 246, 0.2)"
                      : "#e0f2fe",
                borderColor: isBlocked
                  ? "#FF5252"
                  : expiringSoon
                    ? "#FFA000"
                    : theme.dark
                      ? "#1e40af"
                      : "#7dd3fc",
                borderWidth: 1,
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 8,
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                alignSelf: "flex-start",
              }}
            >
              <Ionicons
                name={
                  isBlocked
                    ? "alert-circle"
                    : expiringSoon
                      ? "warning"
                      : "calendar-outline"
                }
                size={14}
                color={
                  isBlocked
                    ? "#FF5252"
                    : expiringSoon
                      ? "#FFA000"
                      : theme.dark
                        ? "#60a5fa"
                        : "#0284c7"
                }
              />
              <Text
                style={{
                  color: isBlocked
                    ? "#FF5252"
                    : expiringSoon
                      ? "#FFA000"
                      : theme.dark
                        ? "#60a5fa"
                        : "#0284c7",
                  fontWeight: "700",
                  fontSize: 12,
                }}
              >
                {expired ? "Venció:" : "Vence:"}{" "}
                {formatExpirationDate(course.fecha_vencimiento)}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView
      edges={["left", "right"]}
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
      <ScrollView
        style={[
          styles.scrollView,
          { backgroundColor: theme.colors.background },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {}
        <View style={{ marginHorizontal: 16, marginTop: 16, marginBottom: 8 }}>
          <Text
            style={[
              styles.greeting,
              { color: theme.colors.text, fontSize: 24, fontWeight: "bold" },
            ]}
          >
            {getGreetingMessage(
              state.user?.nombre || "Usuario",
              state.user?.role || "empleado",
            )}
          </Text>
        </View>

        {}
        <View style={styles.statsContainer}>
          <View style={styles.compactStatsRow}>
            <View
              style={[
                styles.compactStatItem,
                { backgroundColor: theme.colors.card },
              ]}
            >
              <View
                style={[
                  styles.statIconBubble,
                  { backgroundColor: hexToRgba(colors.primary, 0.1) },
                ]}
              >
                <Ionicons name="book" size={18} color={colors.primary} />
              </View>
              <Text
                style={[styles.compactStatValue, { color: theme.colors.text }]}
              >
                {stats.cursosActivos}
              </Text>
              <Text
                style={[
                  styles.compactStatLabel,
                  { color: theme.dark ? "#999" : "#64748B" },
                ]}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                Activos
              </Text>
            </View>

            <View
              style={[
                styles.compactStatItem,
                { backgroundColor: theme.colors.card },
              ]}
            >
              <View
                style={[
                  styles.statIconBubble,
                  { backgroundColor: hexToRgba("#10B981", 0.1) },
                ]}
              >
                <Ionicons name="checkmark-circle" size={18} color="#10B981" />
              </View>
              <Text
                style={[styles.compactStatValue, { color: theme.colors.text }]}
              >
                {stats.cursosCompletados}
              </Text>
              <Text
                style={[
                  styles.compactStatLabel,
                  { color: theme.dark ? "#999" : "#64748B" },
                ]}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                Completados
              </Text>
            </View>

            <View
              style={[
                styles.compactStatItem,
                { backgroundColor: theme.colors.card },
              ]}
            >
              <View
                style={[
                  styles.statIconBubble,
                  { backgroundColor: hexToRgba(colors.primary, 0.1) },
                ]}
              >
                <Ionicons name="time" size={18} color={colors.primary} />
              </View>
              <Text
                style={[styles.compactStatValue, { color: theme.colors.text }]}
              >
                {stats.horasAprendizaje}
              </Text>
              <Text
                style={[
                  styles.compactStatLabel,
                  { color: theme.dark ? "#999" : "#64748B" },
                ]}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                Horas
              </Text>
            </View>

            <View
              style={[
                styles.compactStatItem,
                { backgroundColor: theme.colors.card },
              ]}
            >
              <View
                style={[
                  styles.statIconBubble,
                  { backgroundColor: hexToRgba("#F59E0B", 0.1) },
                ]}
              >
                <Ionicons name="ribbon" size={18} color="#F59E0B" />
              </View>
              <Text
                style={[styles.compactStatValue, { color: theme.colors.text }]}
              >
                {stats.certificadosObtenidos}
              </Text>
              <Text
                style={[
                  styles.compactStatLabel,
                  { color: theme.dark ? "#999" : "#64748B" },
                ]}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                Certificados
              </Text>
            </View>
          </View>
        </View>

        {}
        <View style={styles.quickAccessContainer}>
          {}

          <TouchableOpacity
            style={[styles.quickAccessButton, styles.quickAccessButtonWeb]}
            onPress={() => {
              if (Platform.OS === "web") {
                const { goToWebTab } = require("../../utils/webNav");
                goToWebTab("Categories");
              } else {
                navigation.navigate("Categories");
              }
            }}
          >
            <View
              style={[
                styles.quickIconContainer,
                {
                  backgroundColor: theme.dark
                    ? theme.colors.divider
                    : hexToRgba(colors.primary, 0.1),
                },
              ]}
            >
              <Ionicons
                name="grid"
                size={24}
                color={theme.dark ? "#fff" : colors.primary}
              />
            </View>
            <Text
              style={[styles.quickAccessText, { color: theme.colors.text }]}
              numberOfLines={2}
            >
              Explorar Cursos
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickAccessButton, styles.quickAccessButtonWeb]}
            onPress={() => {
              if (isWeb) {
                const { goToWebTab } = require("../../utils/webNav");
                goToWebTab("Certificates");
              } else {
                navigation.navigate("Certificates");
              }
            }}
          >
            <View
              style={[
                styles.quickIconContainer,
                {
                  backgroundColor: theme.dark
                    ? theme.colors.divider
                    : hexToRgba("#F59E0B", 0.1),
                },
              ]}
            >
              <Ionicons
                name="ribbon"
                size={24}
                color={theme.dark ? "#fff" : "#F59E0B"}
              />
            </View>
            <Text
              style={[styles.quickAccessText, { color: theme.colors.text }]}
              numberOfLines={2}
            >
              Certificados
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickAccessButton, styles.quickAccessButtonWeb]}
            onPress={() => {
              if (isWeb) {
                const { goToWebRoute } = require("../../utils/webNav");
                goToWebRoute("GlobalSearch", {});
              } else {
                navigation.navigate("GlobalSearch");
              }
            }}
          >
            <View
              style={[
                styles.quickIconContainer,
                {
                  backgroundColor: theme.dark
                    ? theme.colors.divider
                    : hexToRgba(colors.primary, 0.1),
                },
              ]}
            >
              <Ionicons
                name="search-outline"
                size={24}
                color={theme.dark ? "#fff" : colors.primary}
              />
            </View>
            <Text
              style={[styles.quickAccessText, { color: theme.colors.text }]}
              numberOfLines={2}
            >
              Buscar
            </Text>
          </TouchableOpacity>
        </View>

        {}
        {cursosRecomendados.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View>
                <Text
                  style={[styles.sectionTitle, { color: theme.colors.text }]}
                >
                  Mis Cursos
                </Text>
                <Text
                  style={[
                    styles.sectionSubtitle,
                    { color: theme.dark ? "#999" : "#666" },
                  ]}
                >
                  {cursosRecomendados.length} curso
                  {cursosRecomendados.length !== 1 ? "s" : ""} inscrito
                  {cursosRecomendados.length !== 1 ? "s" : ""}
                </Text>
              </View>
              {cursosRecomendados.length > 0 && (
                <TouchableOpacity
                  onPress={() => {
                    if (isWeb) {
                      const { goToWebTab } = require("../../utils/webNav");
                      goToWebTab("MyCourses");
                    } else {
                      navigation.navigate("MyCourses");
                    }
                  }}
                >
                  <Text style={[styles.seeAllText, { color: colors.primary }]}>
                    Ver todos
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.horizontalScroll}
              contentContainerStyle={styles.horizontalScrollContent}
            >
              {cursosRecomendados.map((course) =>
                renderCourseCard(course, "continuar"),
              )}
            </ScrollView>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },

  headerGradient: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  greeting: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 4,
  },
  subGreeting: {
    fontSize: 14,
    fontWeight: "400",
  },
  avatarContainer: {
    alignItems: "center",
    gap: 4,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },
  userName: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "500",
    maxWidth: 80,
  },
  departmentText: {
    fontSize: 14,
    fontWeight: "500",
    marginTop: 6,
    letterSpacing: 0.2,
  },
  statsContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  compactStatsRow: {
    flexDirection: "row",
    gap: 16,
  },
  compactStatItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderRadius: 12,
    justifyContent: "center",
  },
  statIconBubble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  compactStatValue: {
    marginTop: 6,
    marginBottom: 2,
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: -0.5,
    includeFontPadding: false,
  },
  compactStatLabel: {
    fontSize: 10,
    textAlign: "center",
    fontWeight: "600",
    letterSpacing: 0.2,
    textTransform: "uppercase",
    opacity: 0.8,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 20,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.15)",
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.15)",
      },
    }),
  },
  statGradient: {
    padding: 20,
    alignItems: "center",
    minHeight: 140,
    justifyContent: "center",
  },
  statIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  statValue: {
    fontSize: 36,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 6,
    letterSpacing: -1,
  },
  statLabel: {
    fontSize: 13,
    color: "#fff",
    opacity: 0.95,
    textAlign: "center",
    fontWeight: "600",
  },
  quickAccessContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    gap: 12,
    justifyContent: "space-between",
    width: "100%",
  },
  quickAccessButton: {
    flex: 1,
    alignItems: "center",
    gap: 8,
    borderRadius: 16,
    paddingVertical: 12,
    justifyContent: "flex-start",
  },
  quickIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  quickAccessText: {
    fontSize: 11,
    textAlign: "center",
    fontWeight: "600",
    lineHeight: 14,
    width: "100%",
  },
  quickAccessButtonWeb: {
    ...Platform.select({
      web: {
        outlineWidth: 0,
        outlineColor: "transparent",
      },
    }),
  },
  section: {
    marginBottom: 0,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 14,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: "600",
  },
  horizontalScroll: {
    paddingLeft: 16,
  },
  horizontalScrollContent: {
    paddingRight: 16,
    gap: 12,
    paddingBottom: 0,
  },
  courseCard: {
    width: isWeb ? 300 : width * 0.8,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.04)",
    marginRight: 4,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.06,
        shadowRadius: 24,
      },
      android: {
        elevation: 2,
        shadowColor: "#000",
      },
      web: {
        boxShadow: "0 8px 30px rgba(0,0,0,0.04)",
      },
    }),
  },
  continueCard: {},
  recommendCard: {},
  courseCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  progressBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  progressBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  courseTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 12,
    lineHeight: 24,
    letterSpacing: -0.3,
  },
  progressBarContainer: {
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  progressBarBackground: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressPercentText: {
    fontSize: 13,
    fontWeight: "600",
    minWidth: 40,
    textAlign: "right",
  },
  courseFooter: {
    marginTop: 12,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.04)",
    paddingTop: 12,
  },
  courseInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  courseLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  courseLabel: {
    fontSize: 13,
    fontWeight: "500",
  },
  courseValue: {
    fontSize: 13,
    fontWeight: "600",
    maxWidth: "55%",
  },
  motivationalCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 16,
    padding: 18,
    borderRadius: 16,
    borderLeftWidth: 4,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      },
    }),
  },
  motivationalGradient: {
    padding: 24,
    alignItems: "center",
  },
  motivationalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 16,
    marginBottom: 8,
  },
  motivationalText: {
    fontSize: 14,
    color: "#2C2C2C",
    lineHeight: 20,
    marginLeft: 12,
    flex: 1,
    fontWeight: "500",
  },
  motivationalButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  motivationalButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },
});
