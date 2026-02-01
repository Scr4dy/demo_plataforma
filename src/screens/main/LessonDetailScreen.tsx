import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Dimensions,
  StatusBar,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { useHeader } from "../../context/HeaderContext";
import { supabase } from "../../config/supabase";
import { emit } from "../../utils/eventBus";
import { platformShadow } from "../../utils/styleHelpers";
import { ContentViewer } from "../../components/courses/ContentViewer";
import InlineHeader from "../../components/common/InlineHeader";
import { ConfirmationModal } from "../../components/common/ConfirmationModal";
import { categoryService } from "../../services/categoryService";
import { RootStackParamList } from "../../types/navigation.types";

type LessonDetailRouteProp = RouteProp<RootStackParamList, "LessonDetail">;

interface Contenido {
  id_contenido: number;
  id_curso: number;
  id_modulo: number;
  tipo: string;
  titulo: string;
  url?: string | null;
  url_contenido?: string | null;
  descripcion: string | null;
  orden: number;
  duracion_estimada: number;
  obligatorio: boolean;
  storage_type?: "file" | "url" | "both";
  storage_path?: string | null;
  content_metadata?: any;
}

interface ProgresoContenido {
  id_progreso: number;
  completado: boolean;
  fecha_inicio: string | null;
  fecha_completado: string | null;
  tiempo_dedicado: number;
}

export default function LessonDetailScreen(props?: {
  courseId?: string;
  moduleId?: string;
  content?: any;
  moduleTitle?: string;
  contentTitle?: string;
}) {
  const routeObj = useRoute<LessonDetailRouteProp>();

  const mergedParams = { ...(props || {}), ...(routeObj.params || {}) } as any;
  const routeParamsDebug = mergedParams;

  if (process.env.NODE_ENV !== "production") {
    if (Platform.OS === "web" && typeof window !== "undefined") {
    }
  }
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { theme, colors } = useTheme();
  const { state } = useAuth();
  const { setHeader } = useHeader();

  const [alertModal, setAlertModal] = useState({
    visible: false,
    title: "",
    message: "",
    singleButton: true,
    confirmText: "Entendido",
    cancelText: "Cancelar",
    onConfirm: () => {},
    onCancel: () => {},
  });

  const showAlert = (
    title: string,
    message: string,
    onConfirm?: () => void,
  ) => {
    setAlertModal({
      visible: true,
      title,
      message,
      singleButton: true,
      confirmText: "Entendido",
      cancelText: "",
      onConfirm: () => {
        setAlertModal((prev) => ({ ...prev, visible: false }));
        if (onConfirm) onConfirm();
      },
      onCancel: () => setAlertModal((prev) => ({ ...prev, visible: false })),
    });
  };

  const showConfirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    confirmText = "Aceptar",
    cancelText = "Cancelar",
  ) => {
    setAlertModal({
      visible: true,
      title,
      message,
      singleButton: false,
      confirmText,
      cancelText,
      onConfirm: () => {
        setAlertModal((prev) => ({ ...prev, visible: false }));
        onConfirm();
      },
      onCancel: () => setAlertModal((prev) => ({ ...prev, visible: false })),
    });
  };

  const { courseId, moduleId, content, moduleTitle, contentTitle } =
    mergedParams || {};

  const [loading, setLoading] = useState(true);
  const [contenido, setContenido] = useState<Contenido | null>(null);
  const [progreso, setProgreso] = useState<ProgresoContenido | null>(null);
  const [contentUrl, setContentUrl] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [timeViewing, setTimeViewing] = useState(0);
  const [canMarkComplete, setCanMarkComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const insets = useSafeAreaInsets();

  const isCompletedRef = useRef(isCompleted);
  const timeSpentRef = useRef(timeSpent);
  const contenidoRef = useRef(contenido);
  const progresoRef = useRef(progreso);

  useEffect(() => {
    isCompletedRef.current = isCompleted;
  }, [isCompleted]);

  useEffect(() => {
    timeSpentRef.current = timeSpent;
  }, [timeSpent]);

  useEffect(() => {
    contenidoRef.current = contenido;
  }, [contenido]);

  useEffect(() => {
    progresoRef.current = progreso;
  }, [progreso]);

  const { width } = Dimensions.get("window");
  const isMobile = width < 768;
  const isWeb = Platform.OS === "web";

  const titleFontSize = width >= 900 ? 32 : width >= 600 ? 26 : 15;

  useEffect(() => {
    loadLessonData();
    startTimer();

    const viewingTimer = setInterval(() => {
      setTimeViewing((prev) => {
        const newTime = prev + 1;
        if (newTime >= 50) {
          setCanMarkComplete(true);

          setIsCompleted((currentCompleted) => {
            if (currentCompleted) return currentCompleted;

            return currentCompleted;
          });
        }
        return newTime;
      });
    }, 1000);

    return () => {
      saveProgress().catch((err) => {});
      clearInterval(viewingTimer);
    };
  }, [content]);

  useEffect(() => {
    if (contenido && state.user?.id) {
      const timer = setTimeout(() => {
        saveProgress().catch((err) => {});
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isCompleted, timeSpent]);

  const lastHeaderRef = useRef<{
    title?: string;
    subtitle?: string;
    hidden?: boolean;
  }>({});
  React.useEffect(() => {
    if (Platform.OS === "web") {
      return;
    }

    const title = "Detalle de la Lección";
    const subtitle = "Información y contenido de la lección";

    setHeader({
      title,
      subtitle,
      showBack: true,

      alignLeftOnMobile: true,
      manual: true,
      owner: "LessonDetail",

      containerStyle: { backgroundColor: theme.colors.background },
      titleStyle: { fontSize: titleFontSize, color: "#fff" },
    });
    lastHeaderRef.current = { title, subtitle } as any;

    return () => {
      lastHeaderRef.current = {};
      try {
        setHeader(null);
      } catch (_) {}
    };
  }, [setHeader, theme.colors.background, titleFontSize]);

  const loadLessonData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!content && !courseId && !moduleId) {
        setError("No se pudo cargar la lección");
        setLoading(false);
        if (Platform.OS !== "web")
          showAlert("Error", "No se pudo cargar la lección");
        return;
      }

      if (content && typeof content === "object") {
        const contentData = content as Contenido;
        setContenido(contentData);

        if (contentData.tipo === "evaluacion") {
          setLoading(false);
        }

        await resolveContentUrl(contentData);
        await loadProgress(contentData.id_contenido);
      } else if (content) {
        const contentId =
          typeof content === "string" ? parseInt(content) : content;
        await loadContentFromDatabase(contentId);
      } else {
        setError("No se pudo cargar la lección");
        if (Platform.OS !== "web")
          showAlert("Error", "No se pudo cargar la lección");
      }
    } catch (err) {
      setError("No se pudo cargar la lección");
      if (Platform.OS !== "web")
        showAlert("Error", "No se pudo cargar la lección");
    } finally {
      setLoading(false);
    }
  };

  const loadContentFromDatabase = async (contentId: number) => {
    const { data, error } = await supabase
      .from("contenidos")
      .select("*")
      .eq("id_contenido", contentId)
      .is("deleted_at", null)
      .single();

    if (error || !data) {
      setError("No se pudo cargar la lección");
      throw new Error("Contenido no encontrado");
    }

    setContenido(data);
    setError(null);
    await resolveContentUrl(data);
    await loadProgress(data.id_contenido);
  };

  const resolveContentUrl = async (content: Contenido) => {
    try {
      const rawUrl = content.url_contenido || content.url;
      const storagePath = content.storage_path || content.url_contenido;
      let finalUrl: string | null = null;

      const isStoragePath = rawUrl && !rawUrl.startsWith("http");

      if (content.storage_type) {
        if (content.storage_type === "url") {
          finalUrl = rawUrl ?? null;
        } else if (content.storage_type === "file" && storagePath) {
          const { data, error } = await supabase.storage
            .from("course-content")
            .createSignedUrl(storagePath, 3600);

          if (error) {
            finalUrl = null;
          } else {
            finalUrl = data?.signedUrl || null;
          }
        } else if (content.storage_type === "both") {
          if (storagePath && isStoragePath) {
            const { data, error } = await supabase.storage
              .from("course-content")
              .createSignedUrl(storagePath, 3600);

            finalUrl = (error ? null : data?.signedUrl) || rawUrl;
          } else {
            finalUrl = rawUrl ?? null;
          }
        }
      } else if (isStoragePath && storagePath) {
        const { data, error } = await supabase.storage
          .from("course-content")
          .createSignedUrl(storagePath, 3600);

        if (error) {
          finalUrl = null;
        } else {
          finalUrl = data?.signedUrl || null;
        }
      } else {
        finalUrl = rawUrl ?? null;
      }
      setContentUrl(finalUrl);
    } catch (error) {
      const fallbackUrl = content.url_contenido || content.url;
      setContentUrl(fallbackUrl || null);
    }
  };

  const loadProgress = async (contentId: number) => {
    try {
      const { data: userData } = await supabase
        .from("usuarios")
        .select("id_usuario")
        .eq("auth_id", state.user?.id)
        .single();

      if (!userData) return;

      const { data, error } = await supabase
        .from("progreso_contenidos")
        .select("*")
        .eq("id_contenido", contentId)
        .eq("id_empleado", userData.id_usuario)
        .is("deleted_at", null)
        .maybeSingle();

      if (data) {
        setProgreso(data);
        setIsCompleted(data.completado);
        setTimeSpent(data.tiempo_dedicado || 0);

        if (data.completado) {
          setCanMarkComplete(true);
        }

        try {
          emit("progress:updated", { courseId });
        } catch (e) {}
      }
    } catch (error) {}
  };

  const startTimer = () => {
    const interval = setInterval(() => {
      setTimeSpent((prev) => prev + 1);
    }, 60000);

    return () => clearInterval(interval);
  };

  const saveProgress = async () => {
    if (!contenidoRef.current || !state.user?.id) return;

    try {
      const { data: userData } = await supabase
        .from("usuarios")
        .select("id_usuario")
        .eq("auth_id", state.user.id)
        .single();

      if (!userData) {
        return;
      }

      const progressData = {
        id_empleado: userData.id_usuario,
        id_contenido: contenidoRef.current.id_contenido,
        completado: isCompletedRef.current,
        tiempo_dedicado: timeSpentRef.current,
        fecha_completado:
          isCompletedRef.current && !progresoRef.current?.fecha_completado
            ? new Date().toISOString()
            : progresoRef.current?.fecha_completado,
        fecha_inicio:
          progresoRef.current?.fecha_inicio || new Date().toISOString(),
      };

      const { data: upsertData, error } = await supabase
        .from("progreso_contenidos")
        .upsert(progressData, {
          onConflict: "id_empleado,id_contenido",
          ignoreDuplicates: false,
        })
        .select();

      if (error) {
      } else if (upsertData && upsertData.length > 0) {
        progresoRef.current = upsertData[0];
      }

      try {
        emit("progress:updated", { courseId });
      } catch (e) {}

      if (contenidoRef.current.id_curso) {
        try {
          await categoryService.syncCourseProgress(
            String(userData.id_usuario),
            String(contenidoRef.current.id_curso),
          );
        } catch (syncErr) {}
      }
    } catch (error) {}
  };

  const handleMarkAsComplete = async () => {
    if (isCompleted) {
      setIsCompleted(false);

      await new Promise((resolve) => setTimeout(resolve, 50));
      await saveProgress();
      showAlert("Progreso actualizado", "Lección marcada como pendiente");
      return;
    }

    if (!canMarkComplete) {
      const remainingTime = 50 - timeViewing;
      showAlert(
        "Tiempo mínimo requerido",
        `Debes permanecer al menos 50 segundos en la lección para marcarla como completada.\n\nTiempo restante: ${remainingTime} segundos`,
      );
      return;
    }

    setIsCompleted(true);

    await new Promise((resolve) => setTimeout(resolve, 50));
    await saveProgress();
    showAlert("Progreso actualizado", "Lección marcada como completada");
  };

  const handleGoBack = async () => {
    await saveProgress();

    const feedbackParams = isCompletedRef.current
      ? { showFeedback: true, courseId }
      : {};

    try {
      if (Platform.OS === "web") {
        const {
          clearWebRoute,
          goToWebTab,
          goToWebRoute,
        } = require("../../utils/webNav");
        const canGoBack =
          typeof navigation?.canGoBack === "function"
            ? navigation.canGoBack()
            : false;

        try {
          setHeader && setHeader(null);
        } catch (_) {}

        if (courseId) {
          goToWebRoute("CourseDetail", { courseId, ...feedbackParams });
        } else {
          goToWebTab("Dashboard");
        }

        if (canGoBack) {
          try {
            navigation.goBack();
          } catch (_) {}
        }
        return;
      }
    } catch (e) {}

    try {
      if (
        typeof navigation?.canGoBack === "function" &&
        navigation.canGoBack()
      ) {
        navigation.goBack();
      } else {
        navigation.navigate("CourseDetail", {
          courseId,
          ...feedbackParams,
        });
      }
    } catch (e) {
      try {
        navigation.navigate("Dashboard");
      } catch (_) {}
    }
  };

  if (loading) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: colors.background, zIndex: 0 },
        ]}
        edges={isMobile ? ["left", "right", "bottom"] : ["bottom"]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Cargando lección...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!contenido) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: colors.background, zIndex: 0 },
        ]}
        edges={isMobile ? ["left", "right", "bottom"] : ["bottom"]}
      >
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={64} color={colors.error} />
          <Text style={[styles.errorText, { color: colors.text }]}>
            No se pudo cargar la lección
          </Text>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={handleGoBack}
          >
            <Text style={[styles.buttonText, { color: theme.colors.card }]}>
              Volver
            </Text>
          </TouchableOpacity>

          {process.env.NODE_ENV !== "production" && (
            <View
              style={{
                marginTop: 14,
                padding: 12,
                backgroundColor: theme.colors.card,
                borderRadius: 8,
              }}
            >
              <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                Debug: params recibidos:{" "}
                {JSON.stringify(routeParamsDebug, null, 2)}
              </Text>
              <Text
                style={{
                  color: colors.textSecondary,
                  fontSize: 12,
                  marginTop: 8,
                }}
              >
                Sugerencia: Ve a Dashboard → Curso → Lección y haz click en la
                lección para que los parámetros se transmitan correctamente.
              </Text>
            </View>
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      edges={["left", "right", "bottom"]}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <StatusBar backgroundColor={colors.primary} barStyle="light-content" />

      {}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingTop: isMobile ? 4 : 16, gap: isMobile ? 8 : 16 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {}
        <View style={[styles.metadataCard, { backgroundColor: colors.card }]}>
          <View style={styles.metadataRow}>
            <View style={styles.metadataItem}>
              <Ionicons name="time-outline" size={20} color={colors.primary} />
              <Text style={[styles.metadataText, { color: colors.text }]}>
                {contenido.duracion_estimada} min
              </Text>
            </View>

            <View style={styles.metadataItem}>
              <Ionicons
                name="layers-outline"
                size={20}
                color={colors.primary}
              />
              <Text style={[styles.metadataText, { color: colors.text }]}>
                {contenido.tipo.charAt(0).toUpperCase() +
                  contenido.tipo.slice(1)}
              </Text>
            </View>

            <View
              style={[
                styles.completeButtonInline,
                isCompleted && styles.completeButtonActive,
              ]}
            >
              <Ionicons
                name={
                  isCompleted ? "checkmark-circle" : "checkmark-circle-outline"
                }
                size={24}
                color={isCompleted ? colors.success : colors.textSecondary}
              />
              <Text
                style={[
                  styles.metadataText,
                  {
                    color: isCompleted ? colors.success : colors.textSecondary,
                  },
                ]}
              >
                {isCompleted ? "Completado" : "No completado"}
              </Text>
            </View>
          </View>
        </View>

        {}
        {contenido.descripcion && (
          <View
            style={[styles.descriptionCard, { backgroundColor: colors.card }]}
          >
            <Text style={[styles.descriptionTitle, { color: colors.text }]}>
              Descripción
            </Text>
            <Text
              style={[styles.descriptionText, { color: colors.textSecondary }]}
            >
              {contenido.descripcion}
            </Text>
          </View>
        )}

        {}
        {contenido.tipo === "evaluacion" ? (
          <ContentViewer
            url={contentUrl}
            tipo={contenido.tipo}
            titulo={contenido.titulo}
            metadata={contenido.content_metadata}
            idContenido={contenido.id_contenido}
            onQuizComplete={async (resultado) => {
              if (resultado.aprobado) {
                setIsCompleted(true);
                setCanMarkComplete(true);

                await new Promise((resolve) => setTimeout(resolve, 2000));

                try {
                  if (contenido) {
                    await loadProgress(contenido.id_contenido);
                  }
                } catch (e) {}
              }
            }}
          />
        ) : contentUrl ? (
          <ContentViewer
            url={contentUrl}
            tipo={contenido.tipo}
            titulo={contenido.titulo}
            metadata={contenido.content_metadata}
            idContenido={contenido.id_contenido}
            onQuizComplete={async (resultado) => {
              if (resultado.aprobado) {
                setIsCompleted(true);
                setCanMarkComplete(true);

                await new Promise((resolve) => setTimeout(resolve, 2000));

                try {
                  if (contenido) {
                    await loadProgress(contenido.id_contenido);
                  }
                } catch (e) {}
              }
            }}
          />
        ) : (
          <View
            style={[styles.noContentCard, { backgroundColor: colors.card }]}
          >
            <MaterialIcons
              name="insert-drive-file"
              size={64}
              color={colors.textSecondary}
            />
            <Text style={[styles.noContentText, { color: colors.text }]}>
              Contenido no disponible
            </Text>
          </View>
        )}

        {}
        {progreso && (
          <View style={[styles.progressCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.progressTitle, { color: colors.text }]}>
              Tu Progreso
            </Text>
            {progreso.fecha_completado && (
              <View style={styles.progressRow}>
                <Text
                  style={[
                    styles.progressLabel,
                    { color: colors.textSecondary },
                  ]}
                >
                  Completado:
                </Text>
                <Text style={[styles.progressValue, { color: colors.success }]}>
                  {new Date(progreso.fecha_completado).toLocaleDateString()}
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {}
      {contenido?.tipo !== "evaluacion" && (
        <View
          style={[
            styles.footer,
            {
              backgroundColor: colors.card,
              borderTopColor: theme.colors.border,
            },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.footerButton,
              {
                backgroundColor: isCompleted
                  ? "#4CAF50"
                  : canMarkComplete
                    ? colors.primary
                    : "#999",
                opacity: 1,
              },
            ]}
            onPress={isCompleted ? undefined : handleMarkAsComplete}
            disabled={isCompleted || !canMarkComplete}
          >
            <Ionicons
              name={isCompleted ? "checkmark-circle" : "checkmark"}
              size={20}
              color="#fff"
            />
            <Text style={[styles.footerButtonText, { color: "#fff" }]}>
              {isCompleted
                ? "Completado"
                : canMarkComplete
                  ? "Marcar como completada"
                  : `Espera ${50 - timeViewing}s...`}
            </Text>
          </TouchableOpacity>
        </View>
      )}
      <ConfirmationModal
        visible={alertModal.visible}
        title={alertModal.title}
        message={alertModal.message}
        onConfirm={alertModal.onConfirm}
        onCancel={alertModal.onCancel}
        confirmText={alertModal.confirmText}
        cancelText={alertModal.cancelText}
        singleButton={alertModal.singleButton}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    ...platformShadow({ elevation: 2, shadowOpacity: 0.05 }),
  },
  navHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  navBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  navTitle: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    flex: 1,
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  headerInfo: {
    flex: 1,
    marginRight: 12,
  },
  headerSubtitle: {
    fontSize: 12,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  obligatorioTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    flex: 1,
  },
  completeButtonInline: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    padding: 4,
  },
  completeButtonActive: {
    transform: [{ scale: 1.05 }],
  },
  contentContainer: {
    padding: 16,
    gap: 16,
  },
  metadataCard: {
    borderRadius: 12,
    padding: 8,
    marginTop: 2,
    ...platformShadow({ elevation: 2, shadowOpacity: 0.05 }),
  },
  metadataRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    flexWrap: "wrap",
  },
  metadataItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metadataText: {
    fontSize: 14,
    fontWeight: "500",
  },
  descriptionCard: {
    borderRadius: 12,
    padding: 16,
    ...platformShadow({ elevation: 2, shadowOpacity: 0.05 }),
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  noContentCard: {
    borderRadius: 12,
    padding: 48,
    alignItems: "center",
    justifyContent: "center",
    ...platformShadow({ elevation: 2, shadowOpacity: 0.05 }),
  },
  noContentText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: "center",
  },
  progressCard: {
    borderRadius: 12,
    padding: 16,
    ...platformShadow({ elevation: 2, shadowOpacity: 0.05 }),
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
  },
  progressValue: {
    fontSize: 14,
    fontWeight: "500",
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    ...platformShadow({ elevation: 4, shadowOpacity: 0.1 }),
  },
  footerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  footerButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    gap: 16,
  },
  errorText: {
    fontSize: 18,
    fontWeight: "500",
    textAlign: "center",
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 16,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
