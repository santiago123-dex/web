export type Profile = {
  id: string
  nombre_negocio: string
  descripcion: string | null
  telefono: string | null
  whatsapp: string | null
  instagram: string | null
  color_primario: string
  logo_url: string | null
  subdominio: string | null
  created_at: string
}

export type Producto = {
  id: string
  catalogo_id: string
  nombre: string
  descripcion: string | null
  precio: number
  imagen_url: string | null
  disponible: boolean
  orden: number
  created_at: string
}

export type Catalogo = {
  id: string
  user_id: string
  nombre: string
  descripcion: string | null
  slug: string
  activo: boolean
  created_at: string
}
