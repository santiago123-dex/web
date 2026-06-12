import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Store, Share2, Smartphone } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b border-border">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold text-xl">
            <Store className="size-6 text-primary" />
            Vitrina
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="ghost">Iniciar sesión</Button>
            </Link>
            <Link href="/auth/login">
              <Button>Empezar gratis</Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="flex-1 flex flex-col items-center justify-center px-4 py-24 text-center max-w-3xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
          Vendé como profesional,{" "}
          <span className="text-primary">sin serlo</span>
        </h1>
        <p className="text-lg text-muted-foreground mb-8 max-w-xl">
          Creá tu catálogo digital en 2 minutos, compartilo por WhatsApp y
          mostrale a tus clientes lo profesional que sos.
        </p>
        <Link href="/auth/login">
          <Button size="lg" className="text-base">
            Creá tu catálogo gratis
          </Button>
        </Link>
      </section>

      <section className="border-t border-border py-16">
        <div className="max-w-5xl mx-auto px-4 grid sm:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center gap-3">
            <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Store className="size-6 text-primary" />
            </div>
            <h3 className="font-semibold">Creá tu catálogo</h3>
            <p className="text-sm text-muted-foreground">
              Subí tus productos con fotos, precios y descripciones en
              minutos.
            </p>
          </div>
          <div className="flex flex-col items-center text-center gap-3">
            <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Share2 className="size-6 text-primary" />
            </div>
            <h3 className="font-semibold">Compartilo al instante</h3>
            <p className="text-sm text-muted-foreground">
              Un solo link que mandás por WhatsApp y tus clientes ven todo
              ordenado.
            </p>
          </div>
          <div className="flex flex-col items-center text-center gap-3">
            <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Smartphone className="size-6 text-primary" />
            </div>
            <h3 className="font-semibold">Vendé desde el celu</h3>
            <p className="text-sm text-muted-foreground">
              Todo funciona en mobile. Sin apps, sin complicaciones.
            </p>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-8">
        <div className="max-w-5xl mx-auto px-4 text-center text-sm text-muted-foreground">
          Vitrina — Catálogos digitales para microemprendedores
        </div>
      </footer>
    </div>
  )
}
