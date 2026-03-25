export type Categoria = 'Motor' | 'Frenos' | 'Suspension' | 'Electrico' | 'Accesorios' | 'Equipamiento' | 'Motos' | 'Otro'
export type Condicion = 'nuevo' | 'usado'

export interface Vendedor {
  id: string
  user_id: string
  nombre_tienda: string
  tipo: 'particular' | 'tienda'
  ubicacion: string | null
  descripcion: string | null
  verificado: boolean
  rating_promedio: number
  total_ventas: number
  foto_url: string | null
  created_at: string
}

export interface Producto {
  id: string
  vendedor_id: string
  titulo: string
  descripcion: string | null
  precio: number
  categoria: Categoria
  condicion: Condicion
  motos_compatibles: string[] | null
  fotos: string[] | null
  stock: number
  estado: 'activo' | 'vendido' | 'pausado'
  vistas: number
  created_at: string
  vendedor?: Pick<Vendedor, 'nombre_tienda' | 'tipo' | 'verificado' | 'ubicacion' | 'rating_promedio' | 'user_id'>
}

export const CATEGORIAS: Categoria[] = ['Motor','Frenos','Suspension','Electrico','Accesorios','Equipamiento','Motos','Otro']

export const COMISION_POR_PRECIO = (precio: number) => {
  if (precio < 50) return 0.03
  if (precio <= 200) return 0.025
  return 0.02
}
