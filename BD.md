# 🏢 HabiTech - Diccionario de Datos Simplificado

## 📋 Índice

1. [Introducción](#introducción)
2. [Tablas Principales](#tablas-principales)
3. [Relaciones entre Tablas](#relaciones-entre-tablas)
4. [Script SQL Completo](#script-sql-completo)
5. [Datos de Ejemplo](#datos-de-ejemplo)

---

## 🎯 Introducción

**HabiTech** es un sistema de gestión para un edificio residencial. Esta base de datos incluye solo las tablas esenciales para que el sistema funcione correctamente, enfocándose en las funcionalidades principales que se ven en la aplicación.

### ✅ Funcionalidades Principales:
- Gestión de usuarios y residentes
- Control de apartamentos
- Solicitudes de renta
- Gestión de pagos
- Anuncios y notificaciones
- Tienda de productos
- Chat entre residentes

---

## 📊 Tablas Principales

### 1. 👤 **users** - Usuarios del Sistema

**Propósito:** Almacena la información básica de todos los usuarios que acceden al sistema.

| Campo | Tipo | Tamaño | Nulo | Descripción |
|-------|------|--------|------|-------------|
| `id` | INT | - | NO | **PK** - Identificador único del usuario |
| `email` | VARCHAR | 255 | NO | Correo electrónico único para login |
| `password_hash` | VARCHAR | 255 | NO | Contraseña encriptada |
| `first_name` | VARCHAR | 100 | NO | Nombre del usuario |
| `last_name` | VARCHAR | 100 | NO | Apellido del usuario |
| `phone` | VARCHAR | 20 | SÍ | Número de teléfono |
| `document_number` | VARCHAR | 20 | NO | DNI o documento de identidad |
| `profile_image` | VARCHAR | 500 | SÍ | URL de la foto de perfil |
| `role` | ENUM | - | NO | 'admin', 'resident', 'security' |
| `is_active` | BOOLEAN | - | NO | Si el usuario está activo (default: TRUE) |
| `created_at` | TIMESTAMP | - | NO | Fecha de registro |
| `updated_at` | TIMESTAMP | - | NO | Fecha de última actualización |

**Índices:**
- PRIMARY KEY (`id`)
- UNIQUE KEY (`email`)
- INDEX (`role`)

---

### 2. 🏠 **apartments** - Apartamentos del Edificio

**Propósito:** Información de cada apartamento o unidad dentro del edificio.

| Campo | Tipo | Tamaño | Nulo | Descripción |
|-------|------|--------|------|-------------|
| `id` | INT | - | NO | **PK** - Identificador único del apartamento |
| `number` | VARCHAR | 20 | NO | Número del apartamento (ej: "101", "A-15") |
| `floor` | INT | - | NO | Piso donde está ubicado |
| `bedrooms` | INT | - | NO | Cantidad de dormitorios |
| `bathrooms` | INT | - | NO | Cantidad de baños |
| `area_sqm` | DECIMAL | 8,2 | SÍ | Área en metros cuadrados |
| `monthly_rent` | DECIMAL | 10,2 | NO | Precio de alquiler mensual |
| `monthly_maintenance` | DECIMAL | 10,2 | NO | Cuota de mantenimiento mensual |
| `status` | ENUM | - | NO | 'available', 'occupied', 'maintenance' |
| `description` | TEXT | - | SÍ | Descripción del apartamento |
| `amenities` | JSON | - | SÍ | Lista de amenidades (ej: balcón, vista) |
| `images` | JSON | - | SÍ | URLs de fotos del apartamento |
| `is_active` | BOOLEAN | - | NO | Si está disponible (default: TRUE) |
| `created_at` | TIMESTAMP | - | NO | Fecha de registro |

**Índices:**
- PRIMARY KEY (`id`)
- UNIQUE KEY (`number`)
- INDEX (`status`)
- INDEX (`floor`)

---

### 3. 👨‍👩‍👧‍👦 **residents** - Residentes del Edificio

**Propósito:** Conecta usuarios con apartamentos y define su tipo de residencia.

| Campo | Tipo | Tamaño | Nulo | Descripción |
|-------|------|--------|------|-------------|
| `id` | INT | - | NO | **PK** - Identificador único |
| `user_id` | INT | - | NO | **FK** - Referencia a users.id |
| `apartment_id` | INT | - | NO | **FK** - Referencia a apartments.id |
| `relationship_type` | ENUM | - | NO | 'owner', 'tenant', 'family_member' |
| `move_in_date` | DATE | - | NO | Fecha de mudanza |
| `move_out_date` | DATE | - | SÍ | Fecha de salida (si aplica) |
| `emergency_contact_name` | VARCHAR | 200 | SÍ | Nombre del contacto de emergencia |
| `emergency_contact_phone` | VARCHAR | 20 | SÍ | Teléfono de emergencia |
| `is_primary` | BOOLEAN | - | NO | Si es el residente principal |
| `is_active` | BOOLEAN | - | NO | Si está activo (default: TRUE) |
| `created_at` | TIMESTAMP | - | NO | Fecha de registro |

**Índices:**
- PRIMARY KEY (`id`)
- FOREIGN KEY (`user_id`) REFERENCES `users(id)`
- FOREIGN KEY (`apartment_id`) REFERENCES `apartments(id)`
- INDEX (`apartment_id`)
- INDEX (`user_id`)

---

### 4. 📝 **rental_applications** - Solicitudes de Renta

**Propósito:** Gestiona las solicitudes de alquiler de apartamentos disponibles.

| Campo | Tipo | Tamaño | Nulo | Descripción |
|-------|------|--------|------|-------------|
| `id` | INT | - | NO | **PK** - Identificador único |
| `apartment_id` | INT | - | NO | **FK** - Apartamento solicitado |
| `applicant_name` | VARCHAR | 200 | NO | Nombre completo del solicitante |
| `applicant_email` | VARCHAR | 255 | NO | Email del solicitante |
| `applicant_phone` | VARCHAR | 20 | NO | Teléfono del solicitante |
| `applicant_document` | VARCHAR | 20 | NO | DNI del solicitante |
| `monthly_income` | DECIMAL | 10,2 | NO | Ingresos mensuales declarados |
| `occupation` | VARCHAR | 200 | NO | Ocupación/trabajo |
| `family_size` | INT | - | NO | Cantidad de personas en la familia |
| `pets` | BOOLEAN | - | NO | Si tiene mascotas |
| `pet_details` | TEXT | - | SÍ | Detalles de las mascotas |
| `references` | JSON | - | SÍ | Referencias personales/laborales |
| `documents` | JSON | - | SÍ | URLs de documentos adjuntos |
| `message` | TEXT | - | SÍ | Mensaje adicional del solicitante |
| `status` | ENUM | - | NO | 'pending', 'approved', 'rejected', 'withdrawn' |
| `admin_notes` | TEXT | - | SÍ | Notas del administrador |
| `processed_by` | INT | - | SÍ | **FK** - Admin que procesó |
| `processed_at` | TIMESTAMP | - | SÍ | Fecha de procesamiento |
| `created_at` | TIMESTAMP | - | NO | Fecha de solicitud |

**Índices:**
- PRIMARY KEY (`id`)
- FOREIGN KEY (`apartment_id`) REFERENCES `apartments(id)`
- FOREIGN KEY (`processed_by`) REFERENCES `users(id)`
- INDEX (`status`)
- INDEX (`apartment_id`)

---

### 5. 💰 **payments** - Pagos y Cuotas

**Propósito:** Gestiona todos los pagos relacionados con apartamentos.

| Campo | Tipo | Tamaño | Nulo | Descripción |
|-------|------|--------|------|-------------|
| `id` | INT | - | NO | **PK** - Identificador único |
| `apartment_id` | INT | - | NO | **FK** - Apartamento que debe pagar |
| `resident_id` | INT | - | NO | **FK** - Residente responsable |
| `payment_type` | ENUM | - | NO | 'rent', 'maintenance', 'penalty', 'deposit' |
| `amount` | DECIMAL | 10,2 | NO | Monto a pagar |
| `description` | VARCHAR | 500 | NO | Descripción del pago |
| `due_date` | DATE | - | NO | Fecha de vencimiento |
| `paid_date` | DATE | - | SÍ | Fecha de pago realizado |
| `payment_method` | ENUM | - | SÍ | 'cash', 'transfer', 'card', 'online' |
| `transaction_id` | VARCHAR | 100 | SÍ | ID de transacción |
| `status` | ENUM | - | NO | 'pending', 'paid', 'overdue', 'cancelled' |
| `late_fee` | DECIMAL | 8,2 | NO | Multa por pago tardío (default: 0) |
| `receipt_url` | VARCHAR | 500 | SÍ | URL del comprobante |
| `processed_by` | INT | - | SÍ | **FK** - Usuario que procesó |
| `created_at` | TIMESTAMP | - | NO | Fecha de creación |
| `updated_at` | TIMESTAMP | - | NO | Fecha de actualización |

**Índices:**
- PRIMARY KEY (`id`)
- FOREIGN KEY (`apartment_id`) REFERENCES `apartments(id)`
- FOREIGN KEY (`resident_id`) REFERENCES `residents(id)`
- FOREIGN KEY (`processed_by`) REFERENCES `users(id)`
- INDEX (`status`)
- INDEX (`due_date`)

---

### 6. 📢 **announcements** - Anuncios y Comunicados

**Propósito:** Comunicados que envía la administración a los residentes.

| Campo | Tipo | Tamaño | Nulo | Descripción |
|-------|------|--------|------|-------------|
| `id` | INT | - | NO | **PK** - Identificador único |
| `title` | VARCHAR | 200 | NO | Título del anuncio |
| `content` | TEXT | - | NO | Contenido completo |
| `type` | ENUM | - | NO | 'general', 'maintenance', 'emergency', 'event' |
| `priority` | ENUM | - | NO | 'low', 'medium', 'high', 'urgent' |
| `image_url` | VARCHAR | 500 | SÍ | URL de imagen del anuncio |
| `is_pinned` | BOOLEAN | - | NO | Si está fijado arriba (default: FALSE) |
| `publish_date` | TIMESTAMP | - | NO | Fecha de publicación |
| `expiry_date` | TIMESTAMP | - | SÍ | Fecha de expiración |
| `created_by` | INT | - | NO | **FK** - Usuario que creó |
| `is_active` | BOOLEAN | - | NO | Si está activo (default: TRUE) |
| `views_count` | INT | - | NO | Cantidad de vistas (default: 0) |
| `created_at` | TIMESTAMP | - | NO | Fecha de creación |

**Índices:**
- PRIMARY KEY (`id`)
- FOREIGN KEY (`created_by`) REFERENCES `users(id)`
- INDEX (`type`)
- INDEX (`priority`)
- INDEX (`publish_date`)

---

### 7. 🔔 **notifications** - Notificaciones

**Propósito:** Notificaciones personales para cada usuario.

| Campo | Tipo | Tamaño | Nulo | Descripción |
|-------|------|--------|------|-------------|
| `id` | INT | - | NO | **PK** - Identificador único |
| `user_id` | INT | - | NO | **FK** - Usuario destinatario |
| `title` | VARCHAR | 200 | NO | Título de la notificación |
| `message` | TEXT | - | NO | Contenido del mensaje |
| `type` | ENUM | - | NO | 'payment', 'announcement', 'system', 'chat' |
| `related_id` | INT | - | SÍ | ID relacionado (pago, anuncio, etc.) |
| `icon` | VARCHAR | 50 | SÍ | Icono a mostrar |
| `action_url` | VARCHAR | 200 | SÍ | URL de acción |
| `is_read` | BOOLEAN | - | NO | Si fue leída (default: FALSE) |
| `read_at` | TIMESTAMP | - | SÍ | Fecha de lectura |
| `created_at` | TIMESTAMP | - | NO | Fecha de creación |

**Índices:**
- PRIMARY KEY (`id`)
- FOREIGN KEY (`user_id`) REFERENCES `users(id)`
- INDEX (`user_id`)
- INDEX (`is_read`)
- INDEX (`type`)

---

### 8. 🛒 **store_products** - Productos de la Tienda

**Propósito:** Catálogo de productos disponibles en la tienda del edificio.

| Campo | Tipo | Tamaño | Nulo | Descripción |
|-------|------|--------|------|-------------|
| `id` | INT | - | NO | **PK** - Identificador único |
| `name` | VARCHAR | 200 | NO | Nombre del producto |
| `description` | TEXT | - | SÍ | Descripción del producto |
| `category` | VARCHAR | 100 | NO | Categoría (ej: 'cleaning', 'food', 'tools') |
| `price` | DECIMAL | 8,2 | NO | Precio unitario |
| `stock_quantity` | INT | - | NO | Cantidad en inventario |
| `unit` | VARCHAR | 20 | NO | Unidad de medida (ej: 'piece', 'liter') |
| `image_url` | VARCHAR | 500 | SÍ | URL de imagen del producto |
| `is_available` | BOOLEAN | - | NO | Si está disponible (default: TRUE) |
| `created_by` | INT | - | NO | **FK** - Usuario que agregó |
| `created_at` | TIMESTAMP | - | NO | Fecha de creación |
| `updated_at` | TIMESTAMP | - | NO | Fecha de actualización |

**Índices:**
- PRIMARY KEY (`id`)
- FOREIGN KEY (`created_by`) REFERENCES `users(id)`
- INDEX (`category`)
- INDEX (`is_available`)

---

### 9. 🛒 **store_orders** - Órdenes de Compra

**Propósito:** Gestiona las compras realizadas por los residentes.

| Campo | Tipo | Tamaño | Nulo | Descripción |
|-------|------|--------|------|-------------|
| `id` | INT | - | NO | **PK** - Identificador único |
| `resident_id` | INT | - | NO | **FK** - Residente que compra |
| `total_amount` | DECIMAL | 10,2 | NO | Monto total de la orden |
| `status` | ENUM | - | NO | 'pending', 'confirmed', 'delivered', 'cancelled' |
| `delivery_address` | TEXT | - | SÍ | Dirección de entrega (default: apartamento) |
| `notes` | TEXT | - | SÍ | Notas adicionales |
| `order_date` | TIMESTAMP | - | NO | Fecha de la orden |
| `delivery_date` | TIMESTAMP | - | SÍ | Fecha de entrega |
| `processed_by` | INT | - | SÍ | **FK** - Admin que procesó |
| `created_at` | TIMESTAMP | - | NO | Fecha de creación |

**Índices:**
- PRIMARY KEY (`id`)
- FOREIGN KEY (`resident_id`) REFERENCES `residents(id)`
- FOREIGN KEY (`processed_by`) REFERENCES `users(id)`
- INDEX (`status`)
- INDEX (`order_date`)

---

### 10. 🛒 **store_order_items** - Items de Órdenes

**Propósito:** Detalle de productos en cada orden de compra.

| Campo | Tipo | Tamaño | Nulo | Descripción |
|-------|------|--------|------|-------------|
| `id` | INT | - | NO | **PK** - Identificador único |
| `order_id` | INT | - | NO | **FK** - Orden a la que pertenece |
| `product_id` | INT | - | NO | **FK** - Producto comprado |
| `quantity` | INT | - | NO | Cantidad comprada |
| `unit_price` | DECIMAL | 8,2 | NO | Precio unitario al momento de compra |
| `subtotal` | DECIMAL | 10,2 | NO | Cantidad × precio unitario |

**Índices:**
- PRIMARY KEY (`id`)
- FOREIGN KEY (`order_id`) REFERENCES `store_orders(id)`
- FOREIGN KEY (`product_id`) REFERENCES `store_products(id)`
- INDEX (`order_id`)

---

### 11. 💬 **chat_messages** - Mensajes de Chat

**Propósito:** Sistema de mensajería entre residentes.

| Campo | Tipo | Tamaño | Nulo | Descripción |
|-------|------|--------|------|-------------|
| `id` | INT | - | NO | **PK** - Identificador único |
| `sender_id` | INT | - | NO | **FK** - Usuario que envía |
| `receiver_id` | INT | - | SÍ | **FK** - Usuario destinatario (NULL = grupo) |
| `message` | TEXT | - | NO | Contenido del mensaje |
| `message_type` | ENUM | - | NO | 'text', 'image', 'file' |
| `file_url` | VARCHAR | 500 | SÍ | URL de archivo adjunto |
| `is_read` | BOOLEAN | - | NO | Si fue leído (default: FALSE) |
| `read_at` | TIMESTAMP | - | SÍ | Fecha de lectura |
| `created_at` | TIMESTAMP | - | NO | Fecha de envío |

**Índices:**
- PRIMARY KEY (`id`)
- FOREIGN KEY (`sender_id`) REFERENCES `users(id)`
- FOREIGN KEY (`receiver_id`) REFERENCES `users(id)`
- INDEX (`sender_id`)
- INDEX (`receiver_id`)
- INDEX (`created_at`)

---

## 🔗 Relaciones entre Tablas

### Diagrama de Relaciones:

```
users (1) ──────── (N) residents (N) ──────── (1) apartments
  │                                               │
  │                                               │
(1) │                                               │ (1)
  │                                               │
  └── notifications                               └── rental_applications
  └── announcements                               └── payments
  └── chat_messages (sender)                      
  └── chat_messages (receiver)                    
  └── store_orders ──── (1:N) ──── store_order_items
                                        │
                                      (N:1)
                                        │
                                   store_products
```

### Relaciones Principales:

1. **users → residents → apartments**
   - Un usuario puede ser residente de un apartamento
   - Un apartamento puede tener múltiples residentes

2. **apartments → rental_applications**
   - Un apartamento puede tener múltiples solicitudes de renta

3. **residents → payments**
   - Un residente puede tener múltiples pagos

4. **users → notifications**
   - Un usuario puede tener múltiples notificaciones

5. **users → chat_messages**
   - Un usuario puede enviar/recibir múltiples mensajes

---

## 💻 Script SQL Completo

```sql
-- ====================================
-- HABITECH - BASE DE DATOS SIMPLIFICADA
-- ====================================

CREATE DATABASE habitech_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE habitech_db;

-- ====================================
-- 1. TABLA: users
-- ====================================
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    document_number VARCHAR(20) UNIQUE NOT NULL,
    profile_image VARCHAR(500),
    role ENUM('admin', 'resident', 'security') NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_document (document_number)
);

-- ====================================
-- 2. TABLA: apartments
-- ====================================
CREATE TABLE apartments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    number VARCHAR(20) UNIQUE NOT NULL,
    floor INT NOT NULL,
    bedrooms INT NOT NULL,
    bathrooms INT NOT NULL,
    area_sqm DECIMAL(8,2),
    monthly_rent DECIMAL(10,2) NOT NULL,
    monthly_maintenance DECIMAL(10,2) NOT NULL,
    status ENUM('available', 'occupied', 'maintenance') DEFAULT 'available',
    description TEXT,
    amenities JSON,
    images JSON,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_status (status),
    INDEX idx_floor (floor)
);

-- ====================================
-- 3. TABLA: residents
-- ====================================
CREATE TABLE residents (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    apartment_id INT NOT NULL,
    relationship_type ENUM('owner', 'tenant', 'family_member') NOT NULL,
    move_in_date DATE NOT NULL,
    move_out_date DATE NULL,
    emergency_contact_name VARCHAR(200),
    emergency_contact_phone VARCHAR(20),
    is_primary BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (apartment_id) REFERENCES apartments(id) ON DELETE CASCADE,
    INDEX idx_apartment (apartment_id),
    INDEX idx_user (user_id)
);

-- ====================================
-- 4. TABLA: rental_applications
-- ====================================
CREATE TABLE rental_applications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    apartment_id INT NOT NULL,
    applicant_name VARCHAR(200) NOT NULL,
    applicant_email VARCHAR(255) NOT NULL,
    applicant_phone VARCHAR(20) NOT NULL,
    applicant_document VARCHAR(20) NOT NULL,
    monthly_income DECIMAL(10,2) NOT NULL,
    occupation VARCHAR(200) NOT NULL,
    family_size INT NOT NULL,
    pets BOOLEAN DEFAULT FALSE,
    pet_details TEXT,
    references JSON,
    documents JSON,
    message TEXT,
    status ENUM('pending', 'approved', 'rejected', 'withdrawn') DEFAULT 'pending',
    admin_notes TEXT,
    processed_by INT,
    processed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (apartment_id) REFERENCES apartments(id) ON DELETE CASCADE,
    FOREIGN KEY (processed_by) REFERENCES users(id),
    INDEX idx_status (status),
    INDEX idx_apartment (apartment_id)
);

-- ====================================
-- 5. TABLA: payments
-- ====================================
CREATE TABLE payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    apartment_id INT NOT NULL,
    resident_id INT NOT NULL,
    payment_type ENUM('rent', 'maintenance', 'penalty', 'deposit') NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    description VARCHAR(500) NOT NULL,
    due_date DATE NOT NULL,
    paid_date DATE NULL,
    payment_method ENUM('cash', 'transfer', 'card', 'online'),
    transaction_id VARCHAR(100),
    status ENUM('pending', 'paid', 'overdue', 'cancelled') DEFAULT 'pending',
    late_fee DECIMAL(8,2) DEFAULT 0.00,
    receipt_url VARCHAR(500),
    processed_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (apartment_id) REFERENCES apartments(id) ON DELETE CASCADE,
    FOREIGN KEY (resident_id) REFERENCES residents(id) ON DELETE CASCADE,
    FOREIGN KEY (processed_by) REFERENCES users(id),
    INDEX idx_status (status),
    INDEX idx_due_date (due_date)
);

-- ====================================
-- 6. TABLA: announcements
-- ====================================
CREATE TABLE announcements (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    type ENUM('general', 'maintenance', 'emergency', 'event') NOT NULL,
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    image_url VARCHAR(500),
    is_pinned BOOLEAN DEFAULT FALSE,
    publish_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expiry_date TIMESTAMP NULL,
    created_by INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    views_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_type (type),
    INDEX idx_priority (priority),
    INDEX idx_publish_date (publish_date)
);

-- ====================================
-- 7. TABLA: notifications
-- ====================================
CREATE TABLE notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('payment', 'announcement', 'system', 'chat') NOT NULL,
    related_id INT,
    icon VARCHAR(50),
    action_url VARCHAR(200),
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_read (is_read),
    INDEX idx_type (type)
);

-- ====================================
-- 8. TABLA: store_products
-- ====================================
CREATE TABLE store_products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    price DECIMAL(8,2) NOT NULL,
    stock_quantity INT NOT NULL,
    unit VARCHAR(20) NOT NULL,
    image_url VARCHAR(500),
    is_available BOOLEAN DEFAULT TRUE,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_category (category),
    INDEX idx_available (is_available)
);

-- ====================================
-- 9. TABLA: store_orders
-- ====================================
CREATE TABLE store_orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    resident_id INT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'confirmed', 'delivered', 'cancelled') DEFAULT 'pending',
    delivery_address TEXT,
    notes TEXT,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    delivery_date TIMESTAMP NULL,
    processed_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (resident_id) REFERENCES residents(id) ON DELETE CASCADE,
    FOREIGN KEY (processed_by) REFERENCES users(id),
    INDEX idx_status (status),
    INDEX idx_order_date (order_date)
);

-- ====================================
-- 10. TABLA: store_order_items
-- ====================================
CREATE TABLE store_order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(8,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    
    FOREIGN KEY (order_id) REFERENCES store_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES store_products(id),
    INDEX idx_order (order_id)
);

-- ====================================
-- 11. TABLA: chat_messages
-- ====================================
CREATE TABLE chat_messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sender_id INT NOT NULL,
    receiver_id INT,
    message TEXT NOT NULL,
    message_type ENUM('text', 'image', 'file') DEFAULT 'text',
    file_url VARCHAR(500),
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_sender (sender_id),
    INDEX idx_receiver (receiver_id),
    INDEX idx_created (created_at)
);

-- ====================================
-- DATOS INICIALES
-- ====================================

-- Insertar usuarios de ejemplo
INSERT INTO users (email, password_hash, first_name, last_name, phone, document_number, role) VALUES
('admin@habitech.com', '$2b$10$hashedpassword1', 'Admin', 'Sistema', '987654321', '12345678', 'admin'),
('residente@habitech.com', '$2b$10$hashedpassword2', 'Juan', 'Pérez', '987654322', '12345679', 'resident'),
('seguridad@habitech.com', '$2b$10$hashedpassword3', 'Carlos', 'Rodríguez', '987654323', '12345680', 'security');

-- Insertar apartamentos de ejemplo
INSERT INTO apartments (number, floor, bedrooms, bathrooms, area_sqm, monthly_rent, monthly_maintenance, description) VALUES
('101', 1, 2, 1, 65.50, 1200.00, 250.00, 'Departamento de 2 dormitorios con vista al parque'),
('102', 1, 3, 2, 85.00, 1500.00, 300.00, 'Departamento familiar con balcón'),
('201', 2, 1, 1, 45.00, 800.00, 200.00, 'Studio moderno completamente amoblado'),
('202', 2, 2, 1, 70.00, 1300.00, 250.00, 'Departamento con cocina integrada'),
('301', 3, 3, 2, 95.00, 1800.00, 350.00, 'Penthouse con terraza privada');

-- Insertar productos de ejemplo para la tienda
INSERT INTO store_products (name, description, category, price, stock_quantity, unit, created_by) VALUES
('Detergente Líquido', 'Detergente para ropa 1 litro', 'cleaning', 12.50, 50, 'piece', 1),
('Papel Higiénico', 'Paquete de 4 rollos', 'cleaning', 8.00, 100, 'pack', 1),
('Agua Mineral', 'Botella 2.5 litros', 'food', 3.50, 200, 'piece', 1),
('Bombilla LED', 'Bombilla LED 12W', 'tools', 15.00, 30, 'piece', 1);
```

---

## 📝 Datos de Ejemplo

### 🏠 **Apartamentos Disponibles:**
- **Dpto 101**: 2 dorm, 1 baño, S/ 1,200/mes
- **Dpto 102**: 3 dorm, 2 baños, S/ 1,500/mes  
- **Dpto 201**: 1 dorm, 1 baño, S/ 800/mes
- **Dpto 202**: 2 dorm, 1 baño, S/ 1,300/mes
- **Dpto 301**: 3 dorm, 2 baños, S/ 1,800/mes (Penthouse)

### 👤 **Usuarios del Sistema:**
- **admin@habitech.com** / admin123 (Administrador)
- **residente@habitech.com** / residente123 (Residente)
- **seguridad@habitech.com** / seguridad123 (Seguridad)

### 🛒 **Productos de Tienda:**
- Detergente Líquido - S/ 12.50
- Papel Higiénico (paquete) - S/ 8.00
- Agua Mineral 2.5L - S/ 3.50
- Bombilla LED 12W - S/ 15.00

---

## 🎯 **Casos de Uso Principales**

### 📝 **1. Solicitud de Renta:**
1. Interesado completa formulario en `rental_applications`
2. Admin revisa y cambia `status` a 'approved'/'rejected'
3. Si se aprueba, se crea `resident` y se actualiza `apartment.status`

### 💰 **2. Gestión de Pagos:**
1. Sistema genera automáticamente pagos mensuales en `payments`
2. Residente realiza pago y se actualiza `paid_date` y `status`
3. Sistema envía `notification` de confirmación

### 🛒 **3. Compra en Tienda:**
1. Residente selecciona productos de `store_products`
2. Se crea `store_order` con items en `store_order_items`
3. Admin procesa orden y actualiza `status`

### 💬 **4. Chat entre Residentes:**
1. Residente envía mensaje en `chat_messages`
2. Sistema notifica al destinatario
3. Se marca como leído cuando se abre

---

**✅ Esta estructura simplificada incluye solo las tablas esenciales para el funcionamiento del proyecto HabiTech, enfocándose en las funcionalidades principales que se ven en la aplicación frontend.**
