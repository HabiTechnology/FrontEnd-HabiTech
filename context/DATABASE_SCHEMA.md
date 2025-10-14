# 🗄️ Esquema de Base de Datos - HabiTech

**Base de Datos:** PostgreSQL  
**Versión del Esquema:** 1.0.0  
**Última Actualización:** Octubre 13, 2025

---

## 📋 Índice de Tablas

### 👥 Usuarios y Autenticación
1. [roles](#1-roles)
2. [permisos](#2-permisos)
3. [rol_permisos](#3-rol_permisos)
4. [usuarios](#4-usuarios)
5. [sesiones_usuario](#23-sesiones_usuario)

### 🏢 Gestión de Departamentos
6. [departamentos](#5-departamentos)
7. [residentes](#6-residentes)
8. [solicitudes_renta](#7-solicitudes_renta)

### 💰 Sistema Financiero
9. [pagos](#8-pagos)
10. [metricas_consumo](#20-metricas_consumo)

### 📢 Comunicaciones
11. [anuncios](#9-anuncios)
12. [notificaciones](#10-notificaciones)
13. [mensajes_chat](#11-mensajes_chat)

### 👷 Personal y Mantenimiento
14. [personal_edificio](#12-personal_edificio)
15. [solicitudes_mantenimiento](#17-solicitudes_mantenimiento)

### 🏛️ Áreas Comunes
16. [areas_comunes](#15-areas_comunes)
17. [reservas_areas](#16-reservas_areas)

### 🔒 Seguridad e IoT
18. [sensores_iot](#13-sensores_iot)
19. [dispositivos_seguridad](#14-dispositivos_seguridad)
20. [incidentes_emergencias](#18-incidentes_emergencias)
21. [registros_acceso](#19-registros_acceso)

### 🛒 Tienda/Marketplace
22. [productos_tienda](#28-productos_tienda)
23. [pedidos_tienda](#29-pedidos_tienda)
24. [items_pedido_tienda](#30-items_pedido_tienda)

### 🤖 IA y Automatización
25. [patrones_comportamiento](#24-patrones_comportamiento)
26. [reglas_automatizacion](#25-reglas_automatizacion)
27. [predicciones_sistema](#26-predicciones_sistema)
28. [anomalias_detectadas](#27-anomalias_detectadas)

### ⚙️ Sistema
29. [configuraciones_sistema](#21-configuraciones_sistema)
30. [logs_auditoria](#22-logs_auditoria)

---

## 📊 Tablas Detalladas

### 1. roles

**Propósito:** Define los roles de usuario en el sistema (admin, residente, personal, etc.)

```sql
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL,
    descripcion TEXT
);
```

**Columnas:**
- `id`: Identificador único del rol
- `nombre`: Nombre del rol (ej: "admin", "residente", "seguridad")
- `descripcion`: Descripción del rol y sus responsabilidades

**Roles Típicos:**
- `admin` - Administrador del edificio
- `residente` - Residente del edificio
- `personal` - Personal del edificio
- `seguridad` - Personal de seguridad
- `mantenimiento` - Personal de mantenimiento

---

### 2. permisos

**Propósito:** Define los permisos individuales que pueden asignarse a roles

```sql
CREATE TABLE permisos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) UNIQUE NOT NULL,
    descripcion TEXT
);
```

**Columnas:**
- `id`: Identificador único del permiso
- `nombre`: Nombre del permiso (ej: "crear_anuncio", "ver_pagos")
- `descripcion`: Descripción de qué permite hacer

**Permisos Comunes:**
- `ver_dashboard` - Ver panel de control
- `gestionar_residentes` - CRUD de residentes
- `gestionar_pagos` - Gestión de pagos
- `crear_anuncios` - Crear anuncios
- `ver_reportes` - Ver reportes financieros
- `gestionar_personal` - CRUD de personal

---

### 3. rol_permisos

**Propósito:** Tabla de relación N:M entre roles y permisos

```sql
CREATE TABLE rol_permisos (
    rol_id INTEGER NOT NULL,
    permiso_id INTEGER NOT NULL,
    PRIMARY KEY (rol_id, permiso_id),
    FOREIGN KEY (rol_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permiso_id) REFERENCES permisos(id) ON DELETE CASCADE
);
```

**Columnas:**
- `rol_id`: Referencia al rol
- `permiso_id`: Referencia al permiso

---

### 4. usuarios

**Propósito:** Información básica de todos los usuarios del sistema

```sql
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    correo VARCHAR(255) UNIQUE NOT NULL,
    hash_contrasena VARCHAR(255) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    telefono VARCHAR(20),
    numero_documento VARCHAR(20) UNIQUE NOT NULL,
    imagen_perfil VARCHAR(500),
    rol_id INTEGER,
    activo BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (rol_id) REFERENCES roles(id)
);
```

**Columnas:**
- `id`: Identificador único del usuario
- `correo`: Email único del usuario (usado para login)
- `hash_contrasena`: Contraseña hasheada (bcrypt)
- `nombre`: Nombre(s) del usuario
- `apellido`: Apellido(s) del usuario
- `telefono`: Número de teléfono
- `numero_documento`: DNI/Cédula/Pasaporte único
- `imagen_perfil`: URL de la foto de perfil
- `rol_id`: Referencia al rol del usuario
- `activo`: Si el usuario está activo
- `creado_en`: Fecha de creación
- `actualizado_en`: Fecha de última actualización

**Índices:**
- `idx_correo` (UNIQUE)
- `idx_numero_documento` (UNIQUE)

---

### 5. departamentos

**Propósito:** Información de los departamentos/unidades del edificio

```sql
CREATE TYPE estado_departamento AS ENUM ('disponible', 'ocupado', 'mantenimiento');

CREATE TABLE departamentos (
    id SERIAL PRIMARY KEY,
    numero VARCHAR(20) UNIQUE NOT NULL,
    piso INTEGER NOT NULL,
    dormitorios INTEGER NOT NULL,
    banos INTEGER NOT NULL,
    area_m2 NUMERIC(8,2),
    renta_mensual NUMERIC(10,2) NOT NULL,
    mantenimiento_mensual NUMERIC(10,2) NOT NULL,
    estado estado_departamento DEFAULT 'disponible',
    descripcion TEXT,
    servicios JSONB,
    imagenes JSONB,
    activo BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Columnas:**
- `id`: Identificador único del departamento
- `numero`: Número del departamento (ej: "101", "A-205")
- `piso`: Número de piso
- `dormitorios`: Cantidad de dormitorios
- `banos`: Cantidad de baños
- `area_m2`: Área en metros cuadrados
- `renta_mensual`: Precio de renta mensual
- `mantenimiento_mensual`: Costo de mantenimiento mensual
- `estado`: Estado actual ('disponible', 'ocupado', 'mantenimiento')
- `descripcion`: Descripción del departamento
- `servicios`: JSON con servicios incluidos (wifi, cable, gas, etc.)
- `imagenes`: JSON con URLs de imágenes del departamento
- `activo`: Si el departamento está activo
- `creado_en`: Fecha de creación

**Ejemplo de JSONB servicios:**
```json
{
  "wifi": true,
  "cable": true,
  "gas": true,
  "estacionamiento": 1,
  "bodega": true
}
```

---

### 6. residentes

**Propósito:** Relación entre usuarios y departamentos (quién vive dónde)

```sql
CREATE TYPE tipo_relacion AS ENUM ('propietario', 'inquilino', 'familiar');

CREATE TABLE residentes (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL,
    departamento_id INTEGER NOT NULL,
    tipo_relacion tipo_relacion NOT NULL,
    fecha_ingreso DATE NOT NULL,
    fecha_salida DATE,
    nombre_contacto_emergencia VARCHAR(200),
    telefono_contacto_emergencia VARCHAR(20),
    es_principal BOOLEAN DEFAULT FALSE,
    activo BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (departamento_id) REFERENCES departamentos(id) ON DELETE CASCADE
);
```

**Columnas:**
- `id`: Identificador único del residente
- `usuario_id`: Referencia al usuario
- `departamento_id`: Referencia al departamento
- `tipo_relacion`: Tipo ('propietario', 'inquilino', 'familiar')
- `fecha_ingreso`: Fecha de ingreso al departamento
- `fecha_salida`: Fecha de salida (NULL si aún reside)
- `nombre_contacto_emergencia`: Nombre del contacto de emergencia
- `telefono_contacto_emergencia`: Teléfono del contacto
- `es_principal`: Si es el residente principal del departamento
- `activo`: Si el residente está activo
- `creado_en`: Fecha de creación

---

### 7. solicitudes_renta

**Propósito:** Solicitudes de renta de personas interesadas en un departamento

```sql
CREATE TYPE estado_solicitud AS ENUM ('pendiente', 'aprobado', 'rechazado', 'retirado');

CREATE TABLE solicitudes_renta (
    id SERIAL PRIMARY KEY,
    departamento_id INTEGER NOT NULL,
    nombre_solicitante VARCHAR(200) NOT NULL,
    correo_solicitante VARCHAR(255) NOT NULL,
    telefono_solicitante VARCHAR(20) NOT NULL,
    documento_solicitante VARCHAR(20) NOT NULL,
    ingreso_mensual NUMERIC(10,2) NOT NULL,
    ocupacion VARCHAR(200) NOT NULL,
    tamano_familia INTEGER NOT NULL,
    mascotas BOOLEAN DEFAULT FALSE,
    detalles_mascotas TEXT,
    referencias JSONB,
    documentos JSONB,
    mensaje TEXT,
    estado estado_solicitud DEFAULT 'pendiente',
    notas_admin TEXT,
    procesado_por INTEGER,
    procesado_en TIMESTAMP,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (departamento_id) REFERENCES departamentos(id) ON DELETE CASCADE,
    FOREIGN KEY (procesado_por) REFERENCES usuarios(id)
);
```

**Columnas:**
- `id`: Identificador único de la solicitud
- `departamento_id`: Departamento solicitado
- `nombre_solicitante`: Nombre completo del solicitante
- `correo_solicitante`: Email del solicitante
- `telefono_solicitante`: Teléfono del solicitante
- `documento_solicitante`: DNI/Cédula del solicitante
- `ingreso_mensual`: Ingreso mensual declarado
- `ocupacion`: Ocupación/profesión
- `tamano_familia`: Número de personas que vivirían
- `mascotas`: Si tiene mascotas
- `detalles_mascotas`: Descripción de las mascotas
- `referencias`: JSON con referencias personales/laborales
- `documentos`: JSON con URLs de documentos adjuntos
- `mensaje`: Mensaje del solicitante
- `estado`: Estado ('pendiente', 'aprobado', 'rechazado', 'retirado')
- `notas_admin`: Notas del administrador
- `procesado_por`: Usuario que procesó la solicitud
- `procesado_en`: Fecha de procesamiento
- `creado_en`: Fecha de creación

---

### 8. pagos

**Propósito:** Gestión de pagos de rentas, mantenimiento, multas, etc.

```sql
CREATE TYPE tipo_pago AS ENUM ('renta', 'mantenimiento', 'multa', 'deposito');
CREATE TYPE estado_pago AS ENUM ('pendiente', 'pagado', 'atrasado', 'cancelado');
CREATE TYPE metodo_pago AS ENUM ('efectivo', 'transferencia', 'tarjeta', 'online');

CREATE TABLE pagos (
    id SERIAL PRIMARY KEY,
    departamento_id INTEGER NOT NULL,
    residente_id INTEGER NOT NULL,
    tipo_pago tipo_pago NOT NULL,
    monto NUMERIC(10,2) NOT NULL,
    descripcion VARCHAR(500) NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    fecha_pago DATE,
    metodo_pago metodo_pago,
    id_transaccion VARCHAR(100),
    estado estado_pago DEFAULT 'pendiente',
    recargo NUMERIC(8,2) DEFAULT 0.00,
    url_recibo VARCHAR(500),
    procesado_por INTEGER,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (departamento_id) REFERENCES departamentos(id) ON DELETE CASCADE,
    FOREIGN KEY (residente_id) REFERENCES residentes(id) ON DELETE CASCADE,
    FOREIGN KEY (procesado_por) REFERENCES usuarios(id)
);
```

**Columnas:**
- `id`: Identificador único del pago
- `departamento_id`: Departamento relacionado
- `residente_id`: Residente que debe pagar
- `tipo_pago`: Tipo ('renta', 'mantenimiento', 'multa', 'deposito')
- `monto`: Monto a pagar
- `descripcion`: Descripción del pago
- `fecha_vencimiento`: Fecha límite de pago
- `fecha_pago`: Fecha en que se realizó el pago
- `metodo_pago`: Método usado ('efectivo', 'transferencia', 'tarjeta', 'online')
- `id_transaccion`: ID de la transacción (si aplica)
- `estado`: Estado ('pendiente', 'pagado', 'atrasado', 'cancelado')
- `recargo`: Recargo por pago tardío
- `url_recibo`: URL del recibo generado
- `procesado_por`: Usuario que procesó el pago
- `creado_en`: Fecha de creación
- `actualizado_en`: Fecha de última actualización

---

### 9. anuncios

**Propósito:** Anuncios y comunicados para los residentes

```sql
CREATE TYPE tipo_anuncio AS ENUM ('general', 'mantenimiento', 'emergencia', 'evento');
CREATE TYPE prioridad_anuncio AS ENUM ('baja', 'media', 'alta', 'urgente');

CREATE TABLE anuncios (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    contenido TEXT NOT NULL,
    tipo tipo_anuncio NOT NULL,
    prioridad prioridad_anuncio DEFAULT 'media',
    url_imagen VARCHAR(500),
    fijado BOOLEAN DEFAULT FALSE,
    fecha_publicacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_expiracion TIMESTAMP,
    creado_por INTEGER NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    contador_visitas INTEGER DEFAULT 0,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (creado_por) REFERENCES usuarios(id)
);
```

**Columnas:**
- `id`: Identificador único del anuncio
- `titulo`: Título del anuncio
- `contenido`: Contenido completo
- `tipo`: Tipo ('general', 'mantenimiento', 'emergencia', 'evento')
- `prioridad`: Prioridad ('baja', 'media', 'alta', 'urgente')
- `url_imagen`: URL de imagen destacada
- `fijado`: Si está fijado al inicio
- `fecha_publicacion`: Fecha de publicación
- `fecha_expiracion`: Fecha de expiración (NULL = no expira)
- `creado_por`: Usuario que creó el anuncio
- `activo`: Si el anuncio está activo
- `contador_visitas`: Número de veces visto
- `creado_en`: Fecha de creación

---

### 10. notificaciones

**Propósito:** Notificaciones in-app para usuarios (con soporte de emails para anuncios)

```sql
CREATE TYPE tipo_notificacion AS ENUM ('pago', 'anuncio', 'sistema', 'chat');

CREATE TABLE notificaciones (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    mensaje TEXT NOT NULL,
    tipo tipo_notificacion NOT NULL,
    id_relacionado INTEGER,
    icono VARCHAR(50),
    url_accion VARCHAR(200),
    leido BOOLEAN DEFAULT FALSE,
    leido_en TIMESTAMP,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);
```

**Columnas:**
- `id`: Identificador único de la notificación
- `usuario_id`: Usuario destinatario
- `titulo`: Título de la notificación
- `mensaje`: Mensaje completo
- `tipo`: Tipo ('pago', 'anuncio', 'sistema', 'chat')
- `id_relacionado`: ID del elemento relacionado (opcional)
- `icono`: Nombre del icono a mostrar
- `url_accion`: URL a la que redirige al hacer clic
- `leido`: Si fue leída
- `leido_en`: Fecha en que fue leída
- `creado_en`: Fecha de creación

**Nota:** Cuando `tipo = 'anuncio'`, el sistema automáticamente envía un email al usuario usando Brevo.

---

### 11. mensajes_chat

**Propósito:** Mensajería entre usuarios del sistema

```sql
CREATE TYPE tipo_mensaje AS ENUM ('texto', 'imagen', 'archivo');

CREATE TABLE mensajes_chat (
    id SERIAL PRIMARY KEY,
    remitente_id INTEGER NOT NULL,
    destinatario_id INTEGER,
    mensaje TEXT NOT NULL,
    tipo_mensaje tipo_mensaje DEFAULT 'texto',
    url_archivo VARCHAR(500),
    leido BOOLEAN DEFAULT FALSE,
    leido_en TIMESTAMP,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (remitente_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (destinatario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);
```

**Columnas:**
- `id`: Identificador único del mensaje
- `remitente_id`: Usuario que envía
- `destinatario_id`: Usuario que recibe (NULL = mensaje grupal)
- `mensaje`: Contenido del mensaje
- `tipo_mensaje`: Tipo ('texto', 'imagen', 'archivo')
- `url_archivo`: URL del archivo adjunto (si aplica)
- `leido`: Si fue leído
- `leido_en`: Fecha de lectura
- `creado_en`: Fecha de creación

---

### 12. personal_edificio

**Propósito:** Información del personal que trabaja en el edificio

```sql
CREATE TYPE cargo_personal AS ENUM ('seguridad', 'limpieza', 'mantenimiento', 'administracion');

CREATE TABLE personal_edificio (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    cargo cargo_personal NOT NULL,
    telefono VARCHAR(20),
    correo VARCHAR(255),
    documento_identidad VARCHAR(20) UNIQUE,
    fecha_contratacion DATE NOT NULL,
    salario NUMERIC(10,2),
    usuario_id INTEGER,
    activo BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);
```

**Columnas:**
- `id`: Identificador único del personal
- `nombre`: Nombre del personal
- `apellido`: Apellido del personal
- `cargo`: Cargo ('seguridad', 'limpieza', 'mantenimiento', 'administracion')
- `telefono`: Teléfono de contacto
- `correo`: Email de contacto
- `documento_identidad`: DNI/Cédula único
- `fecha_contratacion`: Fecha de inicio laboral
- `salario`: Salario mensual
- `usuario_id`: Usuario del sistema (si tiene acceso)
- `activo`: Si está activo
- `creado_en`: Fecha de creación

---

### 13. sensores_iot

**Propósito:** Sensores IoT instalados en el edificio

```sql
CREATE TYPE tipo_sensor AS ENUM ('agua', 'luz', 'gas', 'humo', 'movimiento');
CREATE TYPE estado_sensor AS ENUM ('activo', 'inactivo', 'fallo');

CREATE TABLE sensores_iot (
    id SERIAL PRIMARY KEY,
    tipo tipo_sensor NOT NULL,
    ubicacion VARCHAR(200) NOT NULL,
    estado estado_sensor DEFAULT 'activo',
    ultimo_registro TIMESTAMP,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Columnas:**
- `id`: Identificador único del sensor
- `tipo`: Tipo ('agua', 'luz', 'gas', 'humo', 'movimiento')
- `ubicacion`: Ubicación física del sensor
- `estado`: Estado ('activo', 'inactivo', 'fallo')
- `ultimo_registro`: Última vez que reportó datos
- `creado_en`: Fecha de instalación

---

### 14. dispositivos_seguridad

**Propósito:** Dispositivos de seguridad del edificio

```sql
CREATE TYPE tipo_dispositivo AS ENUM ('cctv', 'control_acceso', 'alarma');

CREATE TABLE dispositivos_seguridad (
    id SERIAL PRIMARY KEY,
    tipo tipo_dispositivo NOT NULL,
    ubicacion VARCHAR(200) NOT NULL,
    estado estado_sensor DEFAULT 'activo',
    descripcion TEXT,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Columnas:**
- `id`: Identificador único del dispositivo
- `tipo`: Tipo ('cctv', 'control_acceso', 'alarma')
- `ubicacion`: Ubicación física
- `estado`: Estado ('activo', 'inactivo', 'fallo')
- `descripcion`: Descripción del dispositivo
- `creado_en`: Fecha de instalación

---

### 15. areas_comunes

**Propósito:** Áreas comunes del edificio disponibles para reserva

```sql
CREATE TYPE estado_area AS ENUM ('disponible', 'ocupado', 'mantenimiento');

CREATE TABLE areas_comunes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    capacidad INTEGER,
    estado estado_area DEFAULT 'disponible',
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Columnas:**
- `id`: Identificador único del área
- `nombre`: Nombre del área (ej: "Salón de Fiestas", "Gimnasio")
- `descripcion`: Descripción del área
- `capacidad`: Capacidad máxima de personas
- `estado`: Estado ('disponible', 'ocupado', 'mantenimiento')
- `creado_en`: Fecha de creación

---

### 16. reservas_areas

**Propósito:** Reservas de áreas comunes por residentes

```sql
CREATE TYPE estado_reserva AS ENUM ('pendiente', 'confirmada', 'cancelada');

CREATE TABLE reservas_areas (
    id SERIAL PRIMARY KEY,
    area_id INTEGER NOT NULL,
    residente_id INTEGER NOT NULL,
    fecha_reserva DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    estado estado_reserva DEFAULT 'pendiente',
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (area_id) REFERENCES areas_comunes(id) ON DELETE CASCADE,
    FOREIGN KEY (residente_id) REFERENCES residentes(id) ON DELETE CASCADE
);
```

**Columnas:**
- `id`: Identificador único de la reserva
- `area_id`: Área reservada
- `residente_id`: Residente que reserva
- `fecha_reserva`: Fecha de la reserva
- `hora_inicio`: Hora de inicio
- `hora_fin`: Hora de fin
- `estado`: Estado ('pendiente', 'confirmada', 'cancelada')
- `creado_en`: Fecha de creación de la reserva

---

### 17. solicitudes_mantenimiento

**Propósito:** Solicitudes de mantenimiento de departamentos o áreas comunes

```sql
CREATE TYPE estado_mantenimiento AS ENUM ('pendiente', 'en_proceso', 'resuelto', 'cancelado');

CREATE TABLE solicitudes_mantenimiento (
    id SERIAL PRIMARY KEY,
    departamento_id INTEGER NOT NULL,
    descripcion TEXT NOT NULL,
    estado estado_mantenimiento DEFAULT 'pendiente',
    creado_por INTEGER NOT NULL,
    asignado_a INTEGER,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_resolucion TIMESTAMP,
    FOREIGN KEY (departamento_id) REFERENCES departamentos(id) ON DELETE CASCADE,
    FOREIGN KEY (creado_por) REFERENCES usuarios(id),
    FOREIGN KEY (asignado_a) REFERENCES personal_edificio(id)
);
```

**Columnas:**
- `id`: Identificador único de la solicitud
- `departamento_id`: Departamento donde se requiere mantenimiento
- `descripcion`: Descripción del problema
- `estado`: Estado ('pendiente', 'en_proceso', 'resuelto', 'cancelado')
- `creado_por`: Usuario que creó la solicitud
- `asignado_a`: Personal asignado para resolver
- `fecha_creacion`: Fecha de creación
- `fecha_resolucion`: Fecha de resolución

---

### 18. incidentes_emergencias

**Propósito:** Registro de incidentes y emergencias del edificio

```sql
CREATE TYPE tipo_incidente AS ENUM ('incendio', 'fuga_gas', 'intrusion', 'falla_electrica', 'otro');

CREATE TABLE incidentes_emergencias (
    id SERIAL PRIMARY KEY,
    tipo tipo_incidente NOT NULL,
    descripcion TEXT,
    sensor_id INTEGER,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    registrado_por INTEGER,
    FOREIGN KEY (sensor_id) REFERENCES sensores_iot(id),
    FOREIGN KEY (registrado_por) REFERENCES usuarios(id)
);
```

**Columnas:**
- `id`: Identificador único del incidente
- `tipo`: Tipo ('incendio', 'fuga_gas', 'intrusion', 'falla_electrica', 'otro')
- `descripcion`: Descripción del incidente
- `sensor_id`: Sensor que detectó el incidente (si aplica)
- `fecha`: Fecha y hora del incidente
- `registrado_por`: Usuario que registró el incidente

---

### 19. registros_acceso

**Propósito:** Registro de accesos al edificio (entradas y salidas)

```sql
CREATE TYPE tipo_acceso AS ENUM ('entrada', 'salida');

CREATE TABLE registros_acceso (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER,
    dispositivo_id INTEGER,
    tipo tipo_acceso NOT NULL,
    fecha_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (dispositivo_id) REFERENCES dispositivos_seguridad(id)
);
```

**Columnas:**
- `id`: Identificador único del registro
- `usuario_id`: Usuario que accede
- `dispositivo_id`: Dispositivo que registró el acceso
- `tipo`: Tipo ('entrada', 'salida')
- `fecha_hora`: Fecha y hora del acceso

---

### 20. metricas_consumo

**Propósito:** Registro de consumo de servicios por departamento

```sql
CREATE TYPE tipo_servicio AS ENUM ('agua', 'luz', 'gas');

CREATE TABLE metricas_consumo (
    id SERIAL PRIMARY KEY,
    departamento_id INTEGER NOT NULL,
    tipo_servicio tipo_servicio NOT NULL,
    consumo NUMERIC(10,2) NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (departamento_id) REFERENCES departamentos(id) ON DELETE CASCADE
);
```

**Columnas:**
- `id`: Identificador único de la métrica
- `departamento_id`: Departamento consumidor
- `tipo_servicio`: Tipo ('agua', 'luz', 'gas')
- `consumo`: Cantidad consumida
- `fecha_registro`: Fecha del registro

---

### 21. configuraciones_sistema

**Propósito:** Configuraciones generales del sistema

```sql
CREATE TABLE configuraciones_sistema (
    id SERIAL PRIMARY KEY,
    parametro VARCHAR(100) UNIQUE NOT NULL,
    valor VARCHAR(255) NOT NULL,
    descripcion TEXT,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Columnas:**
- `id`: Identificador único
- `parametro`: Nombre del parámetro
- `valor`: Valor del parámetro
- `descripcion`: Descripción del parámetro
- `actualizado_en`: Última actualización

**Ejemplos de parámetros:**
- `nombre_edificio` - Nombre del edificio
- `direccion` - Dirección física
- `recargo_mora` - Porcentaje de recargo por mora
- `dias_gracia_pago` - Días de gracia para pagos
- `email_contacto` - Email de contacto

---

### 22. logs_auditoria

**Propósito:** Registro de auditoría de todas las acciones importantes

```sql
CREATE TABLE logs_auditoria (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER,
    accion VARCHAR(200) NOT NULL,
    descripcion TEXT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_origen VARCHAR(50),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);
```

**Columnas:**
- `id`: Identificador único del log
- `usuario_id`: Usuario que realizó la acción
- `accion`: Tipo de acción realizada
- `descripcion`: Descripción detallada
- `fecha`: Fecha y hora de la acción
- `ip_origen`: IP desde donde se realizó

---

### 23. sesiones_usuario

**Propósito:** Gestión de sesiones de usuario activas

```sql
CREATE TABLE sesiones_usuario (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    fecha_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_fin TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);
```

**Columnas:**
- `id`: Identificador único de la sesión
- `usuario_id`: Usuario de la sesión
- `token`: Token de sesión único
- `fecha_inicio`: Inicio de sesión
- `fecha_fin`: Cierre de sesión
- `activo`: Si la sesión está activa

---

### 24. patrones_comportamiento

**Propósito:** Patrones de comportamiento de usuarios (ML/IA)

```sql
CREATE TYPE frecuencia_patron AS ENUM ('diaria', 'semanal', 'mensual');

CREATE TABLE patrones_comportamiento (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL,
    descripcion TEXT,
    frecuencia frecuencia_patron,
    hora_habitual TIME,
    ultima_actividad TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);
```

**Columnas:**
- `id`: Identificador único del patrón
- `usuario_id`: Usuario analizado
- `descripcion`: Descripción del patrón detectado
- `frecuencia`: Frecuencia ('diaria', 'semanal', 'mensual')
- `hora_habitual`: Hora habitual de la actividad
- `ultima_actividad`: Última vez que se detectó el patrón

---

### 25. reglas_automatizacion

**Propósito:** Reglas de automatización del sistema

```sql
CREATE TABLE reglas_automatizacion (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    condicion TEXT NOT NULL,
    accion TEXT NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Columnas:**
- `id`: Identificador único de la regla
- `nombre`: Nombre descriptivo
- `condicion`: Condición que dispara la regla
- `accion`: Acción a ejecutar
- `activo`: Si la regla está activa
- `creado_en`: Fecha de creación

**Ejemplo:**
```sql
nombre: "Notificar pago vencido"
condicion: "fecha_vencimiento < CURRENT_DATE AND estado = 'pendiente'"
accion: "crear_notificacion(tipo='pago', mensaje='Pago vencido')"
```

---

### 26. predicciones_sistema

**Propósito:** Predicciones generadas por modelos de ML

```sql
CREATE TYPE tipo_prediccion AS ENUM ('consumo', 'mantenimiento', 'seguridad', 'otro');

CREATE TABLE predicciones_sistema (
    id SERIAL PRIMARY KEY,
    tipo tipo_prediccion NOT NULL,
    descripcion TEXT,
    valor_estimado NUMERIC(10,2),
    fecha_prediccion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    generado_por VARCHAR(100) DEFAULT 'modelo_ml'
);
```

**Columnas:**
- `id`: Identificador único de la predicción
- `tipo`: Tipo ('consumo', 'mantenimiento', 'seguridad', 'otro')
- `descripcion`: Descripción de la predicción
- `valor_estimado`: Valor estimado
- `fecha_prediccion`: Fecha de la predicción
- `generado_por`: Modelo que generó la predicción

---

### 27. anomalias_detectadas

**Propósito:** Anomalías detectadas por el sistema de IA

```sql
CREATE TYPE tipo_anomalia AS ENUM ('acceso', 'consumo', 'iot', 'seguridad');
CREATE TYPE severidad_anomalia AS ENUM ('baja', 'media', 'alta');

CREATE TABLE anomalias_detectadas (
    id SERIAL PRIMARY KEY,
    tipo tipo_anomalia NOT NULL,
    descripcion TEXT,
    valor_observado NUMERIC(10,2),
    valor_esperado NUMERIC(10,2),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    severidad severidad_anomalia DEFAULT 'media'
);
```

**Columnas:**
- `id`: Identificador único de la anomalía
- `tipo`: Tipo ('acceso', 'consumo', 'iot', 'seguridad')
- `descripcion`: Descripción de la anomalía
- `valor_observado`: Valor detectado
- `valor_esperado`: Valor esperado
- `fecha`: Fecha de detección
- `severidad`: Severidad ('baja', 'media', 'alta')

---

### 28. productos_tienda

**Propósito:** Productos disponibles en el marketplace interno

```sql
CREATE TABLE productos_tienda (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    categoria VARCHAR(100) NOT NULL,
    precio NUMERIC(8,2) NOT NULL,
    cantidad_stock INTEGER NOT NULL,
    unidad VARCHAR(20) NOT NULL,
    url_imagen VARCHAR(500),
    disponible BOOLEAN DEFAULT TRUE,
    creado_por INTEGER NOT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (creado_por) REFERENCES usuarios(id)
);

CREATE INDEX idx_categoria ON productos_tienda(categoria);
CREATE INDEX idx_disponible ON productos_tienda(disponible);
```

**Columnas:**
- `id`: Identificador único del producto
- `nombre`: Nombre del producto
- `descripcion`: Descripción detallada
- `categoria`: Categoría (ej: "Abarrotes", "Limpieza", "Mascotas")
- `precio`: Precio unitario
- `cantidad_stock`: Cantidad en stock
- `unidad`: Unidad de medida (ej: "kg", "unidad", "litro")
- `url_imagen`: URL de la imagen del producto
- `disponible`: Si está disponible para venta
- `creado_por`: Usuario que creó el producto
- `creado_en`: Fecha de creación
- `actualizado_en`: Última actualización

**Índices:**
- `idx_categoria` - Búsqueda rápida por categoría
- `idx_disponible` - Filtrar productos disponibles

---

### 29. pedidos_tienda

**Propósito:** Pedidos realizados en el marketplace

```sql
CREATE TYPE estado_pedido AS ENUM ('pendiente', 'confirmado', 'entregado', 'cancelado');

CREATE TABLE pedidos_tienda (
    id SERIAL PRIMARY KEY,
    residente_id INTEGER NOT NULL,
    monto_total NUMERIC(10,2) NOT NULL,
    estado estado_pedido DEFAULT 'pendiente',
    direccion_entrega TEXT,
    notas TEXT,
    fecha_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_entrega TIMESTAMP,
    procesado_por INTEGER,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (residente_id) REFERENCES residentes(id) ON DELETE CASCADE,
    FOREIGN KEY (procesado_por) REFERENCES usuarios(id)
);

CREATE INDEX idx_estado ON pedidos_tienda(estado);
CREATE INDEX idx_fecha_pedido ON pedidos_tienda(fecha_pedido);
```

**Columnas:**
- `id`: Identificador único del pedido
- `residente_id`: Residente que realiza el pedido
- `monto_total`: Monto total del pedido
- `estado`: Estado ('pendiente', 'confirmado', 'entregado', 'cancelado')
- `direccion_entrega`: Dirección de entrega (departamento)
- `notas`: Notas del cliente
- `fecha_pedido`: Fecha del pedido
- `fecha_entrega`: Fecha de entrega
- `procesado_por`: Usuario que procesó el pedido
- `creado_en`: Fecha de creación

**Índices:**
- `idx_estado` - Búsqueda por estado
- `idx_fecha_pedido` - Ordenar por fecha

---

### 30. items_pedido_tienda

**Propósito:** Items individuales de cada pedido

```sql
CREATE TABLE items_pedido_tienda (
    id SERIAL PRIMARY KEY,
    pedido_id INTEGER NOT NULL,
    producto_id INTEGER NOT NULL,
    cantidad INTEGER NOT NULL,
    precio_unitario NUMERIC(8,2) NOT NULL,
    subtotal NUMERIC(10,2) NOT NULL,
    FOREIGN KEY (pedido_id) REFERENCES pedidos_tienda(id) ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES productos_tienda(id)
);

CREATE INDEX idx_pedido ON items_pedido_tienda(pedido_id);
```

**Columnas:**
- `id`: Identificador único del item
- `pedido_id`: Pedido al que pertenece
- `producto_id`: Producto comprado
- `cantidad`: Cantidad comprada
- `precio_unitario`: Precio unitario al momento de la compra
- `subtotal`: Subtotal (cantidad × precio_unitario)

**Índices:**
- `idx_pedido` - Búsqueda rápida por pedido

---

## 🔗 Diagrama de Relaciones Principales

```
usuarios
  ├── 1:N → residentes → departamentos
  ├── 1:N → pagos
  ├── 1:N → notificaciones
  ├── 1:N → mensajes_chat (remitente/destinatario)
  ├── 1:N → anuncios (creado_por)
  └── 1:1 → roles → N:M → permisos

departamentos
  ├── 1:N → residentes
  ├── 1:N → pagos
  ├── 1:N → solicitudes_renta
  ├── 1:N → metricas_consumo
  └── 1:N → solicitudes_mantenimiento

productos_tienda
  └── 1:N → items_pedido_tienda → N:1 → pedidos_tienda → N:1 → residentes

areas_comunes
  └── 1:N → reservas_areas → N:1 → residentes

sensores_iot
  └── 1:N → incidentes_emergencias

dispositivos_seguridad
  └── 1:N → registros_acceso
```

---

## 📝 Notas Importantes

### Tipos ENUM Definidos

1. **estado_departamento:** 'disponible', 'ocupado', 'mantenimiento'
2. **tipo_relacion:** 'propietario', 'inquilino', 'familiar'
3. **estado_solicitud:** 'pendiente', 'aprobado', 'rechazado', 'retirado'
4. **tipo_pago:** 'renta', 'mantenimiento', 'multa', 'deposito'
5. **estado_pago:** 'pendiente', 'pagado', 'atrasado', 'cancelado'
6. **metodo_pago:** 'efectivo', 'transferencia', 'tarjeta', 'online'
7. **tipo_anuncio:** 'general', 'mantenimiento', 'emergencia', 'evento'
8. **prioridad_anuncio:** 'baja', 'media', 'alta', 'urgente'
9. **tipo_notificacion:** 'pago', 'anuncio', 'sistema', 'chat'
10. **tipo_mensaje:** 'texto', 'imagen', 'archivo'
11. **cargo_personal:** 'seguridad', 'limpieza', 'mantenimiento', 'administracion'
12. **tipo_sensor:** 'agua', 'luz', 'gas', 'humo', 'movimiento'
13. **estado_sensor:** 'activo', 'inactivo', 'fallo'
14. **tipo_dispositivo:** 'cctv', 'control_acceso', 'alarma'
15. **estado_area:** 'disponible', 'ocupado', 'mantenimiento'
16. **estado_reserva:** 'pendiente', 'confirmada', 'cancelada'
17. **estado_mantenimiento:** 'pendiente', 'en_proceso', 'resuelto', 'cancelado'
18. **tipo_incidente:** 'incendio', 'fuga_gas', 'intrusion', 'falla_electrica', 'otro'
19. **tipo_acceso:** 'entrada', 'salida'
20. **tipo_servicio:** 'agua', 'luz', 'gas'
21. **frecuencia_patron:** 'diaria', 'semanal', 'mensual'
22. **tipo_prediccion:** 'consumo', 'mantenimiento', 'seguridad', 'otro'
23. **tipo_anomalia:** 'acceso', 'consumo', 'iot', 'seguridad'
24. **severidad_anomalia:** 'baja', 'media', 'alta'
25. **estado_pedido:** 'pendiente', 'confirmado', 'entregado', 'cancelado'

### Convenciones de Nombres

- **Tablas:** `snake_case`, plural
- **Columnas:** `snake_case`
- **Tipos ENUM:** `snake_case`
- **Índices:** Prefijo `idx_` + nombre descriptivo
- **Foreign Keys:** Sufijo `_id`

### Campos Comunes

Muchas tablas incluyen:
- `id` - Primary key autoincremental
- `activo` - Soft delete (boolean)
- `creado_en` - Timestamp de creación
- `actualizado_en` - Timestamp de última actualización

### Consideraciones de Seguridad

1. **Contraseñas:** Siempre hasheadas con bcrypt
2. **Soft Delete:** Usar `activo = FALSE` en lugar de DELETE
3. **Auditoría:** Registrar en `logs_auditoria` acciones críticas
4. **Sesiones:** Invalidar tokens en `sesiones_usuario` al logout

---

## 🚀 Scripts de Inicialización Recomendados

### Roles Iniciales

```sql
INSERT INTO roles (nombre, descripcion) VALUES
('admin', 'Administrador del sistema'),
('residente', 'Residente del edificio'),
('seguridad', 'Personal de seguridad'),
('mantenimiento', 'Personal de mantenimiento'),
('limpieza', 'Personal de limpieza');
```

### Configuraciones Iniciales

```sql
INSERT INTO configuraciones_sistema (parametro, valor, descripcion) VALUES
('nombre_edificio', 'HabiTech Tower', 'Nombre del edificio'),
('recargo_mora', '5.0', 'Porcentaje de recargo por mora'),
('dias_gracia_pago', '5', 'Días de gracia para pagos'),
('email_contacto', 'admin@habitech.com', 'Email de contacto');
```

---

**Última actualización:** Octubre 13, 2025  
**Versión:** 1.0.0  
**Mantenido por:** Equipo HabiTech
