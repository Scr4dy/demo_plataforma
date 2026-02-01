
import { supabase } from "../config/supabase";
import type {
  DashboardData,
  Course,
  Certificate,
  AlertItem,
} from "../types/dashboard.types";
import { getCourseDurationHours } from "../utils/courseHelpers";
import { AppConfig } from "../config/appConfig";

class DashboardService {
  
  async getDashboardData(): Promise<DashboardData> {
    
    if (AppConfig.useMockData) {
      
      const { mockDataService } = await import("./mockDataService");

      
      const { supabase } = await import("../config/supabase");
      const {
        data: { user },
      } = await supabase.auth.getUser();

      
      let userRole = "Empleado";
      let userId = 3;
      let userName = "María E.";

      if (user?.email === "admin@demo.com") {
        userRole = "Administrador";
        userId = 1;
        userName = "Admin";
      } else if (user?.email === "instructor@demo.com") {
        userRole = "Instructor";
        userId = 2;
        userName = "Carlos I.";
      }

      const mockStats = await mockDataService.getDashboardStats(
        userId,
        userRole,
      );
      const mockCourses = await mockDataService.getCourses();

      
      if (userRole === "Administrador") {
        const allUsers = await mockDataService.getAllUsers();
        const allCertificates = await mockDataService.getUserCertificates(3); 

        return {
          name: userName,
          progress: 100,
          stats: {
            totalCourses: mockStats.totalCourses,
            completedCourses: allCertificates.length,
            inProgressCourses: mockStats.totalCourses - allCertificates.length,
            pendingCourses: 0,
            averageProgress: 75,
          },
          alerts: [
            {
              id: "1",
              title: "Sistema activo",
              type: "info",
              message: `${mockStats.totalUsers} usuarios activos en el sistema`,
              timestamp: new Date(),
              read: false,
              priority: "low",
            },
          ],
          courses: mockCourses.map((course) => ({
            id: String(course.id),
            id_curso: String(course.id),
            title: course.title,
            titulo: course.title,
            progress: 0,
            progreso: 0,
            status: "Pendiente",
            estado: "activo",
            category: course.category,
            categoria: course.category,
            duration: `${course.duration_hours}h`,
            duracion: `${course.duration_hours}h`,
            description: course.description,
            descripcion: course.description,
            instructor: course.instructor_name,
            id_instructor: String(course.instructor_id),
          })),
          certificates: [],
          teamAlerts: [],
          quickActions: [
            {
              id: 1,
              title: "Gestionar Cursos",
              icon: "school",
            },
            {
              id: 2,
              title: "Ver Usuarios",
              icon: "people",
            },
            {
              id: 3,
              title: "Reportes",
              icon: "bar-chart",
            },
          ],
        };
      }

      
      if (userRole === "Instructor") {
        const instructorCourses = mockCourses.filter(
          (c) => c.instructor_id === userId,
        );

        return {
          name: userName,
          progress: 85,
          stats: {
            totalCourses: mockStats.totalCourses,
            completedCourses: 0,
            inProgressCourses: mockStats.totalCourses,
            pendingCourses: 0,
            averageProgress: mockStats.averageProgress,
          },
          alerts: [
            {
              id: "1",
              title: "Estudiantes activos",
              type: "info",
              message: `${mockStats.totalStudents} estudiantes en tus cursos`,
              timestamp: new Date(),
              read: false,
              priority: "low",
            },
          ],
          courses: instructorCourses.map((course) => ({
            id: String(course.id),
            id_curso: String(course.id),
            title: course.title,
            titulo: course.title,
            progress: 65,
            progreso: 65,
            status: "En Progreso",
            estado: "activo",
            category: course.category,
            categoria: course.category,
            duration: `${course.duration_hours}h`,
            duracion: `${course.duration_hours}h`,
            description: course.description,
            descripcion: course.description,
            instructor: course.instructor_name,
            id_instructor: String(course.instructor_id),
          })),
          certificates: [],
          teamAlerts: [],
          quickActions: [
            {
              id: 1,
              title: "Mis Cursos",
              icon: "school",
            },
            {
              id: 2,
              title: "Estudiantes",
              icon: "people",
            },
            {
              id: 3,
              title: "Evaluaciones",
              icon: "clipboard",
            },
          ],
        };
      }

      
      const mockProgress = await mockDataService.getUserProgress(userId);
      const courses: Course[] = mockProgress
        .map((p) => {
          const course = mockCourses.find((c) => c.id === p.course_id);
          if (!course) return null;

          return {
            id: String(course.id),
            id_curso: String(course.id),
            title: course.title,
            titulo: course.title,
            progress: p.progress_percentage,
            progreso: p.progress_percentage,
            status: p.completed
              ? "Completado"
              : p.progress_percentage > 0
                ? "En Progreso"
                : "Pendiente",
            estado: p.completed ? "completado" : "activo",
            category: course.category,
            categoria: course.category,
            duration: `${course.duration_hours}h`,
            duracion: `${course.duration_hours}h`,
            description: course.description,
            descripcion: course.description,
            instructor: course.instructor_name,
            id_instructor: String(course.instructor_id),
            fecha_ultima_actividad: p.last_accessed,
          };
        })
        .filter(Boolean) as Course[];

      return {
        name: userName,
        progress: Math.round(mockStats.averageProgress),
        stats: {
          totalCourses: mockStats.enrolledCourses,
          completedCourses: mockStats.completedCourses,
          inProgressCourses:
            mockStats.enrolledCourses - mockStats.completedCourses,
          pendingCourses: 0,
          averageProgress: mockStats.averageProgress,
        },
        alerts: [
          {
            id: "1",
            title: "Cursos en progreso",
            type: "info",
            message: `Tienes ${mockStats.enrolledCourses - mockStats.completedCourses} curso(s) en progreso. ¡Continúa aprendiendo!`,
            timestamp: new Date(),
            read: false,
            priority: "low",
          },
        ],
        courses,
        certificates: [],
        teamAlerts: [],
        quickActions: [
          {
            id: 1,
            title: "Continuar Curso",
            icon: "play-circle",
          },
          {
            id: 2,
            title: "Ver Certificados",
            icon: "card-membership",
          },
          {
            id: 3,
            title: "Mi Progreso",
            icon: "trending-up",
          },
        ],
      };
    }

    try {
      
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        
        throw new Error("Usuario no autenticado");
      }

      if (!user) {
        
        throw new Error("Usuario no autenticado");
      }
      
      const { data: userData, error: userDataError } = await supabase
        .from("usuarios")
        .select(
          "id_usuario, nombre, apellido_paterno, apellido_materno, rol, departamento",
        )
        .eq("auth_id", user.id)
        .maybeSingle();

      if (userDataError) {
        
        throw new Error("No se encontraron datos del usuario");
      }

      if (!userData) {
        
        throw new Error("No se encontraron datos del usuario");
      }

      const userId = userData.id_usuario;
      const userName = `${userData.nombre} ${userData.apellido_paterno.charAt(0)}.`;

      
      const { data: inscripciones, error: inscripcionesError } = await supabase
        .from("inscripciones")
        .select(
          `
          id_inscripcion,
          id_curso,
          estado,
          progreso,
          fecha_inscripcion,
          fecha_completado,
          fecha_ultima_actividad,
          nota_final,
          cursos:id_curso (
            id_curso,
            titulo,
            descripcion,
            duracion,
            fecha_inicio,
            fecha_fin,
            activo,
            categoria,
            fecha_creacion,
            id_instructor,
            usuarios:id_instructor (
              nombre,
              apellido_paterno,
              apellido_materno
            )
          )
        `,
        )
        .eq("id_empleado", userId)
        .is("deleted_at", null)
        .order("fecha_ultima_actividad", { ascending: false });

      if (inscripcionesError) {
        
      }
      
      const courses: Course[] = (inscripciones || []).map((insc: any) => {
        const curso = insc.cursos;
        let status: "Completado" | "En Progreso" | "Pendiente" = "Pendiente";

        if (insc.estado === "completado") status = "Completado";
        else if (insc.progreso > 0) status = "En Progreso";

        
        const instructor = curso.usuarios
          ? `${curso.usuarios.nombre} ${curso.usuarios.apellido_paterno}`
          : "";

        return {
          id: curso.id_curso,
          id_curso: curso.id_curso,
          title: curso.titulo,
          titulo: curso.titulo,
          progress: insc.progreso || 0,
          progreso: insc.progreso || 0,
          status: status,
          estado: insc.estado,
          category: curso.categoria || "Capacitación",
          categoria: curso.categoria,
          duration: `${getCourseDurationHours(curso)}h`,
          duracion: curso.duracion,
          expires: curso.fecha_fin,
          fecha_fin: curso.fecha_fin,
          fecha_inicio: curso.fecha_inicio,
          fecha_creacion: curso.fecha_creacion,
          description: curso.descripcion,
          descripcion: curso.descripcion,
          instructor: instructor,
          id_instructor: curso.id_instructor,
          nota_final: insc.nota_final,
          fecha_completado: insc.fecha_completado,
          fecha_ultima_actividad: insc.fecha_ultima_actividad,
        };
      });

      
      const totalCourses = courses.length;
      const completedCourses = courses.filter(
        (c) => c.status === "Completado",
      ).length;
      const inProgressCourses = courses.filter(
        (c) => c.status === "En Progreso",
      ).length;
      const pendingCourses = courses.filter(
        (c) => c.status === "Pendiente",
      ).length;
      const averageProgress =
        totalCourses > 0
          ? courses.reduce((sum, c) => sum + (c.progress ?? 0), 0) /
            totalCourses
          : 0;

      
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      const expiringSoon = courses.filter((c) => {
        if (!c.expires) return false;
        const expireDate = new Date(c.expires);
        return expireDate <= thirtyDaysFromNow && c.status !== "Completado";
      }).length;

      
      const certificates: Certificate[] = courses
        .filter((c) => c.status === "Completado")
        .map((c, index) => ({
          id: index + 1,
          title: c.title ?? "",
          status: "Vigente",
          issueDate: new Date().toISOString().split("T")[0],
          validUntil: c.expires,
        }));

      
      const alerts: AlertItem[] = [];

      courses.forEach((course) => {
        if (course.expires && course.status !== "Completado") {
          const daysUntil = this.getDaysUntilExpiry(course.expires);
          if (daysUntil <= 30 && daysUntil > 0) {
            alerts.push({
              id: String(alerts.length + 1),
              title: `Vencimiento: ${course.title}`,
              type: daysUntil <= 7 ? "warning" : "info",
              message: `El curso "${course.title}" vence en ${daysUntil} días.`,
              timestamp: new Date(),
              read: false,
              priority: daysUntil <= 7 ? "high" : "medium",
            });
          }
        }
      });

      
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      if (inProgressCourses > 0 && alerts.length < 3) {
        alerts.push({
          id: String(alerts.length + 1),
          title: "Cursos en progreso",
          type: "info",
          message: `Tienes ${inProgressCourses} curso(s) en progreso. ¡Continúa aprendiendo!`,
          timestamp: new Date(),
          read: false,
          priority: "low",
        });
      }

      
      const overallProgress = Math.round(averageProgress);

      const dashboardData = {
        name: userName,
        progress: overallProgress,
        stats: {
          totalCourses,
          completedCourses,
          inProgressCourses,
          pendingCourses,
          averageProgress: Math.round(averageProgress * 100) / 100,
          expiringSoon,
        },
        alerts: alerts.slice(0, 5), 
        courses,
        certificates,
        teamAlerts: [], 
        quickActions: [
          {
            id: 1,
            title: "Continuar Curso",
            action: "continue_course",
            icon: "play-circle",
          },
          {
            id: 2,
            title: "Ver Certificados",
            action: "view_certificates",
            icon: "card-membership",
          },
          {
            id: 3,
            title: "Mi Progreso",
            action: "view_progress",
            icon: "trending-up",
          },
        ],
      };
      return dashboardData;
    } catch (error: any) {
      
      
      throw new Error(error.message || "Error al cargar datos del dashboard");
    }
  }

  
  private getDaysUntilExpiry(expiryDate: string): number {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }
}

export const dashboardService = new DashboardService();
