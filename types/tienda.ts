export interface Producto {
  id_producto: number
  nombre: string
  descripcion: string
  categoria: ProductoCategoria
  precio_coins: number
  precio_pesos: number
  imagen_url: string
  disponible: boolean
  stock: number
  popularidad: number
  descuento?: number
  etiquetas: string[]
  vendedor: "Edificio" | "Residente" | "Externo"
  fecha_agregado: string
  calificacion: number
  ventas_totales: number
}

export type ProductoCategoria = 
  | "Mantenimiento"
  | "Limpieza" 
  | "Seguridad"
  | "Electrodomesticos"
  | "Decoracion"
  | "Jardineria"
  | "Tecnologia"
  | "Servicios"
  | "Alimentacion"

export interface Compra {
  id_compra: number
  id_producto: number
  id_residente: number
  cantidad: number
  precio_total_coins: number
  precio_total_pesos: number
  metodo_pago: "HabiCoins" | "Pesos" | "Mixto"
  estado: CompraEstado
  fecha_compra: string
  fecha_entrega?: string
  comentarios?: string
  calificacion?: number
}

export type CompraEstado = 
  | "Pendiente"
  | "Procesando"
  | "En_Camino"
  | "Entregado"
  | "Cancelado"

export interface CarritoItem {
  producto: Producto
  cantidad: number
}

export interface WalletInfo {
  id_residente: number
  saldo_coins: number
  saldo_pesos: number
  transacciones_recientes: Transaccion[]
  nivel_membresia: "Bronce" | "Plata" | "Oro" | "Platino"
  descuento_nivel: number
}

export interface Transaccion {
  id_transaccion: number
  tipo: "Ganancia" | "Gasto" | "Transferencia" | "Recompensa"
  cantidad_coins: number
  descripcion: string
  fecha: string
  producto_relacionado?: string
}

export interface TiendaStats {
  totalProductos: number
  ventasHoy: number
  coinsCirculacion: number
  usuariosActivos: number
  productoPopular: string
  ingresosMensuales: number
}
