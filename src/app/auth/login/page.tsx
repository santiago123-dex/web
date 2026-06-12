import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Store } from "lucide-react"

export default async function LoginPage() {
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

        <form action={signIn} className="w-full">
          <Button className="w-full" size="lg">
            Continuar con Google
          </Button>
        </form>
      </div>
    </div>
  )
}
