import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useHeader } from "../../context/HeaderContext";
import {
  categoryService,
  Categoria,
  Curso,
} from "../../services/categoryService";

const hexToRgba = (hex: string, alpha: number) => {
  const sanitized = hex.replace("#", "");
  const bigint = parseInt(sanitized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const darkenHex = (hex: string, factor: number) => {
  const sanitized = hex.replace("#", "");
  const bigint = parseInt(sanitized, 16);
  let r = (bigint >> 16) & 255;
  let g = (bigint >> 8) & 255;
  let b = bigint & 255;
  r = Math.max(0, Math.min(255, Math.round(r * factor)));
  g = Math.max(0, Math.min(255, Math.round(g * factor)));
  b = Math.max(0, Math.min(255, Math.round(b * factor)));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
};

import {
  getCourseDurationHours,
  getCourseDurationText,
} from "../../utils/courseHelpers";
import { platformShadow } from "../../utils/styleHelpers";
import { SUPABASE_CONFIG } from "../../config/supabase";
import { AppConfig } from "../../config/appConfig";
import {
  getLoadingMessage,
  getEmptyStateMessage,
} from "../../utils/personalizedMessages";
import { useEvaluaciones } from "../../hooks/useEvaluaciones";
import { CourseEvaluationModal } from "../../components/courses/CourseEvaluationModal";

const CategoriesScreen = () => {
  const navigation = useNavigation<any>();
  const { state } = useAuth();
  const { theme, colors } = useTheme();
  const { header, setHeader } = useHeader();
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  React.useEffect(() => {
    try {
      if (Platform.OS === "web") {
        setHeader({ hidden: true, owner: "Categories", manual: true });
      } else {
        setHeader({
          title: "Cursos",
          subtitle: "Explora por categoría",
          owner: "Categories",
          manual: true,
          showBack: false,
        });
      }
    } catch (e) {}

    return () => {
      try {
        setHeader(null);
      } catch (e) {}
    };
  }, []);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<
    string | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [hasBackendError, setHasBackendError] = useState(false);
  const usingBackend = !!(
    (AppConfig.supabase?.url && AppConfig.supabase?.anonKey) ||
    (SUPABASE_CONFIG?.URL && SUPABASE_CONFIG?.ANON_KEY)
  );

  const { verificarPuedeEvaluar } = useEvaluaciones();

  const [showEvaluationModal, setShowEvaluationModal] = useState(false);
  const [evaluationCourseId, setEvaluationCourseId] = useState<number | null>(
    null,
  );
  const [evaluationCourseTitle, setEvaluationCourseTitle] =
    useState<string>("");

  const cargarDatos = React.useCallback(
    async (useLoadingState = true) => {
      try {
        if (useLoadingState) setLoading(true);
        setHasBackendError(false);
        const [categoriasData, cursosData] = await Promise.all([
          categoryService.getCategorias(),
          categoryService.getCursosDisponibles(state.user?.id || ""),
        ]);

        setCategorias(categoriasData);
        setCursos(cursosData);
        // Log removed

        if (
          (categoriasData || []).length === 0 &&
          (cursosData || []).length === 0
        ) {
          setHasBackendError(true);
        }

        if (categoriasData && categoriasData.length > 0) {
          setCategorias(categoriasData);
          setCategoriaSeleccionada(null);
          setHasBackendError(false);

          const enrichedCursos = (cursosData || []).map((c: any) => {
            let cat = null;
            const cAny = c as any;
            if (cAny.id_categoria || c.categoria_id) {
              const catId = String(cAny.id_categoria || c.categoria_id);
              cat = categoriasData.find((ct) => String(ct.id) === catId);
            }

            if (!cat && c.categoria) {
              const catName = String(c.categoria).trim().toLowerCase();
              cat = categoriasData.find(
                (ct) => String(ct.nombre).trim().toLowerCase() === catName,
              );
            }

            if (cat) {
              return {
                ...c,
                categoria: cat.nombre,
                categoria_id: cat.id,
                categorias: {
                  nombre: cat.nombre,
                  color: cat.color,
                  icono: cat.icono,
                },
              };
            }
            return c;
          });
          setCursos(enrichedCursos);
        } else {
          const derivedMap = new Map<string, Categoria>();
          (cursosData || []).forEach((c: any) => {
            const name = c.categoria || "Sin categoría";
            const id =
              name !== "Sin categoría"
                ? `cat_${String(name).toLowerCase().replace(/\s+/g, "_")}`
                : "cat_sin_categoria";

            if (!derivedMap.has(id)) {
              derivedMap.set(id, {
                id: id,
                nombre: name,
                descripcion:
                  name !== "Sin categoría"
                    ? `Cursos de ${name}`
                    : "Cursos sin categoría asignada",
                color: getColorCategoria(name),
                icono: getIconoCategoria(name),
                activo: true,
                orden: 99,
                created_at: new Date().toISOString(),
              });
            }
          });

          const derived = Array.from(derivedMap.values());

          if (derived.length > 0) {
            setCategorias(derived);
            setCategoriaSeleccionada(null);
            setHasBackendError(false);
            setCursos(cursosData);
          }
        }
      } catch (error) {
        setHasBackendError(true);
        Alert.alert("Error", "No se pudieron cargar las categorías y cursos");
      } finally {
        if (useLoadingState) setLoading(false);
      }
    },
    [state.user?.id],
  );

  React.useEffect(() => {
    cargarDatos(true);
  }, []);

  const handleRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await cargarDatos(false);
    setRefreshing(false);
  }, [cargarDatos]);

  const cursosFiltrados = React.useMemo(() => {
    if (!categoriaSeleccionada) return cursos;

    const sel =
      categorias.find((ct) => ct.id === categoriaSeleccionada) || null;

    if (!sel) {
      return cursos.filter(
        (curso) =>
          String(curso.categoria_id) === String(categoriaSeleccionada) ||
          String((curso as any).categoriaId) === String(categoriaSeleccionada),
      );
    }

    if (String(sel.nombre).toLowerCase() === "sin categoría") {
      return cursos.filter((curso) => {
        const nombre = String(
          curso.categoria || curso.categorias?.nombre || "",
        ).trim();
        return (
          nombre === "" ||
          nombre.toLowerCase() === "sin categoría" ||
          !curso.categoria_id
        );
      });
    }

    return cursos.filter((curso) => {
      if (
        (curso as any).id_categoria &&
        String((curso as any).id_categoria) === String(sel.id)
      )
        return true;
      if (curso.categoria_id && String(curso.categoria_id) === String(sel.id))
        return true;
      if (
        (curso as any).categoriaId &&
        String((curso as any).categoriaId) === String(sel.id)
      )
        return true;

      const nombre = String(curso.categoria || curso.categorias?.nombre || "")
        .trim()
        .toLowerCase();
      return (
        nombre ===
        String(sel.nombre || "")
          .trim()
          .toLowerCase()
      );
    });
  }, [categoriaSeleccionada, cursos, categorias]);

  const inscribirEnCurso = async (cursoId: string | number) => {
    try {
      if (!state.user?.id) {
        Alert.alert("Error", "Usuario no identificado");
        return;
      }

      const cursoIdStr = String(cursoId);
      const inscripcion = await categoryService.inscribirEnCurso(
        state.user.id,
        cursoIdStr,
      );

      setCursos((prevCursos) => {
        const updated = prevCursos.map((curso) => {
          if (String(curso.id) === cursoIdStr) {
            return {
              ...curso,
              inscrito: true,
              progreso: 0,
              inscripcionEstado: "en_progreso",
            };
          }
          return curso;
        });
        return updated;
      });

      Alert.alert("Éxito", "¡Inscripción exitosa! Ya puedes acceder al curso", [
        { text: "OK" },
        {
          text: "Ir al curso",
          onPress: () => {
            const courseIdParam = String(cursoId);
            if (Platform.OS === "web") {
              const { goToWebRoute } = require("../../utils/webNav");
              goToWebRoute("CourseDetail", { courseId: courseIdParam });
            } else {
              navigation.navigate("CourseDetail", { courseId: courseIdParam });
            }
          },
        },
      ]);
    } catch (error: any) {
      // Log removed
      Alert.alert(
        "Error",
        `No se pudo completar la inscripción${error?.message ? ": " + error.message : ""}`,
      );
    }
  };

  const getColorCategoria = (nombre: string) => {
    const colores: { [key: string]: string } = {
      "Recursos Humanos": "#FF6B6B",
      "Seguridad e Higiene": "#4ECDC4",
      "Seguridad e higiene": "#4ECDC4",
      Capacitación: "#45B7D1",
      Producción: "#96CEB4",
      Calidad: "#FFEAA7",
      Logística: "#DDA0DD",
      Tecnología: "#9B59B6",
      "Sin categoría": "#95A5A6",
    };
    return colores[nombre] || colors.primary;
  };

  const getIconoCategoria = (nombre: string) => {
    const iconos: { [key: string]: string } = {
      "Recursos Humanos": "people",
      "Seguridad e Higiene": "shield-checkmark",
      "Seguridad e higiene": "shield-checkmark",
      "Seguridad Industrial": "shield-checkmark",
      Capacitación: "school",
      Producción: "construct",
      "Operación de Maquinaria": "construct",
      Calidad: "ribbon",
      "Calidad y Procesos": "ribbon",
      Logística: "cart",
      Tecnología: "hardware-chip",
      Liderazgo: "people",
      Mantenimiento: "build",
      "Sin categoría": "folder-open",
    };
    return iconos[nombre] || "school";
  };

  const isExpired = (fechaFin?: string): boolean => {
    if (!fechaFin) return false;
    const now = new Date();
    const expDate = new Date(fechaFin);
    return expDate < now;
  };

  const isExpiringSoon = (fechaFin?: string): boolean => {
    if (!fechaFin) return false;
    const now = new Date();
    const expDate = new Date(fechaFin);
    const diffDays = Math.ceil(
      (expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );
    return diffDays > 0 && diffDays <= 7;
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

  const insets = useSafeAreaInsets();

  if (loading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>{getLoadingMessage("course")}</Text>
      </View>
    );
  }

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {}

      {!usingBackend && (
        <View
          style={{
            padding: 8,
            backgroundColor: "#FFF3CD",
            borderRadius: 8,
            margin: 12,
          }}
        >
          <Text style={{ color: "#856404" }}>
            🔧 Modo de desarrollo: usando datos de ejemplo (mock).
          </Text>
        </View>
      )}

      {}
      {hasBackendError && usingBackend && (
        <View
          style={{
            margin: 12,
            padding: 16,
            backgroundColor: "#FFF3CD",
            borderRadius: 12,
            borderLeftWidth: 4,
            borderLeftColor: "#FF6B6B",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <Ionicons
              name="warning"
              size={24}
              color="#856404"
              style={{ marginRight: 8 }}
            />
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: "#856404",
                flex: 1,
              }}
            >
              Problema de backend detectado
            </Text>
            <TouchableOpacity
              onPress={() => setShowDiagnostics(!showDiagnostics)}
            >
              <Ionicons
                name={showDiagnostics ? "chevron-up" : "chevron-down"}
                size={20}
                color="#856404"
              />
            </TouchableOpacity>
          </View>

          <Text
            style={{
              fontSize: 14,
              color: "#856404",
              marginBottom: 12,
              lineHeight: 20,
            }}
          >
            No se encontraron categorías ni cursos. Posibles causas:{"\n"}•
            Tabla "categorias" no existe o relación no configurada{"\n"}• Sin
            cursos activos (activo='true'){"\n"}• Problema de permisos o RLS en
            Supabase
          </Text>

          {showDiagnostics && (
            <View style={{ marginTop: 8, gap: 8 }}>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "600",
                  color: "#856404",
                  marginBottom: 4,
                }}
              >
                🔧 Solución aplicada (frontend):
              </Text>

              <View
                style={{
                  backgroundColor: "#E8F5E9",
                  padding: 12,
                  borderRadius: 8,
                  borderLeftWidth: 3,
                  borderLeftColor: "#4CAF50",
                }}
              >
                <Text
                  style={{
                    color: "#2E7D32",
                    fontSize: 13,
                    marginBottom: 6,
                    fontWeight: "600",
                  }}
                >
                  ✅ Adaptaciones automáticas:
                </Text>
                <Text
                  style={{ color: "#2E7D32", fontSize: 12, lineHeight: 18 }}
                >
                  • Usando id_curso como PK{"\n"}• Filtrando por activo='true'
                  {"\n"}• Generando categorías desde cursos.categoria{"\n"}• Sin
                  necesidad de modificar BD
                </Text>
              </View>

              <TouchableOpacity
                style={{
                  backgroundColor: colors.primary,
                  padding: 12,
                  borderRadius: 8,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: 4,
                }}
                onPress={() => cargarDatos(true)}
              >
                <Ionicons
                  name="refresh"
                  size={18}
                  color={theme.colors.card}
                  style={{ marginRight: 8 }}
                />
                <Text
                  style={{
                    color: theme.colors.card,
                    fontWeight: "600",
                    fontSize: 14,
                  }}
                >
                  Reintentar carga
                </Text>
              </TouchableOpacity>

              <Text
                style={{
                  fontSize: 11,
                  color: colors.warning,
                  marginTop: 8,
                  fontStyle: "italic",
                }}
              >
                💡 Si siguen sin aparecer, verifica que haya cursos con
                activo='true' en Supabase.
              </Text>
            </View>
          )}
        </View>
      )}

      {}
      <View
        style={[
          styles.categoriasContainer,
          { backgroundColor: theme.colors.card },
        ]}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriasScrollContent}
        >
          <TouchableOpacity
            style={[
              styles.categoriaChip,
              {
                backgroundColor: categoriaSeleccionada
                  ? theme.colors.card
                  : colors.primary,
                borderColor: categoriaSeleccionada
                  ? theme.colors.border
                  : colors.primary,
              },
            ]}
            onPress={() => setCategoriaSeleccionada(null)}
          >
            <Text
              style={[
                styles.categoriaChipText,
                {
                  color: categoriaSeleccionada
                    ? theme.colors.text
                    : theme.colors.card,
                  fontWeight: categoriaSeleccionada ? "500" : "700",
                },
              ]}
            >
              Todos
            </Text>
          </TouchableOpacity>

          {categorias.map((categoria) => (
            <TouchableOpacity
              key={categoria.id}
              style={[
                styles.categoriaChip,
                {
                  backgroundColor:
                    categoriaSeleccionada === categoria.id
                      ? categoria.color || getColorCategoria(categoria.nombre)
                      : theme.colors.card,
                  borderColor:
                    categoriaSeleccionada === categoria.id
                      ? categoria.color || getColorCategoria(categoria.nombre)
                      : theme.colors.border,
                },
              ]}
              onPress={() => setCategoriaSeleccionada(categoria.id)}
            >
              <Ionicons
                name={
                  (categoria.icono ||
                    getIconoCategoria(categoria.nombre)) as any
                }
                size={16}
                color={
                  categoriaSeleccionada === categoria.id
                    ? theme.colors.card
                    : theme.colors.text
                }
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  styles.categoriaChipText,
                  {
                    color:
                      categoriaSeleccionada === categoria.id
                        ? theme.colors.card
                        : theme.colors.text,
                  },
                ]}
              >
                {categoria.nombre}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {}
      <FlatList
        refreshing={refreshing}
        onRefresh={handleRefresh}
        data={cursosFiltrados}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.cursosList}
        renderItem={({ item }) => {
          const expired = isExpired(item.fecha_fin);
          const isCompleted = (item.progreso || 0) >= 100;
          const isBlocked = expired && !isCompleted;

          return (
            <TouchableOpacity
              style={[
                styles.cursoCard,
                { backgroundColor: theme.colors.card },
                isBlocked && {
                  opacity: 0.6,
                  borderColor: "#FF5252",
                  borderWidth: 1,
                },
              ]}
              onPress={() => {
                if (item.inscrito && isBlocked) {
                  Alert.alert(
                    "Curso no disponible",
                    `Este curso venció el ${formatExpirationDate(item.fecha_fin)}. Ya no está disponible para realizar.`,
                    [{ text: "Entendido" }],
                  );
                  return;
                }

                if (!item.inscrito && expired) {
                  Alert.alert(
                    "Curso no disponible",
                    `Este curso venció el ${formatExpirationDate(item.fecha_fin)} y ya no está disponible para inscripciones.`,
                    [{ text: "Entendido" }],
                  );
                  return;
                }

                if (Platform.OS === "web") {
                  const { goToWebRoute } = require("../../utils/webNav");
                  goToWebRoute("CourseDetail", { courseId: String(item.id) });
                } else {
                  navigation.navigate("CourseDetail", {
                    courseId: String(item.id),
                    title: item.titulo,
                    category: item.categoria || item.categorias?.nombre,
                  });
                }
              }}
            >
              <View style={styles.cursoHeader}>
                <View style={styles.cursoInfo}>
                  <View
                    style={[
                      styles.categoriaBadge,
                      {
                        backgroundColor:
                          item.categorias?.color ||
                          getColorCategoria(item.categorias?.nombre || ""),
                        flexDirection: "row",
                        alignItems: "center",
                      },
                    ]}
                  >
                    <Ionicons
                      name={(item.categorias?.icono || "school") as any}
                      size={12}
                      color="#fff"
                      style={{ marginRight: 4 }}
                    />
                    <Text style={styles.categoriaBadgeText}>
                      {item.categoria ||
                        item.categorias?.nombre ||
                        "Sin categoría"}
                    </Text>
                  </View>
                  {!item.inscrito && item.es_publico && (
                    <View
                      style={[
                        styles.previewBadge,
                        {
                          backgroundColor: theme.dark
                            ? hexToRgba("#ffffff", 0.06)
                            : hexToRgba(colors.primary, 0.12),
                        },
                      ]}
                    >
                      <Ionicons name="eye" size={12} color={colors.primary} />
                      <Text
                        style={[styles.previewText, { color: colors.primary }]}
                      >
                        Vista Previa
                      </Text>
                    </View>
                  )}
                </View>
                <View style={styles.estadoCursoContainer}>
                  {item.inscrito === true ? (
                    <>
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color="#4CAF50"
                      />
                      <Text style={[styles.estadoCurso, { color: "#4CAF50" }]}>
                        {item.progreso === 100 ? "Completado" : "Inscrito"}
                      </Text>
                    </>
                  ) : (
                    <>
                      <Ionicons name="close-circle" size={20} color="#999" />
                      <Text style={[styles.estadoCurso, { color: "#999" }]}>
                        No inscrito
                      </Text>
                    </>
                  )}
                </View>
              </View>

              <Text style={[styles.cursoTitulo, { color: theme.colors.text }]}>
                {item.titulo || "Sin título"}
              </Text>
              <Text
                style={[
                  styles.cursoDescripcion,
                  { color: theme.dark ? "#999" : "#666" },
                ]}
                numberOfLines={2}
              >
                {item.descripcion || "Sin descripción disponible"}
              </Text>

              <View style={styles.cursoFooter}>
                <View style={styles.cursoMeta}>
                  {item.instructor && item.instructor.trim() !== "" && (
                    <Text style={styles.cursoInstructor}>
                      Por: {item.instructor}
                    </Text>
                  )}
                  <View style={styles.durationContainer}>
                    <Ionicons
                      name="time-outline"
                      size={12}
                      color={theme.dark ? "#999" : "#666"}
                    />
                    <Text style={styles.cursoDuracion}>
                      Duración: {getCourseDurationText(item) || "0 min"}
                    </Text>
                  </View>
                </View>

                {item.fecha_fin && (
                  <View
                    style={[
                      styles.expirationContainer,
                      {
                        backgroundColor:
                          isExpired(item.fecha_fin) && item.progreso !== 100
                            ? theme.dark
                              ? "#3a1515"
                              : "#ffebee"
                            : isExpiringSoon(item.fecha_fin) &&
                                item.progreso !== 100
                              ? theme.dark
                                ? "#3a2f15"
                                : "#fff8e1"
                              : theme.dark
                                ? "rgba(59, 130, 246, 0.2)"
                                : "#e0f2fe",
                        borderColor:
                          isExpired(item.fecha_fin) && item.progreso !== 100
                            ? "#FF5252"
                            : isExpiringSoon(item.fecha_fin) &&
                                item.progreso !== 100
                              ? "#FFA000"
                              : theme.dark
                                ? "#1e40af"
                                : "#7dd3fc",
                        borderWidth: 1,
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 6,
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 4,
                      },
                    ]}
                  >
                    <Ionicons
                      name={
                        isExpired(item.fecha_fin) && item.progreso !== 100
                          ? "alert-circle"
                          : isExpiringSoon(item.fecha_fin) &&
                              item.progreso !== 100
                            ? "warning"
                            : "calendar-outline"
                      }
                      size={12}
                      color={
                        isExpired(item.fecha_fin) && item.progreso !== 100
                          ? "#FF5252"
                          : isExpiringSoon(item.fecha_fin) &&
                              item.progreso !== 100
                            ? "#FFA000"
                            : theme.dark
                              ? "#60a5fa"
                              : "#0284c7"
                      }
                    />
                    <Text
                      style={[
                        styles.expirationText,
                        {
                          color:
                            isExpired(item.fecha_fin) && item.progreso !== 100
                              ? "#FF5252"
                              : isExpiringSoon(item.fecha_fin) &&
                                  item.progreso !== 100
                                ? "#FFA000"
                                : theme.dark
                                  ? "#60a5fa"
                                  : "#0284c7",
                          fontWeight: "700",
                          fontSize: 11,
                        },
                      ]}
                    >
                      {isExpired(item.fecha_fin) ? "Venció: " : "Vence: "}
                      {formatExpirationDate(item.fecha_fin)}
                    </Text>
                  </View>
                )}
              </View>

              {}
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="school-outline" size={64} color="#ccc" />
            <Text style={styles.emptyStateText}>
              {getEmptyStateMessage("courses")}
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                marginTop: 4,
              }}
            >
              <Text style={styles.emptyStateSubtext}>
                Intenta explorar otras categorías o vuelve más tarde
              </Text>
              <Ionicons
                name="search-outline"
                size={14}
                color="#999"
                style={{ marginLeft: 4 }}
              />
            </View>
          </View>
        }
      />

      {}
      <CourseEvaluationModal
        visible={showEvaluationModal}
        onClose={() => setShowEvaluationModal(false)}
        cursoId={evaluationCourseId || 0}
        empleadoId={
          Number((state.user as any)?.id_usuario || state.user?.id) || 0
        }
        cursoTitulo={evaluationCourseTitle}
        onEvaluationComplete={async () => {
          setShowEvaluationModal(false);

          await cargarDatos();
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  categoriasContainer: {
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  categoriasScrollContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 12,
    alignItems: "center",
  },
  categoriaChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  categoriaChipActive: {},
  categoriaChipText: {
    marginLeft: 0,
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
  },
  categoriaChipTextActive: {
    color: "#fff",
  },
  cursosList: {
    padding: 16,
  },
  cursoCard: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cursoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  cursoInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  categoriaBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
  },
  categoriaBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
  previewBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 2,
  },
  previewText: {
    fontSize: 10,
    fontWeight: "500",
  },
  estadoCursoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  estadoCurso: {
    fontSize: 12,
    fontWeight: "600",
  },
  cursoTitulo: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  cursoDescripcion: {
    fontSize: 14,
    color: "#666",
    lineHeight: 18,
    marginBottom: 12,
  },
  cursoFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cursoMeta: {
    flex: 1,
  },
  cursoInstructor: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  cursoDuracion: {
    fontSize: 12,
    color: "#999",
  },
  cursoBoton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 100,
  },
  inscribirBoton: {},
  continuarBoton: {},
  cursoBotonTexto: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  evaluationButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: "transparent",
    borderWidth: 1,
  },
  evaluationButtonText: {
    fontSize: 13,
    fontWeight: "600",
  },
  devEvalBtn: {
    position: "absolute",
    right: 16,
    bottom: 24,
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 4,
  },
  devEvalBtnText: {
    color: "#333",
    fontWeight: "700",
  },
  progressBar: {
    height: 4,
    backgroundColor: "#e0e0e0",
    borderRadius: 2,
    marginTop: 8,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4CAF50",
    borderRadius: 2,
  },
  emptyState: {
    alignItems: "center",
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#666",
    marginTop: 16,
    textAlign: "center",
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
    textAlign: "center",
  },
  expirationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  expirationText: {
    fontSize: 12,
  },
  durationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
});

export default CategoriesScreen;
