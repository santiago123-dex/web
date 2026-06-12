import { createClient } from "@/lib/supabase/server"
import { Store, Eye, Package } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single()

  const { data: catalogos } = await supabase
    .from("catalogos")
    .select("*, productos:productos(count)")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })

  const totalVisitas = catalogos?.reduce(
    (sum, c) => sum + (c.visitas ?? 0),
    0,
  ) ?? 0

  const totalProductos = catalogos?.reduce(
    (sum, c) => sum + (c.productos?.[0]?.count ?? 0),
    0,
  ) ?? 0

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">
          Hola, {profile?.nombre_negocio ?? "bienvenido"}
        </h1>
        <p className="text-muted-foreground">
          Así va tu negocio en Vitrina
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Catálogos
            </CardTitle>
            <Store className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{catalogos?.length ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Productos
            </CardTitle>
            <Package className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalProductos}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Visitas totales
            </CardTitle>
            <Eye className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalVisitas}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Tus catálogos</h2>
        <Link href="/dashboard/catalogo/nuevo">
          <Button size="sm">+ Nuevo</Button>
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
        <div className="space-y-3">
          {catalogos.map((catalogo) => (
            <Link
              key={catalogo.id}
              href={`/dashboard/catalogo/${catalogo.id}`}
              className="block"
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <h3 className="font-medium">{catalogo.nombre}</h3>
                    <p className="text-sm text-muted-foreground">
                      {catalogo.visitas ?? 0} visitas · {catalogo.slug}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {!catalogo.activo && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                        Inactivo
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
