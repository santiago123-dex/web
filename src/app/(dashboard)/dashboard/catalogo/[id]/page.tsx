import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ProductoItem } from "@/components/catalogo/producto-item"
import { AgregarProductoForm } from "@/components/catalogo/agregar-producto-form"

export default async function CatalogoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: catalogo } = await supabase
    .from("catalogos")
    .select("*")
    .eq("id", id)
    .single()

  if (!catalogo) notFound()

  const { data: productos } = await supabase
    .from("productos")
    .select("*")
    .eq("catalogo_id", id)
    .order("orden", { ascending: true })

  const url = `${process.env.NEXT_PUBLIC_SITE_URL}/c/${catalogo.slug}`
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`Mirá mi catálogo: ${url}`)}`

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{catalogo.nombre}</h1>
          {catalogo.descripcion && (
            <p className="text-muted-foreground">{catalogo.descripcion}</p>
          )}
        </div>
        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
          <Button>Compartir por WhatsApp</Button>
        </a>
      </div>

      <div className="grid gap-4 mb-8">
        {productos && productos.length > 0 ? (
          productos.map((producto) => (
            <ProductoItem key={producto.id} producto={producto} />
          ))
        ) : (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Todavía no agregaste productos
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Plus className="size-4" />
            Agregar producto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AgregarProductoForm catalogoId={id} />
        </CardContent>
      </Card>
    </div>
  )
}
