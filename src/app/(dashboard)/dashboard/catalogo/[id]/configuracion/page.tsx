import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default async function ConfigPage({
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

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", catalogo.user_id)
    .single()

  const updateCatalogo = async (formData: FormData) => {
    "use server"
    const supabase = await createClient()
    const nombre = formData.get("nombre") as string
    const descripcion = formData.get("descripcion") as string
    const activo = formData.get("activo") === "on"

    await supabase
      .from("catalogos")
      .update({ nombre, descripcion, activo })
      .eq("id", id)

    redirect(`/dashboard/catalogo/${id}`)
  }

  const updateProfile = async (formData: FormData) => {
    "use server"
    const supabase = await createClient()
    const data = {
      whatsapp: formData.get("whatsapp") as string,
      instagram: formData.get("instagram") as string,
      website: formData.get("website") as string,
      horarios: formData.get("horarios") as string,
      color_primario: (formData.get("color_primario") as string) || "#8b5cf6",
      color_secundario:
        (formData.get("color_secundario") as string) || "#f0f0ff",
    }
    await supabase.from("profiles").update(data).eq("id", profile!.id)
    redirect(`/dashboard/catalogo/${id}`)
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Configuración</h1>
        <p className="text-muted-foreground">
          Personalizá tu catálogo {catalogo.nombre}
        </p>
      </div>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Información del catálogo</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updateCatalogo} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                name="nombre"
                defaultValue={catalogo.nombre}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                name="descripcion"
                defaultValue={catalogo.descripcion ?? ""}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                id="activo"
                name="activo"
                type="checkbox"
                defaultChecked={catalogo.activo}
                className="size-4 rounded border-border"
              />
              <Label htmlFor="activo" className="text-sm cursor-pointer">
                Catálogo activo (visible para el público)
              </Label>
            </div>
            <Button type="submit">Guardar cambios</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tu negocio</CardTitle>
          <p className="text-sm text-muted-foreground">
            Esta información se muestra en la página pública del catálogo
          </p>
        </CardHeader>
        <CardContent>
          <form action={updateProfile} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="whatsapp">
                  WhatsApp (código de área + número)
                </Label>
                <Input
                  id="whatsapp"
                  name="whatsapp"
                  placeholder="5491123456789"
                  defaultValue={profile?.whatsapp ?? ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram</Label>
                <Input
                  id="instagram"
                  name="instagram"
                  placeholder="@tunegocio"
                  defaultValue={profile?.instagram ?? ""}
                />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  name="website"
                  placeholder="https://tunegocio.com"
                  defaultValue={profile?.website ?? ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="horarios">Horarios de atención</Label>
                <Input
                  id="horarios"
                  name="horarios"
                  placeholder="Lun–Vie 9:00–18:00"
                  defaultValue={profile?.horarios ?? ""}
                />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="color_primario">Color principal</Label>
                <Input
                  id="color_primario"
                  name="color_primario"
                  type="color"
                  defaultValue={profile?.color_primario ?? "#8b5cf6"}
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="color_secundario">
                  Color secundario (fondo)
                </Label>
                <Input
                  id="color_secundario"
                  name="color_secundario"
                  type="color"
                  defaultValue={profile?.color_secundario ?? "#f0f0ff"}
                  className="h-10"
                />
              </div>
            </div>
            <Button type="submit">Guardar cambios</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
