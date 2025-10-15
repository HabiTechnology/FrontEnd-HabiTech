# 🛡️ Módulo de Registro de Accesos - HabiTech

**Fecha:** Octubre 14, 2025  
**Versión:** 1.0

---

## 📋 Descripción General

El módulo de **Registro de Accesos** permite visualizar y monitorear todas las entradas y salidas del edificio, proporcionando un control completo de la seguridad y el movimiento de residentes.

---

## 🎯 Características Principales

### ✨ Funcionalidades

1. **📊 Estadísticas en Tiempo Real**
   - Total de accesos del día
   - Cantidad de entradas vs salidas
   - Total de accesos del mes actual
   - Tarjetas informativas con colores distintivos

2. **🔍 Sistema de Filtros Avanzados**
   - **Búsqueda por residente**: Nombre, apellido o departamento
   - **Filtro por tipo**: Todas, Solo Entradas, Solo Salidas
   - **Filtro por fecha**: Selecciona un día específico
   - **Ordenamiento**: Más reciente o más antiguo primero

3. **📋 Tabla Completa de Registros**
   - ID del registro
   - Nombre del residente
   - Departamento
   - Tipo de acceso (Entrada/Salida) con badges de colores
   - Fecha y hora formateadas
   - Dispositivo de seguridad usado

4. **💾 Exportación de Datos**
   - Exportar a CSV con los filtros aplicados
   - Incluye toda la información visible
   - Nombre de archivo con fecha automática

5. **🔄 Actualización en Tiempo Real**
   - Botón de refrescar para obtener datos actuales
   - Carga automática al entrar a la página

---

## 🎨 Diseño y Colores

### Paleta de Colores
- **Azul Primario** (#007BFF) - Total de accesos
- **Verde Esmeralda** (#10B981) - Entradas
- **Rojo Rosa** (#E11D48) - Salidas
- **Azul Oscuro** (#1A2E49) - Total mensual
- **Gris Suave** (#F5F7FA) - Fondos

### Elementos Visuales
- Badges con colores distintivos para tipo de acceso
- Iconos claros (LogIn para entrada, LogOut para salida)
- Cards con gradientes sutiles
- Animaciones de carga profesionales
- Elementos flotantes en el fondo

---

## 🗄️ Estructura de Base de Datos

### Tabla: `registros_acceso`

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

### Campos
- **id**: Identificador único del registro
- **usuario_id**: Referencia al usuario (residente)
- **dispositivo_id**: Dispositivo que registró el acceso
- **tipo**: 'entrada' o 'salida'
- **fecha_hora**: Timestamp del acceso

---

## 🔌 APIs Creadas

### 1. GET `/api/accesos`

**Descripción:** Obtiene todos los registros de acceso

**Respuesta:**
```json
{
  "success": true,
  "registros": [
    {
      "id": 1,
      "usuario_id": 5,
      "usuario_nombre": "Juan",
      "usuario_apellido": "Pérez",
      "departamento_numero": null,
      "dispositivo_id": 1,
      "dispositivo_nombre": null,
      "tipo": "entrada",
      "fecha_hora": "2025-10-14T08:30:00Z"
    }
  ],
  "total": 245
}
```

**Características:**
- Límite de 500 registros más recientes
- Ordenados por fecha descendente (más recientes primero)
- Incluye información del usuario
- Manejo robusto de errores

### 2. GET `/api/accesos/estadisticas`

**Descripción:** Obtiene estadísticas agregadas de accesos

**Respuesta:**
```json
{
  "total_hoy": 45,
  "entradas_hoy": 23,
  "salidas_hoy": 22,
  "total_mes": 1247,
  "accesos_por_hora": []
}
```

**Métricas:**
- **total_hoy**: Total de accesos del día actual
- **entradas_hoy**: Entradas del día
- **salidas_hoy**: Salidas del día
- **total_mes**: Total de accesos del mes en curso

---

## 📱 Interfaz de Usuario

### Componentes

1. **Header con icono de Shield**
   - Título: "Registro de Accesos"
   - Descripción: "Control y monitoreo de entradas y salidas del edificio"

2. **Cards de Estadísticas** (4 tarjetas)
   - Accesos Hoy (azul)
   - Entradas (verde)
   - Salidas (rojo)
   - Total del Mes (gris oscuro)

3. **Panel de Filtros**
   - Input de búsqueda con icono
   - Select para tipo de acceso
   - Date picker para fecha
   - Select para ordenamiento
   - Badges de filtros activos
   - Botón "Limpiar filtros"

4. **Tabla de Registros**
   - Headers claros y organizados
   - Badges con colores para tipo
   - Iconos para identificación rápida
   - Formato de fecha y hora legible
   - Estado de carga con spinner
   - Mensaje cuando no hay datos

5. **Botones de Acción**
   - Actualizar datos
   - Exportar a CSV
   - Cambiar ordenamiento

---

## 🚀 Cómo Usar

### Para Administradores

1. **Acceder al Módulo**
   - Navega a la sección "ACCESOS" desde el menú lateral
   - El icono es un escudo con check ✓

2. **Ver Estadísticas**
   - Las tarjetas superiores muestran resumen del día y mes
   - Se actualizan automáticamente

3. **Buscar Registros**
   ```
   Ejemplo: Buscar "Juan" → muestra todos los accesos de Juan
   ```

4. **Filtrar por Tipo**
   - Selecciona "Entradas" para ver solo entradas
   - Selecciona "Salidas" para ver solo salidas

5. **Filtrar por Fecha**
   - Selecciona una fecha específica en el calendario
   - La tabla se filtra automáticamente

6. **Exportar Datos**
   - Aplica los filtros deseados
   - Haz clic en "Exportar CSV"
   - El archivo se descarga con nombre `accesos_YYYY-MM-DD.csv`

7. **Limpiar Filtros**
   - Haz clic en "Limpiar filtros" para ver todos los registros

---

## 📊 Casos de Uso

### Caso 1: Control Diario
```
Objetivo: Ver todos los accesos del día
Pasos:
1. Entrar a Accesos
2. Verificar estadísticas en cards superiores
3. La tabla muestra registros ordenados por hora
```

### Caso 2: Investigar Acceso Específico
```
Objetivo: Buscar cuándo entró un residente
Pasos:
1. Escribir nombre del residente en búsqueda
2. Seleccionar fecha en el filtro
3. Ver el registro en la tabla
```

### Caso 3: Reporte Mensual
```
Objetivo: Exportar accesos del mes
Pasos:
1. No aplicar filtros de fecha (muestra últimos 500)
2. Clic en "Exportar CSV"
3. Usar el CSV para análisis externo
```

### Caso 4: Auditoría de Seguridad
```
Objetivo: Revisar entradas sin salidas
Pasos:
1. Filtrar por "Entradas"
2. Anotar residentes
3. Filtrar por "Salidas"
4. Comparar listas
```

---

## 🎯 Ventajas del Sistema

✅ **Seguridad Mejorada**
- Monitoreo completo de entradas/salidas
- Registro permanente de todos los accesos
- Identificación rápida de patrones inusuales

✅ **Facilidad de Uso**
- Interfaz intuitiva y limpia
- Filtros potentes pero simples
- Búsqueda instantánea

✅ **Reportes y Análisis**
- Exportación fácil a CSV
- Estadísticas en tiempo real
- Datos organizados y claros

✅ **Rendimiento**
- Carga rápida de datos
- Filtrado en el cliente (sin delay)
- Límite inteligente de registros

---

## 🔧 Mantenimiento

### Datos de Prueba

Si necesitas datos de prueba, ejecuta este query en tu base de datos:

```sql
-- Insertar accesos de prueba (hoy)
INSERT INTO registros_acceso (usuario_id, dispositivo_id, tipo, fecha_hora)
VALUES
  (1, 1, 'entrada', NOW() - INTERVAL '2 hours'),
  (1, 1, 'salida', NOW() - INTERVAL '1 hour'),
  (2, 1, 'entrada', NOW() - INTERVAL '3 hours'),
  (3, 1, 'entrada', NOW() - INTERVAL '4 hours'),
  (3, 1, 'salida', NOW() - INTERVAL '30 minutes');
```

### Verificar Registros

```sql
-- Ver últimos 10 registros
SELECT 
  ra.id,
  u.nombre,
  u.apellido,
  ra.tipo,
  ra.fecha_hora
FROM registros_acceso ra
LEFT JOIN usuarios u ON ra.usuario_id = u.id
ORDER BY ra.fecha_hora DESC
LIMIT 10;
```

---

## 📝 Archivos del Proyecto

```
app/
├── accesos/
│   └── page.tsx                        # Página principal
├── api/
│   └── accesos/
│       ├── route.ts                    # GET registros
│       └── estadisticas/
│           └── route.ts                # GET estadísticas

components/
├── icons/
│   └── shield-check.tsx                # Icono del módulo
└── dashboard/
    └── sidebar/
        └── index.tsx                   # Navegación actualizada

middleware.ts                            # Rutas protegidas
```

---

## 🎉 Resumen

El módulo de **Registro de Accesos** está completamente integrado en HabiTech con:

- ✅ Diseño consistente con el resto de la aplicación
- ✅ Paleta de colores HabiTech respetada
- ✅ Animaciones y transiciones suaves
- ✅ Sistema de filtros potente
- ✅ Exportación de datos
- ✅ Estadísticas en tiempo real
- ✅ APIs robustas con manejo de errores
- ✅ Conexión a base de datos existente
- ✅ Navegación integrada en sidebar

**¡Todo listo para usar!** 🚀
