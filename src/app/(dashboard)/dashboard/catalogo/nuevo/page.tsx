import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function NuevoCatalogoPage() {
  const createCatalogo = async (formData: FormData) => {
    "use server"
    const nombre = formData.get("nombre") as string
    const descripcion = formData.get("descripcion") as string
    const slug = nombre
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from("catalogos")
      .insert({ nombre, descripcion, slug, user_id: user.id })
      .select()
      .single()

    if (data) {
      redirect(`/dashboard/catalogo/${data.id}`)
    }
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold mb-6">Nuevo catálogo</h1>
      <form action={createCatalogo} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="nombre">Nombre del catálogo</Label>
          <Input
            id="nombre"
            name="nombre"
            placeholder="Ej: Ropa de verano 2025"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="descripcion">Descripción</Label>
          <Textarea
            id="descripcion"
            name="descripcion"
            placeholder="Contale a tus clientes de qué se trata..."
          />
        </div>
        <Button type="submit">Crear catálogo</Button>
      </form>
    </div>
  )
}
