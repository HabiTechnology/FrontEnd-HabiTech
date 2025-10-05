import { Producto, Compra, ProductoCategoria } from "@/types/tienda"

// 🛍️ PRODUCTOS MOCK DATA
export const mockProductos: Producto[] = [
  {
    id_producto: 1,
    nombre: "Kit de Limpieza Completo",
    descripcion: "Kit completo con detergentes, desinfectantes y utensilios de limpieza para el hogar",
    categoria: "Limpieza",
    precio_coins: 150,
    precio_pesos: 299,
    imagen_url: "/productos/kit-limpieza.jpg",
    disponible: true,
    stock: 25,
    popularidad: 85,
    descuento: 10,
    etiquetas: ["Popular", "Descuento", "Eco-friendly"],
    vendedor: "Edificio",
    fecha_agregado: "2025-09-15",
    calificacion: 4.5,
    ventas_totales: 342
  },
  {
    id_producto: 2,
    nombre: "Bombillas LED Inteligentes",
    descripcion: "Pack de 4 bombillas LED inteligentes con control por app y diferentes colores",
    categoria: "Tecnologia",
    precio_coins: 200,
    precio_pesos: 450,
    imagen_url: "/productos/bombillas-led.jpg",
    disponible: true,
    stock: 18,
    popularidad: 92,
    etiquetas: ["Nuevo", "Smart Home", "Ahorro energético"],
    vendedor: "Externo",
    fecha_agregado: "2025-09-20",
    calificacion: 4.8,
    ventas_totales: 156
  },
  {
    id_producto: 3,
    nombre: "Plantas Decorativas",
    descripcion: "Selección de plantas de interior perfectas para decorar tu departamento",
    categoria: "Decoracion",
    precio_coins: 80,
    precio_pesos: 180,
    imagen_url: "/productos/plantas.jpg",
    disponible: true,
    stock: 12,
    popularidad: 78,
    etiquetas: ["Natural", "Decorativo"],
    vendedor: "Residente",
    fecha_agregado: "2025-09-10",
    calificacion: 4.3,
    ventas_totales: 89
  },
  {
    id_producto: 4,
    nombre: "Servicio de Plomería",
    descripcion: "Reparaciones menores de plomería realizadas por profesional certificado",
    categoria: "Servicios",
    precio_coins: 300,
    precio_pesos: 600,
    imagen_url: "/productos/plomeria.jpg",
    disponible: true,
    stock: 5,
    popularidad: 95,
    etiquetas: ["Profesional", "Garantizado"],
    vendedor: "Edificio",
    fecha_agregado: "2025-08-25",
    calificacion: 4.9,
    ventas_totales: 67
  },
  {
    id_producto: 5,
    nombre: "Detector de Humo Inteligente",
    descripcion: "Detector de humo con conectividad WiFi y notificaciones móviles",
    categoria: "Seguridad",
    precio_coins: 250,
    precio_pesos: 520,
    imagen_url: "/productos/detector-humo.jpg",
    disponible: false,
    stock: 0,
    popularidad: 87,
    etiquetas: ["Seguridad", "Smart Home"],
    vendedor: "Edificio",
    fecha_agregado: "2025-09-05",
    calificacion: 4.6,
    ventas_totales: 234
  },
  {
    id_producto: 6,
    nombre: "Microondas Compacto",
    descripcion: "Microondas de 20L perfecto para espacios pequeños",
    categoria: "Electrodomesticos",
    precio_coins: 500,
    precio_pesos: 1200,
    imagen_url: "/productos/microondas.jpg",
    disponible: true,
    stock: 3,
    popularidad: 73,
    descuento: 15,
    etiquetas: ["Compacto", "Descuento"],
    vendedor: "Externo",
    fecha_agregado: "2025-09-12",
    calificacion: 4.2,
    ventas_totales: 45
  },
  {
    id_producto: 7,
    nombre: "Semillas y Fertilizante",
    descripcion: "Kit de jardinería con semillas orgánicas y fertilizante natural",
    categoria: "Jardineria",
    precio_coins: 60,
    precio_pesos: 120,
    imagen_url: "/productos/semillas.jpg",
    disponible: true,
    stock: 30,
    popularidad: 65,
    etiquetas: ["Orgánico", "Sostenible"],
    vendedor: "Residente",
    fecha_agregado: "2025-09-18",
    calificacion: 4.0,
    ventas_totales: 78
  },
  {
    id_producto: 8,
    nombre: "Desayuno Saludable",
    descripcion: "Box de desayuno con productos orgánicos y locales",
    categoria: "Alimentacion",
    precio_coins: 120,
    precio_pesos: 250,
    imagen_url: "/productos/desayuno.jpg",
    disponible: true,
    stock: 8,
    popularidad: 89,
    etiquetas: ["Orgánico", "Local", "Fresco"],
    vendedor: "Residente",
    fecha_agregado: "2025-09-22",
    calificacion: 4.7,
    ventas_totales: 123
  }
]

// 🛒 COMPRAS MOCK DATA
export const mockCompras: Compra[] = [
  {
    id_compra: 1,
    id_producto: 1,
    id_residente: 101,
    cantidad: 2,
    precio_total_coins: 270, // Con descuento
    precio_total_pesos: 538,
    metodo_pago: "HabiCoins",
    estado: "Entregado",
    fecha_compra: "2025-09-25",
    fecha_entrega: "2025-09-26",
    calificacion: 5
  },
  {
    id_compra: 2,
    id_producto: 2,
    id_residente: 102,
    cantidad: 1,
    precio_total_coins: 200,
    precio_total_pesos: 450,
    metodo_pago: "Pesos",
    estado: "En_Camino",
    fecha_compra: "2025-09-28",
    comentarios: "Entrega urgente por favor"
  },
  {
    id_compra: 3,
    id_producto: 4,
    id_residente: 103,
    cantidad: 1,
    precio_total_coins: 300,
    precio_total_pesos: 600,
    metodo_pago: "Mixto",
    estado: "Procesando",
    fecha_compra: "2025-09-30"
  }
]

// 📊 ESTADÍSTICAS DE TIENDA
export const mockTiendaStats = {
  totalProductos: mockProductos.filter(p => p.disponible).length,
  productosAgotados: mockProductos.filter(p => !p.disponible || p.stock === 0).length,
  ventasDelMes: 892,
  ingresosTotales: 15640,
  ingresosCoins: 8920,
  ingresosPesos: 6720,
  productoMasVendido: mockProductos.find(p => p.id_producto === 1),
  categoriaPopular: "Limpieza" as ProductoCategoria,
  promedioCalificaciones: 4.5,
  clientesActivos: 245,
  pedidosPendientes: mockCompras.filter(c => c.estado !== "Entregado").length
}

// 🏆 PRODUCTOS DESTACADOS
export const productosDestacados = mockProductos
  .filter(p => p.disponible)
  .sort((a, b) => b.popularidad - a.popularidad)
  .slice(0, 4)

// 🔥 PRODUCTOS EN OFERTA
export const productosEnOferta = mockProductos
  .filter(p => p.disponible && p.descuento && p.descuento > 0)

// 📈 CATEGORÍAS CON ESTADÍSTICAS
export const categoriasConStats = [
  "Mantenimiento",
  "Limpieza", 
  "Seguridad",
  "Electrodomesticos",
  "Decoracion",
  "Jardineria",
  "Tecnologia",
  "Servicios",
  "Alimentacion"
].map(categoria => ({
  nombre: categoria as ProductoCategoria,
  productos: mockProductos.filter(p => p.categoria === categoria),
  productosDisponibles: mockProductos.filter(p => p.categoria === categoria && p.disponible).length,
  ventasTotales: mockProductos
    .filter(p => p.categoria === categoria)
    .reduce((sum, p) => sum + p.ventas_totales, 0)
}))

export default {
  mockProductos,
  mockCompras,
  mockTiendaStats,
  productosDestacados,
  productosEnOferta,
  categoriasConStats
}