# 📚 Sistema de Visualización de Lecciones

## Descripción General

Sistema completo para visualizar y gestionar lecciones de cursos con soporte para múltiples tipos de contenido multimedia.

## 🎯 Componentes Principales

### 1. **LessonDetailScreen** 
Pantalla principal que muestra el detalle de una lección individual.

**Características:**
- ✅ Visualización de contenido multimedia (videos, PDFs, presentaciones, audio, imágenes)
- ✅ Seguimiento de progreso automático
- ✅ Marcado de lecciones completadas/pendientes
- ✅ Temporizador de tiempo empleado
- ✅ Información de metadata (duración, tipo, obligatoriedad)
- ✅ Soporte para storage de archivos y URLs externas

**Uso:**
```typescript
// Navegar a LessonDetail
navigation.navigate('LessonDetail', {
  courseId: '123',
  moduleId: '456',
  content: contenidoObject,  // Objeto completo de contenido
  moduleTitle: 'Módulo 1',
  contentTitle: 'Introducción al curso'
});
```

### 2. **ContentViewer**
Componente inteligente que renderiza el contenido según su tipo.

**Tipos Soportados:**
- 🎥 **Videos**: MP4, YouTube, Vimeo, WebM, QuickTime
- 📄 **Documentos**: PDF, Word (.doc, .docx), Excel (.xls, .xlsx)
- 🎤 **Presentaciones**: PowerPoint (.ppt, .pptx), ODP
- 🎵 **Audio**: MP3, WAV, OGG
- 🖼️ **Imágenes**: JPEG, PNG, GIF, WebP, SVG
- 🔗 **Enlaces**: URLs externas
- 📝 **Evaluaciones**: Cuestionarios integrados

**Uso:**
```typescript
<ContentViewer
  url="https://ejemplo.com/archivo.pdf"
  tipo="documento"
  titulo="Documento de ejemplo"
  metadata={{ /* metadata adicional */ }}
/>
```

### 3. **LessonCard**
Tarjeta compacta para mostrar lecciones en listas.

**Características:**
- Badge de orden
- Iconos por tipo de contenido
- Indicador de completado
- Sistema de bloqueo (lecciones secuenciales)
- Duración estimada
- Indicador de obligatoriedad

**Uso:**
```typescript
<LessonCard
  lesson={contenido}
  isCompleted={false}
  isLocked={false}
  onPress={() => navigation.navigate('LessonDetail', { content: contenido })}
  showOrder={true}
/>
```

### 4. **LessonsList**
Lista completa de lecciones de un módulo con gestión de progreso.

**Características:**
- Carga automática de lecciones del módulo
- Seguimiento de progreso por lección
- Sistema de bloqueo secuencial
- Pull-to-refresh
- Indicadores visuales de estado

**Uso:**
```typescript
<LessonsList
  moduleId={123}
  courseId={456}
  onLessonPress={(lesson) => {
    navigation.navigate('LessonDetail', {
      courseId: String(courseId),
      moduleId: String(moduleId),
      content: lesson,
      moduleTitle: 'Módulo 1',
      contentTitle: lesson.titulo
    });
  }}
/>
```

## 📊 Estructura de Datos

### Tabla `contenidos`
```typescript
interface Contenido {
  id_contenido: number;
  id_curso: number;
  id_modulo: number;
  tipo: 'video' | 'audio' | 'documento' | 'presentacion' | 'imagen' | 
        'url_video' | 'url_documento' | 'url_enlace' | 'evaluacion' | 
        'enlace' | 'otro';
  titulo: string;
  url: string | null;
  descripcion: string | null;
  orden: number;
  duracion_estimada: number; // en minutos
  obligatorio: boolean;
  storage_type: 'file' | 'url' | 'both';
  storage_path: string | null;
  content_metadata: any; // JSONB
}
```

### Tabla `progreso_contenidos`
```typescript
interface ProgresoContenido {
  id_progreso: number;
  id_empleado: number;
  id_contenido: number;
  completado: boolean;
  tiempo_empleado: number; // en minutos
  fecha_inicio: string | null;
  fecha_completado: string | null;
}
```

## 🔧 Configuración de Storage

### Storage Types

1. **`'file'`** - Archivo en Supabase Storage
   - Usa: `storage_path`
   - Ejemplo: `'contenidos/curso-123/modulo-1/leccion.pdf'`

2. **`'url'`** - URL externa
   - Usa: `url`
   - Ejemplo: `'https://www.youtube.com/watch?v=xxxxx'`

3. **`'both'`** - Ambos disponibles (file tiene prioridad)
   - Usa: `storage_path` primero, fallback a `url`

### Resolución de URLs
```typescript
// El sistema automáticamente resuelve la URL según storage_type
if (storage_type === 'file') {
  const { data } = supabase.storage
    .from('contenidos')
    .getPublicUrl(storage_path);
  url = data.publicUrl;
} else if (storage_type === 'url') {
  url = contenido.url;
} else if (storage_type === 'both') {
  // Priorizar file, fallback a url
}
```

## 🎨 Estilos y Temas

Todos los componentes son **theme-aware** y soportan:
- ✅ Modo claro/oscuro
- ✅ Colores dinámicos desde `useTheme()`
- ✅ Sombras multiplataforma (iOS/Android/Web)
- ✅ Diseño responsivo

## 📱 Navegación

### Estructura de Rutas
```typescript
// App.tsx - RootStackParamList
LessonDetail: {
  courseId: string;
  moduleId: string;
  content: Contenido;
  moduleTitle?: string;
  contentTitle?: string;
}
```

### Ejemplos de Navegación

**Desde CourseDetail:**
```typescript
navigation.navigate('LessonDetail', {
  courseId: course.id_curso.toString(),
  moduleId: modulo.id_modulo.toString(),
  content: contenido,
  moduleTitle: modulo.titulo,
  contentTitle: contenido.titulo,
});
```

**Desde ModulesScreen:**
```typescript
<LessonsList
  moduleId={moduleId}
  courseId={courseId}
  onLessonPress={(lesson) => {
    navigation.navigate('LessonDetail', {
      courseId: String(courseId),
      moduleId: String(moduleId),
      content: lesson,
    });
  }}
/>
```

## 🔐 Permisos y Seguridad

### RLS (Row Level Security)
Las políticas RLS de Supabase controlan el acceso:

```sql
-- Los usuarios solo pueden ver lecciones de cursos inscritos
CREATE POLICY "contenidos_select" ON contenidos
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM inscripciones i
      WHERE i.id_curso = contenidos.id_curso
      AND i.id_empleado = auth.uid()
    )
  );
```

## 🚀 Características Avanzadas

### 1. Sistema de Bloqueo Secuencial
Las lecciones obligatorias deben completarse en orden:
```typescript
const isLessonLocked = (lesson) => {
  const previousLesson = lessons[currentIndex - 1];
  return previousLesson.obligatorio && 
         !progress[previousLesson.id_contenido]?.completado;
};
```

### 2. Seguimiento de Tiempo
El tiempo se registra automáticamente:
- Inicia al abrir la lección
- Se guarda cada minuto
- Persiste al salir de la pantalla

### 3. Videos Embebidos
Soporte automático para:
- YouTube (extrae ID y usa embed)
- Vimeo (extrae ID y usa player)
- Videos nativos (MP4, WebM, etc.)

### 4. Visualizadores de Documentos
- **Web**: Office Online Viewer para PPT/Word/Excel
- **Móvil**: WebView con PDF.js para PDFs
- Fallback: Descarga directa

## 📦 Dependencias

```json
{
  "expo-av": "~16.0.8",           // Video/Audio player
  "react-native-webview": "^13.16.0", // WebView
  "pdfjs-dist": "^5.4.530",      // PDF viewer
  "@supabase/supabase-js": "^2.84.0" // Backend
}
```

## 🐛 Troubleshooting

### Error: "No se pudo cargar la lección"
- Verificar que `id_contenido` existe en la BD
- Verificar permisos RLS
- Revisar que `deleted_at IS NULL`

### Videos no se reproducen
- Verificar formato soportado
- Para YouTube: Usar URL de embed
- Verificar permisos de CORS

### PDFs no cargan en móvil
- Verificar URL pública accesible
- En producción: Configurar CORS en Storage

## 📝 TODO / Mejoras Futuras

- [ ] Soporte offline con caché de contenidos
- [ ] Picture-in-Picture para videos
- [ ] Anotaciones en PDFs
- [ ] Subtítulos en videos
- [ ] Velocidad de reproducción configurable
- [ ] Bookmarks dentro de lecciones
- [ ] Chat/comentarios por lección
- [ ] Estadísticas detalladas de visualización

## 🤝 Contribuir

Para agregar un nuevo tipo de contenido:

1. Agregar tipo a la restricción CHECK en BD
2. Agregar case en `ContentViewer.tsx`
3. Agregar icono en `LessonCard.tsx` (getTypeIcon)
4. Actualizar tipos TypeScript

---

**Desarrollado con ❤️ para la Plataforma de Capacitación**
