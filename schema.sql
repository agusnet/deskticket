-- Database Schema for SQLite
-- DeskTicket (Help Desk & Issue Tracking)

CREATE TABLE IF NOT EXISTS "user" (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    name TEXT,
    lastname TEXT,
    email TEXT,
    password TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    kind INTEGER NOT NULL DEFAULT 1, -- 1: Administrador, 2: Técnico / Soporte
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS project (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS category (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS kind (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS status (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS priority (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS ticket (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    updated_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    kind_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    asigned_id INTEGER,
    project_id INTEGER,
    category_id INTEGER,
    priority_id INTEGER NOT NULL DEFAULT 1,
    status_id INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY (priority_id) REFERENCES priority(id) ON DELETE RESTRICT,
    FOREIGN KEY (status_id) REFERENCES status(id) ON DELETE RESTRICT,
    FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE RESTRICT,
    FOREIGN KEY (asigned_id) REFERENCES "user"(id) ON DELETE SET NULL,
    FOREIGN KEY (kind_id) REFERENCES kind(id) ON DELETE RESTRICT,
    FOREIGN KEY (category_id) REFERENCES category(id) ON DELETE SET NULL,
    FOREIGN KEY (project_id) REFERENCES project(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS setting (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    label TEXT NOT NULL,
    val TEXT
);

-- Seed Data: Kinds
INSERT OR IGNORE INTO kind (id, name) VALUES
(1, 'Ticket'),
(2, 'Bug'),
(3, 'Sugerencia'),
(4, 'Característica');

-- Seed Data: Statuses
INSERT OR IGNORE INTO status (id, name) VALUES
(1, 'Pendiente'),
(2, 'En Desarrollo'),
(3, 'Terminado'),
(4, 'Cancelado');

-- Seed Data: Priorities
INSERT OR IGNORE INTO priority (id, name) VALUES
(1, 'Alta'),
(2, 'Media'),
(3, 'Baja');

-- Seed Data: Settings
INSERT OR IGNORE INTO setting (id, name, label, val) VALUES
(1, 'title', 'Título del Sistema', 'DeskTicket'),
(2, 'company_name', 'Nombre de la Empresa', 'HelpDesk Solutions'),
(3, 'admin_email', 'Correo Administrador', 'admin@deskticket.com');

-- Seed Data: Default Admin User (password: admin, using sha1(md5("admin")): 90b9aa7e25f80cf4f64e990b78a9fc5ebd6cecad)
INSERT OR IGNORE INTO "user" (id, username, name, lastname, email, password, kind, is_active, created_at) VALUES 
(1, 'admin', 'Administrador', 'General', 'admin@deskticket.com', '90b9aa7e25f80cf4f64e990b78a9fc5ebd6cecad', 1, 1, datetime('now')),
(2, 'soporte', 'Juan', 'Pérez García', 'soporte@deskticket.com', '90b9aa7e25f80cf4f64e990b78a9fc5ebd6cecad', 2, 1, datetime('now')),
(3, 'tecnico', 'Ana', 'Martínez Silva', 'ana.tecnico@deskticket.com', '90b9aa7e25f80cf4f64e990b78a9fc5ebd6cecad', 2, 1, datetime('now'));

-- Seed Data: Projects
INSERT OR IGNORE INTO project (id, name, description) VALUES
(1, 'Sistema ERP Central', 'Plataforma empresarial de contabilidad y facturación electrónica.'),
(2, 'Aplicación Móvil iOS / Android', 'App para clientes finales y autoservicio.'),
(3, 'Portal Web Corporativo', 'Sitio web principal y pasarela de pagos en línea.'),
(4, 'Infraestructura y Redes', 'Mantenimiento de servidores, VPN y soporte interno.');

-- Seed Data: Categories
INSERT OR IGNORE INTO category (id, name) VALUES
(1, 'Desarrollo / Backend'),
(2, 'Diseño / Frontend'),
(3, 'Base de Datos'),
(4, 'Soporte Técnico / Hardware'),
(5, 'Seguridad');

-- Seed Data: Tickets de ejemplo
INSERT OR IGNORE INTO ticket (id, title, description, created_at, updated_at, kind_id, user_id, asigned_id, project_id, category_id, priority_id, status_id) VALUES
(1, 'Error al timbrar factura digital 4.0', 'El servicio SAT regresa código de error 301 cuando el RFC incluye caracteres especiales.', datetime('now', '-2 days'), datetime('now', '-1 hours'), 2, 1, 2, 1, 1, 1, 2),
(2, 'Optimizar carga de imágenes en la App Móvil', 'Las fotos de perfil tardan más de 3 segundos en mostrarse en conexiones lentas.', datetime('now', '-1 days'), datetime('now', '-30 minutes'), 4, 1, 3, 2, 2, 2, 1),
(3, 'Solicitud de respaldo mensual de base de datos', 'Generar backup en frío de la base de datos principal y enviar reporte a auditoría.', datetime('now', '-5 hours'), datetime('now'), 1, 1, 2, 1, 3, 2, 3),
(4, 'Falla intermitente en VPN corporativa', 'Usuarios de la sede norte reportan desconexiones cada 20 minutos durante la mañana.', datetime('now', '-3 hours'), datetime('now'), 2, 1, 3, 4, 4, 1, 1),
(5, 'Agregar opción de exportar reportes a Excel', 'Los usuarios del área administrativa requieren descargar las tablas en formato .xlsx.', datetime('now', '-1 days'), datetime('now'), 3, 1, 2, 3, 1, 3, 1);
