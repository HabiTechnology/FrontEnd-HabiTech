"use client"

import React, { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Package, DollarSign, Filter, Search, Plus, Edit, Trash2, AlertTriangle } from "lucide-react"
import { mockProductos } from "@/data/tienda-mock"
import { Producto, ProductoCategoria } from "@/types/tienda"
import { Bullet } from "@/components/ui/bullet"

export default function TiendaCatalogo() {
  const [productos, setProductos] = useState(mockProductos)
  const [filtroCategoria, setFiltroCategoria] = useState<ProductoCategoria | "Todas">("Todas")
  const [searchTerm, setSearchTerm] = useState("")
  const [showProductDialog, setShowProductDialog] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null)

  const categorias: (ProductoCategoria | "Todas")[] = [
    "Todas", "Mantenimiento", "Limpieza", "Seguridad", "Electrodomesticos", 
    "Decoracion", "Jardineria", "Tecnologia", "Servicios", "Alimentacion"
  ]

  const productosFiltrados = productos.filter(producto => {
    const matchesCategory = filtroCategoria === "Todas" || producto.categoria === filtroCategoria
    const matchesSearch = producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         producto.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const getCategoriaColor = (categoria: ProductoCategoria) => {
    const colors = {
      "Mantenimiento": "bg-blue-500",
      "Limpieza": "bg-green-500",
      "Seguridad": "bg-red-500",
      "Electrodomesticos": "bg-purple-500",
      "Decoracion": "bg-pink-500",
      "Jardineria": "bg-emerald-500",
      "Tecnologia": "bg-cyan-500",
      "Servicios": "bg-orange-500",
      "Alimentacion": "bg-yellow-500"
    }
    return colors[categoria] || "bg-gray-500"
  }

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: "Sin Stock", color: "bg-red-500", textColor: "text-red-700" }
    if (stock < 10) return { label: "Stock Bajo", color: "bg-yellow-500", textColor: "text-yellow-700" }
    return { label: "En Stock", color: "bg-green-500", textColor: "text-green-700" }
  }

  const actualizarStock = (id: number, nuevoStock: number) => {
    setProductos(prev => 
      prev.map(producto => 
        producto.id_producto === id 
          ? { ...producto, stock: Math.max(0, nuevoStock) }
          : producto
      )
    )
  }

  const verDetallesProducto = (producto: Producto) => {
    setSelectedProduct(producto)
    setShowProductDialog(true)
  }

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border shadow-md">
        <CardHeader className="border-b border-border/30 pb-3">
          <CardTitle className="flex items-center gap-2.5 text-card-foreground">
            <Bullet variant="default" />
            GESTIÃ“N DE INVENTARIO
          </CardTitle>
          <CardDescription>
            Administra los productos disponibles en el edificio usando HabiCoins
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-6">
          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="min-w-[200px]">
              <Select value={filtroCategoria} onValueChange={(value) => setFiltroCategoria(value as ProductoCategoria | "Todas")}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filtrar por categorÃ­a" />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map((categoria) => (
                    <SelectItem key={categoria} value={categoria}>
                      {categoria}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Grid de Productos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {productosFiltrados.map((producto) => {
              const stockStatus = getStockStatus(producto.stock)
              
              return (
                <Card key={producto.id_producto} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-square relative bg-muted/50 flex items-center justify-center">
                    <Package className="h-12 w-12 text-muted-foreground" />
                    <Badge 
                      className={`absolute top-2 left-2 ${getCategoriaColor(producto.categoria)} text-white`}
                    >
                      {producto.categoria}
                    </Badge>
                  </div>
                  
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-sm mb-2 line-clamp-2">
                      {producto.nombre}
                    </h3>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Precio:</span>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3 text-primary" />
                          <span className="font-bold text-primary text-sm">
                            {producto.precio_coins} HC
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Stock:</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={`${stockStatus.textColor} border-current`}>
                            {producto.stock} unidades
                          </Badge>
                          {producto.stock < 10 && (
                            <AlertTriangle className="h-3 w-3 text-yellow-500" />
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => verDetallesProducto(producto)}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Ver
                      </Button>
                      <div className="flex">
                        <Button
                          variant="outline"
                          size="sm"
                          className="px-2"
                          onClick={() => actualizarStock(producto.id_producto, producto.stock - 1)}
                          disabled={producto.stock === 0}
                        >
                          -
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="px-2"
                          onClick={() => actualizarStock(producto.id_producto, producto.stock + 1)}
                        >
                          +
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {productosFiltrados.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                No se encontraron productos
              </h3>
              <p className="text-muted-foreground">
                {searchTerm || filtroCategoria !== "Todas" 
                  ? "Intenta ajustar los filtros de bÃºsqueda" 
                  : "No hay productos disponibles en este momento"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Detalles del Producto */}
      <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles del Producto</DialogTitle>
            <DialogDescription>
              InformaciÃ³n completa del producto en inventario
            </DialogDescription>
          </DialogHeader>
          
          {selectedProduct && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Nombre</Label>
                  <p className="text-sm">{selectedProduct.nombre}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">CategorÃ­a</Label>
                  <Badge className={`${getCategoriaColor(selectedProduct.categoria)} text-white`}>
                    {selectedProduct.categoria}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Precio (HabiCoins)</Label>
                  <p className="text-sm font-bold text-primary">{selectedProduct.precio_coins} HC</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Stock Actual</Label>
                  <p className="text-sm font-bold">{selectedProduct.stock} unidades</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Vendedor</Label>
                  <p className="text-sm">{selectedProduct.vendedor}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Fecha Agregado</Label>
                  <p className="text-sm">{selectedProduct.fecha_agregado}</p>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">DescripciÃ³n</Label>
                <p className="text-sm mt-1">{selectedProduct.descripcion}</p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => actualizarStock(selectedProduct.id_producto, selectedProduct.stock - 1)}
                  disabled={selectedProduct.stock === 0}
                >
                  Reducir Stock
                </Button>
                <Button
                  variant="outline"
                  onClick={() => actualizarStock(selectedProduct.id_producto, selectedProduct.stock + 1)}
                >
                  Aumentar Stock
                </Button>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowProductDialog(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
