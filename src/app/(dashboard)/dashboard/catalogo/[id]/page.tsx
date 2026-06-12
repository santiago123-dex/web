import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Plus, Share2, Settings, ExternalLink } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ProductoList } from "@/components/catalogo/producto-list"
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

  const { data: categorias } = await supabase
    .from("categorias")
    .select("*")
    .eq("catalogo_id", id)
    .order("orden", { ascending: true })

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
          <p className="text-xs text-muted-foreground mt-1">
            {catalogo.visitas} visitas · slug: /c/{catalogo.slug}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/c/${catalogo.slug}`} target="_blank">
            <Button variant="outline" size="sm">
              <ExternalLink className="size-3" />
              Ver
            </Button>
          </Link>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="sm">
              <Share2 className="size-3" />
              Compartir
            </Button>
          </a>
          <Link href={`/dashboard/catalogo/${id}/configuracion`}>
            <Button variant="outline" size="sm">
              <Settings className="size-3" />
              Configurar
            </Button>
          </Link>
        </div>
      </div>

      <Separator className="mb-6" />

      {/* Categorías */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Categorías</h2>
          <form
            action={async (formData: FormData) => {
              "use server"
              const nombre = formData.get("nombre") as string
              if (!nombre?.trim()) return
              const supabase = await createClient()
              await supabase.from("categorias").insert({
                catalogo_id: id,
                nombre: nombre.trim(),
                orden: (categorias?.length ?? 0) + 1,
              })
            }}
            className="flex items-center gap-2"
          >
            <input
              name="nombre"
              placeholder="Nueva categoría..."
              className="h-8 text-sm rounded-lg border border-border px-2 bg-background"
            />
            <Button type="submit" size="sm" variant="outline">
              <Plus className="size-3" />
              Agregar
            </Button>
          </form>
        </div>
        <div className="flex flex-wrap gap-2">
          {categorias && categorias.length > 0 ? (
            categorias.map((cat) => (
              <span
                key={cat.id}
                className="inline-flex items-center gap-1 rounded-full border bg-muted/50 px-3 py-1 text-sm"
              >
                {cat.icono} {cat.nombre}
              </span>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              Sin categorías — los productos aparecen sin agrupar
            </p>
          )}
        </div>
      </div>

      <Separator className="mb-6" />

      {/* Productos */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Productos</h2>
        {productos && productos.length > 0 ? (
          <ProductoList productos={productos} categorias={categorias ?? []} />
        ) : (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Todavía no agregaste productos
            </CardContent>
          </Card>
        )}
      </div>

      <Separator className="mb-6" />

      {/* Agregar producto */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Plus className="size-4" />
            Agregar producto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AgregarProductoForm
            catalogoId={id}
            categorias={categorias ?? []}
          />
        </CardContent>
      </Card>
    </div>
  )
}
