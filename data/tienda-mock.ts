import { Producto, Compra, WalletInfo, TiendaStats, Transaccion } from "@/types/tienda"

export const mockProductos: Producto[] = [
  {
    id_producto: 1,
    nombre: "Kit de Limpieza Premium",
    descripcion: "Kit completo con productos de limpieza para departamento. Incluye detergente, desinfectante, y toallas microfibra.",
    categoria: "Limpieza",
    precio_coins: 150,
    precio_pesos: 450,
    imagen_url: "/placeholder.jpg",
    disponible: true,
    stock: 25,
    popularidad: 95,
    descuento: 10,
    etiquetas: ["Popular", "Eco-friendly", "Kit Completo"],
    vendedor: "Edificio",
    fecha_agregado: "2024-08-01",
    calificacion: 4.8,
    ventas_totales: 127
  },
  {
    id_producto: 2,
    nombre: "Servicio de Plomería Express",
    descripcion: "Servicio rápido de plomería para reparaciones menores. Incluye mano de obra y materiales básicos.",
    categoria: "Servicios",
    precio_coins: 300,
    precio_pesos: 900,
    imagen_url: "/placeholder.jpg",
    disponible: true,
    stock: 10,
    popularidad: 88,
    etiquetas: ["Urgente", "Profesional", "Garantizado"],
    vendedor: "Edificio",
    fecha_agregado: "2024-07-15",
    calificacion: 4.9,
    ventas_totales: 89
  },
  {
    id_producto: 3,
    nombre: "Smart Lock Digital",
    descripcion: "Cerradura inteligente con acceso por código y app móvil. Compatible con sistema del edificio.",
    categoria: "Seguridad",
    precio_coins: 800,
    precio_pesos: 2400,
    imagen_url: "/placeholder.jpg",
    disponible: true,
    stock: 8,
    popularidad: 92,
    descuento: 15,
    etiquetas: ["Tecnología", "Seguridad", "Smart Home"],
    vendedor: "Edificio",
    fecha_agregado: "2024-08-10",
    calificacion: 4.7,
    ventas_totales: 34
  },
  {
    id_producto: 4,
    nombre: "Plantas de Interior - Pack",
    descripcion: "Selección de 3 plantas purificadoras de aire ideales para departamentos. Incluye macetas y tierra.",
    categoria: "Jardineria",
    precio_coins: 200,
    precio_pesos: 600,
    imagen_url: "/placeholder.jpg",
    disponible: true,
    stock: 15,
    popularidad: 85,
    etiquetas: ["Natural", "Aire Limpio", "Decorativo"],
    vendedor: "Residente",
    fecha_agregado: "2024-08-05",
    calificacion: 4.6,
    ventas_totales: 67
  },
  {
    id_producto: 5,
    nombre: "Microondas Compacto",
    descripcion: "Microondas de 20L perfecto para espacios pequeños. Eficiencia energética A+.",
    categoria: "Electrodomesticos",
    precio_coins: 1200,
    precio_pesos: 3600,
    imagen_url: "/placeholder.jpg",
    disponible: true,
    stock: 5,
    popularidad: 78,
    etiquetas: ["Ahorro Espacio", "Eficiente", "Garantía"],
    vendedor: "Externo",
    fecha_agregado: "2024-07-28",
    calificacion: 4.5,
    ventas_totales: 23
  },
  {
    id_producto: 6,
    nombre: "Delivery de Desayuno Semanal",
    descripcion: "Desayunos frescos entregados a tu puerta toda la semana. Pan, frutas, lácteos y café.",
    categoria: "Alimentacion",
    precio_coins: 350,
    precio_pesos: 1050,
    imagen_url: "/placeholder.jpg",
    disponible: true,
    stock: 20,
    popularidad: 90,
    etiquetas: ["Fresco", "Semanal", "Conveniente"],
    vendedor: "Externo",
    fecha_agregado: "2024-08-12",
    calificacion: 4.9,
    ventas_totales: 156
  },
  {
    id_producto: 7,
    nombre: "Lámpara LED Inteligente",
    descripcion: "Lámpara con control de intensidad y color vía app. Compatible con Alexa y Google.",
    categoria: "Tecnologia",
    precio_coins: 400,
    precio_pesos: 1200,
    imagen_url: "/placeholder.jpg",
    disponible: true,
    stock: 12,
    popularidad: 87,
    descuento: 20,
    etiquetas: ["Smart", "RGB", "Ahorro Energía"],
    vendedor: "Edificio",
    fecha_agregado: "2024-08-08",
    calificacion: 4.4,
    ventas_totales: 45
  },
  {
    id_producto: 8,
    nombre: "Cuadros Decorativos Modernos",
    descripcion: "Set de 3 cuadros con diseños minimalistas para decorar tu sala o recámara.",
    categoria: "Decoracion",
    precio_coins: 250,
    precio_pesos: 750,
    imagen_url: "/placeholder.jpg",
    disponible: true,
    stock: 18,
    popularidad: 73,
    etiquetas: ["Moderno", "Arte", "Set de 3"],
    vendedor: "Residente",
    fecha_agregado: "2024-08-14",
    calificacion: 4.3,
    ventas_totales: 29
  }
]

export const mockCompras: Compra[] = [
  {
    id_compra: 1,
    id_producto: 1,
    id_residente: 101,
    cantidad: 2,
    precio_total_coins: 270,
    precio_total_pesos: 810,
    metodo_pago: "HabiCoins",
    estado: "Entregado",
    fecha_compra: "2024-08-20",
    fecha_entrega: "2024-08-21",
    calificacion: 5
  },
  {
    id_compra: 2,
    id_producto: 6,
    id_residente: 203,
    cantidad: 1,
    precio_total_coins: 350,
    precio_total_pesos: 1050,
    metodo_pago: "Mixto",
    estado: "En_Camino",
    fecha_compra: "2024-08-28"
  },
  {
    id_compra: 3,
    id_producto: 3,
    id_residente: 305,
    cantidad: 1,
    precio_total_coins: 680,
    precio_total_pesos: 2040,
    metodo_pago: "HabiCoins",
    estado: "Procesando",
    fecha_compra: "2024-08-30"
  }
]

export const mockWalletInfo: WalletInfo = {
  id_residente: 101,
  saldo_coins: 1250,
  saldo_pesos: 3500,
  nivel_membresia: "Oro",
  descuento_nivel: 15,
  transacciones_recientes: [
    {
      id_transaccion: 1,
      tipo: "Gasto",
      cantidad_coins: -270,
      descripcion: "Compra: Kit de Limpieza Premium x2",
      fecha: "2024-08-20",
      producto_relacionado: "Kit de Limpieza Premium"
    },
    {
      id_transaccion: 2,
      tipo: "Recompensa",
      cantidad_coins: 100,
      descripcion: "Recompensa por referir nuevo residente",
      fecha: "2024-08-18"
    },
    {
      id_transaccion: 3,
      tipo: "Ganancia",
      cantidad_coins: 50,
      descripcion: "Bono mensual de puntualidad en pagos",
      fecha: "2024-08-15"
    },
    {
      id_transaccion: 4,
      tipo: "Gasto",
      cantidad_coins: -150,
      descripcion: "Compra: Plantas de Interior - Pack",
      fecha: "2024-08-12",
      producto_relacionado: "Plantas de Interior - Pack"
    },
    {
      id_transaccion: 5,
      tipo: "Ganancia",
      cantidad_coins: 200,
      descripcion: "Participación en actividad comunitaria",
      fecha: "2024-08-10"
    }
  ]
}

export const mockTiendaStats: TiendaStats = {
  totalProductos: 8,
  ventasHoy: 12,
  coinsCirculacion: 45000,
  usuariosActivos: 68,
  productoPopular: "Kit de Limpieza Premium",
  ingresosMensuales: 125000
}
