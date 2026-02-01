import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Platform,
  Modal,
  ActivityIndicator,
} from "react-native";
import IconActionButton from "../../components/common/IconActionButton";
import ThemedButton from "../../components/common/ThemedButton";
import { Ionicons } from "@expo/vector-icons";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useTheme } from "../../context/ThemeContext";
import { useHeader } from "../../context/HeaderContext";
import CourseMaterialsPanel from "../../components/courses/CourseMaterialsPanel";
import { useUserRole } from "../../hooks/useUserRole";
import { supabase } from "../../config/supabase";
import LessonFormModal from "../../components/admin/LessonFormModal";

const LessonsScreen: React.FC<{
  courseId?: number | string;
  moduleId?: number | string;
}> = ({ courseId: propCourseId, moduleId: propModuleId }) => {
  const { theme, colors } = useTheme();
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [lessons, setLessons] = useState<any[]>([]);
  const [modulesMap, setModulesMap] = useState<Record<number, string>>({});
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);

  const [showMaterialsModal, setShowMaterialsModal] = useState(false);
  const [materialModuleId, setMaterialModuleId] = useState<number | null>(null);
  const [materialContenidoId, setMaterialContenidoId] = useState<
    number | "new" | null
  >(null);
  const { isAdmin, isInstructor } = useUserRole();

  const route = useRoute<any>();
  const rawCid = route?.params?.courseId ?? propCourseId;
  const parsedCourseId =
    rawCid == null
      ? undefined
      : typeof rawCid === "string"
        ? parseInt(rawCid, 10)
        : rawCid;
  const rawMid = route?.params?.moduleId ?? propModuleId;
  const parsedModuleId =
    rawMid == null
      ? undefined
      : typeof rawMid === "string"
        ? parseInt(rawMid, 10)
        : rawMid;
  const { header, setHeader } = useHeader();

  useEffect(() => {
    const rawCid = route?.params?.courseId ?? propCourseId;
    const cid =
      rawCid == null
        ? undefined
        : typeof rawCid === "string"
          ? parseInt(rawCid, 10)
          : rawCid;
    const rawMid = route?.params?.moduleId ?? propModuleId;
    const mid =
      rawMid == null
        ? undefined
        : typeof rawMid === "string"
          ? parseInt(rawMid, 10)
          : rawMid;
    loadLessons(cid, mid);

    if (Platform.OS === "web") {
      try {
        const { goToWebRoute } = require("../../utils/webNav");
        if (cid) goToWebRoute("Lessons", { courseId: cid, moduleId: mid });
        else goToWebRoute("Lessons");
      } catch (e) {}
    }

    return () => {
      if (Platform.OS === "web") {
        try {
          const {
            getCurrentWebRoute,
            clearWebRoute,
          } = require("../../utils/webNav");
          const current = getCurrentWebRoute ? getCurrentWebRoute() : null;

          if (
            !current ||
            (current.name === "Lessons" &&
              ((current.params?.courseId == null && !cid) ||
                (String(current.params?.courseId) === String(cid) &&
                  (current.params?.moduleId == null ||
                    String(current.params?.moduleId) === String(mid)))))
          ) {
            clearWebRoute();
          } else {
          }
        } catch (e) {}
      }
    };
  }, [route?.params?.courseId, route?.params?.moduleId, propCourseId]);

  const loadLessons = async (courseId?: number, moduleId?: number) => {
    try {
      setLoading(true);
      let query = supabase
        .from("contenidos")
        .select("*")
        .is("deleted_at", null)
        .order("orden", { ascending: true });
      if (courseId != null && !Number.isNaN(Number(courseId)))
        query = query.eq("id_curso", Number(courseId));
      if (moduleId != null && !Number.isNaN(Number(moduleId)))
        query = query.eq("id_modulo", Number(moduleId));
      const res: any = await query;
      if (res.error) throw res.error;
      const items = res.data || [];
      setLessons(items);

      const moduleIds = Array.from(
        new Set(items.map((i: any) => i.id_modulo).filter(Boolean)),
      );
      if (moduleIds.length > 0) {
        const modsRes: any = await supabase
          .from("modulos")
          .select("id_modulo, titulo")
          .in("id_modulo", moduleIds);
        if (!modsRes.error && Array.isArray(modsRes.data)) {
          const map: Record<number, string> = {};
          (modsRes.data || []).forEach((m: any) => {
            map[m.id_modulo] = m.titulo;
          });
          setModulesMap(map);
        }
      }
    } catch (err) {
      Alert.alert("Error", "No se pudieron cargar las lecciones");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id: number) => {
    setSelectedId(id);
    setShowFormModal(true);
  };

  const handleCreate = () => {
    setSelectedId(null);
    setShowFormModal(true);
  };

  const handleDelete = (id: number, titulo: string) => {
    Alert.alert("Confirmar eliminación", `¿Eliminar lección "${titulo}"?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            const { error } = await supabase
              .from("contenidos")
              .update({ deleted_at: new Date().toISOString() })
              .eq("id_contenido", id);
            if (error) throw error;
            Alert.alert("Éxito", "Lección eliminada");
            await loadLessons(parsedCourseId, parsedModuleId);
          } catch (err: any) {
            Alert.alert("Error", err.message || "No se pudo eliminar");
          }
        },
      },
    ]);
  };

  const onSuccess = async () => {
    setShowFormModal(false);
    setSelectedId(null);
    await loadLessons(parsedCourseId, parsedModuleId);
  };

  React.useEffect(() => {
    setHeader({
      title: "Lecciones",
      subtitle:
        (parsedModuleId ? modulesMap[parsedModuleId] : undefined) ?? undefined,
      showBack: true,
      manual: true,
      owner: "Lessons",
      onBack: () => navigation.goBack(),
      containerStyle:
        Platform.OS !== "web" ? { backgroundColor: colors.primary } : undefined,
      backIconColor: Platform.OS !== "web" ? theme.colors.card : undefined,
      alignLeftOnMobile: true,
    });

    return () => {
      try {
        setHeader(null);
      } catch (e) {}
    };
  }, [
    setHeader,
    navigation,
    parsedModuleId,
    modulesMap,
    colors.primary,
    theme.colors.card,
  ]);

  const renderItem = ({ item }: { item: any }) => (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
        },
      ]}
    >
      {}
      <View style={styles.cardTopRow}>
        <View
          style={[styles.orderBadge, { backgroundColor: theme.colors.primary }]}
        >
          <Text style={[styles.orderText, { color: "#FFFFFF" }]}>
            #{item.orden}
          </Text>
        </View>
        <Text
          style={[styles.cardTitle, { color: theme.colors.text, flex: 1 }]}
          numberOfLines={2}
        >
          {item.titulo}
        </Text>
      </View>

      {}
      {item.descripcion ? (
        <View style={styles.descriptionContainer}>
          <Text
            style={[
              styles.cardDescription,
              { color: theme.colors.textSecondary },
            ]}
            numberOfLines={3}
          >
            {item.descripcion}
          </Text>
        </View>
      ) : null}

      {}
      <View style={styles.infoRow}>
        <View style={styles.infoTag}>
          <Ionicons
            name="folder-outline"
            size={14}
            color={theme.colors.textSecondary}
          />
          <Text
            style={[styles.infoText, { color: theme.colors.textSecondary }]}
          >
            {modulesMap[item.id_modulo] ||
              (item.id_modulo ? `Módulo ${item.id_modulo}` : "Sin módulo")}
          </Text>
        </View>
        {item.tipo && (
          <View style={styles.infoTag}>
            <Ionicons
              name="document-text-outline"
              size={14}
              color={theme.colors.textSecondary}
            />
            <Text
              style={[styles.infoText, { color: theme.colors.textSecondary }]}
            >
              {item.tipo}
            </Text>
          </View>
        )}
      </View>

      {}
      <View
        style={[styles.divider, { backgroundColor: theme.colors.border }]}
      />

      {}
      <View style={styles.cardActions}>
        {}
        <IconActionButton
          icon="help-circle"
          label="Quiz"
          compact={false}
          iconOnly={false}
          onPress={() => {
            if (Platform.OS === "web") {
              try {
                const { goToWebRoute } = require("../../utils/webNav");
                goToWebRoute("QuizManagement", {
                  contentId: String(item.id_contenido),
                  contentTitle: String(item.titulo || "Quiz"),
                });
                return;
              } catch (e) {}
            }

            try {
              navigation.navigate("QuizManagement" as any, {
                contentId: String(item.id_contenido),
                contentTitle: String(item.titulo || "Quiz"),
              });
            } catch (e) {}
          }}
          style={[
            styles.actionButton,
            Platform.OS !== "web" && styles.actionButtonMobile,
          ]}
          accessibilityLabel={`Gestionar quiz: ${item.titulo}`}
        />

        {(isAdmin || isInstructor) && parsedCourseId ? (
          <IconActionButton
            icon="cloud-upload"
            label="Subir"
            compact={false}
            iconOnly={false}
            onPress={() => {
              setMaterialModuleId(item.id_modulo || null);
              setMaterialContenidoId(item.id_contenido || null);
              setShowMaterialsModal(true);
            }}
            variant="outline"
            showLabel={true}
            style={styles.actionButton}
            accessibilityLabel={`Subir archivos para ${item.titulo}`}
          />
        ) : null}

        <IconActionButton
          icon="pencil"
          label="Editar"
          compact={false}
          iconOnly={false}
          onPress={() => handleEdit(item.id_contenido)}
          variant="outline"
          showLabel={true}
          style={styles.actionButton}
          accessibilityLabel={`Editar lección ${item.titulo}`}
        />

        <IconActionButton
          icon="trash"
          label="Eliminar"
          compact={false}
          iconOnly={false}
          onPress={() => handleDelete(item.id_contenido, item.titulo)}
          variant="danger"
          showLabel={true}
          style={styles.actionButton}
          accessibilityLabel={`Eliminar lección ${item.titulo}`}
        />
      </View>
    </View>
  );

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.content}>
        {}
        {}
        {Platform.OS !== "web" ? (
          (isAdmin || isInstructor) && parsedCourseId ? (
            <View
              style={{
                flexDirection: "row",
                justifyContent: "flex-end",
                marginBottom: 12,
              }}
            >
              <IconActionButton
                icon="add-circle-outline"
                label="Crear lección"
                compact={true}
                iconOnly={false}
                onPress={handleCreate}
                variant="primary"
                keepPrimaryMobile={true}
                accessibilityLabel="Crear lección"
              />
            </View>
          ) : null
        ) : (isAdmin || isInstructor) && parsedCourseId ? (
          <View
            style={{
              flexDirection: "row",
              justifyContent: "flex-end",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <ThemedButton
              variant="primary"
              onPress={handleCreate}
              style={{ paddingHorizontal: 12 }}
              accessibilityLabel="Crear lección"
            >
              Crear lección
            </ThemedButton>
          </View>
        ) : null}

        {}
        {!parsedCourseId && (
          <View
            style={{
              marginBottom: 12,
              padding: 12,
              borderRadius: 8,
              backgroundColor: "#FFF4E5",
              borderWidth: 1,
              borderColor: "#FFDAB9",
            }}
          >
            <Text
              style={{ fontWeight: "700", color: "#8A6D3B", marginBottom: 6 }}
            >
              Acciones no disponibles
            </Text>
            <Text style={{ color: "#8A6D3B" }}>
              Para crear lecciones o subir materiales, abre esta pantalla desde
              la página del curso (Admin → Cursos → Lecciones) o selecciona un
              módulo dentro de un curso.
            </Text>
          </View>
        )}

        {loading ? (
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={{ marginTop: 12, color: theme.colors.textSecondary }}>
              Cargando lecciones...
            </Text>
          </View>
        ) : (
          <FlatList
            data={lessons}
            keyExtractor={(i) => String(i.id_contenido)}
            renderItem={renderItem}
            contentContainerStyle={{ paddingVertical: 16, flexGrow: 1 }}
            ListEmptyComponent={
              <View
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 40,
                  opacity: 0.6,
                }}
              >
                <Ionicons
                  name="document-text-outline"
                  size={48}
                  color={theme.colors.textSecondary}
                />
                <Text
                  style={{
                    marginTop: 12,
                    fontSize: 16,
                    color: theme.colors.textSecondary,
                    textAlign: "center",
                  }}
                >
                  {parsedModuleId
                    ? "Este módulo no tiene lecciones aún."
                    : parsedCourseId
                      ? "No hay lecciones en este curso."
                      : "Selecciona un curso."}
                </Text>
              </View>
            }
          />
        )}
      </View>

      {showMaterialsModal && parsedCourseId && (
        <Modal
          visible={showMaterialsModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowMaterialsModal(false)}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.5)",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: "95%",
                maxWidth: 980,
                borderRadius: 12,
                overflow: "hidden",
              }}
            >
              <CourseMaterialsPanel
                courseId={Number(parsedCourseId)}
                allowUpload={true}
                allowDelete={isAdmin}
                initialModuleId={materialModuleId ?? undefined}
                initialContenidoId={materialContenidoId ?? undefined}
                hideTargetSelection={materialContenidoId !== null}
                showFileList={false}
                onClose={() => setShowMaterialsModal(false)}
                onUploadDone={async () => {
                  setShowMaterialsModal(false);
                  await loadLessons(parsedCourseId, parsedModuleId);
                }}
              />
            </View>
          </View>
        </Modal>
      )}

      <LessonFormModal
        visible={showFormModal}
        courseId={
          parsedCourseId
            ? String(parsedCourseId)
            : selectedId
              ? String(
                  lessons.find((m) => m.id_contenido === selectedId)?.id_curso,
                )
              : route?.params?.courseId
                ? String(route.params.courseId)
                : ""
        }
        lessonId={selectedId || undefined}
        initialModuleId={parsedModuleId}
        onClose={() => {
          setShowFormModal(false);
          setSelectedId(null);
        }}
        onSuccess={onSuccess}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "web" ? 16 : 4,
    flex: 1,
  },
  pageTitle: { fontSize: 15, fontWeight: "700", marginBottom: 4 },
  pageSubtitle: { fontSize: 14, marginBottom: 12 },

  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  orderBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 12,
    minWidth: 40,
    alignItems: "center",
  },
  orderText: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 24,
    letterSpacing: -0.3,
  },
  descriptionContainer: {
    marginBottom: 12,
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  infoTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: "#F3F4F6",
  },
  infoText: {
    fontSize: 12,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    marginBottom: 12,
    opacity: 0.3,
  },
  cardActions: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
    marginTop: 12,
  },
  actionButton: {
    flexGrow: 1,
    minWidth: 100,
    height: 44,
    justifyContent: "center",
  },
  actionButtonMobile: {
    minWidth: "45%",
    flexBasis: "48%",
  },

  cardHeader: {
    flexDirection: "row",
    marginBottom: 8,
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardActionsHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  actionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  actionBtnText: { fontWeight: "600" },
});

export default LessonsScreen;
