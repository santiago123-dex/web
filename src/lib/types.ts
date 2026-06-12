export type Profile = {
  id: string
  nombre_negocio: string
  descripcion: string | null
  telefono: string | null
  whatsapp: string | null
  instagram: string | null
  website: string | null
  horarios: string | null
  color_primario: string
  color_secundario: string
  logo_url: string | null
  cover_url: string | null
  subdominio: string | null
  created_at: string
}

export type Catalogo = {
  id: string
  user_id: string
  nombre: string
  descripcion: string | null
  slug: string
  activo: boolean
  visitas: number
  created_at: string
}

export type Categoria = {
  id: string
  catalogo_id: string
  nombre: string
  descripcion: string | null
  icono: string
  orden: number
  created_at: string
}

export type ProductBadge = "nuevo" | "oferta" | "agotado" | null

export type Producto = {
  id: string
  catalogo_id: string
  categoria_id: string | null
  nombre: string
  descripcion: string | null
  precio: number
  imagen_url: string | null
  badge: ProductBadge
  destacado: boolean
  disponible: boolean
  clicks: number
  orden: number
  created_at: string
}

export type CatalogoWithProfile = Catalogo & {
  profile: Profile | null
}

export type ProductoWithCategoria = Producto & {
  categoria: Categoria | null
}
