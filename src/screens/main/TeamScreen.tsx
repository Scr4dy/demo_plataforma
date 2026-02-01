import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  Platform,
  Dimensions,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";
import { useHeader } from "../../context/HeaderContext";
import { supabase } from "../../config/supabase";
import { on as onEvent, off as offEvent } from "../../utils/eventBus";
import { useAuth } from "../../context/AuthContext";
import { createNotification } from "../../services/inAppNotificationService";

const { width } = Dimensions.get("window");

interface TeamScreenProps {
  navigation: {
    navigate: (screen: string, params?: any) => void;
    goBack: () => void;
  };
}

interface Member {
  id: string;
  nombre: string;
  apellido_paterno?: string;
  apellido_materno?: string;
  departamento?: string;
  puesto?: string;
  role?: string;
  numero_empleado?: string;
  activo: boolean;
  certifications: Certification[];
  evaluations: Evaluation[];
  lastTraining?: string;
  email?: string;
  telefono?: string;
  fecha_ingreso?: string;
}

interface Certification {
  id: string;
  nombre: string;
  estado: "activa" | "expirada" | "en_progreso";
  fecha_expiracion?: string;
  progreso?: number;
}

interface Evaluation {
  id: string;
  tipo: string;
  estado: "completada" | "pendiente" | "en_progreso";
  fecha?: string;
}

interface PendingAction {
  id: number;
  type: string;
  count: number;
  description: string;
  priority: string;
}

interface TeamAlert {
  id: number;
  type: string;
  message: string;
  member: string;
  priority: string;
}

const lightenColor = (hex: string, percent: number): string => {
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

export default function TeamScreen({ navigation }: TeamScreenProps) {
  const { theme, colors, getFontSize } = useTheme();
  const { header, setHeader } = useHeader();
  const insets = useSafeAreaInsets();
  const { state: authState } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await loadTeamData();
    } catch (e) {
      
    } finally {
      setRefreshing(false);
    }
  };

  
  const [departments, setDepartments] = useState<string[]>([]);
  const [selectedDept, setSelectedDept] = useState<string | "all">("all");
  const [viewMessage, setViewMessage] = useState<string | null>(null);

  const [teamData, setTeamData] = useState<{
    department: string;
    totalMembers: number;
    members: Member[];
    pendingActions: PendingAction[];
    alerts: TeamAlert[];
  }>({
    department: "Cargando...",
    totalMembers: 0,
    members: [],
    pendingActions: [],
    alerts: [],
  });

  
  useEffect(() => {
    loadTeamData();
  }, []); 

  useEffect(() => {
    
    if (Platform.OS === "web") {
      setHeader({ hidden: true, owner: "Team" });
    } else {
      setHeader({
        title: "Mi Equipo",
        subtitle: "Gestión de tu equipo y personal a cargo",
        owner: "Team",
        showBack: false,
        manual: true,
      });
    }
    return () => {
      try {
        setHeader(null);
      } catch (e) {
        
      }
    };
  }, []); 

  
  const [windowWidth, setWindowWidth] = useState(width);
  useEffect(() => {
    const handler = ({ window }: any) => setWindowWidth(window.width);
    const sub: any = Dimensions.addEventListener
      ? Dimensions.addEventListener("change", handler)
      : Dimensions.addEventListener("change", handler);
    return () => {
      if (sub && typeof sub.remove === "function") sub.remove();
    };
  }, []);

  
  
  
  useEffect(() => {
    if (selectedDept === "all") {
      setViewMessage("Mostrando: Todos los departamentos");
    } else {
      setViewMessage(`Mostrando: ${selectedDept}`);
    }
    const timer = setTimeout(() => setViewMessage(null), 2500);
    return () => clearTimeout(timer);
  }, [selectedDept]);

  
  useEffect(() => {
    const unsub = onEvent("progress:updated", (payload) => {
      
      loadTeamData();
    });
    return () => {
      try {
        unsub();
      } catch (e) {
        
      }
    };
  }, []); 

  const loadTeamData = async () => {
    try {
      setLoading(true);

      
      const { AppConfig } = await import("../../config/appConfig");
      if (AppConfig.useMockData) {
        
        setTeamData({
          department: "Ventas - Demo",
          totalMembers: 2,
          members: [
            {
              id: "3",
              nombre: "María Empleado García",
              apellido_paterno: "Empleado",
              apellido_materno: "García",
              departamento: "Ventas",
              puesto: "Ejecutivo de Ventas",
              role: "Empleado",
              numero_empleado: "EMP001",
              activo: true,
              certifications: [
                {
                  id: "1",
                  nombre: "Introducción a la Seguridad Industrial",
                  estado: "en_progreso",
                  progreso: 75,
                },
                {
                  id: "2",
                  nombre: "Atención al Cliente Excelente",
                  estado: "activa",
                  progreso: 100,
                },
              ],
              evaluations: [],
              lastTraining: "Hace 2 días",
              email: "empleado@demo.com",
              telefono: "+52 55 3456 7890",
              fecha_ingreso: "2024-02-01",
            },
            {
              id: "4",
              nombre: "Juan Pérez López",
              apellido_paterno: "Pérez",
              apellido_materno: "López",
              departamento: "Ventas",
              puesto: "Gerente de Ventas",
              role: "Empleado",
              numero_empleado: "EMP002",
              activo: true,
              certifications: [
                {
                  id: "3",
                  nombre: "Gestión de Proyectos Ágiles",
                  estado: "en_progreso",
                  progreso: 30,
                },
              ],
              evaluations: [],
              lastTraining: "Hace 5 días",
              email: "juan.perez@demo.com",
              telefono: "+52 55 4567 8901",
              fecha_ingreso: "2024-01-15",
            },
          ],
          pendingActions: [
            {
              id: 1,
              type: "evaluation",
              count: 0,
              description: "Evaluaciones pendientes",
              priority: "high",
            },
            {
              id: 2,
              type: "certification",
              count: 0,
              description: "Cursos por vencer",
              priority: "medium",
            },
            {
              id: 3,
              type: "progress",
              count: 2,
              description: "Cursos en progreso",
              priority: "low",
            },
            {
              id: 4,
              type: "inactive",
              count: 0,
              description: "Usuarios inactivos",
              priority: "medium",
            },
          ],
          alerts: [],
        });
        setLoading(false);
        return;
      }

      
      if (!authState.user) {
        if (Platform.OS === "web") {
          alert("Error: Usuario no autenticado");
        } else {
          await createNotification(
            "system_update",
            "Error de autenticación",
            "Usuario no autenticado",
            "high",
          );
        }
        navigation.navigate("Login");
        return;
      }
      
      const { data: currentUserData, error: userError } = await supabase
        .from("usuarios")
        .select("*")
        .eq("auth_id", authState.user.id)
        .single();

      if (userError) {
        
        if (Platform.OS === "web") {
          alert("Error: No se pudo obtener la información del usuario");
        } else {
          await createNotification(
            "system_update",
            "Error",
            "No se pudo obtener la información del usuario",
            "high",
          );
        }
        setLoading(false);
        return;
      }
      const userRole = currentUserData?.rol || "user";
      const isAdmin = String(userRole).toLowerCase() === "admin";
      const userDept = currentUserData?.departamento || null;
      const userName = currentUserData?.nombre || authState.user.nombre;
      const userNumber = currentUserData?.numero_control || "N/A";
      
      let query = supabase
        .from("usuarios")
        .select(
          `
					id_usuario,
					numero_control,
					nombre,
					apellido_paterno,
					apellido_materno,
					departamento,
					puesto,
					rol,
					correo,
					telefono,
					fecha_ingreso,
					activo,
					auth_id
				`,
        )
        .order("nombre");

      
      if (!isAdmin && userDept) {
      }

      const { data: users, error: usersError } = await query;

      if (usersError) {
        
        throw usersError;
      }
      
      if (!users || users.length === 0) {
        setTeamData({
          department: userDept || "Sin departamento",
          totalMembers: 0,
          members: [],
          pendingActions: [],
          alerts: [
            {
              id: 1,
              type: "info",
              message: "No hay miembros en el sistema",
              member: "Sistema",
              priority: "low",
            },
          ],
        });
        setLoading(false);
        return;
      }
      
      if (userRole === "admin") {
        const depts = Array.from(
          new Set(
            (users || []).map((u: any) => u.departamento).filter(Boolean),
          ),
        ).sort();
        setDepartments(depts);
        
        setSelectedDept("all");
      }
      
      
      const usersToProcess =
        isAdmin && selectedDept && selectedDept !== "all"
          ? (users || []).filter((u: any) => u.departamento === selectedDept)
          : users || [];

      
      const userIds = usersToProcess.map((u: any) => u.id_usuario);

      
      const [allInscriptionsResult, allEvaluationsResult] = await Promise.all([
        supabase
          .from("inscripciones")
          .select(
            "id_inscripcion, id_empleado, id_curso, progreso, estado, fecha_ultima_actividad",
          )
          .in("id_empleado", userIds)
          .is("deleted_at", null),
        supabase
          .from("evaluaciones_instructor")
          .select(
            "id_evaluacion, id_empleado, id_curso, curso_id, puntuacion, fecha_evaluacion",
          )
          .in("id_empleado", userIds)
          .is("deleted_at", null)
          .order("fecha_evaluacion", { ascending: false }),
      ]);

      const allInscriptions = allInscriptionsResult.data || [];
      const allEvaluations = allEvaluationsResult.data || [];

      
      const inscripCourseIds = allInscriptions.map((i: any) => i.id_curso);
      const evalCourseIds = allEvaluations.map(
        (e: any) => e.id_curso || e.curso_id,
      );
      const uniqueCourseIds = Array.from(
        new Set([...inscripCourseIds, ...evalCourseIds].filter(Boolean)),
      );

      
      let cursosMap: Record<number, any> = {};
      if (uniqueCourseIds.length > 0) {
        const { data: coursesData } = await supabase
          .from("cursos")
          .select("id_curso, titulo, fecha_fin")
          .in("id_curso", uniqueCourseIds as any[])
          .is("deleted_at", null);

        (coursesData || []).forEach((c: any) => {
          cursosMap[c.id_curso] = c;
        });
      }

      
      const membersWithDetails = usersToProcess.map((user: any) => {
        
        const userInscriptions = allInscriptions.filter(
          (i: any) => i.id_empleado === user.id_usuario,
        );
        const userEvaluations = allEvaluations.filter(
          (e: any) => e.id_empleado === user.id_usuario,
        );

        const inscripcionesConCurso = userInscriptions
          .map((inscripcion: any) => ({
            ...inscripcion,
            curso: cursosMap[inscripcion.id_curso] || null,
          }))
          .filter((item: any) => item.curso !== null);

        
        const formattedCerts: Certification[] = inscripcionesConCurso.map(
          (inscripcion: any) => {
            let estado: "activa" | "expirada" | "en_progreso" = "en_progreso";
            let progreso: number = inscripcion.progress || 0;

            
            const fecha_expiracion = inscripcion.curso?.fecha_fin || undefined;

            
            if (inscripcion.estado === "completado") {
              estado = "activa";
              progreso = 100;
            } else {
              estado = "en_progreso";
              progreso = inscripcion.progreso || inscripcion.progress || 0;
              
              if (fecha_expiracion) {
                const fechaExp = new Date(fecha_expiracion);
                if (fechaExp < new Date()) {
                  estado = "expirada";
                }
              }
            }

            return {
              id: inscripcion.id_inscripcion.toString(),
              nombre: inscripcion.curso?.titulo || "Curso",
              estado,
              fecha_expiracion,
              progreso,
            };
          },
        );

        
        const formattedEvals: Evaluation[] = userEvaluations
          .filter((evalItem: any) => {
            const cId = evalItem.id_curso || evalItem.curso_id;
            return cId && cursosMap[cId]; 
          })
          .map((evalItem: any) => {
            let estadoEval: "completada" | "pendiente" | "en_progreso" =
              "pendiente";

            if (
              evalItem.puntuacion !== null &&
              evalItem.puntuacion !== undefined
            ) {
              estadoEval = "completada";
            }

            return {
              id: evalItem.id_evaluacion.toString(),
              tipo: "Evaluación de Instructor",
              estado: estadoEval,
              fecha: evalItem.fecha_evaluacion,
            };
          });

        
        let lastTraining = "Sin capacitaciones";
        if (userInscriptions && userInscriptions.length > 0) {
          const inscripcionesActivas = userInscriptions.filter(
            (ins: any) =>
              ins.estado === "en_progreso" || ins.estado === "activo",
          );
          if (inscripcionesActivas.length > 0) {
            const ultimaActividad =
              inscripcionesActivas[0].fecha_ultima_actividad;
            if (ultimaActividad) {
              const dias = Math.floor(
                (new Date().getTime() - new Date(ultimaActividad).getTime()) /
                  (1000 * 60 * 60 * 24),
              );
              lastTraining =
                dias === 0 ? "Hoy" : `Hace ${dias} día${dias !== 1 ? "s" : ""}`;
            } else {
              lastTraining = "En progreso";
            }
          }
        }

        return {
          id: user.id_usuario.toString(),
          nombre:
            `${user.nombre} ${user.apellido_paterno || ""} ${user.apellido_materno || ""}`.trim(),
          apellido_paterno: user.apellido_paterno,
          apellido_materno: user.apellido_materno,
          departamento: user.departamento || "Sin departamento",
          puesto: user.puesto || "Sin puesto",
          role: user.rol || "user",
          numero_empleado: user.numero_control,
          activo: (() => {
            const v = user.activo;
            if (typeof v === "boolean") return v;
            if (typeof v === "number") return v === 1;
            if (v === null || v === undefined) return false;
            const s = String(v).trim().toLowerCase();
            return ["true", "t", "1", "yes", "y"].includes(s);
          })(),
          certifications: formattedCerts,
          evaluations: formattedEvals,
          lastTraining: lastTraining,
          email: user.correo,
          telefono: user.telefono,
          fecha_ingreso: user.fecha_ingreso,
        };
      });
      
      let displayDepartment = "";
      if (userRole === "admin") {
        displayDepartment = "Administración - Todos los Departamentos";
      } else if (userDept) {
        displayDepartment = userDept;
      } else {
        displayDepartment = "Sin Departamento Asignado";
      }

      
      const pendingActions: PendingAction[] = [
        {
          id: 1,
          type: "evaluation",
          count: membersWithDetails.reduce(
            (sum, member) =>
              sum +
              member.evaluations.filter((e) => e.estado === "pendiente").length,
            0,
          ),
          description: "Evaluaciones pendientes",
          priority: "high",
        },
        {
          id: 2,
          type: "certification",
          count: membersWithDetails.reduce((sum, member) => {
            const hoy = new Date();
            const en30Dias = new Date();
            en30Dias.setDate(en30Dias.getDate() + 30);
            const cursosPorVencer = member.certifications.filter((c) => {
              if (!c.fecha_expiracion || c.estado === "expirada") {
                return false;
              }
              const fechaExp = new Date(c.fecha_expiracion);
              const estaPorVencer = fechaExp >= hoy && fechaExp <= en30Dias;
              return estaPorVencer;
            });
            return sum + cursosPorVencer.length;
          }, 0),
          description: "Cursos por vencer",
          priority: "medium",
        },
        {
          id: 3,
          type: "progress",
          count: membersWithDetails.reduce(
            (sum, member) =>
              sum +
              member.certifications.filter((c) => c.estado === "en_progreso")
                .length,
            0,
          ),
          description: "Cursos en progreso",
          priority: "low",
        },
        {
          id: 4,
          type: "inactive",
          count: membersWithDetails.filter((m) => !m.activo).length,
          description: "Usuarios inactivos",
          priority: "medium",
        },
      ];

      
      
      for (const member of membersWithDetails) {
        const certsPorVencer = member.certifications.filter((c) => {
          if (!c.fecha_expiracion) return false;
          const expDate = new Date(c.fecha_expiracion);
          const today = new Date();
          const diffDays = Math.ceil(
            (expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
          );
          return diffDays <= 30 && diffDays > 0;
        });

        if (certsPorVencer.length > 0) {
          await createNotification(
            "course_deadline",
            "Cursos por vencer",
            `${certsPorVencer.length} curso(s) de ${member.nombre?.split(" ")[0] || "Usuario"} vence(n) pronto`,
            "high",
          );
        }

        
        const cursosProgresoBajo = member.certifications.filter(
          (c) => c.estado === "en_progreso" && c.progreso && c.progreso < 30,
        );

        if (cursosProgresoBajo.length > 0) {
          await createNotification(
            "reminder",
            "Progreso bajo",
            `${cursosProgresoBajo.length} curso(s) de ${member.nombre?.split(" ")[0] || "Usuario"} con progreso bajo`,
            "medium",
          );
        }

        
        if (member.activo === false) {
          await createNotification(
            "system_update",
            "Usuario inactivo",
            `${member.nombre?.split(" ")[0] || "Usuario"} está marcado como inactivo`,
            "high",
          );
        }
      }

      
      setTeamData({
        department: displayDepartment,
        totalMembers: membersWithDetails.length,
        members: membersWithDetails,
        pendingActions,
        alerts: [], 
      });
    } catch (error) {
      
      if (Platform.OS === "web") {
        alert("Error: No se pudieron cargar los datos del equipo");
      } else {
        await createNotification(
          "system_update",
          "Error",
          "No se pudieron cargar los datos del equipo",
          "high",
        );
      }

      
      setTeamData({
        department: "Error cargando datos",
        totalMembers: 0,
        members: [],
        pendingActions: [
          {
            id: 1,
            type: "evaluation",
            count: 0,
            description: "Evaluaciones pendientes",
            priority: "high",
          },
          {
            id: 2,
            type: "certification",
            count: 0,
            description: "Cursos por vencer",
            priority: "medium",
          },
        ],
        alerts: [
          {
            id: 1,
            type: "warning",
            message: "Error al cargar datos. Intenta nuevamente.",
            member: "Sistema",
            priority: "high",
          },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  
  const getStatusColor = (status: string | boolean) => {
    if (typeof status === "boolean") {
      return status ? colors.success || "#38a169" : colors.error || "#e53e3e";
    }
    switch (status) {
      case "active":
      case "activa":
      case "completada":
        return colors.success || "#38a169";
      case "inactive":
      case "expirada":
        return colors.error || "#e53e3e";
      case "pending":
      case "pendiente":
        return colors.warning || "#d69e2e";
      case "en_progreso":
        return colors.primary || "#2b6cb0";
      default:
        return theme.dark ? "#aaa" : "#718096";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return colors.error || "#e53e3e";
      case "medium":
        return colors.warning || "#d69e2e";
      case "low":
        return colors.primary || "#2b6cb0";
      default:
        return theme.dark ? "#aaa" : "#718096";
    }
  };

  
  const getCourseStatus = (fechaExpiracion?: string, progreso?: number) => {
    
    if (progreso !== undefined && progreso >= 100) {
      return {
        label: "Completado",
        color: "#10b981", 
        icon: "checkmark-circle" as const,
      };
    }

    if (!fechaExpiracion) {
      return {
        label: "Vence",
        color: "#10b981", 
        icon: null,
      };
    }

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaVencimiento = new Date(fechaExpiracion);
    fechaVencimiento.setHours(0, 0, 0, 0);

    const diferenciaDias = Math.ceil(
      (fechaVencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24),
    );

    
    if (diferenciaDias < 0) {
      return {
        label: "Venció",
        color: "#ef4444", 
        icon: null,
      };
    }

    
    if (diferenciaDias <= 15) {
      return {
        label: "Vence",
        color: "#f59e0b", 
        icon: null,
      };
    }

    
    return {
      label: "Vence",
      color: "#10b981", 
      icon: null,
    };
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "urgent":
        return "warning";
      case "warning":
        return "notifications";
      case "info":
        return "information-circle";
      default:
        return "notifications";
    }
  };

  const handleEvaluateMember = (member: Member) => {
    if (Platform.OS === "web") {
      if (window.confirm(`¿Iniciar evaluación para ${member.nombre}?`)) {
        navigation.navigate("Evaluation", { member });
      }
    } else {
      
      navigation.navigate("Evaluation", { member });
    }
  };

  const handleQuickAction = async (action: PendingAction) => {
    if (Platform.OS === "web") {
      alert(`Acción: ${action.description}`);
    } else {
      await createNotification(
        "team_message",
        "Acción pendiente",
        action.description,
        "medium",
      );
    }
  };

  const filteredMembers = teamData.members.filter((member) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      member.nombre.toLowerCase().includes(q) ||
      member.puesto?.toLowerCase().includes(q) ||
      member.departamento?.toLowerCase().includes(q) ||
      member.certifications.some((c) =>
        (c.nombre || "").toLowerCase().includes(q),
      ) ||
      member.evaluations.some((e) => (e.tipo || "").toLowerCase().includes(q));

    if (activeFilter === "all") return matchesSearch;
    if (activeFilter === "active")
      return matchesSearch && member.activo === true;
    if (activeFilter === "inactive")
      return matchesSearch && member.activo === false;
    if (activeFilter === "needs-attention") {
      return (
        matchesSearch &&
        (member.certifications.some((cert) => cert.estado === "expirada") ||
          member.certifications.some(
            (cert) =>
              cert.estado === "en_progreso" && (cert.progreso || 0) < 30,
          ) ||
          member.evaluations.some(
            (evaluation) => evaluation.estado === "pendiente",
          ) ||
          member.activo === false)
      );
    }
    return matchesSearch;
  });

  
  const dynamicStyles = {
    backgroundColor: theme.colors.background,
    textColor: theme.colors.text,
    cardBackground: theme.colors.card,
    borderColor: theme.dark ? "#444" : "#e2e8f0",
  };

  if (loading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: dynamicStyles.backgroundColor },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: dynamicStyles.textColor }]}>
          Cargando datos del equipo...
        </Text>
      </View>
    );
  }

  
  
  if (Platform.OS === "web") {
    return (
      <View
        style={[
          styles.webContainer,
          { backgroundColor: dynamicStyles.backgroundColor },
        ]}
      >
        {}

        <ScrollView
          style={styles.webContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.webContentInner}>
            {}
            {teamData.department && (
              <View style={{ marginBottom: 24 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent:
                      Platform.OS === "web" ? "center" : "flex-start",
                    paddingVertical: 16,
                    paddingHorizontal: 20,
                    backgroundColor: dynamicStyles.cardBackground,
                    borderRadius: 12,
                    borderLeftWidth: 4,
                    borderLeftColor: colors.primary,
                    borderWidth: 1,
                    borderColor: dynamicStyles.borderColor,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 4,
                    elevation: 1,
                  }}
                >
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      backgroundColor: colors.primary + "15",
                      justifyContent: "center",
                      alignItems: "center",
                      marginRight: 14,
                    }}
                  >
                    <Ionicons
                      name="business"
                      size={22}
                      color={colors.primary}
                    />
                  </View>
                  {Platform.OS === "web" ? (
                    <View>
                      <Text
                        style={{
                          fontSize: 12,
                          color: dynamicStyles.textColor,
                          opacity: 0.6,
                          fontWeight: "600",
                          textTransform: "uppercase",
                          letterSpacing: 0.8,
                          marginBottom: 4,
                          textAlign: "center",
                        }}
                      >
                        Departamento
                      </Text>
                      <Text
                        style={{
                          fontSize: 16,
                          color: dynamicStyles.textColor,
                          fontWeight: "700",
                          letterSpacing: 0.2,
                          textAlign: "center",
                        }}
                      >
                        {teamData.department}
                      </Text>
                    </View>
                  ) : (
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 15,
                          color: dynamicStyles.textColor,
                          fontWeight: "700",
                          letterSpacing: 0.2,
                        }}
                      >
                        {teamData.department}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {}
            <View
              style={{
                flexDirection: "row",
                gap: 16,
                flexWrap: "wrap",
                marginBottom: 24,
              }}
            >
              {}
              <View
                style={{
                  flex: 1,
                  minWidth: 200,
                  backgroundColor: dynamicStyles.cardBackground,
                  borderRadius: 16,
                  padding: 20,
                  borderWidth: 1,
                  borderColor: dynamicStyles.borderColor,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.08,
                  shadowRadius: 8,
                  elevation: 2,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 16,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 12,
                        color: dynamicStyles.textColor,
                        opacity: 0.6,
                        fontWeight: "600",
                        textTransform: "uppercase",
                        letterSpacing: 0.8,
                        marginBottom: 8,
                      }}
                    >
                      Miembros
                    </Text>
                    <Text
                      style={{
                        fontSize: windowWidth >= 1200 ? 40 : 36,
                        fontWeight: "700",
                        color: dynamicStyles.textColor,
                        letterSpacing: -1.5,
                      }}
                    >
                      {teamData.totalMembers}
                    </Text>
                  </View>
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      backgroundColor: colors.primary + "15",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Ionicons name="people" size={24} color={colors.primary} />
                  </View>
                </View>
              </View>

              {}
              <View
                style={{
                  flex: 1,
                  minWidth: 200,
                  backgroundColor: dynamicStyles.cardBackground,
                  borderRadius: 16,
                  padding: 20,
                  borderWidth: 1,
                  borderColor: dynamicStyles.borderColor,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.08,
                  shadowRadius: 8,
                  elevation: 2,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 16,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 12,
                        color: dynamicStyles.textColor,
                        opacity: 0.6,
                        fontWeight: "600",
                        textTransform: "uppercase",
                        letterSpacing: 0.8,
                        marginBottom: 8,
                      }}
                    >
                      Activos
                    </Text>
                    <Text
                      style={{
                        fontSize: windowWidth >= 1200 ? 40 : 36,
                        fontWeight: "700",
                        color: dynamicStyles.textColor,
                        letterSpacing: -1.5,
                      }}
                    >
                      {teamData.members.filter((m) => m.activo === true).length}
                    </Text>
                  </View>
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      backgroundColor: "#4CAF50" + "15",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color="#4CAF50"
                    />
                  </View>
                </View>
              </View>

              {}
              <View
                style={{
                  flex: 1,
                  minWidth: 200,
                  backgroundColor: dynamicStyles.cardBackground,
                  borderRadius: 16,
                  padding: 20,
                  borderWidth: 1,
                  borderColor: dynamicStyles.borderColor,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.08,
                  shadowRadius: 8,
                  elevation: 2,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 16,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 12,
                        color: dynamicStyles.textColor,
                        opacity: 0.6,
                        fontWeight: "600",
                        textTransform: "uppercase",
                        letterSpacing: 0.8,
                        marginBottom: 8,
                      }}
                    >
                      Pendientes
                    </Text>
                    <Text
                      style={{
                        fontSize: windowWidth >= 1200 ? 40 : 36,
                        fontWeight: "700",
                        color: dynamicStyles.textColor,
                        letterSpacing: -1.5,
                      }}
                    >
                      {teamData.pendingActions.reduce(
                        (sum, action) => sum + action.count,
                        0,
                      )}
                    </Text>
                  </View>
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      backgroundColor: "#FF9800" + "15",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Ionicons name="time" size={24} color="#FF9800" />
                  </View>
                </View>
              </View>
            </View>

            {}
            {authState.user?.role === "admin" && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginTop: 8, marginBottom: 12 }}
                contentContainerStyle={{ flexDirection: "row", gap: 8 }}
              >
                <TouchableOpacity
                  onPress={() => setSelectedDept("all")}
                  style={[
                    {
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                      borderRadius: 12,
                      alignItems: "center",
                      justifyContent: "center",
                    },
                    selectedDept === "all"
                      ? { backgroundColor: colors.primary }
                      : {
                          backgroundColor: "transparent",
                          borderColor: dynamicStyles.borderColor,
                          borderWidth: 1,
                        },
                  ]}
                >
                  <Text
                    style={{
                      color:
                        selectedDept === "all"
                          ? theme.colors.card
                          : colors.textSecondary,
                      fontWeight: "600",
                    }}
                  >
                    Todos
                  </Text>
                </TouchableOpacity>
                {authState.user?.departamento && (
                  <TouchableOpacity
                    onPress={() =>
                      setSelectedDept(authState.user?.departamento ?? "")
                    }
                    style={[
                      {
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                        borderRadius: 12,
                        alignItems: "center",
                        justifyContent: "center",
                      },
                      selectedDept === (authState.user?.departamento ?? "")
                        ? { backgroundColor: colors.primary }
                        : {
                            backgroundColor: "transparent",
                            borderColor: dynamicStyles.borderColor,
                            borderWidth: 1,
                          },
                    ]}
                  >
                    <Text
                      style={{
                        color:
                          selectedDept === authState.user.departamento
                            ? theme.colors.card
                            : colors.textSecondary,
                        fontWeight: "600",
                      }}
                    >
                      {authState.user.departamento}
                    </Text>
                  </TouchableOpacity>
                )}
                {departments.map(
                  (dept) =>
                    dept !== authState.user?.departamento && (
                      <TouchableOpacity
                        key={dept}
                        onPress={() => setSelectedDept(dept)}
                        style={[
                          {
                            paddingHorizontal: 10,
                            paddingVertical: 6,
                            borderRadius: 12,
                            alignItems: "center",
                            justifyContent: "center",
                          },
                          selectedDept === dept
                            ? { backgroundColor: colors.primary }
                            : {
                                backgroundColor: "transparent",
                                borderColor: dynamicStyles.borderColor,
                                borderWidth: 1,
                              },
                        ]}
                      >
                        <Text
                          style={{
                            color:
                              selectedDept === dept
                                ? theme.colors.card
                                : colors.textSecondary,
                            fontWeight: "600",
                          }}
                        >
                          {dept}
                        </Text>
                      </TouchableOpacity>
                    ),
                )}
              </ScrollView>
            )}
            <View style={styles.searchFilterSectionWeb}>
              <View
                style={[
                  styles.searchContainerWeb,
                  {
                    backgroundColor: dynamicStyles.cardBackground,
                    boxShadow: theme.dark
                      ? "0 1px 3px rgba(0, 0, 0, 0.3)"
                      : "0 1px 3px rgba(0, 0, 0, 0.1)",
                  },
                ]}
              >
                {" "}
                <Ionicons
                  name="search"
                  size={20}
                  color={theme.dark ? "#aaa" : "#718096"}
                />
                <TextInput
                  style={[
                    styles.searchInputWeb,
                    { color: dynamicStyles.textColor },
                  ]}
                  placeholder="Buscar por miembro, puesto o curso..."
                  placeholderTextColor={theme.dark ? "#888" : "#999"}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>

              <View style={styles.filtersWeb}>
                {[
                  {
                    key: "all",
                    label: "Todos",
                    count: teamData.members.length,
                  },
                  {
                    key: "active",
                    label: "Activos",
                    count: teamData.members.filter((m) => m.activo === true)
                      .length,
                  },
                  {
                    key: "needs-attention",
                    label: "Atención",
                    count: teamData.members.filter(
                      (m) =>
                        m.certifications.some((c) => c.estado === "expirada") ||
                        m.certifications.some(
                          (c) =>
                            c.estado === "en_progreso" &&
                            (c.progreso || 0) < 30,
                        ) ||
                        m.evaluations.some((e) => e.estado === "pendiente") ||
                        m.activo === false,
                    ).length,
                  },
                ].map((filter) => (
                  <TouchableOpacity
                    key={filter.key}
                    style={[
                      styles.filterWeb,
                      {
                        backgroundColor:
                          activeFilter === filter.key
                            ? colors.primary
                            : dynamicStyles.cardBackground,
                        borderColor: dynamicStyles.borderColor,
                      },
                    ]}
                    onPress={() => setActiveFilter(filter.key)}
                  >
                    <Text
                      style={[
                        styles.filterTextWeb,
                        {
                          color:
                            activeFilter === filter.key
                              ? theme.colors.card
                              : theme.dark
                                ? "#ccc"
                                : "#4a5568",
                        },
                      ]}
                    >
                      {filter.label}
                    </Text>
                    <View
                      style={[
                        styles.filterCountWeb,
                        {
                          backgroundColor:
                            activeFilter === filter.key
                              ? "rgba(255,255,255,0.2)"
                              : theme.dark
                                ? "#2a2a2a"
                                : "#f7fafc",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.filterCountTextWeb,
                          {
                            color:
                              activeFilter === filter.key
                                ? theme.colors.card
                                : theme.dark
                                  ? "#ccc"
                                  : "#4a5568",
                          },
                        ]}
                      >
                        {filter.count}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {}
            <View style={styles.overviewGridWeb}>
              {}
              <View style={styles.actionsSectionWeb}>
                <Text
                  style={[
                    styles.sectionTitleWeb,
                    { color: dynamicStyles.textColor },
                  ]}
                >
                  Acciones Requeridas
                </Text>
                <View style={styles.actionsGridWeb}>
                  {teamData.pendingActions.map((action) => (
                    <TouchableOpacity
                      key={action.id}
                      style={[
                        styles.actionCardWeb,
                        {
                          backgroundColor: dynamicStyles.cardBackground,
                          boxShadow: theme.dark
                            ? "0 1px 3px rgba(0, 0, 0, 0.3)"
                            : "0 1px 3px rgba(0, 0, 0, 0.1)",
                        },
                      ]}
                      onPress={() => handleQuickAction(action)}
                    >
                      <View
                        style={[
                          styles.actionIconWeb,
                          {
                            backgroundColor:
                              getPriorityColor(action.priority) + "20",
                          },
                        ]}
                      >
                        <Ionicons
                          name={
                            action.type === "evaluation"
                              ? "clipboard"
                              : action.type === "certification"
                                ? "document-text"
                                : action.type === "progress"
                                  ? "trending-up"
                                  : "person"
                          }
                          size={24}
                          color={getPriorityColor(action.priority)}
                        />
                      </View>
                      <Text
                        style={[
                          styles.actionCountWeb,
                          { color: dynamicStyles.textColor },
                        ]}
                      >
                        {action.count}
                      </Text>
                      <Text
                        style={[
                          styles.actionDescriptionWeb,
                          { color: theme.dark ? "#ccc" : "#4a5568" },
                        ]}
                      >
                        {action.description}
                      </Text>
                      <View
                        style={[
                          styles.priorityBadgeWeb,
                          {
                            backgroundColor: getPriorityColor(action.priority),
                          },
                        ]}
                      >
                        <Text style={styles.priorityTextWeb}>
                          {action.priority === "high"
                            ? "Alta"
                            : action.priority === "medium"
                              ? "Media"
                              : "Baja"}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {}
            <View style={styles.membersSectionWeb}>
              <View style={styles.sectionHeaderWeb}>
                <Text
                  style={[
                    styles.sectionTitleWeb,
                    { color: dynamicStyles.textColor },
                  ]}
                >
                  Miembros del Equipo
                </Text>
                <Text
                  style={[
                    styles.membersCountWeb,
                    { color: theme.dark ? "#aaa" : "#718096" },
                  ]}
                >
                  {filteredMembers.length} de {teamData.totalMembers} miembros
                </Text>
              </View>

              {filteredMembers.length === 0 ? (
                <View
                  style={[
                    styles.emptyStateWeb,
                    { backgroundColor: dynamicStyles.cardBackground },
                  ]}
                >
                  <Ionicons
                    name="people-outline"
                    size={48}
                    color={theme.dark ? "#555" : "#ccc"}
                  />
                  <Text
                    style={[
                      styles.emptyTitleWeb,
                      { color: dynamicStyles.textColor },
                    ]}
                  >
                    No se encontraron miembros
                  </Text>
                  <Text
                    style={[
                      styles.emptyMessageWeb,
                      { color: theme.dark ? "#aaa" : "#718096" },
                    ]}
                  >
                    {searchQuery
                      ? "Intenta con otros términos de búsqueda"
                      : "No hay miembros para mostrar"}
                  </Text>
                </View>
              ) : (
                <View
                  style={[
                    styles.membersGridWeb,
                    windowWidth < 700 && styles.membersGridWebColumn,
                  ]}
                >
                  {filteredMembers.map((member) => (
                    <View
                      key={member.id}
                      style={[
                        styles.memberCardWeb,
                        {
                          backgroundColor: dynamicStyles.cardBackground,
                          boxShadow: theme.dark
                            ? "0 2px 4px rgba(0, 0, 0, 0.3)"
                            : "0 2px 4px rgba(0, 0, 0, 0.1)",
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.memberHeaderWeb,
                          windowWidth < 700 && styles.memberHeaderWebColumn,
                        ]}
                      >
                        <View
                          style={[
                            styles.memberAvatarWeb,
                            { backgroundColor: colors.primary + "20" },
                          ]}
                        >
                          <Ionicons
                            name="person"
                            size={24}
                            color={colors.primary}
                          />
                        </View>
                        <View style={styles.memberInfoWeb}>
                          <View style={styles.memberBasicWeb}>
                            <View
                              style={[
                                styles.statusIndicatorWeb,
                                {
                                  backgroundColor: getStatusColor(
                                    member.activo,
                                  ),
                                },
                              ]}
                            />
                            <Text
                              style={[
                                styles.memberNameWeb,
                                { color: dynamicStyles.textColor },
                              ]}
                            >
                              {member.nombre}
                            </Text>
                          </View>
                          <Text
                            style={[
                              styles.memberPositionWeb,
                              { color: theme.dark ? "#ccc" : "#4a5568" },
                            ]}
                          >
                            {member.puesto} • {member.departamento}
                          </Text>
                          <Text
                            style={[
                              styles.memberTrainingWeb,
                              { color: theme.dark ? "#aaa" : "#718096" },
                            ]}
                          >
                            Cursos: {member.certifications.length} (Activos:{" "}
                            {
                              member.certifications.filter(
                                (c) => c.estado === "activa",
                              ).length
                            }
                            , Vencidos:{" "}
                            {
                              member.certifications.filter(
                                (c) => c.estado === "expirada",
                              ).length
                            }
                            )
                          </Text>
                          <Text
                            style={[
                              styles.memberTrainingWeb,
                              { color: theme.dark ? "#aaa" : "#718096" },
                            ]}
                          >
                            Evaluaciones pendientes:{" "}
                            {
                              member.evaluations.filter(
                                (e) => e.estado === "pendiente",
                              ).length
                            }
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.memberActionsWeb,
                            windowWidth < 700 && styles.memberActionsWebMobile,
                          ]}
                        >
                          <View />
                        </View>
                      </View>
                      {}
                      <View style={styles.certificationsSectionWeb}>
                        <View style={styles.sectionHeaderCompactWeb}>
                          <Text
                            style={[
                              styles.subsectionTitleWeb,
                              { color: dynamicStyles.textColor },
                            ]}
                          >
                            Cursos ({member.certifications.length})
                          </Text>
                        </View>
                        <View style={styles.certificationsGridWeb}>
                          {member.certifications.map((cert) => (
                            <View
                              key={cert.id}
                              style={styles.certificationItemWeb}
                            >
                              <View
                                style={[
                                  styles.statusDotWeb,
                                  {
                                    backgroundColor: (() => {
                                      const status = getCourseStatus(
                                        cert.fecha_expiracion,
                                        cert.progreso,
                                      );
                                      return status.color;
                                    })(),
                                  },
                                ]}
                              />
                              <Text
                                style={[
                                  styles.certificationNameWeb,
                                  { color: dynamicStyles.textColor },
                                ]}
                                numberOfLines={2}
                                ellipsizeMode="tail"
                                accessibilityLabel={cert.nombre}
                              >
                                {cert.nombre}
                              </Text>
                              {(() => {
                                const status = getCourseStatus(
                                  cert.fecha_expiracion,
                                  cert.progreso,
                                );
                                return (
                                  <View style={styles.statusLabelContainerWeb}>
                                    {status.icon && (
                                      <Ionicons
                                        name={status.icon}
                                        size={14}
                                        color={status.color}
                                        style={{ marginRight: 4 }}
                                      />
                                    )}
                                    <Text
                                      style={[
                                        styles.statusLabelWeb,
                                        {
                                          color: status.color,
                                          fontWeight: "600",
                                        },
                                      ]}
                                    >
                                      {status.label === "Completado"
                                        ? status.label
                                        : `${status.label} ${cert.fecha_expiracion || ""}`}
                                    </Text>
                                  </View>
                                );
                              })()}
                              {cert.progreso !== undefined &&
                                cert.progreso < 100 &&
                                (() => {
                                  const status = getCourseStatus(
                                    cert.fecha_expiracion,
                                    cert.progreso,
                                  );
                                  return (
                                    <Text
                                      style={[
                                        styles.progressTextWeb,
                                        { color: status.color, marginTop: 2 },
                                      ]}
                                    >
                                      {cert.progreso}%
                                    </Text>
                                  );
                                })()}
                            </View>
                          ))}
                          {member.certifications.length === 0 && (
                            <Text
                              style={[
                                styles.noDataText,
                                { color: theme.dark ? "#aaa" : "#718096" },
                              ]}
                            >
                              Sin cursos registrados
                            </Text>
                          )}
                        </View>
                      </View>

                      {}
                      <View style={styles.evaluationsSectionWeb}>
                        <Text
                          style={[
                            styles.subsectionTitleWeb,
                            { color: dynamicStyles.textColor },
                          ]}
                        >
                          Evaluaciones ({member.evaluations.length})
                        </Text>
                        <View style={styles.evaluationsListWeb}>
                          {member.evaluations.map((evaluation) => (
                            <View
                              key={evaluation.id}
                              style={styles.evaluationItemWeb}
                            >
                              <Ionicons
                                name={
                                  evaluation.estado === "completada"
                                    ? "checkmark-circle"
                                    : evaluation.estado === "pendiente"
                                      ? "time"
                                      : "sync"
                                }
                                size={14}
                                color={getStatusColor(evaluation.estado)}
                              />
                              <Text
                                style={[
                                  styles.evaluationTypeWeb,
                                  { color: dynamicStyles.textColor },
                                ]}
                              >
                                {evaluation.tipo}
                              </Text>
                              <Text
                                style={[
                                  styles.evaluationStatusWeb,
                                  { color: getStatusColor(evaluation.estado) },
                                ]}
                              >
                                {evaluation.estado === "completada"
                                  ? "Completada"
                                  : evaluation.estado === "pendiente"
                                    ? "Pendiente"
                                    : "En progreso"}
                              </Text>
                              {evaluation.fecha && (
                                <Text
                                  style={[
                                    styles.evaluationDateWeb,
                                    { color: theme.dark ? "#aaa" : "#718096" },
                                  ]}
                                >
                                  {new Date(
                                    evaluation.fecha,
                                  ).toLocaleDateString()}
                                </Text>
                              )}
                            </View>
                          ))}
                          {member.evaluations.length === 0 && (
                            <Text
                              style={[
                                styles.noDataText,
                                { color: theme.dark ? "#aaa" : "#718096" },
                              ]}
                            >
                              Sin evaluaciones registradas
                            </Text>
                          )}
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  
  return (
    <View
      style={[
        styles.container,
        { backgroundColor: dynamicStyles.backgroundColor },
      ]}
    >
      {}

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ flexGrow: 1 }}
        nestedScrollEnabled={true}
        overScrollMode="always"
      >
        <View style={styles.content}>
          {}
          <View
            style={[
              styles.departmentHeader,
              {
                backgroundColor: dynamicStyles.cardBackground,
                boxShadow: theme.dark
                  ? "0 2px 4px rgba(0, 0, 0, 0.3)"
                  : "0 2px 4px rgba(0, 0, 0, 0.1)",
              },
            ]}
          >
            <View style={styles.departmentInfo}>
              <Text
                style={[
                  styles.departmentName,
                  { color: dynamicStyles.textColor },
                ]}
              >
                {teamData.department}
              </Text>
            </View>
            <View style={styles.memberCount}>
              <Ionicons name="people" size={24} color={colors.primary} />
              <Text style={[styles.memberCountText, { color: colors.primary }]}>
                {teamData.totalMembers}
              </Text>
              <Text
                style={[
                  styles.memberCountLabel,
                  { color: theme.dark ? "#aaa" : "#718096" },
                ]}
              >
                Miembros
              </Text>
            </View>
          </View>

          {}
          <View
            style={[
              styles.searchContainer,
              {
                backgroundColor: dynamicStyles.cardBackground,
                boxShadow: theme.dark
                  ? "0 1px 3px rgba(0, 0, 0, 0.3)"
                  : "0 1px 3px rgba(0, 0, 0, 0.1)",
              },
            ]}
          >
            <Ionicons
              name="search"
              size={20}
              color={theme.dark ? "#aaa" : "#718096"}
            />
            <TextInput
              style={[styles.searchInput, { color: dynamicStyles.textColor }]}
              placeholder="Buscar por miembro o curso..."
              placeholderTextColor={theme.dark ? "#888" : "#999"}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filtersMobile}
          >
            <View style={styles.filtersContainer}>
              {["all", "active", "needs-attention"].map((filter) => (
                <TouchableOpacity
                  key={filter}
                  style={[
                    styles.filterMobile,
                    {
                      backgroundColor:
                        activeFilter === filter
                          ? colors.primary
                          : dynamicStyles.cardBackground,
                      borderColor: dynamicStyles.borderColor,
                    },
                  ]}
                  onPress={() => setActiveFilter(filter)}
                >
                  <Text
                    style={[
                      styles.filterTextMobile,
                      {
                        color:
                          activeFilter === filter
                            ? theme.colors.card
                            : theme.dark
                              ? "#ccc"
                              : "#4a5568",
                      },
                    ]}
                  >
                    {filter === "all"
                      ? "Todos"
                      : filter === "active"
                        ? "Activos"
                        : "Atención"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {}
          <View style={styles.section}>
            <Text
              style={[styles.sectionTitle, { color: dynamicStyles.textColor }]}
            >
              Acciones Requeridas
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.actionsScroll}
            >
              <View style={styles.actionsContainer}>
                {teamData.pendingActions.map((action) => (
                  <TouchableOpacity
                    key={action.id}
                    style={[
                      styles.actionCard,
                      {
                        backgroundColor: dynamicStyles.cardBackground,
                        boxShadow: theme.dark
                          ? "0 1px 3px rgba(0, 0, 0, 0.3)"
                          : "0 1px 3px rgba(0, 0, 0, 0.1)",
                      },
                    ]}
                    onPress={() => handleQuickAction(action)}
                  >
                    <View
                      style={[
                        styles.actionIcon,
                        {
                          backgroundColor:
                            getPriorityColor(action.priority) + "20",
                        },
                      ]}
                    >
                      <Ionicons
                        name={
                          action.type === "evaluation"
                            ? "clipboard"
                            : action.type === "certification"
                              ? "document-text"
                              : action.type === "progress"
                                ? "trending-up"
                                : "person"
                        }
                        size={20}
                        color={getPriorityColor(action.priority)}
                      />
                    </View>
                    <Text
                      style={[
                        styles.actionCount,
                        { color: dynamicStyles.textColor },
                      ]}
                    >
                      {action.count}
                    </Text>
                    <Text
                      style={[
                        styles.actionDescription,
                        { color: theme.dark ? "#ccc" : "#4a5568" },
                      ]}
                    >
                      {action.description}
                    </Text>
                    <View
                      style={[
                        styles.priorityBadge,
                        { backgroundColor: getPriorityColor(action.priority) },
                      ]}
                    >
                      <Text style={styles.priorityText}>
                        {action.priority === "high"
                          ? "Alta"
                          : action.priority === "medium"
                            ? "Media"
                            : "Baja"}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: dynamicStyles.textColor },
                ]}
              >
                Miembros del Equipo
              </Text>
              <Text
                style={[
                  styles.membersCount,
                  { color: theme.dark ? "#aaa" : "#718096" },
                ]}
              >
                {filteredMembers.length} de {teamData.totalMembers}
              </Text>
            </View>

            {filteredMembers.length === 0 ? (
              <View
                style={[
                  styles.emptyState,
                  { backgroundColor: dynamicStyles.cardBackground },
                ]}
              >
                <Ionicons
                  name="people-outline"
                  size={48}
                  color={theme.dark ? "#555" : "#ccc"}
                />
                <Text
                  style={[
                    styles.emptyTitle,
                    { color: dynamicStyles.textColor },
                  ]}
                >
                  No se encontraron miembros
                </Text>
                <Text
                  style={[
                    styles.emptyMessage,
                    { color: theme.dark ? "#aaa" : "#718096" },
                  ]}
                >
                  {searchQuery
                    ? "Intenta con otros términos de búsqueda"
                    : "No hay miembros para mostrar"}
                </Text>
              </View>
            ) : (
              <View>
                {filteredMembers.map((member) => (
                  <View
                    key={member.id}
                    style={[
                      styles.memberCard,
                      { backgroundColor: dynamicStyles.cardBackground },
                    ]}
                  >
                    <View style={styles.memberHeader}>
                      <View style={styles.memberInfo}>
                        <Text
                          style={[
                            styles.memberName,
                            { color: dynamicStyles.textColor },
                          ]}
                        >
                          {member.nombre}
                        </Text>
                        <Text
                          style={[
                            styles.memberPosition,
                            { color: theme.dark ? "#ccc" : "#4a5568" },
                          ]}
                        >
                          {member.puesto} • {member.departamento}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.certificationsSection}>
                      <Text
                        style={[
                          styles.subsectionTitle,
                          { color: dynamicStyles.textColor },
                        ]}
                      >
                        Cursos ({member.certifications.length})
                      </Text>
                      <View style={styles.certificationsList}>
                        {member.certifications.map((cert) => {
                          const status = getCourseStatus(
                            cert.fecha_expiracion,
                            cert.progreso,
                          );
                          return (
                            <View
                              key={cert.id}
                              style={styles.certificationItem}
                            >
                              {status.icon ? (
                                <Ionicons
                                  name={status.icon}
                                  size={14}
                                  color={status.color}
                                />
                              ) : (
                                <Ionicons
                                  name="time"
                                  size={14}
                                  color={status.color}
                                />
                              )}
                              <Text
                                style={[
                                  styles.certificationName,
                                  { color: dynamicStyles.textColor },
                                ]}
                              >
                                {cert.nombre}
                              </Text>
                              <Text
                                style={[
                                  styles.certificationExpiry,
                                  { color: status.color, fontWeight: "600" },
                                ]}
                              >
                                {status.label === "Completado"
                                  ? status.label
                                  : `${status.label} ${cert.fecha_expiracion || ""}`}
                              </Text>
                              {cert.progreso !== undefined && (
                                <Text
                                  style={[
                                    styles.certificationProgress,
                                    { color: status.color },
                                  ]}
                                >
                                  {cert.progreso}%
                                </Text>
                              )}
                            </View>
                          );
                        })}
                        {member.certifications.length === 0 && (
                          <Text
                            style={[
                              styles.noDataText,
                              { color: theme.dark ? "#aaa" : "#718096" },
                            ]}
                          >
                            Sin cursos
                          </Text>
                        )}
                      </View>
                    </View>

                    {}
                    {member.evaluations.length > 0 && (
                      <View style={styles.evaluationsSection}>
                        <Text
                          style={[
                            styles.subsectionTitle,
                            { color: dynamicStyles.textColor },
                          ]}
                        >
                          Evaluaciones ({member.evaluations.length})
                        </Text>
                        {member.evaluations.map((evaluation) => (
                          <View
                            key={evaluation.id}
                            style={styles.evaluationItem}
                          >
                            <Ionicons
                              name={
                                evaluation.estado === "completada"
                                  ? "checkmark-circle"
                                  : "time"
                              }
                              size={14}
                              color={getStatusColor(evaluation.estado)}
                            />
                            <Text
                              style={[
                                styles.evaluationType,
                                { color: dynamicStyles.textColor },
                              ]}
                            >
                              {evaluation.tipo}
                            </Text>
                            <Text
                              style={[
                                styles.evaluationStatus,
                                { color: getStatusColor(evaluation.estado) },
                              ]}
                            >
                              {evaluation.estado === "completada"
                                ? "Completada"
                                : "Pendiente"}
                            </Text>
                            {evaluation.fecha && (
                              <Text
                                style={[
                                  styles.evaluationDate,
                                  { color: theme.dark ? "#aaa" : "#718096" },
                                ]}
                              >
                                {new Date(
                                  evaluation.fecha,
                                ).toLocaleDateString()}
                              </Text>
                            )}
                          </View>
                        ))}
                      </View>
                    )}

                    {}
                    <View style={styles.trainingSection}>
                      <Text
                        style={[
                          styles.trainingText,
                          { color: theme.dark ? "#aaa" : "#718096" },
                        ]}
                      >
                        Cursos: {member.certifications.length} (Activos:{" "}
                        {
                          member.certifications.filter(
                            (c) => c.estado === "activa",
                          ).length
                        }
                        , Vencidos:{" "}
                        {
                          member.certifications.filter(
                            (c) => c.estado === "expirada",
                          ).length
                        }
                        )
                      </Text>
                      <Text
                        style={[
                          styles.trainingText,
                          { color: theme.dark ? "#aaa" : "#718096" },
                        ]}
                      >
                        Evaluaciones pendientes:{" "}
                        {
                          member.evaluations.filter(
                            (e) => e.estado === "pendiente",
                          ).length
                        }
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>

          <View style={styles.footerSpace} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  
  webContainer: {
    flex: 1,
  },
  webActionsBar: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderBottomWidth: 1,
    
  },
  headerButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    
  },
  headerButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  webContent: {
    flex: 1,
  },
  webContentInner: {
    maxWidth: 1200,
    width: "100%",
    alignSelf: "center",
    padding: 24,
  },
  departmentHeaderWeb: {
    padding: 20,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    alignSelf: "center",
    width: "100%",
    maxWidth: 1200,
  },
  departmentInfoWeb: {
    flex: 1,
    alignItems: "center",
    width: "100%",
  },
  departmentNameWeb: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 6,
    textAlign: "center",
    width: "100%",
  },
  supervisorWeb: {
    fontSize: 16,
    marginBottom: 0,
    height: 0,
    opacity: 0,
    overflow: "hidden",
  },
  statsWeb: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: "100%",
  },
  statWeb: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 6,
  },
  statNumberWeb: {
    fontSize: 20,
    fontWeight: "700",
  },
  statNumberLarge: {
    fontSize: 24,
    fontWeight: "700",
  },

  statLabelWeb: {
    fontSize: 12,
    marginTop: 2,
    color: "#6b7280",
  },
  searchFilterSectionWeb: {
    marginBottom: 24,
  },
  searchContainerWeb: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  searchInputWeb: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
  },
  filtersWeb: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  filterWeb: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 12,
    marginBottom: 8,
  },
  filterTextWeb: {
    fontSize: 14,
    fontWeight: "500",
  },
  filterCountWeb: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  filterCountTextWeb: {
    fontSize: 12,
    fontWeight: "600",
  },
  overviewGridWeb: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  actionsSectionWeb: {
    flex: 1,
    minWidth: 300,
  },
  alertsSectionWeb: {
    flex: 1,
    minWidth: 250,
  },
  sectionTitleWeb: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  actionsGridWeb: {
    gap: 16,
  },
  actionCardWeb: {
    padding: 12,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  actionIconWeb: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  actionCountWeb: {
    fontSize: 20,
    fontWeight: "bold",
    marginRight: 12,
  },
  actionDescriptionWeb: {
    fontSize: 14,
    flex: 1,
  },
  priorityBadgeWeb: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  priorityTextWeb: {
    fontSize: 10,
    color: "white",
    fontWeight: "600",
  },
  alertsListWeb: {
    gap: 12,
  },
  alertCardWeb: {
    padding: 14,
    borderRadius: 8,
    flexDirection: "column",
    gap: 10,
    width: "100%",
  },
  urgentAlertWeb: {
    borderLeftWidth: 4,
    borderLeftColor: "#e53e3e",
  },
  warningAlertWeb: {
    borderLeftWidth: 4,
    borderLeftColor: "#d69e2e",
  },
  alertContentWeb: {
    width: "100%",
  },
  alertMessageWeb: {
    fontSize: 13,
    lineHeight: 18,
  },
  alertMemberWeb: {
    fontSize: 12,
    flex: 1,
  },
  alertActionWeb: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: "stretch",
    alignItems: "center",
  },
  alertActionTextWeb: {
    color: "white",
    fontSize: 13,
    fontWeight: "600",
  },
  membersSectionWeb: {
    marginBottom: 24,
  },
  sectionHeaderWeb: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  membersCountWeb: {
    fontSize: 14,
    fontWeight: "500",
  },
  emptyStateWeb: {
    padding: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitleWeb: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessageWeb: {
    fontSize: 14,
    textAlign: "center",
  },
  membersGridWeb: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "stretch",
    gap: 20,
  },
  membersGridWebColumn: {
    flexDirection: "column",
    flexWrap: "nowrap",
    gap: 12,
  },
  memberCardWeb: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    width: "48%",
    minWidth: 260,
    alignSelf: "stretch",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  memberCardWebFull: {
    width: "100%",
  },
  memberCardWebHalf: {
    width: "48%",
    minWidth: 260,
  },
  memberHeaderWeb: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  memberHeaderWebColumn: {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 8,
  },
  memberActionsWebMobile: {
    alignSelf: "flex-end",
    marginTop: 8,
    flexDirection: "row",
    gap: 8,
  },
  memberAvatarWeb: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  memberInfoWeb: {
    flex: 1,
  },
  memberBasicWeb: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    flexWrap: "wrap",
  },
  statusIndicatorWeb: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  memberNameWeb: {
    fontSize: 16,
    fontWeight: "bold",
  },
  memberPositionWeb: {
    fontSize: 14,
    marginBottom: 4,
    flexShrink: 1,
  },
  memberTrainingWeb: {
    fontSize: 12,
    fontStyle: "italic",
  },
  memberActionsWeb: {
    flexDirection: "row",
    
  },
  actionButtonWeb: {
    width: 32,
    height: 32,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  certificationsSectionWeb: {
    marginBottom: 16,
  },
  sectionHeaderCompactWeb: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    flexWrap: "wrap",
    gap: 8,
  },
  subsectionTitleWeb: {
    fontSize: 14,
    fontWeight: "bold",
  },
  legendWeb: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  legendItemWeb: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  legendDotWeb: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  legendTextWeb: {
    fontSize: 10,
    fontWeight: "500",
  },
  certificationsGridWeb: {
    flexDirection: "column",
    gap: 8,
  },
  certificationItemWeb: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    width: "100%",
    overflow: "hidden",
  },
  statusDotWeb: {
    width: 8,
    height: 8,
    borderRadius: 4,
    flexShrink: 0,
  },
  certificationNameWeb: {
    fontSize: 12,
    fontWeight: "500",
    flex: 1,
    minWidth: 0,
    flexWrap: "wrap",
    lineHeight: 16,
  },
  statusLabelContainerWeb: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  statusLabelWeb: {
    fontSize: 11,
    fontWeight: "600",
  },
  certificationExpiryWeb: {
    fontSize: 11,
    fontWeight: "500",
    flexShrink: 0,
  },
  progressSectionWeb: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginLeft: "auto",
  },
  progressBarWeb: {
    width: 48,
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFillWeb: {
    height: "100%",
    borderRadius: 2,
  },
  progressTextWeb: {
    fontSize: 11,
    fontWeight: "500",
  },
  evaluationsSectionWeb: {
    marginBottom: 16,
  },
  evaluationsListWeb: {
    gap: 8,
  },
  evaluationItemWeb: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  evaluationTypeWeb: {
    fontSize: 12,
    flex: 1,
  },
  evaluationStatusWeb: {
    fontSize: 11,
    fontWeight: "500",
  },
  evaluationDateWeb: {
    fontSize: 11,
  },
  noDataText: {
    fontSize: 12,
    fontStyle: "italic",
    marginLeft: 24,
  },

  
  container: {
    flex: 1,
  },
  mobileHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
  },
  backButtonMobile: {
    padding: 4,
  },
  mobileTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 4,
  },
  departmentHeader: {
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  departmentInfo: {
    flex: 1,
  },
  departmentName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  supervisor: {
    fontSize: 14,
    height: 0,
    opacity: 0,
    overflow: "hidden",
  },
  memberCount: {
    alignItems: "center",
  },
  memberCountText: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 4,
  },
  memberCountLabel: {
    fontSize: 12,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
  },
  filtersMobile: {
    marginBottom: 16,
  },
  filtersContainer: {
    flexDirection: "row",
    gap: 8,
  },
  filterMobile: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  filterTextMobile: {
    fontSize: 14,
    fontWeight: "500",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  membersCount: {
    fontSize: 14,
    fontWeight: "500",
  },
  emptyState: {
    padding: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyMessage: {
    fontSize: 14,
    textAlign: "center",
  },
  actionsScroll: {
    marginHorizontal: -16,
  },
  actionsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 12,
  },
  actionCard: {
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    minWidth: 120,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  actionCount: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 12,
    textAlign: "center",
    marginBottom: 8,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  priorityText: {
    fontSize: 10,
    color: "white",
    fontWeight: "500",
  },
  alertCard: {
    padding: 16,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  urgentAlert: {
    borderLeftWidth: 4,
    borderLeftColor: "#e53e3e",
  },
  alertContent: {
    flex: 1,
    marginLeft: 12,
    marginRight: 12,
  },
  alertMessage: {
    fontSize: 14,
    marginBottom: 4,
  },
  alertMember: {
    fontSize: 12,
  },
  alertAction: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  alertActionText: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
  },
  memberCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  memberHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  memberInfo: {
    flex: 1,
  },
  memberBasic: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  memberName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  memberPosition: {
    fontSize: 14,
  },
  memberTraining: {
    fontSize: 12,
    fontStyle: "italic",
  },
  memberActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  certificationsSection: {
    marginBottom: 16,
  },
  subsectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 12,
  },
  certificationsList: {
    gap: 8,
  },
  certificationItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  certificationName: {
    fontSize: 12,
    fontWeight: "500",
    flex: 1,
  },
  certificationExpiry: {
    fontSize: 11,
    fontWeight: "500",
  },
  certificationProgress: {
    fontSize: 11,
    fontWeight: "500",
  },
  evaluationsSection: {
    marginBottom: 16,
  },
  evaluationItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  evaluationType: {
    fontSize: 12,
    flex: 1,
  },
  evaluationStatus: {
    fontSize: 11,
    fontWeight: "500",
  },
  evaluationDate: {
    fontSize: 11,
  },
  trainingSection: {
    borderTopWidth: 1,
    borderTopColor: "#f7fafc",
    paddingTop: 12,
  },
  trainingText: {
    fontSize: 12,
    fontStyle: "italic",
  },
  footerSpace: {
    height: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    textAlign: "center",
  },
});
