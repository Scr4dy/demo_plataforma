
import { supabase } from "../config/supabase";
import { detectUserKeyInTable } from "../utils/supabaseHelper";
import { notificationService } from "./notificationService";

import { AppConfig } from "../config/appConfig";
import { SUPABASE_CONFIG } from "../config/supabase";
import { offlineCacheService } from "./offlineCacheService";
import { CacheOptions } from "../types/cache.types";

export interface Categoria {
  id: string;
  nombre: string;
  descripcion?: string;
  color: string;
  icono: string;
  activo: boolean;
  orden: number;
  created_at: string;
}

export interface Curso {
  id: number;
  id_curso?: number;
  es_publico?: boolean;
  titulo: string;
  descripcion?: string;
  categoria_id?: string;
  categoria?: string | null;
  instructor?: string;
  id_instructor?: number;
  duracion_horas?: number;
  duracion?: number; 
  activo?: boolean; 
  activo_boolean?: boolean;
  contenido_multimedia?: any[];
  categorias?: Categoria;
  inscrito?: boolean;
  progreso?: number;
  
  inscripcionEstado?: string;
  created_at?: string;
  fecha_creacion?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  metadata?: any;
  deleted_at?: string | null;
}

export interface Modulo {
  id: string;
  curso_id: string;
  titulo: string;
  descripcion?: string;
  tipo: "video" | "documento" | "quiz" | "examen";
  duracion: string;
  orden: number;
  es_preview?: boolean;
  completado?: boolean;
  contenido_url?: string;
  created_at: string;
  
  contenidos?: any[];
  lessons?: number;
  completedLessons?: number;
}

const supabaseConfigured = !!(
  (AppConfig.supabase?.url && AppConfig.supabase?.anonKey) ||
  (SUPABASE_CONFIG?.URL && SUPABASE_CONFIG?.ANON_KEY)
);
if (!supabaseConfigured)
  

const validatedCourseCols: Record<string, boolean> = {};
const validatedUserCols: Record<string, boolean> = {};

async function columnExists(
  table: string,
  column: string,
  cache: Record<string, boolean>,
): Promise<boolean> {
  if (!table || !column) return false;
  
  if (cache[column] !== undefined) return cache[column];

  
  try {
    const persisted = await offlineCacheService.get<Record<string, boolean>>(
      "progress",
      table,
    );
    if (persisted && persisted.fromCache && persisted.data) {
      Object.assign(cache, persisted.data);
      if (cache[column] !== undefined) return cache[column];
    }
  } catch (err) {
    
  }

  try {
    
    const probe = await supabase.from(table).select(column).limit(1);
    if ((probe as any)?.error) {
      const msg = String((probe as any).error?.message || "").toLowerCase();
      
      if (
        msg.includes("column") ||
        msg.includes("does not exist") ||
        (probe as any).error?.code === "42703"
      ) {
        cache[column] = false;
        try {
          await offlineCacheService.set("progress", cache, table);
        } catch (e) {
          
        }
        return false;
      }
      
      return false;
    }
    cache[column] = true;
    try {
      await offlineCacheService.set("progress", cache, table);
    } catch (e) {
      
    }
    return true;
  } catch (e) {
    
    return false;
  }
}

export const categoryService = {
  
  async getCategorias(options?: CacheOptions): Promise<Categoria[]> {
    
    if (AppConfig.useMockData) {
      
      return [
        {
          id: "1",
          nombre: "Seguridad",
          descripcion: "Cursos de seguridad industrial",
          color: "#EF4444",
          icono: "shield",
          activo: true,
          orden: 1,
          created_at: "2024-01-01T00:00:00Z",
        },
        {
          id: "2",
          nombre: "Ventas",
          descripcion: "Cursos de atención al cliente",
          color: "#3B82F6",
          icono: "trending-up",
          activo: true,
          orden: 2,
          created_at: "2024-01-01T00:00:00Z",
        },
        {
          id: "3",
          nombre: "Gestión",
          descripcion: "Cursos de gestión de proyectos",
          color: "#10B981",
          icono: "briefcase",
          activo: true,
          orden: 3,
          created_at: "2024-01-01T00:00:00Z",
        },
        {
          id: "4",
          nombre: "Tecnología",
          descripcion: "Cursos de tecnología",
          color: "#8B5CF6",
          icono: "laptop",
          activo: true,
          orden: 4,
          created_at: "2024-01-01T00:00:00Z",
        },
        {
          id: "5",
          nombre: "Liderazgo",
          descripcion: "Cursos de liderazgo",
          color: "#F59E0B",
          icono: "users",
          activo: true,
          orden: 5,
          created_at: "2024-01-01T00:00:00Z",
        },
      ];
    }

    return offlineCacheService.getOrFetch(
      "categories",
      async () => {
        if (!supabaseConfigured) return [];

        try {
          const { data, error } = await supabase
            .from("categorias")
            .select("*")
            .is("deleted_at", null)
            .order("orden", { ascending: true })
            .order("nombre", { ascending: true });

          if (error) throw error;

          return (data || []).map((cat) => ({
            ...cat,
            id: String(cat.id_categoria),
            color: cat.color || "#6B7280",
            icono: cat.icono || "folder",
            activo: cat.activo !== false,
            orden: cat.orden || 0,
          }));
        } catch (error: any) {
          
          return [];
        }
      },
      undefined,
      options,
    );
  },

  async createCategoria(
    nombre: string,
    descripcion?: string,
    color: string = "#6B7280",
    icono: string = "folder",
    orden: number = 0,
    activo: boolean = true,
  ): Promise<Categoria | null> {
    try {
      const { data, error } = await supabase
        .from("categorias")
        .insert([
          {
            nombre,
            descripcion,
            color,
            icono,
            orden,
            activo,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      return {
        ...data,
        id: String(data.id_categoria),
        activo: data.activo !== false,
      };
    } catch (error) {
      
      throw error;
    }
  },

  async updateCategoria(
    id: string | number,
    updates: Partial<Categoria>,
  ): Promise<Categoria | null> {
    try {
      const { data, error } = await supabase
        .from("categorias")
        .update({
          nombre: updates.nombre,
          descripcion: updates.descripcion,
          color: updates.color,
          icono: updates.icono,
          orden: updates.orden,
          activo: updates.activo,
        })
        .eq("id_categoria", Number(id))
        .select()
        .single();

      if (error) throw error;

      return {
        ...data,
        id: String(data.id_categoria),
        activo: data.activo !== false,
      };
    } catch (error) {
      
      throw error;
    }
  },

  async deleteCategoria(id: string | number): Promise<boolean> {
    try {
      
      const { error } = await supabase
        .from("categorias")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id_categoria", Number(id));

      if (error) throw error;
      return true;
    } catch (error) {
      
      throw error;
    }
  },

  
  async getCursoById(cursoId: string): Promise<Curso | null> {
    try {
      
      if (!supabaseConfigured) {
        
        return null;
      }

      
      
      let data: any = null;
      
      
      try {
        const filters: string[] = [];
        if (await columnExists("cursos", "id", validatedCourseCols))
          filters.push(`id.eq.${cursoId}`);
        if (await columnExists("cursos", "id_curso", validatedCourseCols))
          filters.push(`id_curso.eq.${cursoId}`);

        if (filters.length > 0) {
          let res: any;
          if (filters.length === 1) {
            
            const part = filters[0]; 
            const parts = part.split(".eq.");
            if (parts.length === 2) {
              const col = parts[0];
              const val = parts[1];
              res = await supabase
                .from("cursos")
                .select(
                  "*, usuarios!id_instructor (id_usuario, nombre, apellido_paterno, apellido_materno)",
                )
                .eq(col, Number(val))
                .is("deleted_at", null)
                .maybeSingle();
            } else {
              
              res = await supabase
                .from("cursos")
                .select(
                  "*, usuarios!id_instructor (id_usuario, nombre, apellido_paterno, apellido_materno)",
                )
                .is("deleted_at", null)
                .maybeSingle();
            }
          } else {
            res = await supabase
              .from("cursos")
              .select(
                "*, usuarios!id_instructor (id_usuario, nombre, apellido_paterno, apellido_materno)",
              )
              .or(filters.join(","))
              .is("deleted_at", null)
              .maybeSingle();
          }
          if (res.error) throw res.error;
          data = res.data;
        } else {
          
          const res = await supabase
            .from("cursos")
            .select(
              "*, usuarios!id_instructor (id_usuario, nombre, apellido_paterno, apellido_materno)",
            )
            .is("deleted_at", null)
            .maybeSingle();
          if (res.error) throw res.error;
          data = res.data;
        }
      } catch (err: any) {
        const msg = String(err?.message || "").toLowerCase();
        
        if (
          err?.code === "PGRST116" ||
          err?.code === "PGRST205" ||
          msg.includes("relation") ||
          msg.includes("categorias") ||
          msg.includes("column") ||
          err?.code === "42703"
        ) {
          try {
            
            if (await columnExists("cursos", "id_curso", validatedCourseCols)) {
              const fallback = await supabase
                .from("cursos")
                .select("*")
                .eq("id_curso", Number(cursoId))
                .maybeSingle();
              if (fallback.error) throw fallback.error;
              data = fallback.data;
            } else {
              
              const probe = await supabase.from("cursos").select("*").limit(10);
              if (probe.error) throw probe.error;
              const found = (probe.data || []).find(
                (r: any) =>
                  String(r.id_curso) === String(cursoId) ||
                  String(r.id) === String(cursoId),
              );
              data = found || null;
            }

            if (data && !data.categorias)
              data.categorias = { nombre: data.categoria || "" };
          } catch (fbErr: any) {
            if (fbErr?.code === "PGRST116" || fbErr?.code === "PGRST205") {
              
              return null;
            }
            throw fbErr;
          }
        } else {
          throw err;
        }
      }

      
      try {
        if (data && data.id_instructor) {
          
          
          const instCheck = await supabase
            .from("usuarios")
            .select(
              "id_usuario, nombre, apellido_paterno, apellido_materno, rol, activo, deleted_at",
            )
            .eq("id_usuario", data.id_instructor)
            .single();
          if (!instCheck.error && instCheck.data) {
            const u = instCheck.data as any;
            data.instructor =
              `${u.nombre || ""} ${u.apellido_paterno || ""} ${u.apellido_materno || ""}`.trim();
          } else if (instCheck.error) {
            
            
            data.instructor = "";
          } else {
            
            data.instructor = "";
          }
        } else {
          
          data.instructor = "";
        }

        
        if (data?.usuarios) {
          delete data.usuarios;
        }
      } catch (instErr) {
        
        data.instructor = "";
      }

      return data;
    } catch (error: any) {
      
      return null;
    }
  },

  
  async getModulosByCurso(
    cursoId: string,
    usuarioId?: string,
  ): Promise<Modulo[]> {
    try {
      
      if (!supabaseConfigured) {
        
        return [] as Modulo[];
      }

      
      ,
      );
      const { data, error } = await supabase
        .from("modulos")
        .select("*")
        .eq("id_curso", Number(cursoId))
        .is("deleted_at", null)
        .order("orden", { ascending: true });

      if (data) {
        
      } else {
        
      }

      if (error) {
        
        if (error.code === "PGRST116" || error.code === "PGRST205") {
          
          return [];
        }
        throw error;
      }

      
      if ((!data || (Array.isArray(data) && data.length === 0)) && __DEV__) {
        try {
          const probe = await supabase.from("modulos").select("*").limit(5);
        } catch (probeErr) {
          
        }
      }

      
      
      if (!data || (Array.isArray(data) && data.length === 0)) {
        try {
          try {
            const courseData = await this.getCursoById(String(cursoId));
            if (courseData) {
              const meta = (courseData as any).metadata || {};
              const modulesFromMeta = Array.isArray(meta.modules)
                ? meta.modules
                : [];
              if (modulesFromMeta.length > 0) {
                const mapped = modulesFromMeta.map((m: any, i: number) => ({
                  id: m.id || `meta_${i}`,
                  id_modulo: m.id || `meta_${i}`,
                  titulo: m.titulo || m.title,
                  tipo_contenido:
                    m.tipo_contenido || m.tipo || m.type || "document",
                  duracion_minutos: m.duracion_minutos || m.duracion || 0,
                  orden: m.orden || i + 1,
                  es_preview: m.es_preview || m.isPreview || false,
                  url_contenido:
                    m.url_contenido || m.url || m.contentUrl || null,
                  created_at: m.created_at || new Date().toISOString(),
                }));
                return mapped;
              }
            }
          } catch (metaErr) {
            
          }
        } catch (metaErr) {
          
        }
      }

      
      if (data && Array.isArray(data) && data.length > 0) {
        try {
          const moduleIds = Array.from(
            new Set(
              (data as any[])
                .map((m: any) => m.id_modulo || m.id || m.id_mod)
                .filter(Boolean)
                .map(Number),
            ),
          );
          if (moduleIds.length > 0) {
            const { data: contenidosData, error: contenidosErr } =
              await supabase
                .from("contenidos")
                .select("*")
                .in("id_modulo", moduleIds)
                .is("deleted_at", null)
                .order("orden", { ascending: true });

            
            let progresoMap = new Map<number, any>();
            if (usuarioId) {
              try {
                
                let empleadoId: number | null = null;
                const numericUserId = Number(usuarioId);

                if (Number.isInteger(numericUserId) && numericUserId > 0) {
                  empleadoId = numericUserId;
                } else {
                  
                  const isUuid =
                    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
                      usuarioId,
                    );
                  if (isUuid) {
                    const { data: user } = await supabase
                      .from("usuarios")
                      .select("id_usuario")
                      .eq("auth_id", usuarioId)
                      .is("deleted_at", null)
                      .maybeSingle();

                    if (user) empleadoId = user.id_usuario;
                  }
                }

                if (empleadoId) {
                  const contenidoIds =
                    contenidosData
                      ?.map((c: any) => c.id_contenido)
                      .filter(Boolean) || [];
                  if (contenidoIds.length > 0) {
                    const { data: progresoData } = await supabase
                      .from("progreso_contenidos")
                      .select("*")
                      .eq("id_empleado", empleadoId)
                      .in("id_contenido", contenidoIds)
                      .is("deleted_at", null);

                    if (progresoData && Array.isArray(progresoData)) {
                      progresoData.forEach((p: any) => {
                        progresoMap.set(Number(p.id_contenido), p);
                      });
                    }
                  }
                }
              } catch (progresoErr) {
                
              }
            }

            if (!contenidosErr && Array.isArray(contenidosData)) {
              const map = new Map<number, any[]>();
              contenidosData.forEach((c: any) => {
                const key = Number(c.id_modulo);
                const progreso = progresoMap.get(Number(c.id_contenido));
                const list = map.get(key) || [];
                list.push({
                  id_contenido: c.id_contenido,
                  id: c.id_contenido,
                  titulo: c.titulo,
                  tipo: c.tipo,
                  tipo_contenido: c.tipo,
                  url_contenido: c.url,
                  orden: c.orden,
                  duracion_estimada: c.duracion_estimada,
                  duracion_minutos: c.duracion_estimada,
                  descripcion: c.descripcion,
                  obligatorio: c.obligatorio,
                  completado: progreso?.completado || false,
                  fecha_completado: progreso?.fecha_completado || null,
                  tiempo_dedicado: progreso?.tiempo_dedicado || 0,
                });
                map.set(key, list);
              });

              
              (data as any[]).forEach((m: any) => {
                const key = Number(m.id_modulo || m.id);
                const items = map.get(key) || [];
                m.contenidos = items;
                m.lessons = items.length;
                
                m.completedLessons = items.filter(
                  (item: any) => item.completado,
                ).length;
              });
            }
          }
        } catch (e) {
          
        }
      }

      return data || [];
    } catch (error: any) {
      
      return [];
    }
  },

  
  async getCursoProgress(
    cursoId: string,
    usuarioId: string,
  ): Promise<{ progreso: number } | null> {
    try {
      
      if (!supabaseConfigured) {
        
        return { progreso: 0 };
      }

      

      
      
      let empleadoId: number | null = null;
      const numericUserId = Number(usuarioId);

      if (Number.isInteger(numericUserId) && numericUserId > 0) {
        empleadoId = numericUserId;
      } else {
        
        const isUuid =
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
            usuarioId,
          );
        if (isUuid) {
          const { data: user } = await supabase
            .from("usuarios")
            .select("id_usuario")
            .eq("auth_id", usuarioId)
            .maybeSingle();
          if (user) {
            empleadoId = user.id_usuario;
          }
        } else {
          
          let user = null;
          const { data: userByEmpleado } = await supabase
            .from("usuarios")
            .select("id_usuario")
            .eq("numero_empleado", usuarioId)
            .maybeSingle();
          if (userByEmpleado) {
            user = userByEmpleado;
          } else {
            const { data: userByControl } = await supabase
              .from("usuarios")
              .select("id_usuario")
              .eq("numero_control", usuarioId)
              .maybeSingle();
            if (userByControl) {
              user = userByControl;
            }
          }
          if (user) {
            empleadoId = user.id_usuario;
          }
        }
      }

      if (!empleadoId) {
        
        return null;
      }

      const cursoIdNum = Number(cursoId);
      if (!Number.isInteger(cursoIdNum) || cursoIdNum <= 0) {
        
        return null;
      }

      
      const { data, error } = await supabase
        .from("inscripciones")
        .select(
          "id_inscripcion, progreso, estado, fecha_ultima_actividad, fecha_completado, nota_final",
        )
        .eq("id_empleado", empleadoId)
        .eq("id_curso", cursoIdNum)
        .is("deleted_at", null)
        .maybeSingle();

      if (error) {
        
        return null;
      }

      if (!data) {
        return null;
      }
      return data;
    } catch (error: any) {
      
      return null;
    }
  },

  
  async markModuleCompleted(
    usuarioId: string,
    cursoId: string,
    moduloId: string,
  ): Promise<void> {
    try {
      
      if (!supabaseConfigured) {
        
        return;
      }

      

      
      const { error } = await supabase.from("modulos_completados").insert({
        usuario_id: usuarioId,
        curso_id: cursoId,
        modulo_id: moduloId,
        fecha_completado: new Date().toISOString(),
      });

      if (error) throw error;

      
    } catch (error: any) {
      
      throw error;
    }
  },

  
  async getModulosCompletados(
    usuarioId: string,
    cursoId: string,
  ): Promise<any[]> {
    try {
      
      if (!supabaseConfigured) {
        
        return [];
      }

      

      
      const userKeys = ["usuario_id", "id_empleado", "id_usuario", "user_id"];
      const courseKeys = ["curso_id", "id_curso", "cursoId", "id"];
      
      const validUserKeys: string[] = [];
      const validCourseKeys: string[] = [];
      for (const uKey of userKeys) {
        if (await columnExists("modulos_completados", uKey, validatedUserCols))
          validUserKeys.push(uKey);
      }
      for (const cKey of courseKeys) {
        if (
          await columnExists("modulos_completados", cKey, validatedCourseCols)
        )
          validCourseKeys.push(cKey);
      }
      const uCandidates = validUserKeys.length ? validUserKeys : userKeys;
      const cCandidates = validCourseKeys.length ? validCourseKeys : courseKeys;
      let lastError: any = null;
      for (const uKey of uCandidates) {
        for (const cKey of cCandidates) {
          try {
            const { data, error } = await supabase
              .from("modulos_completados")
              .select("*")
              .eq(uKey, usuarioId)
              .eq(cKey, cursoId);
            if (error) {
              lastError = error;
              const msg = String(error?.message || "").toLowerCase();
              if (
                msg.includes("column") ||
                error.code === "42703" ||
                (error as any)?.status === 400
              ) {
                
                validatedUserCols[uKey] =
                  validatedUserCols[uKey] ?? !msg.includes("column");
                validatedCourseCols[cKey] =
                  validatedCourseCols[cKey] ?? !msg.includes("column");
                continue;
              }
              throw error;
            }
            return data || [];
          } catch (e: any) {
            lastError = e;
            const msg = String(e?.message || "").toLowerCase();
            if (msg.includes("column") || e?.code === "42703") {
              validatedUserCols[uKey] = false;
              validatedCourseCols[cKey] = false;
              continue;
            }
            throw e;
          }
        }
      }
      if (lastError) throw lastError;
      return [];
    } catch (error: any) {
      
      return [];
    }
  },

  
  async getCursosPorCategoria(categoriaId?: string): Promise<Curso[]> {
    
    if (!supabaseConfigured) {
      
      return [];
    }

    

    
    
    try {
      let query = supabase
        .from("cursos")
        .select(
          "*, usuarios!id_instructor (id_usuario, nombre, apellido_paterno, apellido_materno)",
        )
        .is("deleted_at", null);

      if (categoriaId) {
        
        query = query.or(
          `categoria_id.eq.${categoriaId},categoria.eq.${categoriaId}`,
        );
      }
      const { data, error } = await query.order("titulo");
      if (error) throw error;

      
      return (data || []).map((curso) => {
        if (curso.usuarios) {
          const u = curso.usuarios as any;
          const instructorName =
            `${u.nombre || ""} ${u.apellido_paterno || ""} ${u.apellido_materno || ""}`.trim();
          return { ...curso, instructor: instructorName, usuarios: undefined };
        }
        return { ...curso, instructor: "", usuarios: undefined };
      });
    } catch (err: any) {
      const msg = String(err?.message || "").toLowerCase();
      if (
        err?.code === "PGRST116" ||
        err?.code === "PGRST205" ||
        msg.includes("relation") ||
        msg.includes("categorias")
      ) {
        
        try {
          let q = supabase.from("cursos").select("*");
          if (categoriaId) {
            q = q.or(
              `categoria_id.eq.${categoriaId},categoria.eq.${categoriaId}`,
            );
          }
          const { data: d, error: e } = await q.order("titulo");
          if (e) throw e;
          return (d || []).map((c) => ({ ...c, instructor: "" }));
        } catch (fbErr) {
          throw fbErr;
        }
      }
      throw err;
    }
  },

  
  async getCursosDisponibles(usuarioId: string): Promise<Curso[]> {
    ),
      esUUID:
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          usuarioId,
        ),
    });

    
    if (AppConfig.useMockData) {
      
      const { mockDataService } = await import("./mockDataService");
      const mockCourses = await mockDataService.getCourses();

      return mockCourses.map((course) => ({
        id: course.id,
        id_curso: course.id,
        titulo: course.title,
        descripcion: course.description,
        categoria: course.category,
        instructor: course.instructor_name,
        id_instructor: course.instructor_id,
        duracion: course.duration_hours,
        duracion_horas: course.duration_hours,
        activo: course.is_published,
        created_at: course.created_at,
        inscrito: false,
        progreso: 0,
      }));
    }

    
    if (!supabaseConfigured) {
      
      return [] as Curso[];
    }

    
    try {
      if (usuarioId === "admin") {
        try {
          const { data: cursos, error } = await supabase
            .from("cursos")
            .select(
              "*, usuarios!id_instructor (id_usuario, nombre, apellido_paterno, apellido_materno)",
            )
            .is("deleted_at", null)
            .order("titulo");
          if (error) throw error;

          
          return (cursos || []).map((curso) => {
            if (curso.usuarios) {
              const u = curso.usuarios as any;
              const instructorName =
                `${u.nombre || ""} ${u.apellido_paterno || ""} ${u.apellido_materno || ""}`.trim();
              return {
                ...curso,
                instructor: instructorName,
                usuarios: undefined,
              };
            }
            return { ...curso, instructor: "", usuarios: undefined };
          });
        } catch (err: any) {
          const msg = String(err?.message || "").toLowerCase();
          if (
            err?.code === "PGRST116" ||
            msg.includes("404") ||
            msg.includes("relation") ||
            msg.includes("categorias")
          ) {
            
            const { data: cursos, error } = await supabase
              .from("cursos")
              .select("*")
              .order("titulo");
            if (error) throw error;
            return (cursos || []).map((c) => ({ ...c, instructor: "" }));
          }
          throw err;
        }
      }

      
      let inscripciones: any = null;
      let errorInscripciones: any = null;

      
      let empleadoId: number | null = null;
      if (usuarioId) {
        const numericUserId = Number(usuarioId);
        if (Number.isInteger(numericUserId) && numericUserId > 0) {
          empleadoId = numericUserId;
        } else {
          const isUuid =
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
              usuarioId,
            );
          try {
            if (isUuid) {
              const { data: u } = await supabase
                .from("usuarios")
                .select("id_usuario")
                .eq("auth_id", usuarioId)
                .maybeSingle();
              if (u) {
                empleadoId = u.id_usuario;
              } else {
                
              }
            } else {
              
              let u = null;
              const { data: uByEmpleado } = await supabase
                .from("usuarios")
                .select("id_usuario")
                .eq("numero_empleado", usuarioId)
                .maybeSingle();
              if (uByEmpleado) {
                u = uByEmpleado;
                empleadoId = u.id_usuario;
              } else {
                const { data: uByControl } = await supabase
                  .from("usuarios")
                  .select("id_usuario")
                  .eq("numero_control", usuarioId)
                  .maybeSingle();
                if (uByControl) {
                  u = uByControl;
                  empleadoId = u.id_usuario;
                } else {
                  
                }
              }
            }
          } catch (e) {
            
            
          }
        }
      }

      
      const numericUserKeys = ["id_empleado", "id_usuario"];
      const stringUserKeys = ["usuario_id", "user_id"];
      if (usuarioId) {
        if (empleadoId) {
          for (const u of numericUserKeys) {
            try {
              const res = await supabase
                .from("inscripciones")
                .select("id_curso, progreso")
                .eq(u, empleadoId);
              if (!res.error) {
                
                inscripciones = (res.data || []).map((r: any) => ({
                  curso_id: r.id_curso ?? r.curso_id,
                  id_curso: r.id_curso ?? r.curso_id,
                  progreso: r.progreso ?? 0,
                }));
                errorInscripciones = null;
                break;
              }
              errorInscripciones = res.error;
              
              if (
                res.error &&
                (res.error.code === "42703" ||
                  (res.error.message &&
                    res.error.message.toLowerCase().includes("column")))
              )
                continue;
            } catch (e: any) {
              errorInscripciones = e;
              const msg = String(e?.message || "").toLowerCase();
              
              if (
                e?.code === "22P02" ||
                msg.includes("invalid") ||
                msg.includes("bad request") ||
                msg.includes("cannot be cast") ||
                msg.includes("invalid input")
              )
                continue;
              if (
                e &&
                (e.code === "42703" ||
                  (e.message && e.message.toLowerCase().includes("column")))
              )
                continue;
              break;
            }
          }
        } else {
          
          for (const u of stringUserKeys.concat(numericUserKeys)) {
            try {
              const res = await supabase
                .from("inscripciones")
                .select("id_curso, progreso")
                .eq(u, usuarioId);
              if (!res.error) {
                
                inscripciones = (res.data || []).map((r: any) => ({
                  curso_id: r.id_curso ?? r.curso_id,
                  id_curso: r.id_curso ?? r.curso_id,
                  progreso: r.progreso ?? 0,
                }));
                errorInscripciones = null;
                break;
              }
              errorInscripciones = res.error;
              if (
                res.error &&
                (res.error.code === "42703" ||
                  (res.error.message &&
                    res.error.message.toLowerCase().includes("column")))
              )
                continue;
            } catch (e: any) {
              errorInscripciones = e;
              const msg = String(e?.message || "").toLowerCase();
              if (
                e?.code === "22P02" ||
                msg.includes("invalid") ||
                msg.includes("bad request") ||
                msg.includes("cannot be cast") ||
                msg.includes("invalid input")
              ) {
                
                continue;
              }
              if (
                e &&
                (e.code === "42703" ||
                  (e.message && e.message.toLowerCase().includes("column")))
              )
                continue;
              break;
            }
          }
        }
      }

      
      
      
      
      let inscripcionesData = errorInscripciones ? [] : inscripciones || [];

      if (
        (inscripcionesData == null || inscripcionesData.length === 0) &&
        errorInscripciones
      ) {
        try {
          
          const candidateKeys = [
            "id_empleado",
            "id_usuario",
            "usuario_id",
            "user_id",
          ];
          const foundKey = await detectUserKeyInTable(
            "inscripciones",
            candidateKeys as any,
          );

          if (foundKey) {
            
            const selectVariants = [
              "curso_id, progreso, estado",
              "id_curso, progreso, estado",
            ];
            let success = false;

            for (const sel of selectVariants) {
              try {
                const { data: insRes, error: insErr } = await supabase
                  .from("inscripciones")
                  .select(sel)
                  .eq(foundKey, usuarioId);
                if (!insErr && Array.isArray(insRes)) {
                  
                  inscripcionesData = insRes.map((r: any) => ({
                    curso_id: r.curso_id ?? r.id_curso ?? r.id ?? r.cursoId,
                    progreso: r.progreso ?? r.progress ?? 0,
                    estado: r.estado ?? r.status ?? undefined,
                  }));
                  errorInscripciones = null;
                  success = true;
                  break;
                } else {
                  
                }
              } catch (e: any) {
                
              }
            }

            if (!success) {
              
              try {
                
                const numericKeyNames = ["id_empleado", "id_usuario"];
                const isUuid =
                  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
                    usuarioId,
                  );
                let keyToUse: string | null = foundKey;

                if (isUuid && numericKeyNames.includes(foundKey)) {
                  try {
                    const { data: resolved } = await supabase
                      .from("usuarios")
                      .select("id_usuario")
                      .eq("auth_id", usuarioId)
                      .maybeSingle();
                    if (resolved && resolved.id_usuario) {
                      
                      usuarioId = String(resolved.id_usuario);
                    } else {
                      
                      
                      keyToUse = null;
                    }
                  } catch (e) {
                    
                    keyToUse = null;
                  }
                }

                if (keyToUse) {
                  const { data: all, error: allErr } = await supabase
                    .from("inscripciones")
                    .select("*")
                    .eq(keyToUse, usuarioId)
                    .limit(200);
                  if (!allErr && Array.isArray(all)) {
                    inscripcionesData = all.map((r: any) => ({
                      curso_id: r.curso_id ?? r.id_curso ?? r.id ?? r.cursoId,
                      progreso: r.progreso ?? r.progress ?? 0,
                      estado: r.estado ?? r.status ?? undefined,
                    }));
                    errorInscripciones = null;
                  } else {
                     failed",
                      allErr,
                    );
                  }
                } else {
                  
                }
              } catch (e: any) {
                 threw",
                  e?.message || e,
                );
              }
            }
          } else {
            
          }
        } catch (e: any) {
          
        }
      }

      
      
      let cursos: any = [];
      try {
        
        const { data, error } = await supabase
          .from("cursos")
          .select(
            "*, usuarios!id_instructor (nombre, apellido_paterno, apellido_materno)",
          )
          .is("deleted_at", null)
          .order("titulo");

        if (error) throw error;
        cursos = data || [];
      } catch (err: any) {
        
        const msg = String(err?.message || "").toLowerCase();
        if (
          err?.code === "PGRST116" ||
          msg.includes("relation") ||
          msg.includes("usuarios")
        ) {
          
          const { data, error } = await supabase
            .from("cursos")
            .select("*")
            .is("deleted_at", null)
            .order("titulo");
          if (error) throw error;
          cursos = data || [];
        } else {
          
          throw err;
        }
      }

      return (cursos || []).map((curso: any) => {
        const inscripcion = (inscripcionesData || []).find(
          (i: any) =>
            i.curso_id === curso.id ||
            i.curso_id === curso.id_curso ||
            i.id_curso === curso.id ||
            i.id_curso === curso.id_curso,
        );
        
        const normalizedId = curso.id_curso || curso.id;
        
        const catRel = curso.categorias;
        const categoriaNombre =
          catRel?.nombre || curso.categoria || "Sin categoría";

        
        const realCatId = curso.id_categoria;
        const derivedCatId = `cat_${String(categoriaNombre).toLowerCase().replace(/\s+/g, "_")}`;
        const finalCatId = realCatId || derivedCatId;

        
        let instructorName = curso.instructor || "";
        if (curso.usuarios) {
          const u = curso.usuarios as any;
          const builtName =
            `${u.nombre || ""} ${u.apellido_paterno || ""} ${u.apellido_materno || ""}`.trim();
          if (builtName) instructorName = builtName;
        }

        return {
          id: normalizedId,
          id_curso: normalizedId,
          titulo: curso.titulo,
          descripcion: curso.descripcion,
          duracion: curso.duracion,
          categoria: categoriaNombre,
          categoria_id: finalCatId,
          id_categoria: realCatId, 
          categorias: { nombre: categoriaNombre },
          imagen: curso.imagen_url || curso.imagen,
          instructor: instructorName,
          progreso: inscripcion ? inscripcion.progreso || 0 : 0,
          inscrito: !!inscripcion,
          
          inscripcionEstado: inscripcion
            ? inscripcion.estado || undefined
            : undefined,
          fecha_fin: curso.fecha_fin || null,
        };
      });
    } catch (error: any) {
      
      return [];
    }
  },

  
  async inscribirEnCurso(usuarioId: string, cursoId: string): Promise<any> {
    try {
      
      let empleadoId: number | null = null;

      
      const numericId = Number(usuarioId);
      if (Number.isInteger(numericId) && numericId > 0) {
        empleadoId = numericId;
      } else {
        
        const isUuid =
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
            usuarioId,
          );

        if (isUuid) {
          
          const { data: usuario, error: usuarioError } = await supabase
            .from("usuarios")
            .select("id_usuario")
            .eq("auth_id", usuarioId)
            .maybeSingle();

          if (usuarioError) {
            
            throw new Error("Error al buscar usuario en la base de datos");
          }

          if (!usuario) {
            
            throw new Error(
              "Usuario no encontrado. Asegúrate de tener un perfil creado.",
            );
          }

          empleadoId = usuario.id_usuario;
        } else {
          
          let usuario = null;
          let usuarioError = null;
          try {
            const res1 = await supabase
              .from("usuarios")
              .select("id_usuario")
              .eq("numero_empleado", usuarioId)
              .maybeSingle();
            usuario = res1.data;
            usuarioError = res1.error;
            if (usuario) {
            } else {
              const res2 = await supabase
                .from("usuarios")
                .select("id_usuario")
                .eq("numero_control", usuarioId)
                .maybeSingle();
              usuario = res2.data;
              usuarioError = res2.error;
              if (usuario) {
              }
            }
          } catch (e) {
            usuarioError = e;
          }

          if (usuarioError) {
            
            throw new Error("Error al buscar usuario");
          }

          if (!usuario) {
            
            throw new Error(
              "Usuario no encontrado. Verifica tu número de empleado o número de control.",
            );
          }

          empleadoId = usuario.id_usuario;
        }
      }

      if (!empleadoId) {
        throw new Error("No se pudo resolver el ID del usuario");
      }

      
      const cursoIdNum = Number(cursoId);
      if (!Number.isInteger(cursoIdNum) || cursoIdNum <= 0) {
        
        throw new Error("ID de curso inválido");
      }

      
      const { data: cursoData, error: cursoError } = await supabase
        .from("cursos")
        .select("fecha_fin, titulo")
        .eq("id_curso", cursoIdNum)
        .is("deleted_at", null)
        .single();

      if (cursoError) {
        
        throw new Error("No se pudo verificar la información del curso");
      }

      if (!cursoData) {
        
        throw new Error("Curso no encontrado");
      }

      
      if (cursoData.fecha_fin) {
        const now = new Date();
        const fechaFin = new Date(cursoData.fecha_fin);

        if (fechaFin < now) {
          const fechaFormateada = fechaFin.toLocaleDateString("es-ES", {
            year: "numeric",
            month: "long",
            day: "numeric",
          });
          
          throw new Error(
            `Este curso venció el ${fechaFormateada} y ya no está disponible para inscripciones.`,
          );
        }
      }

      
      const { data: existente, error: checkError } = await supabase
        .from("inscripciones")
        .select("id_inscripcion, estado, progreso")
        .eq("id_empleado", empleadoId)
        .eq("id_curso", cursoIdNum)
        .is("deleted_at", null)
        .maybeSingle();

      if (checkError) {
        
        throw checkError;
      }

      if (existente) {
        return {
          alreadyEnrolled: true,
          id_inscripcion: existente.id_inscripcion,
          estado: existente.estado,
          progreso: existente.progreso,
        };
      }

      
      const { data, error } = await supabase
        .from("inscripciones")
        .insert({
          id_empleado: empleadoId,
          id_curso: cursoIdNum,
          estado: "activo",
          progreso: 0,
        })
        .select("id_inscripcion, fecha_inscripcion, estado, progreso")
        .single();

      if (error) {
        
        if (error.code === "23505") {
          ",
            error,
          );
          return { alreadyEnrolled: true };
        }

        
        throw error;
      }
      return data;
    } catch (error) {
      
      throw error;
    }
  },

  
  async getCursosCompletados(): Promise<any[]> {
    
    
    if (!supabaseConfigured) {
      
      return [];
    }
    

    
    const { data, error } = await supabase
      .from("completaciones_cursos")
      .select(
        `
        *,
        usuarios:usuario_id (id, nombre, apellido_paterno, apellido_materno, email, numero_empleado, departamento, puesto),
        cursos:curso_id (id, titulo, instructor, duracion)
      `,
      )
      .order("fecha_completacion", { ascending: false });
    if (error) {
      if (
        error.code === "42703" ||
        (error.message && error.message.toLowerCase().includes("relation")) ||
        (error.message && error.message.toLowerCase().includes("categorias"))
      ) {
        
        const { data: completaciones, error: compleError } = await supabase
          .from("completaciones_cursos")
          .select("*")
          .order("fecha_completacion", { ascending: false });
        if (compleError) throw compleError;
        
        const enriched = await Promise.all(
          (completaciones || []).map(async (comp: any) => {
            const cursoData = await this.getCursoById(String(comp.curso_id));
            return { ...comp, cursos: cursoData };
          }),
        );
        return enriched;
      }
      throw error;
    }
    return data || [];
  },

  
  async marcarCursoCompletado(
    usuarioId: string,
    cursoId: string,
    progreso: number,
  ): Promise<void> {
    try {
      

      
      const inscripcion = await this.getInscripcion(usuarioId, cursoId);

      if (inscripcion?.fecha_completado) {
        
        const completadoHaceMin =
          (Date.now() - new Date(inscripcion.fecha_completado).getTime()) /
          1000 /
          60;
        if (completadoHaceMin > 1) {
          ,
            "minutos. No enviar email duplicado.",
          );
          return;
        }
      }

      
      
      
      const usuarioResponse = await supabase
        .from("usuarios")
        .select("*")
        .eq("id_usuario", usuarioId)
        .single();
      if (usuarioResponse.error) {
        
        throw usuarioResponse.error;
      }
      

      const cursoData = await this.getCursoById(String(cursoId));
      if (!cursoData) {
        
        throw new Error("Curso no encontrado");
      }
      

      
      
      try {
        const u = usuarioResponse.data;
        
        const userName =
          `${u.nombre || ""} ${u.apellido_paterno || ""} ${u.apellido_materno || ""}`.trim() ||
          u.email ||
          "Usuario";

        ,
            courseId: Number(cursoId),
            courseTitle: cursoData.titulo,
            userName,
          },
        );

        await notificationService.notifyCourseCompletion({
          userId: String(u.id || u.id_usuario),
          courseId: Number(cursoId),
          courseTitle: cursoData.titulo || "Curso sin título",
          userName: userName,
        });
        

        
        
        await notificationService.notifyCertificateIssued({
          usuario: usuarioResponse.data,
          curso: {
            ...cursoData,
            categorias: cursoData?.categorias,
          },
        });
      } catch (notificationError) {
        
        
      }
    } catch (error) {
      
      throw error;
    }
  },

  
  async syncCourseProgress(
    usuarioId: string,
    cursoId: string,
  ): Promise<number> {
    try {
      
      
      const inscripcion = await this.getInscripcion(usuarioId, cursoId);

      if (!inscripcion) {
        
        return 0;
      }

      const progreso = inscripcion.progreso || 0;
      

      
      if (progreso >= 100) {
        
        await this.marcarCursoCompletado(usuarioId, cursoId, progreso);
      }

      return progreso;
    } catch (error) {
      
      return 0;
    }
  },

  
  async actualizarProgresoCurso(
    usuarioId: string,
    cursoId: string,
    progreso: number,
  ): Promise<void> {
    
    const userKeys = ["id_empleado", "id_usuario", "usuario_id", "user_id"];
    
    const courseKeys = ["id_curso", "curso_id", "cursoId", "id"];
    let lastErr: any = null;
    outer_progress: for (const cKey of courseKeys) {
      for (const uKey of userKeys) {
        try {
          let ue: any = null;
          try {
            const res = await supabase
              .from("inscripciones")
              .update({
                progreso: Math.min(100, Math.max(0, progreso)),
                completado: progreso >= 100,
              })
              .eq(uKey, usuarioId)
              .eq(cKey, cursoId);
            ue = res.error;
          } catch (e) {
            ue = e;
          }
          if (
            ue &&
            (ue.code === "42703" ||
              (ue.message && ue.message.toLowerCase().includes("column")))
          ) {
            const state = progreso >= 100 ? "COMPLETADO" : "EN_CURSO";
            const resp2 = await supabase
              .from("inscripciones")
              .update({
                progreso: Math.min(100, Math.max(0, progreso)),
                estado: state,
              })
              .eq(uKey, usuarioId)
              .eq(cKey, cursoId);
            if (resp2.error) {
              lastErr = resp2.error;
              if (
                resp2.error.code === "42703" ||
                (resp2.error.message &&
                  resp2.error.message.toLowerCase().includes("column"))
              )
                continue;
              throw resp2.error;
            }
            
            break outer_progress;
          }
          if (ue) {
            lastErr = ue;
            continue;
          }
          break outer_progress;
        } catch (err: any) {
          lastErr = err;
          if (
            err &&
            (err.code === "42703" ||
              err.message?.toLowerCase()?.includes("column"))
          )
            continue;
          throw err;
        }
      }
    }
    if (lastErr) throw lastErr;

    
    if (progreso >= 100) {
      await this.marcarCursoCompletado(usuarioId, cursoId, progreso);
    }
  },

  
  async getInscripcion(usuarioId: string, cursoId: string): Promise<any> {
    const userKeys = ["usuario_id", "id_empleado", "id_usuario", "user_id"];
    const courseKeys = ["curso_id", "id_curso", "cursoId", "id"];
    let lastError: any = null;
    for (const cKey of courseKeys) {
      for (const uKey of userKeys) {
        try {
          const { data, error } = await supabase
            .from("inscripciones")
            .select("*")
            .eq(uKey, usuarioId)
            .eq(cKey, cursoId)
            .single();
          if (error) {
            lastError = error;
            const msg = String(error?.message || "").toLowerCase();
            ?.status,
              message: error?.message,
              details: (error as any)?.details || null,
            });
            if (error.code === "PGRST116" || error.code === "PGRST205")
              return null;
            if (
              error.code === "42703" ||
              msg.includes("column") ||
              msg.includes("unknown column")
            )
              continue;
            if (
              (error as any)?.status === 400 ||
              msg.includes("invalid request") ||
              msg.includes("invalid input") ||
              msg.includes("bad request")
            )
              continue;
            throw error;
          }
          return data;
        } catch (err: any) {
          lastError = err;
          if (
            err &&
            (err.code === "42703" ||
              err.message?.toLowerCase()?.includes("column"))
          )
            continue;
          throw err;
        }
      }
    }
    if (
      lastError &&
      lastError.code !== "PGRST116" &&
      lastError.code !== "PGRST205" &&
      lastError.code !== "42703"
    )
      throw lastError;
    return null;
  },

  
  async getEstadisticasCursos(): Promise<any> {
    const { data: cursosData, error: cursosError } = await supabase
      .from("cursos")
      .select("id_curso, titulo, activo, categoria");

    if (cursosError) throw cursosError;

    
    let inscripcionesData: any = null;
    let inscripcionesError: any = null;
    try {
      const r = await supabase
        .from("inscripciones")
        .select("curso_id, progreso, completado");
      inscripcionesData = r.data;
      inscripcionesError = r.error;
    } catch (e) {
      inscripcionesError = e;
    }
    if (
      inscripcionesError &&
      (inscripcionesError.code === "42703" ||
        (inscripcionesError.message &&
          inscripcionesError.message.toLowerCase().includes("column")))
    ) {
      
      try {
        const r2 = await supabase
          .from("inscripciones")
          .select("id_curso as curso_id, progreso, estado");
        inscripcionesData = r2.data;
        inscripcionesError = r2.error;
      } catch (e2) {
        inscripcionesError = e2;
      }
    }

    if (inscripcionesError) throw inscripcionesError;

    const { data: completacionesData, error: completacionesError } =
      await supabase
        .from("completaciones_cursos")
        .select("curso_id, fecha_completacion");

    if (completacionesError) throw completacionesError;

    return {
      totalCursos: cursosData?.length || 0,
      cursosPublicos: cursosData?.filter((c) => c.activo === true)?.length || 0,
      totalInscripciones: inscripcionesData?.length || 0,
      cursosCompletados: completacionesData?.length || 0,
      progresoPromedio:
        inscripcionesData?.reduce(
          (acc: number, curr: any) => acc + (curr.progreso || 0),
          0,
        ) / (inscripcionesData?.length || 1) || 0,
    };
  },

  
  async getCompletionsForCourse(cursoId: string): Promise<any[]> {
    try {
      

      const courseKeys = ["id_curso", "curso_id", "cursoId", "id"];
      let inscripciones: any[] = [];
      let success = false;

      
      for (const key of courseKeys) {
        try {
          
          const { data, error } = await supabase
            .from("inscripciones")
            .select("*")
            .eq(key, cursoId);

          if (!error && data) {
            
            
            inscripciones = data.filter((r: any) => {
              const p = r.progreso || r.progress || 0;
              return (
                Number(p) >= 100 ||
                r.completado === true ||
                r.estado === "COMPLETADO" ||
                r.estado === "completado"
              );
            });
            if (inscripciones.length > 0) {
              
              success = true;
              break;
            }
          }
        } catch (e) {
          
        }
      }

      if (!success && inscripciones.length === 0) {
        
        return [];
      }

      
      const enriched = await Promise.all(
        inscripciones.map(async (r: any) => {
          
          const userId =
            r.id_empleado || r.usuario_id || r.id_usuario || r.user_id;

          if (!userId) return null;

          try {
            let u: any = null;
            
            const { data: uData, error: uErr } = await supabase
              .from("usuarios")
              .select(
                "id_usuario, nombre, apellido_paterno, apellido_materno, correo, numero_control, auth_id",
              )
              .eq("id_usuario", userId)
              .maybeSingle();

            if (uData) {
              u = {
                ...uData,
                email: uData.correo,
                numero_empleado: uData.numero_control,
              };
            } else {
              
              const isUuid = String(userId).length > 30; 
              if (isUuid) {
                const { data: uAuth } = await supabase
                  .from("usuarios")
                  .select("*")
                  .eq("auth_id", userId)
                  .maybeSingle();
                if (uAuth) {
                  u = {
                    ...uAuth,
                    email: uAuth.correo,
                    numero_empleado: uAuth.numero_control,
                  };
                }
              }
            }

            if (!u) {
              
              const { data: uId } = await supabase
                .from("usuarios")
                .select("*")
                .eq("id", userId)
                .maybeSingle();
              if (uId) {
                u = {
                  ...uId,
                  email: uId.correo,
                  numero_empleado: uId.numero_control,
                };
              }
            }

            if (!u) return null;

            return {
              usuario_id: userId,
              fecha_completacion:
                r.fecha_inscripcion || r.created_at || new Date().toISOString(),
              usuario: u,
            };
          } catch (err) {
            
            return null;
          }
        }),
      );

      
      const final = enriched.filter((item) => item && item.usuario);
      
      return final;
    } catch (err) {
      
      return [];
    }
  },
};
