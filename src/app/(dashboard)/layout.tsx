import { Store, LogOut, Plus, LayoutDashboard } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function DashboardLayout({
  children,
}: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const signOut = async () => {
    "use server"
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect("/")
  }

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 border-r border-border bg-muted/30 p-4 flex flex-col gap-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 font-semibold text-lg"
        >
          <Store className="size-5" />
          Vitrina
        </Link>

        <nav className="flex flex-col gap-1 flex-1">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-muted transition-colors"
          >
            <LayoutDashboard className="size-4" />
            Dashboard
          </Link>
          <Link
            href="/dashboard/catalogo"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-muted transition-colors"
          >
            <Store className="size-4" />
            Mis catálogos
          </Link>
          <Link
            href="/dashboard/catalogo/nuevo"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-muted transition-colors"
          >
            <Plus className="size-4" />
            Nuevo catálogo
          </Link>
        </nav>

        <form action={signOut}>
          <Button variant="outline" className="w-full justify-start" size="sm">
            <LogOut className="size-4" />
            Cerrar sesión
          </Button>
        </form>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  )
}
