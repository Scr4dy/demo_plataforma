import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  StatusBar,
  useWindowDimensions,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  useRoute,
  useNavigation,
  useFocusEffect,
} from "@react-navigation/native";
import { useAuth } from "../../context/AuthContext";
import { useEvaluaciones } from "../../hooks/useEvaluaciones";
import { ModuleCardMobile } from "../../components/courses/ModuleCardMobile";
import { useCourseUI } from "../../hooks/useCourseUI";
import { platformShadow } from "../../utils/styleHelpers";
import { useTheme } from "../../context/ThemeContext";
import { useHeader } from "../../context/HeaderContext";
import { supabase } from "../../config/supabase";
import { categoryService } from "../../services/categoryService";
import {
  getLoadingMessage,
  getErrorMessage,
} from "../../utils/personalizedMessages";
import {
  getCourseDurationHours,
  getCourseDurationText,
} from "../../utils/courseHelpers";
import CourseMaterialsPanel from "../../components/courses/CourseMaterialsPanel";
import ModuleContentUploader from "../../components/courses/ModuleContentUploader";
import { CoursePreview } from "../../components/courses/CoursePreview";
import EnrollModal from "../../components/courses/EnrollModal";
import ModuleFilesList from "../../components/courses/ModuleFilesList";
import { storageService } from "../../services/storageService";
import { Linking, Share } from "react-native";
import { safeOpenUrl } from "../../utils/safeOpenUrl";
import { certificateService } from "../../services/certificateService";
import { CourseEvaluationModal } from "../../components/courses/CourseEvaluationModal";
import CourseFeedbackModal from "../../components/courses/CourseFeedbackModal";
import { ConfirmationModal } from "../../components/common/ConfirmationModal";

let useSidebarSafe = () => null;
try {
  const sidebarModule = require("../../context/SidebarContext");
  if (sidebarModule && sidebarModule.useSidebar) {
    useSidebarSafe = sidebarModule.useSidebar;
  }
} catch (e) {}

interface Module {
  id: string;
  title: string;
  type: "video" | "document" | "quiz" | "exam";
  duration: string;
  isPreview: boolean;
  completed?: boolean;
  contentUrl?: string;
  contenidos?: any[];
  lessons?: number;
}

interface Course {
  id: string | number;
  id_curso?: string | number;
  titulo?: string;
  descripcion?: string;
  categoria?: string | null;
  instructor?: string;
  id_instructor?: string | number;
  duracion_horas?: number;
  duracion?: number | string;
  progreso?: number;
  inscrito?: boolean;
  activo?: boolean;
  activo_boolean?: boolean;
  fecha_inicio?: string;
  fecha_fin?: string;
  metadata?: any;
  modules?: Module[];
}

export default function CourseDetailScreen(
  props: { courseId?: string; initialModuleId?: string } = {},
) {
  const route = useRoute();
  const navigation = useNavigation<any>();
  const { state } = useAuth();
  const { theme, colors } = useTheme();
  const { header, setHeader } = useHeader();
  const { width } = useWindowDimensions();

  const canGoBack =
    navigation && typeof navigation.canGoBack === "function"
      ? (() => {
          try {
            return navigation.canGoBack();
          } catch (e) {
            return false;
          }
        })()
      : false;

  const sidebar = useSidebarSafe();
  const isWeb = Platform.OS === "web";
  const sidebarOpen = !!(sidebar && (sidebar as any).isSidebarOpen);

  const showBackLabel = width >= 900 || canGoBack;
  const titleFontSize = width >= 900 ? 32 : width >= 600 ? 26 : 15;

  const insets = useSafeAreaInsets();

  const params = (route.params || {}) as any;
  const paramCourseId = params.courseId;
  const preview = params.preview || false;

  const courseId = props.courseId || paramCourseId;
  const initialModuleIdProp =
    (props as any).initialModuleId || params.moduleId || null;
  const [pendingInitialModule, setPendingInitialModule] = useState<
    string | null
  >(initialModuleIdProp ? String(initialModuleIdProp) : null);

  React.useEffect(() => {
    const newId = (props as any).initialModuleId || params.moduleId || null;
    if (newId) setPendingInitialModule(String(newId));
  }, [(props as any).initialModuleId, params.moduleId]);

  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);

  const [canEvaluate, setCanEvaluate] = useState(false);
  const { verificarPuedeEvaluar } = useEvaluaciones();

  const [isEnrolled, setIsEnrolled] = useState(false);
  const [courseProgress, setCourseProgress] = useState(0);

  const [enrollmentRecord, setEnrollmentRecord] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasCertificate, setHasCertificate] = useState(false);

  const [showEvaluationModal, setShowEvaluationModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  const [hasEvaluated, setHasEvaluated] = useState(false);
  const [hasEvaluatedInstructor, setHasEvaluatedInstructor] = useState(false);
  const [hasEvaluatedContent, setHasEvaluatedContent] = useState(false);
  const [evaluationMode, setEvaluationMode] = useState<
    "all" | "instructor" | "content"
  >("all");
  const [requestsLeft, setRequestsLeft] = useState(2);
  const [waitMinutes, setWaitMinutes] = useState(0);
  const [requestingCertificate, setRequestingCertificate] = useState(false);

  const [isInstructorDemo, setIsInstructorDemo] = useState(false);

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

  useEffect(() => {
    if (params?.showFeedback && !hasEvaluated && !loading && course) {
      if (courseProgress >= 100 || hasCertificate || params.forceFeedback) {
        setTimeout(() => {
          setEvaluationMode("all");
          setShowFeedbackModal(true);
        }, 500);
      }
    }
  }, [
    params?.showFeedback,
    params?.forceFeedback,
    hasEvaluated,
    loading,
    courseProgress,
    hasCertificate,
    course,
  ]);

  useEffect(() => {
    if (courseId && state.user?.id_usuario) {
      checkEvaluationStatus();
    }
  }, [courseId, state.user?.id_usuario]);

  useEffect(() => {
    let timer: any;
    if (waitMinutes > 0) {
      timer = setInterval(() => {
        setWaitMinutes((prev) => Math.max(0, prev - 1));
      }, 60000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [waitMinutes]);

  const checkEvaluationStatus = async () => {
    try {
      const {
        evaluacionesService,
      } = require("../../services/evaluacionesService");
      const userId = Number(state.user?.id_usuario || state.user?.id);
      const instructorEval = await evaluacionesService.getEvaluacionInstructor(
        Number(courseId),
        userId,
      );
      const contentEval = await evaluacionesService.getEvaluacionContenido(
        Number(courseId),
        userId,
      );

      setHasEvaluatedInstructor(!!instructorEval);
      setHasEvaluatedContent(!!contentEval);

      if (instructorEval && contentEval) {
        setHasEvaluated(true);
      }
    } catch (e) {}
  };

  const userRoleRaw = (
    (state.user?.role || "")?.toString() || ""
  ).toLowerCase();
  const isAdmin = userRoleRaw === "administrador" || userRoleRaw === "admin";
  const isInstructor = userRoleRaw === "instructor";
  const isCourseInstructor = !!(
    state.user &&
    course &&
    String((state.user as any)?.id_usuario || state.user?.id) ===
      String((course as any)?.id_instructor)
  );
  const adminModeParam = !!params.adminMode;

  useEffect(() => {
    const desiredTitle = "Detalle del Curso";
    const desiredSubtitle = "Información y contenido del curso";

    if (
      header &&
      header.manual === true &&
      header.owner === "CourseDetail" &&
      header.title === desiredTitle &&
      header.subtitle === desiredSubtitle
    ) {
      return;
    }

    setHeader({
      title: desiredTitle,
      subtitle: desiredSubtitle,
      showBack: true,

      alignLeftOnMobile: true,
      manual: true,
      owner: "CourseDetail",

      containerStyle: { backgroundColor: theme.colors.background },
      titleStyle: { fontSize: titleFontSize, color: "#fff" },
      right: (
        <View style={{ flexDirection: "row", gap: 8 }}>
          {canEvaluate &&
            !hasEvaluated &&
            !isCourseInstructor &&
            !isInstructorDemo && (
              <TouchableOpacity
                onPress={() => setShowFeedbackModal(true)}
                accessibilityLabel="Evaluar curso"
                style={{ padding: 8 }}
              >
                <Ionicons
                  name="star-outline"
                  size={24}
                  color={colors.primary}
                />
              </TouchableOpacity>
            )}
        </View>
      ),
    });
    return () => {
      const currentHeader = header;
      if (
        currentHeader &&
        (currentHeader.owner === "CourseDetail" ||
          (currentHeader.manual &&
            currentHeader.title &&
            currentHeader.title.includes("Detalle")))
      ) {
        setHeader(null);
      }
    };
  }, [
    setHeader,
    course,
    titleFontSize,
    theme.colors.background,
    theme,
    canEvaluate,
    isCourseInstructor,
    isInstructorDemo,
  ]);

  let canUploadMaterials = isAdmin && adminModeParam;

  if (!adminModeParam && isEnrolled && (isAdmin || isCourseInstructor)) {
    canUploadMaterials = false;
  }

  useEffect(() => {}, [canUploadMaterials, course, state.user]);

  useEffect(() => {
    let mounted = true;
    const checkInstructorIsDemo = async () => {
      try {
        if (!course || !course.id_instructor) {
          if (mounted) setIsInstructorDemo(false);
          return;
        }
        const res: any = await supabase
          .from("usuarios")
          .select("correo")
          .eq("id_usuario", Number(course.id_instructor))
          .single();
        if (!res.error && res.data && res.data.correo) {
          const email = String(res.data.correo || "").toLowerCase();
          if (mounted) setIsInstructorDemo(email === "ana.garcia@empresa.com");
        } else {
          if (mounted) setIsInstructorDemo(false);
        }
      } catch (err) {
        if (mounted) setIsInstructorDemo(false);
      }
    };
    checkInstructorIsDemo();
    return () => {
      mounted = false;
    };
  }, [course?.id_instructor]);

  const showMaterialsPreview =
    (adminModeParam && isAdmin) || (!isAdmin && !isInstructor);
  const showMaterialsForUser =
    (adminModeParam && isAdmin) || (isEnrolled && !isAdmin && !isInstructor);

  useEffect(() => {}, [
    Platform.OS,
    isAdmin,
    isInstructor,
    isEnrolled,
    enrollmentRecord,
    adminModeParam,
    showMaterialsPreview,
    showMaterialsForUser,
    canUploadMaterials,
    courseProgress,
  ]);

  const [previewVisible, setPreviewVisible] = useState(false);
  const [enrollModalVisible, setEnrollModalVisible] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [userContinuar, setUserContinuar] = useState<any[]>([]);

  const nextModule = React.useMemo(() => {
    if (!modules || modules.length === 0) return null;
    return modules.find((m) => !m.completed) || null;
  }, [modules]);

  const [certificate, setCertificate] = useState<any | null>(null);

  {
  }
  <TouchableOpacity
    style={[
      styles.continueButton,
      {
        backgroundColor: hasCertificate ? colors.primary : "#999",
        opacity: hasCertificate ? 1 : 0.6,
        width: "100%",
      },
    ]}
    disabled={!hasCertificate}
    onPress={() => {
      if (!hasCertificate || !certificate?.urlDescarga) {
        showAlert("Error", "El certificado no tiene una URL válida.");
        return;
      }

      const url = certificate.urlDescarga;

      if (Platform.OS === "web") {
        if (typeof window !== "undefined") safeOpenUrl(url);
      } else {
        Linking.canOpenURL(url)
          .then((supported) => {
            if (supported) {
              Linking.openURL(url);
            } else {
              showAlert("Error", "No se puede abrir este enlace: " + url);
            }
          })
          .catch((err) => {});
      }
    }}
  >
    <Ionicons name="document-text-outline" size={20} color="#fff" />
    <Text style={styles.continueButtonText}>
      {hasCertificate ? "Descargar certificado" : "Certificado no disponible"}
    </Text>
  </TouchableOpacity>;

  const canDownloadFiles = Boolean(
    enrollmentRecord &&
    (enrollmentRecord.id_inscripcion ||
      enrollmentRecord.estado ||
      typeof enrollmentRecord.progreso !== "undefined"),
  );

  useEffect(() => {}, [
    nextModule,
    canDownloadFiles,
    enrollmentRecord,
    hasCertificate,
    courseProgress,
  ]);

  const loadCourseData = async () => {
    if (!courseId) {
      setError("No se proporcionó un ID de curso válido");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const [courseData, modulesData, progressData] = await Promise.all([
        categoryService.getCursoById(courseId),
        categoryService.getModulosByCurso(courseId, state.user?.id || ""),
        categoryService.getCursoProgress(courseId, state.user?.id || ""),
      ]);

      if (!courseData) {
        setError("Curso no encontrado");
        setLoading(false);
        return;
      }

      const isActivo =
        typeof courseData.activo === "boolean"
          ? courseData.activo
          : String(courseData.activo).toLowerCase() === "true";

      const mappedCourse: Course = {
        id: String(courseData.id || courseId),
        id_instructor: courseData.id_instructor
          ? String(courseData.id_instructor)
          : undefined,
        titulo: courseData.titulo,
        descripcion: courseData.descripcion,
        categoria:
          courseData.categoria ||
          courseData.categorias?.nombre ||
          "Sin categoría",
        instructor:
          courseData.instructor &&
          String(courseData.instructor).trim().length > 0
            ? courseData.instructor
            : "",
        duracion_horas: getCourseDurationHours(courseData),
        progreso: progressData?.progreso || 0,

        inscrito: !!progressData || courseData.inscrito || preview,
        activo: isActivo,
        activo_boolean: isActivo,
      };

      const mappedModules: Module[] = (modulesData || []).map((mod: any) => {
        const contenidos = Array.isArray(mod.contenidos) ? mod.contenidos : [];
        const totalLessons = contenidos.length;
        const completedLessons = contenidos.filter(
          (c: any) => c.completado || (c.raw && c.raw.completado),
        ).length;
        const isModuleCompleted =
          totalLessons > 0 && completedLessons === totalLessons;

        return {
          id: String(mod.id_modulo),
          title: mod.titulo,
          type: mod.tipo_contenido || "document",
          duration: `${mod.duracion_minutos || 0} min`,
          isPreview: mod.es_preview || false,
          completed: isModuleCompleted,
          contentUrl: mod.url_contenido,
          lessons: totalLessons,
          completedLessons: completedLessons,
          contenidos: contenidos,
        };
      });

      setCourse(mappedCourse);
      setModules(mappedModules);

      setEnrollmentRecord(progressData || null);

      const resolvedIsEnrolled = Boolean(
        progressData !== null || courseData?.inscrito || preview,
      );
      setIsEnrolled(resolvedIsEnrolled);
      const newProgress = progressData?.progreso || 0;
      setCourseProgress(newProgress);

      setLoading(false);

      const userIdNum = Number(
        state.user?.id_usuario || (state.user as any)?.id,
      );

      if (resolvedIsEnrolled && !isNaN(userIdNum) && userIdNum > 0) {
        Promise.all([
          supabase.rpc("verificar_limite_solicitudes_diarias", {
            p_id_usuario: userIdNum,
            p_limite: 2,
          }),
          certificateService.getCertificateByCourse(courseId, userIdNum),
        ])
          .then(([limiteRes, myCert]) => {
            if (limiteRes.data && limiteRes.data[0]) {
              const data = limiteRes.data[0];
              setRequestsLeft(data.solicitudes_restantes);
              setWaitMinutes(data.minutos_restantes || 0);
            }

            if (myCert) {
              // Log removed
              setHasCertificate(true);
              setCertificate(myCert);
            } else {
              setHasCertificate(false);
              setCertificate(null);
            }
          })
          .catch((e) => {});
      }

      if (resolvedIsEnrolled && state.user?.id_usuario) {
        categoryService
          .syncCourseProgress(String(state.user.id_usuario), String(courseId))
          .then((syncedProgress) => {
            if (syncedProgress !== newProgress) {
              setCourseProgress(syncedProgress);
            }
          })
          .catch((err) => {});
      }
    } catch (error: any) {
      setError(error.message || "No se pudo cargar la información del curso");
      setLoading(false);
    } finally {
    }
  };

  const renderModals = () => (
    <>
      {course ? (
        <CoursePreview
          course={{
            id: String(course.id),
            title: course.titulo ?? (course as any).title ?? "",
            description:
              course.descripcion ?? (course as any).description ?? "",
            instructor: course.instructor || "",
            duration: String(course.duracion_horas ?? course.duracion ?? "0"),
            studentsCount: 0,
            rating: 4.5,
            contents:
              modules && modules.length > 0 ? modules[0].contenidos || [] : [],
            objectives: ["Comprender los conceptos básicos"],
            isFree: true,
            price: 0,
          }}
          isVisible={previewVisible}
          onClose={handleClosePreview}
          onEnroll={handleEnrollFromPreview}
        />
      ) : null}

      {course ? (
        <EnrollModal
          course={{
            id: String(course.id),
            title: String(course.titulo ?? (course as any).title ?? ""),
            description: String(
              course.descripcion ?? (course as any).description ?? "",
            ),
            duration: String(course.duracion_horas ?? course.duracion ?? "0"),
            level: "beginner",
            category: course.categoria ?? undefined,
            instructor: course.instructor ?? undefined,
            price: 0,
            isFree: true,
          }}
          isVisible={enrollModalVisible}
          onClose={handleCloseEnroll}
          onEnroll={handleConfirmEnroll}
          isProcessing={isEnrolling}
        />
      ) : null}

      {}
      {course && state.user?.id_usuario ? (
        <CourseEvaluationModal
          visible={showEvaluationModal}
          onClose={() => setShowEvaluationModal(false)}
          cursoId={Number(course.id_curso || course.id)}
          empleadoId={state.user.id_usuario}
          cursoTitulo={course.titulo ?? ""}
          onEvaluationComplete={() => {
            setHasEvaluated(true);
            setShowEvaluationModal(false);
            setShowEvaluationModal(false);
            showAlert(
              "¡Gracias!",
              "Tu evaluación nos ayuda a mejorar la calidad de nuestros cursos",
            );
          }}
        />
      ) : null}
    </>
  );

  useEffect(() => {
    loadCourseData();

    const loadUserProgress = async () => {
      try {
        if (!state.user?.id) {
          return;
        }

        const checkEval = async () => {
          try {
            if (course && state.user?.id_usuario) {
              const may = await verificarPuedeEvaluar(
                Number(course.id_curso || course.id),
                state.user.id_usuario,
              );
              setCanEvaluate(Boolean(may));
            } else {
              setCanEvaluate(false);
            }
          } catch (err) {
            setCanEvaluate(false);
          }
        };
        checkEval();

        const cursos = await categoryService.getCursosDisponibles(
          state.user.id || "",
        );

        const continuarAll = (cursos || []).filter(
          (c: any) => (c.progreso || 0) > 0 && (c.progreso || 0) < 100,
        );

        setUserContinuar(continuarAll.slice(0, 6));
      } catch (err) {}
    };

    loadUserProgress();
  }, [courseId, state.user?.id]);

  useFocusEffect(
    React.useCallback(() => {
      if (courseId) {
        loadCourseData();
      }
    }, [courseId, state.user?.id_usuario]),
  );

  const handleOpenEnroll = () => setEnrollModalVisible(true);
  const handleCloseEnroll = () => setEnrollModalVisible(false);
  const handleConfirmEnroll = async () => {
    try {
      setIsEnrolling(true);
      const result = await handleEnroll();
      handleCloseEnroll();

      if (result?.alreadyEnrolled) {
        showAlert(
          "Ya estás inscrito",
          "Ya tienes acceso completo a este curso",
          () => loadCourseData(),
        );
      } else if (result) {
        showAlert("Inscripción", "Te has inscrito correctamente", () =>
          loadCourseData(),
        );
      } else {
        showAlert("Inscripción", "Proceso completado", () => loadCourseData());
      }
    } catch (e: any) {
      showAlert("Error", e?.message || "No se pudo completar la inscripción");
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleClosePreview = () => setPreviewVisible(false);
  const handleEnrollFromPreview = (courseIdArg: string) => {
    setPreviewVisible(false);
    setEnrollModalVisible(true);
  };

  const handleRequestCertificate = async () => {
    if (!course || !state.user?.id_usuario) return;

    try {
      setLoading(true);
      setRequestingCertificate(true);

      const courseIdNum = Number(course.id_curso || course.id);
      const userId = state.user.id_usuario;
      const userEmail = state.user.email;
      const userName =
        `${state.user.nombre || ""} ${state.user.apellidoPaterno || ""} ${state.user.apellidoMaterno || ""}`.trim() ||
        userEmail ||
        "Usuario";

      const result = await certificateService.requestCertificatesForCompleted(
        [courseIdNum],
        userId,
        userEmail,
        userName,
      );

      if (result.success) {
        showAlert(
          "Solicitud enviada",
          `Se ha notificado a la administración para procesar tu certificado de "${course.titulo || "este curso"}".`,
        );

        setWaitMinutes(60);

        const { data: limiteData } = await supabase.rpc(
          "verificar_limite_solicitudes_diarias",
          {
            p_id_usuario: userId,
            p_limite: 2,
          },
        );
        if (limiteData && limiteData[0]) {
          setRequestsLeft(limiteData[0].solicitudes_restantes);
          setWaitMinutes(limiteData[0].minutos_restantes || 0);
        }

        loadCourseData();
      } else {
        const isLimit =
          result.message.includes("límite") ||
          result.message.includes("Intenta mañana");
        const isShipped =
          result.message.includes("ya tiene") ||
          result.message.includes("enviado");

        showAlert(isLimit ? "Límite alcanzado" : "Aviso", result.message);

        if (isLimit) {
          setRequestsLeft(0);
        } else if (isShipped) {
          setCertificate((prev: any) =>
            prev
              ? { ...prev, fisicoEnviado: true }
              : ({ fisicoEnviado: true } as any),
          );
        }
      }
    } catch (err) {
      showAlert("Error", "No se pudo procesar la solicitud");
    } finally {
      setRequestingCertificate(false);
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    try {
      if (!state.user?.id) {
        showAlert("Error", "Usuario no identificado");
        return null;
      }
      const inscripcion = await categoryService.inscribirEnCurso(
        state.user.id,
        courseId,
      );

      setIsEnrolled(true);
      setCourse((prev) => (prev ? { ...prev, inscrito: true } : null));

      return inscripcion;
    } catch (error: any) {
      throw error;
    }
  };

  const handleModulePress = async (module: Module) => {
    const userIsEnrolled = Boolean(
      enrollmentRecord || course?.inscrito || preview,
    );
    if (!userIsEnrolled && !module.isPreview) {
      showConfirm(
        "Contenido Bloqueado",
        "Debes inscribirte en el curso para acceder a este contenido",
        handleEnroll,
        "Inscribirme",
        "Cancelar",
      );
      return;
    }

    try {
      const userIsEnrolled = Boolean(
        enrollmentRecord || course?.inscrito || preview,
      );

      const firstContent =
        Array.isArray(module.contenidos) && module.contenidos.length > 0
          ? module.contenidos[0]
          : null;
      if (firstContent && (firstContent.url_contenido || firstContent.url)) {
        let openUrl = String(firstContent.url_contenido || firstContent.url);
        if (!openUrl.startsWith("http")) {
          const signed = await storageService
            .getCourseContentUrl(openUrl, 3600)
            .catch(() => null);
          if (signed) openUrl = signed;
        }

        if (Platform.OS === "web") {
          if (typeof window !== "undefined") {
            safeOpenUrl(openUrl);
          }
        } else {
          try {
            const canOpen = await Linking.canOpenURL(openUrl);
            if (canOpen) await Linking.openURL(openUrl);
            else await Share.share({ message: openUrl });
          } catch (openErr) {
            // Log removed
            showAlert("Error", "No se pudo abrir el contenido");
          }
        }
        return;
      }

      if (Platform.OS === "web") {
        const { goToWebRoute } = require("../../utils/webNav");
        goToWebRoute("CourseDetail", {
          courseId: courseId,
          moduleId: module.id,
          preview: !userIsEnrolled && (module as any).isPreview,
        });
        return;
      }

      showAlert("Sin contenido", "Este módulo no tiene contenido para abrir.");
    } catch (err) {
      showAlert("Error", "No se pudo abrir el contenido del módulo");
    }
  };

  const openContent = async (content: any, module?: Module) => {
    const userIsEnrolled = Boolean(
      enrollmentRecord || course?.inscrito || preview,
    );
    if (!userIsEnrolled && !module?.isPreview) {
      showAlert(
        "Contenido Bloqueado",
        "Debes inscribirte para acceder a este contenido",
      );
      return;
    }

    try {
      let openUrl =
        content.url ||
        content.url_contenido ||
        content.raw?.url ||
        content.raw?.url_contenido;
      if (!openUrl) {
        showAlert("Sin URL", "Este contenido no tiene una URL asociada");
        return;
      }

      if (!String(openUrl).startsWith("http")) {
        const signed = await storageService
          .getCourseContentUrl(openUrl, 3600)
          .catch(() => null);
        if (signed) openUrl = signed;
      }

      if (Platform.OS === "web") {
        safeOpenUrl(openUrl);
      } else Linking.openURL(openUrl);
    } catch (err) {
      showAlert("Error", "No se pudo abrir el contenido");
    }
  };

  React.useEffect(() => {
    if (pendingInitialModule && modules.length > 0) {
      const m = modules.find(
        (mod) => String(mod.id) === String(pendingInitialModule),
      );
      if (m) {
        setTimeout(() => {
          handleModulePress(m).catch(() => {});
        }, 50);
      }
      setPendingInitialModule(null);
    }
  }, [pendingInitialModule, modules]);

  const handleCompleteModule = async (moduleId: string) => {
    try {
      await categoryService.markModuleCompleted(
        state.user?.id || "",
        courseId,
        moduleId,
      );

      setModules((prev) =>
        prev.map((m) => (m.id === moduleId ? { ...m, completed: true } : m)),
      );

      const completedCount = modules.filter((m) => m.completed).length + 1;
      const newProgress = Math.round((completedCount / modules.length) * 100);
      setCourseProgress(newProgress);

      if (newProgress === 100 && !hasEvaluated) {
        setTimeout(() => {
          setShowEvaluationModal(true);
        }, 500);
      }
    } catch (error) {}
  };

  const getModuleIcon = (type: string) => {
    switch (type) {
      case "video":
        return "videocam-outline";
      case "document":
        return "document-text-outline";
      case "quiz":
        return "help-circle-outline";
      case "exam":
        return "school-outline";
      default:
        return "help-circle-outline";
    }
  };

  const getModuleColor = (type: string) => {
    switch (type) {
      case "video":
        return "#FF6B6B";
      case "document":
        return "#4ECDC4";
      case "quiz":
        return "#45B7D1";
      case "exam":
        return "#96CEB4";
      default:
        return "#666";
    }
  };

  const { getStatusIcon, getStatusText, getStatusColor } = useCourseUI();

  const getStatusIconSafe = (status: string | number) =>
    getStatusIcon(status as any);
  const getStatusTextSafe = (status: string | number) =>
    getStatusText(status as any);
  const getStatusColorSafe = (status: string | number) =>
    getStatusColor(status as any);

  if (loading) {
    return (
      <SafeAreaView
        edges={["top", "left", "right", "bottom"]}
        style={[
          styles.loadingContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <StatusBar
          backgroundColor={theme.colors.background}
          barStyle={theme.dark ? "light-content" : "dark-content"}
        />
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>
          {getLoadingMessage("course")}
        </Text>
      </SafeAreaView>
    );
  }

  if (error || !course) {
    return (
      <SafeAreaView
        edges={["top", "left", "right", "bottom"]}
        style={[
          styles.errorContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <StatusBar
          backgroundColor={theme.colors.background}
          barStyle={theme.dark ? "light-content" : "dark-content"}
        />
        <Ionicons name="alert-circle-outline" size={64} color="#FF6B6B" />
        <Text style={[styles.errorText, { color: theme.colors.text }]}>
          {error ? getErrorMessage() : "Curso no encontrado"}
        </Text>
        <Text
          style={[
            styles.errorDetail,
            { color: theme.dark ? "#999" : "#666", marginBottom: 12 },
          ]}
        >
          {courseId
            ? `ID del curso: ${courseId}`
            : "No se proporcionó un ID válido. A veces esto ocurre por un enlace temporal."}
        </Text>

        <View style={{ flexDirection: "row", gap: 12 }}>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: colors.primary }]}
            onPress={() => {
              loadCourseData();
            }}
            accessibilityRole="button"
            accessibilityLabel="Reintentar carga del curso"
          >
            <Text
              style={[styles.primaryButtonText, { color: theme.colors.card }]}
            >
              Reintentar
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, { borderColor: colors.primary }]}
            onPress={() => {
              try {
                navigation.navigate("Dashboard");
              } catch (_) {}
            }}
            accessibilityRole="button"
            accessibilityLabel="Ir al Dashboard"
          >
            <Text
              style={[styles.secondaryButtonText, { color: colors.primary }]}
            >
              Ir al Dashboard
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={{ marginTop: 14 }}
          onPress={() => {
            try {
              if (Platform.OS === "web") {
                const { goToWebTab } = require("../../utils/webNav");
                goToWebTab("Categories");
              } else {
                navigation.navigate("Categories");
              }
            } catch (err) {}
          }}
        >
          <Text style={{ color: colors.primary }}>{"Buscar cursos"}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      edges={["left", "right", "bottom"]}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <StatusBar backgroundColor={colors.primary} barStyle="light-content" />

      <StatusBar backgroundColor={colors.primary} barStyle="light-content" />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 8 }}
      >
        {}
        <View
          style={[
            styles.header,
            {
              backgroundColor: theme.colors.card,
              borderRadius: 8,
              paddingHorizontal: 14,
              ...Platform.select({
                ios: platformShadow({
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.06,
                  shadowRadius: 6,
                }),
                android: { elevation: 4 },
              }),
            },
          ]}
        >
          <View style={[styles.courseHeaderRow, { alignItems: "flex-start" }]}>
            <View style={styles.headerTextContent}>
              <View style={styles.headerTopRow}>
                <View
                  style={[
                    styles.categoryBadge,
                    { backgroundColor: colors.primaryLight, marginRight: 8 },
                  ]}
                >
                  <Text
                    style={[styles.categoryText, { color: colors.primary }]}
                  >
                    {course.categoria}
                  </Text>
                </View>
                {preview ? (
                  <View
                    style={[
                      styles.previewBadge,
                      { backgroundColor: theme.dark ? "#3a3a00" : "#FFF9E5" },
                    ]}
                  >
                    <Text
                      style={[
                        styles.previewText,
                        { color: theme.dark ? "#F57C00" : "#F57C00" },
                      ]}
                    >
                      Vista Previa
                    </Text>
                  </View>
                ) : null}
              </View>

              <Text
                style={[
                  styles.title,
                  {
                    color: theme.colors.text,
                    fontSize: titleFontSize,
                    lineHeight: titleFontSize + 8,
                  },
                ]}
                numberOfLines={3}
                ellipsizeMode="tail"
              >
                {course.titulo}
              </Text>
              {course.instructor ? (
                <Text
                  style={[
                    styles.instructor,
                    { color: theme.dark ? "#999" : "#666", marginTop: 2 },
                  ]}
                  numberOfLines={1}
                >
                  Instructor: {course.instructor}
                </Text>
              ) : !isInstructor ? (
                <Text
                  style={[
                    styles.instructor,
                    { color: theme.dark ? "#999" : "#666", marginTop: 2 },
                  ]}
                  numberOfLines={1}
                >
                  Instructor: No asignado
                </Text>
              ) : null}

              <View style={[styles.metaContainer, { marginTop: 6, gap: 12 }]}>
                <View style={styles.metaItem}>
                  <Ionicons
                    name="time-outline"
                    size={14}
                    color={theme.dark ? "#999" : "#666"}
                  />
                  <Text
                    style={[
                      styles.metaText,
                      { color: theme.dark ? "#999" : "#666", fontSize: 13 },
                    ]}
                  >
                    {getCourseDurationText(course) || "-"}
                  </Text>
                </View>
                {}
                {(enrollmentRecord || course?.inscrito || preview) &&
                courseProgress >= 0 ? (
                  <View style={styles.metaItem}>
                    <Ionicons
                      name="checkmark-circle-outline"
                      size={16}
                      color="#4CAF50"
                    />
                    <Text
                      style={[
                        styles.metaText,
                        { color: theme.dark ? "#999" : "#666" },
                      ]}
                    >
                      {String(courseProgress)}% completado
                    </Text>
                  </View>
                ) : null}
                <View style={styles.metaItem}>
                  <Ionicons
                    name="layers-outline"
                    size={16}
                    color={theme.dark ? "#999" : "#666"}
                  />
                  <Text
                    style={[
                      styles.metaText,
                      { color: theme.dark ? "#999" : "#666" },
                    ]}
                  >
                    {String(modules.length)} módulos
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
        <View
          style={[
            styles.headerDivider,
            { backgroundColor: theme.dark ? "#222" : "#e9ecef" },
          ]}
        />

        {}
        {adminModeParam ? (
          <View
            style={{
              padding: 8,
              borderRadius: 8,
              backgroundColor: "#083344",
              margin: 12,
            }}
          >
            <Text
              style={{
                color: theme.colors.card,
                fontWeight: "700",
                textAlign: "center",
              }}
            >
              Modo Administración — estás viendo este curso en modo edición
            </Text>
          </View>
        ) : null}

        {}

        {}
        <View style={styles.descriptionSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Descripción del curso
          </Text>
          <Text
            style={[
              styles.description,
              { color: theme.dark ? "#ccc" : "#666" },
            ]}
          >
            {course.descripcion ||
              "Este curso no tiene descripción disponible."}
          </Text>
        </View>

        {}

        {}
        <View style={styles.actionSection}>
          {}
          {}
          {(() => {
            const userIsEnrolled = Boolean(
              enrollmentRecord || course?.inscrito || preview,
            );
            const showContinueCTA = Boolean(
              userIsEnrolled &&
              (courseProgress > 0 ||
                (enrollmentRecord &&
                  (enrollmentRecord.id_inscripcion ||
                    enrollmentRecord.estado)) ||
                course?.inscrito),
            );
            if (!showContinueCTA && !adminModeParam) {
              return (
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <TouchableOpacity
                    style={[
                      styles.enrollButton,
                      { backgroundColor: colors.primary },
                    ]}
                    onPress={() => {
                      setEnrollModalVisible(true);
                    }}
                    hitSlop={{ top: 8, left: 8, right: 8, bottom: 8 }}
                    accessibilityRole="button"
                    accessibilityLabel="Inscribirse en el curso"
                  >
                    <Ionicons name="bookmark-outline" size={20} color="#fff" />
                    <Text style={[styles.enrollButtonText, { color: "#fff" }]}>
                      Inscribirse en el curso
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.previewButton,
                      {
                        backgroundColor: theme.colors.card,
                        borderColor: colors.primary,
                      },
                    ]}
                    onPress={() => setPreviewVisible(true)}
                    hitSlop={{ top: 8, left: 8, right: 8, bottom: 8 }}
                    accessibilityRole="button"
                    accessibilityLabel="Ver contenido de muestra"
                  >
                    <Ionicons
                      name="eye-outline"
                      size={20}
                      color={colors.primary}
                    />
                    <Text
                      style={[
                        styles.previewButtonText,
                        { color: colors.primary },
                      ]}
                    >
                      Ver contenido de muestra
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            }

            if (courseProgress === 100) {
              return (
                <View style={{ gap: 12 }}>
                  {}
                  {(() => {
                    const hasUrl = Boolean(certificate?.urlDescarga);
                    const isShipped = Boolean(certificate?.fisicoEnviado);

                    return (
                      <>
                        <TouchableOpacity
                          style={[
                            styles.continueButton,
                            {
                              backgroundColor: hasUrl
                                ? colors.primary
                                : isShipped
                                  ? theme.dark
                                    ? "#444"
                                    : "#eee"
                                  : requestsLeft > 0 && waitMinutes === 0
                                    ? colors.primary
                                    : "#999",
                              opacity:
                                hasUrl || isShipped
                                  ? 1
                                  : requestsLeft > 0 && waitMinutes === 0
                                    ? 1
                                    : 0.6,
                              width: "100%",
                            },
                          ]}
                          disabled={
                            (!hasUrl &&
                              !isShipped &&
                              (requestsLeft === 0 || waitMinutes > 0)) ||
                            isShipped ||
                            requestingCertificate
                          }
                          onPress={async () => {
                            if (hasUrl) {
                              try {
                                const userId = Number(
                                  (state.user as any)?.id_usuario ||
                                    state.user?.id ||
                                    0,
                                );
                                const courseIdNum = Number(courseId);
                                if (userId && courseIdNum) {
                                  const res =
                                    await certificateService.downloadCertificate(
                                      certificate.id,
                                    );
                                  const url = res?.url;
                                  if (url) {
                                    if (Platform.OS === "web") safeOpenUrl(url);
                                    else {
                                      const can = await Linking.canOpenURL(
                                        url,
                                      ).catch(() => false);
                                      if (can) await Linking.openURL(url);
                                    }
                                    return;
                                  }
                                }
                              } catch (e) {}

                              if (Platform.OS === "web") {
                                require("../../utils/webNav").goToWebRoute(
                                  "Certificates",
                                );
                              } else {
                                navigation.navigate("Certificates");
                              }
                              return;
                            }

                            if (!isShipped && waitMinutes === 0) {
                              void handleRequestCertificate();
                            }
                          }}
                        >
                          <Ionicons
                            name={
                              hasUrl
                                ? "document-text-outline"
                                : isShipped
                                  ? "checkmark-circle-outline"
                                  : "mail-outline"
                            }
                            size={20}
                            color={
                              isShipped
                                ? theme.dark
                                  ? "#888"
                                  : "#aaa"
                                : "#fff"
                            }
                          />
                          <Text
                            style={[
                              styles.continueButtonText,
                              isShipped && {
                                color: theme.dark ? "#888" : "#aaa",
                              },
                            ]}
                          >
                            {hasUrl
                              ? "Descargar certificado"
                              : isShipped
                                ? "Enviado por correo"
                                : waitMinutes > 0
                                  ? `Espera ${waitMinutes} min`
                                  : requestsLeft > 0
                                    ? requestingCertificate
                                      ? "Solicitando..."
                                      : "Solicitar certificado"
                                    : "Límite diario alcanzado"}
                          </Text>
                        </TouchableOpacity>

                        {requestsLeft < 2 &&
                          requestsLeft > 0 &&
                          !hasUrl &&
                          !isShipped && (
                            <Text
                              style={{
                                textAlign: "center",
                                fontSize: 12,
                                color: theme.dark ? "#999" : "#666",
                                marginTop: -4,
                              }}
                            >
                              {waitMinutes > 0
                                ? `Debes esperar ${waitMinutes} minutos para tu siguiente solicitud.`
                                : `Te queda ${requestsLeft} ${requestsLeft === 1 ? "solicitud disponible" : "solicitudes disponibles"} hoy.`}
                            </Text>
                          )}
                      </>
                    );
                  })()}

                  {}
                  {!isCourseInstructor &&
                    !isInstructorDemo &&
                    (!hasEvaluatedInstructor || !hasEvaluatedContent) && (
                      <View style={{ flexDirection: "row", gap: 12 }}>
                        {}
                        {!hasEvaluatedInstructor && (
                          <TouchableOpacity
                            style={[
                              styles.continueButton,
                              {
                                backgroundColor: "#FFC107",
                                flex: 1,
                                paddingVertical: 12,
                                paddingHorizontal: 4,
                              },
                            ]}
                            onPress={() => {
                              setEvaluationMode("instructor");
                              setShowFeedbackModal(true);
                            }}
                          >
                            <Ionicons name="person" size={20} color="#000" />
                            <Text
                              style={[
                                styles.continueButtonText,
                                {
                                  color: "#000",
                                  fontSize: 13,
                                  textAlign: "center",
                                  fontWeight: "600",
                                },
                              ]}
                            >
                              Evaluar Instructor
                            </Text>
                          </TouchableOpacity>
                        )}

                        {}
                        {!hasEvaluatedContent && (
                          <TouchableOpacity
                            style={[
                              styles.continueButton,
                              {
                                backgroundColor: "#4CAF50",
                                flex: 1,
                                paddingVertical: 12,
                                paddingHorizontal: 4,
                              },
                            ]}
                            onPress={() => {
                              setEvaluationMode("content");
                              setShowFeedbackModal(true);
                            }}
                          >
                            <Ionicons name="book" size={20} color="#fff" />
                            <Text
                              style={[
                                styles.continueButtonText,
                                {
                                  color: "#fff",
                                  fontSize: 13,
                                  textAlign: "center",
                                  fontWeight: "600",
                                },
                              ]}
                            >
                              Evaluar Contenido
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    )}
                </View>
              );
            }

            return null;
          })()}
        </View>

        {}
        {adminModeParam && showMaterialsPreview ? (
          <View style={styles.materialsPreviewSection}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Materiales del Curso
            </Text>
            {course?.id
              ? (() => {
                  const canDownload = Boolean(
                    enrollmentRecord &&
                    (enrollmentRecord.id_inscripcion ||
                      enrollmentRecord.estado ||
                      typeof enrollmentRecord.progreso !== "undefined"),
                  );

                  return (
                    <CourseMaterialsPanel
                      courseId={Number(course.id)}
                      allowUpload={false}
                      allowDelete={false}
                      isEnrolled={canDownload}
                    />
                  );
                })()
              : null}
          </View>
        ) : null}

        {}
        {isEnrolled ? (
          <View
            style={[
              styles.progressSection,
              { backgroundColor: theme.colors.card },
            ]}
          >
            <View style={styles.progressHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Tu progreso
              </Text>
              <Text
                style={[styles.progressPercentage, { color: colors.primary }]}
              >
                {String(courseProgress)}%
              </Text>
            </View>
            <View
              style={[
                styles.progressBar,
                { backgroundColor: theme.dark ? "#333" : "#e0e0e0" },
              ]}
            >
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${courseProgress}%`,
                    backgroundColor: colors.primary,
                  },
                ]}
              />
            </View>
            <Text
              style={[
                styles.progressText,
                { color: theme.dark ? "#999" : "#666" },
              ]}
            >
              {String(modules.filter((m) => m.completed).length)} de{" "}
              {String(modules.length)} módulos completados
            </Text>
          </View>
        ) : null}

        {}
        <View style={styles.modulesSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Contenido del curso
          </Text>

          {modules.length === 0 ? (
            <View
              style={{
                paddingVertical: 40,
                paddingHorizontal: 20,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: theme.colors.card,
                borderRadius: 12,
                marginTop: 12,
                borderWidth: 1,
                borderColor: theme.dark ? "#333" : "#f0f0f0",
                borderStyle: "dashed",
              }}
            >
              <Ionicons
                name="school-outline"
                size={48}
                color={theme.dark ? "#555" : "#ccc"}
                style={{ marginBottom: 12 }}
              />
              <Text
                style={{
                  color: theme.colors.textSecondary,
                  fontSize: 16,
                  fontWeight: "500",
                  textAlign: "center",
                  marginBottom: 4,
                }}
              >
                No hay contenido disponible
              </Text>
              <Text
                style={{
                  color: theme.dark ? "#888" : "#999",
                  fontSize: 14,
                  textAlign: "center",
                }}
              >
                Este curso aún no tiene módulos publicados.
              </Text>
            </View>
          ) : null}

          {modules.length > 0 &&
            modules.map((module, index) => {
              const status = module.completed
                ? "completed"
                : !Boolean(enrollmentRecord || course?.inscrito || preview) &&
                    !module.isPreview
                  ? "locked"
                  : (module as any).progress && (module as any).progress > 0
                    ? "in-progress"
                    : "available";
              const lessonsList = Array.isArray(module.contenidos)
                ? module.contenidos
                    .filter((c: any) => !c.deleted_at)
                    .sort(
                      (a: any, b: any) =>
                        Number(a.orden || 0) - Number(b.orden || 0),
                    )
                    .map((c: any) => ({
                      id: c.id_contenido || c.id,
                      title:
                        c.titulo || c.nombre || c.titulo_corto || "Contenido",
                      duration: c.duracion_estimada || c.duracion_estimada || 0,
                      obligatorio:
                        typeof c.obligatorio === "boolean"
                          ? c.obligatorio
                          : true,
                      order: c.orden || 0,
                      raw: c,
                    }))
                : [];

              const moduleForCard = {
                ...module,
                status,
                lessonsList,
                lessons: module.lessons || lessonsList.length,
                completedLessons: module.completed
                  ? lessonsList.length
                  : (module as any).completedLessons || 0,
                progress: (module as any).progress || 0,
              } as any;

              return (
                <ModuleCardMobile
                  key={`module-${module.id ?? index}`}
                  module={moduleForCard}
                  onModulePress={(m: any) => {
                    void handleModulePress(m as any);
                  }}
                  getStatusIcon={getStatusIconSafe}
                  getStatusText={getStatusTextSafe}
                  getStatusColor={getStatusColorSafe}
                  getResourceIcon={(type?: string) => {
                    const t = type ?? "document";

                    switch (t) {
                      case "pdf":
                        return "document-text";
                      case "video":
                        return "videocam";
                      default:
                        return "document-text";
                    }
                  }}
                  onLessonPress={(lesson: any, moduleArg?: any) => {
                    const raw = lesson.raw ?? lesson;

                    const userIsEnrolled = Boolean(
                      enrollmentRecord || course?.inscrito || preview,
                    );
                    if (!userIsEnrolled && !module?.isPreview) {
                      showAlert(
                        "Contenido Bloqueado",
                        "Debes inscribirte para acceder a este contenido",
                      );
                      return;
                    }

                    if (Platform.OS === "web") {
                      try {
                        const { goToWebRoute } = require("../../utils/webNav");
                        goToWebRoute("LessonDetail", {
                          courseId: courseId,
                          moduleId: module.id,
                          content: raw,
                          moduleTitle:
                            module.title ||
                            (module as any).nombre ||
                            module.title,
                          contentTitle:
                            raw.titulo ||
                            raw.title ||
                            raw.nombre ||
                            lesson.title,
                        });
                      } catch (e) {
                        navigation.navigate("LessonDetail", {
                          courseId: courseId,
                          moduleId: module.id,
                          content: raw,
                          moduleTitle:
                            module.title ||
                            (module as any).nombre ||
                            module.title,
                          contentTitle:
                            raw.titulo ||
                            raw.title ||
                            raw.nombre ||
                            lesson.title,
                        });
                      }
                    } else {
                      navigation.navigate("LessonDetail", {
                        courseId: courseId,
                        moduleId: module.id,
                        content: raw,
                        moduleTitle:
                          module.title ||
                          (module as any).nombre ||
                          module.title,
                        contentTitle:
                          raw.titulo || raw.title || raw.nombre || lesson.title,
                      });
                    }
                  }}
                />
              );
            })}
        </View>
      </ScrollView>

      {}
      {renderModals()}

      <CourseFeedbackModal
        visible={showFeedbackModal}
        courseId={Number(courseId)}
        userId={Number(state.user?.id_usuario || state.user?.id || 0)}
        mode={evaluationMode}
        onClose={() => setShowFeedbackModal(false)}
        onSuccess={() => {
          if (evaluationMode === "all") {
            setHasEvaluated(true);
            setHasEvaluatedInstructor(true);
            setHasEvaluatedContent(true);
          } else if (evaluationMode === "instructor") {
            setHasEvaluatedInstructor(true);
          } else if (evaluationMode === "content") {
            setHasEvaluatedContent(true);
          }

          setShowFeedbackModal(false);
          loadCourseData();
        }}
      />

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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    marginTop: 16,
    marginBottom: 8,
    fontWeight: "600",
  },
  errorDetail: {
    fontSize: 14,
    marginBottom: 24,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 0,
  },
  backButtonHeader: {
    position: "relative",
    marginBottom: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    zIndex: 2,
    minWidth: 36,
    minHeight: 36,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  courseHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 6,
  },
  headerTextContent: {
    flex: 1,
    paddingTop: 4,
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "transparent",
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "700",
  },
  previewBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  previewText: {
    fontSize: 11,
    fontWeight: "700",
  },

  title: {
    fontWeight: "800",
    lineHeight: 30,
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  headerDivider: {
    height: 1,
    width: "100%",
    marginTop: 12,
    marginBottom: 12,
  },
  instructor: {
    fontSize: 14,
    marginBottom: 8,
    color: "#666",
  },
  backLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  metaContainer: {
    flexDirection: "row",
    gap: 16,
    marginTop: 8,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    fontSize: 13,
  },
  descriptionSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  materialsPreviewSection: {
    padding: 16,
    borderWidth: 1,
    borderColor: "#e6e6e6",
    borderRadius: 8,
    marginTop: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  actionSection: {
    padding: 20,
    gap: 12,
  },
  primaryButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 120,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    fontWeight: "700",
  },
  secondaryButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 120,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    backgroundColor: "transparent",
  },
  secondaryButtonText: {
    fontWeight: "700",
  },
  enrollButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 16,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  enrollButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },

  previewButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  previewButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  continueButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 16,
    borderRadius: 12,
  },
  continueButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  shareButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  progressSection: {
    padding: 20,
    marginTop: 8,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  progressPercentage: {
    fontSize: 24,
    fontWeight: "bold",
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
  },
  modulesSection: {
    padding: 20,
  },
  moduleCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  moduleLocked: {
    opacity: 0.6,
  },
  moduleCompleted: {
    borderLeftWidth: 4,
  },
  moduleNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  moduleNumberText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#666",
  },
  moduleContent: {
    flex: 1,
  },
  moduleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  moduleInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  moduleIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  moduleText: {
    flex: 1,
  },
  moduleTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  moduleMeta: {
    fontSize: 12,
  },
  moduleStatus: {
    marginLeft: 12,
  },
  completedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  completedText: {
    fontSize: 12,
    color: "#4CAF50",
    fontWeight: "500",
  },
  previewModuleBadge: {
    fontSize: 10,
    fontWeight: "600",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  previewNote: {
    fontSize: 11,
    marginTop: 8,
    fontStyle: "italic",
  },
  infoSection: {
    padding: 20,
    gap: 12,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
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
});
