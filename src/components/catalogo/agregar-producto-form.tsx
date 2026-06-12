"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { toast } from "sonner"
import type { Categoria } from "@/lib/types"

export function AgregarProductoForm({
  catalogoId,
  categorias,
}: {
  catalogoId: string
  categorias: Categoria[]
}) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const form = e.currentTarget
    const formData = new FormData(form)

    const nombre = formData.get("nombre") as string
    const descripcion = formData.get("descripcion") as string
    const precio = parseFloat(formData.get("precio") as string)
    const categoria_id = formData.get("categoria_id") as string
    const badge = formData.get("badge") as string
    const destacado = formData.get("destacado") === "on"
    const imagen = formData.get("imagen") as File | null

    let imagen_url: string | null = null

    if (imagen && imagen.size > 0) {
      const fileExt = imagen.name.split(".").pop()
      const filePath = `${catalogoId}/${crypto.randomUUID()}.${fileExt}`
      const { data: uploadData } = await supabase.storage
        .from("productos")
        .upload(filePath, imagen)

      if (uploadData) {
        const { data: urlData } = supabase.storage
          .from("productos")
          .getPublicUrl(uploadData.path)
        imagen_url = urlData.publicUrl
      }
    }

    const { error } = await supabase.from("productos").insert({
      catalogo_id: catalogoId,
      categoria_id: categoria_id || null,
      nombre,
      descripcion: descripcion || null,
      precio,
      imagen_url,
      badge: badge || null,
      destacado,
      orden: 0,
    })

    if (error) {
      toast.error("Error al agregar el producto")
    } else {
      toast.success("Producto agregado")
      form.reset()
      router.refresh()
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nombre">Nombre del producto</Label>
          <Input id="nombre" name="nombre" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="precio">Precio ($)</Label>
          <Input
            id="precio"
            name="precio"
            type="number"
            step="0.01"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="descripcion">Descripción</Label>
        <Textarea id="descripcion" name="descripcion" />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="categoria_id">Categoría</Label>
          <Select id="categoria_id" name="categoria_id">
            <option value="">Sin categoría</option>
            {categorias.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.icono} {cat.nombre}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="badge">Etiqueta</Label>
          <Select id="badge" name="badge">
            <option value="">Sin etiqueta</option>
            <option value="nuevo">Nuevo</option>
            <option value="oferta">Oferta</option>
            <option value="agotado">Agotado</option>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="imagen">Imagen</Label>
        <Input id="imagen" name="imagen" type="file" accept="image/*" />
      </div>

      <div className="flex items-center gap-2">
        <input
          id="destacado"
          name="destacado"
          type="checkbox"
          className="size-4 rounded border-border"
        />
        <Label htmlFor="destacado" className="text-sm cursor-pointer">
          Destacar este producto (aparece primero)
        </Label>
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "Agregando..." : "Agregar producto"}
      </Button>
    </form>
  )
}
