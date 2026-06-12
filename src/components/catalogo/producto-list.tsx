import type { Producto, Categoria } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Eye, Star, Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function ProductoList({
  productos,
  categorias,
}: {
  productos: Producto[]
  categorias: Categoria[]
}) {
  const grouped = productos.reduce(
    (acc, p) => {
      const key = p.categoria_id ?? "sin-categoria"
      if (!acc[key]) acc[key] = []
      acc[key].push(p)
      return acc
    },
    {} as Record<string, Producto[]>,
  )

  const getCategoriaName = (id: string) => {
    if (id === "sin-categoria") return "Sin categoría"
    const cat = categorias.find((c) => c.id === id)
    return cat ? `${cat.icono} ${cat.nombre}` : "Sin categoría"
  }

  const toggleDestacado = async (productoId: string, current: boolean) => {
    "use server"
    const supabase = await createClient()
    await supabase
      .from("productos")
      .update({ destacado: !current })
      .eq("id", productoId)
    revalidatePath("/dashboard/catalogo/[id]")
  }

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([categoriaId, items]) => (
        <div key={categoriaId}>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            {getCategoriaName(categoriaId)} ({items.length})
          </h3>
          <div className="space-y-2">
            {items.map((producto) => (
              <form key={producto.id}>
                <Card
                  className={`${producto.destacado ? "ring-2 ring-primary/30" : ""}`}
                >
                  <CardContent className="flex items-center gap-4 p-3">
                    {producto.imagen_url && (
                      <div className="size-16 rounded-lg overflow-hidden shrink-0 bg-muted">
                        <img
                          src={producto.imagen_url}
                          alt={producto.nombre}
                          className="size-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-sm truncate">
                          {producto.nombre}
                        </h4>
                        {producto.badge && (
                          <Badge variant={producto.badge}>
                            {producto.badge === "nuevo"
                              ? "Nuevo"
                              : producto.badge === "oferta"
                                ? "Oferta"
                                : "Agotado"}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        ${producto.precio.toFixed(2)}
                        {producto.clicks > 0 && (
                          <span className="ml-2 inline-flex items-center gap-1">
                            <Eye className="size-3" /> {producto.clicks}
                          </span>
                        )}
                      </p>
                    </div>
                    <button
                      formAction={async () => {
                        "use server"
                        await toggleDestacado(
                          producto.id,
                          producto.destacado,
                        )
                      }}
                      className={`p-1.5 rounded-md transition-colors ${
                        producto.destacado
                          ? "text-yellow-500 bg-yellow-50"
                          : "text-muted-foreground hover:bg-muted"
                      }`}
                      title={
                        producto.destacado
                          ? "Quitar destacado"
                          : "Marcar como destacado"
                      }
                    >
                      <Star
                        className="size-4"
                        fill={
                          producto.destacado ? "currentColor" : "none"
                        }
                      />
                    </button>
                  </CardContent>
                </Card>
              </form>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
