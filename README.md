# 🎓 Plataforma de Capacitación - DEMO

> **Versión Demo** - Esta es una demostración de la plataforma de capacitación empresarial sin conexión a base de datos real.

## 🚀 Acceso Rápido

La aplicación está configurada en **modo demo** y utiliza datos simulados. No requiere configuración de base de datos.

### 📱 Credenciales de Acceso

Utiliza cualquiera de las siguientes credenciales para acceder a la plataforma:

#### 👨‍💼 Administrador

```
Email: admin@demo.com
Contraseña: demo123
```

**Permisos:** Acceso completo al sistema, gestión de usuarios y cursos.

#### 👨‍🏫 Instructor

```
Email: instructor@demo.com
Contraseña: demo123
```

**Permisos:** Gestión de cursos asignados, evaluación de estudiantes.

#### 👤 Empleado

```
Email: empleado@demo.com
Contraseña: demo123
```

**Permisos:** Visualización y realización de cursos, certificados.

---

## 🎯 Características de la Demo

- ✅ **5 Cursos de Ejemplo** en diferentes categorías
- ✅ **3 Usuarios Demo** (Admin, Instructor, Empleado)
- ✅ **Dashboard Personalizado** según el rol
- ✅ **Progreso de Cursos** simulado
- ✅ **Sistema de Certificados** funcional
- ✅ **Gestión de Equipo** con datos de ejemplo
- ✅ **Sin Conexión a Internet** requerida

---

## 💻 Instalación y Ejecución

### Prerrequisitos

- Node.js v18+ ([Descargar](https://nodejs.org/))
- npm v9+

### Pasos de Instalación

1. **Clonar o descargar el proyecto**

   ```bash
   cd demo_plataforma
   ```

2. **Instalar dependencias**

   ```bash
   npm install
   ```

3. **Iniciar la aplicación**

   ```bash
   npm start
   ```

   Luego escanea el código QR con Expo Go

---

## 📚 Datos de Demostración

### Cursos Disponibles

1. **Introducción a la Seguridad Industrial** (8h) - Seguridad
2. **Atención al Cliente Excelente** (6h) - Ventas
3. **Gestión de Proyectos Ágiles** (10h) - Gestión
4. **Excel Avanzado para Negocios** (12h) - Tecnología
5. **Liderazgo y Trabajo en Equipo** (8h) - Liderazgo

### Usuarios Demo

- **Admin Demo** - Acceso completo al sistema
- **Carlos Instructor** - Instructor de todos los cursos
- **María Empleado** - Empleado con 3 cursos inscritos (75%, 100%, 30% de progreso)

---

## 🔧 Configuración del Modo Demo

El modo demo está habilitado por defecto en `src/config/appConfig.ts`:

```typescript
export const AppConfig = {
  useMockData: true, // ✅ Modo demo activado
  // ...
};
```

Para cambiar a modo producción (requiere Supabase):

```typescript
export const AppConfig = {
  useMockData: false, // ❌ Modo producción
  // ...
};
```

---

## 📱 Tecnologías Utilizadas

- **React Native** + **Expo** - Framework multiplataforma
- **TypeScript** - Tipado estático
- **React Navigation** - Navegación
- **Context API** - Gestión de estado
- **Mock Data Service** - Datos simulados para demo

---

## 🎨 Capturas de Pantalla

### Dashboard por Rol

- **Administrador:** Vista de todos los cursos y estadísticas del sistema
- **Instructor:** Gestión de cursos y estudiantes
- **Empleado:** Cursos inscritos y progreso personal

### Funcionalidades Destacadas

- Catálogo de cursos por categorías
- Seguimiento de progreso en tiempo real
- Sistema de certificados digitales
- Gestión de equipo y miembros
- Dashboard personalizado por rol

---

## ⚠️ Limitaciones del Modo Demo

- ❌ Los cambios no se persisten (se reinician al recargar)
- ❌ No hay autenticación real (solo validación de credenciales demo)
- ❌ No se pueden crear nuevos cursos o usuarios
- ❌ Las notificaciones son simuladas
- ❌ No hay sincronización con base de datos

---

## 📞 Soporte

Para más información sobre la versión completa de la plataforma (con Supabase), consulta la documentación técnica completa.

---

## 📄 Licencia

Este proyecto es una demostración con fines educativos.

---

**¡Disfruta explorando la plataforma! 🚀**
