import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Store, ShieldAlert } from "lucide-react"

export default async function LoginPage(props: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await props.searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect("/dashboard")
  }

  const signIn = async () => {
    "use server"
    const supabase = await createClient()
    const { data } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    })

    if (data.url) {
      redirect(data.url)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm flex flex-col items-center gap-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold text-xl"
        >
          <Store className="size-6 text-primary" />
          Vitrina
        </Link>

        <div className="text-center">
          <h1 className="text-2xl font-bold mb-1">Empezá gratis</h1>
          <p className="text-sm text-muted-foreground">
            No necesitas tarjeta de crédito
          </p>
        </div>

        {error === "not_authorized" && (
          <div className="w-full flex items-start gap-3 p-4 rounded-lg border border-red-200 bg-red-50 text-sm text-red-800">
            <ShieldAlert className="size-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Acceso restringido</p>
              <p className="text-red-600">
                Tu correo no está autorizado para acceder a esta aplicación.
              </p>
            </div>
          </div>
        )}

        <form action={signIn} className="w-full">
          <Button className="w-full" size="lg">
            Continuar con Google
          </Button>
        </form>
      </div>
    </div>
  )
}
