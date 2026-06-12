import { createClient } from "@/lib/supabase/server"
import { Plus, ExternalLink, Share2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function CatalogosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: catalogos } = await supabase
    .from("catalogos")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Mis catálogos</h1>
        <Link href="/dashboard/catalogo/nuevo">
          <Button>
            <Plus className="size-4" />
            Nuevo catálogo
          </Button>
        </Link>
      </div>

      {!catalogos || catalogos.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground mb-4">
            Todavía no tenés ningún catálogo
          </p>
          <Link href="/dashboard/catalogo/nuevo">
            <Button>Crear mi primer catálogo</Button>
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {catalogos.map((catalogo) => (
            <Card key={catalogo.id}>
              <CardHeader>
                <CardTitle>{catalogo.nombre}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {catalogo.descripcion || "Sin descripción"}
                </p>
                <div className="flex gap-2">
                  <Link
                    href={`/c/${catalogo.slug}`}
                    target="_blank"
                  >
                    <Button variant="outline" size="sm">
                      <ExternalLink className="size-3" />
                      Ver
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm">
                    <Share2 className="size-3" />
                    Compartir
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
