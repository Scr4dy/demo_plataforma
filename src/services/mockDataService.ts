

export interface MockUser {
  id: number;
  email: string;
  password: string;
  full_name: string;
  role: "Administrador" | "Instructor" | "Empleado";
  department?: string;
  telefono?: string;
  numeroEmpleado?: string;
  puesto?: string;
  avatar_url?: string;
  created_at: string;
}

export interface MockCourse {
  id: number;
  title: string;
  description: string;
  category: string;
  instructor_id: number;
  instructor_name: string;
  duration_hours: number;
  thumbnail_url?: string;
  created_at: string;
  is_published: boolean;
}

export interface MockModule {
  id: number;
  course_id: number;
  title: string;
  description: string;
  order_index: number;
  created_at: string;
}

export interface MockContent {
  id: number;
  module_id: number;
  title: string;
  type: "video" | "pdf" | "quiz" | "text";
  content_url?: string;
  content_text?: string;
  duration_minutes?: number;
  order_index: number;
  created_at: string;
}

export interface MockProgress {
  id: number;
  user_id: number;
  course_id: number;
  progress_percentage: number;
  completed: boolean;
  last_accessed: string;
  completed_contents: number[];
}

export interface MockCertificate {
  id: number;
  user_id: number;
  course_id: number;
  issued_date: string;
  certificate_url?: string;
}

class MockDataService {
  
  private mockUsers: MockUser[] = [
    {
      id: 1,
      email: "admin@demo.com",
      password: "demo123",
      full_name: "Admin Demo",
      role: "Administrador",
      department: "Administración",
      telefono: "+52 55 1234 5678",
      numeroEmpleado: "ADM001",
      puesto: "Administrador del Sistema",
      created_at: "2024-01-01T00:00:00Z",
    },
    {
      id: 2,
      email: "instructor@demo.com",
      password: "demo123",
      full_name: "Carlos Instructor",
      role: "Instructor",
      department: "Capacitación",
      telefono: "+52 55 2345 6789",
      numeroEmpleado: "INS001",
      puesto: "Instructor de Capacitación",
      created_at: "2024-01-15T00:00:00Z",
    },
    {
      id: 3,
      email: "empleado@demo.com",
      password: "demo123",
      full_name: "María Empleado",
      role: "Empleado",
      department: "Ventas",
      telefono: "+52 55 3456 7890",
      numeroEmpleado: "EMP001",
      puesto: "Ejecutivo de Ventas",
      created_at: "2024-02-01T00:00:00Z",
    },
  ];

  
  private mockCourses: MockCourse[] = [
    {
      id: 1,
      title: "Introducción a la Seguridad Industrial",
      description:
        "Curso completo sobre normas y prácticas de seguridad en el trabajo.",
      category: "Seguridad",
      instructor_id: 2,
      instructor_name: "Carlos Instructor",
      duration_hours: 8,
      created_at: "2024-01-10T00:00:00Z",
      is_published: true,
    },
    {
      id: 2,
      title: "Atención al Cliente Excelente",
      description:
        "Técnicas y estrategias para brindar un servicio excepcional.",
      category: "Ventas",
      instructor_id: 2,
      instructor_name: "Carlos Instructor",
      duration_hours: 6,
      created_at: "2024-01-20T00:00:00Z",
      is_published: true,
    },
    {
      id: 3,
      title: "Gestión de Proyectos Ágiles",
      description: "Metodologías ágiles aplicadas a la gestión de proyectos.",
      category: "Gestión",
      instructor_id: 2,
      instructor_name: "Carlos Instructor",
      duration_hours: 10,
      created_at: "2024-02-01T00:00:00Z",
      is_published: true,
    },
    {
      id: 4,
      title: "Excel Avanzado para Negocios",
      description: "Domina Excel con fórmulas, tablas dinámicas y macros.",
      category: "Tecnología",
      instructor_id: 2,
      instructor_name: "Carlos Instructor",
      duration_hours: 12,
      created_at: "2024-02-10T00:00:00Z",
      is_published: true,
    },
    {
      id: 5,
      title: "Liderazgo y Trabajo en Equipo",
      description: "Desarrolla habilidades de liderazgo efectivo.",
      category: "Liderazgo",
      instructor_id: 2,
      instructor_name: "Carlos Instructor",
      duration_hours: 8,
      created_at: "2024-02-15T00:00:00Z",
      is_published: true,
    },
  ];

  
  private mockModules: MockModule[] = [
    
    {
      id: 1,
      course_id: 1,
      title: "Fundamentos de Seguridad",
      description: "Conceptos básicos y normativas",
      order_index: 1,
      created_at: "2024-01-10T00:00:00Z",
    },
    {
      id: 2,
      course_id: 1,
      title: "Equipos de Protección Personal",
      description: "Uso correcto de EPP",
      order_index: 2,
      created_at: "2024-01-10T00:00:00Z",
    },
    {
      id: 3,
      course_id: 1,
      title: "Prevención de Riesgos",
      description: "Identificación y mitigación de riesgos",
      order_index: 3,
      created_at: "2024-01-10T00:00:00Z",
    },
    
    {
      id: 4,
      course_id: 2,
      title: "Principios de Atención al Cliente",
      description: "Fundamentos del servicio",
      order_index: 1,
      created_at: "2024-01-20T00:00:00Z",
    },
    {
      id: 5,
      course_id: 2,
      title: "Comunicación Efectiva",
      description: "Técnicas de comunicación",
      order_index: 2,
      created_at: "2024-01-20T00:00:00Z",
    },
    
    {
      id: 6,
      course_id: 3,
      title: "Introducción a Metodologías Ágiles",
      description: "Scrum, Kanban y más",
      order_index: 1,
      created_at: "2024-02-01T00:00:00Z",
    },
  ];

  
  private mockContents: MockContent[] = [
    
    {
      id: 1,
      module_id: 1,
      title: "Introducción a la Seguridad Industrial",
      type: "video",
      content_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      duration_minutes: 15,
      order_index: 1,
      created_at: "2024-01-10T00:00:00Z",
    },
    {
      id: 2,
      module_id: 1,
      title: "Normativas de Seguridad",
      type: "pdf",
      content_url: "https://example.com/normativas.pdf",
      duration_minutes: 20,
      order_index: 2,
      created_at: "2024-01-10T00:00:00Z",
    },
    {
      id: 3,
      module_id: 1,
      title: "Evaluación Módulo 1",
      type: "quiz",
      duration_minutes: 10,
      order_index: 3,
      created_at: "2024-01-10T00:00:00Z",
    },
    
    {
      id: 4,
      module_id: 2,
      title: "Tipos de EPP",
      type: "video",
      content_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      duration_minutes: 20,
      order_index: 1,
      created_at: "2024-01-10T00:00:00Z",
    },
    {
      id: 5,
      module_id: 2,
      title: "Uso Correcto de Cascos y Guantes",
      type: "text",
      content_text: "Instrucciones detalladas sobre el uso correcto de EPP...",
      duration_minutes: 15,
      order_index: 2,
      created_at: "2024-01-10T00:00:00Z",
    },
  ];

  
  private mockProgress: MockProgress[] = [
    {
      id: 1,
      user_id: 3, 
      course_id: 1,
      progress_percentage: 75,
      completed: false,
      last_accessed: "2024-03-15T10:30:00Z",
      completed_contents: [1, 2, 3, 4],
    },
    {
      id: 2,
      user_id: 3,
      course_id: 2,
      progress_percentage: 100,
      completed: true,
      last_accessed: "2024-03-10T14:20:00Z",
      completed_contents: [6, 7, 8, 9, 10],
    },
    {
      id: 3,
      user_id: 3,
      course_id: 3,
      progress_percentage: 30,
      completed: false,
      last_accessed: "2024-03-18T09:15:00Z",
      completed_contents: [11],
    },
  ];

  
  private mockCertificates: MockCertificate[] = [
    {
      id: 1,
      user_id: 3,
      course_id: 2,
      issued_date: "2024-03-10T15:00:00Z",
    },
  ];

  

  
  private async simulateDelay(ms: number = 500): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  
  async login(
    email: string,
    password: string,
  ): Promise<{ user: MockUser | null; error: string | null }> {
    await this.simulateDelay();

    const user = this.mockUsers.find(
      (u) => u.email === email && u.password === password,
    );

    if (user) {
      
      const { password: _, ...userWithoutPassword } = user;
      return { user: userWithoutPassword as MockUser, error: null };
    }

    return { user: null, error: "Credenciales inválidas" };
  }

  async getCurrentUser(userId: number): Promise<MockUser | null> {
    await this.simulateDelay(200);
    const user = this.mockUsers.find((u) => u.id === userId);
    if (user) {
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword as MockUser;
    }
    return null;
  }

  
  async getCourses(): Promise<MockCourse[]> {
    await this.simulateDelay();
    return [...this.mockCourses];
  }

  async getCourseById(courseId: number): Promise<MockCourse | null> {
    await this.simulateDelay();
    return this.mockCourses.find((c) => c.id === courseId) || null;
  }

  async getCoursesByCategory(category: string): Promise<MockCourse[]> {
    await this.simulateDelay();
    return this.mockCourses.filter((c) => c.category === category);
  }

  async getCoursesByInstructor(instructorId: number): Promise<MockCourse[]> {
    await this.simulateDelay();
    return this.mockCourses.filter((c) => c.instructor_id === instructorId);
  }

  
  async getModulesByCourse(courseId: number): Promise<MockModule[]> {
    await this.simulateDelay();
    return this.mockModules
      .filter((m) => m.course_id === courseId)
      .sort((a, b) => a.order_index - b.order_index);
  }

  async getModuleById(moduleId: number): Promise<MockModule | null> {
    await this.simulateDelay();
    return this.mockModules.find((m) => m.id === moduleId) || null;
  }

  
  async getContentsByModule(moduleId: number): Promise<MockContent[]> {
    await this.simulateDelay();
    return this.mockContents
      .filter((c) => c.module_id === moduleId)
      .sort((a, b) => a.order_index - b.order_index);
  }

  async getContentById(contentId: number): Promise<MockContent | null> {
    await this.simulateDelay();
    return this.mockContents.find((c) => c.id === contentId) || null;
  }

  
  async getUserProgress(userId: number): Promise<MockProgress[]> {
    await this.simulateDelay();
    return this.mockProgress.filter((p) => p.user_id === userId);
  }

  async getCourseProgress(
    userId: number,
    courseId: number,
  ): Promise<MockProgress | null> {
    await this.simulateDelay();
    return (
      this.mockProgress.find(
        (p) => p.user_id === userId && p.course_id === courseId,
      ) || null
    );
  }

  async updateProgress(
    userId: number,
    courseId: number,
    contentId: number,
  ): Promise<void> {
    await this.simulateDelay();

    let progress = this.mockProgress.find(
      (p) => p.user_id === userId && p.course_id === courseId,
    );

    if (!progress) {
      
      progress = {
        id: this.mockProgress.length + 1,
        user_id: userId,
        course_id: courseId,
        progress_percentage: 0,
        completed: false,
        last_accessed: new Date().toISOString(),
        completed_contents: [],
      };
      this.mockProgress.push(progress);
    }

    
    if (!progress.completed_contents.includes(contentId)) {
      progress.completed_contents.push(contentId);
    }

    
    const totalContents = this.mockContents.filter((c) => {
      const module = this.mockModules.find((m) => m.id === c.module_id);
      return module?.course_id === courseId;
    }).length;

    progress.progress_percentage = Math.round(
      (progress.completed_contents.length / totalContents) * 100,
    );
    progress.completed = progress.progress_percentage === 100;
    progress.last_accessed = new Date().toISOString();
  }

  
  async getUserCertificates(userId: number): Promise<MockCertificate[]> {
    await this.simulateDelay();
    return this.mockCertificates.filter((c) => c.user_id === userId);
  }

  async generateCertificate(
    userId: number,
    courseId: number,
  ): Promise<MockCertificate> {
    await this.simulateDelay();

    const certificate: MockCertificate = {
      id: this.mockCertificates.length + 1,
      user_id: userId,
      course_id: courseId,
      issued_date: new Date().toISOString(),
    };

    this.mockCertificates.push(certificate);
    return certificate;
  }

  
  async getAllUsers(): Promise<MockUser[]> {
    await this.simulateDelay();
    return this.mockUsers.map(({ password: _, ...user }) => user as MockUser);
  }

  async getUsersByRole(role: string): Promise<MockUser[]> {
    await this.simulateDelay();
    return this.mockUsers
      .filter((u) => u.role === role)
      .map(({ password: _, ...user }) => user as MockUser);
  }

  
  async getDashboardStats(userId: number, role: string): Promise<any> {
    await this.simulateDelay();

    if (role === "Administrador") {
      return {
        totalUsers: this.mockUsers.length,
        totalCourses: this.mockCourses.length,
        totalCertificates: this.mockCertificates.length,
        activeUsers: 2,
      };
    }

    if (role === "Instructor") {
      const instructorCourses = this.mockCourses.filter(
        (c) => c.instructor_id === userId,
      );
      return {
        totalCourses: instructorCourses.length,
        totalStudents: 15,
        averageProgress: 65,
      };
    }

    
    const userProgress = this.mockProgress.filter((p) => p.user_id === userId);
    const completedCourses = userProgress.filter((p) => p.completed).length;
    const certificates = this.mockCertificates.filter(
      (c) => c.user_id === userId,
    ).length;

    return {
      enrolledCourses: userProgress.length,
      completedCourses,
      certificates,
      averageProgress:
        userProgress.reduce((acc, p) => acc + p.progress_percentage, 0) /
          userProgress.length || 0,
    };
  }
}

export const mockDataService = new MockDataService();
export default mockDataService;
