# DeskTicket - Sistema de Mesa de Ayuda y Gestión de Incidencias

Aplicación de escritorio moderna desarrollada con **Electron**, **React 19**, **Vite** y **SQLite 3**, inspirada en el flujo de trabajo de incidencias y soporte técnico.

---

## 🚀 Características Principales

1. **Dashboard de Incidencias:**
   - Métricas en tiempo real: Total de tickets, pendientes, en desarrollo y terminados.
   - Distribución por nivel de prioridad (Alta, Media, Baja).
   - Tipología de incidencias (Tickets, Bugs, Sugerencias, Características).
   - Acceso rápido para crear ticket o ver proyectos.

2. **Mesa de Tickets y Requerimientos:**
   - Búsqueda en vivo por ID, título, descripción y agente asignado.
   - Filtros combinados por proyecto, categoría, tipo, prioridad y estado.
   - Modales para creación y edición de incidencias.
   - Modal de ficha completa con información del autor, técnico asignado y fecha de última modificación.
   - Cambio rápido de estado directamente desde la tabla.

3. **Gestión de Proyectos:**
   - Catálogo de sistemas y módulos con contador de tickets activos y pendientes asociados.

4. **Categorías y Áreas Técnicas:**
   - Clasificación por áreas (Backend, Frontend, Base de Datos, Soporte Hardware, Seguridad).

5. **Reportes y Productividad:**
   - Tasa de resolución global.
   - Carga y desglose por proyecto.
   - Productividad por técnico o especialista.
   - Soporte para impresión directa del informe.

6. **Gestión de Personal y Técnicos:**
   - Control de accesos (Administradores y Técnicos de soporte).
   - Asignación directa de responsables a los tickets.

7. **Diseño y Usabilidad:**
   - Sidebar oscuro profesional (`#0f172a`), colapsable a modo mini (76px) con iconos y tooltips.
   - Cabecera alineada a 68px de alto continuo bajo el título de DeskTicket.
   - Badge dinámico de tickets pendientes en el menú lateral.
   - Paleta de colores técnica y moderna basada en Indigo (`#6366f1`).

---

## 🛠️ Instalación y Ejecución

```bash
# 1. Navegar al directorio
cd c:\Users\evilnapsis\node\deskticket

# 2. Iniciar la aplicación con Electron
npm run electron
```

O para iniciar en modo desarrollo web:
```bash
npm run dev
```

---

## 🔑 Credenciales de Acceso por Defecto

- **Usuario:** `admin`
- **Contraseña:** `admin`
